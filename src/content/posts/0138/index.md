---
lang: "zh-CN"
pubDatetime: 2026-09-08T10:02:38+08:00
modDatetime: 2026-09-08T10:09:32+08:00
timezone: "Asia/Shanghai"
title: "共识协议如何面对不可靠的时钟：Paxos、Raft 与 Neon Safekeeper"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "共识协议"
  - "Paxos"
  - "Raft"
  - "Neon"
  - "分布式时钟"
description: "区分 Paxos、Raft 的理论假设与工程实现，结合 etcd-io/raft 和 Neon Safekeeper 固定版本源码，分析时钟异常、超时与租约的安全边界。"
---

机器上的时间并不可靠：两台机器可能相差几分钟，同一台机器的时间可能突然回拨；即使换成单调时钟，不同机器的一秒也未必一样长。依靠心跳和超时运行的共识协议，为什么还能保证一致性？

关键在于区分两种用途：**时间可以触发一次尝试，也可以被用来证明一段权限仍然有效。** 提前选举、推迟重连，通常影响进展；如果仅凭“本地尚未过期”就直接提供服务，时钟便可能进入安全性条件。

Paxos 和 Raft 的基础共识机制属于前一种设计。Neon 的 Safekeeper 是面向 PostgreSQL WAL 的共识组件，继承了类似原则，但其工程实现仍包含墙上时钟。理解它们，需要把协议模型、计时实现和数据库对外语义分开。

## 阅读范围：理论、工程文献与源码分别说明什么

Paxos、Raft 是算法名称，存在不同实现；Safekeeper 是 Neon 的具体组件，其背后也有协议设计和形式化模型。因此，本文不是把三个同层次的算法直接并列，而是沿着“协议假设—实现机制—时钟异常的影响”逐层比较。

| 对象                | 理论或设计依据                    | 本文核对的实现依据                                                                 |
| ------------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| Paxos / Multi-Paxos | Lamport《Paxos Made Simple》      | Google《Paxos Made Live》对当年实现的描述；未核对该实现源码                        |
| Raft                | Ongaro、Ousterhout 的 Raft 原论文 | `etcd-io/raft` 独立库，提交 `3cbf6a74be3f`；主要检查 `raft.go`、`node.go`          |
| Neon WAL 共识       | Neon 协议说明、仓库中的 TLA+ 模型 | `neondatabase/neon`，提交 `fa504217c61b`；检查 WAL proposer、Safekeeper 和恢复路径 |

Raft 部分所说的源码，是 [etcd-io/raft 库](https://github.com/etcd-io/raft/tree/3cbf6a74be3fa392edd8b64253fcd11c3ce5649b)，不是其他 Raft 实现，也不是对整个 etcd 服务的审计。Neon 部分使用[指定提交的公开源码](https://github.com/neondatabase/neon/tree/fa504217c61bbcaf5c512d75830564541f917f8f)，不据此推断其生产控制面的全部行为。

下文会分别标明理论性质、源码事实和分析推论。**统一时钟公式及租约推导是本文的分析工具，不是三个对象共同采用的原始模型。** 工程文献描述不能替代源码核对，源码核对也不等于完成了时钟故障实验或系统级证明。

## 一、先把“时钟不准”写成明确的模型

为统一描述误差，设真实时间为 $t$。它只是分析用的参照，节点不能直接读取。节点 $i$ 的墙上时钟写作：

$$
W_i(t)=t+\theta_i(t)
$$

$\theta_i(t)$ 是它相对真实时间的偏差。由此可以分清三种现象：

| 现象           | 模型中的含义                   | 例子                         |
| -------------- | ------------------------------ | ---------------------------- |
| 偏差（offset） | 同一时刻的读数之差             | A 比 B 快五分钟              |
| 漂移（drift）  | 走时速率不准确，偏差随时间变化 | 真实经过十秒，本地只计了九秒 |
| 跳变（step）   | 读数不连续地前跳或回拨         | 校时后突然前进一分钟         |

英文资料中的 _skew_ 有时指读数差，有时指速率差。因此，看到“bounded clock skew”，应继续确认：约束的是绝对读数、节点间读数差，还是走时速率，而不能只凭术语判断。

单调时钟 $M_i(t)$ 首先保证的是读数不倒退。这个性质本身既不保证速率恒定，也不保证不同机器同步，更不排除暂停或前跳。Tokio 的 `Instant` 文档就明确区分了单调性与走时稳定性。[Tokio：Instant](https://docs.rs/tokio/latest/tokio/time/struct.Instant.html)

如果还需要约束走时速度，可以另外假设，对任意 $t_2>t_1$：

$$
(1-\rho)(t_2-t_1)
\le M_i(t_2)-M_i(t_1)
\le (1+\rho)(t_2-t_1),\qquad 0\le\rho<1
$$

这才是“频率误差有上界”的模型。它比单调性强得多，也排除了该时间区间内不受约束的停表和跳变。后面讨论租约时，这个区别会直接决定安全性。

不能反过来把这个不等式当作基础 Paxos、Raft 的必需前提。它们的核心安全性并不需要先规定一个 $\rho$；只有当某项机制用经过时长证明权限时，才需要建立相应误差条件。

工程上的时钟名称也不能替代模型。Linux 的 `CLOCK_MONOTONIC` 不受墙上时钟不连续调整的影响，但会受渐进频率调整影响，且不计系统挂起时间；`CLOCK_MONOTONIC_RAW` 不受这种频率调整影响，却仍有硬件误差；`CLOCK_BOOTTIME` 则包含挂起时间。[Linux 时钟接口说明](https://man7.org/linux/man-pages/man2/clock_gettime.2.html)

## 二、共识安全性允许故障检测出错

本文讨论崩溃、恢复和网络延迟等非拜占庭故障：节点遵守协议，必须持久化的状态不会在恢复后被遗忘。成员变更也必须遵守各自的 quorum 规则，不能因为某个节点超时就随意缩小多数派。

在这一前提下，需要分别判断：

- **安全性（safety）**：同一决定或日志位置不能产生相互冲突的已确定结果。
- **活性（liveness）**：条件合适时，协议最终能够完成决定。
- **实际可用性**：请求能否在业务可接受的时间内完成。

“很久没收到回复”不能证明对方已经死亡；它也可能只是网络慢、进程暂停，或自己的计时器走快。因此，基础共识协议必须允许故障检测误判，并限制误判之后能够做什么。

例如，A、B、C 三个节点中，A 是旧 Leader。A 暂停后，B、C 选出新 Leader。A 恢复时可以仍然自认为有权写入，但新写入仍须通过投票、任期和日志规则，不能凭这种认知提交冲突结果。

更精确地说，旧 Leader 可能晚收到一个早已确定操作的确认；协议禁止的是冲突决定，而不是禁止所有旧请求继续返回。因此，不能把安全性粗略理解为“任意时刻只能有一个节点自认为是 Leader”。

基础安全性把超时视为可能早到、晚到的事件；持续进展则需要足够稳定的通信、调度与协调者。Paxos 原论文也明确把选举能否成功与安全性分开讨论。[Paxos Made Simple，§2.4](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf)

## 三、Paxos：用承诺和提案顺序约束决定

### 3.1 理论层：安全性证明不依赖物理时钟界限

《Paxos Made Simple》从异步消息传递出发，允许进程任意慢、消息延迟、丢失和重复等情况。其安全性依靠协议状态转移，而非全局时钟、消息超时上界或固定走时精度；论文没有要求实现必须选用某一种操作系统时钟。[Paxos Made Simple，§2.1](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf)

Paxos 不需要比较“谁的物理时间更新”。对于一个共识实例，Proposer 使用可全序比较且不重复的提案编号；一种实现是“持久化计数器、节点唯一 ID”的组合，并在重试时提升编号。

Acceptor 记录已承诺的编号以及已接受的提案。新的 Proposer 获得多数派承诺后，若回复包含已接受的值，必须选择其中编号最高者的值。多数派相交与这条继承规则共同保住已经选定的结果。编号生成和承诺持久化都不需要墙上时间。[Paxos Made Simple，§2.2–2.5](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf)

由此得到的分析结论是：在采用上述逻辑编号的实现中，墙上时钟的固定偏差不会改变提案顺序。漂移、跳变或单调时钟走速差异若只改变重试和故障检测的节奏，就只改变竞争方式，不改变 Acceptor 必须遵守的承诺。

这里的“只影响进展”有明确前提：不能用可能回拨的时间戳直接替代唯一提案编号，也不能按 TTL 删除仍然需要的承诺。这样做改变了协议状态规则，已经超出基础 Paxos 的保证。

### 3.2 工程文献层：Google 的实现描述，不是所有 Paxos 的计时方式

本文采用的工程案例是 Google 2007 年《Paxos Made Live》。它描述支撑 Chubby 的 Paxos 系统，包括稳定 master、Leader 抖动和 master lease。Multi-Paxos 的稳定协调者减少竞争及重复准备阶段，但持续抢占仍可能阻碍进展。[Paxos Made Live，§4.2、§5.2](https://research.google.com/archive/paxos_made_live.pdf)

其中，master 使用比其他副本更短的租约超时，以应对时钟漂移。这说明该项优化有额外的时间条件；它不是基础 Paxos 的要求，也不能推广为所有 Paxos 实现的行为。

这份文献不足以确定本文关心的全部计时细节，例如具体使用哪种时钟 API、系统挂起是否计时、误差界限如何落实。因此，本文对这个案例的证据止于论文描述，不声称完成了源码或部署配置核对。

## 四、Raft：任期是逻辑编号，超时不是任期的到期证明

### 4.1 理论层：任期和日志规则保证安全，超时帮助取得进展

Raft 的 `term` 是递增整数，没有“每个任期持续几秒”的规定。Follower 超时后递增 term、请求投票；它必须得到多数票，并满足候选者日志足够新的条件，才能当选。

每个节点每任期最多投一票，相关状态需要持久化。日志匹配、选举限制和提交规则共同保证已提交前缀得到保留；其中，Leader 不能仅凭副本数量直接判定旧任期日志已提交。这些规则不读取墙上时钟。[Raft 原论文，§5.1–5.4](https://raft.github.io/raft.pdf)

Raft 用随机选举超时减少分票。时钟走得过快可能造成频繁选举，走得过慢可能延迟切换。论文给出的运行条件是：

$$
\text{broadcastTime}\ll\text{electionTimeout}\ll\text{MTBF}
$$

它描述维持稳定 Leader 的时间尺度，而不是日志安全性的前提。配置上满足“心跳 100 ms、选举 1 s”，也不等于真实运行中满足这些关系：计时速度、线程调度、网络与持久化延迟都参与其中。[Raft 原论文，§5.6](https://raft.github.io/raft.pdf)

### 4.2 源码层：etcd-io/raft 接收 tick，而非直接读取墙上时间

以下只讨论 `etcd-io/raft` 提交 `3cbf6a74be3f`。`node.go` 的 `Node.Tick()` 接口以 tick 为计时单位；`raft.go` 中的 `tickElection`、`tickHeartbeat` 每执行一次就递增相应计数，并按阈值触发选举或心跳。[Tick 接口](https://github.com/etcd-io/raft/blob/3cbf6a74be3fa392edd8b64253fcd11c3ce5649b/node.go#L132-L135)、[核心计时处理](https://github.com/etcd-io/raft/blob/3cbf6a74be3fa392edd8b64253fcd11c3ce5649b/raft.go#L849-L904)

因此，源码层可以确认的是：这些核心函数接收时间推进事件，没有通过比较两台机器的墙上时间决定是否超时。库的使用者负责驱动 tick；算法论文没有规定这种接口形式，更没有规定必须使用 Go、Tokio 或某种 Linux 时钟。

计时事件还受到调度影响。该版本 `Node.Tick()` 尝试向内部通道入队；通道无法立即接收时，会记录 tick 未能送入的警告。因此，“底层时钟准确”并不自动意味着核心计数与真实经过时间保持固定比例。[Node.Tick 实现](https://github.com/etcd-io/raft/blob/3cbf6a74be3fa392edd8b64253fcd11c3ce5649b/node.go#L456-L465)

### 4.3 分析边界：库内计时不能替整个 etcd 服务作保证

据上述源码可以推导，tick 过快、过慢或长期得不到处理，会改变选举和心跳的真实间隔。若它们只触发基础协议允许的事件，仍不能绕过投票和日志规则。

但这还不能回答“完整 etcd 服务是否受墙上时钟跳变影响”。要回答后者，需要继续核对指定 etcd 版本的 tick 调用链、运行时定时器、阻塞和暂停处理。本文未追踪这条完整路径，因此不把库内观察改写成“etcd 全部使用单调时钟”或“etcd 不受跳变影响”。

**任期递增负责识别协议的新旧，计时器负责安排下一次尝试。** 即使计时器不可靠，只要它没有绕开投票和提交规则，基础日志安全性仍然成立。

## 五、Neon Safekeeper：WAL 安全不靠时钟，连接管理仍然使用时间

严格地说，Safekeeper 是组件名称。这里讨论的是计算节点上的 WAL proposer 与一组 Safekeeper 之间的 WAL 共识协议。Proposer 产生 WAL，Safekeeper 充当持久化它的 acceptor；二者不会像普通 Raft 节点那样互换角色。

Neon 将其归入 Paxos 家族，同时吸收了 Raft 的任期和日志思想。计算节点由外部控制面管理；当多个计算节点竞争时，共识层保护 WAL 安全，持续进展则还需要竞争最终得到解决。[Neon 的架构说明](https://neon.com/blog/paxos)

以下实现分析固定在 Neon 提交 [`fa504217c61b`](https://github.com/neondatabase/neon/tree/fa504217c61bbcaf5c512d75830564541f917f8f)。这避免把早期协议文档中的字段、算法描述，误当作当前源码的逐项说明；也不据公开源码推断生产控制面的全部行为。

### 5.1 协议与源码层：依据 term、WAL 历史和持久化位置判断安全

WAL proposer 收集足够的 Safekeeper 状态，选择更高 term，发起投票。Safekeeper 仅在收到更高 term 时授予新票，并在回复前持久化这个选择；接受较高 term 后，它拒绝较低 term 的追加请求。[投票与追加处理](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/safekeeper/src/safekeeper.rs#L1051-L1089)

更高 term 本身还不够。新 Proposer 要根据回复中的 `last_log_term` 和 `flushLsn` 选择 WAL 来源，继承历史并恢复所需数据。这里的 LSN 是 WAL 的位置，`term_history` 记录任期与 WAL 区间的关系；它们都不是时间戳。[WAL 来源选择](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer.c#L1120-L1238)

提交位置根据满足条件的持久化确认计算。代码会排除尚未恢复到本任期起点的确认；成员变更时还要同时满足相应配置的 quorum 条件。因此，不能简化成“任意两个节点报告某个 LSN，就可以提交”。[提交位置计算](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer.c#L1940-L2036)

这条路径不靠“旧计算节点的租约应该已经过期”来允许冲突 WAL。旧节点即使停表或暂停后恢复，其请求仍须通过任期检查；新节点则必须继承需要保留的历史。**拒绝旧任期与保留已确定历史必须同时成立。**

仓库中的 TLA+ 模型也围绕 Proposer、Acceptor、日志和提交状态表达安全性质，没有引入物理时钟。不过模型明确简化了消息传递等行为，不能据此宣称整个生产系统已覆盖所有故障并得到证明。[Safekeeper 形式化模型及其简化条件](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/safekeeper/spec/ProposerAcceptorStatic.tla)

### 5.2 源码事实与推论：WAL proposer 的连接管理使用墙上时钟

在 PostgreSQL 适配层，`walprop_pg_get_current_timestamp()` 调用 `GetCurrentTimestamp()`；PostgreSQL 的后者读取 `gettimeofday()`。因此，这条具体路径使用的是墙上时间。[Neon 适配层](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer_pg.c#L932-L936)、[PostgreSQL 时间实现](https://doxygen.postgresql.org/backend_2utils_2adt_2timestamp_8c_source.html#l01649)

WAL proposer 用它记录最近收到消息的时间，并判断连接是否超时。重连间隔的核心计算相当于：

```text
经过时间 = 当前墙上时间 - 上次重连时间
剩余等待 = 配置的重连间隔 - 经过时间
```

据此可以推导：固定偏差在本地相减时抵消；漂移改变实际间隔；向前跳变可能使连接提前超时，向后跳变可能推迟重连或故障检测。这是根据控制流得出的影响分析，不是已完成时钟故障注入的实验结果。[连接超时处理](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer.c#L254-L334)、[重连间隔计算](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer.c#L447-L484)

这些判断会断开、重试或等待连接，没有把超时当成一次 WAL 持久化确认。因此，可以指出它对恢复延迟的敏感性，却不能直接推导出时钟跳变会破坏 WAL 共识。

### 5.3 源码事实与推论：部分后台路径使用单调时钟

Safekeeper 收到 peer 状态后，用本地 Tokio `Instant::now()` 记录接收时刻，再按经过时长过滤过旧的 peer 信息。它比较的是本地观察的年龄，不是远端携带的墙上时间。[peer 信息计时](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/safekeeper/src/timeline.rs#L390-L404)

恢复流程还使用 Tokio timeout 约束连接和等待数据，并在实际恢复时检查 term 与 WAL 历史。单调时钟速率不同可能使 peer 判断和恢复重试过早或过晚，但这些超时不替代恢复时的协议检查。[Safekeeper 恢复流程](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/safekeeper/src/recovery.rs)

因此，准确结论是：**所核对的 WAL 共识路径不以墙上时钟同步或固定时长租约作为安全依据；外围进展机制使用了不同类型的时钟。** 这不自动证明 Neon 的 SQL 读取、路由、认证到期、数据保留和控制面都具有同样的时钟独立性。

## 六、租约为什么重新引入时钟假设

日志安全不等于可以直接读取旧 Leader 的本地状态。旧 Leader 与多数派失联期间，新 Leader 可能已经完成写入；旧 Leader 若继续回答新的读取，就可能破坏线性一致性。

一种做法是通过共识排序读取，或进行正确的多数派读取确认。具体到本文核对的 etcd-io/raft 版本，`ReadOnlySafe` 走 quorum 确认路径，而 `ReadOnlyLeaseBased` 依赖 Leader lease。它们是该库的两种模式，不能把它们笼统合称为“Raft 读取的时钟假设”。[读取模式分支](https://github.com/etcd-io/raft/blob/3cbf6a74be3fa392edd8b64253fcd11c3ce5649b/raft.go#L2146-L2163)

安全读取还涉及本任期已提交记录等前提；库返回读取位置后，上层必须等待本地状态机应用到相应位置，再读取状态。库产生 ReadIndex 与数据库完成线性一致读也属于两个层次。[读取前提](https://github.com/etcd-io/raft/blob/3cbf6a74be3fa392edd8b64253fcd11c3ce5649b/raft.go#L1354-L1385)、[ReadStates 接口约定](https://github.com/etcd-io/raft/blob/3cbf6a74be3fa392edd8b64253fcd11c3ce5649b/node.go#L68-L72)

租约的共同思路是：多数派在一段时间内限制授予冲突权限，持有者据此省掉每次读取的通信。这时，本地时长就参与了“权限是否仍有效”的证明。Google 的 master lease 是工程文献中的案例，etcd-io/raft 的 lease-based read 是具体库的模式；二者不能据名称相近就视为完全相同的算法。

### 6.1 相对时长租约需要约束频率，不必对齐钟面

下面由本文构造一个简化模型，说明为什么“两个单调时钟都等十秒”仍然不够。它不是对 Google master lease 或 etcd-io/raft 的逐行还原，也不表示 Neon Safekeeper 使用这种租约。

设持有者在发送请求前开始计时，使用期限为本地 $H$ 秒；每个授予者收到请求后承诺本地 $G$ 秒内不授予冲突权限。双方都满足前文的频率误差上界 $\rho$，持有者只在收齐 quorum 确认且自身尚未过期后使用租约。

持有者走得最慢时，它的 $H$ 秒最长持续 $H/(1-\rho)$ 个真实秒；授予者走得最快时，它的 $G$ 秒最短持续 $G/(1+\rho)$ 个真实秒。由于授予者开始计时不早于持有者，一个保守条件是：

$$
\frac{H}{1-\rho}\le\frac{G}{1+\rho}
\quad\Longleftrightarrow\quad
H\le G\frac{1-\rho}{1+\rho}
$$

例如，假设 $\rho=1\%$、$G=1$ 秒，选择 $H=0.98$ 秒满足这个条件。实际工程还须为精度、取整和执行路径留余量；这里的 1% 只是示例，并非任何产品的保证。

这个模型不需要跨机器比较钟面，也不需要靠固定网络延迟上界保证安全：延迟太长只会使持有者收到回复时已无法使用租约。但若从收到回复后才开始完整计时，就破坏了上述起点关系，必须重新分析。

### 6.2 单调性、绝对时间与暂停分别需要处理

如果只有单调性，没有速率下界，持有者的时钟可能走得任意慢甚至停住。无论预留多少固定余量，都无法由有限的本地读数推断真实租约是否到期。etcd 的 `ReadOnlyLeaseBased` 注释也明确指出，无界漂移、回拨或暂停会使租约读取不安全。[etcd Raft 读取模式定义](https://github.com/etcd-io/raft/blob/3cbf6a74be3fa392edd8b64253fcd11c3ce5649b/raft.go#L58-L70)

若协议交换绝对到期时间，则还需要约束读数偏差。例如每台机器都满足 $|W_i(t)-t|\le\epsilon$ 时，两台机器读数最多相差 $2\epsilon$；保守到期判断要按实际协议扣除相应不确定性。仅仅部署 NTP，并不等于已经建立始终成立的误差上界。

进程暂停与停表也不同。进程没被调度时，操作系统时钟可能仍在前进；系统挂起时，某些单调时钟却不计这段时间。依赖租约的实现必须明确暂停、休眠、恢复和重启语义，不能跨重启复用未经处理的单调时钟期限，也不能让授予者重启后遗忘尚有效的限制。

此外，“检查租约有效”与实际读取或外部副作用之间不能留下未经分析的暂停窗口。对共识系统之外的存储操作，通常还需要由接收方执行 fencing 检查，阻止失去权限的旧持有者继续操作。Safekeeper 对旧 term 的拒绝就体现了这种接收方校验思路，但不能替其他外部资源完成校验。

## 七、分层比较，才能正确使用结论

在协议层，比较的是安全性究竟需要哪些条件。下表的“无需”都限定于基础日志／WAL 共识，不包含额外的租约读取或外部业务行为。

| 协议层对象            | 核心安全依据                            | 时钟假设的边界                                                 |
| --------------------- | --------------------------------------- | -------------------------------------------------------------- |
| 基础 Paxos            | 提案顺序、持久化承诺、值继承与 quorum   | 安全性无需墙上时钟同步或固定频率误差界；进展还需协调与通信条件 |
| 基础 Raft             | term、投票、日志匹配、选举与提交规则    | 安全性无需物理时钟界；稳定选举和及时响应依赖时间关系           |
| Neon WAL 协议及其模型 | 任期、WAL 历史继承、持久化确认与 quorum | 所核对路径不用物理时间决定 WAL 权威性；模型有明确简化条件      |

在实现层，比较的是已核对材料能够支持多具体的结论。没有给出时钟 API 的地方，应保留未知，不能从算法名称补出实现细节。

| 实现或工程案例                     | 已知计时机制                                          | 本文能确定的边界                                           |
| ---------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| Google 2007 年 Paxos 工程案例      | 论文描述 master 使用更短的租约超时                    | 有漂移防护设计；未核对具体时钟 API、误差落实方式或源码     |
| etcd-io/raft，`3cbf6a74be3f`       | 核心使用外部驱动的 tick；区分 Safe 与 LeaseBased 读取 | 能分析库内计数与读取模式；不能替整个 etcd 服务确定时钟行为 |
| Neon WAL proposer，`fa504217c61b`  | PostgreSQL 适配层的部分连接计时使用墙上时间           | 跳变可能改变超时与重连节奏；这些判断不替代 WAL 确认        |
| Neon Safekeeper 后台路径，同一提交 | peer 信息年龄使用 `Instant`，恢复使用 Tokio timeout   | 频率和调度影响等待与恢复；仍须执行 term 和历史检查         |

检查一个实现时，可以沿着同一条线追问：**它读了哪种时钟；把读数代入什么判断；判断结果只是触发重试，还是直接允许一次本来需要协调的操作？** 前者要评估恢复和可用性，后者则必须把时钟误差、暂停和重启写进安全条件。

最终应形成的判断是：“某版本的某条路径，依据某个时钟条件，保证某项性质。”基础共识安全、租约读取安全与整个数据库的对外语义，需要分别论证。本文提供的是文献核对、指定源码路径分析和模型推导，未执行时钟故障注入实验。
