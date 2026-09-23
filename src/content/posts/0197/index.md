---
lang: "zh-CN"
pubDatetime: 2026-09-23T19:13:15+08:00
timezone: "Asia/Shanghai"
title: "Deployment + PVC 能替代 StatefulSet 吗？从源码看状态、身份与副本边界"
area: "kubernetes"
featured: false
draft: false
tags:
  - "Kubernetes"
  - "Deployment"
  - "StatefulSet"
  - "持久化存储"
  - "系统设计"
description: "从 Kubernetes 控制器源码与权威定义出发，区分数据持久化、Pod 身份和副本互换性，判断 Deployment 加 PVC 何时可用，以及无状态服务的真正边界。"
---
先给结论：**Deployment 挂 PVC 可以运行有持久数据的服务，但“有卷”并不等于“有了 StatefulSet 的语义”。** 能否替代，取决于应用需要的究竟是“重建后还能读到数据”，还是“编号为 0 的成员重建后仍是编号 0、拿回自己的卷，并按特定次序加入集群”。前者可以由 Deployment 加固定 PVC 完成；后者需要 StatefulSet 或另外实现同等的成员管理机制。

这里的“有状态”还要先说清对象：一个订单业务有持续变化的订单数据，整个系统当然有状态；承接请求的某个 API 进程却可能是可随时替换的无状态副本。把**业务数据是否存在**直接等同于**Pod 是否需要稳定身份**，会把工作负载控制器选错。

## 一、先定义“状态”：边界比标签重要

状态是能影响后续行为、而不能只从当前输入和固定代码推得的信息。它可能是数据库中的订单、进程内的登录会话、磁盘上的写前日志、消费者位点、持有的连接、某个副本的分片归属，也可能只是可丢弃的缓存。它们的持久性和重要性并不相同。

“无状态”至少有三个常被混用的含义：

| 所讨论的边界 | “无状态”的精确定义 | 一个反例或限定 |
| --- | --- | --- |
| 请求协议 | 处理一个请求不依赖该服务保存的前次会话上下文 | 仅给服务端内存中的会话发一个 ID，仍依赖服务端会话 |
| 应用进程或 Pod 副本 | 任一合格副本拿到当前请求和共享依赖，都能给出正确结果；换掉原副本不丢失不可重建的事实 | 唯一副本本地保存订单或消费位点，就不可随意替换 |
| 整个业务系统 | 未来结果不依赖任何先前业务事件 | 订单、账户、库存等业务通常不满足 |

Fielding 在 REST 的“无状态”约束里谈的是**交互**：请求须带足理解它所需的信息，服务器不能依赖先前请求留下的会话上下文。这不等于服务器不能保存订单、用户或文档等**资源状态**；否则连“读取一个已保存订单”都无法成立。[Fielding 博士论文，第 5.1.3 节](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm#sec_5_1_3)

[The Twelve-Factor App 的进程原则](https://www.12factor.net/processes)谈的是另一个边界：应用进程应可替换，需持久保存的数据交给有状态的后端服务。进程内存和文件系统可以做短暂缓存，但不能假定下一次请求仍由同一进程处理。因此，一个使用 PostgreSQL 保存订单的 Web API，通常是“**有状态的业务系统 + 可替换的无状态 API 副本 + 有状态的数据库服务**”。

这也是为什么“无状态”不是内存和磁盘一尘不染。进程会有栈、连接池、短期缓存、指标计数和处理中请求的暂态信息。判定标准是：**丢掉或更换该副本后，是否丢失业务正确性所必需、且无法从请求或外部权威状态恢复的信息？是否必须找回同一个副本身份？** 缓存重建所造成的延迟仍要纳入可用性目标，但不自动使业务事实绑定于该 Pod。

还要区分两种容易混淆的“无状态”：把 HTTP 会话保存在共享 Redis 中，API Pod 可以无状态地扩缩容；但如果请求仍依赖服务器保存的会话上下文，它就不满足 Fielding 意义上严格的 REST 无状态约束。**协议无状态**与**计算副本可互换**不是同一个命题。[Fielding 原文](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm#sec_5_1_3)、[Twelve-Factor 进程原则](https://www.12factor.net/processes)

## 二、从源码看两个控制器究竟在维护什么

Kubernetes 官方对 Deployment 的描述是管理 Pod 和 ReplicaSet，通常用于不自行维护状态的工作负载；对 StatefulSet 的描述则是维护每个 Pod 的稳定身份、顺序和唯一性。两者都能运行带卷的容器，真正差异是**控制器认为什么才算“同一个副本”**。[Deployment 文档](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)、[StatefulSet 文档](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)

以下实现细节以 Kubernetes **v1.34.0** 源码为准；用固定版本是为了让代码位置和推论可复查。

| 机制 | Deployment | StatefulSet |
| --- | --- | --- |
| 控制对象 | Deployment → ReplicaSet → Pod；以模板和目标副本数驱动 | StatefulSet → 按序号识别的 Pod；以每个序号的成员为单位驱动 |
| Pod 身份 | Pod 名随创建变化，副本通常可互换 | 默认 `名字-0`、`名字-1` 等；同一序号重建后名称保持，Pod UID 仍会变化 |
| 存储映射 | Pod 模板可引用已有 PVC；若所有副本写同一 `claimName`，它们请求的是同一份卷 | `volumeClaimTemplates` 按序号生成各自 PVC，例如 `data-db-0`、`data-db-1`，新 Pod 重新关联对应 PVC |
| 服务发现 | Service 可把请求导向任一匹配副本 | 配合自己创建的 Headless Service，可按成员名发现 Pod；这不是固定 Pod IP |
| 发布与规模变化 | 按 ReplicaSet 调整旧、新模板副本数；滚动更新受 `maxSurge`、`maxUnavailable` 约束 | 默认按序号创建、逆序缩容和更新；也可配置 `Parallel` 放宽创建和缩容顺序 |
| 历史 | 以 ReplicaSet 保留模板版本 | 以 ControllerRevision 记录版本；可按 `partition` 分阶段更新 |

源码里最能说明差异的不是名字，而是循环所处理的对象：

1. Deployment 的 [`getNewReplicaSet`](https://github.com/kubernetes/kubernetes/blob/v1.34.0/pkg/controller/deployment/sync.go)根据 Pod 模板哈希构造新 ReplicaSet；[`rolloutRolling`](https://github.com/kubernetes/kubernetes/blob/v1.34.0/pkg/controller/deployment/rolling.go)依次尝试扩新 ReplicaSet、缩旧 ReplicaSet。它在调**两个版本各有多少副本**，并没有“序号 1 的 Pod 应回到序号 1 的卷”这层账本。
2. StatefulSet 的 [`newStatefulSetPod`、`getPodName` 和 `getPersistentVolumeClaimName`](https://github.com/kubernetes/kubernetes/blob/v1.34.0/pkg/controller/statefulset/stateful_set_utils.go)由序号生成 Pod 名、身份与 PVC 名；`initIdentity` 设置 Pod 的 hostname 和由 `serviceName` 指定的 subdomain。其 [`updateStatefulSet` 和 `processReplica`](https://github.com/kubernetes/kubernetes/blob/v1.34.0/pkg/controller/statefulset/stateful_set_control.go)把现有 Pod 放进按序号索引的槽位，填补缺失成员，并在默认模式下等前序 Pod 就绪；更新时从较大序号开始处理。

所以，StatefulSet 的核心是 **`ordinal → Pod 身份 → 该成员的 PVC` 这组稳定映射，加上默认的顺序约束**。PVC 只解决“某份数据是否继续存在、能否重新挂载”；它本身不知道业务里的 `db-0` 应对应哪份数据。普通 Deployment 的 Pod 模板引用同一个 PVC 名称，也不会自动为每个副本生成独立数据目录或保证谁是主节点。这是由上述控制循环得出的架构结论。[StatefulSet 身份与存储](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#pod-identity)

## 三、Deployment + PVC 在哪些情况下足够？

### 情况 A：一个可停机升级的单副本进程

例如内部工具用嵌入式数据库，固定 PVC `tool-data`，只有一个 Pod，客户端只通过 Service 找它；应用不依赖固定 Pod 名，也不需要按编号恢复成员。此时 Deployment 引用该 PVC，确实可以让重建的 Pod 继续读旧数据。它是一个**有状态进程由 Deployment 托管**的有效方案，并不违背 Kubernetes 的机制。

但运维条件要写明白：只有一个活跃写入者；升级允许短暂不可用；卷能在调度位置重新挂载；应用有一致性恢复与备份；还要验证故障替换路径。Deployment 默认 `RollingUpdate` 可先创建新 Pod，再删除旧 Pod。即使设置 `Recreate`，官方文档也只保证**升级**时先终止旧版本再创建新版本；手工删除 Pod 时，ReplicaSet 可以在旧 Pod 尚处于 `Terminating` 时创建替代者。[Deployment 更新策略与限制](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy)

如果同一个 PVC 不允许并发访问，`ReadWriteOncePod`（由支持它的 CSI 存储提供）比 `ReadWriteOnce` 更适合表达“全群集同一时刻只允许一个 Pod 挂载”。`ReadWriteOnce` 限制的是**节点**，同节点多个 Pod 仍可能读写同一卷；`ReadWriteMany` 允许多处挂载，但绝不表示应用已经能安全并发写入。`ReadWriteOncePod` 解决的是挂载排他，也不能替应用处理数据库恢复、外部写入或旧主隔离。[Kubernetes PV 访问模式](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)

### 情况 B：多个可互换的计算副本，共用外部状态

例如三个 API Pod 都从同一个数据库读写订单；每个请求可落到任一 Pod，不要求找回上一请求的那个 Pod。订单业务有状态，**API Pod 无状态**，Deployment 很合适。若它们必须读同一份文件，允许多 Pod 访问的共享卷也可能成立，但前提是应用已经解决并发、锁、文件一致性和失败恢复。挂上 RWX 卷只是提供访问能力，不能把不支持并发的程序变成集群程序。[Kubernetes PV 访问模式](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)

### 情况 C：每个副本有自己的数据、角色或通信身份

例如三个成员各自维护本地日志或分片，成员 0 重建必须接回成员 0 的卷，其他节点要用稳定名称联系它；扩容和更新还要求一定顺序。单个 Deployment 加一个 PVC 不能表达这些对应关系。即使预先创建多个 PVC，普通 Deployment 也没有内置机制把某个新 Pod 稳定绑定到“原成员 0 的 PVC”。使用 StatefulSet 的序号、成员 DNS 和 `volumeClaimTemplates` 更直接；复制、选主、成员变更和数据迁移仍须由数据库本身或 Operator 完成。[StatefulSet 用途与局限](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)

## 四、两个常见误解会造成真实故障

**“PVC 是持久的，所以可以随意滚动更新。”** 假设单副本 Deployment 的旧 Pod 和新 Pod 都引用 `db-data`。滚动更新允许它们在某段时间并存。若卷是 RWO 且两者被调度到同一节点，两个 Pod 可能同时访问数据；若是 RWOP，新 Pod 可能必须等待旧 Pod 释放卷，更新可能暂时卡住。这两种结果都不是数据库主备切换协议。`maxSurge: 0` 或 `Recreate` 可减少升级时的重叠，但不能把所有故障、手动删除、网络分区都统一成“安全接管”。[Deployment 更新策略](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy)、[PV 访问模式](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)

**“StatefulSet 保证不丢数据、不会双主。”** StatefulSet 默认确保同一序号的 Pod 身份不会被普通替换流程同时占用；它不实现数据库复制、提交确认、备份或业务级 fencing。官方明确警告：强制删除一个实际仍在运行的 StatefulSet Pod，会让控制器创建同身份的新 Pod，打破其“最多一个”语义。网络隔离下，旧进程是否还能写外部资源，也必须由存储、租约或业务协议处理。并且默认有序更新可能被一个始终不 Ready 的 Pod 阻塞，坏版本回退有时需要人工删除相关 Pod。[强制删除 StatefulSet Pod](https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/)、[StatefulSet 更新与回退](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#forced-rollback)

再补一条存储生命周期：StatefulSet 默认保留由模板生成的 PVC，即使缩容或删除 StatefulSet；也提供 `persistentVolumeClaimRetentionPolicy` 来配置相关删除行为。**PVC 是否保留**与底层 PV 的回收策略又是不同层次，不能把控制器删除等同于数据备份或销毁。[StatefulSet PVC 保留策略](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#persistentvolumeclaim-retention)、[PV 生命周期](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#lifecycle-of-a-volume-and-claim)

## 五、实际选型：先做“替换实验”

给某个服务画出边界：输入从哪里来，权威状态在哪里，副本保存了什么，输出和副作用落在哪里。然后假设**任意一个 Pod 突然消失**，问五个问题：

1. 新 Pod 只靠请求、配置与共享后端，能否恢复正确服务？若能，计算副本通常可按无状态处理；丢缓存后的冷启动成本另算。
2. 它必须叫原来的名字、继续担任原来的成员或分片吗？若是，需要稳定身份与成员恢复机制。
3. 它必须接回**属于这个成员**的那份数据吗？若是，需要明确的成员到卷映射，而不是“所有副本写同一个 PVC”。
4. 在旧实例是否真正停止尚不确定时，新实例可以开始吗？若不能，必须定义挂载排他、接管及必要的 fencing；不要仅凭副本数为 1 推断安全。
5. 加减成员和更新版本有没有业务顺序、复制进度或选主条件？若有，StatefulSet 可以承担一部分 Pod 顺序，应用或 Operator 还得验证数据层条件。

据此，选择可以简化为：**只要数据在外部且副本可互换，用 Deployment；单副本挂固定 PVC 且接受其故障与升级约束，也可以用 Deployment；需要稳定的成员身份、成员专属卷或有序生命周期，优先 StatefulSet；需要复杂复制和故障转移，再在其上使用应用自身协议或 Operator。** StatefulSet 的 `Parallel` 模式会放宽创建、缩容顺序，选择它时不要再假设默认 `OrderedReady` 的等待行为。[StatefulSet Pod 管理策略](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#pod-management-policies)

最后，用一句可操作的定义收束：**“无状态副本”不是没有任何状态，而是没有必须由这个副本独占并带到下一次请求或下一任 Pod 的权威状态和身份。** 状态可以存在于整个业务系统里；决定 Deployment 还是 StatefulSet 的，是这个状态是否与某个具体成员绑定，以及更换成员时需要怎样的顺序和排他保证。
