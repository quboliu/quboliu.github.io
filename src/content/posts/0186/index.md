---
lang: "zh-CN"
pubDatetime: 2026-09-15T19:45:33+08:00
timezone: "Asia/Shanghai"
title: "转载｜What I learned from the book Designing Data-Intensive Applications?｜我从《设计数据密集型应用》中学到了什么"
contentType: "repost"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "转载"
  - "DDIA"
  - "分布式系统"
  - "数据库"
  - "系统设计"
  - "一致性"
  - "读书笔记"
description: "转载并翻译 Dr Milan Milanović 对《Designing Data-Intensive Applications》的完整阅读回顾，保留英文原文、中文译文及 46 条评论，覆盖数据模型、存储引擎、复制..."
---
> **Subtitle｜副标题：** Most engineers skim DDIA. I read it twice, and here’s why it rewired my mental model.
>
> **中文翻译：** 大多数工程师只是略读 DDIA。我把它读了两遍，下面就是它为何重塑了我的思维模型。
>
> **Author｜作者：** Dr Milan Milanović（Tech World With Milan Newsletter）
>
> **Publication date｜发布日期：** 2025-06-19（UTC）
>
> **Original article｜原文链接：** [What I learned from the book Designing Data-Intensive Applications](https://newsletter.techworld-with-milan.com/p/what-i-learned-from-the-book-designing)
>
> **Engagement｜互动数据：** ❤️ 1,009 次点赞 · 💬 46 条评论 · 🔁 137 次转发
>
> 本文是 Dr Milan Milanović 原文的完整中英对照转载，正文与评论均予以保留；图片继续使用 Substack CDN 链接。中文译文紧随英文原文段落或列表。

---

With 2 decades of experience in software engineering, I consider myself knowledgeable across a range of topics, including NoSQL databases, Big Data, transactions, sharding, and more.

> 我有二十年的软件工程经验，自认为对许多主题都比较熟悉，包括 NoSQL 数据库、大数据、事务、分片等。

However, my eye-opening read was Martin Kleppmann’s “[Designing Data-Intensive Applications](https://amzn.to/3ZX4uMv)” (DDIA), which introduced me to concepts related to these technologies and systems.

> 但真正让我大开眼界的是 Martin Kleppmann 的《[Designing Data-Intensive Applications](https://amzn.to/3ZX4uMv)》（简称 DDIA）。这本书把我带入了与这些技术和系统相关的概念世界。

This (still) popular book (often called the “*Big Ideas Behind Reliable, Scalable, and Maintainable Systems*”) bridges theory and practice to explain **how data systems work and why**.

> 这本至今仍然流行的书（常被称为“*可靠、可扩展、可维护系统背后的大思想*”）连接了理论与实践，解释了**数据系统如何工作，以及为什么这样工作**。

In this article, we will cover the following:

> 本文将覆盖以下内容：

1. **Introduction**. Explains why “Designing Data-Intensive Applications” matters and how rereading it clarified its core ideas to me.
2. **The things I liked about the book**. In this section, I show the book’s clear breakdown of reliability, scalability, maintainability, data models, and storage engines, and the importance of weighing trade-offs.
3. **The things I didn’t like**. Here we note gaps in the book, such as outdated examples, theory-heavy coverage, and the breadth-over-depth trade-off that can overwhelm readers.
4. **Recommendation**. Identifies who will gain the most (mid-career engineers, architects, tech leads) and who may struggle (new devs, theory-averse readers).
5. **Conclusion.** Here we summarize the mental models and decision frameworks you gained, positioning DDIA as a must-read reference for designing reliable data systems.
6. **Bonus: Key takeaways & principles**. Finally, we made DDIA into a quick-hit list of design rules and trade-offs you can reference during architecture and code reviews.

> 1. **引言**：解释《Designing Data-Intensive Applications》为何重要，以及重读如何让我看清它的核心思想。
> 2. **我喜欢这本书的地方**：展示本书如何清晰拆解可靠性、可扩展性、可维护性、数据模型和存储引擎，以及权衡取舍的重要性。
> 3. **我不喜欢的地方**：指出书中的一些缺口，例如例子过时、理论内容偏重，以及“广度优先于深度”可能让读者不堪重负。
> 4. **推荐**：说明哪些人（职业中期工程师、架构师、技术负责人）最能从中受益，以及哪些人（新手开发者、排斥理论的读者）可能读起来比较吃力。
> 5. **结论**：总结你能获得的思维模型和决策框架，并把 DDIA 定位为设计可靠数据系统时必读的参考书。
> 6. **加餐：关键收获与原则**：最后把 DDIA 提炼成一份可在架构评审和代码评审中快速查阅的设计规则与权衡清单。

So, let’s dive in.

> 那么，让我们开始吧。

---

**[Sponsor this newsletter｜赞助这个 Newsletter](https://newsletter.techworld-with-milan.com/p/sponsorship-of-tech-world-with-milan)**

## 1. Introduction｜引言

This is one of the books everyone will say is a great read, but often, behind that, there is a wall of silence. I have always wondered whether people really read the book or didn’t understand it well.

> 这是一本所有人都会说“值得一读”的书，但这句话背后往往是一堵沉默的墙。我一直想知道，人们究竟是真的读过这本书，还是其实没有很好地理解它。

I first read it in 2018. And I was almost finished, but some parts were tricky to grasp. Then, in 2023. I decided to re-read it properly and take notes. This text is primarily based on the notes I took at the time (see the reference section).

> 我第一次读它是在 2018 年，几乎读完了，但有些部分很难理解。后来在 2023 年，我决定认真重读并做笔记。本文主要基于我当时记下的笔记（见文末参考资料）。

DIA is not just another tech book; it’s essentially a **foundational guide to data systems**. Kleppmann begins by reminding us what matters in the world of distributed systems: building applications that are **reliable**, **scalable**, and **maintainable** for the long run.

> DDIA 不只是又一本技术书；它本质上是一份**数据系统基础指南**。Kleppmann 开篇就提醒我们，分布式系统世界里真正重要的是：构建能够长期保持**可靠**、**可扩展**和**可维护**的应用。

The book then explores different types of databases, distributed systems, and data processing to help you understand their strengths, weaknesses, and trade-offs.

> 接着，本书探讨不同类型的数据库、分布式系统和数据处理方式，帮助你理解它们各自的优点、缺点与取舍。

As I read, I often found myself nodding along and saying, *“Ah, that’s why this design is the way it is!”* Each chapter presents key concepts, ranging from data models and storage engines to replication and stream processing.

> 阅读时，我经常一边点头一边想：“啊，原来这个设计之所以这样，是因为这个！”每一章都会介绍关键概念，范围从数据模型、存储引擎，一直到复制和流处理。

By the end, I not only had refreshed my knowledge of things I use daily (like **SQL vs. NoSQL databases** or **Apache Kafka**), but also gained a more principled way of thinking about distributed systems.

> 读完之后，我不仅重温了日常使用的技术（例如 **SQL 与 NoSQL 数据库**、**Apache Kafka**），还获得了一种更加有原则、更加系统地思考分布式系统的方式。

[![Designing Data-Intensive Applications book cover｜《Designing Data-Intensive Applications》书封](https://substackcdn.com/image/fetch/$s_!9d25!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb4e86145-fe31-4864-92ac-de925c992903_2836x2993.jpeg)](https://amzn.to/3ZX4uMv)

[Designing Data-Intensive Applications](https://amzn.to/3ZX4uMv) by [Martin Kleppmann](https://martin.kleppmann.com/)｜Martin Kleppmann 所著《Designing Data-Intensive Applications》

## 2. **The things I liked about the book｜我喜欢这本书的地方**

Each of these subsections highlights what resonated most with me.

> 以下每个小节都突出介绍了最打动我的内容。

### **Distributed systems foundations are explained in detail｜分布式系统基础讲解得很细**

One thing I appreciated immediately was that the book **starts with fundamentals**. It defines three critical concerns for any system: **reliability**, **scalability**, and **maintainability**.

> 我立刻喜欢上这本书的一点，是它**从基础开始**。它为任何系统定义了三个关键关注点：**可靠性**、**可扩展性**和**可维护性**。

1. **Reliability** means your system continues to work correctly even when things go wrong (hardware fails, bugs occur, humans err).
2. **Scalability** is a system's ability to handle increased load efficiently and effectively.
3. **Maintainability** refers to the system's ease of *management* and evolution by engineers over time. All of these are designed from the start.

> 1. **可靠性**：即使出现问题（硬件故障、程序缺陷或人为错误），系统仍能正确工作。
> 2. **可扩展性**：系统高效、有效地应对不断增加负载的能力。
> 3. **可维护性**：工程师随着时间推移对系统进行*管理*和演进的容易程度。这些品质都应从一开始就被设计进去。

[![Distributed Systems Concerns｜分布式系统关注点](https://substackcdn.com/image/fetch/$s_!WfMt!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc784e06-84e5-446b-b583-f6b3c3ad9f76_1417x852.png)](https://substackcdn.com/image/fetch/$s_!WfMt!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc784e06-84e5-446b-b583-f6b3c3ad9f76_1417x852.png)

Distributed Systems Concerns｜分布式系统关注点

Kleppmann further divides the maintainability guidelines into the following principles for design:

> Kleppmann 又把可维护性准则进一步拆分为以下设计原则：

* **Operability**. Make life easier for Ops teams with effective monitoring and automation.
* **Simplicity**. Reduce complexity by preventing accidental complexity.
* **Evolvability**. The system should be easily extensible to accommodate new requirements.

> - **可操作性（Operability）**：通过有效的监控和自动化，让运维团队的工作更轻松。
> - **简单性（Simplicity）**：避免意外复杂性，从而降低整体复杂度。
> - **可演进性（Evolvability）**：系统应易于扩展，以适应新的需求。

This is a good reminder that “**building for change**” is just as important as dealing with current traffic conditions.

> 这很好地提醒我们，“**为变化而构建**”与应对当前流量状况同样重要。

I also appreciated the section on **performance metrics**. While average latency is something the book could have simply explained without reference to its own experience or research, it is helpful to know why it is important to care about percentiles like median (p50), 95th percentile, or 99th percentile response time.

> 我也很喜欢书中关于**性能指标**的部分。平均延迟本来可以不借助作者自身的经验或研究来简单说明，但了解为什么应该关注中位数（p50）、第 95 百分位或第 99 百分位响应时间，确实很有帮助。

For instance, if the 99th percentile latency is 2 seconds, that means that 1 out of every 100 users will have had to wait at least 2 seconds to access the service, even if the average latency was low. This focus on distribution rather than just the “average” case, and the tool of **rolling percentiles** we use to monitor performance, made me question how we discuss performance.

> 例如，如果第 99 百分位延迟是 2 秒，就意味着每 100 个用户中有 1 个至少要等待 2 秒才能访问服务，即使平均延迟很低也是如此。这种关注分布而非仅仅关注“平均”情况的方式，以及我们用来监控性能的**滚动百分位数**工具，让我开始反思我们讨论性能的方式。

[![Response times for a sample of 100 requests｜100 个请求样本的响应时间](https://substackcdn.com/image/fetch/$s_!0Gy1!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97ff63b7-80d7-4a37-91ab-11de8131024d_1426x993.png)](https://substackcdn.com/image/fetch/$s_!0Gy1!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97ff63b7-80d7-4a37-91ab-11de8131024d_1426x993.png)

Response times for a sample of 100 requests to a service (approx., based on the book Figure 1-4)｜某服务 100 个请求样本的响应时间（近似值，依据书中图 1-4）

Finally, a minor but essential lesson: **the book constantly highlights** ***trade-offs***. There’s no free lunch – every design decision (say, a cache for speed or a schema for data quality) has downsides. By keeping reliability, scalability, and maintainability goals in mind, you can reason more clearly about these trade-offs.

> 最后还有一个细小却至关重要的教训：**书中始终强调** ***权衡取舍***。天下没有免费的午餐——每个设计决定（比如为了速度引入缓存，或为了数据质量设计模式）都有副作用。牢记可靠性、可扩展性和可维护性这些目标，你就能更清晰地推理这些取舍。

> ➡️ *This mindset of **evaluating trade-offs** is probably the most significant meta-learning I gained from the DDIA book.*

> ➡️ *这种**评估权衡**的思维方式，可能是我从 DDIA 中获得的最重要的元学习。*

### Data models we use daily｜我们日常使用的数据模型

Having worked with SQL and NoSQL databases, I found DDIA’s treatment of data models to be at once a refresher and an eye-opener: **it compares the traditional relational model with the newer document and graph models in a very balanced way.**

> 我既使用过 SQL 数据库，也使用过 NoSQL 数据库，因此 DDIA 对数据模型的讨论既让我重温了旧知，也让我眼界大开：**它非常平衡地比较了传统的关系模型与更新的文档模型、图模型。**

The takeaway? Use a data model that reflects your data access pattern. **Relational databases are well-suited to complex queries** and many-to-many relationships through joins and normalized schemas. If the data is very interconnected, like social networks, a graph database is a natural fit and can ease those traversals.

> 得出的结论是什么？使用能够反映数据访问模式的数据模型。**关系数据库适合复杂查询**，并能通过连接和规范化模式处理多对多关系。如果数据高度互联（例如社交网络），图数据库就是自然的选择，也能简化这类遍历。

If your data is highly interconnected (think social networks), a **graph database** is a natural fit and can simplify those traversals.

> 如果数据高度互联（想想社交网络），**图数据库**就是自然的选择，可以简化这些遍历操作。

On the other hand, if your data is self-contained and primarily comprises documents, such as user profiles or blog posts with comments, **a document database** may be more convenient.

> 另一方面，如果数据是自包含的，主要由文档构成，例如用户资料或带评论的博客文章，那么**文档数据库**可能更方便。

Document databases offer **schema flexibility and efficiently load entire records**, making reads faster for document-shaped data. That was an interesting point to gather: if your app typically loads an entire document, such as a user profile with all its nested information, at once, a document store can eliminate join overhead and be more performant.

> 文档数据库提供**灵活的模式，并能高效加载完整记录**，因此对文档形态的数据来说读取速度更快。这里有一个很有意思的要点：如果应用通常一次性加载完整文档，例如包含所有嵌套信息的用户资料，文档存储就能消除连接开销，性能也可能更好。

An example of one MongoDB document｜MongoDB 文档示例：

[![Example MongoDB document｜MongoDB 文档示例](https://substackcdn.com/image/fetch/$s_!cFra!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faa26e50b-3e15-42fc-b1cd-0810b6764e25_2793x1092.png)](https://substackcdn.com/image/fetch/$s_!cFra!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faa26e50b-3e15-42fc-b1cd-0810b6764e25_2793x1092.png)

Example [MongoDB document](https://www.mongodb.com/): a blog post with nested author and comments fields.｜[MongoDB 文档](https://www.mongodb.com/)示例：一篇包含嵌套作者字段和评论字段的博客文章。

Here are the most used data models and their respective database types:

> 以下是最常用的数据模型及其对应的数据库类型：

* **📄 Document databases** (e.g., MongoDB, CouchDB) lack join capabilities, so they *struggle with many-to-many data*, so you might end up doing those joins at the application level (complex).
* **🗄️ Relational databases** have schemas (schema-on-write), which provide consistency, but that rigidity led to the rise of **NoSQL** when developers wanted more agile schemas. DDIA discusses the concept of **impedance mismatch**, which refers to the mismatch between the objects in application code and the tables in an SQL database. Many developers, including myself, have felt this pain, and it’s why **Object-Relational Mappers (ORMs)** exist. The document model (e.g., JSON storage) can reduce this mismatch because the stored data more closely resembles in-memory structures. But again, trade-offs: schema flexibility can turn into “schema *chaos*” if you’re not careful with data quality.
* 🕸️ The book also explores less common models, such as **Graph databases** (E.g., [Neo4j](https://neo4j.com/) and [Titan](http://espeed.github.io/titandb/)), and explains when they’re helpful (if many-to-many relationships are common). Facebook, for example, maintains a single graph with many different types of vertices and edges. Their vertices represent people, locations, events, check-ins, and user comments, while edges indicate which people are friends.

> - **📄 文档数据库**（例如 MongoDB、CouchDB）缺少连接能力，因此*难以处理多对多数据*；最后你可能不得不在应用层完成这些连接（这会很复杂）。
> - **🗄️ 关系数据库**拥有模式（写入时模式），能够提供一致性；但当开发者需要更灵活的模式时，这种刚性也促成了 **NoSQL** 的兴起。DDIA 讨论了**阻抗失配（impedance mismatch）**这一概念，指的是应用代码中的对象与 SQL 数据库中的表之间的不匹配。包括我在内的许多开发者都体会过这种痛苦，这也是 **对象—关系映射器（ORM）**存在的原因。文档模型（例如 JSON 存储）可以减轻这种失配，因为存储数据更接近内存中的结构。但还是那句话：凡事都有取舍；如果不注意数据质量，模式灵活性可能变成“模式*混乱*”。
> - 🕸️ 本书还探讨了不太常见的模型，例如**图数据库**（如 [Neo4j](https://neo4j.com/) 和 [Titan](http://espeed.github.io/titandb/)），并解释它们在何时有用（多对多关系常见时）。例如，Facebook 维护着一张包含多种顶点和边的图。顶点代表人、地点、事件、签到和用户评论，边则表示哪些人互为好友。

In summary, *Designing Data-Intensive Applications* provided me with proper reasoning about database types: **choose your database not based on hype, but rather on how your application uses the data**.

> 总之，*Designing Data-Intensive Applications* 为我理解数据库类型提供了正确的推理方式：**选择数据库时不要追逐热点，而要看应用如何使用数据**。

This means that if you need ACID transactions with lots of complex joins, **relational databases** are still a safe bet. If you need flexible schemas or write workloads with eventual consistency, a document or **key-value storage solution** may work better for you. If you need to represent complex relationships, a **graph data model** can eliminate lots of code.

> 这意味着，如果你需要 ACID 事务和大量复杂连接，**关系数据库**仍然是稳妥的选择。如果你需要灵活的模式，或能接受最终一致性的写入负载，文档数据库或**键值存储方案**可能更适合。如果你需要表示复杂关系，**图数据模型**可以省掉大量代码。

Here is the comparison table｜下面是比较表：

[![Database model comparison｜数据库模型比较](https://substackcdn.com/image/fetch/$s_!iQia!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fe372a9-c9b4-4d1c-834a-0e37ca8e81b3_1407x989.png)](https://substackcdn.com/image/fetch/$s_!iQia!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fe372a9-c9b4-4d1c-834a-0e37ca8e81b3_1407x989.png)

It was helpful to hear the pros and cons in one presentation, with examples. (Incidentally, it is interesting to note in this text how current technologies are blurring: SQL databases support JSON columns, while NoSQL databases support SQL queries.)

> 通过一份带有实例的介绍同时了解优缺点很有帮助。（顺便说一句，文中提到的技术边界变得模糊这一点也很有意思：SQL 数据库支持 JSON 列，而 NoSQL 数据库支持 SQL 查询。）

The image below shows **the current types of databases**:

> 下图展示了**当前的数据库类型**：

[![Current types of databases｜当前的数据库类型](https://substackcdn.com/image/fetch/$s_!Qiui!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F39f46b3b-d18c-4daf-9900-4ad729ccf037_1014x928.png)](https://substackcdn.com/image/fetch/$s_!Qiui!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F39f46b3b-d18c-4daf-9900-4ad729ccf037_1014x928.png)

Types of Databases｜数据库类型

### Storage engines｜存储引擎

One of my favorite learnings was **how databases store and index data internally**. If you’ve ever wondered why *Cassandra* or *RocksDB* behaves differently from *PostgreSQL*, the book’s explanation of storage engines is gold.

> 我最喜欢的收获之一，是理解了**数据库如何在内部存储和索引数据**。如果你曾经好奇为什么 *Cassandra* 或 *RocksDB* 的行为与 *PostgreSQL* 不同，那么这本书对存储引擎的解释就是一座金矿。

It characterizes the two dominant indexing approaches: **The B-tree** indexes used by most relational databases versus the **Log-Structured Merge-trees (LSM-trees)**, used by many modern NoSQL databases.

> 它介绍了两种主流的索引方式：大多数关系数据库使用的 **B 树**索引，以及许多现代 NoSQL 数据库使用的**日志结构合并树（LSM 树）**。

**B-trees** store data in fixed-size blocks (pages) and maintain those pages in a sorted tree structure on disk. They are **optimized for read performance**, and lookups and range scans perform very well since the tree is balanced and shallow.

> **B 树**把数据存储在固定大小的块（页）中，并在磁盘上以有序树结构维护这些页。它们针对**读取性能**进行了优化；由于树是平衡且较浅的，查找和范围扫描都表现很好。

Most databases (such as [SQL Server](https://www.red-gate.com/simple-talk/databases/sql-server/database-administration-sql-server/sql-server-storage-internals-101/), Oracle, MySQL/InnoDB, and PostgreSQL) and most searching and retrieval applications lean heavily on indexing structures for this very reason. However, **writes to B-trees can be a bit slower because inserting a new record may involve multiple disk writes to store the data** and update parent index pages. Small random writes are typically very I/O intensive.

> 正因为如此，大多数数据库（例如 [SQL Server](https://www.red-gate.com/simple-talk/databases/sql-server/database-administration-sql-server/sql-server-storage-internals-101/)、Oracle、MySQL/InnoDB 和 PostgreSQL）以及大多数搜索与检索应用，都严重依赖索引结构。不过，**B 树写入可能稍慢，因为插入新记录可能需要多次磁盘写入，既要保存数据，又要更新父索引页**。小规模随机写入通常会带来很高的 I/O 开销。

> **➡️** ***[SQLite](https://sqlite.org/)**, for example, [includes B-trees for each table and index in the database](https://jvns.ca/blog/2014/10/02/how-does-sqlite-work-part-2-btrees/). For indexes, the key saved on a page is the index's column value, and the value is the row ID where it may be found. For the table B-tree, the key is the row ID, and I believe the value is all the data in that row.*

> **中文翻译：** ***例如，[SQLite](https://sqlite.org/) 为数据库中的每张表和每个索引都使用了 B 树。*** 对于索引，页中保存的键是索引列的值，值则是可以找到该记录的行 ID。对于表的 B 树，键是行 ID，而我认为值就是该行中的全部数据。*

**LSM-trees**, on the other hand, are designed for high write throughput. They cache writes in RAM and always append their data in bulk to disk rather than in place. They maintain their data in sorted files (in [SSTables](https://www.scylladb.com/glossary/sstable/) format), which are then **merged** in the background as needed.

> 相比之下，**LSM 树**是为高写入吞吐而设计的。它们把写入缓存在 RAM 中，并总是将数据批量追加到磁盘，而不是原地更新。它们以有序文件（[SSTable](https://www.scylladb.com/glossary/sstable/) 格式）维护数据，并在需要时于后台对这些文件进行**合并**。

Such is the write sequentiality in **LSM-based storage engines, they are incredibly fast during writes** (due to reduced disk seek times, as they write in sequential order). The disadvantage is that they may be comparatively slower during reads, because data corresponding to a given key might be spread across many files that haven’t been merged yet; this is overcome in LSM-based systems using structures such as **[Bloom filters](https://en.wikipedia.org/wiki/Bloom_filter)**.

> **LSM 存储引擎的写入具有很强的顺序性，因此写入速度极快**（因为数据按顺序写入，减少了磁盘寻道时间）。缺点是读取可能相对更慢，因为某个键对应的数据可能散落在许多尚未合并的文件中；LSM 系统会使用 **[布隆过滤器](https://en.wikipedia.org/wiki/Bloom_filter)**等结构来缓解这一问题。

The book notes a simple rule of thumb: *“B-trees enable faster reads, whereas LSM-trees enable faster writes.”*

> 书中给出了一条简单的经验法则：*“B 树让读取更快，而 LSM 树让写入更快。”*

The image below illustrates the differences between B-Trees and LSM-Trees, along with the database engines that utilize them.

> 下图展示了 B 树与 LSM 树的区别，以及采用它们的数据库引擎。

[![B-Tree versus LSM-Tree｜B 树与 LSM 树](https://substackcdn.com/image/fetch/$s_!PCBo!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F523aaf9f-2d01-480b-b1a5-dc94bc932e10_1520x1543.png)](https://substackcdn.com/image/fetch/$s_!PCBo!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F523aaf9f-2d01-480b-b1a5-dc94bc932e10_1520x1543.png)

**B-Tree vs. LSM-Tree**: B-trees (used in MySQL, PostgreSQL, etc.) favor quick reads with in-place updates, while LSM-trees (used in Cassandra, RocksDB, etc.) favor fast sequential writes and background compaction｜**B 树 vs. LSM 树**：B 树（MySQL、PostgreSQL 等使用）通过原地更新来偏向快速读取；LSM 树（Cassandra、RocksDB 等使用）则偏向快速顺序写入和后台压实。

This was interesting because it explains why something like **[Apache Cassandra](https://cassandra.apache.org)** chooses an LSM-tree architecture. Cassandra’s storage engine is based on log-structured merges. It writes to an in-memory table and an append-only log, then periodically flushes sorted data to disk and compacts it in the background.

> 这一点很有意思，因为它解释了为什么 **[Apache Cassandra](https://cassandra.apache.org)** 会选择 LSM 树架构。Cassandra 的存储引擎基于日志结构合并：它先写入内存表和追加式日志，然后定期把有序数据刷新到磁盘，并在后台执行压实。

This design achieves excellent write performance on commodity hardware, as Cassandra emphasizes, at the cost of read amplification (reads must check multiple SSTable files). Hence, [Cassandra](https://cassandra.apache.org/doc/latest/cassandra/architecture/storage-engine.html) and [CockroachDB](https://www.cockroachlabs.com/docs/stable/architecture/storage-layer) use Bloom filters and data summaries to maintain fast reads.

> 正如 Cassandra 所强调的，这种设计在普通硬件上也能取得出色的写入性能，代价是读取放大（读取必须检查多个 SSTable 文件）。因此，[Cassandra](https://cassandra.apache.org/doc/latest/cassandra/architecture/storage-engine.html) 和 [CockroachDB](https://www.cockroachlabs.com/docs/stable/architecture/storage-layer) 使用布隆过滤器和数据摘要来维持快速读取。

> ➡️ **What are Bloom filters?** *A Bloom filter is a compact, probabilistic data structure that allows fast checking if an element is in a set. Because it stores only bits, it needs far less memory than a full set and provides constant-time lookups. Yet it can occasionally produce false positives.*
>
> [![Bloom filter｜布隆过滤器](https://substackcdn.com/image/fetch/$s_!Zf9t!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff5a21979-696d-4b04-ac64-041c98a96a00_874x583.png)](https://substackcdn.com/image/fetch/$s_!Zf9t!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff5a21979-696d-4b04-ac64-041c98a96a00_874x583.png)
>
> Bloom filters

> **中文翻译：** ➡️ **什么是布隆过滤器？** *布隆过滤器是一种紧凑的概率型数据结构，可以快速判断某个元素是否属于一个集合。由于它只存储位信息，相比完整集合需要的内存少得多，并能提供常数时间查找。不过，它偶尔会产生误报。*
>
> *布隆过滤器*

Meanwhile, a traditional RDBMS like [PostgreSQL](https://www.postgresql.org) updates data pages in place on disk (B-tree), which can be slower for a burst of random writes but makes reads simple (each piece of data has one home).

> 与此同时，像 [PostgreSQL](https://www.postgresql.org) 这样的传统 RDBMS 会在磁盘上原地更新数据页（B 树）。突发的随机写入可能因此更慢，但读取更简单（每份数据都有唯一的存放位置）。

The book also discusses other [indexing structures](https://sqlity.net/en/2445/b-plus-tree/) (hash indexes, secondary indexes, full-text indexes, etc.), but the B-tree vs LSM-tree was the big takeaway for me.

> 书中还讨论了其他[索引结构](https://sqlity.net/en/2445/b-plus-tree/)（哈希索引、二级索引、全文索引等），但 B 树与 LSM 树的对比是我最大的收获。

It’s a classic example of trade-offs: **LSM-trees achieve writes faster by turning random writes into sequential writes, at the cost of more complex reads and background compaction work**. B-trees trade off some write performance to make reads as efficient as possible with one-disc seek to find a record.

> 这是一个典型的权衡案例：**LSM 树把随机写入转换为顺序写入，从而实现更快的写入，但代价是读取更复杂，并需要后台压实工作**。B 树则牺牲一部分写入性能，让读取尽可能高效——一次磁盘寻道就能找到记录。

Now I understand why a database like **[RocksDB](https://rocksdb.org)** (an embeddable key-value store developed by Facebook, based on LSM trees) is favored for write-heavy workloads, or why *Cassandra* can handle high ingest rates. In contrast, MySQL might struggle without caching.

> 现在我理解了，为什么 **[RocksDB](https://rocksdb.org)** 这样的数据库（Facebook 开发的、基于 LSM 树的可嵌入式键值存储）适合写入密集型负载，也理解了 *Cassandra* 为什么能处理很高的写入速率。相比之下，没有缓存时 MySQL 可能会遇到困难。

> 📝 *The book also covers **storage engine optimizations** like how some DBs use **copy-on-write B-trees** or **append-only** techniques to improve consistency, and how **compression** and **buffer caches** come into play.*
>
> 📗 *A good further reading on this topic is the book "**[Database Internals](https://amzn.to/4kFTqvV)**" by Alex Petrov. Petrov's book provides the implementation details that Kleppmann omits.*

> **中文翻译：** 📝 *书中还介绍了**存储引擎优化**，例如某些数据库如何使用**写时复制 B 树**或**追加式**技术来改善一致性，以及**压缩**和**缓冲区缓存**如何发挥作用。*
>
> 📗 *这个主题值得进一步阅读 Alex Petrov 所著的《**[Database Internals](https://amzn.to/4kFTqvV)**》。Petrov 的书补充了 Kleppmann 略去的实现细节。*

### Designing for evolvability: Schemas and Data flow｜面向可演进性设计：模式与数据流

Another aspect I appreciated is the coverage of **data encoding and schema evolution** (from Chapter 4). The book discusses formats such as JSON, XML, and binary protocols (Thrift, Protocol Buffers, Avro), as well as the need for **backward and forward compatibility** when services communicate or when data is stored long-term.

> 我欣赏的另一个方面，是书中对**数据编码与模式演进**（第 4 章）的讨论。本书介绍了 JSON、XML 以及二进制协议（Thrift、Protocol Buffers、Avro）等格式，还说明了服务通信或长期存储数据时为什么需要**向后兼容和向前兼容**。

It shows how using explicit schemas and versioning can make applications **forward-compatible** (e.g., new code can still read old messages, and vice versa). I learned the value of **schema registries** and format evolution – for instance, how [Avro’s](https://avro.apache.org) approach, with a writer schema and reader schema, allows data to be interpreted even as the schema evolves, as long as the changes are compatible.

> 它展示了使用显式模式和版本控制如何让应用具备**向前兼容性**（例如新代码仍能读取旧消息，反过来也一样）。我认识到了**模式注册表**和格式演进的价值——例如，[Avro](https://avro.apache.org) 通过写入者模式和读取者模式来解释数据，只要变更保持兼容，即使模式发生演进，数据仍然可以被正确理解。

Why is this in a book about data-intensive apps? Because **data outlives code**. If you deploy an update that changes how data is structured, you can’t just invalidate all old data or require everything to update in lockstep.

> 为什么一本讨论数据密集型应用的书要讲这个？因为**数据比代码活得更久**。如果部署一次更新改变了数据的结构，你不能简单地让所有旧数据失效，也不能要求所有组件严格同时更新。

The table below compares JSON, XML, and Binary formats.｜下表比较了 JSON、XML 和二进制格式。

[![JSON versus XML versus Binary formats｜JSON、XML 与二进制格式](https://substackcdn.com/image/fetch/$s_!F6tb!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8e62db59-847a-4096-8f06-bb1571c462b5_3133x1968.png)](https://substackcdn.com/image/fetch/$s_!F6tb!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8e62db59-847a-4096-8f06-bb1571c462b5_3133x1968.png)

JSON vs XML vs Binary formats｜JSON、XML 与二进制格式

### Distributed systems concepts 🔗｜分布式系统概念 🔗

The second part of this book (Part II) **delves deeply into distributed data systems, which fascinate me as an architect**. It discusses replication, partitioning (also known as sharding), transactions, and consistency models.

> 本书的第二部分（第二篇）**深入探讨了分布式数据系统，这正是作为架构师的我最感兴趣的内容**。它讨论复制、分区（也称分片）、事务以及一致性模型。

There are a number of things that can be learned from this, as this is the heart of the book; therefore, I will select a number of things that caught my attention:

> 这部分是全书的核心，从中可以学到很多东西；因此，我挑选一些最吸引我的内容来介绍：

#### Replication strategies｜复制策略

DDIA describes how to implement data replication across multiple nodes for fault tolerance and scaling reads. It covers **leader-follower or single-leader replication**, where one node acts as the leader or primary for handling write operations, and another set of nodes serves as followers or replicas.

> DDIA 描述了如何在多个节点之间实现数据复制，以获得容错能力并扩展读取能力。它介绍了**主从复制或单主复制**：其中一个节点作为 leader 或 primary 负责处理写操作，另一组节点作为 follower 或 replica 提供服务。

It is used in many systems (PostgreSQL, MySQL, MongoDB, and so on). It provides a consistent ordering of writes (since only one leader writes them).

> 许多系统（PostgreSQL、MySQL、MongoDB 等）都采用这种方式。它能够提供一致的写入顺序，因为只有一个 leader 负责写入。

I liked how the book described the **trade-off between synchronous replication and asynchronous replication.** Synchronous replication means the leader waits until followers acknowledge write operations, whereas in asynchronous replication, the leader lags behind the followers and remains highly available.

> 我喜欢书中对**同步复制与异步复制之间权衡**的描述。同步复制意味着 leader 要等 follower 确认写操作；异步复制则允许 follower 落后于 leader，使 leader 保持更高的可用性。

It was a good refresher about why we sometimes see lag in replication and stale reads for followers.

> 这很好地重温了我们为什么有时会看到复制延迟，以及 follower 上的读取为什么会过时。

[![Leader-based replication｜基于 leader 的复制](https://substackcdn.com/image/fetch/$s_!fiKB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2b411645-fc7f-4c7c-9195-7bbfd2b5ddc3_1680x744.png)](https://substackcdn.com/image/fetch/$s_!fiKB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2b411645-fc7f-4c7c-9195-7bbfd2b5ddc3_1680x744.png)

Leader-based replication (Credits: Author)｜基于 leader 的复制（图片来源：作者）

The book also covers **multi-master setups** (where multiple nodes can accept writes). This may be helpful for geographically distributed databases (where each data center has a local leader) and for some offline-enabled apps.

> 本书还介绍了**多主架构**（多个节点都可以接受写入）。这对于地理分布式数据库（每个数据中心都有本地 leader）以及某些支持离线工作的应用可能很有帮助。

Nonetheless, it entails the giant pain of **write conflicts**, where two leaders might accept conflicting writes at the same time. The DDIA describes how to address write conflicts and concludes that, while a multi-leader replication strategy fulfills its requirements, it will rarely be justified.

> 但它也带来了**写冲突**这一巨大的痛点：两个 leader 可能同时接受相互冲突的写入。DDIA 介绍了如何处理写冲突，并得出结论：尽管多主复制策略在某些场景能满足需求，但很少有充分理由采用它。

I gained insight into why systems like PostgreSQL and MongoDB use single-leader replication by default, while multi-leader scenarios like Active-Active remain largely relegated to special use cases or custom-built apps (for example, in Google Docs’ collaboration features).

> 我因此理解了为什么 PostgreSQL 和 MongoDB 等系统默认使用单主复制，而 Active-Active 这类多主场景大多只用于特殊用例或定制应用（例如 Google Docs 的协作功能）。

Towards the end of Chapter 5, the author also discusses leaderless replication. This is the model used by [Cassandra](https://aws.amazon.com/keyspaces/what-is-cassandra/) and [Voldemort](https://github.com/voldemort/voldemort): there is no single leader; any replica can accept writes, and they use **quorum for consistency**.

> 在第 5 章末尾，作者还讨论了无主复制。这是 [Cassandra](https://aws.amazon.com/keyspaces/what-is-cassandra/) 和 [Voldemort](https://github.com/voldemort/voldemort) 所采用的模型：系统没有单一 leader，任何副本都可以接受写入，并通过**法定人数（quorum）保证一致性**。

The book describes how **quorum reads/writes** work: e.g., with *N* replicas, you might require any *W* of them to acknowledge a write and *R* of them to respond to a read, such that *W + R > N* ensures at least one up-to-date copy is read. This yields ***eventual consistency***, a concept that the book explains in great detail.

> 书中描述了**quorum 读写**的工作方式：例如，系统有 *N* 个副本时，可以要求其中任意 *W* 个副本确认一次写入，并要求 *R* 个副本响应一次读取；只要 *W + R > N*，就能保证读到至少一份最新副本。这会带来***最终一致性***，书中对这一概念作了非常详细的解释。

[![A quorum write｜一次 quorum 写入](https://substackcdn.com/image/fetch/$s_!rEWt!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faabae476-49cd-40a3-a946-e48169e255f4_640x382.png)](https://substackcdn.com/image/fetch/$s_!rEWt!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faabae476-49cd-40a3-a946-e48169e255f4_640x382.png)

A quorum write (Credits: Author)｜一次 quorum 写入（图片来源：作者）

I also found the discussion of **sloppy quorums. I hinted at handoffs,** interesting (where writes can be accepted by fewer nodes than the quorum to ensure high availability, at the cost of increased inconsistency risk). Sloppy quorums are particularly useful for increasing write availability.

> 我也觉得书中关于**宽松 quorum（sloppy quorum）以及 hinted handoff**的讨论很有意思：为了确保高可用，写入可以被少于法定人数要求的节点接受，代价是增加不一致风险。宽松 quorum 对提高写入可用性尤其有用。

All in all, it demystified how systems like Cassandra achieve high availability and write throughput by sacrificing strict consistency. The trade-off: you, the developer, now have to consider consistency issues (such as read-repair and tombstones).

> 总的来说，这部分揭开了 Cassandra 这类系统的工作方式：它们牺牲严格一致性，以换取高可用性和高写入吞吐。代价是：作为开发者，你现在必须考虑一致性问题（例如读修复和墓碑标记）。

[![CDN media](https://substackcdn.com/image/fetch/$s_!Apms!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff44f7b97-9c2d-4d82-94c7-7bfb54edecc2_960x928.jpeg "CDN media")](https://substackcdn.com/image/fetch/$s_!Apms!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff44f7b97-9c2d-4d82-94c7-7bfb54edecc2_960x928.jpeg)

Eventual consistency as a comic book ([Source](https://www.dupuis.com/imbattable/bd/imbattable-tome-1-justice-et-legumes-frais/70978))｜漫画中的最终一致性（[来源](https://www.dupuis.com/imbattable/bd/imbattable-tome-1-justice-et-legumes-frais/70978)）

#### Sharding (Partitioning)｜分片（分区）

The book covers **partitioning** data across nodes to handle large data sets. It details two central partitioning schemes: **range partitioning** (each shard handles a contiguous key range) and **hash partitioning** (keys are hashed to shards).

> 本书介绍了如何把数据**分区**到多个节点，以处理大型数据集。它详细介绍了两种核心分区方案：**范围分区**（每个 shard 负责一段连续的键范围）和**哈希分区**（把键哈希到不同 shard）。

**Range partitioning** can lead to hotspots if data isn’t uniform (e.g., all recent timestamps go to one shard), whereas hashing usually distributes load more evenly at the cost of losing locality (you can’t easily do range queries without touching many shards).

> 如果数据分布不均，**范围分区**可能造成热点（例如所有最新时间戳都落到一个 shard）；哈希通常能更均匀地分配负载，但代价是失去局部性（范围查询往往需要访问许多 shard，难以高效完成）。

The image below shows the difference between Range and Hash partitioning.｜下图展示了范围分区与哈希分区的区别。

[![Range versus Hash partitioning｜范围分区与哈希分区](https://substackcdn.com/image/fetch/$s_!ULpP!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd2ff93f3-8a46-4965-b090-74c8403817bb_1575x1526.png)](https://substackcdn.com/image/fetch/$s_!ULpP!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd2ff93f3-8a46-4965-b090-74c8403817bb_1575x1526.png)

Range vs Hash partitioning｜范围分区 vs. 哈希分区

An “aha” moment for me was the explanation of how *secondary indexes* work in a sharded database. Either each shard maintains a local index (and a query must scatter to all shards), or you have a distributed index structure that itself must be partitioned. It’s a tricky problem, and it has given me even more respect for systems like [Elasticsearch](https://www.elastic.co/elasticsearch) or [MongoDB,](https://www.mongodb.com/) which provide secondary indexes on sharded data.

> 对我来说，一个“恍然大悟”的时刻是书中解释分片数据库里的*二级索引*如何工作：要么每个 shard 维护本地索引（查询必须向所有 shard 分发），要么建立一个分布式索引结构，而它本身也必须被分区。这是个棘手的问题，也让我更加敬佩 [Elasticsearch](https://www.elastic.co/elasticsearch) 和 [MongoDB](https://www.mongodb.com/) 这类能够在分片数据上提供二级索引的系统。

The key lesson is that **sharding is essential for scalability. Still, it adds complexity**, from determining the right partition key to rebalancing shards when a node is added, to handling multi-shard queries (scatter/gather).

> 关键教训是：**分片对可扩展性至关重要，但它也会增加复杂性**，包括确定合适的分区键、添加节点时重新平衡 shard，以及处理多 shard 查询（scatter/gather）。

#### Transactions and consistency models｜事务与一致性模型

In distributed systems, concepts like **consistency models,** **linearizability, serializability, snapshot isolation,** and the famous **CAP theorem** often confuse engineers. DDIA did a great job clarifying these.

> 在分布式系统中，**一致性模型**、**线性一致性、可串行化、快照隔离**以及著名的 **CAP 定理**等概念经常让工程师感到困惑。DDIA 很好地澄清了这些概念。

If you’ve spent significant time building or designing database-backed systems, transactions are likely something you've both loved and hated. Chapter 7 of *Designing Data-Intensive Applications* addresses the role of transactions in distributed systems.

> 如果你花过大量时间构建或设计数据库支持的系统，那么你很可能既爱过又恨过事务。*Designing Data-Intensive Applications* 的第 7 章讨论了事务在分布式系统中的作用。

People often say you must abandon transactions to achieve performance or scalability, but Kleppmann argues that’s not true. While multi-object transactions can be challenging in distributed settings, transactions themselves remain critical for many correctness guarantees.

> 人们常说，要获得性能或可扩展性就必须放弃事务，但 Kleppmann 认为事实并非如此。虽然多对象事务在分布式环境中可能很难实现，但事务本身对于许多正确性保证仍然至关重要。

Transactions are usually explained in terms of database **ACID properties**:

> 事务通常通过数据库的 **ACID 属性**来解释：

* **Atomicity**. Events within a transaction all occur, or none do.
* **Consistency**. The database is maintained in a “valid state,” although it's typically the application that defines what "valid" means.
* **Isolation**. Concurrent transactions don't interfere with or see each other's partial results.
* **Durability**. Once committed, the data is persisted and recoverable.

> - **原子性（Atomicity）**：事务中的事件要么全部发生，要么一个也不发生。
> - **一致性（Consistency）**：数据库始终处于“有效状态”，不过通常由应用定义什么是“有效”。
> - **隔离性（Isolation）**：并发事务不会相互干扰，也看不到彼此的部分结果。
> - **持久性（Durability）**：一旦提交，数据就会持久化并且能够恢复。

Almost all storage engines support **single-object atomicity and isolation**, usually using write-ahead logging and locking. The real complexity lies in **multi-object transactions**, particularly across partitions, which is why many distributed databases avoid them.

> 几乎所有存储引擎都支持**单对象原子性和隔离性**，通常通过预写式日志和锁来实现。真正的复杂性在于**多对象事务**，尤其是跨分区事务；这也是许多分布式数据库避开它们的原因。

[![ACID transactions｜ACID 事务](https://substackcdn.com/image/fetch/$s_!73Da!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcd0889e2-d170-496b-b0d1-39725974e662_1026x1328.png)](https://substackcdn.com/image/fetch/$s_!73Da!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcd0889e2-d170-496b-b0d1-39725974e662_1026x1328.png)

ACID transactions｜ACID 事务

To improve performance, many databases don’t guarantee complete isolation out of the box. Instead, they provide weaker guarantees, such as Read Committed or Snapshot Isolation:

> 为了改善性能，许多数据库默认不会保证完整的隔离性，而是提供较弱的保证，例如 Read Committed 或 Snapshot Isolation：

* **Read Committed Isolation**. Only defends against basic problems, such as dirty reads and dirty writes, but provides no protection against more subtle ones, such as read skew (where different queries in a transaction see different snapshots of committed data).
* **Snapshot Isolation**. A consistent point-in-time snapshot mitigates many of the problems associated with read skew. However, even snapshot isolation isn’t perfect; it cannot completely defend against all concurrency anomalies, such as lost updates or write skew.

> - **读已提交隔离（Read Committed Isolation）**：只能防御脏读、脏写等基本问题，却无法防范更微妙的问题，例如读偏斜（同一事务中的不同查询看到已提交数据的不同快照）。
> - **快照隔离（Snapshot Isolation）**：一致的时间点快照可以缓解许多与读偏斜相关的问题。不过，快照隔离也并不完美；它无法完全防范所有并发异常，例如丢失更新或写偏斜。

Common **race conditions** Kleppmann points out include the

> Kleppmann 指出的常见**竞态条件**包括：

* **Lost Updates**. When concurrent transactions overwrite each other's updates. Solutions range from atomic increment operations to explicit locks (`SELECT ... FOR UPDATE`), or optimistic concurrency controls, such as compare-and-set.

> - **丢失更新（Lost Updates）**：并发事务相互覆盖对方的更新。解决方案包括原子递增操作、显式锁（`SELECT ... FOR UPDATE`），以及比较并设置（compare-and-set）等乐观并发控制。

  [![Race condition between two clients implementing a counter｜两个客户端实现计数器时的竞态条件](https://substackcdn.com/image/fetch/$s_!UDyQ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3983155f-b2b3-4d84-8211-22d991676a1d_1670x552.png)](https://substackcdn.com/image/fetch/$s_!UDyQ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3983155f-b2b3-4d84-8211-22d991676a1d_1670x552.png)

  A race condition between two clients concurrently implementing a counter (Credits: Author)｜两个客户端并发实现计数器时产生的竞态条件（图片来源：作者）
* **Write Skew and Phantom Reads**. Subtle problems arising from concurrent updates with erroneous business logic result. Serializable isolation levels are required here.

> - **写偏斜与幻读（Write Skew and Phantom Reads）**：并发更新与错误业务逻辑共同造成的微妙问题。此时需要可串行化隔离级别。

Though lower isolation levels can improve performance, they come with tricky concurrency bugs that are notoriously difficult to discover and debug. Kleppmann emphasizes the need for the highest isolation level, namely **Serializable isolation**.

> 尽管较低的隔离级别可以提高性能，但它们会带来棘手的并发 bug，而这类 bug 一向很难发现和调试。Kleppmann 强调了最高隔离级别，即**可串行化隔离（Serializable isolation）**的必要性。

There are various ways to achieve serializable isolation:

> 实现可串行化隔离有多种方式：

* **Actual serial execution**. Just execute transactions one at a time in a single thread. Surprisingly effective on modern hardware with fast in-memory databases and short transactions, but does not saturate a single CPU.
* **Two-Phase Locking (2PL)**. Relies heavily on shared and exclusive locks to ensure transaction integrity. This protocol is quite robust, but it can cause performance bottlenecks because of lock contention and deadlocks.
* **Serializable Snapshot Isolation (SSI)**. This is another quite new optimistic method of concurrency control. SSI doesn’t block immediately; it checks for conflicts only when transactions commit. So there are fewer unnecessary aborts. This was proposed in [Michael Cahill’s PhD](https://dl.acm.org/doi/10.1145/1620585.1620587) thesis in 2008.

> - **实际串行执行（Actual serial execution）**：在单线程中一次只执行一个事务。对于拥有快速内存数据库和短事务的现代硬件来说，这种方式出乎意料地有效，但无法让单个 CPU 达到饱和。
> - **两阶段锁（Two-Phase Locking，2PL）**：大量依靠共享锁和排他锁来确保事务完整性。这种协议相当稳健，但锁竞争和死锁可能导致性能瓶颈。
> - **可串行化快照隔离（Serializable Snapshot Isolation，SSI）**：一种相对较新的乐观并发控制方法。SSI 不会立即阻塞，而是在事务提交时才检查冲突，因此可以减少不必要的中止。这一方法由 [Michael Cahill 的博士论文](https://dl.acm.org/doi/10.1145/1620585.1620587)于 2008 年提出。

[![Serializable Snapshot Isolation｜可串行化快照隔离](https://substackcdn.com/image/fetch/$s_!B9ng!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2bf95cfb-d956-4595-bf19-4e4cbf4d68f9_1706x1130.png)](https://substackcdn.com/image/fetch/$s_!B9ng!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2bf95cfb-d956-4595-bf19-4e4cbf4d68f9_1706x1130.png)

Seriazible Snapshot Isolation (Credits: Author)｜可串行化快照隔离（图片来源：作者）

The image below shows consistency models and isolation levels.｜下图展示了一致性模型与隔离级别。

[![Consistency models and isolation levels｜一致性模型与隔离级别](https://substackcdn.com/image/fetch/$s_!HCM3!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F08551a60-04ae-45c4-bf96-5d2923178993_1757x1421.png)](https://substackcdn.com/image/fetch/$s_!HCM3!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F08551a60-04ae-45c4-bf96-5d2923178993_1757x1421.png)

Isolation levels (Read more **[here](https://sergeiturukin.com/2017/06/29/eventual-consistency.html)** and **[here](https://jepsen.io/consistency/models)**)｜隔离级别（更多内容见 **[这里](https://sergeiturukin.com/2017/06/29/eventual-consistency.html)** 和 **[这里](https://jepsen.io/consistency/models)**）

Chapter 9 explains that **linearizability** (usually called “strong consistency”) is essentially the guarantee that every operation appears to execute atomically in some global order - it’s what you’d want for something like “read-after-write” always to return the latest write.

> 第 9 章解释说，**线性一致性**（通常称为“强一致性”）本质上保证每个操作看起来都以原子方式执行于某个全局顺序中——例如，你希望“写后读”始终返回最新写入时，就需要这种保证。

However, achieving linearizable reads across distributed replicas incurs a performance and availability cost (**[the CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem)**: you trade availability under partitioning for linearizability). The book uses CAP to explain why systems like Dynamo prioritize availability and partition tolerance over consistency, whereas systems like ZooKeeper prioritize consistency over availability.

> 不过，在分布式副本之间实现线性一致读取会付出性能和可用性的代价（**[CAP 定理](https://en.wikipedia.org/wiki/CAP_theorem)**：在发生分区时，你要用可用性换取线性一致性）。书中用 CAP 解释了为什么 Dynamo 这类系统把可用性和分区容错置于一致性之上，而 ZooKeeper 这类系统则把一致性置于可用性之上。

[![The CAP Theorem｜CAP 定理](https://substackcdn.com/image/fetch/$s_!aLCj!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5e86cab9-9a33-46fe-a78c-6a1eb0688c8d_1280x720.png)](https://substackcdn.com/image/fetch/$s_!aLCj!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5e86cab9-9a33-46fe-a78c-6a1eb0688c8d_1280x720.png)

The CAP Theorem｜CAP 定理

> ℹ️ **What is [CAP Theorem](https://en.wikipedia.org/wiki/CAP_theorem)?** *CAP theorem is an important term in distributed systems and databases in general. CAP theorem is composed of the acronym CAP, where C stands for “Consistency,” A stands for “Availability,” and P stands for “Partition Tolerance.” These are characteristics that can be attained in distributed systems. However, the CAP theorem says that it is impossible to achieve all three characteristics simultaneously in a distributed system. For instance, let’s consider building a system that ensures all reads see the latest write (Consistency) and still functions even if the network fails (Partition Tolerance).*
>
> ➡️ *Check the authors’ critiques of the CAP theorem in [this article](https://arxiv.org/abs/1509.05393).*

> **中文翻译：** ℹ️ **什么是 [CAP 定理](https://en.wikipedia.org/wiki/CAP_theorem)？** *CAP 定理是分布式系统和数据库领域的重要术语。CAP 是三个英文词的首字母缩写：C 代表“一致性（Consistency）”，A 代表“可用性（Availability）”，P 代表“分区容错性（Partition Tolerance）”。这些是分布式系统可以追求的特征。不过，CAP 定理指出，在一个分布式系统中，不可能同时实现这三个特征。例如，考虑构建这样一个系统：它保证所有读取都能看到最新写入（一致性），同时即使网络发生故障也能继续工作（分区容错性）。*
>
> ➡️ *关于作者对 CAP 定理的批评，请参见[这篇文章](https://arxiv.org/abs/1509.05393)。*

It also distinguishes **serializability** (an isolation property for transactions) from linearizability (a consistency property for reads and writes on single objects). A subtle point that many, including myself, weren’t super clear on before.

> 它还区分了**可串行化（serializability）**（事务的隔离属性）与线性一致性（单对象读写的一致性属性）。这是一个微妙的区别，包括我在内的许多人过去都没有真正弄清楚。

The treatment of **consensus algorithms** (such as [Raft](https://raft.github.io/) and [Paxos](https://www.scylladb.com/glossary/paxos-consensus-algorithm/)) was also approachable.

> 对**共识算法**（例如 [Raft](https://raft.github.io/) 和 [Paxos](https://www.scylladb.com/glossary/paxos-consensus-algorithm/)）的讲解也很容易理解。

By the end, I had a better intuitive sense of how leaders are elected and why distributed systems require consensus for tasks like atomic commits.

> 读到最后，我对 leader 如何选出，以及分布式系统为什么需要共识来完成原子提交等任务，有了更好的直觉认识。

#### **Troubles with Distributed Systems｜分布式系统的麻烦**

One of the chapters I found especially valuable addresses common problems in distributed systems. We know that distributed systems promise scalability, reliability, and high availability; however, anyone who has built one also knows they have many challenges.

> 我觉得特别有价值的一章讨论了分布式系统中的常见问题。我们知道，分布式系统承诺带来可扩展性、可靠性和高可用性；但任何构建过分布式系统的人也都知道，它们伴随着许多挑战。

Kleppmann calls this out directly: unlike single-node systems (which typically either work entirely or fail), distributed systems can experience **partial failures**, where parts of the system break while the rest continue to work, often unpredictably.

> Kleppmann 直接指出了这一点：与单节点系统（通常要么整体工作，要么整体失败）不同，分布式系统可能出现**部分失效**——系统的一部分发生故障，而其余部分继续工作，并且这种情况往往不可预测。

Here are the key insights and lessons from this chapter:

> 以下是本章的关键洞见与教训：

* **Faults, Partial Failures, and Nondeterminism**. Distributed systems are fundamentally nondeterministic. Nodes can fail silently, networks can drop messages, and software can behave unpredictably. Partial failures aren't just common, they're the norm. This unpredictability makes building distributed systems inherently more difficult.
* **Networks are unreliable (and always will be)**. The reality of modern networks is that they're asynchronous packet networks. That means messages sent between nodes come with **no delivery guarantees**; packets can be delayed, dropped, or duplicated. Usually, we handle these problems with timeouts and chaos testing (as seen on [Netflix’s Chaos Monkey](https://netflix.github.io/chaosmonkey/)).
* **Clocks are unreliable.** The next important, subtle topic: clocks in different nodes become desynchronized. Kleppmann explains the two types of clocks succinctly:

  + **Time-of-day clocks** (wall-clock time): Such clocks can rewind and advance irregularly due to [NTP adjustments](https://en.wikipedia.org/wiki/Network_Time_Protocol), making them unsuitable for timing tasks or event sequencing.
  + **Monotonic clocks**: They never move backward, making them perfect for timing the duration of things like request or response timeouts.

  If precise synchronization is crucial (e.g., ordering transactions globally), tools like **[Google's TrueTime API](https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf)**, used in **[Spanner](https://cloud.google.com/spanner)**, become critical; however, they're also costly and complex. Therefore, it is essential not to blindly trust timestamps across nodes; if your logic relies on precise timing, you're likely to encounter trouble.
* **Leader election**. Many distributed systems rely on electing a "leader" node to coordinate operations. But there is a challenge. Due to network partitions or delayed messages, multiple nodes may simultaneously think they’re the leader, a dreaded situation known as "**split-brain**." The book recommends using **fencing tokens** to mitigate this. This is addressed in the book through the adoption of fencing token techniques, in which each time the leader is elected, a new token is shared with Konsensus nodes, rendering old leaders increasingly useless.

> - **故障、部分失效与非确定性**：分布式系统从根本上说是非确定的。节点可能静默失败，网络可能丢弃消息，软件也可能出现不可预测的行为。部分失效不只是常见现象，它就是常态。这种不可预测性使构建分布式系统天然更加困难。
> - **网络不可靠（而且永远如此）**：现代网络的现实是，它们属于异步分组网络。这意味着节点之间发送的消息**没有投递保证**；数据包可能延迟、丢失或重复。我们通常使用超时和混沌测试来处理这些问题（例如 [Netflix 的 Chaos Monkey](https://netflix.github.io/chaosmonkey/)）。
> - **时钟不可靠**：另一个重要而微妙的主题是，不同节点上的时钟会逐渐失去同步。Kleppmann 简洁地解释了两类时钟：
>   - **日历时钟（墙上时钟）**：这类时钟会因为 [NTP 调整](https://en.wikipedia.org/wiki/Network_Time_Protocol)而回拨或不规则地前进，因此不适合计时任务或事件排序。
>   - **单调时钟**：它们永远不会倒退，非常适合测量请求超时、响应超时等持续时间。
>   如果精确同步至关重要（例如对事务进行全局排序），[Spanner](https://cloud.google.com/spanner) 使用的 **[Google TrueTime API](https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf)** 等工具就很关键；不过，这些工具也昂贵且复杂。因此，绝不能盲目信任跨节点的时间戳；如果逻辑依赖精确计时，很可能会遇到麻烦。
> - **Leader 选举**：许多分布式系统依靠选出一个“leader”节点来协调操作，但这里存在挑战。由于网络分区或消息延迟，多个节点可能同时认为自己是 leader，这种可怕的情况称为“**脑裂（split-brain）**”。书中建议使用**fencing token**来缓解。具体做法是每次选出 leader 时，都向共识节点发放一个新 token，使旧 leader 越来越无用。

  [![Check-write problem solved by fencing tokens｜fencing token 解决的检查—写入问题](https://substackcdn.com/image/fetch/$s_!qeab!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a904b9f-1b70-4a22-adf9-33a354c90660_640x254.png)](https://substackcdn.com/image/fetch/$s_!qeab!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a904b9f-1b70-4a22-adf9-33a354c90660_640x254.png)

  Check-write problem that fencing tokens solve (Credits: Author)｜fencing token 解决的检查—写入问题（图片来源：作者）
* **Byzantine faults**. The normal assumption in most distributed systems is that nodes will act honestly and function correctly, or fail. Kleppmann goes further and considers a more challenging case known as “Byzantine faults,” in which nodes act maliciously or corrupt each other's data. A system that needs resilience against Byzantine faults typically relies on so-called **Byzantine Fault Tolerant (BFT) algorithms,** which incur high costs and system complexity.

> - **拜占庭故障**：大多数分布式系统的通常假设是，节点会诚实行事并正确运行，或者发生故障。Kleppmann 更进一步，考虑了一种更困难的情况，即“拜占庭故障”：节点可能恶意行动，或破坏彼此的数据。需要抵御拜占庭故障的系统通常依赖所谓的**拜占庭容错（BFT）算法**，这会带来很高的成本和系统复杂度。

  > *"A system is Byzantine fault-tolerant if it continues operating correctly even when some nodes lie."*

  > *“如果某些节点撒谎，系统仍能正确运行，那么它就是拜占庭容错的。”*
* **Correctness in distributed algorithms.** Lastly, the chapter introduces two characteristics that can help in understanding accuracy in distributed algorithms:

  + **Safety (”nothing bad happens”):** This must always hold. For example, the fencing tokens must be distinct.
  + **Liveness ("something good eventually happens")**: For example, "eventually receiving a response." Liveness may have conditions, e.g., provided a network partition eventually heals.

> - **分布式算法中的正确性**：最后，本章介绍了两个有助于理解分布式算法正确性的特征：
>   - **安全性（“坏事不会发生”）**：必须始终成立。例如，fencing token 必须彼此不同。
>   - **活性（“好事最终会发生”）**：例如“最终收到响应”。活性可能带有条件，例如网络分区最终恢复。

Violations of safety can have disastrous, irreparable effects; violations of liveness might have temporary, repairable consequences. When choosing or developing algorithms, it’s critical to have a full grasp of these differences, aiming for rigour (safety) and pragmatism (liveness) in equal measures.

> 违反安全性可能造成灾难性且无法挽回的后果；违反活性则可能只造成暂时、可修复的后果。选择或开发算法时，必须充分理解二者的差异，在严谨性（安全性）和务实性（活性）之间同等重视。

> *This chapter reminds me a lot of the **Fallacies of Distributed Computing**. Read more about it **[here](https://newsletter.techworld-with-milan.com/i/148912953/fallacies-of-distributed-computing)**.*

> *这一章让我很自然地想到了**分布式计算的谬误**。更多内容请见**[这里](https://newsletter.techworld-with-milan.com/i/148912953/fallacies-of-distributed-computing)**。*

[![Fallacies of Distributed Systems - by Mahdi Yusuf](https://substackcdn.com/image/fetch/$s_!k4rj!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F40e449e3-86c6-417a-ade1-277497182c28_2000x1414.jpeg "Fallacies of Distributed Systems - by Mahdi Yusuf")](https://substackcdn.com/image/fetch/$s_!k4rj!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F40e449e3-86c6-417a-ade1-277497182c28_2000x1414.jpeg)

8 Fallacies of Distributed Systems (Credits: Mahdi Yusuf)｜分布式系统的 8 个谬误（图片来源：Mahdi Yusuf）

### The power of streams｜流的力量

The last part of DDIA focuses on **derived data** and data processing pipelines, specifically, **batch processing** (similar to Hadoop) and **stream processing** (similar to Kafka or Spark Streaming). I found this section highly pertinent to the current trend of real-time data pipelines in our field.

> DDIA 的最后一部分聚焦于**派生数据**和数据处理流水线，具体包括**批处理**（类似 Hadoop）与**流处理**（类似 Kafka 或 Spark Streaming）。我觉得这一部分与我们所在领域当前的实时数据流水线趋势高度相关。

Kleppmann discusses the batch and stream models very effectively, stating that, at a basic level, many data systems can be reduced to **logging**.

> Kleppmann 对批处理模型和流处理模型的讨论非常有效。他指出，从基本层面看，许多数据系统都可以归结为**日志记录**。

* **Batch processing.** The book uses *MapReduce* and the Unix tool philosophy to explain batch jobs. Batch processing operates on large data sets but doesn’t provide immediate results – it’s about throughput over latency. For example, a nightly job might aggregate log files into a report. We measure batch jobs by**throughput (records per second) or by total time to process a dataset**. One superb example in the book is constructing a simple data pipeline with Unix pipes (grep, sort, etc.) and showing how that inspires distributed frameworks like Hadoop’s MapReduce. The key points are that batch jobs **read from a data source, process data in bulk, and output to another**location; these jobs are often scheduled to run periodically. They are great for large-scale analytics where a few minutes or hours of delay is acceptable.
* **Stream processing.** In contrast, stream processing processes data **event-by-event** in real time (or near real time). Instead of processing a million records after the fact, a stream processor processes events *continuously* as they occur (e.g., user actions on a website to update a real-time dashboard or trigger alerts). The benefit is **low latency** – you don’t have to wait for a scheduled job, you get insights or trigger actions immediately. However, stream processing is typically more complex to implement reliably (you deal with issues like exactly-once processing, out-of-order events, etc., which the book does touch on). Note that the book's presentation of exactly-once semantics is overly simplified.

> - **批处理**：本书使用 *MapReduce* 和 Unix 工具哲学来解释批处理作业。批处理处理大型数据集，但不会立即给出结果——它关注的是吞吐量，而不是延迟。例如，夜间作业可以把日志文件汇总成报告。我们用**吞吐量（每秒记录数）或处理一个数据集所需的总时间**来衡量批处理作业。书中一个很棒的例子是用 Unix 管道（grep、sort 等）构建简单的数据流水线，并展示它如何启发 Hadoop MapReduce 这样的分布式框架。关键点是，批处理作业**从数据源读取数据，批量处理，再输出到另一个位置**；这类作业通常按周期调度运行。对于允许延迟几分钟或几小时的大规模分析，它们非常合适。
> - **流处理**：相比之下，流处理以**事件为单位**实时（或近实时）处理数据。流处理器不是事后处理一百万条记录，而是在事件发生时*持续*处理它们（例如根据网站用户行为更新实时仪表盘或触发告警）。它的好处是**低延迟**——你不必等待定时作业，可以立即获得洞察或触发动作。不过，可靠地实现流处理通常更复杂（需要处理恰好一次处理、乱序事件等问题，书中也有所涉及）。需要注意的是，书中对恰好一次语义的介绍过于简化。

What I loved is how the book ties stream processing to the earlier concepts. For instance, the log abstraction reappears: **a database’s change log can be viewed as a stream of events**. This is the idea behind **Change Data Capture (CDC)**, where changes in a database are captured and streamed to other systems for processing.

> 我喜欢这本书的一点，是它把流处理与前面介绍的概念连接了起来。例如，日志抽象再次出现：**数据库的变更日志可以看成事件流**。这正是**变更数据捕获（Change Data Capture，CDC）**背后的思想：捕获数据库中的变化，并将其作为流发送到其他系统处理。

[![Change Data Capture process｜变更数据捕获流程](https://substackcdn.com/image/fetch/$s_!jtP8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a2334d6-5941-4caf-b2ed-0ed09489e9d8_640x292.png)](https://substackcdn.com/image/fetch/$s_!jtP8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a2334d6-5941-4caf-b2ed-0ed09489e9d8_640x292.png)

Change Data Capture process (Credits: Author)｜变更数据捕获流程（图片来源：作者）

Kleppmann gives an example: you can stream database updates to a search index or cache, rather than batch-syncing them occasionally. This is essentially how systems like **[Debezium](https://debezium.io/)** or **[LinkedIn’s Databus](https://github.com/linkedin/databus)** work. It blurs the line between “database” and “stream”: the replication log of your DB is feeding a real-time pipeline.

> Kleppmann 举了一个例子：你可以把数据库更新流式传输到搜索索引或缓存，而不是偶尔进行批量同步。[Debezium](https://debezium.io/) 或 [LinkedIn 的 Databus](https://github.com/linkedin/databus) 等系统基本就是这样工作的。它模糊了“数据库”和“流”之间的界限：数据库的复制日志正在为一条实时流水线提供数据。

Similarly, the book describes **[Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)** – an architectural pattern where **state changes are logged as immutable events,** and the current state is derived by replaying the event log. Many modern systems (especially in fintech and CQRS architectures) use this pattern, and DDIA gives it context: it’s another flavor of the general **idea of treating your data as streams of events**.

> 同样，本书还介绍了**[事件溯源（Event Sourcing）](https://martinfowler.com/eaaDev/EventSourcing.html)**：这是一种架构模式，其中**状态变化被记录为不可变事件**，当前状态则通过重放事件日志派生出来。许多现代系统（尤其是金融科技系统和 CQRS 架构）都采用这一模式；DDIA 把它放回更大的背景中：它是**把数据视为事件流**这一通用思想的另一种形式。

The image below shows an example of the Event Sourcing pattern.｜下图展示了事件溯源模式的一个例子。

[![Event Sourcing pattern｜事件溯源模式](https://substackcdn.com/image/fetch/$s_!5qO-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa8e03f37-8c99-4b92-b67c-eeb024a23740_2145x1789.png)](https://substackcdn.com/image/fetch/$s_!5qO-!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa8e03f37-8c99-4b92-b67c-eeb024a23740_2145x1789.png)

Event Sourcing｜事件溯源

In addition, the book focuses on challenges, including handling out-of-order events in streams and addressing backpressure when producers outpace consumers. These were tackled conceptually.

> 此外，本书还关注一些挑战，包括处理流中的乱序事件，以及生产者速度超过消费者时如何应对背压。这些问题主要是在概念层面进行讨论的。

It also provides details on the supporting tools, such as **message brokers** (**[RabbitMQ](https://www.rabbitmq.com/)**and **[ActiveMQ](https://activemq.apache.org/)**), in contrast to log-based message brokers (**[Apache Kafka](https://kafka.apache.org) and** **[Amazon Kinesis](https://aws.amazon.com/kinesis/)**).

> 它还介绍了相关支撑工具，例如**消息代理**（**[RabbitMQ](https://www.rabbitmq.com/)** 和 **[ActiveMQ](https://activemq.apache.org/)**），并将它们与基于日志的消息代理（**[Apache Kafka](https://kafka.apache.org)** 和 **[Amazon Kinesis](https://aws.amazon.com/kinesis/)**）作了对比。

> ➡️ **Kafka** *is cited as a distributed log that enables high-throughput event processing. It would have been great to discuss stream processing engines in more detail (the book emerged just ahead of the mainstream recognition of Apache Flink, etc.).*
>
> 💡 *Fun fact: one of the book’s reviewers is **Jay Kreps (creator of Kafka)**, who praised how it “bridges the gap between theory and practice.”*

> **中文翻译：** ➡️ **Kafka** *被作为支持高吞吐事件处理的分布式日志来介绍。如果能更详细地讨论流处理引擎就更好了（这本书问世时，Apache Flink 等技术还没有获得主流认可）。*
>
> 💡 *趣闻：本书的审稿人之一是 **Jay Kreps（Kafka 的创造者）**，他称赞本书“弥合了理论与实践之间的鸿沟”。*

[![Designing Data-Intensive Applications Book Map｜《Designing Data-Intensive Applications》全书地图](https://substackcdn.com/image/fetch/$s_!gaEy!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc5b33167-d4c9-4c43-b589-2014d1e4ffcd_6619x3678.png)](https://substackcdn.com/image/fetch/$s_!gaEy!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc5b33167-d4c9-4c43-b589-2014d1e4ffcd_6619x3678.png)

Designing Data-Intensive Applications Book Map｜《Designing Data-Intensive Applications》全书地图

## **3. The things I didn’t like｜我不喜欢这本书的地方**

There are no flawless books. Though I highly recommend DDIA, I have a few concerns regarding its **limitations and shortcomings**:

> 没有完美的书。虽然我强烈推荐 DDIA，但对于它的**局限与不足**，我也有一些担忧：

### **Outdated examples｜例子过时**

The first edition of this book was published in 2017, but since then, technology has advanced further. For instance, there’s mention of Apache Kafka, which is today one of the central building blocks of many of the data systems described in this book. Examples from the book are up to 2016, which is almost a decade old for our field.

> 本书第一版出版于 2017 年，但此后技术已经进一步发展。例如，书中提到了 Apache Kafka，而如今 Kafka 已经成为书中许多数据系统的核心构件之一。书里的例子最晚来自 2016 年，对于我们这个领域来说已经接近十年前。

The more recent developments in cloud data warehouses, serverless architectures, stream processing (Flink), or data lakes are excluded. **The ideas in DDIA remain valid over time**, yet some details, such as technology or version numbers, in this case from 2025, appear slightly outdated. I am aware that the author maintains [updated versions](https://martin.kleppmann.com/) (and a [second edition is underway](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/)).

> 云数据仓库、无服务器架构、流处理（Flink）或数据湖等较新的发展没有被纳入。**DDIA 中的思想会随着时间保持有效**，但一些细节（例如技术名称或版本号——此处按 2025 年的语境来说）看起来略显过时。我知道作者会维护[更新版本](https://martin.kleppmann.com/)，而且[第二版正在推进](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/)。

Event mesh architectures and advanced CQRS implementations have become mainstream, with companies adopting "shock absorber" patterns and standardized event versioning strategies that build on DDIA's foundational concepts.

> 事件网格架构和高级 CQRS 实现已经走向主流，许多公司采用建立在 DDIA 基础概念之上的“减震器”模式和标准化事件版本策略。

Still, the book itself does not include discussions of topics such as Kubernetes or the latest NewSQL or Vector databases, etc. It occasionally made me wonder, *“What about tool X that came out after 2019?”*

> 不过，书中仍未讨论 Kubernetes，或最新的 NewSQL、向量数据库等主题。这有时会让我想：“那 2019 年之后出现的工具 X 呢？”

### **A lot of theory, less hands-on｜理论很多，实践较少**

Depending on your learning style, this can be a pro or con. The book leans toward **conceptual explanations** over step-by-step tutorials or code. You won’t find ready-to-run examples or guidance on tuning a specific database.

> 根据你的学习方式，这一点可能是优点，也可能是缺点。本书偏重**概念解释**，而非分步教程或代码。你不会在这里找到可以直接运行的例子，也不会找到调优某个具体数据库的指南。

For instance, it explains how a log-structured storage works in principle, but not how to configure Cassandra’s compaction strategy. I enjoyed the theory, but some readers might be hoping for a “how to build a scalable system” playbook with concrete recipes. DDIA is more like a textbook or reference – it gives you the mental models, not ready-to-use solutions.

> 例如，它解释了日志结构存储在原理上如何工作，却没有说明如何配置 Cassandra 的压实策略。我喜欢这些理论，但有些读者可能期待一本带有具体配方的“如何构建可扩展系统”手册。DDIA 更像教材或参考书——它给你的是思维模型，而不是可以直接使用的解决方案。

**Chapter 9 (on consistency and consensus) is especially overloaded,** representing the book's most significant weakness, as it attempts to cover an entire semester of distributed systems content in a single chapter.

> **第 9 章（关于一致性与共识）尤其负荷过重**，这是本书最明显的弱点：它试图在一章之内覆盖整整一学期的分布式系统课程内容。

[![Chapter 9 of DDIA｜DDIA 第 9 章](https://substackcdn.com/image/fetch/$s_!VKGL!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6910a812-5e3a-47f0-b581-66898cbdd0e5_556x344.png)](https://substackcdn.com/image/fetch/$s_!VKGL!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6910a812-5e3a-47f0-b581-66898cbdd0e5_556x344.png)

Chapter 9 (DDIA book)｜第 9 章（DDIA）

### **Breadth over depth｜广度优先于深度**

The book is ambitiously broad, covering everything from low-level storage engines to high-level distributed algorithms. Sometimes I wondered **whether the author wanted to write about distributed systems or database engines**, since those are systems at entirely different levels of abstraction.

> 本书覆盖面很广，内容从底层存储引擎一直延伸到高层分布式算法。有时我会疑惑，**作者到底是想写分布式系统，还是数据库引擎**，毕竟这两者处于完全不同的抽象层次。

Also, some topics don’t delve too deeply. Each chapter could probably be a book in its own right (indeed, there are entire books on consensus algorithms or specific databases). For example, the section on **distributed transactions** introduces 2PC but doesn’t delve into newer approaches, such as SAGAs or specific cloud implementations.

> 此外，一些主题的探讨并不深入。每一章可能都足以单独写成一本书（事实上，确实有专门讨论共识算法或具体数据库的整本书）。例如，关于**分布式事务**的部分介绍了 2PC，却没有深入讨论 SAGAs 或特定云实现等更新的方法。

I sometimes expected more details on challenging issues (such as exactly-once stream processing mechanisms or deeper performance case studies) or on events that point to simple implementations. The flip side is that the book stays focused and doesn’t get bogged down; however, readers expecting a deep dive into any single area might need to supplement with other resources.

> 我有时期待书中能更多讲解棘手问题（例如恰好一次流处理机制或更深入的性能案例），或者介绍那些指向简单实现的事件。反过来说，本书因此保持了聚焦，没有陷入细节泥潭；不过，期待对某一领域进行深挖的读者，可能需要用其他资料补充。

### **Density｜信息密度**

This wasn’t a big issue for me, but I’ll note that DDIA is **long (500+ pages)** and dense with information. It’s not light bedtime reading for sure. The writing is clear, but it’s a lot to absorb - I had to read it in chunks and found myself re-reading some sections to understand it correctly (and take notes).

> 这对我来说不是大问题，但我还是要指出，DDIA **篇幅很长（500 多页）**，信息密度也很高。它当然不是适合睡前轻松翻阅的读物。文字写得很清楚，但需要吸收的内容太多——我不得不分段阅读，还经常重读某些部分，才能正确理解并做好笔记。

In terms of style, it’s pretty direct and matter-of-fact (it *is* an engineering book, after all). A bit more narrative or real-world case studies could add some spice.

> 在写作风格上，它相当直接、实事求是（毕竟这是一本工程书）。如果再多一些叙事或真实世界案例，可能会更有趣。

If you already know a topic well, those parts might feel slow; if it’s new to you, you might need to pause and digest. Some parts I also needed to re-read and understand better.

> 如果你已经很熟悉某个主题，相关部分可能会让你觉得进展缓慢；如果主题对你来说是新的，则可能需要停下来消化。我也有一些部分需要反复阅读，才能更好地理解。

In short, it’s a **comprehensive reference**, but not exactly a page-turner. Be prepared to invest some effort.

> 简而言之，它是一本**全面的参考书**，但确实不是让人一页接一页停不下来的读物。要做好投入精力的准备。

Despite these points, none of them are deal-breakers. The “outdated” aspects primarily concern examples (the principles remain solid). And the theoretical nature of the book is by design - it’s actually what makes it stay relevant years later.

> 尽管有这些问题，它们都不足以成为弃读的理由。“过时”主要针对例子（原则依然稳固）；而本书偏理论的特征本来就是刻意设计的——恰恰是它让本书多年之后仍然保持相关性的原因。

[![Part of my bookshelf｜我的书架一角](https://substackcdn.com/image/fetch/$s_!53Bj!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F815ad30c-03b8-4e74-9014-e6d06969a5c6_4032x2631.jpeg)](https://substackcdn.com/image/fetch/$s_!53Bj!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F815ad30c-03b8-4e74-9014-e6d06969a5c6_4032x2631.jpeg)

Part of my bookshelf｜我的书架一角

### Missing migration strategies｜缺少迁移策略

The book neither covers live migration scenarios nor topics like handling migrations with acceptable downtime, nor unnoticeable migrations using middleware components. Since migrations in real-world systems are common practice, they should be included in this book.

> 本书既没有覆盖在线迁移场景，也没有讨论如何在可接受的停机时间内完成迁移，或如何借助中间件组件实现无感迁移。由于迁移在真实系统中非常常见，这些内容本应被纳入本书。

### Operational and monitoring gaps｜运维与监控方面的缺口

The operational issues related to the system’s deployment are selectively addressed. Issues with operating the system may include replication errors, which are selectively addressed. The issue of updating the system schema is also addressed selectively. Data replication in the system is an important issue.

> 与系统部署相关的运维问题只得到了选择性讨论。系统运行中的问题可能包括复制错误，而这方面同样只是选择性地进行了处理。更新系统模式的问题也只是被部分涉及。系统中的数据复制是一个重要问题。

Furthermore, there is additional information on backup, restore, RPO/RTO that I did not consider for the whole system.

> 此外，关于备份、恢复以及 RPO/RTO 的信息也不够完整，无法覆盖整个系统的视角。

## **4. Recommendation｜推荐**

To summarize this book, I offer the following recommendation.

> 总结这本书，我给出以下推荐意见。

### Who should read it｜谁应该读

In summary, I **recommend** this book to **experienced software engineers, architects, and tech leads** (3-8 years of experience) who build or work with data-intensive systems. If you deal with databases, distributed systems, or large-scale data pipelines in your job, you’ll likely find significant value here.

> 总的来说，我**推荐**把这本书介绍给构建或使用数据密集型系统的**有经验的软件工程师、架构师和技术负责人**（拥有 3～8 年经验）。如果你的工作涉及数据库、分布式系统或大规模数据流水线，你很可能会从中获得很大价值。

Even if you have years of experience, DDIA will connect the dots and explain concepts deeply (it certainly did for me). I’d say it’s *essential reading* if you aspire to design systems at scale – it gives you a vocabulary and framework to make smarter decisions.

> 即使你已经有多年经验，DDIA 也能帮你把各个知识点串起来，并深入解释这些概念（至少对我来说确实如此）。如果你希望设计大规模系统，我会说它是*必读书*——它会给你一套词汇和框架，帮助你做出更明智的决策。

In my opinion, it is an excellent reference book for **prep and self-education**. If you’re preparing for a systems design interview or transitioning into a more architecture-focused role, it will level up your understanding.

> 在我看来，它也是一本非常好的**准备与自学参考书**。如果你正在准备系统设计面试，或正转向更偏架构的岗位，它会提升你的理解水平。

### Who might not enjoy it｜谁可能不喜欢

This is certainly **not the best book for developers or students without prior significant experience with distributed systems or databases**. Parts of it are indeed likely to be well above the heads of those who do not already understand concepts such as SQL versus NoSQL, or who do not have a basic understanding of computing systems. A determined beginner will still learn a great deal, but plan to look up unfamiliar terms and reread sections.

> 对于**没有分布式系统或数据库重要实践经验的开发者和学生**来说，这当然**不是最合适的书**。其中一些部分确实可能超出那些还不了解 SQL 与 NoSQL，或还没有计算机系统基础的读者的理解范围。一个有决心的初学者仍然能学到很多，但要做好查阅陌生术语和重读章节的准备。

It can also be a bit demanding to trace too many references for full comprehension, with each chapter containing 30-50 references, making access more difficult for engineers transitioning into the domain from other categories.

> 为了完整理解内容而追踪大量参考文献也可能有些吃力：每章包含 30～50 条参考文献，这会让从其他方向转入该领域的工程师更难入门。

If you’re looking for **immediate, practical how-tos (e.g., “How do I set up a Kubernetes cluster for Kafka?”)**, You won't find them here. It’s neither a cookbook nor a vendor-specific guide. And, if your work is far removed from data systems (say you’re a pure front-end developer or a data scientist focusing on modeling), you might not need this level of systems detail in your daily work.

> 如果你寻找的是**立刻可用的实操指南**（例如“如何为 Kafka 搭建 Kubernetes 集群？”），那你在这里找不到。它既不是食谱式手册，也不是面向某个厂商的指南。而且，如果你的工作与数据系统相距甚远（比如你是纯前端开发者，或专注于建模的数据科学家），日常工作中可能并不需要这么多系统细节。

Lastly, anyone who dislikes theory or is short on time for reading might struggle – the book requires your full attention.

> 最后，不喜欢理论或没有足够阅读时间的人可能会读得很吃力——这本书需要你全神贯注。

In summary, DDIA is **not a lightweight overview**; it’s for those who want to *gain a deep understanding of* data system design. If that’s you, you’ll love it.

> 总之，DDIA **不是轻量级概览**；它适合那些希望*深入理解*数据系统设计的人。如果你正是这样的人，你会喜欢它。

Here is a visual overview of **[my notes from the book](https://milan-milanovic.notion.site/Designing-Data-Intensive-Applications-Notes-by-Dr-Milan-Milanovic-1ac22f7b9a5f80eda8a0ebff46919989)**.｜这里有一份**[我关于本书的笔记](https://milan-milanovic.notion.site/Designing-Data-Intensive-Applications-Notes-by-Dr-Milan-Milanovic-1ac22f7b9a5f80eda8a0ebff46919989)**的可视化总览。

[![Notes from the book｜本书笔记](https://substackcdn.com/image/fetch/$s_!GKmH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49052127-c868-4522-b120-f8a81995065b_1241x950.png)](https://substackcdn.com/image/fetch/$s_!GKmH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49052127-c868-4522-b120-f8a81995065b_1241x950.png)

[Notes](https://milan-milanovic.notion.site/Designing-Data-Intensive-Applications-Notes-by-Dr-Milan-Milanovic-1ac22f7b9a5f80eda8a0ebff46919989) from the book “[Designing Data-Intensive Applications](https://amzn.to/3ZX4uMv)” by [Martin Klepmann](https://martin.kleppmann.com/)｜[Martin Kleppmann](https://martin.kleppmann.com/) 所著《[Designing Data-Intensive Applications](https://amzn.to/3ZX4uMv)》的[读书笔记](https://milan-milanovic.notion.site/Designing-Data-Intensive-Applications-Notes-by-Dr-Milan-Milanovic-1ac22f7b9a5f80eda8a0ebff46919989)

## 5. Conclusion｜结论

In summary, the book gave me a more precise mental map of distributed data system design. It connects the dots between theory and real systems: e.g., how **Kafka’s** design of a replicated log is essentially a leader-based replication under the hood, or how **Cassandra’s** eventual consistency model is an implementation of leaderless quorum replication.

> 总之，这本书为我提供了一幅更精确的分布式数据系统设计心智地图。它把理论与真实系统连接起来：例如，**Kafka** 的复制日志设计在底层本质上是基于 leader 的复制；而 **Cassandra** 的最终一致性模型则是无 leader 的 quorum 复制的一种实现。

I came away with a deeper understanding of *why* specific systems make the choices they do. It’s now easier for me to reason about questions like *“Do we need a distributed transaction across services, or can we get away with eventual consistency?”* or *“Should we prefer a single primary database with failover, or a multi-region multi-master setup?”* because I can weigh the pros and cons more concretely (latency vs consistency vs complexity, etc.).

> 我对特定系统*为什么*做出这些选择有了更深的理解。现在，面对“我们需要跨服务的分布式事务吗，还是最终一致性就够了？”或“我们应该选择带故障切换的单主数据库，还是多区域多主架构？”这类问题时，我更容易进行推理，因为我可以更具体地权衡优缺点（延迟、一致性、复杂性等）。

Those are some of the key points I carry away from *Designing Data-Intensive Applications*. The book both validated what I’d learned through experience *and* taught me new ways to think about problems I hadn't yet encountered.

> 这些就是我从 *Designing Data-Intensive Applications* 中带走的一些关键要点。这本书既验证了我通过经验学到的东西，*也*教会了我用新的方式思考那些尚未遇到的问题。

**If you’re serious about building systems that handle lots of data, high traffic, or complex distributed workflows, this book is a must-read.** It packs a decade’s worth of hard-earned lessons (and research results) into one volume.

> **如果你认真对待构建能够处理海量数据、高流量或复杂分布式工作流的系统，这本书就是必读书。**它把十年积累的艰苦经验（以及研究成果）浓缩在了一本书里。

I know I’ll be reaching for it again, whether to double-check something about consistency models or to help decide between technologies for a new project.

> 我知道自己还会再次拿起它：有时是为了核对一致性模型中的某个细节，有时是为了帮助新项目在不同技术之间做选择。

For that sake, I created **a cheat sheet** below that you can use.

> 因此，我在下面制作了**一份速查表**，你可以随时使用。

## **6.** Bonus: Key takeaways (Cheat Sheet) **📌**｜加餐：关键收获（速查表）**📌**

Here are some key learnings that I noted from the book:

> 以下是我从书中记下的一些关键收获：

1. **🔧 Design for failure**. Assume things will fail. Use replication, retries, and graceful degradation. Faults aren't bugs; they're normal. Ensure there is no single point of failure.
   > **为故障而设计**：假设一切都可能失败。使用复制、重试和优雅降级。故障不是 bug，而是常态。确保不存在单点故障。
2. **⏱️ Measure what matters (latency vs throughput).** Don't rely on averages, watch percentile latencies (p95, p99). Users notice the slowest requests, not averages. Optimize for latency or throughput clearly, based on your goals.
   > **衡量真正重要的指标（延迟 vs. 吞吐量）**：不要依赖平均值，要关注百分位延迟（p95、p99）。用户感知到的是最慢的请求，而不是平均值。根据目标明确选择优化延迟或吞吐量。
3. **🧩 Choose the right data model.** Match databases to your data:
   > **选择正确的数据模型**：让数据库匹配你的数据：

   * **🗄️ Relational DB** for complex joins and transactions.
   * **📄 Document DB** for flexible schemas and self-contained records (like JSON).
   * **🕸️ Graph DB** for highly interconnected data.
   > - **🗄️ 关系数据库**：用于复杂连接和事务。
   > - **📄 文档数据库**：用于灵活模式和自包含记录（如 JSON）。
   > - **🕸️ 图数据库**：用于高度互联的数据。
4. **⚙️ Understand your storage engine.** Pick carefully between:
   > **理解你的存储引擎**：在以下选项之间谨慎选择：

   * **🌳 B-tree databases** (Postgres, MySQL): great for fast reads, slower writes.
   * **📝 LSM-tree databases** (Cassandra, RocksDB): excellent write performance, slower reads.
   > - **🌳 B 树数据库**（Postgres、MySQL）：读取很快，写入较慢。
   > - **📝 LSM 树数据库**（Cassandra、RocksDB）：写入性能出色，读取较慢。
5. **🧭 Replication**. There are three replication models:
   > **复制**：有三种复制模型：

   * **👑 Single-leader:** Simple, consistent, easy failover (standard default).
   * **🌐 Multi-leader:** Complex, useful for multi-region writes, but challenging for conflict resolution.
   * **🛡️ Leaderless:** Flexible, high availability, eventual consistency.
   > - **👑 单主**：简单、一致、易于故障切换（标准默认方案）。
   > - **🌐 多主**：复杂，适用于多区域写入，但冲突解决很有挑战。
   > - **🛡️ 无主**：灵活、高可用、最终一致。

     Clearly understand consistency-latency tradeoffs and have a failover plan.
     > 清楚理解一致性与延迟之间的权衡，并制定故障切换计划。
6. **🗂️ Partitioning and data distribution:**
   > **分区与数据分布**：

   * **#️⃣ Hash partitioning:** Even distribution, fast point lookups, but poor range queries.
     > **#️⃣ 哈希分区**：分布均匀，点查找快，但范围查询较差。
   * **📏 Range partitioning**is suitable for range queries, but it risks creating hotspots.
     > **📏 范围分区**适合范围查询，但有产生热点的风险。

     Be careful with cross-shard operations. Automate rebalancing and choose partition keys wisely.
     > 小心处理跨 shard 操作。自动化重新平衡，并谨慎选择分区键。
7. **🔒 Use transactions wisely**. Transactions (ACID) ensure correctness but add complexity in distributed systems. Avoid using distributed transactions unless necessary; use simpler alternatives, such as sagas, for cross-service workflows.
   > **明智地使用事务**：事务（ACID）能够确保正确性，但会增加分布式系统的复杂度。除非确有必要，否则避免使用分布式事务；对于跨服务工作流，可以使用 saga 等更简单的替代方案。
8. **📩 Embrace Event-Driven architecture (when appropriate)**. Use event logs (e.g., Kafka) to decouple services. Event-driven architectures improve scalability and simplify integration. Be prepared to handle eventual consistency.
   > **拥抱事件驱动架构（在适当的时候）**：使用事件日志（例如 Kafka）解耦服务。事件驱动架构能够改善可扩展性并简化集成，但要准备好处理最终一致性。
9. **🛠️ Maintainability: simplicity and evolvability**. Keep systems as simple as possible. Prioritize observability, good metrics, and clear logs. Utilize schema versioning and implement backward-compatible changes to facilitate easier evolution over time.
   > **可维护性：简单性与可演进性**：让系统尽可能简单。优先建设可观测性、良好指标和清晰日志。使用模式版本控制，并实现向后兼容的变更，以便系统随时间更容易演进。
10. **⚖️ Always weigh trade-offs**. No single perfect solution exists. Identify what you're optimizing (consistency vs. availability, latency vs. throughput, simplicity vs. performance). Make intentional, context-aware trade-offs rather than defaulting blindly.
   > **始终权衡取舍**：不存在唯一完美的解决方案。先明确你要优化什么（一致性 vs. 可用性、延迟 vs. 吞吐量、简单性 vs. 性能）。要有意识地结合上下文做出取舍，而不是盲目采用默认方案。

[![Key takeaways from the book｜本书的关键收获](https://substackcdn.com/image/fetch/$s_!QJ_o!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F242c47ea-6481-4ff9-a3e2-59c02fb2a623_1414x2000.png)](https://substackcdn.com/image/fetch/$s_!QJ_o!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F242c47ea-6481-4ff9-a3e2-59c02fb2a623_1414x2000.png)

Key takeaways from the book｜本书的关键收获

Have you read DDIA? Tell me your biggest ‘aha’ below.｜你读过 DDIA 吗？欢迎在下方告诉我你最大的“恍然大悟”时刻。

## 7. References｜参考资料

Further references can be found on:｜更多参考资料：

1. **Martin Klepman's** [course](https://martin.kleppmann.com/2020/11/18/distributed-systems-and-elliptic-curves.html) on distributed systems and [YouTube channel,](https://www.youtube.com/@kleppmann) where he fills in the gaps from the book.
2. **Martin Kleppmann**, *[Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems](https://dataintensive.net/).* O’Reilly Media, 2017.
3. **Literature References** for the book. The [GitHub repo](https://github.com/ept/ddia-references) by **Martin Kleppmann**.
4. **Martin Kleppmann**, Chris Riccomini. *[Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/), 2nd edition,* O’Reilly Media, January 2026 (expected).
5. **My notes from the book** **in Notion**: [Link](https://milan-milanovic.notion.site/Designing-Data-Intensive-Applications-Notes-by-Dr-Milan-Milanovic-1ac22f7b9a5f80eda8a0ebff46919989?source=copy_link).
6. **[Knowledge refresher](https://milan-milanovic.notion.site/Knowledge-refresher-21722f7b9a5f80f69bfaf6a19c7bf9bd)** about the book, based on [my notes](https://milan-milanovic.notion.site/Designing-Data-Intensive-Applications-Notes-by-Dr-Milan-Milanovic-1ac22f7b9a5f80eda8a0ebff46919989?source=copy_link) (and as Anki cards).
7. **Alex Petrov**, *[Database Internals: A Deep Dive into How Distributed Data Systems Work](https://amzn.to/44n6Aaf)*. O’Reilly Media, 2019.
8. **Roberto Vitillo**, *[Understanding Distributed Systems: What every developer should know about large distributed applications](https://amzn.to/4kYkred)*, 2021.

> 1. **Martin Kleppmann 的**分布式系统[课程](https://martin.kleppmann.com/2020/11/18/distributed-systems-and-elliptic-curves.html)和 [YouTube 频道](https://www.youtube.com/@kleppmann)，他会在那里补充书中未覆盖的内容。
> 2. **Martin Kleppmann**，《[Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems](https://dataintensive.net/)》，O’Reilly Media，2017 年。
> 3. 本书的**文献参考**：**Martin Kleppmann** 维护的 [GitHub 仓库](https://github.com/ept/ddia-references)。
> 4. **Martin Kleppmann、Chris Riccomini**，《[Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/)》第二版，O’Reilly Media，预计 2026 年 1 月出版。
> 5. **我在 Notion 中的**[本书笔记](https://milan-milanovic.notion.site/Designing-Data-Intensive-Applications-Notes-by-Dr-Milan-Milanovic-1ac22f7b9a5f80eda8a0ebff46919989?source=copy_link)。
> 6. 基于[我的笔记](https://milan-milanovic.notion.site/Designing-Data-Intensive-Applications-Notes-by-Dr-Milan-Milanovic-1ac22f7b9a5f80eda8a0ebff46919989?source=copy_link)制作的本书[知识复习卡](https://milan-milanovic.notion.site/Knowledge-refresher-21722f7b9a5f80f69bfaf6a19c7bf9bd)（以及 Anki 卡片）。
> 7. **Alex Petrov**，《[Database Internals: A Deep Dive into How Distributed Data Systems Work](https://amzn.to/44n6Aaf)》，O’Reilly Media，2019 年。
> 8. **Roberto Vitillo**，《[Understanding Distributed Systems: What every developer should know about large distributed applications](https://amzn.to/4kYkred)》，2021 年。

---

## **More ways I can help you｜我还能这样帮助你：**

* [📚](https://www.patreon.com/techworld_with_milan/shop/ultimate-net-bundle-for-2025-1519389?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link) **[The Ultimate .NET Bundle 2025](https://www.patreon.com/techworld_with_milan/shop/ultimate-net-bundle-for-2025-1519389?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)** 🆕. 500+ pages distilled from 30 real projects show you how to own modern C#, ASP.NET Core, patterns, and the whole .NET ecosystem. You also get 200+ interview Q&As, a C# cheat sheet, and bonus guides on middleware and best practices to improve your career and land new .NET roles. **[Join 1,000+ engineers](https://www.patreon.com/techworld_with_milan/shop/ultimate-net-bundle-for-2025-1519389?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**.
* [📦](https://www.patreon.com/techworld_with_milan/shop/premium-resume-package-1721454?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link) **[Premium Resume Package](https://www.patreon.com/techworld_with_milan/shop/premium-resume-package-1721454?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link) 🆕**. Built from over 300 interviews, this system enables you to craft a clear, job-ready resume quickly and efficiently. You get ATS-friendly templates (summary, project-based, and more), a cover letter, AI prompts, and bonus guides on writing resumes and prepping LinkedIn. **[Join 500+ people](https://www.patreon.com/techworld_with_milan/shop/premium-resume-package-1721454?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**.
* [📄](https://www.patreon.com/techworld_with_milan/shop/complete-tech-resume-reality-check-311008?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link) **[Resume Reality Check](https://www.patreon.com/techworld_with_milan/shop/complete-tech-resume-reality-check-311008?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**. Get a CTO-level teardown of your CV and LinkedIn profile. I flag what stands out, fix what drags, and show you how hiring managers judge you in 30 seconds. **[Join 100+ people](https://www.patreon.com/techworld_with_milan/shop/complete-tech-resume-reality-check-311008?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**.
* [📢](https://www.patreon.com/techworld_with_milan/shop/short-linkedin-content-creator-311232?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link) **[LinkedIn Content Creator Masterclass](https://www.patreon.com/techworld_with_milan/shop/short-linkedin-content-creator-311232?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**. I share the system that grew my tech following to over 100,000 in 6 months (now over 255,000), covering audience targeting, algorithm triggers, and a repeatable writing framework. Leave with a 90-day content plan that turns expertise into daily growth. **[Join 1,000+ creators](https://www.patreon.com/techworld_with_milan/shop/short-linkedin-content-creator-311232?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**.
* [✨](https://www.patreon.com/c/techworld_with_milan) **[Join My Patreon](https://www.patreon.com/c/techworld_with_milan)****[Community](https://www.patreon.com/c/techworld_with_milan)**. Unlock every book, template, and future drop (worth over $100), plus early access, behind-the-scenes notes, and priority requests. Your support enables me to continue writing in-depth articles at no cost. **[Join 2,000+ insiders](https://www.patreon.com/c/techworld_with_milan)**.
* [🤝](https://newsletter.techworld-with-milan.com/p/coaching-services) **[1:1 Coaching](https://newsletter.techworld-with-milan.com/p/coaching-services)** – Book a focused session to crush your biggest engineering or leadership roadblock. I’ll map next steps, share battle-tested playbooks, and hold you accountable. **[Join 100+ coachees](https://newsletter.techworld-with-milan.com/p/coaching-services)**.

> **中文翻译：**
> - [📚] **[2025 终极 .NET 套装](https://www.patreon.com/techworld_with_milan/shop/ultimate-net-bundle-for-2025-1519389?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)** 🆕：从 30 个真实项目中提炼出 500 多页内容，帮助你掌握现代 C#、ASP.NET Core、设计模式和完整的 .NET 生态。还包括 200 多个面试问答、C# 速查表，以及关于中间件和最佳实践的额外指南，帮助你提升职业能力并获得新的 .NET 岗位。**[加入 1,000 多名工程师](https://www.patreon.com/techworld_with_milan/shop/ultimate-net-bundle-for-2025-1519389?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**。
> - [📦] **[高级简历套装](https://www.patreon.com/techworld_with_milan/shop/premium-resume-package-1721454?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)** 🆕：基于 300 多场面试打造，帮助你快速高效地制作清晰、面向求职的简历。包含 ATS 友好模板（总结型、项目型等）、求职信、AI 提示词，以及简历写作和 LinkedIn 准备指南。**[加入 500 多人](https://www.patreon.com/techworld_with_milan/shop/premium-resume-package-1721454?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**。
> - [📄] **[简历现实检验](https://www.patreon.com/techworld_with_milan/shop/complete-tech-resume-reality-check-311008?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**：获得 CTO 级别的简历和 LinkedIn 资料拆解。我会指出亮点、修正拖后腿的地方，并展示招聘经理如何在 30 秒内评估你。**[加入 100 多人](https://www.patreon.com/techworld_with_milan/shop/complete-tech-resume-reality-check-311008?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**。
> - [📢] **[LinkedIn 内容创作者大师课](https://www.patreon.com/techworld_with_milan/shop/short-linkedin-content-creator-311232?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**：分享一套让我的技术领域关注者在 6 个月内增长到 10 万以上（现在超过 25.5 万）的系统，涵盖受众定位、算法触发因素和可重复的写作框架。课程结束时，你会拥有一份把专业知识转化为日常增长的 90 天内容计划。**[加入 1,000 多名创作者](https://www.patreon.com/techworld_with_milan/shop/short-linkedin-content-creator-311232?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=productshare_creator&utm_content=join_link)**。
> - [✨] **[加入我的 Patreon 社区](https://www.patreon.com/c/techworld_with_milan)**：解锁所有书籍、模板和未来发布内容（价值超过 100 美元），以及提前访问、幕后笔记和优先请求。你的支持让作者可以继续免费写作深度文章。**[加入 2,000 多名内部成员](https://www.patreon.com/c/techworld_with_milan)**。
> - [🤝] **[一对一辅导](https://newsletter.techworld-with-milan.com/p/coaching-services)**：预约一次聚焦会议，解决你最大的工程或领导力障碍。作者会为你梳理下一步、分享经过实战检验的行动手册，并督促你落实。**[加入 100 多名受辅导者](https://newsletter.techworld-with-milan.com/p/coaching-services)**。

---

Thanks for reading Tech World With Milan Newsletter! Subscribe for free to receive new posts and support my work.

> 感谢你阅读 Tech World With Milan Newsletter！欢迎免费订阅，以接收新文章并支持作者。


---

## 评论区（共 46 条，按热度排序，缩进表示回复层级）｜Comments (46, sorted by popularity; indentation shows reply levels)

- **John** · 2025-06-19 · 👍 8

  You should make a review of all those nice architecture books!

- **Efim Rykov** · 2025-07-04 · 👍 3

  Great article. I agree with you what you should have several years of experience to read this book. Thanks for notes!

- **redolf250** · 2025-09-29 · 👍 2

  Even though I read this book during my first year in the industry.. I really learnt a lot about systems, got to understood the internals of what I do daily. Sometimes when my fellow backend guys tell me backend is just CRUD I laugh in mind.. I recommended to most of my colleagues.. reading the post just replayed whatever I read.. I got to realize the heart of most applications is the underlying data model and care must be taken to such else it would later affect the application. It also mentioned how most database engines are suitable for OLAP. Well I had a bit of interest in distributed systems so I took time off to read it and it was worth it

- **alx west** · 2025-06-19 · 👍 2

  add link to jay kraps small book - = i heart logs =
  and follow up by by Mr Kleppmann, same topic
  both great books too..

- **Bakhrom Valijanov** · 2026-09-11 · 👍 1

  I have been reading this book lately and about to finish it.
  The chapter of Consistency and Linearizability was the hardest. Casualty, ordering, linearizability, timestamp ordering - all of them nearly drove me crazy.
  It seems that I was not the only one who re-read some of the chapter while reading the book

- **Alex P** · 2026-04-23 · 👍 1

  The best book for all real developers

- **Engineering Lessons Learned** · 2025-11-03 · 👍 1

  Nice summary! The book gives a solid foundation in software architecture, but you always need to keep learning new patterns and technologies to stay ahead in the industry

- **Charles Fonseca** · 2025-10-31 · 👍 1

  Great book!

- **Rebwar Bajallan** · 2025-10-30 · 👍 1

  Lovely summary!

- **Vaibhav Patil** · 2025-10-16 · 👍 1

  Excellent information ever seen, thankyou

- **Mukesh** · 2025-10-07 · 👍 1

  Excellent summary ☺️

- **Rakesh Patel** · 2025-09-24 · 👍 1

  Nice work. I am half way reading this through book. This is excellent summary of the book.

- **Nits** · 2025-09-07（已编辑） · 👍 1

  Amazon DynamoDB is not leaderless replication its, single leader replication.
  Dynamo (original research): True leaderless replication—any node can accept writes, quorum for consistency.
  Amazon DynamoDB (AWS service): Internally uses leader-based replication, not true leaderless.
  Sources:
  [DynamoDB, Ten Years Later - MyDistributed.Systems]
  [A Deep Dive into Amazon DynamoDB Architecture]
  [Amazon DynamoDB Features – NoSQL Key-Value Database]

- **Nits** · 2025-09-07 · 👍 1

  The table below compares JSON, XML, and Binary formats.
  the comparison are wrong, you are saying json is not readable while binary are ... please fix it

  - **Dr Milan Milanović**（作者） · 2025-09-07 · 👍 1

    Fixed, thanks!

    - **Nits** · 2025-09-07 · 👍 0

      it still same at least for me
      https://substackcdn.com/image/fetch/$s_!XDu9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F999011bd-c0c5-438f-9444-43c21866f602_2890x1968.png

      - **Dr Milan Milanović**（作者） · 2025-09-07 · 👍 1

        It's eventual consistency :)

        - **Nits** · 2025-09-07 · 👍 1

          Btw, i loved the article, it nicely summarize the entire book with your experience.

          - **Dr Milan Milanović**（作者） · 2025-09-07 · 👍 0

            Thank you!

        - **Nits** · 2025-09-07 · 👍 1

          Indeed.

- **sunanda panda** · 2025-09-04 · 👍 1

  Great article.

- **Franco Morero** · 2025-09-04 · 👍 1

  A really good book!
  I like how it approaches databases in a really deep way

- **Aaron Gayah** · 2025-08-25 · 👍 1

  Really appreciated this.

- **Eu** · 2025-08-16 · 👍 1

  Great article. Thank you!

- **Hodman | How To Build With AI** · 2025-07-20 · 👍 1

  This was great. Thank you!
  How do you apply DDIA’s trade-off mindset to newer tech like serverless DBs or edge replicas? The book’s principles feel timeless, but I’d kill for a follow-up on modern implementations.

- **Lorenzo Vangi** · 2025-07-19 · 👍 1

  Very well written and inspirational — I’ll definitely read that book.
  That said, I believe a practical section is always valuable for developers of all levels. After all, we’re the ones with our hands in the dirt!

- **Viviana Andrea Zuluaga Bolaños** · 2025-07-18 · 👍 1

  Thank you

- **Ajay Kumar Sharma** · 2025-07-11 · 👍 1

  Top book!

- **Ernie Garcia** · 2025-07-08 · 👍 1

  Cheats for you to be in the same area as well as a man of a woman who is in the middle of this relationship with his own mother
  Great read
  A true autobio

- **Mahesh** · 2025-07-06 · 👍 1

  Great article

- **Paul Schleger** · 2025-07-03 · 👍 1

  Great book. Super review. Thanks for that!
  We read the early release back in 2016. It became our bible in building Cyoda.

- **Jotish Suthar** · 2025-06-29 · 👍 1

  Thanks for the detailed review.
  It's moviational.
  Curious: Which tool do you use to take notes?

  - **Dr Milan Milanović**（作者） · 2025-06-29 · 👍 0

    Thanks! I used Notion (check the references section)

- **Ben Schöffmann** · 2025-06-27 · 👍 1

  Thank you for this exceptionally well written article!

- **Danny Cahall** · 2025-06-23 · 👍 1

  Great summary. Agreed - I recently read through DDIA late last year/early this year and it was excellent but a lot to digest. Thanks for the heads up on the updated version coming out!

- **Egor Voronianskii** · 2025-06-22 · 👍 1

  Thank you for such a detailed overview of the book. It's very sad that the book has out-of-date examples. It's better not to include examples in the book. Instead, provide a link to the GitHub repository. This way, the author can update code samples easily without needing to publish a new edition.

- **Angel Dimitrov** · 2025-06-20 · 👍 1

  Thanks!
  Very, very helpful!

- **Leonardo** · 2025-06-19 · 👍 1

  Great stuff

  - **Dr Milan Milanović**（作者） · 2025-06-19 · 👍 1

    Thanks!

- **Neural Empowerment** · 2025-06-19 · 👍 1

  Wooooooo good stuff!

  - **Dr Milan Milanović**（作者） · 2025-06-19 · 👍 0

    Thanks!

- **Abhishek** · 2026-01-26 · 👍 0

  One of the best compilations of the Book. Thanks for sharing with the rest of us !!

- **Ivan** · 2025-10-21 · 👍 0

  Thank you for this review. I didn't finish this book yet, but do you khow why the author didn't separate sharding and partitioning ?

- **Tech.ish Thoughts** · 2025-09-20 · 👍 0

  This book is a bible, I have created a full implementation of all the serialization frameworks who I should publish a deep dive series and the impact of the network (HTTPS) in each one of them

- **CloudBaud** · 2025-08-26 · 👍 0

  Why don't we continue updating the content with code examples

- **Santiago Botero Correa** · 2025-07-02 · 👍 0

  In the table comparing JSON XML, Binary, is JSON the correct column?

## 评论区中文翻译（与上方顺序对应）｜Chinese translations of the comments

以下译文按上方原文的 46 条评论顺序排列；原文、作者、日期、点赞数和回复层级均保留在上方。

1. **John** · 2025-06-19 · 👍 8

   > 你应该把那些不错的架构书都评论一遍！

2. **Efim Rykov** · 2025-07-04 · 👍 3

   > 好文章。我同意你的观点：读这本书应该有几年的经验。谢谢你的笔记！

3. **redolf250** · 2025-09-29 · 👍 2

   > 虽然我在入行第一年就读了这本书，但确实从中学到了很多系统知识，也理解了我每天所做事情的内部机制。有时同行的后端开发者说后端只是 CRUD，我会在心里发笑。我向大多数同事推荐了它；读这篇文章就像重温了当初读过的内容。我意识到，大多数应用的核心是底层数据模型，必须认真对待它，否则迟早会影响应用。文章还提到，大多数数据库引擎都适合 OLAP。我本来就对分布式系统有些兴趣，所以抽时间读了这本书，事实证明很值得。

4. **alx west** · 2025-06-19 · 👍 2

   > 加上 Jay Kreps 那本小书《I Heart Logs》的链接，再推荐 Mr Kleppmann 关于同一主题的后续作品；这两本书也都很棒。

5. **Bakhrom Valijanov** · 2026-09-11 · 👍 1

   > 我最近一直在读这本书，快要读完了。一致性和线性一致性那一章最难。因果性、排序、线性一致性、时间戳排序——它们几乎把我逼疯了。看来读书时反复重读某些章节的不止我一个。

6. **Alex P** · 2026-04-23 · 👍 1

   > 所有真正开发者的最佳书籍。

7. **Engineering Lessons Learned** · 2025-11-03 · 👍 1

   > 很好的总结！这本书为软件架构打下了坚实基础，但要在行业中保持领先，你始终需要继续学习新的模式和技术。

8. **Charles Fonseca** · 2025-10-31 · 👍 1

   > 好书！

9. **Rebwar Bajallan** · 2025-10-30 · 👍 1

   > 精彩的总结！

10. **Vaibhav Patil** · 2025-10-16 · 👍 1

   > 我见过的最棒的信息，谢谢你。

11. **Mukesh** · 2025-10-07 · 👍 1

   > 总结很棒 ☺️

12. **Rakesh Patel** · 2025-09-24 · 👍 1

   > 干得漂亮。我正在读这本书，已经读到一半了。这是对本书非常好的总结。

13. **Nits** · 2025-09-07（已编辑） · 👍 1

   > Amazon DynamoDB 并不是无主复制，而是单主复制。
   >
   > Dynamo（最初的研究）：真正的无主复制——任何节点都可以接受写入，通过 quorum 保证一致性。
   >
   > Amazon DynamoDB（AWS 服务）：内部使用基于 leader 的复制，并不是真正的无主复制。
   >
   > 来源：
   > [DynamoDB, Ten Years Later - MyDistributed.Systems]、[A Deep Dive into Amazon DynamoDB Architecture]、[Amazon DynamoDB Features – NoSQL Key-Value Database]

14. **Nits** · 2025-09-07 · 👍 1

   > 下表比较了 JSON、XML 和二进制格式。
   >
   > 比较结果是错的：你说 JSON 不可读，而二进制可读……请修正。

   15. **Dr Milan Milanović**（作者） · 2025-09-07 · 👍 1

      > 已修复，谢谢！

      16. **Nits** · 2025-09-07 · 👍 0

         > 至少对我来说，看起来还是一样。
         >
         > https://substackcdn.com/image/fetch/$s_!XDu9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F999011bd-c0c5-438f-9444-43c21866f602_2890x1968.png

         17. **Dr Milan Milanović**（作者） · 2025-09-07 · 👍 1

            > 这就是最终一致性嘛 :)

            18. **Nits** · 2025-09-07 · 👍 1

               > 顺便说一句，我很喜欢这篇文章；它结合你的经验，很好地总结了整本书。

               19. **Dr Milan Milanović**（作者） · 2025-09-07 · 👍 0

                  > 谢谢！

            20. **Nits** · 2025-09-07 · 👍 1

               > 确实如此。

21. **sunanda panda** · 2025-09-04 · 👍 1

   > 好文章。

22. **Franco Morero** · 2025-09-04 · 👍 1

   > 一本非常好的书！我喜欢它深入讨论数据库的方式。

23. **Aaron Gayah** · 2025-08-25 · 👍 1

   > 真的很喜欢这篇文章。

24. **Eu** · 2025-08-16 · 👍 1

   > 好文章，谢谢！

25. **Hodman | How To Build With AI** · 2025-07-20 · 👍 1

   > 写得很好，谢谢！
   >
   > 你如何把 DDIA 的权衡思维应用到无服务器数据库、边缘副本等新技术上？书中的原则感觉历久弥新，但我真希望能看到一篇关于现代实现的后续文章。

26. **Lorenzo Vangi** · 2025-07-19 · 👍 1

   > 写得很好，也很有启发性——我一定会去读那本书。
   >
   > 不过，我认为实践部分对各个水平的开发者都很有价值。毕竟，真正亲手把东西做出来的是我们！

27. **Viviana Andrea Zuluaga Bolaños** · 2025-07-18 · 👍 1

   > 谢谢。

28. **Ajay Kumar Sharma** · 2025-07-11 · 👍 1

   > 顶级好书！

29. **Ernie Garcia** · 2025-07-08 · 👍 1

   > 这条评论原文语义不清，直译大致是在说“让你们处于同一领域，并成为一个处在这段与自己母亲的关系中的男人或女人”。
   >
   > 很棒的阅读体验。
   >
   > 真正的自传。

30. **Mahesh** · 2025-07-06 · 👍 1

   > 好文章。

31. **Paul Schleger** · 2025-07-03 · 👍 1

   > 好书，精彩的评论，谢谢！
   >
   > 我们在 2016 年读过早期发布版本；在构建 Cyoda 时，它成了我们的“圣经”。

32. **Jotish Suthar** · 2025-06-29 · 👍 1

   > 感谢这篇详细的评论。
   >
   > 很有激励性。
   >
   > 好奇一下：你用什么工具做笔记？

   33. **Dr Milan Milanović**（作者） · 2025-06-29 · 👍 0

      > 谢谢！我使用 Notion（请查看参考资料部分）。

34. **Ben Schöffmann** · 2025-06-27 · 👍 1

   > 感谢你写出这篇极其精彩的文章！

35. **Danny Cahall** · 2025-06-23 · 👍 1

   > 很好的总结。同意——我在去年年底到今年年初读完了 DDIA，它非常出色，但需要消化的内容很多。感谢你提醒大家更新版本即将推出！

36. **Egor Voronianskii** · 2025-06-22 · 👍 1

   > 感谢你对这本书做了如此详细的介绍。很遗憾，书里的例子已经过时。与其把例子写进书里，不如提供一个 GitHub 仓库链接。这样作者就能轻松更新代码示例，而不必出版新版本。

37. **Angel Dimitrov** · 2025-06-20 · 👍 1

   > 谢谢！
   >
   > 非常、非常有帮助！

38. **Leonardo** · 2025-06-19 · 👍 1

   > 很棒！

   39. **Dr Milan Milanović**（作者） · 2025-06-19 · 👍 1

      > 谢谢！

40. **Neural Empowerment** · 2025-06-19 · 👍 1

   > 哇哦，好东西！

   41. **Dr Milan Milanović**（作者） · 2025-06-19 · 👍 0

      > 谢谢！

42. **Abhishek** · 2026-01-26 · 👍 0

   > 这是这本书最好的汇编之一。谢谢你与大家分享！

43. **Ivan** · 2025-10-21 · 👍 0

   > 谢谢你的评论。我还没读完这本书，但你知道作者为什么没有把 sharding 和 partitioning 分开吗？

44. **Tech.ish Thoughts** · 2025-09-20 · 👍 0

   > 这本书就是圣经。我已经完整实现了所有序列化框架；我是不是应该发布一个深度解析系列，讨论网络（HTTPS）对每一种框架的影响？

45. **CloudBaud** · 2025-08-26 · 👍 0

   > 为什么不继续用代码示例更新内容呢？

46. **Santiago Botero Correa** · 2025-07-02 · 👍 0

   > 在比较 JSON、XML 和二进制的表格中，JSON 所在的列是否正确？
