---
lang: "zh-CN"
pubDatetime: 2026-09-24T21:30:00+08:00
timezone: "Asia/Shanghai"
title: "转载｜Consistency Models Reference｜一致性模型术语参考"
area: "software-engineering"
featured: false
draft: false
tags:
  - "转载"
  - "分布式系统"
  - "一致性模型"
  - "Jepsen"
description: "Jepsen 一致性模型地图中 16 个模型专页的中英双语参考，涵盖定义、可用性边界和形式化条件。"
---

> **来源与版权｜Source and copyright**
>
> 本文经授权整理并翻译 Jepsen 一致性模型地图所链接的 16 个模型专页。每节标题下均列出原文标题与链接；英文按原文要点整理，中文紧随其后。原文版权 © Jepsen, LLC；中文翻译由本站提供。
>
> This authorized bilingual reference covers the sixteen model pages linked from Jepsen's consistency-model map. Each section identifies and links its source. Original text copyright © Jepsen, LLC; adaptation and Chinese translation by this site.

<a id="strict-serializable"></a>

## Strong Serializability｜严格可串行化

> **原文｜Source:** Jepsen, [Strong Serializability](https://jepsen.io/consistency/models/strict-serializable) · © Jepsen, LLC

Informally, strong serializability (also called strict serializability, Strict PL-SS, or Strong 1SR) means that operations appear to occur in some serial order consistent with real time. If operation A completes before B begins, A precedes B in that order. It is a transactional, multi-object model: a transaction's sub-operations appear atomic and may act on the entire database, including predicates. It cannot be totally or sticky available during a network partition.

> 非正式地说，强可串行化（也称严格可串行化、Strict PL-SS 或 Strong 1SR）要求操作看起来按某个符合实时顺序的串行次序发生。若操作 A 在 B 开始前完成，A 就必须排在 B 之前。这是一种事务型、多对象模型：事务的子操作呈现为一个原子整体，作用范围可以是整个数据库乃至谓词。发生网络分区时，它无法做到完全可用或粘性可用。

It implies both serializability and linearizability: serializability supplies a total order of transactional, multi-object operations, while linearizability adds real-time constraints. Equivalently, the whole database can be viewed as one linearizable object.

> 它同时蕴含可串行化与线性一致性：前者给出多对象事务的全序，后者加入实时约束。也可以把整个数据库看作一个满足线性一致性的对象。

### Formally｜形式化定义

Herlihy and Wing define a history as strictly serializable when it is equivalent to a sequential transaction history whose order respects precedence between non-overlapping transactions. Transaction A precedes B when A completes before B begins.

> Herlihy 与 Wing 的定义是：若一段历史等价于某个事务依次执行的历史，并且该顺序遵守互不重叠事务之间的先后关系，这段历史就严格可串行化。事务 A 在 B 开始前完成时，A 先于 B。

<a id="linearizable"></a>

## Linearizability｜线性一致性

> **原文｜Source:** Jepsen, [Linearizability](https://jepsen.io/consistency/models/linearizable) · © Jepsen, LLC

Linearizability is one of the strongest single-object models. Every operation appears to take effect atomically in an order consistent with real time. It cannot be totally or sticky available during a network partition. The scope of an “object” varies: it might be one key, several keys in a table, or several tables, without necessarily extending across tables or databases.

> 线性一致性是最强的单对象模型之一。每项操作都像是在某个瞬间原子生效，并且顺序符合真实时间。网络分区时，它无法做到完全可用或粘性可用。“对象”的范围因系统而异：可能是单个键、一张表中的多个键，或数据库中的多张表，但不一定跨越表或数据库边界。

For multiple objects, use strict serializability. If real-time constraints are unnecessary but every process must observe the same total order, use sequential consistency.

> 跨多个对象需要严格可串行化；若不要求实时约束，但希望所有进程观察到同一个全序，可采用顺序一致性。

### Formally｜形式化定义

Herlihy and Wing define a linearizable history H as one having an equivalent sequential history S whose total order respects H's partial real-time order and each object's single-threaded semantics. Viotti and Vukolić express this as SingleOrder, RealTime, and RVal.

> Herlihy 与 Wing 认为，如果历史 H 存在一个等价的顺序历史 S，S 的全序既符合 H 的部分实时顺序，也遵守每个对象的单线程语义，那么 H 就满足线性一致性。Viotti 与 Vukolić 将其分解为 SingleOrder、RealTime 与 RVal 三项约束。

<a id="serializable"></a>

## Serializability｜可串行化

> **原文｜Source:** Jepsen, [Serializability](https://jepsen.io/consistency/models/serializable) · © Jepsen, LLC

Serializability means transactions appear to occur in some total order. Transactions are atomic, may contain ordered sub-operations, and may span multiple objects or predicates. It cannot be totally or sticky available under partition. It implies repeatable read and generalized snapshot isolation, but imposes neither real-time nor per-process order: a later read need not see an earlier completed write, and a process may fail to see its own prior transaction.

> 可串行化要求事务看起来按某个全序发生。事务是原子的，可以包含有序的子操作，并可跨越多个对象或谓词。分区期间它无法做到完全可用或粘性可用。它蕴含可重复读和广义快照隔离，却不施加实时顺序或进程内顺序：后发起的读不一定看到先完成的写，进程甚至可能看不到自己先前事务中的写入。

The freedom to reorder allows pathological but legal histories, such as placing reads at time zero so they always return an empty state, or moving write-only transactions after all reads.

> 这种重排自由会允许一些反常但合法的历史，例如把所有读取排在时间零，使其总是返回空状态；或把只写事务排到所有读取之后。

### Formally｜形式化定义

ANSI SQL describes serializable execution as having the same effect as some serial execution. Its anomaly formulation prohibits dirty writes (P0), dirty reads (P1), fuzzy reads (P2), and phantoms (P3), though Berenson et al. showed that the ANSI wording admits weaker interpretations. Adya's preventative interpretation is more precise. In abstract-execution terms, Cerone et al. combine internal consistency, external consistency, and a total visibility order.

> ANSI SQL 把可串行化执行定义为与某次串行执行产生相同效果。按异常现象表述，它禁止脏写（P0）、脏读（P1）、模糊读（P2）和幻读（P3）；不过 Berenson 等人指出，ANSI 的措辞容许更弱的解释。Adya 的预防式解释更精确。用抽象执行描述时，Cerone 等人把它表示为内部一致性、外部一致性和可见关系全序三项性质的组合。

<a id="repeatable-read"></a>

## Repeatable Read｜可重复读

> **原文｜Source:** Jepsen, [Repeatable Read](https://jepsen.io/consistency/models/repeatable-read) · © Jepsen, LLC

Repeatable read resembles serializability but permits phantoms. Once a transaction reads an individual object, that object remains stable, yet another transaction may add or modify rows matching a previously read predicate. It is transactional and multi-object, cannot be totally available during partitions, and implies cursor stability and read committed. It provides neither real-time nor per-process ordering.

> 可重复读与可串行化相似，但允许幻读。事务一旦读过某个对象，该对象就保持稳定；然而另一事务仍可新增或修改符合先前查询谓词的行。它是事务型、多对象模型，在分区期间无法完全可用，并蕴含游标稳定性和读已提交。它不保证实时顺序或进程内顺序。

### Formally｜形式化定义

In the preventative interpretation of ANSI isolation, repeatable read prohibits P0 dirty writes, P1 dirty reads, and P2 fuzzy or non-repeatable reads, while allowing P3 phantoms. A second read need not actually occur: modification of the previously read predicate is sufficient.

> 在 ANSI 隔离级别的预防式解释中，可重复读禁止 P0 脏写、P1 脏读和 P2 模糊读（不可重复读），但允许 P3 幻读。事务不必真的再次读取；只要先前读取的谓词所涵盖的集合被修改，就足以构成该现象。

<a id="snapshot-isolation"></a>

## Snapshot Isolation｜快照隔离

> **原文｜Source:** Jepsen, [Snapshot Isolation](https://jepsen.io/consistency/models/snapshot-isolation) · © Jepsen, LLC

Under snapshot isolation, every transaction operates on an independent, consistent database snapshot. Its changes remain private until commit, when they become atomically visible to later transactions. If T1 writes object x and T2 commits another write to x between T1's snapshot and commit, T1 must abort: first committer wins.

> 在快照隔离下，每个事务都在独立且一致的数据库快照上操作。事务的改动在提交前仅自己可见；提交时，这些改动作为一个原子整体对之后的事务可见。如果 T1 修改对象 x，而 T2 在 T1 获取快照后、提交前也提交了对 x 的写入，T1 必须中止，即“先提交者胜”。

Snapshot isolation is transactional and multi-object, and cannot be totally available. Unlike serializability it imposes only a partial order, so it allows write skew and a read-only transaction anomaly. It implies read committed but guarantees neither real-time nor per-process order. Generalized SI can therefore admit pathological reorderings.

> 快照隔离是事务型、多对象模型，无法做到完全可用。它不像可串行化那样强制事务全序，只规定部分顺序，因此允许写偏斜及只读事务异常。它蕴含读已提交，却不保证实时顺序或进程内顺序；广义快照隔离也因此容许反常的重排。

### A Range of Snapshot Isolations｜不同强度的快照隔离

Definitions differ over how start and commit timestamps relate to wall-clock time. Strong or classic SI may be incomparable with serializability because it adds real-time constraints. Jepsen uses a generalized definition: it prohibits G-nonadjacent cycles but allows cycles containing two adjacent read-write anti-dependencies, making SI strictly weaker than serializability.

> 各种定义对开始时间戳、提交时间戳与墙上时间的关系约束不同。强式或经典 SI 因加入实时约束，可能与可串行化不可比较。Jepsen 采用广义定义：禁止 G-nonadjacent 环，但允许含两条相邻读写反依赖的环，因此 SI 严格弱于可串行化。

### Formally｜形式化定义

Berenson et al.'s algorithm gives each transaction a snapshot, includes its own writes in that snapshot, hides concurrent updates, and aborts on overlapping write sets. Cerone et al. characterize SI through internal consistency, external consistency, prefix visibility, and NoConflict.

> Berenson 等人的算法为每个事务分配一个快照，将事务自己的写入纳入该快照、隐藏并发更新，并在写集合重叠时中止事务。Cerone 等人用内部一致性、外部一致性、前缀可见性和 NoConflict 四项性质刻画 SI。

<a id="causal"></a>

## Causal Consistency｜因果一致性

> **原文｜Source:** Jepsen, [Causal Consistency](https://jepsen.io/consistency/models/causal) · © Jepsen, LLC

Causal consistency requires causally related operations to appear in the same order to every process, while causally independent operations may be ordered differently. If a question causes two replies, nobody may observe a reply before the question, though observers may disagree about the order of the replies. Convergent causal systems eventually agree once the same operations become visible.

> 因果一致性要求所有进程以相同顺序观察存在因果关系的操作，但可以用不同顺序观察彼此独立的操作。若一个问题引发两条回答，任何人都不能先看到回答再看到问题，但不同观察者可以对两条回答的先后意见不同。收敛型因果系统在相同操作都可见后最终会达成一致。

It is sticky available: every client attached to a healthy node can progress during a partition, provided it stays with the same server. Real-time causal and causal+ are stronger common variants. Sequential consistency adds a total order at an availability cost; writes-follow-reads, monotonic reads, and monotonic writes can remain totally available.

> 它具有粘性可用性：分区期间，只要客户端始终连接同一台健康服务器，就能继续操作。实时因果一致性和 causal+ 是常见的更强变体。顺序一致性用可用性换取全序；写遵循读、单调读和单调写则仍可做到完全可用。

### Formally｜形式化定义

Causal memory builds on Lamport's happens-before relation. It preserves each process's serial order and requires reads to reflect the latest preceding concurrent writes. Viotti and Vukolić decompose it into CausalVisibility, CausalArbitration, and RVal.

> 因果内存建立在 Lamport 的“先发生”关系上。它保留每个进程的串行顺序，并要求读取反映此前最新的并发写入。Viotti 与 Vukolić 将其分解为 CausalVisibility、CausalArbitration 和 RVal。

<a id="sequential"></a>

## Sequential Consistency｜顺序一致性

> **原文｜Source:** Jepsen, [Sequential Consistency](https://jepsen.io/consistency/models/sequential) · © Jepsen, LLC

Sequential consistency makes all operations appear in one total order consistent with the program order of each process. It cannot be totally or sticky available during a partition. Processes may be arbitrarily far ahead of or behind one another and may read stale state, but once a process observes another process's operation it cannot later move behind it in the total order.

> 顺序一致性让所有操作呈现为一个全序，并且该全序符合每个进程自身的程序顺序。分区期间它无法做到完全可用或粘性可用。不同进程的进度可以相差任意远，也可能读到陈旧状态；但某进程一旦观察到另一进程的某项操作，此后就不能在全序中退回到该操作之前。

### Formally｜形式化定义

Lamport defines it as an execution whose result equals some sequential ordering of all processors' operations, with each processor's operations retaining program order. Viotti and Vukolić express it as SingleOrder, PRAM, and RVal.

> Lamport 的定义是：执行结果等价于把所有处理器的操作按某个顺序依次执行，并且每个处理器的操作在该顺序中保持其程序次序。Viotti 与 Vukolić 将其表示为 SingleOrder、PRAM 和 RVal。

<a id="pram"></a>

## PRAM｜流水线随机存取内存

> **原文｜Source:** Jepsen, [PRAM](https://jepsen.io/consistency/models/pram) · © Jepsen, LLC

PRAM (Pipeline Random Access Memory) requires every pair of writes from one process to be observed everywhere in that process's order; writes from different processes may be observed in different orders. It is exactly equivalent to the conjunction of read-your-writes, monotonic writes, and monotonic reads. It is sticky available.

> PRAM（Pipeline Random Access Memory，流水线随机存取内存）要求同一进程发出的任意两次写入，在所有地方都按该进程的写入顺序被观察；不同进程的写入则可按不同顺序出现。它恰好等价于读己之写、单调写和单调读三项保证的合取，并具有粘性可用性。

### Formally｜形式化定义

PRAM holds when session order—the order of operations on each process—is a subset of visibility order.

> 当会话顺序（每个进程上的操作顺序）是可见顺序的子集时，PRAM 成立。

<a id="writes-follow-reads"></a>

## Writes Follow Reads｜写遵循读

> **原文｜Source:** Jepsen, [Writes Follow Reads](https://jepsen.io/consistency/models/writes-follow-reads) · © Jepsen, LLC

Writes follow reads, also called session causality, ensures that if a process reads value v from write w1 and later performs w2, then w2 is visible after w1. Once something has been read, a later write cannot change that read's past. This property is totally available.

> 写遵循读也称会话因果性。若进程读到由写入 w1 产生的值 v，随后执行写入 w2，那么 w2 必须在 w1 之后可见。已经读到某项结果后，之后的写入不能改写那次读取的过去。这项性质可以完全可用。

### Formally｜形式化定义

The visibility and session orders, restricted to read/write pairs, must be a subset of the arbitration order.

> 把可见顺序和会话顺序限制在“读后写”操作对上，所得关系必须是仲裁顺序的子集。

<a id="monotonic-writes"></a>

## Monotonic Writes｜单调写

> **原文｜Source:** Jepsen, [Monotonic Writes](https://jepsen.io/consistency/models/monotonic-writes) · © Jepsen, LLC

If a process performs write w1 and then w2, monotonic writes requires every process to observe w1 before w2. It constrains only writes by the same process and can be totally available.

> 若某进程先执行写入 w1、再执行 w2，单调写要求所有进程都先观察到 w1，再观察到 w2。它只约束同一进程的写入，并且可以做到完全可用。

### Formally｜形式化定义

Session order restricted to write/write pairs must be a subset of arbitration order.

> 将会话顺序限制在“写后写”操作对上，所得关系必须是仲裁顺序的子集。

<a id="read-your-writes"></a>

## Read Your Writes｜读己之写

> **原文｜Source:** Jepsen, [Read Your Writes](https://jepsen.io/consistency/models/read-your-writes) · © Jepsen, LLC

Read your writes (or read my writes) requires a process's read to observe the effects of that process's preceding write. It says nothing about other processes. It is sticky available as long as clients do not switch servers during a partition.

> 读己之写（也称 read my writes）要求同一进程后续的读取能看到自己先前写入的效果；它不保证其他进程也能看到。分区期间，只要客户端不切换服务器，它就具有粘性可用性。

### Formally｜形式化定义

Session order restricted to write/read pairs must be a subset of visibility order.

> 将会话顺序限制在“写后读”操作对上，所得关系必须是可见顺序的子集。

<a id="cursor-stability"></a>

## Cursor Stability｜游标稳定性

> **原文｜Source:** Jepsen, [Cursor Stability](https://jepsen.io/consistency/models/cursor-stability) · © Jepsen, LLC

Cursor stability strengthens read committed by preventing lost updates. A cursor refers to an object accessed by a transaction. Once read through a cursor, that object cannot be modified by another transaction until the cursor is released or the transaction commits. Transactions may have multiple cursors.

> 游标稳定性通过防止更新丢失来加强读已提交。游标指向事务正在访问的对象；对象一旦通过游标被读取，在游标释放或事务提交前，其他事务就不能修改它。一个事务可以拥有多个游标。

It is transactional and multi-object, cannot be totally available, and guarantees neither real-time nor per-process transaction order. Repeatable read is stronger because it stabilizes every record read rather than only active cursors.

> 它是事务型、多对象模型，无法完全可用，也不保证实时顺序或进程内事务顺序。可重复读更强，因为它会稳定所有读过的记录，而不只稳定当前游标指向的记录。

### Formally｜形式化定义

Adya defines cursor stability by prohibiting G1 and G-cursor(x): a single-object serialization graph may not contain an anti-dependency cycle with at least one write-dependency edge. It also prohibits P0 and P1, while allowing P2 and P3 where cursors are not used.

> Adya 通过禁止 G1 和 G-cursor(x) 定义游标稳定性：限制在单一对象 x 上的序列化图不得出现既含反依赖环、又至少含一条写依赖边的情形。它也禁止 P0 与 P1，但在未使用游标处允许 P2 与 P3。

<a id="monotonic-atomic-view"></a>

## Monotonic Atomic View｜单调原子视图

> **原文｜Source:** Jepsen, [Monotonic Atomic View](https://jepsen.io/consistency/models/monotonic-atomic-view) · © Jepsen, LLC

Monotonic atomic view strengthens read committed by preventing a transaction from observing only some effects of a previously committed transaction. Once T2 observes any write from T1, all of T1's effects must be visible to T2. This helps preserve foreign-key constraints and keep indexes and materialized views aligned with their source objects.

> 单调原子视图通过禁止事务只看到先前已提交事务的一部分效果来加强读已提交。一旦 T2 观察到 T1 的任一写入，T1 的全部效果都必须对 T2 可见。这有助于维护外键约束，并使索引和物化视图与底层对象保持一致。

It is transactional, multi-object, and totally available, but supplies neither real-time nor per-process order. Repeatable read and snapshot isolation are stronger at the cost of total availability.

> 它是事务型、多对象且完全可用的模型，但不提供实时顺序或进程内顺序。可重复读和快照隔离更强，代价是失去完全可用性。

### Formally｜形式化定义

Bailis, Davidson, Fekete et al. introduced MAV. In Adya's terms it prohibits G1b intermediate reads; because it is stronger than read committed, it also prohibits P0 and P1 while allowing P2 and P3.

> Bailis、Davidson、Fekete 等人提出了 MAV。按 Adya 的术语，它禁止 G1b 中间读；由于它强于读已提交，也禁止 P0 和 P1，但允许 P2 与 P3。

<a id="read-committed"></a>

## Read Committed｜读已提交

> **原文｜Source:** Jepsen, [Read Committed](https://jepsen.io/consistency/models/read-committed) · © Jepsen, LLC

Read committed strengthens read uncommitted by preventing dirty reads: transactions may not observe writes from transactions which do not commit. It is transactional, multi-object, and totally available. Monotonic atomic view offers atomic visibility without sacrificing availability; read uncommitted may offer greater performance by permitting dirty reads.

> 读已提交通过禁止脏读来加强读未提交：事务不能观察最终没有提交的事务所做的写入。它是事务型、多对象且完全可用的模型。单调原子视图可在不牺牲可用性的前提下提供原子可见性；读未提交则可能通过允许脏读取得更高性能。

It imposes neither real-time nor per-process order and admits pathological reorderings such as always returning an initial empty state.

> 它不规定实时顺序或进程内顺序，并允许始终返回初始空状态之类的反常重排。

### Formally｜形式化定义

Under Adya's preventative interpretation, read committed prohibits P0 dirty writes and P1 dirty reads, while allowing P2 fuzzy reads and P3 phantoms.

> 按 Adya 的预防式解释，读已提交禁止 P0 脏写和 P1 脏读，但允许 P2 模糊读与 P3 幻读。

<a id="read-uncommitted"></a>

## Read Uncommitted｜读未提交

> **原文｜Source:** Jepsen, [Read Uncommitted](https://jepsen.io/consistency/models/read-uncommitted) · © Jepsen, LLC

Read uncommitted prohibits dirty writes, in which two transactions modify the same object concurrently before committing. Although ANSI SQL presents it as the most permissive default level, Berenson et al. argue that it should still rule out dirty writes. It is transactional, multi-object, and totally available.

> 读未提交禁止脏写，即两个事务在提交前并发修改同一对象。ANSI SQL 把它视为限制最少的默认级别，但 Berenson 等人认为它仍应排除脏写。它是事务型、多对象且完全可用的模型。

It has no real-time or per-process ordering constraints and can admit pathological histories. Read committed prevents dirty reads without sacrificing total availability.

> 它不含实时或进程内顺序约束，可以容许反常历史。读已提交在不牺牲完全可用性的情况下进一步禁止脏读。

### Formally｜形式化定义

ANSI imposes essentially no constraint at this level. Adya's preventative interpretation prohibits P0 dirty writes but allows P1 dirty reads, P2 fuzzy reads, and P3 phantoms.

> ANSI 在这一隔离级别上几乎不作约束。Adya 的预防式解释禁止 P0 脏写，但允许 P1 脏读、P2 模糊读和 P3 幻读。

<a id="monotonic-reads"></a>

## Monotonic Reads｜单调读

> **原文｜Source:** Jepsen, [Monotonic Reads](https://jepsen.io/consistency/models/monotonic-reads) · © Jepsen, LLC

If a process performs read r1 and then r2, monotonic reads ensures r2 cannot observe a state older than the writes reflected in r1: reads cannot go backwards. It constrains only reads from the same process and can be totally available.

> 若某进程先执行读取 r1、再执行 r2，单调读保证 r2 不能观察到比 r1 所反映写入更早的状态；也就是说，读取不能倒退。它只约束同一进程的读取，并且可以做到完全可用。

### Formally｜形式化定义

For operations a, b, and c, where b and c are reads, if a is visible to b and b precedes c in the same session, then a must also be visible to c.

> 对操作 a、b、c，若 b 与 c 都是读取，a 对 b 可见，且 b 在同一会话中先于 c，那么 a 也必须对 c 可见。

---

Copyright © Jepsen, LLC. 中文翻译由本站提供。｜Chinese translation by this site.
