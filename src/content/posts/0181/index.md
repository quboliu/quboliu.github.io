---
lang: "zh-CN"
pubDatetime: 2026-09-14T19:00:00+08:00
timezone: "Asia/Shanghai"
title: "这些基础设施软件，最初究竟要解决什么问题？"
contentType: "original"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "系统设计"
  - "PostgreSQL"
  - "Redis"
  - "Kafka"
  - "etcd"
  - "ZooKeeper"
  - "Nginx"
description: "从 PostgreSQL、Redis、Kafka、etcd、ZooKeeper 与 Nginx 的诞生问题出发，理解它们的设计取舍、用途演变与今天的边界。"
---

选基础设施的时候，我们很容易先问：这个软件能不能做缓存，能不能做队列，能不能做锁？

答案往往都是“能”。数据库里建一张表，可以表达待执行任务；键值存储里放一个有过期时间的键，可以表达临时占有；有了扩展机制，数据库还可以接入向量索引、搜索引擎和图查询。功能表越长，选择反而越难。

更有解释力的问题是：**它最初遇到了什么困难，以至于已有工具不够用了？为了解决这个困难，它把哪些能力做得特别好，又接受了哪些代价？**

软件的出身不会永久限制它的用途，却能帮助我们读懂它的接口和实现。下面选择六个常见组件，沿着这个问题看它们的来历。历史部分以项目文档、作者回忆和原始论文为依据；现状核对于 2026 年 9 月，关注能力与职责，不制作版本排名。

## PostgreSQL 要解决什么问题：数据库能否理解更丰富的数据？

把 PostgreSQL 理解成“另一个存表格的数据库”，会漏掉它历史上很重要的一条线：可扩展性。

它源于 Michael Stonebraker 领导的 Berkeley POSTGRES 项目，1986 年开始实现。随后 Andrew Yu 和 Jolly Chen 为其加入 SQL，形成 Postgres95；1996 年采用 PostgreSQL 这个名字。早期 POSTGRES 对数据模型、规则系统和存储管理的探索，逐步演变成今天的对象关系数据库。[PostgreSQL 官方历史](https://www.postgresql.org/docs/current/history.html)

它长期要回答的问题是：当数据不再只是几个简单字段，数据库能否仍然负责查询、约束和持久化，而不必把所有复杂性都丢给应用？今天的自定义类型、函数、操作符、索引方法与扩展机制，延续了这种方向。[Extending SQL](https://www.postgresql.org/docs/current/extend.html)

这解释了为什么 JSONB、全文搜索、PostGIS、pgvector 能在同一个生态里出现。它们之间也有重要区别：JSONB 与全文搜索是内置能力，PostGIS 和 pgvector 是另外安装的扩展。采用后者仍需核查版本兼容、升级与运行成本，不能把“都能用 SQL 调用”理解成“内部完全一样”。[PostgreSQL JSON 类型](https://www.postgresql.org/docs/current/datatype-json.html)、[全文搜索](https://www.postgresql.org/docs/current/textsearch.html)、[pgvector 项目](https://github.com/pgvector/pgvector)

一个很有价值的使用方向，是把必须一起成功或失败的数据变化放进同一个事务。例如业务状态与待执行任务同库、同事务提交，能够避免一次普通的数据库与队列双写。但任务调用外部服务之后的结果，仍然需要单独处理；事务边界并不会跟着 SQL 连接延伸到整个世界。

因此，面对 PostgreSQL 应当追问：哪些事实需要一起提交？哪些查询需要索引？工作负载是否在争抢同一套 I/O、连接和缓存？它的通用性来自可组合的机制，不意味着每一种负载都有相同的成本。

## Redis 要解决什么问题：怎样快速操作不断变化的数据结构？

Redis 于 2009 年出现，诞生于 Salvatore Sanfilippo 的 LLOOGG 实时网站分析项目。作者早期的生产使用报告已经在讨论列表等数据结构以及持久化；它的起点并不是“给关系数据库配一个缓存”这么狭窄。[Redis 十周年回顾](https://redis.io/blog/redis-turns-10/)、[作者的 LLOOGG 使用报告](https://groups.google.com/g/redis-db/c/DHBqQ7x4sOU)

实时分析会遇到一类很具体的工作：更新计数、维护最近事件、记录集合关系。Redis 把常用结构及其操作放进服务端，让应用通过命令直接改变状态，省去反复取回对象、修改、写回的过程。内存中的数据与紧凑的操作路径，使它特别适合低延迟状态访问。

今天的 Redis 已经包含字符串、哈希、列表、集合、有序集合、Streams 等多种结构。它既能承担缓存，也能承担其他状态与事件处理职责；是否适合做某个系统的权威记录，要结合持久化、复制和恢复配置判断。[Redis 数据类型](https://redis.io/docs/latest/develop/data-types/)、[持久化文档](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)

这里最容易产生误会的是“原子”。单个实例里原子执行一次命令，不代表这条命令的结果已经同步到所有副本，也不代表其他系统上的业务动作跟着原子执行。Redis 官方锁文档就列出了主节点在复制完成前故障、接替它的副本缺少锁记录的情况。[Distributed Locks with Redis](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)

所以，“Redis 能不能做锁”的下一问应当是：锁失效意味着多算一次，还是会写坏不可接受的数据？前一种用途与后一种用途，需要的保证不同。原始用途帮助解释 Redis 的优势，具体保证才决定一次使用是否成立。

## Kafka 要解决什么问题：事件怎样同时抵达许多系统，并能重新消费？

Kafka 在 LinkedIn 内部形成，2011 年开源。最初需要处理的是页面访问、搜索、广告展示等大量活动事件，并把数据交给实时应用和离线分析。早期项目介绍已经强调高吞吐日志汇集，以及实时、离线消费的统一入口。[LinkedIn 开源公告](https://www.linkedin.com/blog/member/archive/open-source-linkedin-kafka)、[2011 年项目介绍](https://www.linkedin.com/blog/engineering/archive/come-linkedin-hear-talk-about-kafka-our-open-source-distributed-pub-sub-messaging-system)

这与“找一个空闲 worker，把任务交给它，完成后删除”不是完全相同的问题。一个订单事件可能同时被搜索、推荐、统计系统使用；某个消费者宕机后，还需要从旧位置继续。事件不能因为一个消费者处理完就失去对其他消费者的价值。

Kafka 围绕分区日志组织这些需求：按保留策略保存记录，不同消费组维护各自进度，顺序保证以分区为边界。今天它还提供 Connect、Streams 等配套能力，形成事件流平台。具体交付保证仍受生产者配置、复制配置与消费者处理方式影响，外部业务副作用不会天然“恰好一次”。[Kafka 官方介绍](https://kafka.apache.org/41/getting-started/introduction/)

它的演变还有一个值得注意的例子：Kafka 4.0 已移除 ZooKeeper 模式，使用 KRaft 管理元数据。这消除了一个外部依赖，却没有消除元数据协调问题；相关职责进入了 Kafka 自身。[Kafka 升级说明](https://kafka.apache.org/41/getting-started/upgrade/)、[KRaft 与 ZooKeeper 的差异](https://kafka.apache.org/41/getting-started/zk2kraft/)

选 Kafka 前，应问：我需要的是任务领取，还是可保留、可重放、被多个群体独立消费的事件历史？只比较“每秒入队多少条”，可能还没比较到它的主要价值。

## ZooKeeper 要解决什么问题：分布式应用怎样避免各自发明一套协调协议？

Yahoo! 的不同分布式应用反复遇到配置管理、成员关系、主节点选举和互斥访问。ZooKeeper 试图抽取这些需求的公共部分。2010 年原始论文将它描述为构建高级协调原语的内核，而不是一个包办全部业务语义的服务。[ZooKeeper 原始论文](https://www.usenix.org/events/usenix10/tech/full_papers/Hunt.pdf)

它提供层级化的 znode、版本检查、临时节点、顺序节点与变更通知。应用在这些机制之上构造选举或锁。原论文有意避免把阻塞式锁直接做成服务端的基本接口，同时又明确展示了构造锁的方法；因此，“它不是只有锁接口”和“它没有为锁考虑过”是两回事。

ZooKeeper 的重要取舍是：通过 Zab 排序更新，同时允许普通读取在本地副本完成。不能把它笼统描述成“任何读写都自动获得线性一致性”。它优化的是协调数据，而非海量业务正文；官方概述也要求 znode 保存小量协调信息。[ZooKeeper 官方概述](https://zookeeper.apache.org/doc/current/zookeeperOver.html)

今天仍然可以用它协调分布式进程，但使用者必须完成客户端那一半协议。会话失效可以使临时节点消失，却不能让已经暂停的客户端永远停下。这个客户端恢复后，如果还能向外部资源写入，资源端就必须有办法识别、拒绝失效的操作。

选 ZooKeeper 前，应问：哪些协调状态需要一致地改变？客户端失联后，谁负责隔离旧拥有者？“集群使用了共识协议”不能替代后一个问题。

## etcd 要解决什么问题：集群的关键配置与状态应该信谁？

etcd 于 2013 年诞生于 CoreOS。名字来自 Unix 的 `/etc` 与 distributed：把单机配置目录的想法延伸到多机器环境。它要可靠保存系统赖以协调的元数据，例如配置、服务发现信息和工作分配。[CNCF 项目历史](https://www.cncf.io/announcements/2020/11/24/cloud-native-computing-foundation-announces-etcd-graduation/)、[Why etcd](https://etcd.io/docs/v3.6/learning/why/)

相比“尽快取出一个键”，这里更关心的是：两边发生分歧时，能否避免对同一份关键状态作出冲突决定？etcd 通过 Raft 复制状态，并提供条件事务、修订号、Watch 与 Lease。默认 KV 操作提供强一致保证，但显式选择 `serializable` 的读取可能返回旧数据，Watch 的通知也可能延迟。[etcd API 保证](https://etcd.io/docs/v3.6/learning/api_guarantees/)

它在 Kubernetes 中保存由 API Server 写入的集群状态，是今天最容易识别的用途。不过，不要因此把它当成业务应用随手可用的缓存集群：控制面的恢复能力与资源预算，关系到整个集群。

一个更接近早期问题的例子是 CoreOS locksmith：利用 etcd 协调机器重启，避免所有节点同时维护。它需要的是可靠地限制同时行动的参与者数量，而非存储庞大的用户事件历史。[etcd 官方用例](https://etcd.io/docs/v3.6/learning/why/#use-cases)

etcd 与 ZooKeeper 都可承担协调职责，但数据模型、读取语义和客户端协议不同；不能仅凭它们都“偏 CP”就把 API 当成可以直接互换。选 etcd 前，应问：这些数据是不是控制系统行为的关键元数据？所用的具体 API 提供什么保证？

## Nginx 要解决什么问题：大量连接为什么不该拖垮 Web 服务？

Nginx 的作者 Igor Sysoev 在 2008 年的一封邮件中回顾：他先开发 Apache 的加速模块，随后为并发扩展问题设计新服务器；2002 年开始草稿，2004 年发布首个公开版本。他同时需要代理、缓存、灵活配置和在线升级等能力。[作者的历史回顾](https://mailman.nginx.org/pipermail/nginx/2008-May/004816.html)

这个背景常被称作 C10K 问题：怎样有效处理上万并发连接。并发连接数量不是每秒请求数，大量慢客户端也可能长期占着连接。事件驱动架构让 worker 在 I/O 尚未就绪时处理别的连接，减少等待对资源的占用。[Nginx 二十周年回顾](https://blog.nginx.org/blog/celebrating-20-years-of-nginx)

今天 Nginx 同时承担 HTTP 服务、反向代理、缓存、负载均衡和 TCP/UDP 代理等职责。它优化的是流量进入、转发与响应的路径。[Nginx 官方介绍](https://nginx.org/en/)

但代理把请求送到另一个健康后端，不等于可以任意重试一次有副作用的业务操作。故障发生在“请求没有抵达”和“已经执行、响应丢失”之间时，代理通常无法仅靠连接状态确定业务结果。业务幂等仍然需要应用协议配合。[代理重试配置](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_next_upstream)

因此，问 Nginx 能不能承担一个新职责时，要看它是否仍然属于请求路径上的工作，以及阻塞操作和业务状态会给这条路径带来什么影响。

## 把功能清单换成问题清单

六种软件并不处于同一层，也不是一组选一个的替代品。它们分别强调了数据表达、状态操作、事件传播、协调与连接处理。

| 系统 | 最值得保留的核心问题 | 不能由名称自动推出的保证 |
| --- | --- | --- |
| PostgreSQL | 哪些数据与变化应在数据库里共同管理？ | 所有扩展、实例和外部动作共享一个事务 |
| Redis | 怎样低延迟操作热点状态与数据结构？ | 单实例原子操作等于故障切换后仍然互斥 |
| Kafka | 事件怎样保留、重放并服务多个消费者？ | 所有分区全局有序、所有副作用恰好一次 |
| ZooKeeper | 怎样提供可组合的协调机制？ | 锁节点存在就能阻止所有外部旧写入 |
| etcd | 集群关键元数据怎样可靠地达成一致？ | 所有读取与通知都立即反映最新状态 |
| Nginx | 怎样高效接住、转发并管理连接？ | 代理重试天然保持业务幂等 |

新用途并不一定违背原设计。PostgreSQL 的扩展能力，本来就允许更丰富的数据处理；Redis 的数据结构，也自然支持缓存之外的工作。反过来，组件名字完全符合架构图上的方框，也不表示我们已经实现了所需语义。

历史能够给出选型的起点。最终仍应回到一次具体调用：它承诺什么，失败时还剩下什么，以及团队愿意为这份承诺付出多少成本。下一篇将从 Redis 分布式锁的争论出发，把这些问题放进理论与工程实践的同一张账本。

文档说明：Kafka 能力引用 4.1 文档，etcd 引用 3.6 文档，均在写作时核查；这些版本号不表示它们是当时的最新版本。
