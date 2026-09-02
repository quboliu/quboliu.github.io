---
lang: "zh-CN"
pubDatetime: 2026-09-02T10:30:52+08:00
modDatetime: 2026-09-02T11:31:43+08:00
timezone: "Asia/Shanghai"
title: "Google Spanner 的四道防线：Paxos、2PL、2PC 与 Commit Wait 分别解决什么问题？"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "分布式系统"
  - "数据库"
  - "Google Spanner"
  - "一致性"
description: "Paxos、2PL、2PC 和 Commit Wait 并不是重复的一致性算法，而是分别负责副本一致性、并发隔离、跨分片原子提交和现实时间顺序。"
---

第一次看 Google Spanner 的架构图时，很容易把 Paxos、2PL、2PC 和 Commit Wait 都笼统地称为“一致性机制”。这个说法不能算错，但还不够准确：它们面对的是四个不同的问题。

最简洁的对应关系是：

| 机制 | 解决的问题 |
| --- | --- |
| Paxos | 同一分片的多个副本如何保持一致 |
| 2PL | 并发事务如何隔离，结果如何保持可串行化 |
| 2PC | 一笔事务涉及多个分片时如何原子提交 |
| Commit Wait | 提交顺序如何符合客户端观察到的现实时间顺序 |

理解这四个机制的关键，是先把 Spanner 看成一个分层系统，而不是一个由某种单一算法“保证一致性”的数据库。

## 四个机制之外，还缺哪些架构拼图

如果目标是解释 Spanner 的完整架构，仅仅列出四个机制还不够。它们更像是事务一致性的核心协议；要让这些协议有地方运行，还需要数据分片、复制组、路由、存储和时间版本等组件。

### 1. Split：把全局数据拆成可扩展的片段

Spanner 不会把整张表交给一台服务器，而是按照主键范围把数据划分为多个 split。一个 split 可以理解为一段连续的 key range，也是数据放置、复制和迁移的基本单元。

split 可以根据数据大小和访问负载自动增加或调整边界。这样，数据库可以把不同 split 分布到不同服务器上，横向扩展读写能力，也可以把热点拆开。这里解决的是规模和负载问题，不是事务原子性。

### 2. Paxos group：每个 split 的副本集合

每个 split 通常有跨故障域部署的多个副本，这些副本组成一个 Paxos group。每个 group 选出一个 leader 处理写入，其他副本通过 Paxos 保持复制日志一致；副本足够新时，也可以参与读取。

因此，“分片”和“副本”是两个不同维度：

- split 解决的是数据如何切开、分布和扩展；
- Paxos group 解决的是同一份 split 数据如何复制和容错。

### 3. Leader 上的 transaction manager 和 lock table

Paxos leader 不只是一个复制协议里的角色。在经典 Spanner 架构中，leader 还运行事务管理器和锁表，负责持有读写锁、参与事务准备，并在跨 split 时充当 2PC 的 coordinator 或 participant。

这解释了为什么 Spanner 的事务协议通常画在 Paxos group leader 之上：事务管理状态本身也会通过底层 Paxos 持久化，leader 故障后，新 leader 可以继续恢复事务。

### 4. MVCC：让带时间戳的版本真正可读

Spanner 不是只保存一个“当前值”，而是保存带提交时间戳的多个版本。对某个时间戳 `t` 做快照读取时，系统返回不晚于 `t` 的最新版本。

MVCC 带来两个重要能力：历史读可以不阻塞当前写入；跨多个 split 的读取可以选择同一个时间戳，从而得到一致快照。TrueTime 负责帮助生成有顺序意义的时间戳，Commit Wait 则保证这个时间戳在对外宣布提交前已经安全地落在现实时间线上。

### 5. 路由、放置和底层持久化

客户端首先需要知道某个 key 属于哪个 split，以及这个 split 的副本在哪里。经典论文中的 location proxy、zonemaster 和 placement driver 分别承担定位、分配和迁移等职责；这些是控制面和数据放置机制，不是每次事务都要经历的提交协议。

底层还需要日志和持久化存储来承载 Paxos 状态机。它们负责可靠保存数据和日志，但不会替代 2PL、2PC 或 Commit Wait 的事务语义。

## 先看 Spanner 的分层

Spanner 会把数据划分为多个 split。每个 split 的副本组成一个 Paxos group；多个 split 之间的事务，则由各个 Paxos group 的 leader 协作完成。

可以把它简化成下面的结构：

```text
副本层：一个 split 的多个副本 ── Paxos ──> 一致的复制日志

事务层：多个 Paxos group 的 leader ── 2PL + 2PC ──> 分布式事务

时间层：TrueTime + Commit Wait ──> 符合现实顺序的提交时间戳
```

官方对 Spanner 的事务流程也采用了类似的区分：每个 split 通过 Paxos 复制，跨 split 事务额外使用两阶段提交，并在提交时结合 TrueTime 进行 commit wait。

## Paxos：解决副本之间的一致性

一个 split 通常有多个副本，副本可能分布在不同的机器、区域甚至数据中心。写入不能只落到某一台机器，否则这台机器宕机时就可能丢失数据，或者不同副本接受了不同的写入顺序。

Paxos 让同一个 Paxos group 中的副本对操作日志达成共识。leader 提交一项写入后，需要获得多数派副本的确认；只要多数派仍然可用，系统就可以继续进行写入，并且新的 leader 可以从复制日志恢复状态。

所以 Paxos 主要负责：

- 副本之间的操作顺序一致；
- 机器故障后的恢复；
- 写入的多数派持久化；
- 在少数副本故障时继续提供服务。

但 Paxos 的作用范围是一个 group 内部。假设一笔转账同时修改分片 A 和分片 B，Paxos 可以分别保证 A 的副本一致、B 的副本一致，却不能阻止 A 提交而 B 回滚。跨分片原子性需要 2PC。

## 2PL：解决并发事务的隔离问题

2PL 是 Two-Phase Locking，即两阶段锁。经典的读写事务会在读取时获得读锁，在写入或提交时获得写锁，并且通常一直持有到事务提交或回滚之后才释放。这种形式也称为 strict 2PL。

它解决的是并发事务之间的交错问题。例如，两个事务同时修改同一个账户时，不能让它们互相覆盖结果，也不能让一个事务读到另一个尚未提交的中间状态。

2PL 的目标可以概括为：

> 并发执行的结果，应该等价于某种串行执行。

也就是说，2PL 提供的是事务隔离和可串行化，而不是副本复制，也不是跨分片提交。

锁机制可能产生死锁。Spanner 使用 wound-wait 等策略避免锁等待形成环路，必要时让较老的事务中止较新的事务。

需要注意，经典 Spanner 讨论的是读写事务。只读事务通常可以使用 MVCC 的历史版本和一致性快照，避免获取读锁。

### 跨分片事务使用的是局部 2PL，还是全局 2PL

答案是：**锁表是分片局部的，但 2PL 约束是事务全局的。**

每个 Paxos group 的 leader 只管理本分片数据的锁，不存在一张覆盖所有分片的中心化全局锁表。但是，同一个跨分片事务在所有参与分片持有的锁，共同组成该事务的锁集合。

```text
跨分片事务 T
├── 分片 A 的 lock table：持有锁 LA
├── 分片 B 的 lock table：持有锁 LB
└── 分片 C 的 lock table：持有锁 LC
```

这些分片不是各自运行互不相关的事务。事务 T 在全局上遵守 strict 2PL：执行期间可以继续获取需要的锁，但在提交或回滚决定作出前，不会提前释放各分片上的必要锁。

跨分片时，各 participant 在本地检查锁冲突；2PC coordinator 收集所有 participant 的 Prepare 结果。只有全局决定提交或回滚以后，各分片才完成相同决定并释放锁。

因此，2PL 和 2PC 的关系是：

- 2PL 通过分布式持锁，约束并发事务的交错，提供可串行化隔离；
- 2PC 协调这些持锁的参与者，保证跨分片修改原子提交；
- 2PC 本身不单独创造隔离性，2PL 也不单独保证跨分片原子提交。

所以，“2PL 只管单分片隔离，Transaction Manager 单独负责跨分片隔离”并不准确。更准确的说法是：**Transaction Manager 用 2PC 协调多个局部锁表，而整个事务形成一套分布式 2PL。**

## 2PC：解决跨分片事务的原子性

假设一个转账事务需要执行：

```text
分片 A：账户 Alice 扣款
分片 B：账户 Bob 入账
```

如果应用直接向两个分片分别发送写请求，可能得到这样的结果：Alice 已经扣款，但 Bob 入账失败。系统就进入了一个业务上不可接受的中间状态。

2PC，即 Two-Phase Commit，通过 coordinator 和 participants 协调所有参与分片：

1. Prepare 阶段：每个参与者获取必要的锁，并持久化“我已经准备好提交”的状态；
2. Commit 阶段：只有所有参与者都准备成功，coordinator 才决定提交，并通知所有参与者提交；任何参与者失败，都可以让整个事务回滚。

因此 2PC 保证的是：

> 一笔跨分片事务要么全部提交，要么全部回滚。

Paxos 和 2PC 经常同时出现在 Spanner 中，但它们的参与对象不同：

- Paxos：同一个分片的多个副本之间达成一致；
- 2PC：同一笔事务涉及的多个分片之间达成一致。

在 Spanner 中，2PC 的 prepare、commit 等事务状态也会通过底层 Paxos 复制，从而让 coordinator 或 participant leader 故障后可以恢复事务状态。不过，网络分区或多数派不可用时，事务仍可能停顿并持有锁；Paxos 改善了状态恢复，并没有让经典 2PC 在所有故障下都不阻塞。

### 多个分片之间能不能使用 Paxos

能，但“跨分片使用 Paxos”可能指三种不同设计，不能混为一句话。

第一种是 **Spanner 的常规做法**：每个分片分别拥有自己的 Paxos group，跨分片事务再由 2PC 连接这些 group。这里没有一个横跨所有分片的 Paxos 实例；Paxos 复制各 participant 和 coordinator 的事务状态，使 2PC 决定能够在副本故障后恢复。

第二种是让**一个共识日志覆盖多个逻辑分片**。所有相关操作先进入同一个 Paxos/Multi-Paxos 日志，再按统一顺序执行。这样容易获得跨分片全序，却会把吞吐量、leader 负载和故障影响域绑在同一个共识组上，削弱分片原本用于水平扩展的意义。

第三种是 **Paxos Commit**。它不是把所有数据塞进一个 Paxos group，而是用一组 Paxos 共识实例容错地记录各 participant 的 Prepare/Abort 意愿，进而决定全局 Commit/Abort。其意义是消除单个事务协调者作为唯一故障点，并在所需多数派可用时继续推进提交。

还有一类系统把共识放在事务执行之前。例如 Calvin 对事务输入进行 Paxos 式同步复制，再通过确定性排序让各分片按同一事务顺序执行。它用“先排序、后执行”的架构减少正常路径对 2PC 的依赖，但代价是需要预先知道读写集或处理重调度，并承担全局排序层的延迟与容量约束。

因此，跨分片引入 Paxos 通常有两个目的：

1. **决定顺序**：让多个分片对事务或命令的全局顺序达成一致；
2. **决定结果**：让 Commit/Abort 决定在协调者故障后仍可恢复或继续推进。

它不是“比 2PC 更强，所以直接替换 2PC”这么简单。Paxos 解决共识与容错，原子提交还要定义每个 participant 的投票如何汇聚成事务结果；Paxos Commit 正是把二者结合起来的一种专门协议。

## Commit Wait：解决提交时间顺序问题

即使已经有了 Paxos、2PL 和 2PC，Spanner 还要面对一个更隐蔽的问题：不同数据中心的机器并不能直接知道完全精确的真实时间。

设想：

1. 事务 T1 在分片 A 上提交，客户端收到成功响应；
2. 客户端随后在分片 B 上启动事务 T2；
3. 由于 B 的本地时钟稍慢，T2 被分配了一个比 T1 更早的时间戳。

如果系统使用 MVCC，这可能导致某个快照看到 T2 的效果，却看不到已经先被客户端观察到的 T1。这种结果虽然可能仍然存在某个“串行解释”，却违背了现实中的先后顺序。

Spanner 使用 TrueTime 表示带有不确定范围的时间。事务选择提交时间戳 `s` 时，会使用当前时间区间的上界；在让提交结果对外可见之前，等待：

```text
TT.now().earliest > s
```

此时系统已经可以确定真实时间超过了 `s`。这段等待就是 Commit Wait。

它带来的效果是：如果客户端已经观察到 T1 完成，之后才开始 T2，那么 T2 必须获得比 T1 更晚的提交时间戳。这样，事务的串行顺序不仅要合法，还要符合客户端观察到的现实时间顺序。

这就是 Spanner 所说的 external consistency，通常也称为 strict serializability：

> 事务看起来像是串行执行的，而且这个串行顺序必须尊重不重叠事务的现实时间顺序。

Commit Wait 不是固定睡眠，也不是等待副本同步。Paxos 负责副本持久化，2PC 负责跨分片原子性，Commit Wait 负责让提交时间戳安全地落在真实时间线上。它通常还可以与 Paxos 的网络通信并行进行。

## “外部一致性”中的外部是什么

“外部”不是指数据库之外还有另一份数据，也不是说 Spanner 只有外部一致性、没有内部一致性。它指的是：一致性约束来自数据库内部状态之外的观察者——客户端、用户或现实时间。

可以这样对比：

- 副本一致性：所有副本是否看到相同的日志顺序？这是 Paxos 关心的事；
- 可串行化：并发事务是否可以解释成某种串行顺序？这是 2PL 关心的事；
- 外部一致性：这个串行顺序是否还符合客户端看到的先后？这是 TrueTime 和 Commit Wait 参与保证的事。

普通可串行化只要求“存在一个合法的串行顺序”。如果两个事务没有直接冲突，系统可能选择一个与现实时间相反的顺序，理论上仍然满足普通可串行化。外部一致性进一步要求：如果 T1 已经完成，T2 才开始，那么 T1 必须排在 T2 前面。

因此，“内部一致性”并不是 Spanner 文献中一个严格对应的标准术语。实际讨论时，最好直接说副本一致性、可串行化、原子性或外部一致性，这样更不容易把不同问题混在一起。

## 把四个机制放回一条事务路径

对于一个跨多个 split 的读写事务，可以粗略地看到这样的顺序：

```text
2PL：获取并持有读锁/写锁
  ↓
2PC Prepare：所有参与分片准备，并通过 Paxos 持久化状态
  ↓
2PC Commit：coordinator 决定全局提交
  ↓
Commit Wait：等待提交时间戳确定已经成为过去
  ↓
各参与分片通过 Paxos 记录提交并应用修改
  ↓
释放锁，向客户端返回结果
```

如果事务只涉及一个 split，Spanner 可以绕过 2PC，使用更简单、更快的单分片提交路径。

最后可以用四句话记住它们的分工：

> **Paxos 管副本，2PL 管并发，2PC 管原子提交，Commit Wait 管现实时间顺序。**

它们共同构成 Spanner 的强事务保证，但没有任何一个机制单独等于“所有一致性”。此外，诸如“账户余额不能为负”这样的业务不变量，仍然需要应用事务逻辑或数据库约束来维护。

参考资料：

- [Spanner: Google's Globally-Distributed Database](https://research.google/pubs/spanner-googles-globally-distributed-database-2/)
- [Life of Spanner Reads & Writes](https://docs.cloud.google.com/spanner/docs/whitepapers/life-of-reads-and-writes)
- [Spanner: TrueTime and external consistency](https://docs.cloud.google.com/spanner/docs/true-time-external-consistency)
- [Consensus on Transaction Commit](https://lamport.azurewebsites.net/pubs/transaction.pdf)
- [Calvin: Fast Distributed Transactions for Partitioned Database Systems](https://www.cs.yale.edu/homes/thomson/publications/calvin-sigmod12.pdf)
