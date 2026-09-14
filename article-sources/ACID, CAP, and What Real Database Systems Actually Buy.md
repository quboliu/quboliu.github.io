# Coordination Is the Only Currency

## ACID, CAP, and What Real Database Systems Actually Buy

*Revision 2. Incorporates corrections to the failure-detector hierarchy (§4.6), PostgreSQL quorum-commit versioning and the hot-standby serializability limitation (§5.2, §5.4), the direction of the snapshot-isolation anomaly theorem (§2.4), SQLite extended result codes (§3.4), XID arithmetic (§3.2), and SWIM attribution (§6.2); adds figures, a treatment of contention cost (§8.2), and coverage of TAPIR and MongoDB transactions (§7).*

---

## Abstract

ACID and CAP are taught together, abbreviated similarly, and share a letter — and almost none of that shared surface reflects a shared subject. ACID is a contract about *recovery and concurrency control* within a transactional system. CAP is an impossibility result about *replication of a single register* across an unreliable network. The "C" means something different in each. This article states both precisely, traces how PostgreSQL, MySQL/InnoDB, and SQLite discharge the ACID contract with three genuinely different physical designs, examines how quorums, gossip, Paxos, and Raft occupy different points in the CAP design space, and then argues that the two frameworks are unified by a single scarce resource: **coordination**. Serializability and linearizability are both purchased with round trips, blocking, and contention. Recent theory — Highly Available Transactions, invariant confluence, and the CALM theorem — tells us precisely which guarantees can be had without paying, and that boundary is the most practically useful result in the area.

**Intended reader.** This is a synthesis for engineers who already have working familiarity with transactions and replication: a senior-engineer text, not an introduction. It assumes you know what a lock and a replica are, and it moves quickly through standard material (two-phase locking, the ANSI isolation levels) in order to spend its length on the places where the standard material is wrong, incomplete, or misapplied. A reader wanting a first exposure should start with Kleppmann's *Designing Data-Intensive Applications* and return here afterward.

---

## Table of contents

1. [Two acronyms, one resource](#1-two-acronyms-one-resource)
2. [ACID as a formal contract](#2-acid-as-a-formal-contract)
3. [How single-node engines discharge the contract](#3-how-single-node-engines-discharge-the-contract)
4. [CAP, stated precisely](#4-cap-stated-precisely)
5. [The relationship: two independent axes](#5-the-relationship-two-independent-axes)
6. [Mechanisms: quorums, gossip, Paxos, Raft](#6-mechanisms-quorums-gossip-paxos-raft)
7. [Where they meet: distributed ACID](#7-where-they-meet-distributed-acid)
8. [Engineering practice](#8-engineering-practice)
9. [Verification](#9-verification)
10. [Conclusion](#10-conclusion)
11. [References](#11-references)

---

## 1. Two acronyms, one resource

A useful way to enter this subject is to notice what both frameworks are *actually* rationing.

Serializability requires that concurrent transactions produce an outcome equivalent to some serial order. Achieving it requires transactions to learn about each other — through locks, through validation at commit, through timestamp ordering. Linearizability requires that a distributed register behave as though operations occurred at single instants in real time. Achieving it requires replicas to learn about each other — through quorum intersection, through a leader, through consensus rounds.

In both cases the thing being bought is the same: **an agreement between concurrent actors about the order of events**. Isolation levels are a menu of discounts on the first purchase. Consistency models are a menu of discounts on the second.

One qualification is owed to the title, and it matters. Coordination is a single currency in the sense that the *thing* being bought is always agreement about order — but the bill arrives in at least three denominations that are not interchangeable:

- **Latency** — the round trips required before an operation can be acknowledged.
- **Availability** — the requests that must be refused when agreement cannot be reached.
- **Throughput under contention** — the serialization of conflicting operations on the same item, which no amount of hardware removes.

The third is the one most often forgotten and the one that most often bounds a real system; §8.2 treats it directly. A design can economize on one denomination while paying heavily in another, which is why "how consistent is it?" is a poorly formed question and "what does each guarantee cost us, in which denomination?" is a good one.

The disciplined engineer's job is not to buy the strongest available guarantee, nor to reflexively buy the cheapest, but to determine which of the application's invariants genuinely require coordination — and then buy exactly that much. Everything below is an elaboration of that claim.

---

## 2. ACID as a formal contract

### 2.1 Origins, and the non-orthogonality of the letters

The acronym is due to Härder and Reuter [1983], formalizing a body of work Jim Gray had developed at IBM and later Tandem. It is a mnemonic, not a theorem, and its four properties live at different layers of the system:

| Letter | What it actually is | Implemented by |
|---|---|---|
| **A**tomicity | a *logging and recovery* property | undo logging, rollback, ARIES undo phase |
| **C**onsistency | an *application-level* property | `CHECK`, `FOREIGN KEY`, `UNIQUE`, application logic |
| **I**solation | a *concurrency control* property | 2PL, MVCC, OCC, SSI |
| **D**urability | a *storage* property | write-ahead logging, `fsync`, replication |

Consistency is the odd letter out. The database can enforce declared constraints, but the invariant "no account balance may go negative across these two tables under this business rule" is maintained only if the application writes correct transactions and requests sufficient isolation. Härder and Reuter arguably included C to complete the word. This is not pedantry: the conflation of ACID's C with CAP's C is the single largest source of muddled reasoning in this field, and §5 is entirely about untangling it.

Note also that atomicity and durability, though usually mentioned in one breath, are separable. A system can be atomic but not durable (an in-memory database with rollback but no persistence). A system can be durable but not atomic (append-only logs written without transaction boundaries). Real engines implement them with the same log, which is why they are habitually conflated.

### 2.2 Serializability theory

The formal target of isolation is **serializability**: a schedule of interleaved operations is serializable if its effects are equivalent to those of *some* serial execution of the same transactions. "Some" is important — the system is not obliged to reproduce the order in which transactions arrived, only to be equivalent to a legal order. This is precisely what distinguishes serializability from linearizability, which *does* impose a real-time ordering constraint.

Testing view serializability is NP-complete, so practical systems target the stricter but tractable **conflict serializability**. Two operations conflict when they belong to different transactions, touch the same item, and at least one is a write. Build a precedence graph with a node per transaction and an edge `Ti → Tj` whenever an operation of `Ti` precedes and conflicts with an operation of `Tj`. The schedule is conflict-serializable **iff the graph is acyclic**, and any topological order of the graph is an equivalent serial order.

Every practical concurrency control mechanism is a strategy for keeping that graph acyclic:

- **Two-phase locking (2PL)** — acquire locks in a growing phase, release in a shrinking phase, never acquire after releasing. Theorem: any schedule produced by 2PL is conflict-serializable. Deadlock is the price; detection (wait-for graph) or prevention (wound-wait, wait-die) is required.
- **Timestamp ordering** — assign each transaction a timestamp and abort any operation that would create a backward edge.
- **Optimistic concurrency control (OCC)** — execute against a private workspace, validate at commit against concurrent committers, abort on conflict. Cheap under low contention, unstable under high contention (§8.2).
- **Multiversion concurrency control (MVCC)** — keep old versions so readers never block writers and writers never block readers. MVCC alone gives snapshot isolation, *not* serializability; the gap is the subject of §2.3.

A second, orthogonal hierarchy governs what happens when transactions abort:

- **Recoverable** — a transaction commits only after every transaction whose writes it read has committed. Without this, a commit may need to be undone, which is impossible.
- **Avoids cascading aborts (ACA)** — a transaction only reads committed data, so an abort never forces other aborts.
- **Strict** — no transaction reads or overwrites an item written by an uncommitted transaction. Strictness makes physical undo possible using before-images.

**Strict 2PL** — hold every lock until commit or abort — produces schedules that are conflict-serializable *and* strict, which is why it dominated the first generation of relational engines. MVCC systems achieve recoverability differently: readers see only committed versions by construction.

### 2.3 The ANSI hierarchy is broken

The SQL-92 standard defined isolation levels by the anomalies they forbid:

| Level | Dirty read | Non-repeatable read | Phantom |
|---|---|---|---|
| Read uncommitted | possible | possible | possible |
| Read committed | prevented | possible | possible |
| Repeatable read | prevented | prevented | possible |
| Serializable | prevented | prevented | prevented |

Berenson, Bernstein, Gray, Melton, and the O'Neils [1995] showed these definitions to be both ambiguous and incomplete. Two problems:

**The phenomena are ambiguous.** Each can be read "loosely" (the anomalous outcome actually occurred) or "strictly" (the interleaving that *could* produce it occurred). Under the strict reading, forbidding the three phenomena does imply serializability; under the loose reading it does not. The standard does not say which it means.

**Snapshot isolation does not fit anywhere in the hierarchy.** Under SI a transaction reads from a consistent snapshot taken at start and commits only if no concurrent transaction wrote any item it wrote (first-committer-wins). SI forbids dirty reads, non-repeatable reads, and phantoms — so by the ANSI table it is "serializable" — yet it is demonstrably not serializable.

The anomaly SI permits is **write skew**. The canonical example:

```
Invariant: at least one doctor must remain on call.

Initial state: Alice on_call = true, Bob on_call = true

T1 (Alice)                        T2 (Bob)
------------------------          ------------------------
SELECT count(*) WHERE on_call
  -> 2                            SELECT count(*) WHERE on_call
                                    -> 2
UPDATE Alice SET on_call=false
                                  UPDATE Bob SET on_call=false
COMMIT                            COMMIT

Final state: nobody on call. No write-write conflict occurred.
```

Both transactions read overlapping data and wrote *disjoint* data, so no write-write conflict fired and neither aborted. The invariant is now broken and the database is unaware. Every read-check-then-write pattern over a set — a balance constraint spanning two accounts, seat inventory, a uniqueness check performed in application code, a resource quota — is a candidate for this bug, and it appears under the default isolation level of many production systems.

Write skew deserves to be internalized precisely because it is invisible in testing at low concurrency and raises no error at any point.

### 2.4 Adya's formalism, and the shape of the anomaly

Berenson et al. still defined levels in terms of prohibited interleavings, which ties the definition to a particular implementation style. Adya's dissertation [1999] gave implementation-independent definitions using a **direct serialization graph** with three edge types:

- **ww (write-depends)** — `Ti` writes a version of `x`, `Tj` writes the next version.
- **wr (read-depends)** — `Ti` writes a version of `x`, `Tj` reads it.
- **rw (anti-depends)** — `Ti` reads a version of `x`, `Tj` writes the next version.

Isolation levels then correspond to which cycles are forbidden in this graph. Serializability forbids all cycles. The write-skew example above is exactly a two-node cycle in which *both* edges are rw:

```
FIGURE 1 — write skew as a dependency cycle

                        rw
              +-------------------->
        T1                              T2
              <--------------------+
                        rw

  T1 --rw--> T2 :  T1 read Bob's row; T2 then wrote it
  T2 --rw--> T1 :  T2 read Alice's row; T1 then wrote it

  No ww edge exists (the write sets are disjoint), which is exactly
  why snapshot isolation's first-committer-wins check does not fire.
```

The general theorem, from Fekete et al. [2005] and used by Cahill, Röhm, and Fekete [2008], runs in the direction of *necessity*: **every non-serializable execution under snapshot isolation contains a cycle with two consecutive rw edges**, where the transaction at the head of the outgoing edge commits first. The structure is necessary but not sufficient — some executions containing it are perfectly serializable. That asymmetry is not a footnote; it is the reason PostgreSQL's SSI has false-positive aborts, and it is what makes the retry loop of §3.2 mandatory rather than defensive.

```
FIGURE 2 — the dangerous structure SSI watches for

              rw                    rw
     Tin ------------> Tpivot ------------> Tout
                                              |
                                       commits first

  Necessary condition for an SI anomaly, not a sufficient one.
  SSI aborts a participant whenever the structure appears, and is
  therefore conservative: some aborted transactions were serializable.
```

This formalism is what modern verification tooling — notably Jepsen's Elle checker [Kingsbury & Alvaro 2020] — uses to infer anomalies from black-box observations.

### 2.5 Durability is relative to a failure model

"Committed data survives" is meaningless until you name what it survives. A rough ladder:

| Guarantee | Survives | Typical mechanism |
|---|---|---|
| Process durability | application crash | `write()` to page cache |
| Machine durability | OS panic, power loss | `fsync()` / `fdatasync()` to stable media |
| Media durability | disk failure | RAID, checksums, replication |
| Site durability | rack or datacenter loss | synchronous cross-AZ replication |
| Geographic durability | regional outage | cross-region replication, commit-wait |

Each rung costs roughly an order of magnitude more latency than the one below. This is where ACID's D quietly becomes a distributed systems problem — and therefore where CAP starts to apply to systems that claim only to be "an ACID database." §5.4 returns to this.

Durability also rests on assumptions that hardware and kernels do not always honor. The **fsyncgate** episode (2018) is the canonical illustration: on Linux, an `fsync()` that failed could clear the error state and mark the affected page clean, so a *retry* of `fsync()` returned success while the data was permanently lost. PostgreSQL's fix was to treat an `fsync()` failure as a `PANIC`, forcing a crash and full recovery from the WAL rather than trusting a possibly-lying kernel. Similar hazards exist with drives that acknowledge writes into a volatile cache, with virtualized block devices, and with network filesystems.

---

## 3. How single-node engines discharge the contract

### 3.1 The common substrate: ARIES

Nearly every durable transactional engine is a variation on **ARIES** [Mohan et al. 1992]. Its rules are worth stating precisely, because the differences between PostgreSQL, InnoDB, and SQLite are best understood as different choices within this frame.

**The write-ahead logging rule.** Before a modified data page may be written to disk, the log record describing that modification must already be on stable storage. Before a transaction may be reported committed, its commit record must be on stable storage.

**Buffer management policy determines which logs you need.** Two independent axes:

| | **Force** (flush dirty pages at commit) | **No-force** (don't) |
|---|---|---|
| **No-steal** (never flush uncommitted pages) | no undo, no redo — but terrible performance | redo only |
| **Steal** (may flush uncommitted pages) | undo only | **undo + redo** |

ARIES chooses **steal + no-force**, the highest-performance corner, which is why it needs both undo and redo information. Steal lets the buffer pool evict whatever it likes under memory pressure; no-force turns commit into a small sequential log write instead of scattered random page writes.

**Recovery is three passes:**

1. **Analysis.** Scan forward from the last checkpoint to reconstruct the dirty page table (which pages may have unflushed changes, and from which LSN) and the transaction table (which transactions were in flight).
2. **Redo — "repeat history."** Replay *every* logged change from the earliest dirty-page LSN forward, including changes made by transactions that will subsequently be rolled back. This is the counter-intuitive and essential part: it restores the exact pre-crash page state, so that undo can operate on a well-defined starting point. Idempotence comes from per-page LSNs — if `page.pageLSN >= record.LSN`, the change is already present, skip it.
3. **Undo.** Roll back the losers, writing **compensation log records (CLRs)** for each undone action. A CLR carries an `UndoNxtLSN` pointer to the next record still needing undo, so a crash *during* recovery never re-undoes work already undone. Undo therefore becomes idempotent and restartable — without CLRs, repeated crashes during recovery can corrupt the database.

Everything below is a variation on this theme.

### 3.2 PostgreSQL

**Version storage: in the heap.** PostgreSQL implements MVCC by keeping every row version in the table's own heap. Each tuple header carries `xmin` (the transaction that created it) and `xmax` (the transaction that deleted or superseded it). An `UPDATE` is physically an insert of a new tuple plus a mark on the old one.

**Snapshots and visibility.** A snapshot is essentially the triple `(xmin, xmax, xip_list)` — the oldest still-running transaction, the next unassigned XID, and the set of in-flight XIDs. A tuple is visible if its `xmin` committed before the snapshot and its `xmax` either does not exist or belongs to a transaction not visible in the snapshot. Commit status lives in the commit log (`pg_xact`, formerly CLOG) — two bits per transaction — and is cached back into tuple headers as *hint bits* to avoid repeated CLOG lookups.

**The design's consequences are its entire operational personality.** Rollback is nearly free: mark the XID aborted in CLOG and stop; the previous versions are already in place and immediately become current again. But cleanup is deferred, and this produces:

- `VACUUM`, which reclaims dead tuples and updates the free space map. Without it, tables and indexes bloat indefinitely.
- **Transaction ID wraparound.** XIDs are 32-bit and compared using modulo-2³² arithmetic, with a comparison window of 2³¹ in each direction: the 2³¹ XIDs "behind" the current one are treated as past and the 2³¹ "ahead" as future. Tuples must therefore be *frozen* before their creating XID falls out of that window and begins to look like the future. Anti-wraparound vacuums are non-negotiable and can be operationally disruptive on very large tables.
- Long-running transactions hold back the global vacuum horizon, so one forgotten `BEGIN` in a reporting session can bloat the entire cluster.

**Isolation levels.** PostgreSQL offers three effective levels (requesting `READ UNCOMMITTED` yields read-committed behavior, since MVCC makes dirty reads structurally impossible):

- **`READ COMMITTED`** (default) — a *fresh snapshot per statement*. Within one transaction, two identical `SELECT`s can return different rows. `UPDATE` statements that find a row concurrently modified re-evaluate their `WHERE` clause against the new version ("EvalPlanQual"), which is a subtle source of surprise.
- **`REPEATABLE READ`** — true snapshot isolation: one snapshot for the whole transaction, first-updater-wins, losers receive `40001 serialization_failure`. Note this is *stronger* than ANSI RR: phantoms are impossible. It still permits write skew.
- **`SERIALIZABLE`** — **Serializable Snapshot Isolation (SSI)**, based on Cahill, Röhm, and Fekete [2008] and shipped in PostgreSQL 9.1 [Ports & Grittner 2012].

SSI is worth examining closely, because it is the clearest production implementation of the dependency-graph theory in §2.4. It runs snapshot isolation and additionally tracks rw-antidependencies, looking for the structure in Figure 2. Reads are recorded using **SIREAD locks**, which are not locks at all: they never block anything, they only mark what was read, including predicate ranges at page or tuple granularity. When the dangerous structure forms, one transaction is aborted with a serialization failure.

The properties that follow:

- Readers never block, writers never block readers — the SI performance profile is retained.
- Because the dangerous structure is necessary but not sufficient (§2.4), the check is **conservative**: some aborted transactions would have been serializable. **Applications must implement retry loops.** This is not optional; it is the API.
- Read-only transactions can sometimes be proven safe (the "safe snapshot" optimization) and then run with zero overhead, which is why `SET TRANSACTION READ ONLY DEFERRABLE` exists.

One limitation matters for §5.2 and is easy to miss: **`SERIALIZABLE` is not available on a hot standby.** SSI's conflict detection requires information that is not propagated to replicas, and PostgreSQL rejects the request outright with `ERROR: cannot use serializable mode in a hot standby`, hinting at `REPEATABLE READ` instead. Read-only workloads offloaded to a replica therefore run at snapshot isolation at best, no matter what the primary is configured for.

**Durability.** WAL with configurable synchrony:

| `synchronous_commit` | Commit returns after | Loses on |
|---|---|---|
| `off` | WAL is in the buffer | up to `3 × wal_writer_delay` of recent commits on crash |
| `local` | local WAL `fsync` | local disk failure |
| `remote_write` | standby has `write()`n WAL | standby OS crash |
| `on` (default) | standby has `fsync`'d WAL | standby disk failure |
| `remote_apply` | standby has *replayed* WAL | — (also gives read-your-writes on the standby) |

`full_page_writes` protects against torn pages by logging a complete image of each page on its first modification after a checkpoint — the alternative to InnoDB's doublewrite buffer. Two-phase commit is available via `PREPARE TRANSACTION` for external coordinators.

Notice that the last three rows of that table are *distributed systems settings inside an "ACID database."* This is the seam where CAP enters.

### 3.3 MySQL / InnoDB

**Version storage: undo logs.** InnoDB takes the opposite approach. Each clustered-index row carries `DB_TRX_ID` (last modifying transaction) and `DB_ROLL_PTR` (a pointer into the undo log). A read view walks the undo chain backward, reconstructing the version it is entitled to see. The current row in the index is always the newest version.

The trade-off mirrors PostgreSQL's exactly, with the pain relocated:

- Rollback is *real physical work* — the undo records must be applied in reverse.
- There is no `VACUUM`, but there *is* a purge thread, and long-running transactions pin undo records so that the **history list length** grows without bound. The failure mode is undo tablespace growth and degraded read performance rather than heap bloat, but the root cause — an old open transaction — is identical.

**Physical layout matters for locking.** Rows live in the primary key B+tree (an index-organized table); secondary indexes store primary key values, so a non-covering secondary index lookup requires a second traversal. Crucially, **InnoDB locks index records, not rows**. This is why a query with a poor index plan can lock vastly more than it appears to touch.

Lock types:

- **Record lock** — on an index record.
- **Gap lock** — on the open interval *between* index records, blocking insertions.
- **Next-key lock** — record + preceding gap. This is the default under `REPEATABLE READ` and is how InnoDB prevents phantoms for locking reads.

**InnoDB's `REPEATABLE READ` (the default) has a split personality** that deserves explicit warning. Plain `SELECT` performs a *consistent non-locking read* from the transaction's snapshot. But `SELECT ... FOR UPDATE`, `SELECT ... LOCK IN SHARE MODE`, `UPDATE`, and `DELETE` perform *locking reads*, which see the **latest committed version**, not your snapshot. Consequences:

```sql
-- Session A, REPEATABLE READ
BEGIN;
SELECT COUNT(*) FROM t WHERE status = 'new';   -- returns 5 (snapshot)
                                                -- Session B inserts a row, commits
UPDATE t SET status = 'done' WHERE status = 'new';  -- affects 6 rows!
SELECT COUNT(*) FROM t WHERE status = 'done';  -- now sees 6
```

Further, unlike PostgreSQL, InnoDB does **not** abort the loser of a concurrent update. It blocks, and once the lock is released it re-reads and applies to the new version. A single `UPDATE t SET n = n + 1` is therefore safe, but a read-modify-write spanning two statements can silently lose an update unless the read takes `FOR UPDATE`.

**`SERIALIZABLE` in InnoDB is not SSI.** It is `REPEATABLE READ` plus an implicit `LOCK IN SHARE MODE` on every plain `SELECT` — effectively strict two-phase locking over the index space, with next-key locks covering phantoms. This is genuinely serializable, but pessimistic: expect blocking and deadlocks rather than optimistic retries. The two engines therefore sit at opposite ends of the classic spectrum, and the application-level consequence differs completely: PostgreSQL demands retry loops, InnoDB demands lock-ordering discipline and deadlock handling.

**Durability, and the two-log problem.** InnoDB has a redo log; the server layer has a binary log used for replication and point-in-time recovery. These must agree — a transaction present in one but not the other is a correctness bug that surfaces as a diverged replica. MySQL solves this with an **internal XA two-phase commit**: prepare in InnoDB (flush redo), write to the binlog, then commit in InnoDB. Group commit batches the `fsync`s across concurrent transactions to make the cost bearable.

The knobs:

- `innodb_flush_log_at_trx_commit` — `1` = write and `fsync` per commit (ACID); `2` = write to the OS page cache each commit, `fsync` about once a second (survives process crash, not power loss); `0` = both deferred.
- `sync_binlog` — `1` = `fsync` the binlog per commit. Setting either to a non-durable value while advertising ACID is a common and consequential misconfiguration.

**Doublewrite buffer.** Before writing a page to its final location, InnoDB writes it to a contiguous scratch area and `fsync`s. If a crash tears the page in place, recovery reconstructs it from the doublewrite copy. This solves the same problem as PostgreSQL's `full_page_writes` with a different cost curve: a fixed 2× page-write amplification instead of WAL volume that spikes after each checkpoint.

### 3.4 SQLite

SQLite is the most instructive of the three, because it obtains a *stronger* isolation guarantee than either of the others with almost no concurrency control machinery. The mechanism is simply: **one writer at a time, database-wide.** Since all writes are totally ordered by construction and readers observe consistent snapshots, SQLite's isolation is serializable by design rather than by algorithm.

**Rollback journal mode** (the classic default) is an *undo* design:

1. Acquire a `RESERVED` lock; copy each page about to be modified into `<db>-journal`.
2. `fsync` the journal (and its directory entry).
3. Escalate to `EXCLUSIVE`; modify the database file in place.
4. `fsync` the database file.
5. Commit by deleting or zeroing the journal header.

Recovery is trivial: if a journal exists at open time, copy its pages back. Locking escalates through `UNLOCKED → SHARED → RESERVED → PENDING → EXCLUSIVE`, where `PENDING` prevents new readers from starving a waiting writer.

**WAL mode** (since 3.7.0, 2010) is a *redo* design and inverts the concurrency picture:

- Modified pages are appended to `<db>-wal` rather than written in place.
- A shared-memory index (`<db>-shm`) maps page numbers to their most recent frame in the WAL.
- Each reader records an end mark at start and reads only frames at or before it — genuine snapshot isolation.
- **One writer and many concurrent readers can proceed simultaneously**, which is the main reason to choose it.
- A checkpoint transfers WAL frames back into the main database file.

Two traps that bite in production:

**Deferred transactions and the snapshot-upgrade failure.** A plain `BEGIN` is deferred: no lock is taken until the first statement. A transaction that reads first and writes later must *upgrade*, and if another writer committed in between, SQLite returns **`SQLITE_BUSY_SNAPSHOT`** — an extended result code of `SQLITE_BUSY` — because the transaction's snapshot is now stale and cannot be extended. The busy handler is *not* invoked for this case, so `busy_timeout` does not help; the transaction must be rolled back and retried from the beginning. The correct pattern for read-modify-write is `BEGIN IMMEDIATE`, which takes the write lock upfront and turns the failure into ordinary contention that `busy_timeout` can absorb.

**`PRAGMA synchronous` in WAL mode.** With `synchronous = NORMAL` — a very commonly recommended setting — WAL mode does **not** `fsync` at commit, only at checkpoint. This survives a process crash but *not* a power failure or OS panic. `FULL` restores commit-time durability. The default configuration many applications ship with is therefore not durable in the sense most of their developers believe.

Underneath everything, SQLite's atomicity rests on documented assumptions about the platform: that a sector write is atomic, that `fsync` is honest, and — where enabled — "powersafe overwrite" (that writing to one part of a sector does not damage the rest). These assumptions have historically been violated by consumer SSDs, some network filesystems, and several mobile platforms.

### 3.5 Comparison, and a conservation law

| | PostgreSQL | InnoDB | SQLite |
|---|---|---|---|
| MVCC version location | in the heap | undo log | WAL / journal |
| Rollback cost | O(1), just mark aborted | proportional to work done | proportional to work done |
| Deferred cost | `VACUUM`, bloat, XID wraparound | purge lag, history list growth | checkpointing, WAL growth |
| Default isolation | read committed | repeatable read | serializable |
| Strongest isolation | SSI (optimistic, aborts) | 2PL (pessimistic, blocks) | single-writer serialization |
| Application must handle | serialization retries | deadlocks, lock ordering | `SQLITE_BUSY[_SNAPSHOT]` |
| Phantom prevention | predicate SIREAD locks | next-key locks | irrelevant (one writer) |
| Torn-page protection | full page writes | doublewrite buffer | journal / WAL |
| Write concurrency | high | high | one writer |

The pattern worth extracting: **the total amount of work is roughly conserved; only its scheduling differs.** PostgreSQL defers version cleanup to a background process and pays in bloat and vacuum tuning. InnoDB pays at rollback and purge time. SQLite refuses the problem entirely by admitting one writer. There is no design here that is free — each has chosen where to put the cost, and the operational war stories you encounter with these engines trace directly back to that choice.

---

## 4. CAP, stated precisely

### 4.1 The theorem

Brewer conjectured it in a PODC 2000 keynote; Gilbert and Lynch [2002] proved it. Their formal statement, with each term meaning something specific:

> In an asynchronous network model, it is impossible to implement a read/write register that guarantees both **atomic** (linearizable) behavior and **availability** in the presence of arbitrary message loss.

- **Consistency** = *linearizability* of a single object: every operation appears to take effect atomically at some instant between its invocation and its response, and that order is consistent with real time. If a write completes and a read begins afterward, the read must observe that write or a later one.
- **Availability** = *every request received by a non-failing node must eventually return a non-error response*. This is a very strong requirement, as §4.3 stresses.
- **Partition tolerance** = the system continues to operate when arbitrary messages between nodes are dropped.

The proof is nearly trivial and its triviality is the point. Partition the nodes into `G₁` and `G₂` with all messages between them lost. Write `v₁` to a node in `G₁`; by availability it must return. Then read from a node in `G₂`; by availability it must return, and it cannot possibly have learned about `v₁`. It returns a stale value. Linearizability is violated. ∎

### 4.2 Partitions are not a design choice

The popular "pick two of three" formulation is actively misleading. You do not choose whether partitions occur — the network chooses, through switch failures, misconfigured firewalls, GC pauses that are indistinguishable from partitions, asymmetric routes, and cable cuts. Any system deployed across more than one machine must therefore tolerate P. The genuine decision is:

> **When a partition occurs, do you sacrifice consistency or availability?**

And, equally important: **in the absence of a partition, you can have both.** A well-run Raft cluster in a single datacenter is linearizable and available essentially all the time. CAP is a statement about behavior in a rare regime, not a permanent tax.

Brewer's own retrospective, *CAP Twelve Years Later* [2012], reframed the useful engineering question as explicit **partition management** in three phases: detect that a partition has begun; enter a defined *partition mode* in which some operations are restricted, deferred, or logged for later; and on healing, execute a *recovery* procedure that merges state and runs compensations for any invariants violated while degraded. This is a far more actionable framing than a Venn diagram.

### 4.3 CAP's "A" is much stronger than "highly available"

CAP availability requires that *every* request to *every* non-failed node succeed. Under this definition:

- A Raft or Paxos cluster requiring a majority is **CP**, not AP — even a 5-node cluster tolerating two failures. A minority-side node that is partitioned away must refuse requests.
- A system is "available" in the CAP sense only if a single surviving node can serve reads *and* writes with no communication.

Meanwhile, a Raft cluster's *practical* availability may exceed that of an AP system with a poorly-managed operational story. **CAP availability and operational availability are different metrics**, and conflating them produces the common error of assuming "CP" means "goes down a lot."

Fox and Brewer's earlier **harvest and yield** framing [1999] provides better vocabulary than binary availability:

- **Yield** — the fraction of requests answered successfully.
- **Harvest** — the fraction of the data reflected in an answer.

A search engine under partial failure degrades harvest (it answers from 90% of the index and says nothing). A payments ledger degrades yield (it refuses the transaction rather than answering from partial data). Deciding *which* to degrade, per endpoint, is a more productive conversation than "are we CP or AP."

### 4.4 CAP says nothing about latency — PACELC does

CAP is silent on the common case, which is where all your cost lives. Abadi's **PACELC** [2012] extends it:

> **If (P)artition, then (A)vailability or (C)onsistency; (E)lse, (L)atency or (C)onsistency.**

The "else" clause is the one that governs daily engineering. A system that wants strong consistency must coordinate on every operation, and coordination costs at least one network round trip — which, across regions, is bounded below by the speed of light.

| System | PACELC | Reading |
|---|---|---|
| Dynamo, Cassandra, Riak | **PA/EL** | available under partition, low latency otherwise |
| HBase, BigTable, etcd, ZooKeeper | **PC/EC** | consistent always, pay the coordination latency |
| Spanner | **PC/EC** | consistent always, but engineered so L is small |
| MongoDB (typical config) | **PA/EC** | favors availability under partition, consistency otherwise |
| MySQL async replication | **PA/EL** | replicas lag; failover can lose committed writes |

### 4.5 The consistency-model hierarchy

"Consistent or eventually consistent" is a false dichotomy. The real landscape, from strongest to weakest:

| Model | Guarantee | Available under partition? |
|---|---|---|
| **Strict serializability** | serializable + real-time order across transactions | no |
| **Linearizability** | single-object, real-time order | no |
| **Sequential consistency** | one global order, respects per-process order, not real time | no |
| **Causal+ consistency** | causally related ops seen in order; replicas converge | **yes** (with sticky sessions) |
| **Session guarantees** | read-your-writes, monotonic reads, monotonic writes, writes-follow-reads | **yes** (sticky) |
| **Eventual consistency** | replicas converge if updates stop | yes |

The session guarantees come from Terry et al.'s Bayou work [1994] and are frequently the right target: "read your writes" is what users actually notice, and it is achievable without global coordination by pinning a session to a replica or carrying a version token.

A significant theoretical result: **causal consistency is the strongest model achievable in an always-available, convergent system** [Mahajan, Alvisi, Dahlin 2011]. If you require total availability under partition, causal+ is the ceiling. Everything above it requires a quorum.

### 4.6 FLP: the deeper impossibility

CAP is not the only impossibility result in play, and arguably not the most fundamental. The **FLP result** [Fischer, Lynch, Paterson 1985] states that in a fully asynchronous system, no deterministic protocol can solve consensus with even a single crash failure, because it is impossible to distinguish a crashed process from a slow one.

Practical consensus protocols escape FLP not by violating it but by weakening the model:

- **Partial synchrony** [Dwork, Lynch, Stockmeyer 1988] — the network is eventually synchronous after some unknown global stabilization time.
- **Failure detectors** — Chandra and Toueg [1996] showed that an eventually-strong detector ◇S, together with a majority of correct processes, is *sufficient* to solve consensus. The *weakest* detector sufficient for consensus is the eventually-weak ◇W [Chandra, Hadzilacos, Toueg 1996]; the same work shows ◇W can be transformed into ◇S, so the two are equivalent in power. Practical heartbeat- and timeout-based detectors are approximations of this family.
- **Randomization** (Ben-Or) — randomized backoff or coin flips give termination with probability 1.

The engineering consequence is precise and important: **Paxos and Raft guarantee safety unconditionally and liveness only conditionally.** A pathological network cannot cause them to return a wrong answer; it can only cause them to stop making progress. That asymmetry is a deliberate design choice, and every timeout constant in an etcd or Raft configuration is a liveness knob that cannot compromise safety.

---

## 5. The relationship: two independent axes

### 5.1 The two C's are different words

To restate the central confusion plainly:

| | ACID's C | CAP's C |
|---|---|---|
| Scope | application invariants across many objects | one object |
| Enforced by | constraints + correct transactions + sufficient isolation | replication protocol |
| Real-time requirement | none | yes |
| What violates it | a buggy transaction, or write skew under weak isolation | a stale read from a lagging replica |

They are not weaker and stronger versions of each other; they are unrelated properties that share a letter.

Likewise, **serializability and linearizability are orthogonal**:

- Serializability is a *multi-object* property with *no real-time* requirement. A serializable execution may be equivalent to a serial order that bears no relation to wall-clock order.
- Linearizability is a *single-object* property with a *strict real-time* requirement.
- **Strict serializability** is their conjunction, and it is what systems like Spanner mean by "external consistency."

### 5.2 The two-axis model

Rows are **recency** (how current a replica's view is); columns are **transaction isolation** (how transactions interleave). Both increase in strength upward and rightward.

| ↑ recency \ isolation → | none / single-key | read committed | snapshot | serializable |
|---|---|---|---|---|
| **linearizable** | etcd; ZooKeeper with `sync`; HBase per row | — | TiDB (Percolator SI over a global timestamp oracle); *trivially*, any single-node DB at RR | **Spanner, CockroachDB, FoundationDB** — strict serializability; *trivially*, single-node PostgreSQL at `SERIALIZABLE` |
| **sequential** | ZooKeeper default (local) reads | — | — | — |
| **causal** | Riak with causal context; Dynamo with vector clocks | MongoDB causal-consistent sessions | MongoDB transactions with snapshot `readConcern` in a causal session | — |
| **eventual** | Cassandra, Dynamo defaults | async read replica at RC (MySQL, PostgreSQL) | async read replica at RR/SI; PostgreSQL hot standby (see below) | Spanner stale snapshot reads; CockroachDB `AS OF SYSTEM TIME`; follower reads generally |

The empty cells are not accidents, and reading them is as informative as reading the filled ones. The top-middle cells are empty because **once you have paid for a global order strong enough to give linearizability, throttling back to read committed buys nothing** — you already own the expensive part. The sequential row is nearly empty because sequential-but-not-linearizable is a narrow band few systems target on purpose; ZooKeeper lands there as a side effect of serving reads locally, not as a design goal. And the causal/serializable cell is empty for the reason §5.3 makes precise: serializability is not achievable while remaining available, so a system that has given up availability has no reason to stop at causal recency.

Two entries are marked *trivially* because they hold by degenerate argument: with a single copy there is nothing to be stale relative to, so linearizability comes free. They are included because that degenerate case is exactly what most developers' intuitions are built on, and it is what breaks the moment a replica is added.

Four corners worth naming:

- **Bottom-left** — eventually consistent, no transactions. Dynamo-style stores in their default configuration.
- **Top-left** — linearizable but non-transactional. etcd's compare-and-swap on a single key is linearizable; it has no multi-object isolation to speak of.
- **Bottom-right** — serializable but arbitrarily stale.
- **Top-right** — strict serializability, the conjunction of both axes at full strength.

The bottom-right corner is the one that surprises people, and it deserves a precise example rather than a hand-wave, because the obvious example does not work. **A PostgreSQL hot standby cannot run `SERIALIZABLE` at all** — the request is rejected outright (§3.2) — so "a serializable read replica" is not a thing you can build with stock streaming replication. The honest examples are systems that offer serializability *and* deliberately expose a stale read timestamp: Spanner's snapshot reads at a past timestamp, CockroachDB's `AS OF SYSTEM TIME` and bounded-staleness follower reads, YugabyteDB's follower reads. These are fully serializable — the transactions they run are equivalent to a serial order — and arbitrarily behind real time. They exist precisely because serializability has no recency requirement, and vendors sell that gap as a latency feature.

The practical lesson generalizes past the corner case: a team that moves reporting queries to a replica has weakened *recency*, not isolation, and will see a dashboard contradict the primary no matter what isolation level is configured. The two axes fail independently, and they need to be reasoned about independently.

### 5.3 The precise boundary: HAT, I-confluence, and CALM

The genuinely deep connection between ACID and CAP is that recent theory tells us *exactly* which transactional guarantees survive a requirement of total availability.

**Highly Available Transactions** [Bailis et al. 2013] asks which isolation levels can be provided by a system that never refuses a request, even under partition. The answer:

| **HAT-achievable** | **Not achievable (require unavailability)** |
|---|---|
| Read uncommitted | Serializability |
| Read committed | Snapshot isolation |
| Monotonic atomic view | Repeatable read (cursor stability, etc.) |
| Item cut isolation | Linearizable / strong session guarantees |
| Read-your-writes* | Unique constraints |
| Causal consistency* | Foreign keys with cascading delete |
| Atomic visibility of transactions | `AUTO_INCREMENT` / global counters |

*(\* require "sticky availability" — the client must keep talking to the same replica.)*

This is the answer to "how do ACID and CAP relate," stated as a theorem rather than a vibe: **the isolation levels most systems already run by default are precisely the ones compatible with CAP availability, and the ones people request when they want correctness are precisely the ones that are not.**

**Invariant confluence** [Bailis et al. 2015] sharpens this from isolation levels to individual invariants. An invariant is *I-confluent* if, whenever two states independently satisfy it, their merge also satisfies it. I-confluent invariants can be maintained with **zero coordination**; non-I-confluent ones provably cannot.

| Invariant | I-confluent? | Why |
|---|---|---|
| `balance ≥ 0`, deposits only | yes | merging two increments preserves it |
| `balance ≥ 0`, withdrawals allowed | **no** | two valid withdrawals can merge into an overdraft |
| Foreign key on insert | yes | insert the parent, then the child; merges preserve it |
| Foreign key with cascading delete | **no** | delete parent on one side, insert child on the other |
| Unique username | **no** | two replicas each accept the same name |
| Append to a set | yes | set union is a merge |
| `AUTO_INCREMENT` uniqueness | **no** | requires a global sequence |

The practical procedure this suggests is concrete: *enumerate your application's invariants and classify them*. In most real applications the overwhelming majority are I-confluent, and the handful that are not — uniqueness, non-negative inventory, monetary conservation — are the only places you need to buy coordination. Buying it globally, for every operation, because "we need ACID," is overpaying by orders of magnitude.

**The CALM theorem** (conjectured by Hellerstein 2010, proved by Ameloot, Neven, and Van den Bussche; see Hellerstein & Alvaro 2020) generalizes further: *a program has a consistent, coordination-free distributed implementation if and only if it is monotonic* — that is, if adding more input never retracts previously derived output. Monotone logic (unions, joins, appends, CRDT merges) needs no coordination. Non-monotone operations (negation, aggregation to a final answer, "is this set complete?", uniqueness checks) require it. This tells you that "have we seen everything?" is *the* fundamental non-monotone question, and that every coordination protocol is ultimately an answer to it.

### 5.4 CAP applies to your ACID database too

The most common practical error is assuming CAP is about NoSQL. It is about replication, and every production relational database is replicated.

**PostgreSQL synchronous replication.** Set `synchronous_standby_names = 'standby1'` with `synchronous_commit = on`. You now have a CP system: if `standby1` is partitioned away, commits **block indefinitely**. That is the correct behavior — it is what "no data loss" means — but if you did not intend to trade availability for it, you have accidentally chosen CP.

The mitigation is quorum commit, and its history is worth getting right because the two features are often confused. PostgreSQL 9.6 introduced support for *multiple* synchronous standbys, but with priority semantics: `synchronous_standby_names = '2 (s1, s2, s3)'` waits for the two highest-priority available standbys. **True quorum commit — the `ANY n (...)` syntax, alongside an explicit `FIRST n (...)` for the older priority behavior — arrived in PostgreSQL 10.** With `ANY 1 (s1, s2, s3)`, a commit needs an acknowledgment from any one of three standbys, so the loss of a single standby does not stall the primary. That is the configuration that converts a brittle CP setup into a robust one, and it is a version-10 feature, not a 9.6 one.

**MySQL semi-synchronous replication** contains a sharper trap. Semi-sync waits for at least one replica to acknowledge before returning to the client. But on timeout it **silently degrades to asynchronous** and continues. The system therefore advertises CP and, under exactly the conditions where it matters, becomes AP without telling anyone — and any subsequent failover can lose acknowledged commits. Setting `rpl_semi_sync_master_wait_point = AFTER_SYNC` (lossless semi-sync) closes the window in which a commit becomes visible before it is replicated, but the degradation-on-timeout behavior is a policy decision that must be made consciously and monitored.

**Failover is a consensus problem hiding inside your relational database.** Deciding which node is the primary, in a way that never produces two primaries, is exactly the problem Paxos and Raft solve. This is why production PostgreSQL high-availability stacks (Patroni, Stolon) delegate leader election to etcd, Consul, or ZooKeeper. The "ACID database" and the "consensus system" are not separate worlds; the second is load-bearing infrastructure for the first.

---

## 6. Mechanisms: quorums, gossip, Paxos, Raft

These four are frequently listed together as "how CAP is implemented," but they are not peers. Quorums are a *primitive*. Gossip is a *dissemination and failure-detection* substrate. Paxos and Raft are *consensus protocols* built on quorums. Understanding what each does and does not provide is most of the battle.

### 6.1 Quorums

**The intersection principle.** With `N` replicas, a write quorum `W`, and a read quorum `R`, the condition

```
R + W > N
```

guarantees that any read set and any write set share at least one replica, so a read always contacts at least one node holding the latest write. Additionally,

```
W > N/2
```

prevents two concurrent writes from both succeeding without overlapping. The idea dates to Thomas's majority consensus [1979] and Gifford's weighted voting [1979].

Common configurations for `N = 3`:

| R | W | Property |
|---|---|---|
| 1 | 3 | fast reads, writes fail if any replica is down |
| 3 | 1 | fast writes, reads fail if any replica is down |
| 2 | 2 | balanced; tolerates one failure on both paths |
| 1 | 1 | **eventual consistency** — no intersection guarantee |

**A crucial and widely missed point: quorum reads and writes alone are not linearizable.** The intersection guarantees a read *sees* the latest completed write, but consider a write in progress that has reached one replica of three. A read with `R = 2` may contact that replica and return the new value; a *subsequent* read may contact the other two and return the old value. Values go forward and then backward — not linearizable, despite `R + W > N`.

The fix is the **ABD algorithm** [Attiya, Bar-Noy, Dolev 1995], which implements a linearizable read/write register over message passing in two phases:

1. **Read phase** — query a quorum, take the value with the highest timestamp.
2. **Write-back phase** — write that value back to a quorum *before returning it*.

The write-back makes the read's observation durable, so no later read can regress. This is why "just use quorums" does not give you linearizability, and why systems that need it either implement ABD-style write-back or route reads through a consensus leader.

**Sloppy quorums and hinted handoff** [DeCandia et al. 2007] deliberately break the intersection guarantee to buy availability. If the `N` "home" nodes for a key are unreachable, writes go to the first `W` reachable nodes in the ring instead, each holding a *hint* about the intended destination. When the home nodes return, the hints are handed off. Availability rises; `R + W > N` no longer implies overlap; you are firmly in AP territory. This is the knob that makes Dynamo-lineage systems what they are.

**Reconciling divergence.** Once you permit divergent replicas, you need a merge strategy:

| Strategy | Behavior | Hazard |
|---|---|---|
| **Last-write-wins** | highest timestamp wins | clock skew silently discards writes |
| **Vector clocks** | detect concurrency; return siblings to the application | client complexity; vector growth |
| **Dotted version vectors** | compact version vectors, no false concurrency | more complex |
| **CRDTs** | merge is mathematically defined and always converges | restricted data types |

Conflict-free replicated data types [Shapiro et al. 2011] are the principled answer, and they connect directly to CALM: a CRDT's merge is a join on a semilattice, which is monotone, which is exactly the condition for coordination-freedom. Counters, sets, registers, and even JSON-like documents and collaboratively edited text have CRDT formulations.

**Tunable consistency** is quorum theory exposed as an API. Cassandra offers `ONE`, `QUORUM`, `LOCAL_QUORUM`, `EACH_QUORUM`, `ALL` per operation; DynamoDB offers eventually- versus strongly-consistent reads. The point of `LOCAL_QUORUM` in a multi-region deployment is precisely PACELC's "else" branch: avoid a cross-region round trip in the common case, and accept that a region failover may lose recent writes.

**Refinements worth knowing:**

- **Flexible Paxos** [Howard, Malkhi, Spiegelman 2016] proved that quorum intersection is only required *across* phases, not *within* them. If leader-election quorums and replication quorums intersect, they need not each be majorities. With `N = 5`, you can use replication quorums of 2 (faster writes) provided election quorums are 4. This is a genuinely surprising loosening of a twenty-year-old assumption.
- **Witness replicas** participate in voting but store no data — cheap failure tolerance.
- **Quorum leases** grant a replica the right to serve local reads for a bounded period, trading a clock assumption for read latency.

### 6.2 Gossip and anti-entropy

Gossip is not a consistency protocol, and treating it as one is a category error. It is a **dissemination mechanism** with excellent robustness properties and no ordering guarantees whatsoever.

**Epidemic algorithms** [Demers et al. 1987] come in variants:

- **Anti-entropy** — a node periodically picks a random peer and reconciles their full state. Push, pull, or push-pull. Reliable but expensive; usually run on a slow cycle as a backstop.
- **Rumor mongering** — a node with new information tells random peers, and stops after hearing the rumor from too many others. Fast and cheap, but with a small probability of failing to reach everyone — which is why anti-entropy runs underneath as a safety net.

The mathematics is the reason gossip is everywhere: information reaches all `N` nodes in **O(log N)** rounds with high probability, there is no leader or bottleneck, and the protocol degrades gracefully as nodes fail. Message load per node is roughly uniform regardless of cluster size.

**What gossip is actually used for in production:**

| Use | Systems |
|---|---|
| Cluster membership and failure detection | Cassandra, Consul/Serf, Redis Cluster, Riak, Akka |
| Metadata propagation (schema, ring topology) | Cassandra, Dynamo |
| Anti-entropy repair of divergent data | Dynamo, Cassandra, Riak |
| Load and health information | Consul, Serf |

**SWIM** [Das, Gupta, Motivala 2002] is the standard modern membership protocol. Each node periodically probes a random peer directly; on timeout, it asks `k` other nodes to probe indirectly, which distinguishes a genuinely dead node from a temporarily unreachable path. Membership updates are piggybacked on regular protocol messages rather than broadcast. The **suspicion mechanism and incarnation-number refutation** — marking a node *suspect* before *confirmed dead*, and letting the accused refute by bumping its incarnation number — are part of the original SWIM paper, not later additions; they exist specifically to cut the false-positive rate. What HashiCorp's Serf and Consul contribute on top is the **Lifeguard** extensions [2018]: local health awareness, so a node that suspects it is itself degraded becomes more cautious about accusing others, plus a buddy system for faster refutation delivery.

**Phi-accrual failure detection** [Hayashibara et al. 2004], used by Cassandra and Akka, replaces the binary alive/dead verdict with a continuously computed suspicion level `φ` derived from the statistical distribution of recent heartbeat intervals. The application picks its own threshold, which decouples the detector from the trade-off between fast detection and false positives.

**Merkle-tree anti-entropy** is how Dynamo-lineage systems repair divergence efficiently. Each replica maintains a hash tree over its key range; two replicas compare root hashes and descend only into subtrees that differ. Divergence is located in logarithmic comparisons instead of a full range scan. This is the background process that makes "eventual" in eventual consistency actually arrive.

The essential framing: **gossip is the AP toolkit.** It provides no ordering, no atomicity, and no linearizability — it provides convergence, scalability, and resilience. In a system like Cassandra it operates alongside a quorum data path: quorums handle per-request consistency, gossip handles membership and background convergence.

### 6.3 Paxos

Paxos solves **consensus**: a set of processes must agree on a single value, such that only a proposed value is chosen, at most one value is ever chosen, and processes only learn values that were actually chosen. Lamport's original paper [1998] was famously opaque; *Paxos Made Simple* [2001] is the readable version.

**Single-decree Paxos** has three roles (usually co-located) and two phases:

```
Phase 1 (Prepare):
  Proposer -> Acceptors:  PREPARE(n)          n = unique, increasing proposal number
  Acceptor:               if n > any n seen before:
                            promise never to accept < n
                            reply PROMISE(n, (n_acc, v_acc) if any value already accepted)
                          else ignore

Phase 2 (Accept):
  Proposer: on PROMISE from a majority:
              if any acceptor reported an accepted value,
                 v := the value with the highest n_acc      <-- the critical rule
              else
                 v := its own proposal
            -> Acceptors:  ACCEPT(n, v)
  Acceptor:  if it has not promised a higher n: accept, reply ACCEPTED(n, v)

  Chosen when a majority has accepted (n, v).
```

The marked rule is the one worth dwelling on, because it is where the safety argument lives. A worked example:

```
FIGURE 3 — single-decree Paxos, and why the adoption rule exists

  State before:  A has already accepted (3, "x")
                 B and C have accepted nothing

  PHASE 1
    P -> A,B,C :  PREPARE(5)
    A -> P     :  PROMISE(5, accepted = (3, "x"))
    B -> P     :  PROMISE(5, accepted = none)
    C          :  (unreachable)
                  -- the majority {A, B} has promised

  ADOPTION RULE
    Among the promises, the highest-numbered accepted value is (3, "x").
    P must now propose "x" -- NOT its own value.
    Why: (3, "x") may already have been chosen by an earlier majority
    that P cannot see. Proposing anything else risks choosing twice.

  PHASE 2
    P -> A,B   :  ACCEPT(5, "x")
    A -> P     :  ACCEPTED(5, "x")
    B -> P     :  ACCEPTED(5, "x")
                  -- a majority has accepted; "x" is CHOSEN

  Safety rests entirely on two facts: any two majorities intersect,
  and the adoption rule forces a new proposer to carry forward any
  value that might already have been chosen. Remove either one and
  two different values can be chosen.
```

**Liveness is not guaranteed**, exactly as FLP requires. Two proposers can duel indefinitely, each invalidating the other's promises with a higher proposal number. The practical remedy is to elect a distinguished proposer and use randomized backoff — the same escape hatch Raft uses.

**Multi-Paxos** is what anyone actually deploys. Running full Paxos per command costs two round trips; instead, elect a stable leader once, and it may skip Phase 1 for all subsequent log positions, reducing steady-state cost to **one round trip per command**. At this point Multi-Paxos and Raft look extremely similar, which is the honest summary of their relationship.

**Notable variants:**

| Variant | Idea | Trade-off |
|---|---|---|
| **Fast Paxos** | clients send directly to acceptors, saving a message delay | larger quorums; collisions need recovery |
| **Generalized Paxos** | order only commands that actually conflict | more complex conflict tracking |
| **EPaxos** | fully leaderless; tracks dependencies per command | optimal WAN latency; complex recovery |
| **Flexible Paxos** | intersection needed only across phases | tunable quorum sizes |
| **Vertical Paxos** | reconfiguration via an external master | simpler membership change |
| **Cheap Paxos** | auxiliary acceptors used only on failure | fewer active machines |

**"Paxos Made Live"** [Chandra, Griesemer, Redstone 2007] — Google's account of building Chubby — is required reading for practitioners, because it documents the gap between an algorithm and a system. Its central observation is that the published algorithm describes perhaps a tenth of the work. The rest: handling disk corruption, master leases for local reads, group membership changes (barely specified in the original papers), snapshot management, expressing the state machine in a testable form, and building a deterministic test harness capable of finding rare concurrency bugs, because ordinary testing does not find them.

**Deployments:** Chubby, Google Megastore (Paxos per entity group, synchronously across datacenters), Spanner (Paxos groups per shard), Ceph monitors, Cassandra's lightweight transactions (Paxos per partition key for compare-and-set), Azure Cosmos DB.

### 6.4 Raft

Raft [Ongaro & Ousterhout 2014] was explicitly designed for *understandability*. It solves the same problem as Multi-Paxos but decomposes it into three separable pieces — leader election, log replication, and safety — and deliberately constrains the state space to reduce the number of cases an implementer must reason about.

**Strong leadership.** Log entries flow only from leader to followers. A leader never overwrites or deletes entries in its own log. This is more restrictive than Paxos (which permits out-of-order commitment and log holes) and is precisely the simplification that makes Raft tractable.

**Terms as a logical clock.** Time is divided into terms, each beginning with an election. Every RPC carries a term; a server seeing a higher term immediately steps down to follower. A term has at most one leader, and some terms have none (a split vote).

**Leader election.** A follower that hears nothing for its *randomized* election timeout becomes a candidate, increments the term, votes for itself, and requests votes. Randomization is the anti-livelock device: split votes resolve quickly because timeouts rarely collide twice.

**The election restriction — the key safety idea.** A voter grants its vote only if the candidate's log is *at least as up to date* as its own, comparing last log term first, then last log index. Because any election quorum intersects any commit quorum, a candidate that wins must hold every committed entry. This single restriction replaces Paxos's Phase-1 value-recovery machinery and yields the **Leader Completeness Property**: any entry committed in a given term is present in the logs of all leaders of later terms.

**Log matching.** `AppendEntries` carries `prevLogIndex` and `prevLogTerm`; a follower rejects the request unless it has a matching entry there. On rejection, the leader backs up and retries (production implementations optimize this with conflict hints). This inductively guarantees: *if two logs contain an entry with the same index and term, the logs are identical in all preceding entries.*

**The commitment subtlety** is the part most re-implementations get wrong, and it is worth walking through concretely:

```
FIGURE 4 — Raft's commitment rule (the paper's Figure 8)

  Five servers S1..S5. Log entries shown as [term].

  (a) S1 is leader in term 2. It appends an entry at index 2 and
      replicates it to S2 only, then crashes.
        S1 [1][2]   S2 [1][2]   S3 [1]   S4 [1]   S5 [1]

  (b) S5 wins the term-3 election with votes from S3, S4 and itself
      (their logs are no less up to date than S5's), and appends a
      DIFFERENT entry at index 2. It then crashes.
        S5 [1][3]

  (c) S1 restarts and wins term 4. It resumes replicating its old
      term-2 entry, which now reaches the majority {S1, S2, S3}.
        S1 [1][2]  S2 [1][2]  S3 [1][2]  S4 [1]  S5 [1][3]

      >>> Suppose S1 declared index 2 COMMITTED here, on the grounds
          that a majority now holds it. Watch what (d) does to it.

  (d) S1 crashes. S5 wins term 5 with votes from S2, S3, S4 -- legal,
      because S5's last log term (3) beats theirs (2). S5 then
      overwrites index 2 everywhere with its own term-3 entry.
        -> an entry previously reported committed has been erased.

  RAFT'S RULE: in (c), S1 may NOT commit the term-2 entry by counting
  replicas. A leader commits by replica count only for entries from its
  OWN term. In practice it appends a no-op entry on election; committing
  that entry commits index 2 indirectly, and once that has happened S5
  can no longer win an election, so (d) becomes impossible.
```

**Membership changes** come in two flavors. *Joint consensus* transitions through a combined configuration `C_old,new` in which decisions require majorities of both old and new configurations, guaranteeing no window in which two disjoint majorities exist. *Single-server changes* (add or remove one at a time) are simpler and are what most implementations use; note that the safety argument requires the leader to have committed an entry from its current term before beginning a configuration change — an issue identified after publication and corrected in the errata to Ongaro's dissertation.

**Log compaction** uses snapshots of the state machine plus an `InstallSnapshot` RPC for followers that have fallen too far behind.

**Linearizable reads are not free**, and this is a common implementation bug. A leader cannot simply answer from local state: it may have been deposed by a partition it has not yet detected, in which case it serves stale data and violates linearizability. Three correct approaches:

| Technique | Mechanism | Cost | Assumption |
|---|---|---|---|
| **Log read** | append the read as a log entry | full replication round | none |
| **ReadIndex** | record commit index, confirm leadership with a heartbeat round, wait for the state machine to catch up | one round trip, no disk write | none |
| **Lease read** | leader relies on an election-timeout-based lease to serve locally | zero round trips | bounded clock drift |

ReadIndex is the standard choice; lease reads are faster but move a safety property onto clock behavior. The same ReadIndex value can be forwarded to followers to enable linearizable **follower reads**, which is how systems like TiKV scale read throughput.

**Deployments:** etcd, Consul, TiKV/TiDB, CockroachDB (one Raft group per data range), YugabyteDB, Kafka's KRaft mode, Redpanda, RethinkDB, MongoDB's replication protocol (Raft-inspired, adapted to the oplog model), Neo4j causal clustering, Elasticsearch's Zen2 (Raft-like with its own adaptations).

### 6.5 Comparing the consensus family

| | Paxos (Multi) | Raft | ZAB | Viewstamped Replication |
|---|---|---|---|---|
| Origin | Lamport 1998 | Ongaro 2014 | Junqueira et al. 2011 | Oki & Liskov 1988 |
| Leadership | optional, an optimization | mandatory, structural | mandatory | mandatory (primary) |
| Log holes | permitted | forbidden | forbidden | forbidden |
| Leader catch-up | new leader adopts highest accepted values | new leader must already be most up to date | leader syncs followers to its history | view change transfers log |
| Reconfiguration | underspecified in original | joint consensus / single-server | dynamic since 3.5 | explicit in VR Revisited |
| Primary use | Chubby, Spanner, Megastore | etcd, Consul, TiKV, CockroachDB | ZooKeeper | rarely deployed directly |

**ZooKeeper deserves a specific note** because its consistency model is widely misunderstood. Writes are linearizable (ordered through ZAB). **Reads are served locally by any replica and are therefore only sequentially consistent — they can be stale.** A client requiring a linearizable read must issue `sync()` first. ZooKeeper additionally guarantees FIFO client order. Its designers weakened reads deliberately to gain read throughput, which is a textbook instance of PACELC's "else" branch being traded away consciously.

### 6.6 Two-phase commit is not consensus

2PC is regularly filed alongside Paxos and Raft, and it solves a different problem. Consensus makes a set of *replicas* agree on a value with majority quorums. **Atomic commit** makes a set of *participants*, each holding different data, agree to commit or abort — and requires *unanimity*, since any single participant may have a reason to abort.

The consequence is a well-known and severe limitation: **2PC blocks.** If the coordinator fails after participants have voted "yes" but before delivering the decision, those participants hold locks and cannot safely proceed — they cannot commit (someone may have voted no) and cannot abort (someone may already have committed). Three-phase commit adds a pre-commit round to reduce blocking, but is unsafe under network partitions and is essentially unused in practice.

The modern fix is compositional and elegant: **make the coordinator itself a replicated state machine.** Spanner runs 2PC across Paxos groups where the coordinator's decision log is Paxos-replicated, so coordinator failure is survivable and the protocol is effectively non-blocking. This composition — consensus for replication, 2PC for cross-shard atomicity — is the standard architecture for distributed ACID.

### 6.7 A note on Byzantine fault tolerance

Paxos and Raft assume the *crash-stop* (or crash-recovery) model: nodes may halt or be slow, but never lie. Byzantine fault tolerance drops that assumption and requires `3f + 1` nodes to tolerate `f` arbitrary faults, with protocols such as PBFT [Castro & Liskov 1999] and the linear-communication HotStuff [2019] used in blockchain systems. For a datacenter database this is nearly always the wrong model — the cost is substantial and the threat is better addressed with checksums, authentication, and operational controls. It is included here so that the boundary of the crash-fault assumption is explicit rather than assumed.

---

## 7. Where they meet: distributed ACID

Systems that offer serializable transactions across replicated, partitioned data must compose machinery from both halves of this article. The approaches divide into a few distinct architectural families.

### 7.1 Consensus + 2PC + a timestamp authority: Spanner

Google's Spanner [Corbett et al. 2012] provides **external consistency** — strict serializability — across a globally distributed database. The composition:

- Data is sharded; each shard is a **Paxos group** replicated across datacenters.
- Single-shard transactions commit through that group's Paxos log.
- Cross-shard transactions run **2PC across Paxos groups**, with the coordinator's state itself Paxos-replicated, so the classic blocking problem is neutralized.
- Concurrency control is 2PL for read-write transactions and lock-free snapshot reads at a timestamp for read-only ones.

The distinctive contribution is **TrueTime**: an API backed by GPS receivers and atomic clocks that returns an *interval* `[earliest, latest]` guaranteed to contain the true time, with a bounded uncertainty `ε`. Spanner exploits this with **commit wait**: after choosing a commit timestamp `s`, a transaction waits until `TT.after(s)` is true — until `s` is definitely in the past everywhere — before releasing locks. The wait costs roughly `2ε` (a few milliseconds in Google's deployment), and in exchange, timestamp order globally implies real-time order. This is the rare case of buying a consistency guarantee with *clock infrastructure* rather than with messages.

The generalizable lesson: strict serializability across regions requires *some* source of global ordering, and you can source it from communication (extra round trips) or from physics (tightly synchronized clocks). Spanner chose physics because Google could afford the hardware.

### 7.2 Hybrid logical clocks: CockroachDB, YugabyteDB

Systems without atomic clocks approximate the same result with **hybrid logical clocks** [Kulkarni et al. 2014], which combine physical time with a Lamport counter so that causally related events always receive increasing timestamps regardless of clock skew.

CockroachDB [Taft et al. 2020] replicates each data *range* with its own Raft group, uses HLCs for transaction timestamps, and — lacking a bounded uncertainty guarantee from hardware — handles the uncertainty window by *restarting* transactions that encounter a value within it, rather than by waiting. Its "parallel commits" optimization removes a round trip by making the transaction record's commit status inferable from the presence of its writes. The result is serializable isolation with a well-documented caveat: correctness depends on clock offsets staying within the configured `max_offset`, and a node exceeding it removes itself from the cluster.

### 7.3 Client-driven 2PC over a key-value store: Percolator

Google's Percolator [Peng & Dabek 2010] added snapshot-isolation transactions to BigTable *without modifying it*, using a timestamp oracle for globally ordered timestamps, extra columns per data column to hold locks and write pointers, and a client-driven 2PC in which one arbitrarily chosen cell serves as the *primary lock*. Commit is the single atomic write that makes the primary lock's record visible; all other locks are cleaned up lazily by whichever transaction encounters them next.

This is the design TiDB adopted (over Raft-replicated TiKV instead of BigTable), and it is worth studying as a demonstration that transaction semantics can be layered above a store providing only per-row atomicity.

### 7.4 Determinism instead of agreement: Calvin

Calvin [Thomson et al. 2012] inverts the usual order. Rather than executing transactions and then agreeing on the outcome, it **agrees on a total order of transactions first**, via a replicated sequencing layer, and then executes them deterministically at every replica. Because execution is deterministic given the order, replicas cannot diverge, and **no two-phase commit is required at all** — agreement has already happened.

The costs are real: transactions must have their read/write sets known in advance (interactive transactions require a reconnaissance step), and long transactions can hold up the deterministic schedule. FaunaDB is the best-known production system in this family.

### 7.5 Co-designing the layers: TAPIR

The architectures above stack a transaction protocol on top of a replication protocol, and in doing so pay for ordering twice: the replication layer establishes a total order, and the transaction layer establishes another one over it. **TAPIR** [Zhang et al. 2015] asks whether that redundancy is necessary and concludes it is not. It builds a linearizable, strictly serializable transaction protocol over **inconsistent replication** — a replication layer that provides fault tolerance and durability but deliberately no ordering guarantee at all — and recovers the ordering once, at the transaction layer, via optimistic timestamp-ordered validation.

The payoff is that a committed transaction can complete in a single round trip to the nearest quorum, with no leader in the path. The paper is the cleanest statement of a principle that recurs throughout this article: **coordination paid at one layer is often being paid again at the next, and the two layers are usually designed by different people who never compare invoices.**

### 7.6 Single-object consensus inside an AP store: Cassandra LWT

Cassandra is an AP system, but sometimes an application needs one linearizable operation — typically "claim this username if nobody has." Lightweight transactions provide `IF NOT EXISTS` / `IF <condition>` semantics by running **Paxos per partition key**. The cost is roughly four round trips versus one for a normal quorum write, and Cassandra's own documentation warns against routine use.

This pattern generalizes well and deserves emphasis: **buy coordination per-operation, for the specific invariants that need it, rather than globally.** It is the direct engineering expression of the invariant-confluence result.

### 7.7 The mainstream middle: MongoDB

MongoDB is worth a paragraph because it is the system most readers will actually be asked about, and because it has moved substantially. Replica sets use a Raft-inspired protocol; multi-document transactions arrived for replica sets in 4.0 and for sharded clusters in 4.2, the latter using two-phase commit across shards. Isolation for transactions is snapshot-based, and the interesting part is that the guarantees are *composed by the client* out of `readConcern` and `writeConcern`: `writeConcern: majority` plus `readConcern: majority` gives durable, non-rollback-able reads; `readConcern: linearizable` adds the real-time guarantee for single-document reads; causal-consistent sessions give read-your-writes and monotonic reads without a quorum read on every operation.

The lesson generalizes beyond MongoDB: modern systems increasingly expose the consistency/latency trade-off as a *per-operation parameter* rather than a deployment-wide mode. That is a real improvement — it lets §8.3's per-workload analysis be implemented directly — but it also means the phrase "we use MongoDB" conveys almost nothing about the guarantees in force. The configuration is the guarantee.

### 7.8 A note on Kafka

Kafka is not a database, but its replication settings are an instructive quorum in disguise. `acks=all` combined with `min.insync.replicas=2` on a replication factor of 3 means a produce request is acknowledged only once a sufficient set of in-sync replicas holds it — an availability/durability trade in exactly the CAP shape. Setting `unclean.leader.election.enable=true` permits an out-of-sync replica to become leader during a failure, restoring availability by *permitting acknowledged data loss*. Kafka's move from ZooKeeper to KRaft replaced an external consensus dependency with an internal Raft implementation, consolidating the same architecture.

---

## 8. Engineering practice

### 8.1 The cost of coordination in latency

Design intuition improves dramatically once these numbers are internalized. They are approximate and hardware-dependent, but the *ratios* are stable:

| Operation | Approximate latency |
|---|---|
| Main memory reference | ~100 ns |
| NVMe SSD `fsync` (with power-loss protection) | ~0.1–1 ms |
| Same-datacenter network round trip | ~0.5 ms |
| Cross-availability-zone round trip | ~1–2 ms |
| Cross-region round trip (e.g. US east–west) | ~60–70 ms |
| Intercontinental round trip | ~150–250 ms |

Read the consequences directly:

- A single-node ACID commit is dominated by one `fsync`: sub-millisecond, thousands of commits per second per connection, and far more with group commit.
- Synchronous replication within a datacenter roughly doubles commit latency. Acceptable almost everywhere.
- **Cross-region synchronous replication makes each commit cost tens of milliseconds**, capping a single sequential transaction stream at a few dozen commits per second. No amount of engineering removes this; it is bounded by the speed of light.

This is why multi-region strongly-consistent systems place data near its writers (Spanner's placement directives, CockroachDB's `REGIONAL BY ROW`), and why `LOCAL_QUORUM` exists. Geography is a schema design concern.

### 8.2 The cost you cannot buy your way out of: contention

Latency is the coordination cost everyone quotes, and it is the *least* dangerous one, because latency is amenable to the standard tricks: pipelining, batching, group commit, concurrency. Ten thousand independent transactions, each waiting 60 ms, still finish in well under a second of wall time if they run concurrently.

**Contention is different, because conflicting operations on the same item cannot overlap by definition.** This is the denomination of the coordination bill that no hardware purchase and no amount of parallelism will reduce, and in practice it is what bounds real systems far more often than raw latency.

The arithmetic is unforgiving. Under two-phase locking, the maximum throughput on a single hot row is one update per lock hold time, and the lock hold time includes everything between acquisition and commit — including the commit round trip. A row updated under cross-region synchronous replication is therefore capped at roughly

```
1 / (60 ms) ≈ 16 updates per second
```

no matter how many cores, replicas, or connections you provision. A global counter, an inventory row for a popular item, a per-tenant sequence, or an account balance for a high-volume merchant will all hit this wall, and the wall does not move.

Optimistic schemes do not escape the bound; they change its shape, usually for the worse near saturation. Under SSI or OCC, contention converts into aborts rather than waits, and aborted transactions retry, and retries add load, which raises the conflict probability, which produces more aborts. Past a threshold this feedback loop causes throughput to *decrease* as offered load increases — the classic thrashing curve, familiar from lock managers since the 1980s. The behavior is qualitatively worse than blocking, because a saturated 2PL system merely queues while a saturated OCC system burns work. It is also why PostgreSQL's `SERIALIZABLE` needs not just a retry loop but a retry loop with backoff and a bounded attempt count.

Two corollaries worth carrying around:

**Never hold a lock across a network call or a user's think time.** The hold time is the denominator in the throughput bound, and an external call inflates it by orders of magnitude. This single rule prevents more contention incidents than any tuning parameter.

**Contention is a data modeling problem, not a database tuning problem.** The mitigations all involve changing what is being contended for:

- **Shard the hot item.** Replace one counter with `k` counters, increment a random one, sum on read. Throughput multiplies by `k`; the cost is a more expensive read. This is escrow (§8.3) in its simplest form.
- **Batch through a single writer.** Route all updates for a hot key through one consumer of a partitioned log, which applies them in bulk. Contention disappears because concurrency does.
- **Move the conflict out of the transaction.** Reserve now, confirm later; the reservation is short and the confirmation touches a different row.

The design question is therefore not only "how strong a guarantee do we need?" but "how many distinct items will conflicting operations target?" A system with strict serializability over a million independent keys can be extremely fast. The same system with one hot key is slow at any consistency level, and weakening the consistency level will not fix it.

### 8.3 A decision procedure

A workable sequence for a new system:

**Step 1 — enumerate the invariants, not the "consistency requirements."** "We need strong consistency" is not a requirement; "a seat may not be sold twice" is. Write them down as predicates over state.

**Step 2 — classify each by invariant confluence.** Does merging two independently-valid states preserve it? Most will pass. Those that fail are your coordination budget.

**Step 3 — try to restructure the failures into confluent form.** This is where the leverage is:

| Non-confluent pattern | Confluent reformulation |
|---|---|
| Global counter with a limit | **Escrow**: pre-partition the quota into per-node allocations; coordinate only on rebalance |
| Inventory decrements | **Reservation**: hold, then confirm; expire holds automatically |
| Unique username | Coordinate only on the uniqueness check (a single-key CAS), not on the whole transaction |
| "Delete parent and all children atomically" | Soft-delete plus monotone tombstone propagation |
| Shared mutable set with removals | Add-wins or remove-wins CRDT with an explicit policy |

**Step 4 — choose isolation per workload, not per system.** Analytical reads can run at read committed on a stale replica. The one workflow that enforces the money invariant can run at `SERIALIZABLE` with a retry loop. Databases let you set this per transaction; use that.

**Step 5 — design partition mode explicitly.** For each degraded-mode operation, decide in advance: refuse it, serve it stale, or accept it optimistically and record enough information to compensate later. Then write the compensation. An ATM that permits limited offline withdrawals and reconciles with an overdraft fee is a correctly designed AP system; the fee *is* the compensation. Amazon's shopping cart resolves divergence by union, which resurrects deleted items — a chosen, cheap-to-be-wrong policy.

**Step 6 — make retries safe.** In any system with timeouts, "did my write succeed?" is frequently unanswerable. Idempotency keys, deduplication windows, and the transactional outbox pattern are not optional extras; they are the difference between at-least-once delivery and correctness.

### 8.4 Recurring anti-patterns

- **"We use PostgreSQL, so we're ACID."** With asynchronous replication and reads on a replica, your effective guarantees are weaker than the label on your primary — and `SERIALIZABLE` is not even available there (§3.2).
- **Read-modify-write under default isolation.** Read committed and snapshot isolation both permit outcomes the developer's mental model excludes (§2.3). Use `SELECT ... FOR UPDATE`, an atomic in-place update, or `SERIALIZABLE` with retries.
- **Application-level uniqueness checks.** `SELECT ... IF NOT FOUND THEN INSERT` is write skew with extra steps. Use a unique constraint; it is one of the few things that genuinely requires coordination, and the database already implements it correctly.
- **Distributed locks assumed to be mutual exclusion.** A lease-based lock in Redis or ZooKeeper can expire during a GC pause while the holder still believes it holds the lock. Correct use requires **fencing tokens**: a monotonically increasing number checked by the resource being protected.
- **Wall-clock timestamps as a merge rule.** Last-write-wins with unsynchronized clocks discards writes silently and non-deterministically.
- **No serialization-failure retry loop.** `SERIALIZABLE` on PostgreSQL without retries converts a correctness feature into an availability problem — and without backoff, into a thrashing problem (§8.2).
- **Semi-sync replication trusted after a timeout.** MySQL's silent fallback to asynchronous means the guarantee vanishes precisely when it is needed. Monitor for the fallback; do not assume it will not happen.

---

## 9. Verification

The gap between "we implemented Raft" and "our system is linearizable" is wide, and closing it requires more than tests.

**Jepsen** (Kyle Kingsbury) is the most consequential body of empirical work in the field: generate concurrent operations against a real cluster, inject partitions, clock skew, and process pauses, record a history, then check whether that history is consistent with the claimed model. Jepsen has repeatedly found genuine safety violations in mature, widely deployed systems, including cases where the observed behavior contradicted the vendor's own documented guarantees. Rather than summarize that record with a statistic, the right move is to read the analysis for the specific system and version you plan to deploy; the reports at jepsen.io are indexed by system and are unusually candid about methodology and its limits.

**Elle** [Kingsbury & Alvaro 2020] is Jepsen's transactional checker. Rather than testing linearizability (which is NP-hard in general and does not describe transactions anyway), it infers the dependency graph — exactly Adya's ww, wr, and rw edges from §2.4 — from carefully constructed operations over lists and registers, and reports the specific cycle that proves an anomaly. It produces human-readable counterexamples, which is what makes it usable rather than merely correct.

**Linearizability checkers** such as Porcupine and Knossos search for a valid sequential witness for an observed history. Practical only for modest histories, since the problem is NP-complete, but very effective at finding bugs.

**Formal specification.** TLA+ has been used to specify Raft (the original work included a machine-checked treatment of its safety properties), and AWS has published on applying it to S3, DynamoDB, and other core services, finding design-level bugs that testing would not have reached [Newcombe et al. 2015]. The consistent report is that much of the value comes from being forced to write the specification, not only from the model checker's output.

**Deterministic simulation.** FoundationDB's approach — running the entire distributed system, including a simulated network with injected failures, single-threaded and deterministically, so that any discovered bug is exactly reproducible from a seed — is arguably the strongest practical testing methodology available for this class of system. It is the mature descendant of the test harness described in *Paxos Made Live*.

If you take one operational rule from this section: **treat consistency claims as hypotheses about a specific configuration, and test the configuration you actually run.** Many published violations arise not from broken algorithms but from default settings, degraded modes, and reconfiguration paths.

---

## 10. Conclusion

The two frameworks in the title answer different questions. ACID asks: given concurrent transactions and an unreliable machine, what can a database promise about the outcome? CAP asks: given replicas and an unreliable network, what can a replicated register promise about recency? The letters overlap; the subjects do not.

What unifies them is the resource being spent. Serializability requires transactions to learn about conflicting transactions. Linearizability requires replicas to learn about each other. Both are purchased with coordination — and the bill arrives in latency, in refused requests, and in contention on whatever item everyone wants at once. Isolation levels and consistency models are two menus of discounts on the same purchase, and the useful skill is knowing which items on the bill you genuinely need.

Three results, taken together, locate the boundary. **CAP** says linearizability and total availability cannot coexist under partition. **HAT** says which isolation levels survive a total-availability requirement — a shorter list than most people assume, ending well below serializability. **Invariant confluence and CALM** localize the requirement precisely: coordination is needed exactly where an invariant is not preserved under merge, or equivalently, where a computation is not monotone.

That last result is the practically important one, because it converts an architectural argument into an engineering procedure. Most application invariants are confluent and need no coordination at all. A small number — uniqueness, conserved quantities, bounded resources — are not, and those are worth paying for. The mature system is not the one that buys the strongest guarantee everywhere, nor the one that abandons guarantees for throughput. It is the one that knows which of its invariants actually require agreement, buys exactly that, keeps the contended set small, and has written down what happens to everything else when the network breaks.

---

## 11. References

Citations in the text use author-year short form and resolve against the grouped list below.

**Transactions and isolation**

- Härder, T., Reuter, A. (1983). *Principles of Transaction-Oriented Database Recovery.* ACM Computing Surveys.
- Gray, J., Reuter, A. (1992). *Transaction Processing: Concepts and Techniques.*
- Berenson, H., Bernstein, P., Gray, J., Melton, J., O'Neil, E., O'Neil, P. (1995). *A Critique of ANSI SQL Isolation Levels.* SIGMOD.
- Adya, A. (1999). *Weak Consistency: A Generalized Theory and Optimistic Implementations for Distributed Transactions.* MIT PhD thesis.
- Fekete, A., Liarokapis, D., O'Neil, E., O'Neil, P., Shasha, D. (2005). *Making Snapshot Isolation Serializable.* TODS.
- Cahill, M., Röhm, U., Fekete, A. (2008). *Serializable Isolation for Snapshot Databases.* SIGMOD.
- Ports, D., Grittner, K. (2012). *Serializable Snapshot Isolation in PostgreSQL.* VLDB.

**Recovery and storage**

- Mohan, C., Haderle, D., Lindsay, B., Pirahesh, H., Schwarz, P. (1992). *ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking and Partial Rollbacks Using Write-Ahead Logging.* TODS.
- SQLite documentation: *Atomic Commit In SQLite*, *Write-Ahead Logging*, *Result and Error Codes*, *How To Corrupt An SQLite Database File*.
- PostgreSQL documentation: WAL Configuration, Transaction Isolation, Routine Vacuuming, Hot Standby, `synchronous_standby_names`.
- MySQL Reference Manual: *InnoDB Locking and Transaction Model*, *InnoDB On-Disk Structures*, *Semisynchronous Replication*.

**Distributed systems theory**

- Fischer, M., Lynch, N., Paterson, M. (1985). *Impossibility of Distributed Consensus with One Faulty Process.* JACM.
- Dwork, C., Lynch, N., Stockmeyer, L. (1988). *Consensus in the Presence of Partial Synchrony.* JACM.
- Herlihy, M., Wing, J. (1990). *Linearizability: A Correctness Condition for Concurrent Objects.* TOPLAS.
- Attiya, H., Bar-Noy, A., Dolev, D. (1995). *Sharing Memory Robustly in Message-Passing Systems.* JACM.
- Chandra, T., Toueg, S. (1996). *Unreliable Failure Detectors for Reliable Distributed Systems.* JACM 43(2).
- Chandra, T., Hadzilacos, V., Toueg, S. (1996). *The Weakest Failure Detector for Solving Consensus.* JACM 43(4).
- Fox, A., Brewer, E. (1999). *Harvest, Yield, and Scalable Tolerant Systems.* HotOS.
- Gilbert, S., Lynch, N. (2002). *Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services.* SIGACT News.
- Mahajan, P., Alvisi, L., Dahlin, M. (2011). *Consistency, Availability, and Convergence.* UT Austin TR-11-22.
- Abadi, D. (2012). *Consistency Tradeoffs in Modern Distributed Database System Design.* IEEE Computer.
- Brewer, E. (2012). *CAP Twelve Years Later: How the "Rules" Have Changed.* IEEE Computer.

**Coordination avoidance**

- Terry, D., et al. (1994). *Session Guarantees for Weakly Consistent Replicated Data.* PDIS.
- Shapiro, M., Preguiça, N., Baquero, C., Zawirski, M. (2011). *Conflict-Free Replicated Data Types.* SSS.
- Bailis, P., Davidson, A., Fekete, A., Ghodsi, A., Hellerstein, J., Stoica, I. (2013). *Highly Available Transactions: Virtues and Limitations.* VLDB.
- Bailis, P., Fekete, A., Franklin, M., Ghodsi, A., Hellerstein, J., Stoica, I. (2015). *Coordination Avoidance in Database Systems.* VLDB.
- Hellerstein, J., Alvaro, P. (2020). *Keeping CALM: When Distributed Consistency Is Easy.* CACM.

**Consensus and replication**

- Thomas, R. (1979). *A Majority Consensus Approach to Concurrency Control.* TODS.
- Gifford, D. (1979). *Weighted Voting for Replicated Data.* SOSP.
- Oki, B., Liskov, B. (1988). *Viewstamped Replication.* PODC. — Liskov, B., Cowling, J. (2012), *Viewstamped Replication Revisited.*
- Lamport, L. (1998). *The Part-Time Parliament.* TOCS. — and (2001) *Paxos Made Simple.*
- Castro, M., Liskov, B. (1999). *Practical Byzantine Fault Tolerance.* OSDI.
- Chandra, T., Griesemer, R., Redstone, J. (2007). *Paxos Made Live: An Engineering Perspective.* PODC.
- Junqueira, F., Reed, B., Serafini, M. (2011). *Zab: High-performance Broadcast for Primary-backup Systems.* DSN.
- Moraru, I., Andersen, D., Kaminsky, M. (2013). *There Is More Consensus in Egalitarian Parliaments (EPaxos).* SOSP.
- Ongaro, D., Ousterhout, J. (2014). *In Search of an Understandable Consensus Algorithm.* USENIX ATC. — and Ongaro, D. (2014), *Consensus: Bridging Theory and Practice* (dissertation, with published errata on membership changes).
- Howard, H., Malkhi, D., Spiegelman, A. (2016). *Flexible Paxos: Quorum Intersection Revisited.* OPODIS.
- Yin, M., Malkhi, D., Reiter, M., Golan-Gueta, G., Abraham, I. (2019). *HotStuff: BFT Consensus with Linearity and Responsiveness.* PODC.

**Gossip and membership**

- Demers, A., et al. (1987). *Epidemic Algorithms for Replicated Database Maintenance.* PODC.
- Das, A., Gupta, I., Motivala, A. (2002). *SWIM: Scalable Weakly-consistent Infection-style Process Group Membership Protocol.* DSN.
- Hayashibara, N., Défago, X., Yared, R., Katayama, T. (2004). *The φ Accrual Failure Detector.* SRDS.
- Dadgar, A., Phillips, J., Currey, J. (2018). *Lifeguard: Local Health Awareness for More Accurate Failure Detection.* DSN-W.

**Systems**

- Burrows, M. (2006). *The Chubby Lock Service for Loosely-Coupled Distributed Systems.* OSDI.
- DeCandia, G., et al. (2007). *Dynamo: Amazon's Highly Available Key-value Store.* SOSP.
- Peng, D., Dabek, F. (2010). *Large-scale Incremental Processing Using Distributed Transactions and Notifications (Percolator).* OSDI.
- Corbett, J., et al. (2012). *Spanner: Google's Globally-Distributed Database.* OSDI.
- Thomson, A., et al. (2012). *Calvin: Fast Distributed Transactions for Partitioned Database Systems.* SIGMOD.
- Kulkarni, S., Demirbas, M., Madappa, D., Avva, B., Leone, M. (2014). *Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases.* OPODIS.
- Zhang, I., Sharma, N., Szekeres, A., Krishnamurthy, A., Ports, D. (2015). *Building Consistent Transactions with Inconsistent Replication (TAPIR).* SOSP.
- Taft, R., et al. (2020). *CockroachDB: The Resilient Geo-Distributed SQL Database.* SIGMOD.

**Verification**

- Newcombe, C., et al. (2015). *How Amazon Web Services Uses Formal Methods.* CACM.
- Kingsbury, K., Alvaro, P. (2020). *Elle: Inferring Isolation Anomalies from Experimental Observations.* VLDB.
- Kingsbury, K. Jepsen analyses — jepsen.io

**General reading**

- Bernstein, P., Hadzilacos, V., Goodman, N. (1987). *Concurrency Control and Recovery in Database Systems.* — freely available, still the standard reference on serializability theory.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications.* — the best single-volume synthesis of this material, and the right starting point for a reader new to it.