---
lang: "zh-CN"
pubDatetime: 2026-09-06T22:49:08+08:00
modDatetime: 2026-09-11T11:33:25+08:00
timezone: "Asia/Shanghai"
title: "DDIA 阅读札记：锁服务何时真的多余？——从 DDIA 的条件写入到租约与 Fencing Token"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "DDIA"
  - "分布式锁"
  - "条件写入"
  - "CAS"
  - "租约"
  - "Fencing Token"
  - "etcd"
description: "围绕 DDIA V2 的一句话，拆解条件写入为何能内联锁的仲裁功能，以及 CAS、TTL、fencing token 在单一存储、多副本和多个独立服务中的真实边界。"
---
《Designing Data-Intensive Applications》第二版第 9 章讨论 fencing token 时写道：

> “如果客户端只需要向一个支持条件写入的存储服务写入，那么锁服务就有些多余……”

这句话乍看像是在说：只要数据库支持 CAS，就不需要分布式锁。这样理解既接近答案，又会在最危险的地方出错。

更准确的结论是：

> **当唯一需要保护的副作用全部落在同一个原子性边界内时，存储服务可以自己完成锁的仲裁，因此独立的锁服务可能多余；但锁的语义并没有消失，它只是被内联进了条件写入、版本号和事务。**

而一旦副作用跨越多个独立系统，问题就从“谁赢得租约”变成了“旧持有者的命令在所有下游是否都已经失效”。这才是 fencing token 真正要解决的问题。

可以用一句更短的话概括全文：

> **CAS 决定谁能进门，fencing token 决定进门以后谁的话还算数。**

## 一、先把“一个存储服务”理解正确

DDIA 这里的“一个”不是一台物理机器，而是一个能够对相关操作给出统一裁决的**逻辑一致性域**。

一个由三个或五个成员组成的 etcd 集群，对客户端来说仍然是一个逻辑存储服务：KV 修改通过共识形成全序，事务中的比较与写入作为一个原子操作执行。反过来，即使两个数据库部署在同一台物理机上，只要它们没有共同事务或共同版本顺序，它们仍然是两个一致性域。

这个边界有时甚至比“一个产品”更窄。某个数据库也许只保证单行 CAS，某个对象存储也许只允许针对同一个对象的 ETag 做条件更新，却不能原子地检查租约对象并修改另一个业务对象。因此，真正应该问的不是“系统有几台机器”，而是：

> 我需要共同判定的状态，是否位于同一个原子检查并写入的边界内？

## 二、条件写入为什么能够完成仲裁

普通写入只有一个意思：

```text
把 key 写成 value。
```

条件写入则把前提和写入绑定在同一个存储端原子操作里：

```text
只有 key 当前版本仍然是 17，才把它更新成新值。
```

它通常表现为以下形式之一：

- `compare-and-set(expectedVersion, newValue)`；
- `put-if-absent`；
- SQL 中带版本条件的 `UPDATE`；
- 唯一约束保护下的 `INSERT`；
- 对象存储的 `If-None-Match` 或 `If-Match`；
- etcd 的 `Txn(Compare, Then, Else)`。

重点不在 API 名称，而在于**条件检查和写入由服务端原子完成**。客户端不能把它拆成“先 GET、在本地判断、再 PUT”。

假设租约记录当前是：

```text
lease/file-42 = {
  owner: null,
  expires_at: 10:00:00,
  generation: 7
}
version = 17
```

租约已经到期。客户端 A 和 B 同时读取到版本 17，然后都尝试获得下一任租约：

```text
A: 若 version == 17，则写 owner=A, generation=8
B: 若 version == 17，则写 owner=B, generation=8
```

这里的 8 只是双方依据同一旧状态提出的下一代编号；失败者的提议不会落盘。

存储服务必须把这两个竞争请求排出一个确定的先后：

```text
A 的条件写：成功，版本从 17 变成 18
B 的条件写：失败，因为当前版本已经不是 17
```

也可能是 B 成功、A 失败，但不可能两者都成功。条件写入把多个竞争者的“同时声明”压缩成了一个可判定的顺序；这正是租约分配所需要的仲裁能力。

## 三、为什么 GET 后再 PUT 不够

如果存储只提供普通 GET 和无条件 PUT，最直观的实现会出现 check-then-act 竞态：

```text
t1  A: GET lease → 空闲
t2  B: GET lease → 空闲
t3  A: PUT owner=A → 成功
t4  B: PUT owner=B → 成功
```

最后可能是 B 的值覆盖 A，但 A 在 t3 之后已经有理由相信自己成功，并可能开始执行受保护操作。事后再读一次也不能消除这个窗口：在“确认自己是 owner”和“真正执行副作用”之间，状态仍可能改变。

严格说来，这不是宣称“任何模型中都不可能从原子读写寄存器构造互斥”。在固定参与者、没有崩溃等较强假设下，经典共享内存算法可以只用读写寄存器实现互斥。但对于参与者动态变化、进程会崩溃和暂停、网络延迟无上界的分布式服务，这类方案通常不能提供我们期待的故障恢复与租约语义。工程上需要的仍然是服务端原子仲裁，或者一个外部协调服务。

## 四、CAS 不是租约：它只解决了一半问题

把一个租约拆开，可以看到至少两部分：

```text
租约 = 排他性授权 + 有效期
```

CAS 负责前一部分：多个竞争者中谁成功取得某一代授权。它本身不理解时间，也不会让旧客户端因为暂停过久而自动失去行动能力。

要得到完整的定时租约，还需要 TTL、存储端时钟，或者一套明确的时钟漂移和续约假设。例如 etcd 的 lease 由集群授予 TTL；客户端通过 keep-alive 续约，集群在 TTL 内没有收到续约时使租约到期，并删除与它绑定的键。[etcd API 文档](https://etcd.io/docs/v3.6/learning/api/)把 lease 描述为检测客户端存活性的机制，同时明确区分了 lease 与提供原子 If/Then/Else 的事务。

但即使租约已经到期，旧客户端也可能不知道。它可能经历了长时间 GC 暂停、虚拟机挂起或调度停顿：

```text
服务端时间：租约已经过期
客户端认知：我上次看到租约仍然有效
```

这就是“僵尸客户端”。TTL 能让其他客户端继续前进，却不能穿越网络，抹掉旧进程内存中“我还是持有者”的错误认知。

etcd 自己的文档也直接指出：lease 本身并不保证互斥；当受保护资源是 etcd 中的键时，互斥依靠 revision 和 lease ID 条件验证。如果要保护 etcd 之外的资源，外部资源也必须拥有相应的版本验证能力。[etcd 关于锁与租约的说明](https://etcd.io/docs/v3.6/learning/why/)

## 五、“拿到锁以后盲写”仍然不安全

考虑 DDIA 中最关键的事故时序：

```text
t1  A 获得租约，token=33
t2  A 发生长时间暂停
t3  A 的租约到期
t4  B 获得新租约，token=34
t5  B 写入业务数据
t6  A 恢复，继续发送暂停前准备好的写请求
```

如果业务存储只检查“请求来自一个声称拿到过锁的客户端”，A 的请求仍可能覆盖 B。锁服务此刻没有办法撤回已经发给 A 的 CPU 指令，也无法追回正在网络中延迟的旧请求。

因此下面这种协议不安全：

```text
获得锁 → 普通 PUT 业务数据
```

安全性必须落实到真正产生副作用的地方。常见的两种方式是：

1. 业务对象本身使用版本条件更新，使基于旧版本的写入失败；
2. 每次租约分配产生单调递增的 fencing token，由业务存储记录并拒绝更旧的 token。

第二种方式的服务端逻辑可以抽象为：

```text
若 request.token < last_seen_token：拒绝
否则：接受，并令 last_seen_token = request.token
```

当 B 的 token 34 已经到达存储后，A 的 token 33 即使更晚到达，也会被拒绝。这里比较的是逻辑世代，不是客户端时钟。

这里故意只拒绝“小于”而不是“小于等于”：同一个合法持有者可能连续写入，也可能重试 token 相同的请求。但 fencing token 只识别世代，不识别某一代中的具体操作；如果重复执行不是天然幂等的，还需要额外的请求 ID、唯一约束或去重记录。

还要注意一个经常被省略的细节：新持有者必须先让受保护资源看到自己的更高 token，才能确认旧持有者已在该资源处被隔离。在 token 34 第一次到达之前，只见过 33 的资源无法凭空知道新一代租约已经产生。

所以 fencing 不是客户端自觉遵守的礼节，而是**资源端强制执行的协议**。客户端携带 token 却没有服务端检查，和在请求里附上一句“请相信我”没有本质区别。

## 六、单一存储中，独立锁服务为什么可能多余

现在回到 DDIA 的原句。假设所有需要保护的数据都在数据库 S 中，并且 S 支持原子条件更新：

```text
客户端 → etcd 获取锁 → 数据库 S 写入
```

很多时候可以缩短为：

```text
客户端 → 数据库 S 条件写入
```

例如一个文档的当前版本是 17：

```sql
UPDATE documents
SET body = :new_body,
    version = version + 1
WHERE id = :id
  AND version = 17;
```

受影响行数为 1，说明当前客户端赢得这次修改；受影响行数为 0，说明期间已有其他写入，客户端必须放弃或基于新版本重试。数据库在最终写入点完成了仲裁，不需要客户端先去另一个系统领一张“允许写”的纸条。

如果业务确实需要显式租约，也可以把租约记录保存在 S 中：

```sql
UPDATE leases
SET owner = :client_id,
    expires_at = CURRENT_TIMESTAMP + INTERVAL '30 seconds',
    generation = generation + 1,
    version = version + 1
WHERE resource = :resource
  AND version = :observed_version
  AND expires_at < CURRENT_TIMESTAMP
RETURNING generation;
```

两个竞争者使用同一个 `observed_version` 时，最多一个能够更新成功。这里的 `CURRENT_TIMESTAMP` 还把过期判断放到了数据库时钟上，避免直接比较两个客户端各自的墙上时钟。具体隔离语义仍取决于数据库实现，但协议结构已经具备了条件仲裁、有效期和单调世代。

不过还有一道边界：如果租约在表 `leases`，业务对象在另一个无法与它共同事务提交的存储里，那么“在 S 中拿到租约”并不会自动约束那个外部存储。独立锁服务虽然可以省掉，跨边界的 fencing 却省不掉。

因此，“锁服务多余”成立需要同时满足：

- 真正需要保护的效果只发生在一个一致性域；
- 条件判断覆盖的正是业务写入所依赖的状态；
- 每次写入都经过条件检查，而不是拿到一次锁后长期盲写；
- 没有邮件、支付、外部 API 等无法加入该原子边界的副作用。

## 七、三个节点的 etcd 算一个还是多个？

三个节点组成的一个 etcd 集群，仍然算一个逻辑服务。etcd 的 KV 操作具有统一顺序，修改操作获得单调递增的 revision；`Txn` 可以原子地比较键的值、version、create revision 或 mod revision，并根据结果执行 Then/Else。[etcd API guarantees](https://etcd.io/docs/v3.6/learning/api_guarantees/)与本站此前的[《etcd API 语义保证》](https://quboliu.github.io/posts/0111/)对此有更完整的整理。

用伪代码表示，一次最小的抢占可以是：

```text
Txn:
  IF version("/leases/file-42") == 0
  THEN put("/leases/file-42", owner=A, lease=leaseID)
  ELSE acquisition_failed
```

多个客户端并发执行时，只有一个事务能观察到键不存在并创建它。租约到期后键被删除，下一任持有者可以重新竞争；成功获取时对应的 revision 或锁键的创建 revision 可以提供有序的世代信息，而 lease ID 用来绑定具体租约实例。官方 `etcdctl lock` 在获得锁后执行子命令时，会通过 `ETCD_LOCK_KEY` 和 `ETCD_LOCK_REV` 分别暴露持有者键及其 revision，参见 [etcdctl README](https://github.com/etcd-io/etcd/blob/main/etcdctl/README.md#concurrency-commands)。

但以下情况已经不是“一个服务”：

```text
etcd 集群甲
etcd 集群乙
一个 PostgreSQL
一个对象存储
```

它们各自的 revision、事务序号或版本号只在本系统中有意义。`etcd revision=100` 与 `PostgreSQL version=100` 没有天然的全局先后关系。

## 八、多个存储服务：fencing 解决顺序，不解决原子提交

假设一次任务必须操作数据库、对象存储和文件系统。仅仅让每个系统各自执行 CAS，可能出现：

```text
A 在数据库中获胜
B 在对象存储中获胜
```

因为不存在一个横跨它们的共同比较点。

一个常见方案是由统一租约服务产生 token 33、34、35……，然后要求每个下游服务都记住自己看到过的最大 token：

```text
                 ┌→ 数据库：拒绝 token < 34
租约服务：34 ────┼→ 对象存储：拒绝 token < 34
                 └→ 文件服务：拒绝 token < 34
```

这把租约分配点形成的逻辑顺序传播到了多个资源。Google Chubby 把类似凭证称为 sequencer；etcd 使用 revision 与租约身份组合表达相近的语义。[Chubby 论文](https://research.google/pubs/the-chubby-lock-service-for-loosely-coupled-distributed-systems/)和 DDIA 都强调了资源侧验证的重要性。

但 fencing token 不等于分布式事务。它能阻止旧世代写入，却不能保证数据库和对象存储要么一起成功、要么一起失败：

```text
数据库接受 token=34
对象存储暂时不可达
```

此时仍然发生了部分成功。若业务要求跨系统原子提交，还需要 2PC、Saga、Outbox、幂等重试或重新设计边界。fencing 解决的是**世代顺序与旧请求失效**，不是**多资源原子性**。

同样，如果某个下游无法检查 token，或者副作用是已经发送的邮件、已经触发的现实世界动作，那么锁服务也无法神奇地把它撤销。必须把幂等键、条件执行或补偿协议放到真正执行动作的一侧。

## 九、对象存储说明了“条件能力的边界”

对象存储很适合展示这句话为什么必须带条件。

Amazon S3 当前支持两类条件写入：

- `If-None-Match: *`：仅当同名对象不存在时创建；
- `If-Match: <ETag>`：仅当对象当前 ETag 仍与客户端观察到的一致时更新。

AWS 的[条件写入文档](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html)明确说明，条件由 S3 在写入时检查；ETag 不匹配时操作失败。这足以让多个客户端竞争“谁创建这个对象”，或者防止基于旧对象版本的覆盖。

但同一对象上的条件写，不自动变成跨对象事务。下面两步之间仍然存在边界：

```text
条件更新 lock-object
普通写入 business-object
```

如果业务对象的写入没有自己的版本条件，也不能与锁对象放进同一原子操作，旧客户端仍可能绕过保护。这再次说明：不要只问“产品是否支持条件写入”，还要问“条件能够约束哪一个对象、哪一次副作用”。

## 十、什么时候锁服务确实不多余

独立锁服务仍然有大量合理用途：

1. **需要跨多个独立一致性域提供统一世代。**各系统自己的版本号不可比较，需要一个公共 token 来源，并要求所有资源验证它。
2. **目标资源不能直接表达所需的条件。**例如只提供不可防护的外部操作，此时至少需要协调、幂等或补偿机制；不过必须承认锁本身也不能提供绝对安全。
3. **需要会话与故障恢复语义。**自动续约、等待者唤醒、成员变化、监控与运维可见性，自己拼装往往比使用成熟协调服务更危险。
4. **需要公平队列、选主、读写锁等高阶语义。**单键 CAS 可以作为基础，但不代表每个团队都应该重新实现整套协议。
5. **锁主要用于减少重复工作，而非保护唯一写入。**即便最终存储使用 CAS 保证安全，前置租约仍可以避免十个 worker 同时执行昂贵计算；此时锁是效率优化，不是最后的安全边界。

反过来，如果你唯一要保护的是数据库里的一行，而且数据库已经能够用版本条件原子更新它，那么先去 etcd 抢锁、再回数据库写入，往往增加了一次跨系统故障窗口：

```text
锁已获得，但数据库写入超时：结果未知
数据库写入成功，但释放锁失败
客户端暂停，租约过期，却继续写入
```

把裁决放在最终写入点，通常更容易论证正确性。

## 十一、一个实用的判断清单

设计前可以依次回答下面几个问题：

1. 真正需要保护的副作用发生在哪里？
2. 该资源能否在服务端原子执行“检查条件 + 写入”？
3. 条件的作用域是单个对象、单个分片，还是完整事务？
4. 租约过期由谁的时钟判定？客户端暂停时会发生什么？
5. 新持有者用什么单调世代标识自己？
6. 旧请求最终到达资源时，谁负责拒绝它？
7. 所有下游资源是否都能理解并持久记录 fencing token？
8. 需要的是防止数据损坏，还是避免重复计算？
9. 是否还要求跨系统原子性？如果要求，fencing 并不够。

如果第 2 个问题的答案是“可以”，而第 1 个问题只有一个答案，那么独立锁服务很可能可以去掉。

如果第 6 个问题没有明确答案，那么无论锁服务多么可靠，系统都还没有真正防住僵尸客户端。

## 结语：权力必须在执行点被验证

DDIA 这句话不是在鼓励大家抛弃分布式锁，而是在提示一条更一般的设计原则：

> **不要只在动作开始之前判断客户端是否有权执行；应当在副作用真正发生的地方，再次验证这份权力是否仍然有效。**

条件写入之所以能让独立锁服务显得多余，是因为存储服务本身就是最终执行点，也是最有资格拒绝冲突写入的地方。fencing token 之所以在多个服务中重新变得重要，是因为它把同一个世代顺序带到了每一个执行点。

所以，真正的问题从来不只是“有没有锁”，而是：

```text
谁产生顺序？
顺序在哪个边界内有效？
旧命令最终到达时，谁有能力说“不”？
```

能回答这三个问题，才算真正理解了 DDIA 所说的“锁服务有些多余”。

## 参考资料

- Martin Kleppmann、Chris Riccomini，《[Designing Data-Intensive Applications, Second Edition](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/)》，第 9 章。
- Martin Kleppmann，[How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)。
- etcd，[API](https://etcd.io/docs/v3.6/learning/api/)、[API guarantees](https://etcd.io/docs/v3.6/learning/api_guarantees/) 与 [etcd versus other key-value stores](https://etcd.io/docs/v3.6/learning/why/)。
- Mike Burrows，[The Chubby lock service for loosely-coupled distributed systems](https://research.google/pubs/the-chubby-lock-service-for-loosely-coupled-distributed-systems/)，OSDI 2006。
- Cary G. Gray、David R. Cheriton，[Leases: An Efficient Fault-Tolerant Mechanism for Distributed File Cache Consistency](https://www.cs.cmu.edu/afs/cs.cmu.edu/academic/class/15712-s12/www/papers/gray89.pdf)，SOSP 1989。
- Amazon Web Services，[How to prevent object overwrites with conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html)。
