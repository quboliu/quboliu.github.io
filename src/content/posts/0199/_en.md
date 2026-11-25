---
sourceDigest: "10978630a1adcd78f72b541d2a85194807189954f37f314514c69bd4c965375e"
title: "Consistency Models Reference"
description: "Reference covering the sixteen consistency model pages linked from Jepsen's map, including definitions, availability bounds, and formalisms."
---

<aside class="source-note">

**Source**

- **Original:** [Jepsen Consistency Models](https://jepsen.io/consistency/models) (16 model pages)
- **Copyright:** © Jepsen, LLC

</aside>

<a id="strict-serializable"></a>

## Strong Serializability

<aside class="source-note">

**Source:** Jepsen, [Strong Serializability](https://jepsen.io/consistency/models/strict-serializable) · © Jepsen, LLC

</aside>

Informally, strong serializability (also called strict serializability, Strict PL-SS, or Strong 1SR) means that operations appear to occur in some serial order consistent with real time. If operation A completes before B begins, A precedes B in that order. It is a transactional, multi-object model: a transaction's sub-operations appear atomic and may act on the entire database, including predicates. It cannot be totally or sticky available during a network partition.

It implies both serializability and linearizability: serializability supplies a total order of transactional, multi-object operations, while linearizability adds real-time constraints. Equivalently, the whole database can be viewed as one linearizable object.

### Formally

Herlihy and Wing define a history as strictly serializable when it is equivalent to a sequential transaction history whose order respects precedence between non-overlapping transactions. Transaction A precedes B when A completes before B begins.

<a id="linearizable"></a>

## Linearizability

<aside class="source-note">

**Source:** Jepsen, [Linearizability](https://jepsen.io/consistency/models/linearizable) · © Jepsen, LLC

</aside>

Linearizability is one of the strongest single-object models. Every operation appears to take effect atomically in an order consistent with real time. It cannot be totally or sticky available during a network partition. The scope of an “object” varies: it might be one key, several keys in a table, or several tables, without necessarily extending across tables or databases.

For multiple objects, use strict serializability. If real-time constraints are unnecessary but every process must observe the same total order, use sequential consistency.

### Formally

Herlihy and Wing define a linearizable history H as one having an equivalent sequential history S whose total order respects H's partial real-time order and each object's single-threaded semantics. Viotti and Vukolić express this as SingleOrder, RealTime, and RVal.

<a id="serializable"></a>

## Serializability

<aside class="source-note">

**Source:** Jepsen, [Serializability](https://jepsen.io/consistency/models/serializable) · © Jepsen, LLC

</aside>

Serializability means transactions appear to occur in some total order. Transactions are atomic, may contain ordered sub-operations, and may span multiple objects or predicates. It cannot be totally or sticky available under partition. It implies repeatable read and generalized snapshot isolation, but imposes neither real-time nor per-process order: a later read need not see an earlier completed write, and a process may fail to see its own prior transaction.

The freedom to reorder allows pathological but legal histories, such as placing reads at time zero so they always return an empty state, or moving write-only transactions after all reads.

### Formally

ANSI SQL describes serializable execution as having the same effect as some serial execution. Its anomaly formulation prohibits dirty writes (P0), dirty reads (P1), fuzzy reads (P2), and phantoms (P3), though Berenson et al. showed that the ANSI wording admits weaker interpretations. Adya's preventative interpretation is more precise. In abstract-execution terms, Cerone et al. combine internal consistency, external consistency, and a total visibility order.

<a id="repeatable-read"></a>

## Repeatable Read

<aside class="source-note">

**Source:** Jepsen, [Repeatable Read](https://jepsen.io/consistency/models/repeatable-read) · © Jepsen, LLC

</aside>

Repeatable read resembles serializability but permits phantoms. Once a transaction reads an individual object, that object remains stable, yet another transaction may add or modify rows matching a previously read predicate. It is transactional and multi-object, cannot be totally available during partitions, and implies cursor stability and read committed. It provides neither real-time nor per-process ordering.

### Formally

In the preventative interpretation of ANSI isolation, repeatable read prohibits P0 dirty writes, P1 dirty reads, and P2 fuzzy or non-repeatable reads, while allowing P3 phantoms. A second read need not actually occur: modification of the previously read predicate is sufficient.

<a id="snapshot-isolation"></a>

## Snapshot Isolation

<aside class="source-note">

**Source:** Jepsen, [Snapshot Isolation](https://jepsen.io/consistency/models/snapshot-isolation) · © Jepsen, LLC

</aside>

Under snapshot isolation, every transaction operates on an independent, consistent database snapshot. Its changes remain private until commit, when they become atomically visible to later transactions. If T1 writes object x and T2 commits another write to x between T1's snapshot and commit, T1 must abort: first committer wins.

Snapshot isolation is transactional and multi-object, and cannot be totally available. Unlike serializability it imposes only a partial order, so it allows write skew and a read-only transaction anomaly. It implies read committed but guarantees neither real-time nor per-process order. Generalized SI can therefore admit pathological reorderings.

### A Range of Snapshot Isolations

Definitions differ over how start and commit timestamps relate to wall-clock time. Strong or classic SI may be incomparable with serializability because it adds real-time constraints. Jepsen uses a generalized definition: it prohibits G-nonadjacent cycles but allows cycles containing two adjacent read-write anti-dependencies, making SI strictly weaker than serializability.

### Formally

Berenson et al.'s algorithm gives each transaction a snapshot, includes its own writes in that snapshot, hides concurrent updates, and aborts on overlapping write sets. Cerone et al. characterize SI through internal consistency, external consistency, prefix visibility, and NoConflict.

<a id="causal"></a>

## Causal Consistency

<aside class="source-note">

**Source:** Jepsen, [Causal Consistency](https://jepsen.io/consistency/models/causal) · © Jepsen, LLC

</aside>

Causal consistency requires causally related operations to appear in the same order to every process, while causally independent operations may be ordered differently. If a question causes two replies, nobody may observe a reply before the question, though observers may disagree about the order of the replies. Convergent causal systems eventually agree once the same operations become visible.

It is sticky available: every client attached to a healthy node can progress during a partition, provided it stays with the same server. Real-time causal and causal+ are stronger common variants. Sequential consistency adds a total order at an availability cost; writes-follow-reads, monotonic reads, and monotonic writes can remain totally available.

### Formally

Causal memory builds on Lamport's happens-before relation. It preserves each process's serial order and requires reads to reflect the latest preceding concurrent writes. Viotti and Vukolić decompose it into CausalVisibility, CausalArbitration, and RVal.

<a id="sequential"></a>

## Sequential Consistency

<aside class="source-note">

**Source:** Jepsen, [Sequential Consistency](https://jepsen.io/consistency/models/sequential) · © Jepsen, LLC

</aside>

Sequential consistency makes all operations appear in one total order consistent with the program order of each process. It cannot be totally or sticky available during a partition. Processes may be arbitrarily far ahead of or behind one another and may read stale state, but once a process observes another process's operation it cannot later move behind it in the total order.

### Formally

Lamport defines it as an execution whose result equals some sequential ordering of all processors' operations, with each processor's operations retaining program order. Viotti and Vukolić express it as SingleOrder, PRAM, and RVal.

<a id="pram"></a>

## PRAM

<aside class="source-note">

**Source:** Jepsen, [PRAM](https://jepsen.io/consistency/models/pram) · © Jepsen, LLC

</aside>

PRAM (Pipeline Random Access Memory) requires every pair of writes from one process to be observed everywhere in that process's order; writes from different processes may be observed in different orders. It is exactly equivalent to the conjunction of read-your-writes, monotonic writes, and monotonic reads. It is sticky available.

### Formally

PRAM holds when session order—the order of operations on each process—is a subset of visibility order.

<a id="writes-follow-reads"></a>

## Writes Follow Reads

<aside class="source-note">

**Source:** Jepsen, [Writes Follow Reads](https://jepsen.io/consistency/models/writes-follow-reads) · © Jepsen, LLC

</aside>

Writes follow reads, also called session causality, ensures that if a process reads value v from write w1 and later performs w2, then w2 is visible after w1. Once something has been read, a later write cannot change that read's past. This property is totally available.

### Formally

The visibility and session orders, restricted to read/write pairs, must be a subset of the arbitration order.

<a id="monotonic-writes"></a>

## Monotonic Writes

<aside class="source-note">

**Source:** Jepsen, [Monotonic Writes](https://jepsen.io/consistency/models/monotonic-writes) · © Jepsen, LLC

</aside>

If a process performs write w1 and then w2, monotonic writes requires every process to observe w1 before w2. It constrains only writes by the same process and can be totally available.

### Formally

Session order restricted to write/write pairs must be a subset of arbitration order.

<a id="read-your-writes"></a>

## Read Your Writes

<aside class="source-note">

**Source:** Jepsen, [Read Your Writes](https://jepsen.io/consistency/models/read-your-writes) · © Jepsen, LLC

</aside>

Read your writes (or read my writes) requires a process's read to observe the effects of that process's preceding write. It says nothing about other processes. It is sticky available as long as clients do not switch servers during a partition.

### Formally

Session order restricted to write/read pairs must be a subset of visibility order.

<a id="cursor-stability"></a>

## Cursor Stability

<aside class="source-note">

**Source:** Jepsen, [Cursor Stability](https://jepsen.io/consistency/models/cursor-stability) · © Jepsen, LLC

</aside>

Cursor stability strengthens read committed by preventing lost updates. A cursor refers to an object accessed by a transaction. Once read through a cursor, that object cannot be modified by another transaction until the cursor is released or the transaction commits. Transactions may have multiple cursors.

It is transactional and multi-object, cannot be totally available, and guarantees neither real-time nor per-process transaction order. Repeatable read is stronger because it stabilizes every record read rather than only active cursors.

### Formally

Adya defines cursor stability by prohibiting G1 and G-cursor(x): a single-object serialization graph may not contain an anti-dependency cycle with at least one write-dependency edge. It also prohibits P0 and P1, while allowing P2 and P3 where cursors are not used.

<a id="monotonic-atomic-view"></a>

## Monotonic Atomic View

<aside class="source-note">

**Source:** Jepsen, [Monotonic Atomic View](https://jepsen.io/consistency/models/monotonic-atomic-view) · © Jepsen, LLC

</aside>

Monotonic atomic view strengthens read committed by preventing a transaction from observing only some effects of a previously committed transaction. Once T2 observes any write from T1, all of T1's effects must be visible to T2. This helps preserve foreign-key constraints and keep indexes and materialized views aligned with their source objects.

It is transactional, multi-object, and totally available, but supplies neither real-time nor per-process order. Repeatable read and snapshot isolation are stronger at the cost of total availability.

### Formally

Bailis, Davidson, Fekete et al. introduced MAV. In Adya's terms it prohibits G1b intermediate reads; because it is stronger than read committed, it also prohibits P0 and P1 while allowing P2 and P3.

<a id="read-committed"></a>

## Read Committed

<aside class="source-note">

**Source:** Jepsen, [Read Committed](https://jepsen.io/consistency/models/read-committed) · © Jepsen, LLC

</aside>

Read committed strengthens read uncommitted by preventing dirty reads: transactions may not observe writes from transactions which do not commit. It is transactional, multi-object, and totally available. Monotonic atomic view offers atomic visibility without sacrificing availability; read uncommitted may offer greater performance by permitting dirty reads.

It imposes neither real-time nor per-process order and admits pathological reorderings such as always returning an initial empty state.

### Formally

Under Adya's preventative interpretation, read committed prohibits P0 dirty writes and P1 dirty reads, while allowing P2 fuzzy reads and P3 phantoms.

<a id="read-uncommitted"></a>

## Read Uncommitted

<aside class="source-note">

**Source:** Jepsen, [Read Uncommitted](https://jepsen.io/consistency/models/read-uncommitted) · © Jepsen, LLC

</aside>

Read uncommitted prohibits dirty writes, in which two transactions modify the same object concurrently before committing. Although ANSI SQL presents it as the most permissive default level, Berenson et al. argue that it should still rule out dirty writes. It is transactional, multi-object, and totally available.

It has no real-time or per-process ordering constraints and can admit pathological histories. Read committed prevents dirty reads without sacrificing total availability.

### Formally

ANSI imposes essentially no constraint at this level. Adya's preventative interpretation prohibits P0 dirty writes but allows P1 dirty reads, P2 fuzzy reads, and P3 phantoms.

<a id="monotonic-reads"></a>

## Monotonic Reads

<aside class="source-note">

**Source:** Jepsen, [Monotonic Reads](https://jepsen.io/consistency/models/monotonic-reads) · © Jepsen, LLC

</aside>

If a process performs read r1 and then r2, monotonic reads ensures r2 cannot observe a state older than the writes reflected in r1: reads cannot go backwards. It constrains only reads from the same process and can be totally available.

### Formally

For operations a, b, and c, where b and c are reads, if a is visible to b and b precedes c in the same session, then a must also be visible to c.

---

Copyright © Jepsen, LLC.
