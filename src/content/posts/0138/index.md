---
lang: "zh-CN"
pubDatetime: 2026-09-08T10:02:38+08:00
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
description: "从墙上时钟的偏差、漂移与跳变，到单调时钟的频率误差，分析 Paxos、Raft 与 Neon Safekeeper 的安全性边界、超时实现和租约假设。"
---

机器上的时间并不可靠：两台机器可能相差几分钟，同一台机器的时间可能突然回拨；即使换成单调时钟，不同机器的一秒也未必一样长。依靠心跳和超时运行的共识协议，为什么还能保证一致性？

关键在于区分两种用途：**时间可以触发一次尝试，也可以被用来证明一段权限仍然有效。** 提前选举、推迟重连，通常影响进展；如果仅凭“本地尚未过期”就直接提供服务，时钟便可能进入安全性条件。

Paxos 和 Raft 的基础共识机制属于前一种设计。Neon 的 Safekeeper 是面向 PostgreSQL WAL 的共识组件，继承了类似原则，但其工程实现仍包含墙上时钟。理解它们，需要把协议模型、计时实现和数据库对外语义分开。

## 一、先把“时钟不准”写成明确的模型

设真实时间为 $t$。它只是分析用的参照，节点不能直接读取。节点 $i$ 的墙上时钟写作：

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

Paxos 不需要比较“谁的物理时间更新”。对于一个共识实例，Proposer 使用可全序比较且不重复的提案编号；一种实现是“持久化计数器、节点唯一 ID”的组合，并在重试时提升编号。

Acceptor 记录已承诺的编号以及已接受的提案。新的 Proposer 获得多数派承诺后，若回复包含已接受的值，必须选择其中编号最高者的值。多数派相交与这条继承规则共同保住已经选定的结果。编号生成和承诺持久化都不需要墙上时间。[Paxos Made Simple，§2.2–2.5](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf)

因此，墙上时钟的固定偏差不会改变提案顺序；漂移或跳变若只是改变重试、心跳和故障检测的节奏，就只会改变竞争方式。单调时钟走速不同也可能让 Proposer 反复抢占，但不能使 Acceptor 忘记承诺。

这里的“只影响进展”有明确前提：不能用可能回拨的时间戳直接替代唯一提案编号，也不能按 TTL 删除仍然需要的承诺。这样做改变了协议状态规则，已经超出基础 Paxos 的保证。

Multi-Paxos 通常通过稳定的 Leader 减少竞争和重复准备阶段。Leader 的稳定性改善性能；如果多个协调者持续互相抢占，系统可能停滞。Google 的工程论文专门讨论了这类 Leader 抖动问题。[Paxos Made Live，§4.2、§5.2](https://research.google.com/archive/paxos_made_live.pdf)

## 四、Raft：任期是逻辑编号，超时不是任期的到期证明

Raft 的 `term` 是递增整数，没有“每个任期持续几秒”的规定。Follower 超时后递增 term、请求投票；它必须得到多数票，并满足候选者日志足够新的条件，才能当选。

每个节点每任期最多投一票，相关状态需要持久化。日志匹配、选举限制和提交规则共同保证已提交前缀得到保留；其中，Leader 不能仅凭副本数量直接判定旧任期日志已提交。这些规则不读取墙上时钟。[Raft 原论文，§5.1–5.4](https://raft.github.io/raft.pdf)

Raft 用随机选举超时减少分票。时钟走得过快可能造成频繁选举，走得过慢可能延迟切换。论文给出的运行条件是：

$$
\text{broadcastTime}\ll\text{electionTimeout}\ll\text{MTBF}
$$

它描述维持稳定 Leader 的时间尺度，而不是日志安全性的前提。配置上满足“心跳 100 ms、选举 1 s”，也不等于真实运行中满足这些关系：计时速度、线程调度、网络与持久化延迟都参与其中。[Raft 原论文，§5.6](https://raft.github.io/raft.pdf)

协议并没有规定必须调用哪一种操作系统时钟。etcd 的 Raft 核心通过 `tickElection`、`tickHeartbeat` 累加逻辑 tick，由外部驱动时间前进。因此要判断某个实现是否受墙上时钟跳变影响，还要检查 tick 的来源和暂停后的处理方式。[etcd Raft 计时实现](https://github.com/etcd-io/raft/blob/3cbf6a74be3fa392edd8b64253fcd11c3ce5649b/raft.go#L849-L904)

**任期递增负责识别协议的新旧，计时器负责安排下一次尝试。** 即使计时器不可靠，只要它没有绕开投票和提交规则，基础日志安全性仍然成立。

## 五、Neon Safekeeper：WAL 安全不靠时钟，连接管理仍然使用时间

严格地说，Safekeeper 是组件名称。这里讨论的是计算节点上的 WAL proposer 与一组 Safekeeper 之间的 WAL 共识协议。Proposer 产生 WAL，Safekeeper 充当持久化它的 acceptor；二者不会像普通 Raft 节点那样互换角色。

Neon 将其归入 Paxos 家族，同时吸收了 Raft 的任期和日志思想。计算节点由外部控制面管理；当多个计算节点竞争时，共识层保护 WAL 安全，持续进展则还需要竞争最终得到解决。[Neon 的架构说明](https://neon.com/blog/paxos)

以下实现分析固定在 Neon 提交 [`fa504217c61b`](https://github.com/neondatabase/neon/tree/fa504217c61bbcaf5c512d75830564541f917f8f)。这避免把早期协议文档中的字段、算法描述，误当作当前源码的逐项说明；也不据公开源码推断生产控制面的全部行为。

### 5.1 它依据 term、WAL 历史和持久化位置判断安全

WAL proposer 收集足够的 Safekeeper 状态，选择更高 term，发起投票。Safekeeper 仅在收到更高 term 时授予新票，并在回复前持久化这个选择；接受较高 term 后，它拒绝较低 term 的追加请求。[投票与追加处理](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/safekeeper/src/safekeeper.rs#L1051-L1089)

更高 term 本身还不够。新 Proposer 要根据回复中的 `last_log_term` 和 `flushLsn` 选择 WAL 来源，继承历史并恢复所需数据。这里的 LSN 是 WAL 的位置，`term_history` 记录任期与 WAL 区间的关系；它们都不是时间戳。[WAL 来源选择](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer.c#L1120-L1238)

提交位置根据满足条件的持久化确认计算。代码会排除尚未恢复到本任期起点的确认；成员变更时还要同时满足相应配置的 quorum 条件。因此，不能简化成“任意两个节点报告某个 LSN，就可以提交”。[提交位置计算](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer.c#L1940-L2036)

这条路径不靠“旧计算节点的租约应该已经过期”来允许冲突 WAL。旧节点即使停表或暂停后恢复，其请求仍须通过任期检查；新节点则必须继承需要保留的历史。**拒绝旧任期与保留已确定历史必须同时成立。**

仓库中的 TLA+ 模型也围绕 Proposer、Acceptor、日志和提交状态表达安全性质，没有引入物理时钟。不过模型明确简化了消息传递等行为，不能据此宣称整个生产系统已覆盖所有故障并得到证明。[Safekeeper 形式化模型及其简化条件](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/safekeeper/spec/ProposerAcceptorStatic.tla)

### 5.2 墙上时钟确实出现在 WAL proposer 的连接管理中

在 PostgreSQL 适配层，`walprop_pg_get_current_timestamp()` 调用 `GetCurrentTimestamp()`；PostgreSQL 的后者读取 `gettimeofday()`。因此，这条具体路径使用的是墙上时间。[Neon 适配层](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer_pg.c#L932-L936)、[PostgreSQL 时间实现](https://doxygen.postgresql.org/backend_2utils_2adt_2timestamp_8c_source.html#l01649)

WAL proposer 用它记录最近收到消息的时间，并判断连接是否超时。重连间隔的核心计算相当于：

```text
经过时间 = 当前墙上时间 - 上次重连时间
剩余等待 = 配置的重连间隔 - 经过时间
```

据此可以推导：固定偏差在本地相减时抵消；漂移改变实际间隔；向前跳变可能使连接提前超时，向后跳变可能推迟重连或故障检测。这是根据控制流得出的影响分析，不是已完成时钟故障注入的实验结果。[连接超时处理](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer.c#L254-L334)、[重连间隔计算](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer.c#L447-L484)

这些判断会断开、重试或等待连接，没有把超时当成一次 WAL 持久化确认。因此，可以指出它对恢复延迟的敏感性，却不能直接推导出时钟跳变会破坏 WAL 共识。

### 5.3 Safekeeper 的部分后台路径使用单调时钟

Safekeeper 收到 peer 状态后，用本地 Tokio `Instant::now()` 记录接收时刻，再按经过时长过滤过旧的 peer 信息。它比较的是本地观察的年龄，不是远端携带的墙上时间。[peer 信息计时](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/safekeeper/src/timeline.rs#L390-L404)

恢复流程还使用 Tokio timeout 约束连接和等待数据，并在实际恢复时检查 term 与 WAL 历史。单调时钟速率不同可能使 peer 判断和恢复重试过早或过晚，但这些超时不替代恢复时的协议检查。[Safekeeper 恢复流程](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/safekeeper/src/recovery.rs)

因此，准确结论是：**所核对的 WAL 共识路径不以墙上时钟同步或固定时长租约作为安全依据；外围进展机制使用了不同类型的时钟。** 这不自动证明 Neon 的 SQL 读取、路由、认证到期、数据保留和控制面都具有同样的时钟独立性。

## 六、租约为什么重新引入时钟假设

日志安全不等于可以直接读取旧 Leader 的本地状态。旧 Leader 与多数派失联期间，新 Leader 可能已经完成写入；旧 Leader 若继续回答新的读取，就可能破坏线性一致性。

一种做法是通过共识排序读取，或进行正确的多数派读取确认。以 Raft 的安全 ReadIndex 路径为例，需要满足本任期已提交记录等前提，完成相应 quorum 确认，并等待本地状态机应用到读取位置；不能只检查“刚才收过心跳”。[etcd Raft 读取处理](https://github.com/etcd-io/raft/blob/3cbf6a74be3fa392edd8b64253fcd11c3ce5649b/raft.go#L1354-L1385)

另一种做法是租约：多数派在一段时间内限制授予冲突权限，持有者据此省掉每次读取的通信。这时，本地时长就参与了“权限是否仍有效”的证明。Google 的 Paxos 工程实现让 master 使用比其他副本更短的租约超时，以防走时误差。[Paxos Made Live，§5.2](https://research.google.com/archive/paxos_made_live.pdf)

### 6.1 相对时长租约需要约束频率，不必对齐钟面

下面构造一个简化模型，说明为什么“两个单调时钟都等十秒”仍然不够。这是原理推导，不是上述三个系统通用的参数公式。

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

## 七、把三者放到同一张表里

下表比较基础日志／WAL 共识；租约读取等扩展需另加条件。“影响活性”也包括实际故障切换延迟和请求超时，不意味着时钟异常无关紧要。

| 比较项                               | Paxos / Multi-Paxos                    | Raft                             | Neon Safekeeper WAL 共识                         |
| ------------------------------------ | -------------------------------------- | -------------------------------- | ------------------------------------------------ |
| 决定新旧的依据                       | 提案编号、已接受提案                   | term、日志任期与位置             | term、term history、WAL LSN                      |
| 核心安全约束                         | 持久化承诺、值继承、quorum             | 投票、日志匹配、选举与提交规则   | 持久化投票、WAL 历史恢复、追加与提交规则         |
| 墙上时钟需要同步吗                   | 不需要                                 | 不需要                           | 所核对的 WAL 共识路径不需要                      |
| 墙上时钟跳变怎么办                   | 取决于外围计时；不得改变编号与承诺规则 | 取决于计时实现；不能绕过投票提交 | proposer 的部分连接计时会受影响；term 检查仍生效 |
| 单调时钟频率不同怎么办               | 可能改变重试与竞争节奏                 | 可能引起选举抖动或恢复迟缓       | 可能影响 peer 判断、恢复等待与重试               |
| 持续进展还依赖什么                   | 稳定协调者和有效通信等条件             | 足够稳定的 Leader、通信与调度    | WAL quorum 可用，计算节点竞争最终消除            |
| 仅凭本地未超时可直接提供线性一致读吗 | 基础 Paxos 不赋予此权限                | 基础 Raft 不赋予此权限           | WAL 共识本身不能给 SQL 读取作此保证              |

检查一个实现时，可以沿着同一条线追问：**它读了哪种时钟；把读数代入什么判断；判断结果只是触发重试，还是直接允许一次本来需要协调的操作？** 前者要评估恢复和可用性，后者则必须把时钟误差、暂停和重启写进安全条件。

本文核对的是原始论文与上述固定版本的公开源码，并给出相应模型推导；没有对 Neon 生产系统执行时钟故障实验。源码定位用于说明具体机制，不把局部实现分析扩展成整个数据库的时钟安全证明。
