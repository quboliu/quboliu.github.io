---
lang: "zh-CN"
pubDatetime: 2026-09-07T13:40:46+08:00
timezone: "Asia/Shanghai"
title: "可串行化：不是让事务排队，而是让并发留下可排队解释的历史"
area: "databases"
featured: false
draft: false
tags:
  - "DDIA"
  - "数据库"
  - "事务"
  - "隔离级别"
  - "可串行化"
  - "写偏斜"
description: "从 DDIA、数据库理论经典论文与 PostgreSQL 文档出发，解释 serial 的逻辑含义、串行等价究竟保留什么，以及写偏斜为何找不到任何串行解释。"
---
为什么事务的最高标准隔离级别叫 **serializable（可串行化）**，而不直接叫 serial（串行）？

差别就在词尾的 *-izable*。它并不要求事务实际上逐个执行，而是要求并发执行之后，仍然**能够被解释成**逐个执行。

> **可串行化要求：所有成功提交的并发事务，其可观察历史必须等价于同一批事务按照某个顺序、一个接一个且互不交错地执行。**

这也是 [DDIA 第二版第 8 章](https://learning.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/ch08.html#sec_transactions_serializability)给出的核心直觉。PostgreSQL 官方文档采用了几乎相同的判准：并发事务只有在效果可以由某种逐个执行的顺序解释时，才允许全部提交；否则数据库必须让至少一个事务以 `serialization_failure` 失败并重试。[PostgreSQL 18：Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html#XACT-SERIALIZABLE)

## “串行”究竟指什么

这里的“串行”不是机器实际运行方式，而是一份用于解释结果的**假想历史**：先完整执行 T1，再完整执行 T2；或者反过来。在这份历史里，不会出现 T1 执行一半、插入几步 T2、再回到 T1 的情况。

因此应当分清三个词：

- **串行执行**：事务在物理上真的一个接一个运行。
- **串行历史**：事务在逻辑记录中各自形成一个不被其他事务打断的完整区块。
- **可串行化历史**：现实中可以并发和交错，但存在至少一份串行历史，能完整解释它的可观察行为。

那个串行顺序只是一份**正确性见证**，未必唯一，也未必是数据库实际采用的调度顺序。数据库可以用真实串行执行、两阶段锁或可串行化快照隔离等不同机制提供同一种保证。可串行化规定的是“哪些历史可以被接受”，不是“内部必须怎样运行”。

## “等价”绝不只是最终数据相同

一句“最终结果相同”很容易说得太松。真正需要保留的至少包括：每次读取看到了哪个值、事务向客户端返回了什么，以及最终由哪些写入决定数据库状态。经典数据库理论把这类关系形式化为历史等价；冲突可串行化则是工程上更易判定的一种充分条件，而不是所有语境下“可串行化”这个概念本身。[Bernstein、Hadzilacos 与 Goodman 的经典教材](https://www.microsoft.com/en-us/research/people/philbe/book/)、[Papadimitriou 1979 年论文](https://www.cs.purdue.edu/homes/bb/cs542-11Spr/SCDU-Papa-79.pdf)

看一个最小化的写偏斜形状。初始状态为 `x=0, y=0`：

```text
T1: 读取 x，得到 0；随后写入 y=1
T2: 读取 y，得到 0；随后写入 x=1
```

两者并发时可以都读到 `0`，最后得到 `x=1, y=1`。巧妙之处在于，两个串行顺序的最终状态也都是 `(1,1)`；但没有一个顺序能解释实际读值：

- 若 T1 → T2，T2 应该读到 `y=1`，而不是 `0`；
- 若 T2 → T1，T1 应该读到 `x=1`，而不是 `0`。

所以终态虽然相同，历史仍不可串行化。用依赖图看也一样：T1 先读了后来被 T2 写入的 `x`，形成 T1 → T2 的读写反依赖；T2 先读了后来被 T1 写入的 `y`，又形成 T2 → T1。两条边构成环，因而不存在可以作为正确性见证的串行顺序。

这正是“可串行化”最锋利的含义：

> **并发不是问题；无法给并发找到一个自洽的逐个执行解释，才是问题。**

## 为什么它是最高隔离级别

假设每个事务单独运行时都能把合法数据库状态变成另一个合法状态。如果所有并发执行又都等价于某种串行执行，那么我们只需沿着该串行顺序逐个推理，就能把单事务正确性组合成整体正确性。Papadimitriou 的经典论文正是这样说明可串行化作为并发正确性准则的吸引力。

所以它之所以位于隔离级别顶端，不是因为“锁得最多”，而是因为它为应用提供了最强的并发抽象：

> **每个事务都可以按照“仿佛整个数据库中只有我在运行”来推理；数据库负责阻塞、排序或中止事务，使所有成功提交的结果仍能共同成立。**

但“最高”只限于事务隔离这根轴。普通可串行化不要求假想串行顺序符合现实时间，甚至不必符合重叠事务的提交顺序。若 T1 已经完成、T2 此后才开始，而串行解释还必须保证 T1 位于 T2 之前，这项附加保证叫**严格可串行化**。DDIA 将它概括为可串行化与线性一致性的结合；Herlihy 与 Wing 的经典定义更精确地说，串行顺序必须延拓非重叠事务的实时先后关系。[Linearizability: A Correctness Condition for Concurrent Objects](https://www.cs.columbia.edu/~wing/publications/HerlihyWing90.pdf)

## 与 Kimi 的三轮 rebuttal

我先请 Kimi 独立解释这个词。它正确抓住了主轴：serial 是语义顺序，不是物理调度；可串行化允许并发，只要求存在串行等价历史。

第一轮反驳集中在四点：不能把冲突可串行化直接当作完整定义；“等价”不能只比较终态；写偏斜并非没有读写依赖，而是没有写写冲突、却有两条反向读写反依赖；“最高”也只是在 SQL 隔离级别轴上成立。Kimi 接受了这些修正。

不过，它随后给出了一个错误反例：T1 读取 `x=0`，T2 写入 `x=1`，T2 先提交，于是它断言该历史找不到串行解释。问题在于，普通可串行化不要求遵循提交顺序；按 T1 → T2 排列，读值和终态都完全吻合。第二轮 rebuttal 指出这一点后，Kimi 撤回了原例，并承认自己无意中把严格可串行化的时间约束偷渡进了普通可串行化。

双方最后得到的共识可以压缩成三句：

1. 可串行化的核心是**存在某个能解释全部可观察行为的串行历史**，而不只是终态碰巧相同。
2. serial 表示逻辑上的正确性见证，不表示事务必须物理排队；依赖成环就意味着没有这样的见证。
3. 可串行化隔离并不承诺现实时间顺序；严格可串行化才额外约束非重叠事务的真实先后。

最终，只需要记住这一句：

> **可串行化不是让事务真的排成一条队，而是不允许并发留下任何无法由某种排队顺序解释的痕迹。**

## 延伸阅读

- Martin Kleppmann、Chris Riccomini，[《Designing Data-Intensive Applications》第二版：Transactions](https://learning.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/ch08.html)。
- Philip A. Bernstein、Vassos Hadzilacos、Nathan Goodman，[《Concurrency Control and Recovery in Database Systems》](https://www.microsoft.com/en-us/research/people/philbe/book/)，1987。
- Christos H. Papadimitriou，[The Serializability of Concurrent Database Updates](https://doi.org/10.1145/322154.322158)，*JACM*，1979。
- Maurice P. Herlihy、Jeannette M. Wing，[Linearizability: A Correctness Condition for Concurrent Objects](https://doi.org/10.1145/78969.78972)，*TOPLAS*，1990。
- Dan R. K. Ports、Kevin Grittner，[Serializable Snapshot Isolation in PostgreSQL](https://arxiv.org/abs/1208.4179)，*PVLDB*，2012。
