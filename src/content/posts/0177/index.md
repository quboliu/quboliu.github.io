---
lang: "zh-CN"
pubDatetime: 2026-09-14T10:28:25+08:00
timezone: "Asia/Shanghai"
title: "转载 | PostgreSQL for Everything｜PostgreSQL 无所不能（中英对照）"
contentType: "repost"
area: "databases"
featured: false
draft: false
tags:
  - "转载"
  - "PostgreSQL"
  - "数据库"
  - "全文搜索"
  - "时序数据库"
  - "向量数据库"
description: "转载并翻译 Raphael A. Bauer 关于用 PostgreSQL 简化技术栈的文章：从全文搜索、JSON、队列和时序数据，到向量、缓存、图数据库与微服务。"
---
> **Source and translation basis｜来源与翻译依据**
>
> Dr. Raphael A. Bauer, *PostgreSQL for Everything*, February 14, 2024. [Original article](https://www.raphaelbauer.com/posts/postgresql-everything/). The cover image is reproduced from the original article: [db-servers.jpg](https://www.raphaelbauer.com/images/db-servers.jpg).
>
> 本文是 Dr. Raphael A. Bauer 的文章《PostgreSQL for Everything》的中英对照转载。英文正文按原网页顺序保留，中文翻译紧随英文段落或列表；文中的链接均指向原文提供的出处。原文封面图来自作者页面，并在上方标明来源。

![PostgreSQL for Everything｜PostgreSQL 无所不能](./db-servers.jpg)

Contrary to popular belief - the answer to everything is NOT 42 - it’s PostgreSQL. (ok. It might also be [Postgres](https://wiki.postgresql.org/wiki/FAQ#What_is_PostgreSQL.3F_How_is_it_pronounced.3F_What_is_Postgres.3F)).

> 与流行看法相反，能够回答一切问题的答案并不是 42，而是 PostgreSQL。（好吧，也可能是 [Postgres](https://wiki.postgresql.org/wiki/FAQ#What_is_PostgreSQL.3F_How_is_it_pronounced.3F_What_is_Postgres.3F)。）

*This article was [discussed on Hacker News](https://news.ycombinator.com/item?id=49361279). The thread contains a lot of additional links, real-world experience and critical thoughts - well worth reading.*

> *本文曾在 [Hacker News](https://news.ycombinator.com/item?id=49361279) 上引发讨论。讨论串里有许多额外链接、真实世界的使用经验和批判性思考，很值得一读。*

## Table Of Contents｜目录

- [Intro](https://www.raphaelbauer.com/posts/postgresql-everything/#intro)｜简介
- [Rock Solid and Stable](https://www.raphaelbauer.com/posts/postgresql-everything/#rock-solid-and-stable)｜坚如磐石且稳定
- [Easy to Run, Install and Scale](https://www.raphaelbauer.com/posts/postgresql-everything/#easy-to-run-install-and-scale)｜易于运行、安装与扩展
- [Simplifies Your IT Setup](https://www.raphaelbauer.com/posts/postgresql-everything/#simplifies-your-it-setup)｜简化 IT 架构
  - [PostgreSQL Replaces Solr and Elastic: Full-Text Search](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql-replaces-solr-and-elastic-full-text-search)｜PostgreSQL 替代 Solr 和 Elastic：全文搜索
  - [PostgreSQL replaces MongoDB: Excellent Json Support](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql-replaces-mongodb-excellent-json-support)｜PostgreSQL 替代 MongoDB：出色的 JSON 支持
  - [PostgreSQL replaces Kafka and RabbitMQ: PostgreSQL as a queue](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql-replaces-kafka-and-rabbitmq-postgresql-as-a-queue)｜PostgreSQL 替代 Kafka 和 RabbitMQ：把 PostgreSQL 当作队列
  - [PostgreSQL Replaces Clickhouse: High Volume Time Series Data](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql-replaces-clickhouse-high-volume-time-series-data)｜PostgreSQL 替代 ClickHouse：海量时序数据
  - [PostgreSQL as Vector Database for AI Workflows](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql-as-vector-database-for-ai-workflows)｜PostgreSQL 作为 AI 工作流的向量数据库
  - [PostgreSQL Replaces Redis: Non-Persistent High Performance Caching](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql-replaces-redis-non-persistent-high-performance-caching)｜PostgreSQL 替代 Redis：非持久化高性能缓存
  - [PostgreSQL Replaces File System: For Raw Data](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql-replaces-file-system-for-raw-data)｜PostgreSQL 替代文件系统：存放原始数据
  - [PostgreSQL Replacing Your Graph Database](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql-replacing-your-graph-database)｜PostgreSQL 替代你的图数据库
  - [PostgreSQL as Replacement for GraphDB and Neo4J](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql-as-replacement-for-graphdb-and-neo4j)｜PostgreSQL 替代 GraphDB 和 Neo4J
  - [PostgreSQL Replacing Your Microservice](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql-replacing-your-microservice)｜PostgreSQL 替代微服务
  - [PostgreSQL - Replacing your Playstation 5](https://www.raphaelbauer.com/posts/postgresql-everything/#postgresql---replacing-your-playstation-5)｜PostgreSQL 替代你的 PlayStation 5
- [Conclusion](https://www.raphaelbauer.com/posts/postgresql-everything/#conclusion)｜结论

## Intro｜简介

I started using PostgreSQL roughly in 2003 for a research project called [ColumbaDB](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1087474/). Columba is no more, but PostgreSQL is still alive and kicking more than ever.

> 我大约从 2003 年开始使用 PostgreSQL，当时参与的是一个名为 [ColumbaDB](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1087474/) 的研究项目。Columba 已经不复存在，但 PostgreSQL 依然活跃，而且比以往任何时候都更有生命力。

In 2003, MySQL was much more widely used than PostgreSQL. MySQL was also potentially faster as it did not implement all features of the SQL standard. At the same time MySQL was lacking many features that we needed (full-text search, powerful indexes, SQL standard compliance etc). PostgreSQL felt more like a “real” database in comparison to MySQL - like a tiny version of Oracle - but in open source clothes.

> 2003 年，MySQL 的使用范围远远超过 PostgreSQL。MySQL 当时也可能更快，因为它没有实现 SQL 标准的全部特性。与此同时，MySQL 缺少我们需要的许多功能（全文搜索、强大的索引、对 SQL 标准的遵循等）。与 MySQL 相比，PostgreSQL 更像一个“真正的”数据库——仿佛是 Oracle 的袖珍版，只是披着开源软件的外衣。

During that research project I learned a lot about databases, indexes and the power of PostgreSQL. One important use-case was full-text search. We could have used MySQL in conjunction with another system like Lucene / Solr to make our database searchable. But that would have meant running and maintaining two such systems. Complicated.

> 在那个研究项目中，我对数据库、索引以及 PostgreSQL 的力量有了许多认识。其中一个重要的使用场景是全文搜索。我们本可以把 MySQL 与 Lucene / Solr 之类的另一个系统结合起来，让数据库支持搜索。但这样就意味着要运行和维护两个系统。太复杂了。

PostgreSQL allowed us to use a [fulltext search plugin](https://www.postgresql.org/docs/current/textsearch.html) to do everything in one system. No need to sync any data. No need to maintain and run two systems. It just worked and made us smile (after some tweaks of course). Simplicity.

> PostgreSQL 允许我们使用[全文搜索插件](https://www.postgresql.org/docs/current/textsearch.html)，在一个系统里完成所有事情。不需要同步数据，也不需要维护和运行两个系统。它就是能工作，并让我们露出笑容（当然，前提是做了一些调校）。这就是简单。

Since then I used PostgreSQL for many use-cases throughout my career as [CTO / Interim Manager](https://www.raphaelbauer.com/interim-cto/). Most recently I used PostgreSQL to store very high volume web analytics time series data via its [TimescaleDB plugin](https://www.timescale.com/). Check out [Privatracker - the best way to do web analytics and respect the privacy of your visitors](https://www.privatracker.com) - to see it in action.

> 从那以后，在担任 [CTO / 临时经理](https://www.raphaelbauer.com/interim-cto/) 的职业生涯中，我在许多场景里使用过 PostgreSQL。最近一次是通过 [TimescaleDB 插件](https://www.timescale.com/)，用 PostgreSQL 存储海量 Web 分析时序数据。可以看看 [Privatracker——兼顾 Web 分析与访客隐私的最佳方式](https://www.privatracker.com)，了解它实际运行起来的样子。

Many others discussed the topic from different angles. And each article is really worth your time ([SQL is Agile](https://lucumr.pocoo.org/2012/12/29/sql-is-agile/), [Stephan Schmidt on Using SQL for Everything](https://www.amazingcto.com/postgres-for-everything/)). Also check out my [Linkedin post](https://www.linkedin.com/posts/raphaelabauer_postgresql-for-everything-activity-7163447276114317313-mSrw?utm_source=share&utm_medium=member_desktop).

> 还有许多人从不同角度讨论过这个主题。这些文章每一篇都值得花时间阅读：[SQL is Agile](https://lucumr.pocoo.org/2012/12/29/sql-is-agile/)、[Stephan Schmidt 谈“用 SQL 做一切”](https://www.amazingcto.com/postgres-for-everything/)。也可以看看我的 [LinkedIn 帖子](https://www.linkedin.com/posts/raphaelabauer_postgresql-for-everything-activity-7163447276114317313-mSrw?utm_source=share&utm_medium=member_desktop)。

And if you are using PostgreSQL I can highly recommend reading Hazel Bachrach’s nice post on [“What I Wish Someone Told Me About Postgres”](https://challahscript.com/what_i_wish_someone_told_me_about_postgres).

> 如果你正在使用 PostgreSQL，我强烈推荐阅读 Hazel Bachrach 的精彩文章[《关于 Postgres，我希望有人早点告诉我的事》](https://challahscript.com/what_i_wish_someone_told_me_about_postgres)。

In my humble opinion the power of PostgreSQL comes from three sources:

> 在我看来，PostgreSQL 的力量主要来自三个方面：

1. It is <u>rock-solid and stable</u>.
2. It is <u>easy to run, install and scale</u>.
3. It massively <u>simplifies your IT setup</u> by being not only a RDBMS, but also a full-text search engine, a document storage and much much more…

> 1. 它<u>坚如磐石且稳定</u>。
> 2. 它<u>易于运行、安装与扩展</u>。
> 3. 它不仅是一个关系数据库管理系统（RDBMS），还是全文搜索引擎、文档存储系统，以及更多东西，因此能够大幅<u>简化你的 IT 架构</u>……

Let’s have a closer look…

> 让我们仔细看看……

## Rock Solid and Stable｜坚如磐石且稳定

PostgreSQL is boring old technology. [The first PostgreSQL release dates back to 1996](https://de.wikipedia.org/wiki/PostgreSQL). PostgreSQL is also very widely used - for a very long amount of time. Ironing out bugs - especially in database systems - takes time. PostgreSQL had that time.

> PostgreSQL 是一种“无聊的老技术”。[第一个 PostgreSQL 版本可以追溯到 1996 年](https://de.wikipedia.org/wiki/PostgreSQL)。PostgreSQL 还被广泛使用了很长时间。消除缺陷，尤其是数据库系统中的缺陷，需要时间。PostgreSQL 经历了这样的时间积累。

It also has a very active community that diligently adds more and more features without breaking any old parts of it. In recent years PostgreSQL got many amazing features like json document storage, partitioning support, common table expressions and much much more. Each new release of PostgreSQL is exciting and brings new nice features.

> 它还有一个非常活跃的社区，持续勤勉地增加越来越多的功能，同时不破坏原有部分。近年来，PostgreSQL 获得了许多出色的特性，例如 JSON 文档存储、分区支持、公共表表达式，以及更多功能。PostgreSQL 的每个新版本都令人期待，并会带来新的实用特性。

<u>True - PostgreSQL is old - but the features are very very modern - and PostgreSQL becomes better with every release.</u>

> <u>没错，PostgreSQL 很老，但它的功能非常现代，而且每个版本都会变得更好。</u>

## Easy to Run, Install and Scale｜易于运行、安装与扩展

PostgreSQL can be installed very easily locally. It is bundled with all major Linux distributions, part of [Mac brew](https://wiki.postgresql.org/wiki/Homebrew), but can also be installed with applications like [PostgresApp](https://postgresapp.com/).

> PostgreSQL 很容易在本地安装。它随所有主要 Linux 发行版一起提供，是 [Mac brew](https://wiki.postgresql.org/wiki/Homebrew) 的一部分，也可以通过 [PostgresApp](https://postgresapp.com/) 之类的应用安装。

When running tests, it comes in handy using [Testcontainers with PostgreSQL](https://java.testcontainers.org/modules/databases/postgres/). It was never easier running your tests against a real PostgreSQL database that is 100% similar to the production thing.

> 运行测试时，使用 [Testcontainers with PostgreSQL](https://java.testcontainers.org/modules/databases/postgres/) 非常方便。以前从未如此容易地让测试连接到一个与生产环境 100% 相似的真实 PostgreSQL 数据库。

If you want to run PostgreSQL on a server then you can simply apt-get install it. Or run it in a [docker container](https://hub.docker.com/_/postgres).

> 如果想在服务器上运行 PostgreSQL，只需执行 `apt-get install` 安装即可，也可以在 [Docker 容器](https://hub.docker.com/_/postgres)中运行。

All cloud providers allow you to run (and scale!) PostgreSQL by clicking a single button. You got ample of choice at your fingertips:

> 所有云服务商都允许你点击一下按钮就运行（并扩展！）PostgreSQL。你可以轻松选择：

- [Amazon AWS](https://aws.amazon.com/rds/postgresql/)
- [Google GCP](https://cloud.google.com/sql/docs/postgres)
- [Microsoft Azure](https://azure.microsoft.com/en-gb/products/postgresql/)
- [ElephantSQL](https://www.elephantsql.com/)
- [CrunchyData](https://www.crunchydata.com/)
- [Timescale](https://www.timescale.com/)
- … and many more …

> - [Amazon AWS](https://aws.amazon.com/rds/postgresql/)
> - [Google GCP](https://cloud.google.com/sql/docs/postgres)
> - [Microsoft Azure](https://azure.microsoft.com/en-gb/products/postgresql/)
> - [ElephantSQL](https://www.elephantsql.com/)
> - [CrunchyData](https://www.crunchydata.com/)
> - [Timescale](https://www.timescale.com/)
> - ……以及更多选择……

<u>That makes PostgreSQL one of the most widely supported software systems in the market. And for you this means less maintenance and more time for creating new features for clients.</u>

> <u>这使 PostgreSQL 成为市场上获得最广泛支持的软件系统之一。对你来说，这意味着更少的维护工作，以及更多为客户创造新功能的时间。</u>

## Simplifies Your IT Setup｜简化 IT 架构

Running PostgreSQL in the cloud is already just one click. But it gets even better. PostgreSQL can replace many systems that youd’d have to run otherwise.

> 在云上运行 PostgreSQL 已经只需点击一下。但事情还能更进一步：PostgreSQL 可以替代许多原本需要单独运行的系统。

### PostgreSQL Replaces Solr and Elastic: Full-Text Search｜PostgreSQL 替代 Solr 和 Elastic：全文搜索

PostgreSQL allows you to turn your text data into user-searchable data. Without a separate system. It’s also language agnostic and you’ll never have any sync problems between your data and your fulltext search system.

> PostgreSQL 可以把文本数据变成用户可搜索的数据，而且不需要单独的系统。它还与语言无关，你也不会再遇到数据和全文搜索系统之间的同步问题。

The most impressive article on the topic is how [Contentful used PostgreSQL to enable fulltext search for their users](https://www.contentful.com/blog/contentful-faster-full-text-search/). It’s a tale in simplicity that enables growth.

> 这个主题上最令人印象深刻的文章，讲的是 [Contentful 如何使用 PostgreSQL 为用户提供全文搜索](https://www.contentful.com/blog/contentful-faster-full-text-search/)。这是一个关于“简单如何带来增长”的故事。

Instacart did something very similar: They [built their modern search infrastructure on Postgres](https://tech.instacart.com/how-instacart-built-a-modern-search-infrastructure-on-postgres-c528fa601d54) instead of running a separate search cluster. Same story, different company.

> Instacart 做了非常类似的事情：他们没有运行独立的搜索集群，而是[基于 Postgres 构建了现代搜索基础设施](https://tech.instacart.com/how-instacart-built-a-modern-search-infrastructure-on-postgres-c528fa601d54)。故事相同，只是公司不同。

The built-in [`tsvector` / `tsquery`](https://www.postgresql.org/docs/current/datatype-textsearch.html) machinery is a very good starting point. It is part of vanilla PostgreSQL, needs no extra moving parts, and works extremely well for the vast majority of use-cases. Start there.

> 内置的 [`tsvector` / `tsquery`](https://www.postgresql.org/docs/current/datatype-textsearch.html) 机制是一个很好的起点。它属于原生 PostgreSQL，不需要额外的组件，而且对绝大多数使用场景都工作得非常好。就从这里开始。

If you outgrow it - typically because you need better relevance ranking (BM25) or more scalability - you don’t have to leave PostgreSQL either. There are extensions that pick up exactly where the built-in search ends:

> 如果它无法满足你的增长需求，通常是因为你需要更好的相关性排序（BM25）或更强的扩展能力，你也不必因此离开 PostgreSQL。有些扩展可以恰好从内置搜索的边界继续向前：

- [pg_textsearch](https://github.com/timescale/pg_textsearch) by Timescale / TigerData - BM25 ranking as a PostgreSQL extension.
- [ParadeDB / pg_search](https://github.com/paradedb/paradedb) - Elasticsearch-grade search inside PostgreSQL, built on Tantivy ([docs](https://docs.paradedb.com/)).

> - Timescale / TigerData 提供的 [pg_textsearch](https://github.com/timescale/pg_textsearch)——以 PostgreSQL 扩展形式提供 BM25 排序。
> - [ParadeDB / pg_search](https://github.com/paradedb/paradedb)——在 PostgreSQL 内提供 Elasticsearch 级别的搜索，构建于 Tantivy 之上（[文档](https://docs.paradedb.com/)）。

<u>That’s the beauty of it: You can start with plain vanilla PostgreSQL and seamlessly move to more advanced techniques and third-party extensions once - and only if - you actually need them.</u>

> <u>这正是它的美妙之处：你可以从纯粹的原生 PostgreSQL 开始，等到确实需要时，再无缝迁移到更高级的技术和第三方扩展。</u>

The pros and cons of full-text search on PostgreSQL are discussed very nicely in [this LinkedIn discussion](https://www.linkedin.com/feed/update/urn:li:activity:7495362603527909377/) - recommended reading before you decide.

> [这场 LinkedIn 讨论](https://www.linkedin.com/feed/update/urn:li:activity:7495362603527909377/)很好地讨论了在 PostgreSQL 上使用全文搜索的利弊，建议在做决定前阅读。

More on the topic: [https://www.postgresql.org/docs/current/textsearch.html](https://www.postgresql.org/docs/current/textsearch.html)

> 相关主题的更多信息：[https://www.postgresql.org/docs/current/textsearch.html](https://www.postgresql.org/docs/current/textsearch.html)

### PostgreSQL replaces MongoDB: Excellent Json Support｜PostgreSQL 替代 MongoDB：出色的 JSON 支持

PostgreSQL has excellent support for [storing and querying(!) json](https://www.postgresql.org/docs/current/datatype-json.html). It also features an index type (GIN) that makes these operations blazingly fast. <u>Is there a need for MongoDB any more?</u>.

> PostgreSQL 对[存储和查询（没错，是查询！）JSON](https://www.postgresql.org/docs/current/datatype-json.html)提供了出色支持。它还提供了一种索引类型（GIN），让这些操作快得惊人。<u>我们还需要 MongoDB 吗？</u>

The Guardian also wrote an excellent article how they [switched from Mongo to PostgreSQL](https://www.theguardian.com/info/2018/nov/30/bye-bye-mongo-hello-postgres). Thanks for sharing [Jan-Otto](https://www.linkedin.com/feed/update/urn:li:activity:7163447276114317313?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7163447276114317313%2C7163615175755874304%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287163615175755874304%2Curn%3Ali%3Aactivity%3A7163447276114317313%29)! Hazel also [wrote a nice piece on jsonb](https://challahscript.com/what_i_wish_someone_told_me_about_postgres#jsonb-is-a-sharp-knife) and what to take into account when using it.

> 《卫报》也写过一篇很棒的文章，介绍他们[如何从 Mongo 切换到 PostgreSQL](https://www.theguardian.com/info/2018/nov/30/bye-bye-mongo-hello-postgres)。感谢 [Jan-Otto](https://www.linkedin.com/feed/update/urn:li:activity:7163447276114317313?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7163447276114317313%2C7163615175755874304%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287163615175755874304%2Curn%3Ali%3Aactivity%3A7163447276114317313%29) 分享！Hazel 还[写过一篇很不错的文章，讨论 jsonb](https://challahscript.com/what_i_wish_someone_told_me_about_postgres#jsonb-is-a-sharp-knife) 以及使用它时需要考虑的问题。

### PostgreSQL replaces Kafka and RabbitMQ: PostgreSQL as a queue｜PostgreSQL 替代 Kafka 和 RabbitMQ：把 PostgreSQL 当作队列

Events, queues and persistent logs are getting more and more important in today’s software systems. Systems like Kafka, RabbitMQ, SQS and others provide that functionality. But maintaining them is annoying, custom and you need the skillset.

> 在今天的软件系统中，事件、队列和持久化日志变得越来越重要。Kafka、RabbitMQ、SQS 等系统提供了这些功能。但维护它们很麻烦，需要定制，也需要相应的技能储备。

The good news: You can just use PostgreSQL. The magic comes from

> 好消息是：你可以直接使用 PostgreSQL。这里的魔法来自：

- `SELECT .. FOR UPDATE`
- `SELECT .. SKIP LOCKED`

> - `SELECT .. FOR UPDATE`
> - `SELECT .. SKIP LOCKED`

Using these SQL features you can effectively use a table as queue. Either in a persistent fashion with a cursor and many consumers, or in a read-once fashion.

> 利用这些 SQL 特性，你实际上可以把一张表当作队列使用：既可以配合游标和多个消费者，以持久化方式工作；也可以采用只读取一次的方式。

The article at [crunchydata explains this concept very well](https://www.crunchydata.com/blog/message-queuing-using-native-postgresql).

> [crunchydata 的这篇文章](https://www.crunchydata.com/blog/message-queuing-using-native-postgresql)很好地解释了这个概念。

<u>My tip: Start with PostgreSQL as a queueing system. Only when that does no longer perform well switch to other systems like Kafka, RabbitMQ or SQS. You’ll be surprised how well PostgreSQL works.</u>

> <u>我的建议是：先用 PostgreSQL 作为队列系统。只有当它的性能确实不再理想时，再切换到 Kafka、RabbitMQ 或 SQS 等其他系统。你会惊讶于 PostgreSQL 的表现有多好。</u>

### PostgreSQL Replaces Clickhouse: High Volume Time Series Data｜PostgreSQL 替代 ClickHouse：海量时序数据

Time series data is special. Often you get many data points in a very short amount of time. And then you have to aggregate the data frequently, doing some statistics on it and so on.

> 时序数据很特殊。你经常会在很短的时间内获得大量数据点，然后需要频繁聚合数据、进行统计分析等。

There are specialized software systems like Clickhouse (amazing by the way…). But you can also use a plugin for PostgreSQL that allows you to do (nearly) the same: [Timescale](https://github.com/timescale/timescaledb).

> 市面上有 ClickHouse 这样的专用软件系统（顺便说一句，它很出色……）。但你也可以使用 PostgreSQL 的一个插件，完成几乎相同的事情：[Timescale](https://github.com/timescale/timescaledb)。

<u>I’ve used Timescale and can recommend it. The good news is that you can continue using PostgreSQL - even for high volume data easily. No need to learn and maintain something new.</u>

> <u>我使用过 Timescale，可以推荐它。好消息是，即使面对海量数据，你也可以轻松继续使用 PostgreSQL。不需要学习和维护新的系统。</u>

### PostgreSQL as Vector Database for AI Workflows｜PostgreSQL 作为 AI 工作流的向量数据库

Timescale lately released the [pgvector extension](https://docs.timescale.com/use-timescale/latest/extensions/pgvector/?ref=timescale.com), that turns your PostgreSQL into a vector database. This allows you to use the tech you already know for indexing and retrieval of relevant data. That’s an essential part of AI LLM workflows.

> Timescale 最近发布了 [pgvector 扩展](https://docs.timescale.com/use-timescale/latest/extensions/pgvector/?ref=timescale.com)，可以把你的 PostgreSQL 变成向量数据库。这样，你就能使用已经熟悉的技术来建立索引并检索相关数据，而这正是 AI/LLM 工作流的重要组成部分。

Timescale also recently announced [pgai](https://github.com/timescale/pgai) that includes pgvector, but also a lot of other nice extensions that make it super simple to index data, call LLM models and retrieve data based on similarity.

> Timescale 最近还宣布了 [pgai](https://github.com/timescale/pgai)。它包含 pgvector，也提供许多其他实用扩展，让建立数据索引、调用 LLM 模型以及根据相似性检索数据变得极其简单。

### PostgreSQL Replaces Redis: Non-Persistent High Performance Caching｜PostgreSQL 替代 Redis：非持久化高性能缓存

Caching is important. Most applications use something like Redis as a cache to get information like sessions and more quickly. A cache can by definition lose data and can be regenerated from the original source.

> 缓存很重要。大多数应用会使用 Redis 之类的系统作为缓存，以便更快地获取会话等信息。按照定义，缓存可以丢失数据，而且这些数据可以从原始来源重新生成。

But. Why use Redis when PostgreSQL can be tuned to be as fast (in most usecases) as a Redis cache? The secret is using an UNLOGGED table. You can even emulate Redis’ automatic expire by a trigger. [A lot has been written about this](https://martinheinz.dev/blog/105) - I can just recommend trying it out.

> 但是，如果 PostgreSQL 经过调优后（在大多数使用场景中）可以达到 Redis 缓存的速度，为什么还要使用 Redis？秘诀在于使用 `UNLOGGED` 表。你甚至可以用触发器模拟 Redis 的自动过期功能。[关于这一点已经有许多文章](https://martinheinz.dev/blog/105)，我只能建议你亲自试试。

### PostgreSQL Replaces File System: For Raw Data｜PostgreSQL 替代文件系统：存放原始数据

For one of my clients we had to read and write a huge amount of small pieces of binary encoded information. We initially thought that doing this via the file system was the fastest way to do so.

> 我曾经为一位客户读写大量细小的二进制编码信息。起初我们认为，通过文件系统完成这件事会是最快的方式。

After some performance checks it became clear that PostgreSQL was even faster than reading from the file system for our use-case. PostgreSQL uses the file system very efficiently for its data - and it adds a lot of caching and efficient reading and writing strategies that can outperform writing and reading raw data on a file system.

> 经过一些性能检查后，事实证明，对于我们的使用场景，PostgreSQL 甚至比直接从文件系统读取更快。PostgreSQL 能够非常高效地利用文件系统来存储数据，同时还加入了大量缓存以及高效的读写策略，其性能可能超过在文件系统上直接读写原始数据。

We used [Flatbuffers](https://github.com/google/flatbuffers) to store the data in a blob column. Data was then de-serialized on the client. You might want to try that approach as well.

> 我们使用 [Flatbuffers](https://github.com/google/flatbuffers) 把数据存储在一个 blob 列中，然后由客户端对数据进行反序列化。你也可以试试这种方式。

### PostgreSQL Replacing Your Graph Database｜PostgreSQL 替代你的图数据库

Hierarchical data can be managed in SQL via recursive queries. That’s ok, but also super-hard to read, maintain and debug. Not even speaking of performance.

> 通过递归查询，可以使用 SQL 管理层次数据。这当然没问题，但代码非常难以阅读、维护和调试，性能更不用说。

The better way is the [LTREE datatype of PostgreSQL](https://www.postgresql.org/docs/current/ltree.html). It helped me not only once to implement hierarchical tag structures. Easy to read, maintain and blazingly fast.

> 更好的方式是使用 PostgreSQL 的 [LTREE 数据类型](https://www.postgresql.org/docs/current/ltree.html)。它已经不止一次帮助我实现层次化的标签结构：易于阅读和维护，速度也快得惊人。

### PostgreSQL as Replacement for GraphDB and Neo4J｜PostgreSQL 替代 GraphDB 和 Neo4J

But what if you need a *real* graph - not just a tree? Nodes, edges, properties, and queries that traverse relationships in every direction? That’s usually the moment someone suggests adding Neo4j to the stack. And with it: another system to run, another backup strategy, another data sync.

> 但如果你需要的是一张*真正的*图，而不只是一棵树呢？你需要节点、边、属性，以及能够沿各个方向遍历关系的查询。这通常就是有人建议把 Neo4j 加入技术栈的时刻。而随之而来的，还有另一个需要运行的系统、另一套备份策略，以及另一套数据同步机制。

You don’t have to. [Apache AGE](https://age.apache.org/) (“A Graph Extension”) turns PostgreSQL into a graph database. It’s an Apache Software Foundation top-level project and it implements [openCypher](https://opencypher.org/) - the same query language you’d use in Neo4j. The best part: graph queries and plain SQL live in the *same* database and can be combined in a single statement.

> 其实不必这样做。[Apache AGE](https://age.apache.org/)（“A Graph Extension”，图扩展）可以把 PostgreSQL 变成图数据库。它是 Apache 软件基金会的顶级项目，并实现了 [openCypher](https://opencypher.org/)，也就是你在 Neo4j 中使用的同一种查询语言。最棒的是：图查询和普通 SQL 共存于*同一个*数据库中，还可以组合在一条语句里。

```sql
SELECT * FROM cypher('my_graph', $$
    MATCH (a:Person)-[:WORKS_AT]->(c:Company)
    RETURN a.name, c.name
$$) AS (person agtype, company agtype);
```

<u>My tip - the same one as for queueing: Start with PostgreSQL. Model your graph with AGE (or with LTREE if a hierarchy is all you need) and only reach for a dedicated graph database if you really hit the limits. Your data stays in one place, transactional and consistent with the rest of your application.</u>

> <u>我的建议和队列部分相同：先从 PostgreSQL 开始。使用 AGE 为你的数据建模（如果只需要层次结构，则使用 LTREE），只有在真正触及上限时，才考虑专用图数据库。这样你的数据可以留在同一个地方，并与应用的其他部分保持事务性和一致性。</u>

More on the topic: [Apache AGE documentation](https://age.apache.org/age-manual/master/index.html) and the [source on GitHub](https://github.com/apache/age).

> 相关主题的更多信息：[Apache AGE 文档](https://age.apache.org/age-manual/master/index.html)和 [GitHub 上的源代码](https://github.com/apache/age)。

### PostgreSQL Replacing Your Microservice｜PostgreSQL 替代微服务

Most of the “microservices” these days are only about models, getting data from a database and returning json to the client.

> 如今许多“微服务”其实只是在处理模型、从数据库获取数据，再向客户端返回 JSON。

But you know what? PostgreSQL can turn any query into a Json result. That effectively replaces your server middleware. There are Pros and Cons to this approach, but it shows the capabilities of PostgreSQL. The amazing [Lukas Eder wrote about the topic](https://blog.jooq.org/stop-mapping-stuff-in-your-middleware-use-sqls-xml-or-json-operators-instead/) - not PostgreSQL specific - but everything mentioned there is very well doable in PostgreSQL as well

> 但你知道吗？PostgreSQL 可以把任意查询转换为 JSON 结果，这实际上可以替代服务器中间件。这种做法有利有弊，但它展示了 PostgreSQL 的能力。[Lukas Eder 曾写过一篇精彩文章讨论这个主题](https://blog.jooq.org/stop-mapping-stuff-in-your-middleware-use-sqls-xml-or-json-operators-instead/)。文章并不专门针对 PostgreSQL，但其中提到的所有事情，在 PostgreSQL 中都完全可以实现。

### PostgreSQL - Replacing your Playstation 5｜PostgreSQL 替代你的 PlayStation 5

Well. Some enthusiast implemented [Tetris as Common Table Expressions in pure SQL](https://github.com/nuno-faria/tetris-sql/blob/main/game.sql). Crazy. And maybe not to be taken too seriously.

> 好吧。有位爱好者用纯 SQL 的[公共表表达式实现了俄罗斯方块](https://github.com/nuno-faria/tetris-sql/blob/main/game.sql)。很疯狂。当然，也许不必太当真。

## Conclusion｜结论

The list above is not very exhaustive. PostgreSQL is a very flexible piece of software. And it can be extended with plugins to do more and more.

> 上面的列表并不完整。PostgreSQL 是一款非常灵活的软件，还可以通过插件不断扩展，完成越来越多的事情。

You need simplicity if you want to move fast. If you come across a new requirement always ask: Can’t PostgreSQL do this? And do we really need that shiny new technology X?

> 如果想快速前进，就需要简单性。遇到新的需求时，总要问一问：PostgreSQL 做不到吗？我们真的需要那个闪闪发亮的新技术 X 吗？

PostgreSQL might not be the answer to everything - but it is the answer to a lot more than you might think!

> PostgreSQL 也许不是一切问题的答案，但它能回答的问题，比你想象的多得多！
