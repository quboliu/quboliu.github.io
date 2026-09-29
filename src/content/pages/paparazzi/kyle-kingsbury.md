---
title: "Kyle Kingsbury（Aphyr）"
description: "Kyle Kingsbury 的 Jepsen、Elle、Riemann、Clojure 教学及公开技术写作档案。"
subjectName: "Kyle Kingsbury (Aphyr)"
paparazziTier: "eminent"
avatarCandidates:
  - url: "https://github.com/aphyr.png?size=400"
    source: "GitHub 公开头像"
    profileUrl: "https://github.com/aphyr"
---

## 〇、线索、身份与快照

- **原始线索：** 用户由 [Jepsen 的一致性模型目录](https://jepsen.io/consistency/models)与 Jepsen / Elle 的关系追问到 Kyle Kingsbury（Aphyr）。
- **身份核实：** [Kyle 的 About 页面](https://aphyr.com/about)明确写出本名、Aphyr 别名及 Jepsen、Riemann、《Clojure from the Ground Up》；[Jepsen 演讲页](https://jepsen.io/talks)直接以 Kyle Kingsbury 署名；[Elle 论文](https://www.vldb.org/pvldb/vol14/p268-alvaro.pdf)以 Kyle Kingsbury 和 Peter Alvaro 联名发表。这里的 **Jepsen 是项目及机构，Elle 是事务隔离检查器，Kyle 才是人物**。
- **核查日期：** 2026-09-24。调查范围为公开专业作品：个人站的 359 篇文章索引（2005-05-08 至 2026-06-12）、[Jepsen 全部公开分析目录](https://jepsen.io/analyses)、Jepsen 项目仓库、[演讲目录](https://jepsen.io/talks)、Riemann 官网与 Elle 论文。个人博客的非技术生活记录不逐条收录；Jepsen 的机构报告不默认视作 Kyle 的个人独著。
- **第二档定位：** 他开创并长期推进 Jepsen 的公开验证案例；[Jepsen 仓库](https://github.com/jepsen-io/jepsen)将可重复的故障注入与历史检查组合为框架；[Elle 论文](https://www.vldb.org/pvldb/vol14/p268-alvaro.pdf)与[实现](https://github.com/jepsen-io/elle)进一步提供事务异常检查方法。这是分布式系统正确性测试领域持续十余年的标杆工作。第一档维持本站原有的跨领域、跨学科方法性影响门槛；本案现有证据支持第二档，不以知名度替代作品证据。

## 一、Riemann：事件流监控系统

[个人简介](https://aphyr.com/about)确认 Kyle 是 [Riemann](https://riemann.io/) 的作者。项目将事件流、索引与流处理用于系统监控；下列是个人博客索引中标有 Riemann 的全部 12 篇记录，日期取其站点归档。

- 2012-02-18 · [Riemann: Breaking the 10k barrier](https://aphyr.com/posts/229-riemann-breaking-the-10k-barrier)。
- 2012-03-08 · [Riemann 0.1.0](https://aphyr.com/posts/230-riemann-0-1-0)。
- 2012-05-20 · [Eliminating reflection](https://aphyr.com/posts/232-eliminating-reflection)。
- 2012-05-20 · [Riemann Recap: Client Libraries and Performance](https://aphyr.com/posts/231-riemann-recap-client-libraries-and-performance)。
- 2012-10-23 · [The Future of Riemann](https://aphyr.com/posts/255-the-future-of-riemann)。
- 2012-11-13 · [Riemann 0.1.3](https://aphyr.com/posts/256-riemann-0-1-3)。
- 2012-12-03 · [Riemann: longs and doubles](https://aphyr.com/posts/260-riemann-longs-and-doubles)。
- 2013-01-28 · [Pipelining requests](https://aphyr.com/posts/267-pipelining-requests)。
- 2013-01-31 · [Reaching 200K events/sec](https://aphyr.com/posts/269-reaching-200k-events-sec)。
- 2013-02-05 · [Blathering about Riemann consistency](https://aphyr.com/posts/273-blathering-about-riemann-consistency)。
- 2013-03-10 · [65K messages/sec](https://aphyr.com/posts/279-65k-messages-sec)。
- 2013-03-17 · [Riemann 0.2.0](https://aphyr.com/posts/280-riemann-0-2-0)。

## 二、Clojure 教学与编程实践

个人简介将《Clojure from the Ground Up》列为代表作；以下列出个人归档标记该系列的全部 11 篇文章。系列与 Jepsen 的 Clojure 实现有关，但它本身是一项独立的教学工作。

- 2013-10-26 · [Clojure from the ground up: basic types](https://aphyr.com/posts/302-clojure-from-the-ground-up-basic-types)。
- 2013-10-26 · [Clojure from the ground up: welcome](https://aphyr.com/posts/301-clojure-from-the-ground-up-welcome)。
- 2013-11-03 · [Clojure from the ground up: functions](https://aphyr.com/posts/303-clojure-from-the-ground-up-functions)。
- 2013-11-18 · [Clojure from the ground up: sequences](https://aphyr.com/posts/304-clojure-from-the-ground-up-sequences)。
- 2013-11-26 · [Clojure from the ground up: macros](https://aphyr.com/posts/305-clojure-from-the-ground-up-macros)。
- 2013-12-01 · [Clojure from the ground up: state](https://aphyr.com/posts/306-clojure-from-the-ground-up-state)。
- 2014-02-15 · [Clojure from the ground up: logistics](https://aphyr.com/posts/311-clojure-from-the-ground-up-logistics)。
- 2014-02-19 · [Clojure from the ground up: modeling](https://aphyr.com/posts/312-clojure-from-the-ground-up-modeling)。
- 2014-08-26 · [Clojure from the ground up: debugging](https://aphyr.com/posts/319-clojure-from-the-ground-up-debugging)。
- 2014-08-26 · [Clojure from the ground up: roadmap](https://aphyr.com/posts/318-clojure-from-the-ground-up-roadmap)。
- 2020-08-27 · [Clojure from the ground up: polymorphism](https://aphyr.com/posts/352-clojure-from-the-ground-up-polymorphism)。

另有与工程方法有关的代表性文章（按日期）：

- 2013-12-22 · [Knossos: Redis and linearizability](https://aphyr.com/posts/309-knossos-redis-and-linearizability)。
- 2016-08-15 · [Serializability, linearizability, and locality](https://aphyr.com/posts/333-serializability-linearizability-and-locality)。
- 2020-09-15 · [Rewriting the Technical Interview](https://aphyr.com/posts/353-rewriting-the-technical-interview)。
- 2020-10-14 · [Unifying the Technical Interview](https://aphyr.com/posts/354-unifying-the-technical-interview)。
- 2022-06-23 · [Loopr: A Loop/Reduction Macro for Clojure](https://aphyr.com/posts/360-loopr-a-loop-reduction-macro-for-clojure)。
- 2023-04-27 · [Fast Multi-Accumulator Reducers](https://aphyr.com/posts/363-fast-multi-accumulator-reducers)。
- 2023-08-18 · [10⁹ Operations: Large Histories with Jepsen](https://aphyr.com/posts/365-10-operations-large-histories-with-jepsen)。
- 2023-12-05 · [Why is Jepsen Written in Clojure?](https://aphyr.com/posts/367-why-is-jepsen-written-in-clojure)。
- 2025-11-14 · [Op Color Plots](https://aphyr.com/posts/399-op-color-plots)。

## 三、Jepsen：可复核的分布式系统分析

2013 年 [个人博客的 Jepsen 初始系列](https://aphyr.com/posts/281-jepsen-on-the-perils-of-network-partitions)公开展示网络分区下的系统行为；[项目 README](https://github.com/jepsen-io/jepsen)说明框架如何部署真实系统、生成操作历史、注入故障，再由检查器判定观察到的行为。[官方分析目录](https://jepsen.io/analyses)截至本次核查共有 50 份条目，覆盖 2013—2026 年。这一目录属于 Jepsen 机构成果；早期报告在 Kyle 个人博客，后期报告需按各页实际署名区分作者。以下完整列出该目录，日期与版本沿用官方索引。

- 2013-05-18 · [MongoDB 2.4.3](https://aphyr.com/posts/284-call-me-maybe-mongodb)。
- 2013-05-18 · [Redis 2.6.13](https://aphyr.com/posts/283-call-me-maybe-redis)。
- 2013-05-19 · [Riak 1.2.1](https://aphyr.com/posts/285-call-me-maybe-riak)。
- 2013-09-23 · [NuoDB 1.2](https://aphyr.com/posts/292-call-me-maybe-nuodb)。
- 2013-09-23 · [Zookeeper 3.4.5](https://aphyr.com/posts/291-call-me-maybe-zookeeper)。
- 2013-09-24 · [Cassandra 2.0.0](https://aphyr.com/posts/294-call-me-maybe-cassandra)。
- 2013-09-24 · [Kafka 0.8 beta](https://aphyr.com/posts/293-call-me-maybe-kafka)。
- 2013-12-10 · [Redis WAIT](https://aphyr.com/posts/307-call-me-maybe-redis-redux)。
- 2014-06-06 · [RabbitMQ 3.3.0](https://aphyr.com/posts/315-call-me-maybe-rabbitmq)。
- 2014-06-09 · [etcd 0.4.1](https://aphyr.com/posts/316-call-me-maybe-etcd-and-consul)。
- 2014-06-15 · [Elasticsearch 1.1.0](https://aphyr.com/posts/317-call-me-maybe-elasticsearch)。
- 2015-04-20 · [MongoDB 2.6.7](https://aphyr.com/posts/322-call-me-maybe-mongodb-stale-reads)。
- 2015-04-27 · [Elasticsearch 1.5.0](https://aphyr.com/posts/323-call-me-maybe-elasticsearch-1-5-0)。
- 2015-05-04 · [Aerospike 3.5.4](https://aphyr.com/posts/324-call-me-maybe-aerospike)。
- 2015-08-10 · [Chronos 2.4.0](https://aphyr.com/posts/326-call-me-maybe-chronos)。
- 2015-09-01 · [MariaDB Galera Cluster 10.0](https://aphyr.com/posts/327-call-me-maybe-mariadb-galera-cluster)。
- 2015-09-04 · [Percona XtraDB Cluster 5.6.25](https://aphyr.com/posts/328-call-me-maybe-percona-xtradb-cluster)。
- 2016-01-04 · [RethinkDB 2.1.5](https://jepsen.io/analyses/rethinkdb-2-1-5)。
- 2016-01-22 · [RethinkDB 2.2.3](https://jepsen.io/analyses/rethinkdb-2-2-3-reconfiguration)。
- 2016-06-28 · [Crate 0.54.9](https://aphyr.com/posts/332-jepsen-crate-0-54-9-version-divergence)。
- 2016-07-12 · [VoltDB 6.3](https://jepsen.io/analyses/voltdb-6-3)。
- 2017-02-07 · [MongoDB 3.4.0‑rc3](https://jepsen.io/analyses/mongodb-3-4-0-rc3)。
- 2017-02-16 · [CockroachDB beta-20160829](https://jepsen.io/analyses/cockroachdb-beta-20160829)。
- 2017-09-05 · [Tendermint 0.10.2](https://jepsen.io/analyses/tendermint-0-10-2)。
- 2017-10-06 · [Hazelcast 3.8.3](https://jepsen.io/analyses/hazelcast-3-8-3)。
- 2018-03-07 · [Aerospike 3.99.0.3](https://jepsen.io/analyses/aerospike-3-99-0-3)。
- 2018-08-23 · [Dgraph 1.0.2](https://jepsen.io/analyses/dgraph-1-0-2)。
- 2018-10-23 · [MongoDB 3.6.4](https://jepsen.io/analyses/mongodb-3-6-4)。
- 2019-03-05 · [FaunaDB 2.5.4](https://jepsen.io/analyses/faunadb-2.5.4)。
- 2019-03-26 · [YugaByte DB 1.1.9](https://jepsen.io/analyses/yugabyte-db-1.1.9)。
- 2019-06-12 · [TiDB 2.1.7](https://jepsen.io/analyses/tidb-2.1.7)。
- 2019-09-05 · [YugaByte DB 1.3.1](https://jepsen.io/analyses/yugabyte-db-1.3.1)。
- 2020-01-30 · [etcd 3.4.3](https://jepsen.io/analyses/etcd-3.4.3)。
- 2020-04-30 · [Dgraph 1.1.1](https://jepsen.io/analyses/dgraph-1.1.1)。
- 2020-05-15 · [MongoDB 4.2.6](https://jepsen.io/analyses/mongodb-4.2.6)。
- 2020-06-12 · [PostgreSQL 12.3](https://jepsen.io/analyses/postgresql-12.3)。
- 2020-06-23 · [Redis-Raft 1b3fbf6](https://jepsen.io/analyses/redis-raft-1b3fbf6)。
- 2020-12-23 · [Scylla 4.2-rc3](https://jepsen.io/analyses/scylla-4.2-rc3)。
- 2022-02-05 · [Radix DLT 1.0-beta.35.1](https://jepsen.io/analyses/radix-dlt-1.0-beta.35.1)。
- 2022-04-29 · [Redpanda 21.10.1](https://jepsen.io/analyses/redpanda-21.10.1)。
- 2023-12-19 · [MySQL 8.0.34](https://jepsen.io/analyses/mysql-8.0.34)。
- 2024-01-31 · [RavenDB 6.0.2](https://jepsen.io/analyses/ravendb-6.0.2)。
- 2024-05-15 · [Datomic 1.0.7075](https://jepsen.io/analyses/datomic-pro-1.0.7075)。
- 2024-08-08 · [jetcd 0.8.2](https://jepsen.io/analyses/jetcd-0.8.2)。
- 2024-11-12 · [Bufstream 0.1.0](https://jepsen.io/analyses/bufstream-0.1.0)。
- 2025-04-29 · [Amazon RDS for PostgreSQL 17.4](https://jepsen.io/analyses/amazon-rds-for-postgresql-17.4)。
- 2025-06-06 · [TigerBeetle 0.16.11](https://jepsen.io/analyses/tigerbeetle-0.16.11)。
- 2025-08-07 · [Capela dda5892](https://jepsen.io/analyses/capela-dda5892)。
- 2025-12-08 · [NATS 2.12.1](https://jepsen.io/analyses/nats-2.12.1)。
- 2026-03-16 · [MariaDB Galera Cluster 12.1.2](https://jepsen.io/analyses/mariadb-galera-cluster-12.1.2)。

## 四、Elle、Maelstrom 与一致性知识库

- 2014-05-15 · [Strong consistency models](https://aphyr.com/posts/313-strong-consistency-models)：Kyle 个人博客对强一致性模型的解释。
- 2017-04-12 · [Maelstrom 仓库](https://github.com/jepsen-io/maelstrom)：Jepsen 组织的分布式系统实验工作台；日期是 [GitHub 仓库创建日期](https://api.github.com/repos/jepsen-io/maelstrom)，并非首次发布日。此处用仓库作为项目入口，不推断 Kyle 独自完成全部贡献。
- 2021 · [Elle: Inferring Isolation Anomalies from Experimental Observations](https://www.vldb.org/pvldb/vol14/p268-alvaro.pdf)：Kyle Kingsbury 与 Peter Alvaro 合著，PVLDB 14(3)，268–280。论文利用可观察事务历史推断依赖关系及异常；[Elle 源码](https://github.com/jepsen-io/elle)提供实现。这里不能把 Elle 写成人名。
- 日期未明确 · [Jepsen 一致性模型目录](https://jepsen.io/consistency/models)：术语、模型关系与相应文献的持续维护入口；用户此前关注的双语转载文章即源于此页。

## 五、演讲、方法与近年的公开写作

[Jepsen 官方演讲页](https://jepsen.io/talks)明确称 Kyle 在美国和欧洲会议讲解测试方法及案例，列出 2014 年 Strangeloop、2015 年 GOTO / dotScale、2017 年 Scala Days、2018 年 GOTO Chicago 以及后来的 Elle、Jepsen XVI–XVIII 等演讲。演讲页未为每一项标明精确日期，故不臆造日期；可从[官方目录](https://jepsen.io/talks)逐项观看。

- 2023-09-03 · [Finding Domains That Send Unactionable Reports in Mastodon](https://aphyr.com/posts/366-finding-domains-that-send-unactionable-reports-in-mastodon)。
- 2024-02-20 · [ClassNotFoundException: java.util.SequencedCollection](https://aphyr.com/posts/369-classnotfoundexception-java-util-sequencedcollection)。
- 2025-02-20 · [Geoblocking the UK with Debian & Nginx](https://aphyr.com/posts/379-geoblocking-the-uk-with-debian-nginx)。
- 2025-10-11 · [Geoblocking Multiple Localities With Nginx](https://aphyr.com/posts/395-geoblocking-multiple-localities-with-nginx)。
- 2025-11-02 · [Notes on "Prothean AI"](https://aphyr.com/posts/396-notes-on-prothean-ai)。
- 2025-11-10 · [The Future of Fact-Checking is Lies, I Guess](https://aphyr.com/posts/398-the-future-of-fact-checking-is-lies-i-guess)。
- 2026-01-26 · [Blocking Claude](https://aphyr.com/posts/403-blocking-claude)。
- 2026-02-04 · [Trudging Through Nonsense](https://aphyr.com/posts/405-trudging-through-nonsense)。
- 2026-03-03 · [Basic Letters with LaTeX](https://aphyr.com/posts/407-basic-letters-with-latex)。
- 2026-03-06 · [Colorado SB26-051 Age Attestation](https://aphyr.com/posts/408-colorado-sb26-051-age-attestation)。
- 2026-04-06 · [The Future of Everything is Lies, I Guess](https://aphyr.com/posts/411-the-future-of-everything-is-lies-i-guess)。
- 2026-04-08 · [The Future of Everything is Lies, I Guess: Dynamics](https://aphyr.com/posts/412-the-future-of-everything-is-lies-i-guess-dynamics)。
- 2026-04-09 · [The Future of Everything is Lies, I Guess: Culture](https://aphyr.com/posts/413-the-future-of-everything-is-lies-i-guess-culture)。
- 2026-04-10 · [The Future of Everything is Lies, I Guess: Information Ecology](https://aphyr.com/posts/414-the-future-of-everything-is-lies-i-guess-information-ecology)。
- 2026-04-11 · [The Future of Everything is Lies, I Guess: Annoyances](https://aphyr.com/posts/415-the-future-of-everything-is-lies-i-guess-annoyances)。
- 2026-04-12 · [The Future of Everything is Lies, I Guess: Psychological Hazards](https://aphyr.com/posts/416-the-future-of-everything-is-lies-i-guess-psychological-hazards)。
- 2026-04-13 · [The Future of Everything is Lies, I Guess: Safety](https://aphyr.com/posts/417-the-future-of-everything-is-lies-i-guess-safety)。
- 2026-04-14 · [The Future of Everything is Lies, I Guess: Work](https://aphyr.com/posts/418-the-future-of-everything-is-lies-i-guess-work)。
- 2026-04-15 · [The Future of Everything is Lies, I Guess: New Jobs](https://aphyr.com/posts/419-the-future-of-everything-is-lies-i-guess-new-jobs)。
- 2026-04-16 · [The Future of Everything is Lies, I Guess: Where Do We Go From Here?](https://aphyr.com/posts/420-the-future-of-everything-is-lies-i-guess-where-do-we-go-from-here)。
- 2026-05-04 · [JStack by Command String](https://aphyr.com/posts/421-jstack-by-command-string)。

## 六、判断与追踪入口

Kyle 的公开轨迹从 2012 年 Riemann 监控系统、2013 年 Clojure 教学与 Jepsen 系列，延伸到 Jepsen 的长期数据库验证、2021 年 Elle 方法论文和持续的系统工程写作。**第二档**依据是方法、工具与公开案例在同一专业领域长期叠加，且个人身份、论文署名和项目记录能相互印证。Jepsen 官网报告数量说明项目产出规模，不自动证明每篇都由他执笔或测试。

后续更新依次核查：[个人博客索引](https://aphyr.com/posts)、[Jepsen 分析目录](https://jepsen.io/analyses)、[Jepsen 代码](https://github.com/jepsen-io/jepsen)、[Elle 代码](https://github.com/jepsen-io/elle)、[官方演讲页](https://jepsen.io/talks)与[GitHub 个人页](https://github.com/aphyr)。本档案只覆盖这些公开来源在 2026-09-24 可见的专业材料，不对私人生活、动机或未来工作作推断。
