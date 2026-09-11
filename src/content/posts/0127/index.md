---
lang: "zh-CN"
pubDatetime: 2026-09-04T18:55:51+08:00
modDatetime: 2026-09-11T11:33:25+08:00
timezone: "Asia/Shanghai"
title: "DDIA 阅读札记：再谈恰好一次的消息处理：从 DDIA 的消息 ID 表到 Kafka Streams"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "DDIA"
  - "消息队列"
  - "恰好一次"
  - "幂等性"
  - "Kafka Streams"
description: "从一次数据库提交与消息 ACK 之间的故障窗口出发，解释 DDIA 的消息 ID 去重表，并对照 NServiceBus SQL Outbox 与 Kafka Streams 的真实实现。"
---
《Designing Data-Intensive Applications》第二版第 8 章在“再谈恰好一次的消息处理”中给出了一个很小、却很值得反复推演的协议：消费者把消息 ID 和业务修改写进同一个数据库事务，提交成功后再确认消息，最后清理消息 ID。

这个协议经常被压缩成一句“用幂等性实现恰好一次”，但真正重要的是它如何安排三个不可合并的动作：

```text
数据库提交 → 向消息代理确认消息 → 清理消息 ID
```

顺序稍有变化，就会重新打开消息丢失或重复生效的窗口。本文沿着故障发生的时间线拆解这个协议，再对照两个真实实现：NServiceBus SQL Outbox 中的去重记录，以及 Kafka Streams 的 exactly-once 处理语义。

## 一、“恰好一次”不是处理函数只运行一次

消费者从消息代理取得一条消息以后，至少涉及两个相互独立的持久化系统：

- 数据库记录业务结果；
- 消息代理记录该消息已经处理，或推进消费位置。

如果先确认消息，再提交数据库，进程可能在两步之间崩溃。消息代理认为任务已经完成，不再投递；数据库却没有结果，消息因此丢失。

如果先提交数据库，再确认消息，进程仍可能在两步之间崩溃。消息代理没有收到确认，会重新投递；数据库已经保存过结果，消息可能生效两次。

没有跨消息代理和数据库的原子提交时，这个窗口无法靠调整先后顺序消失。DDIA 的解决方式不是阻止重试，而是接受“同一个处理函数可能执行多次”，再确保数据库中可观察的业务效果只出现一次。

因此，这里的“恰好一次”更准确地说是：

> 在明确的事务边界内，同一条消息造成的持久化业务效果至多出现一次；发生故障时，消息仍可重试，直到效果至少出现一次。

执行次数和效果次数不是一回事。

## 二、DDIA 的消息 ID 表协议

假设每条消息都有全局唯一 ID，数据库中有一张已处理消息表，并对 `message_id` 设置唯一约束。

```sql
CREATE TABLE processed_messages (
    message_id TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

消费者按以下流程处理消息。

### 1. 第一个数据库事务：ID 与业务效果一起提交

```text
BEGIN

如果 message_id 已存在：
    这是一次重试，不再执行业务修改
否则：
    INSERT processed_messages(message_id)
    执行业务修改

COMMIT
```

消息 ID 的插入和业务修改必须属于同一个本地数据库事务。不能先单独保存 ID，再处理业务；否则进程可能在两者之间崩溃，重试看到 ID 后误以为业务已经完成。也不能先提交业务，再单独保存 ID；否则崩溃后的重试可能再次执行业务。

唯一约束也很重要。如果消息代理把同一个 ID 并发投递给两个消费者，两个事务都可能在最初查询时看不到记录。最终只有一个事务能够插入该 ID；另一个事务必须等待或因唯一约束冲突而回滚，不能让两次业务修改都成功。

### 2. 数据库提交以后，由消费者确认消息

数据库返回提交成功后，消息处理程序才向消息代理发送 ACK。不是数据库主动通知消息代理；数据库只负责回答自己的事务是否提交成功。

消息代理收到确认以后，可能删除一条队列消息，也可能只记录确认状态。在 Kafka 这类日志型代理中，通常表现为推进消费组 offset，而不是立即物理删除消息。这里需要的语义只是：处理程序知道确认已经成功后，消息代理不会因为本次消费未完成而再次投递这条消息。

### 3. 第二个数据库事务：清理消息 ID

消息确认成功以后，处理程序可以开启另一个数据库事务，删除消息 ID：

```text
BEGIN
DELETE FROM processed_messages WHERE message_id = ?
COMMIT
```

删除操作不能放进第一个事务。如果 ID 在发送 ACK 之前就被删除，进程可能随后崩溃；消息代理重试时，数据库已经失去判断重复消息的依据。

所以这里确实存在两个独立的数据库事务，中间夹着一次消息代理操作：

```text
T1：插入消息 ID + 修改业务数据 ── COMMIT
                                  ↓
                         消费者发送 ACK
                                  ↓
T2：删除消息 ID ───────────────── COMMIT
```

这不是跨系统事务。协议只是通过本地事务、唯一约束和操作顺序，把每一种崩溃结果都变成安全的重试或无害的残留。

## 三、沿时间线检查每一个崩溃点

| 崩溃位置 | 数据库状态 | 消息代理状态 | 恢复后的结果 |
| --- | --- | --- | --- |
| T1 提交之前 | ID 与业务修改一起回滚 | 未确认 | 消息重试并重新处理 |
| T1 已提交、ACK 之前 | ID 和业务结果都存在 | 未确认 | 消息重试，看到 ID 后跳过业务修改 |
| ACK 成功、T2 之前 | ID 和业务结果都存在 | 已确认 | 留下旧 ID，但不会重复生效 |
| T2 提交之后 | 业务结果存在，ID 已删除 | 已确认 | 正常结束 |

第三行解释了一个容易令人不安的现象：消息已经处理并确认，但 ID 可能永远留在表里。例如进程在 ACK 成功后、删除 ID 前永久退出，而系统又没有清理任务。这个残留不破坏正确性，只会占用空间。

DDIA 的简化协议允许在 ACK 成功后立即删除 ID，因为它假设成功确认意味着消息代理不会再投递该消息。现实系统往往采取更保守的策略：不立即删除，而是把 ID 保留到一个明确的去重窗口结束，再由后台任务批量清理。这样可以覆盖人工重放、死信队列重新驱动、代理实现差异和运维误操作等场景。

保留期限并不是越长越正确。它需要覆盖系统承诺的最大重复投递窗口，同时控制表大小、索引成本和清理压力。若系统允许任意历史消息重放，就不能仅靠一个有限期限的去重表；业务对象本身还需要稳定的幂等键或版本规则。

## 四、真实实现：NServiceBus 的 SQL Outbox

NServiceBus 的 SQL Persistence 提供了一个很接近上述思路的生产实现。它把功能称为 Outbox，因为记录中除了输入消息 ID，还可以保存处理该消息产生的待发送操作；但其中的 `MessageId` 同时承担 Inbox 式的重复检测职责。

官方 SQL Server 脚本创建的 Outbox 表包含 `MessageId` 主键、`Dispatched`、`DispatchedAt` 和 `Operations` 等字段。简化后可以理解为：

```sql
CREATE TABLE OutboxData (
    MessageId NVARCHAR(200) PRIMARY KEY,
    Dispatched BIT NOT NULL,
    DispatchedAt DATETIME,
    Operations NVARCHAR(MAX) NOT NULL
);
```

完整表结构和运行时 SQL 可以在 [NServiceBus SQL Persistence 脚本](https://docs.particular.net/persistence/sql/sqlserver-scripts)中看到。

以官方的订单示例为例，Receiver 收到 `OrderSubmitted` 后，在同一数据库事务中保存订单业务数据、Saga 状态和 Outbox 记录；事务提交后，再发送 `OrderAccepted` 等输出消息。官方示例特意把传输层设置为只保证接收，不依赖 MSDTC，然后由 Outbox 保证数据库状态和消息发送之间的一致性。示例代码见 [Using Outbox with SQL Server](https://docs.particular.net/samples/outbox/sql/)。

其生命周期大致如下：

```text
收到 MessageId = M42
        ↓
检查 OutboxData(M42)
        ↓ 不存在
同一事务：写业务数据 + 写 OutboxData(M42)
        ↓
派发 Operations 中的输出消息
        ↓
标记 Dispatched = true，清空 Operations
        ↓
保留一段去重时间后清理
```

如果两个消费者并发处理同一个消息 ID，默认的乐观并发模式可能让两个处理器都运行到事务末尾，但只有一个事务能够插入主键；另一个因唯一约束冲突而回滚。也就是说，处理代码可能运行两次，事务化的业务状态只成功一次。NServiceBus 文档同样提醒：发送邮件等不受数据库事务保护的副作用仍然可能重复。

与 DDIA 的“ACK 后即可删除”相比，NServiceBus SQL Persistence 默认把去重记录保留七天，并每分钟运行清理；期限和清理间隔都可以配置，也可以关闭内置清理，交给数据库作业处理。参见其 [Deduplication record lifespan](https://docs.particular.net/persistence/sql/outbox#deduplication-record-lifespan)。这正是现实系统通常不会立即删除消息 ID 的一个实例。

## 五、Kafka Streams：相同原则，不是同一张表

DDIA 随后提到 Kafka Streams 也使用类似思想实现恰好一次语义。“类似”非常关键：Kafka Streams 并不会为每条消息创建一行 `processed_messages`，然后在 ACK 后删除。

Kafka 记录天然带有 `(topic, partition, offset)` 位置。对于顺序消费一个 partition 的任务，不必保存所有已处理 ID，只需记录消费进度。Kafka Streams 还把本地状态变更写入 compacted changelog topic，以便进程故障后重建状态。

启用 exactly-once v2 时，只需在 Streams 配置中指定：

```java
props.put(
    StreamsConfig.PROCESSING_GUARANTEE_CONFIG,
    StreamsConfig.EXACTLY_ONCE_V2
);
```

当前 Kafka 文档说明，`exactly_once_v2` 会启用幂等生产者，并让消费者使用 `read_committed` 隔离；生产环境建议相关主题使用至少三个副本。参见 [Kafka Streams 配置文档](https://kafka.apache.org/43/streams/developer-guide/config-streams/#processing-guarantee)。

假设有一个按账户汇总余额的拓扑：

```text
payments topic
      ↓
按 account_id 聚合余额（本地 state store）
      ↓
balances topic
```

处理输入记录 `account-42, +100` 时，系统需要完成四件事：读取输入、更新本地状态及其 changelog、写入输出、推进输入 offset。Kafka 的事务机制把可持久化的状态日志、输出记录和消费 offset 纳入同一个原子单元。

```text
读取 payments-3@offset=108
        ↓
更新 account-42 的余额状态
        ↓
写 balances 与状态 changelog
        ↓
把 payments-3 的消费进度写入同一 Kafka 事务
        ↓
COMMIT TRANSACTION
```

如果进程在事务提交前崩溃，未提交输出不会对 `read_committed` 消费者可见，offset 也不会推进；新实例会从原 offset 重放输入，并从已提交的 changelog 恢复状态。如果事务已经提交，输出、状态日志和消费位置一起生效，恢复后不会再次把该输入作为未完成工作处理。

[KIP-98](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging)定义了 Kafka 事务、幂等生产者、producer ID/epoch、事务恢复以及把消费 offset 纳入生产者事务的机制；[KIP-129](https://cwiki.apache.org/confluence/display/KAFKA/KIP-129%3A+Streams+Exactly-Once+Semantics)进一步把 Kafka Streams 的输入、状态日志、输出和 offset 描述成同一个原子处理单元。

它与 DDIA 消息 ID 表的对应关系可以概括为：

| DDIA 的数据库消费者 | Kafka Streams |
| --- | --- |
| 唯一消息 ID | `(topic, partition, offset)` |
| `processed_messages` 表 | 消费组 offset 与状态 changelog |
| ID 与业务数据在一个数据库事务中提交 | offset、Kafka 输出和 changelog 在一个 Kafka 事务中提交 |
| ACK 后删除 ID | offset 持续向前推进，不维护逐消息删除流程 |
| 唯一约束阻止重复效果 | 幂等生产者、事务与 `read_committed` 隔离隐藏重复或中止的输出 |

## 六、Kafka Streams 的保证有明确边界

Kafka Streams 能够高效实现这套语义，一个重要原因是它把需要原子化的持久状态都收拢在 Kafka 内部：输入是 Kafka topic，输出是 Kafka topic，消费进度在 `__consumer_offsets` 中，状态变更可以记入 Kafka changelog。

如果处理函数直接更新 PostgreSQL、调用支付接口或发送邮件，这些外部副作用不会自动加入 Kafka 事务。Kafka 官方 DSL 文档也明确指出，写入外部系统时，消息交付、失败重试和防重责任重新回到应用一侧，参见 [Writing to systems other than Kafka](https://kafka.apache.org/43/streams/developer-guide/dsl-api/#writing-streams-back-to-kafka)。

这时仍然需要根据边界选择协议：

- 对外部数据库使用消息 ID 表、幂等业务键或条件更新；
- 使用 Transactional Outbox 先在本地事务中保存待发送事件，再异步发布；
- 对不可事务化的副作用设计可重试的业务协议，例如带幂等键的支付 API；
- 只有在所有参与系统都支持且成本可接受时，才考虑分布式事务。

所以 `processing.guarantee=exactly_once_v2` 不能被理解成“这个进程中的任意代码都只产生一次效果”。它保证的是 Kafka Streams 能够控制的事务边界。

## 七、设计去重表时真正要回答的问题

把 DDIA 的示例落到生产环境时，至少需要明确下面几件事：

1. 消息 ID 是否稳定、全局唯一，并在每次重试时保持不变？
2. 消息 ID 与业务修改是否使用同一个数据库、同一个本地事务？
3. `message_id` 是否有唯一约束，能够处理并发重复投递？
4. ACK 是否严格发生在数据库提交成功之后？
5. 处理程序如何确认 ACK 已被消息代理可靠接受？
6. 消息代理可能在多长时间内重复投递或重新驱动旧消息？
7. 去重记录保留多久，由谁清理，清理失败是否可监控？
8. 邮件、HTTP 调用等事务外副作用如何实现幂等或补偿？
9. 所谓“恰好一次”覆盖的是数据库效果、Kafka 输出，还是端到端业务结果？

最后一个问题最重要。没有一种名为“恰好一次”的全局开关，能够跨越任意数据库、消息代理、HTTP 服务和现实世界动作。每个实现都只能在自己控制的持久化边界内，把“处理结果”和“处理进度”绑定起来。

## 结语

DDIA 的消息 ID 表并不是一个关于“记住所有历史消息”的技巧，而是一种对故障窗口的安排：允许消息重复到达，用本地事务把去重事实与业务事实绑定，再把消息确认放在提交之后。

NServiceBus 展示了这种模式在生产框架中的样子：`MessageId` 主键、业务状态与 Outbox 记录共同提交，派发后保留一段去重窗口，再异步清理。Kafka Streams 则展示了另一种答案：不维护逐消息 ID 表，而是把 offset、状态 changelog 和输出消息都收进 Kafka 事务。

二者的共同点不是“代码只执行一次”，而是：

> 即使代码因为故障而重试，受保护边界内的持久化效果仍然只出现一次。
