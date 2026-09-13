---
lang: "zh-CN"
pubDatetime: 2026-09-13T13:12:15+08:00
timezone: "Asia/Shanghai"
title: "DDIA 阅读札记：端到端重复抑制的工程实现"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "DDIA"
  - "分布式系统"
  - "幂等"
description: "第 13 章端到端重复抑制的核心是让客户端生成请求 ID 并一路传到底。现实里 Stripe 的 Idempotency-Key、SQS FIFO 的去重 ID、支付宝的商户订单号都是这个模式。客户端之间零协调却敢..."
---
DDIA 第 13 章有一个朴素但威力巨大的思想：**让客户端为每个请求生成唯一 ID，一路传递到数据库，用这个 ID 抑制重复**（"唯一标识请求"一节，示例 13-2）。浏览器重复提交表单、网络重试、消息重复投递——只要它们携带的是同一个 ID，系统就只生效一次。这是端到端幂等的钥匙。

这篇梳理三个问题：现实系统怎么用它、客户端之间凭什么不撞、有哪些现成的算法和库。

## 一、书中的原型与关键细节

书里示例 13-2 的做法值得逐行看：

```sql
ALTER TABLE requests ADD UNIQUE (request_id);
BEGIN TRANSACTION;
INSERT INTO requests (request_id, ...) VALUES('0286FDB8-...');
UPDATE accounts SET balance = ...;
COMMIT;
```

要点有三个：

1. **ID 按"逻辑操作"生成，不是按"尝试次数"生成**。同一笔支付重试十次，ID 不变——重试共享同一个身份，这才能被识别为重复；
2. **最后一道闸是数据库的唯一约束**，而不是应用层的"先查再插"。书里特别提醒：唯一性约束在弱隔离级别下依然正确，而应用层的 check-then-insert 在不可串行化隔离下会翻车（写偏差）。这也呼应了本系列前面的结论：唯一性约束本质需要裁决，唯一索引就是那个裁决点；
3. **附带收益**：requests 表本身就是一份事件日志，可用于事件溯源或 CDC，余额更新可以由下游消费者从请求事件派生。

## 二、现实系统怎么用

这个模式在工业界早已是事实标准：

- **Stripe 的 Idempotency-Key**：最常被模仿的参考实现。客户端在 POST 请求头里带一个幂等键（推荐 UUIDv4），[Stripe 把该键对应的首个响应保存至少 24 小时](https://docs.stripe.com/api/idempotent_requests)，窗口内重试直接返回原响应；同键不同参数返回错误（说明是客户端 bug 而非重试）；请求还在处理中同键再来则返回 409。
- **支付宝 / 微信支付的商户订单号**（out_trade_no）：商户自己生成、保证商户内唯一，支付网关据此去重——同一订单号重复下单，返回原单。国内开发者最熟悉的幂等键。
- **AWS**：EC2 `RunInstances` 的 ClientToken；SQS FIFO 的 [MessageDeduplicationId，提供 5 分钟去重窗口](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues-exactly-once-processing.html)，还支持对消息体做 SHA-256 的内容去重。
- **Kafka 幂等 producer**：一个值得注意的对照——它不用客户端生成的 UUID，而是由 broker 分配 producer ID（PID），再配合每分区序列号去重。这是另一种取舍：由服务端签发身份，换来对单个 producer 会话内顺序的严格保证。
- **协议标准化**：IETF 正在把 [Idempotency-Key HTTP 头](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/)推进为标准，说明这个模式已经从"最佳实践"走向"协议设施"。

## 三、客户端之间凭什么不撞？

这是直觉上最难接受的部分：成千上万个互不知情的客户端各自生成 ID，没有任何中心协调，怎么保证 A 和 B 生成的不一样？

**答案有两条路线：**

**路线一：把空间开得足够大，用概率碾压（纯随机）。** UUIDv4 有 122 位随机位。按生日悖论估算，要让碰撞概率达到 50%，需要生成约 2.7×10¹⁸ 个 UUID——**相当于每秒生成 10 亿个、连续 85 年**。在这个量级面前，"会不会撞"从数学问题变成了工程常识问题：不会。这正是它敢零协调的原因——空间大到协调变得毫无必要。支付宝式的商户订单号同理，只是把空间限定在"商户内唯一"，再加商户号做命名空间隔离。

**路线二：结构化分段，用构造保证唯一（Snowflake 式）。** Twitter 的 Snowflake：41 位毫秒时间戳 + 10 位机器号 + 12 位毫秒内序列号。唯一性不靠概率而靠结构——但代价是机器号需要在部署期分配协调，时钟回拨要处理。这类 ID 附带按时间粗略有序的好处（对数据库索引友好）。同族的还有 MongoDB ObjectId、UUIDv7（2024 年 RFC 9562 标准化，时间有序）、ULID、KSUID。

两条路线的分野其实就是：**纯随机用空间换零协调，结构化用协调换有序性**。

## 四、可用的算法和库

| 方案 | 特点 | 代表库 |
|---|---|---|
| UUIDv4 | 纯随机，零协调 | Java `java.util.UUID`、Node `crypto.randomUUID()`、Python `uuid.uuid4()`、Go `google/uuid`、Rust `uuid` crate |
| UUIDv7 | 时间有序 + 随机，索引友好 | 各语言 `uuid` 库（RFC 9562） |
| Snowflake | 时间+机器+序列，需协调机器号 | 各语言实现众多（如 `bwmarrin/snowflake`） |
| ULID / KSUID | 时间有序、字符串友好 | `oklog/ulid`、`segmentio/ksuid` |
| NanoID | 短小、URL 安全、可定制 | `nanoid`（JS 及多语言移植） |

三个工程上的注意点：

1. **务必用密码学安全的随机源**（`crypto.randomUUID()`，不要用 `Math.random()`）——UUID 的碰撞保证建立在真随机之上，弱伪随机会把 85 年的安全余量作废；
2. **窗口对齐**：服务端保留键的时长（Stripe 24 小时、SQS 5 分钟）必须覆盖客户端的重试窗口，超出窗口的重试会被当作新请求——SQS 的 5 分钟窗口盖不住所有重试场景，应用层去重表依然必要；
3. **键要加作用域**：实际系统里通常把键限定在"用户 + 接口"的命名空间内，避免跨用户串号，也便于发现"同键不同参数"的客户端错误。

## 结语

客户端生成请求 ID 这个思想，本质是把"防止重复"的责任从系统内部转移到请求的整个生命周期：**身份在客户端诞生，在传输中保持，在数据库唯一索引处终审**。客户端敢自己发身份证，是因为随机空间大到无需登记处；系统敢信任这张身份证，是因为最后一道闸（唯一约束）不需要信任任何人。两端各退一步，端到端幂等就成立了。
