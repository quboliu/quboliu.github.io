---
lang: "zh-CN"
pubDatetime: 2026-09-08T19:44:50+08:00
timezone: "Asia/Shanghai"
title: "线性一致读，哪些步骤不能省？——从 etcd v2、v3 到 Neon"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "DDIA"
  - "etcd"
  - "ReadIndex"
  - "Neon"
  - "线性一致性"
description: "注解 DDIA 10.6.2：比较 etcd v2 的读日志与 v3 的 ReadIndex，区分必须保持的读取保证和可优化的执行步骤，再对照 Neon Pageserver 的 WAL 等待机制。"
---
DDIA V2 的 10.6.2 提醒：即使写入已经通过共识复制到 quorum，要提供线性一致读，读取仍需确认自认为领导者的节点没有过期，etcd 就是例子。

这不等于“读写必须走相同的日志路径”。**etcd v2 把读请求写进日志；v3 用 ReadIndex 确认读取依据，再等待本地执行进度。省掉的是读日志，不是正确性条件。** [DDIA V2 第 10 章](https://learning.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/ch10.html)

本文对照三组明确版本：etcd v2 API 使用 v2.3.8 源码；v3 API 使用 v3.6.4 及其依赖的 Raft v3.6.0；Neon 使用提交 `fa504217c61b`。讨论的是协议原理和这些版本的主要代码路径，不是对全部故障交错的验证。

## 1. 写入安全，为什么读取还可能出错？

线性一致性要求：如果 `Put(x, 10)` 已成功返回，此后才开始的 `Get(x)` 就不能返回更旧的状态。与读取重叠的写入可以排在它之前或之后；不要求返回响应抵达客户端瞬间的最新值。

仅有可靠的写入协议，还留下两个风险：

| 风险 | 例子 |
| --- | --- |
| 依据过期 | A 与集群隔离，仍自认 leader；B、C 已选出新 leader 并提交新值，A 却直接返回旧值 |
| 本地执行落后 | 所需日志已提交到 120，但提供查询的节点只执行到 115，KV 中还没有后续修改 |

**日志已提交、节点知道它已提交、状态机已执行它，是三件事。** 一次读取必须取得有效的顺序依据，并在满足该依据的数据状态上执行。

## 2. etcd v2：把读取本身排进日志

v2 的普通 GET 可以读取成员本地状态。请求线性一致读，需要指定：

```http
GET /v2/keys/x?quorum=true
```

v2.3.8 将它转换为内部 `QGET`，与 PUT、DELETE 一样序列化后调用 `s.r.Propose(...)`，提交给 Raft。[v2.3.8：Do](https://github.com/etcd-io/etcd/blob/v2.3.8/etcdserver/server.go#L721)

```text
QGET 请求 → 追加 Raft 日志 → quorum 复制确认 → 提交 → 按序执行读取
```

例如：

```text
位置 100：PUT(x, 10)
位置 101：QGET(x)
位置 102：PUT(x, 20)
```

状态机执行到 101 时，100 已执行，102 尚未执行，因此返回 10。应用代码在处理 QGET 时调用 `store.Get(...)`。[v2.3.8：应用 QGET](https://github.com/etcd-io/etcd/blob/v2.3.8/etcdserver/server.go#L1107)

读请求本身不改变业务数据，却占据日志位置，经过复制与持久化。旧 leader 若无法满足提交条件，就不能靠本地旧数据完成这条 QGET。

它一次解决了两件事：用日志提交确认读取的位置，用按序执行保证此前的修改已经可见。代价是每次这样的读取也给日志系统增加工作。

## 3. etcd v3：不记录读请求，改为取得安全位置

v3 的 Range 默认线性一致。这里讨论读取最新状态的普通 Range/Get；指定历史 revision 是显式请求历史版本，不能用“必须返回最新值”来理解。[v3.6 API](https://etcd.io/docs/v3.6/learning/api/)

假设 A 是 leader，客户端把 Get 发给 follower C：

```text
客户端 → C：Get(x)
           │
           └→ A：ReadIndex(q)
                 │ 记录当前提交位置 R
                 │ 携带 q 的心跳取得 quorum 确认
                 └→ C：返回 R
                       │ 等待 appliedIndex ≥ R
                       └→ 读取本地 KV，返回客户端
```

### R 是什么，谁确定？

R 是 leader 处理该次 ReadIndex 请求时记录的 `commitIndex`，即已提交日志的末尾位置。假设当前已提交到 103，那么 R 就是 103；它不是多数副本报告的位置取最大值，也不是 etcd 的 MVCC revision。

leader 先记录 R，再发出带请求上下文 q 的心跳，取得有效 quorum 确认后返回该位置。**quorum 不负责算出 R，而是为本次读取使用这个位置提供安全依据。** 固定成员配置中 quorum 是投票节点的多数派，包含 leader 自己。[Raft v3.6.0：ReadIndex 确认路径](https://github.com/etcd-io/raft/blob/v3.6.0/raft.go#L2142)

这里还有前提：多投票成员路径要求 leader 已提交本任期条目。新 leader 通常通过当选后追加的 no-op 满足它，避免提交进度尚不明确就处理读取。详见[上一篇 no-op 注解](/posts/0147/)。

等待确认时，即使提交位置继续推进到 105，该次请求记录的 R 也可以仍为 103。后来并发发生的写入，不必全部包含在这次读取中。

### 为什么得到 R 后还要等？

如果 C 只执行到 99，即使磁盘里已经有位置 103 的日志，KV 状态也可能仍旧。因此服务端明确等待 `appliedIndex ≥ R`，之后才执行本地查询。[etcd v3.6.4：linearizableReadLoop](https://github.com/etcd-io/etcd/blob/v3.6.4/server/etcdserver/v3_server.go#L805)

R 是下限，不要求读取恰好位于 R 的快照。C 若已执行到 105，可以在更晚的一致视图上查询。请求接收者不必是 leader，也不必向多数节点读取键值再比较结果。

## 4. 不能省的是保证，不是某个固定动作

两种路径的共同要求是：**读必须能放进一个尊重实际先后关系的操作顺序，执行时使用的数据也必须符合这个顺序。**

| 必须保持的保证 | v2 如何实现 | v3 如何实现 |
| --- | --- | --- |
| 不能把过期领导者的本地判断直接用于新读取 | QGET 必须经过有效的日志提交 | ReadIndex 为本次读取取得有效确认 |
| 不能遗漏读取开始前已完成的写入 | QGET 排在此前写入之后 | 安全位置 R 覆盖必须可见的历史 |
| 数据必须完成相应执行 | 状态机按序执行到 QGET | 读取节点等待 appliedIndex ≥ R |
| 查询本身必须使用一致的数据视图 | 在对应状态机位置读取 | 在本地 MVCC 视图上读取 |

确认必须与当前读取或一批符合条件的读取关联，不能永久缓存一次旧确认。也不能把“最近收到过心跳”直接等同于本次 ReadIndex 成功。

这不是形式上的要求。Raft 项目曾记录重复请求上下文与确认队列交互导致过旧 ReadIndex 被释放的问题。它说明：设计上的 quorum 条件，还必须由请求匹配、重试和批处理代码正确维持；不能只数收到几个响应。[etcd-io/raft #392](https://github.com/etcd-io/raft/issues/392)

反过来，也不能宣称每次读取都不可避免地需要独立的网络往返。**不可省的是上述保证，quorum 确认是当前讨论的无租约路径所采用的证明方式。** 有效租约等方案可以减少通信，但需要另行成立的时间假设和安全证明。

## 5. 哪些地方可以优化？

v3 将“确认读取依据”与“执行数据查询”拆开，因而可以省去读请求的日志条目及相应持久化工作。

| 工作 | v2 QGET | v3 ReadIndex |
| --- | --- | --- |
| 为本次读新增日志 | 需要 | 不需要 |
| quorum 参与 | 复制确认读日志 | 确认读取依据 |
| 本地执行进度约束 | 需要 | 需要 |
| 多数节点返回键值供比较 | 不需要 | 不需要 |
| 确认批处理 | 可利用日志批处理 | 多个读取可共享合适的一次确认 |

etcd 的后台读循环能够唤醒一批等待请求，不是每个 Get 都严格对应一次独立心跳往返。跟随者可以承担本地查询工作，但请求转发和等待应用也可能增加延迟，不能据此承诺每种负载下都更快。

默认的 ReadOnlySafe 没有为每次读新增日志，不代表整个系统不再需要磁盘：已有写入必须可靠保存，落后节点也可能需要读取快照、接收日志和应用修改。

若选择 `serializable=true` 的成员本地读取，则可以跳过这一轮协调，但接受了可能过期的结果。这是改变保证，不是保持相同语义的性能优化。

还要分清 API 与软件版本：etcd 3.x 曾同时支持 v2 API。v3.3.27 中的 v2 QGet 仍调用 Raft 提议路径，不会因为服务器版本号是 3 就自动改用 ReadIndex。[v3.3.27：v2 QGet](https://github.com/etcd-io/etcd/blob/v3.3.27/etcdserver/v2_server.go#L92)

## 6. Neon Pageserver 能对应到哪一步？

有对应，但要放在正确层次。Neon 计算节点执行 PostgreSQL，向 Safekeeper 发送 WAL；Pageserver 摄取 WAL，按计算节点请求的页面版本提供数据。

```text
etcd follower：
取得安全位置 R → 等待本地应用到 R → 查询 KV

Neon Pageserver：
收到页面版本要求 → 等待所需 WAL 摄取到位 → 重建并返回页面
```

两者都不允许用落后数据随便应答。但 etcd 等的是状态机已经应用到 R；Pageserver 等的是重建所需 WAL 已经摄取到位，页面可以随后再按需重做，并非所有页面都提前更新完毕。[Neon：等待 WAL 并读取页面](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pageserver/src/page_service.rs#L2513)

getpage 的位置来自计算节点，包含 `request_lsn` 和 `not_modified_since`。若计算节点知道某页面在一段区间内没有变化，Pageserver 可以利用这一信息减少等待；没有该信息时，则必须追上请求要求的位置。[Neon：版本参数与等待规则](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pageserver/src/page_service.rs#L2184)

“Safekeeper 保证 WAL 安全，ReadIndex 保证读取安全”这句话可以描述分工，却不能把两个组件直接画等号：

| 职责 | etcd | Neon |
| --- | --- | --- |
| 维护可靠的共同历史 | Raft 的选举、日志复制与提交 | WAL proposer 与 Safekeeper 的协议 |
| 决定本次请求所需的读取依据 | ReadIndex 流程 | 计算侧根据运行状态提供页面版本要求 |
| 等待本地满足要求 | follower/leader 等待状态机应用 | Pageserver 等待 WAL 摄取，再按需重建 |

**Safekeeper 更直接对应 etcd 的 Raft 日志层，而非 ReadIndex 这一条读取确认路径。** 一份历史已被可靠保存，不能单独证明某次新读取选取的位置足够新。[Neon：WAL proposer 源码](https://github.com/neondatabase/neon/blob/fa504217c61bbcaf5c512d75830564541f917f8f/pgxn/neon/walproposer.c)

Pageserver 正确返回指定版本的页面，也不等于整条 SQL 查询获得 etcd 式线性一致性。SQL 的可见性仍受 PostgreSQL 的 MVCC、隔离级别和计算节点重放进度约束。一个落后的只读计算节点请求旧版本，Pageserver 完全可能正确地返回它。

因此，这三种实现可以连起来理解，但不能省掉中间的边界：**可靠历史解决“哪些修改不能丢或分叉”；读取依据解决“这次请求必须看到哪里”；本地执行或重建解决“实际返回的数据是否符合要求”。读日志可以被优化掉，这些问题仍须有人负责。**
