---
lang: "zh-CN"
pubDatetime: 2026-09-17T15:19:29+08:00
timezone: "Asia/Shanghai"
title: "转载｜How to Scale a System from 0 to 10 million+ Users｜如何将一个系统从 0 扩展到 1000 万+ 用户"
area: "software-engineering"
featured: false
draft: false
tags:
  - "转载"
  - "系统设计"
  - "分布式系统"
  - "架构"
description: "Ashish Pratap Singh 关于系统扩展七个阶段的中英双语转载：从单服务器到多区域部署，每个阶段解决什么瓶颈、引入什么组件、付出什么权衡。"
---
> **Source and translation basis｜来源与翻译依据**
>
> **Author｜作者：** Ashish Pratap Singh（AlgoMaster）
>
> **Original title｜原文标题：** *How to Scale a System from 0 to 10 million+ Users*
>
> **Original publication date｜原文发表于：** January 29, 2026
>
> **Original article｜原文链接：** [Scaling a System from 0 to 10 million+ Users](https://blog.algomaster.io/p/scaling-a-system-from-0-to-10-million-users)
>
> 本文是 Ashish Pratap Singh 原文的中英双语转载。英文正文按原文顺序保留，中文翻译以引用块形式紧随英文段落或代码示例之后。

Scaling is a complex topic, but after working at **big tech** on services handling millions of requests and scaling my own **startup ([AlgoMaster.io](https://algomaster.io/))** from scratch, I've realized that most systems evolve through a surprisingly similar set of stages as they grow.

> 扩展是一个复杂的话题，但在大型科技公司处理数百万请求的服务工作，以及从零开始扩展我自己的初创公司（AlgoMaster.io）之后，我意识到大多数系统在成长过程中都会经历一系列惊人相似的阶段。

The key insight is that **you should not over-engineer from the start**. Start simple, identify bottlenecks, and scale incrementally.

> 关键洞见在于：不应从一开始就过度设计。从简单开始，识别瓶颈，并逐步扩展。

In this article, I'll walk you through **7 stages of scaling a system** from zero to 10 million users and beyond. Each stage addresses the specific bottlenecks that show up at different growth points. You'll learn what to add, when to add it, why it helps, and the trade-offs involved.

> 在本文中，我将带您了解系统从零扩展到 1000 万及以上用户的 7 个阶段。每个阶段都针对不同增长点出现的具体瓶颈问题，您将学到需要添加什么、何时添加、为何有效以及涉及的权衡取舍。

Whether you're building an app or website, preparing for system design interviews, or just curious about how large-scale systems work, understanding this progression will sharpen the way you think about architecture.

> 无论您是在构建应用或网站、准备系统设计面试，还是仅仅对大规模系统的工作原理感到好奇，理解这一演进过程都将强化您对架构的思考方式。

> **Disclaimer:** The user ranges and numbers mentioned in this article are approximate and intended to illustrate a scaling journey. Actual thresholds will vary depending on your product, workload characteristics, and traffic patterns.
>
> **免责声明：** 本文提到的用户范围和数字均为近似值，旨在说明系统扩展的历程。实际阈值将根据您的产品特性、工作负载特征和流量模式而有所不同。

---

## Stage 1: Single Server (0–100 Users)｜第一阶段：单服务器（0–100 用户）

When you're just starting out, your first priority is simple: **ship something and validate your idea**. Optimizing too early at this stage wastes time and money on problems you may never face.

> 当你刚刚起步时，首要任务很简单：先推出产品并验证你的想法。在此阶段过早进行优化，可能会将时间和金钱浪费在可能永远不会遇到的问题上。

The simplest architecture puts everything on a **single server**: your web application, database, and any background jobs all running on the same machine.

> 最简单的架构是将所有内容部署在一台服务器上：你的 Web 应用程序、数据库以及所有后台作业都在同一台机器上运行。

![Single server architecture｜单服务器架构](./f2505c02a437c49b1a2aba142d2e81cf_MD5.webp)

> This is how Instagram started. When Kevin Systrom and Mike Krieger launched the first version in 2010, 25,000 people signed up on day one.
>
> 这便是 Instagram 的起步故事。2010 年凯文·斯特罗姆与迈克·克里格推出初版应用时，上线首日便吸引了 2.5 万人注册。
>
> They didn't over-engineer upfront. With a small team and a simple setup, they scaled in response to real demand, adding capacity as usage grew, rather than building for hypothetical future traffic.
>
> 他们并未预先进行过度设计。凭借小团队和简洁的配置，他们根据实际需求进行扩展，随着使用量的增长而增加容量，而非为假设的未来流量构建系统。

### What This Architecture Looks Like｜该架构的实际形态

In practice, a single-server setup means:

> 在实践中，单服务器架构意味着：

- A web framework (Django, Rails, Express, Spring Boot) handling HTTP requests
- A database (PostgreSQL, MySQL) storing your data
- Background job processing (Sidekiq, Celery) for async tasks
- Maybe a reverse proxy (Nginx) in front for SSL termination

> - 一个处理 HTTP 请求的 Web 框架（Django、Rails、Express、Spring Boot）
> - 存储数据的数据库（PostgreSQL、MySQL）
> - 用于异步任务的后台作业处理（Sidekiq、Celery）
> - 可能在前面使用反向代理（Nginx）进行 SSL 终止

All of these run on one virtual machine. Your cloud provider bill might be $20–50/month for a basic VPS (DigitalOcean Droplet, AWS Lightsail, Linode).

> 所有这些都运行在一台虚拟机上。一台基本的虚拟专用服务器（DigitalOcean Droplet、AWS Lightsail、Linode），云服务账单大约在每月 20–50 美元。

### Why This Works for Early Stage｜为何这对早期阶段行之有效

At this stage, simplicity is your biggest advantage:

> 在此阶段，简单性是你最大的优势：

- **Fast deployment**: One server means one place to deploy, monitor, and debug.
- **Low cost**: A single $20–50/month Virtual Private Server (VPS) can comfortably handle your first 100 users.
- **Faster iteration**: No distributed systems complexity to slow down development.
- **Easier debugging**: All logs are in one place, and there are no network issues between components.
- **Full-stack visibility**: You can trace every request end to end because there's only one execution path.

> - **快速部署**：单台服务器意味着只需在一个地方进行部署、监控和调试。
> - **成本低廉**：一台月租 20–50 美元的虚拟专用服务器（VPS）即可轻松支持前 100 名用户。
> - **更快的迭代**：没有分布式系统的复杂性来拖慢开发进程。
> - **调试更简单**：所有日志都集中在同一处，且组件间不存在网络问题。
> - **全栈可见性**：由于仅存在单一执行路径，你可以端到端地追踪每个请求。

### The Trade-offs You're Making｜你正在做的权衡

This simplicity comes with trade-offs you accept knowingly:

> 这种简洁性伴随着你明知需要接受的取舍：

![Trade-offs of a single server｜单服务器的权衡](./5788cbdd520dfce3273daf91876e3822_MD5.webp)

### When to Move On｜何时进行下一步演进

You'll know it's time to evolve when you notice these signs:

> 当你注意到这些迹象时，就是时候考虑演进了：

- **Database queries slow down during peak traffic**: The app and database compete for the same CPU and memory. One heavy query can drag down API latency for everyone.
- **Server CPU or memory consistently exceeds 70–80%**: You're approaching the limits of what a single machine can reliably handle.
- **Deployments require restarts and cause downtime**: Even short interruptions become noticeable, and users start to complain.
- **A background job crash takes down the web server**: Without isolation, non-user-facing work can impact the user experience.
- **You can't afford even brief downtime**: Your product has become critical enough that even maintenance windows stop being acceptable.

> - **流量高峰期数据库查询变慢**：应用和数据库争夺同一 CPU 和内存资源，一个繁重的查询可能拖累所有人的 API 延迟。
> - **服务器 CPU 或内存持续超过 70–80%**：你已接近单台机器可靠处理的极限。
> - **部署需要重启并导致停机**：即使短暂的中断也变得引人注意，用户开始抱怨。
> - **后台任务崩溃拖垮 Web 服务器**：没有隔离机制，非面向用户的工作也会影响用户体验。
> - **无法承受任何短暂的停机**：产品已变得至关重要，即使是维护窗口也不再能被接受。

At some point, the server starts to struggle under the weight of doing everything. That's when it's time for your first architectural split.

> 当服务器因承担所有任务而开始不堪重负时，就是进行首次架构拆分的时机了。

---

## Stage 2: Separate Database (100–1K Users)｜第二阶段：分离数据库（100–1000 用户）

As traffic grows, your single server starts struggling. The web application and database compete for the same CPU, memory, and disk I/O. A single heavy query can spike latency and slow down every API response.

> 随着流量的增长，单台服务器开始不堪重负。Web 应用程序和数据库争夺相同的 CPU、内存和磁盘 I/O 资源。一次繁重的查询就可能大幅提高延迟，拖慢每一个 API 的响应速度。

The first scaling step is simple: **separate the database from the application server**.

> 第一个扩展步骤很简单：将数据库与应用服务器分离。

![Separating the database from the app server｜数据库与应用服务器分离](./1d3319371ea86370fb6502974bba7570_MD5.webp)

This two-tier architecture gives you several immediate benefits:

> 这种双层架构能带来若干立即可享的优势：

- **Resource Isolation**: Application and database no longer compete for CPU/memory. Each can use 100% of their allocated resources.
- **Independent Scaling**: Upgrade the database (more RAM, faster storage) without touching the app server.
- **Better Security**: Database server can sit in a private network, not exposed to the internet.
- **Specialized Optimization**: Tune each server for its specific workload. High CPU for app server, high I/O for database.
- **Backup Simplicity**: Database backups don't affect application performance since they run on a different machine.

> - **资源隔离**：应用程序与数据库不再争夺 CPU/内存资源，二者均可 100% 使用各自分配的资源。
> - **独立扩展**：无需改动应用服务器即可升级数据库（增加内存、使用更快的存储设备）。
> - **更强安全性**：数据库服务器可部署在私有网络中，不直接暴露于互联网。
> - **专项优化**：根据每台服务器的具体工作负载进行调优。应用服务器侧重高 CPU 性能，数据库服务器侧重高 I/O 性能。
> - **备份简便性**：数据库备份在另一台机器上运行，不会影响应用程序性能。

### Managed Database Services｜托管数据库服务

At this stage, most teams use a managed database like **Amazon RDS**, **Google Cloud SQL**, **Azure Database**, or **Supabase** (I use Supabase at **[algomaster.io](https://algomaster.io/)**).

> 在这个阶段，大多数团队会使用托管数据库服务，如 Amazon RDS、Google Cloud SQL、Azure Database 或 Supabase（我在 algomaster.io 使用 Supabase）。

Managed services typically handle:

> 托管服务通常处理：

- Automated backups (daily snapshots, point-in-time recovery)
- Security patches and updates
- Basic monitoring and alerts
- Optional read replicas (we'll cover these later)
- Failover to standby instances

> - 自动化备份（每日快照、时间点恢复）
> - 安全补丁与版本更新
> - 基础监控与告警
> - 可选只读副本（后续将详述）
> - 故障转移至备用实例

The cost difference between self-hosting and managed is usually small once you factor in engineering time. A managed PostgreSQL instance might cost **$50–$100/month more** than a raw VM, but it can save hours of maintenance every week. Those hours are better spent shipping features.

> 若将工程时间计入考量，自行托管与托管服务的成本差异通常很小。托管的 PostgreSQL 实例可能比原始虚拟机每月多花 50–100 美元，但每周可节省数小时的维护时间，这些时间更适合用于功能交付。

The main reasons to self-manage a database are:

> 选择自行管理数据库的主要原因包括：

- Cost optimization at very large scale
- Specific configurations that managed services don't support
- Compliance requirements that prohibit managed services
- You're building a database product

> - 极大规模下的成本优化
> - 托管服务不支持的特定配置
> - 合规要求禁止使用托管服务
> - 你正在构建数据库产品

For most teams, managed services are the right choice until your database bill grows into the **thousands of dollars per month**.

> 对大多数团队来说，在数据库月账单增至数千美元之前，托管服务都是合适的选择。

### Connection Pooling｜连接池

One often-overlooked improvement at this stage is connection pooling. Each database connection consumes resources:

> 在此阶段，一个常被忽视的优化是连接池。每个数据库连接都会消耗资源：

- Memory for the connection state (typically 5–10MB per connection in PostgreSQL)
- File descriptors on both app and database servers
- CPU overhead for connection management

> - 用于维护连接状态的内存（PostgreSQL 中通常每个连接占用 5–10MB）
> - 应用服务器与数据库服务器上的文件描述符
> - 连接管理产生的 CPU 开销

Opening a new connection is expensive too. Between the TCP handshake, SSL negotiation, and database authentication, you can add **50–100 ms** of overhead per request.

> 建立新连接同样代价高昂。从 TCP 握手、SSL 协商到数据库身份验证，每个请求可能增加 50–100 毫秒的额外开销。

A connection pooler like **PgBouncer** (for PostgreSQL) keeps a small set of database connections open and reuses them across requests.

> 类似 PgBouncer（用于 PostgreSQL）的连接池工具会维持少量已开启的数据库连接，并在多个请求间复用这些连接。

![Connection pooling with PgBouncer｜PgBouncer 连接池](./6888a1413c199334e7ad87a029a04b8e_MD5.webp)

With 1,000 users, you might have 100 concurrent connections hitting your API. Without pooling, that's 100 database connections consuming resources. With pooling, 20–30 actual database connections can efficiently serve those 100 application connections through connection reuse.

> 在拥有 1000 名用户的情况下，你的 API 可能面临 100 个并发连接。没有连接池，这意味着 100 个数据库连接在消耗资源。采用连接池，仅需 20–30 个实际数据库连接即可通过连接复用，高效服务这 100 个应用连接。

**Connection pooling modes｜连接池模式：**

- **Session pooling**: One pool connection per client connection (most compatible, least efficient)
- **Transaction pooling**: Connection returned to the pool after each transaction (best balance for most apps)
- **Statement pooling**: Connection returned after each statement (most efficient, but can break features)

> - **会话级连接池**：每个客户端连接独占一个池连接（兼容性最佳、效率最低）
> - **事务级连接池**：每个事务结束后归还连接至池中（最适合多数应用的平衡方案）
> - **语句级连接池**：每条语句执行后即归还连接（效率最高，但可能影响功能完整性）

Most applications work best with **transaction pooling**, which often improves connection efficiency by **3–5x**.

> 事务级连接池通常最适合大多数应用，连接效率可提升 3–5 倍。

### Network Latency Considerations｜网络延迟的考量

Separating the database introduces network latency. When app and database were on the same machine, "network" latency was essentially zero (loopback interface). Now every query adds 0.1–1ms of network round-trip time.

> 分离数据库会引入网络延迟。当应用与数据库同处一台机器时，"网络"延迟基本为零（回环接口）。现在每次查询都会增加 0.1–1 毫秒的网络往返时间。

For most applications, this is negligible. But if your code makes hundreds of database queries per request (an anti-pattern, but common), this latency adds up. The solution isn't to put them back on the same machine, but to optimize your query patterns:

> 对大多数应用而言，这种延迟可忽略不计。但如果代码在每个请求中执行数百次数据库查询（虽属反模式却很常见），这些延迟便会累积。解决方案并非把数据库迁回同一台机器，而是优化查询模式：

- Batch queries where possible
- Use JOINs instead of N+1 query patterns
- Cache frequently accessed data
- Use connection pooling to avoid repeated connection setup overhead

> - 尽可能采用批量查询
> - 使用 JOIN 查询替代 N+1 查询模式
> - 缓存高频访问数据
> - 采用连接池以规避重复建立连接的开销

With the database on its own server, you've bought yourself room to grow. But you've also created a new single point of failure: the application server is now the weak link. What happens when it goes down, or when it simply can't keep up with demand?

> 把数据库部署在独立的服务器上，确实为系统扩展赢得了空间。但这也引入了新的单点故障：应用服务器现在成为了薄弱环节。一旦它宕机，或无法满足需求时，系统会面临什么情况？

---

## Stage 3: Load Balancer + Horizontal Scaling (1K–10K Users)｜第三阶段：负载均衡器 + 水平扩展（1 千–1 万用户）

Your separated architecture handles load better now, but you've introduced a new problem: your single application server is now a **single point of failure**. If it crashes, your entire application goes down. And as traffic grows, that one server can't keep up.

> 分离式架构现在能更好地处理负载，但引入了一个新问题：单一应用服务器如今成为单点故障。如果它崩溃，整个应用程序将宕机。随着流量增长，单台服务器也将无法承载需求。

The next step is to run **multiple application servers** behind a **load balancer**.

> 下一步是在负载均衡器后方运行多个应用服务器。

![Load balancer distributing traffic｜负载均衡器分发流量](./60a9b91400f9111bf692dcba0aba2171_MD5.webp)

The load balancer sits in front of your servers and distributes incoming requests across them. If one server fails, the load balancer detects this (via health checks) and routes traffic only to healthy servers. Users experience no downtime when a single server fails.

> 负载均衡器位于服务器前端，将传入请求分发至各个服务器。若某台服务器发生故障，负载均衡器会通过健康检查检测到，并将流量仅路由至健康的服务器。单台服务器故障时，用户不会感受到服务中断。

The load balancer needs to decide which server handles each request. Common algorithms include: **Round Robin**, **Weighted Round Robin**, **Least Connections**, **IP Hash**, and **Random**.

> 负载均衡器需要决定由哪台服务器处理每个请求。常用算法包括：轮询（Round Robin）、加权轮询、最少连接、IP 哈希和随机分配。

Most teams start with Round Robin (simple, works well for most cases) and switch to Least Connections if they have requests with varying processing times.

> 大多数团队最初采用轮询（简单，适用于大多数情况），如果请求的处理时间差异较大，则会切换到最少连接算法。

Modern load balancers operate at different layers:

> 现代负载均衡器在不同层级运作：

- **Layer 4 (Transport)**: Routes based on IP and port. Fast, but can't inspect HTTP headers.
- **Layer 7 (Application)**: Routes based on HTTP headers, URLs, cookies. More flexible, slightly more overhead.

> - **第 4 层（传输层）**：基于 IP 和端口进行路由。速度快，但无法查看 HTTP 头部信息。
> - **第 7 层（应用层）**：基于 HTTP 头部、URL、Cookie 进行路由。灵活性更高，略有额外开销。

For most web applications, Layer 7 load balancing is preferable because it enables:

> 对于大多数 Web 应用，第 7 层负载均衡通常更为理想，因为它能够实现：

- Path-based routing (`/api/*` to API servers, `/static/*` to CDN)
- Header-based routing (different versions for mobile vs desktop)
- SSL termination at the load balancer
- Request/response inspection for security

> - 基于路径的路由（`/api/*` 指向 API 服务器，`/static/*` 指向 CDN）
> - 基于请求头的路由（移动端与桌面端不同版本）
> - 在负载均衡器处进行 SSL 终止
> - 请求/响应的安全检查

### Vertical vs Horizontal Scaling｜垂直扩展与水平扩展

Before adding more servers, you might ask: why not just get a bigger server? This is the classic vertical vs horizontal scaling trade-off.

> 在添加更多服务器之前，你可能会问：为什么不直接用一台更大的服务器？这就是经典的垂直扩展与水平扩展之间的权衡。

**Vertical scaling** means moving to a larger server. It works well early on and usually requires no code changes. But you eventually run into two problems: hard hardware limits and rapidly increasing costs.

> **垂直扩展**意味着迁移到更强大的服务器。这在早期效果良好，通常无需修改代码。但最终会遇到两个问题：硬件上限和成本急剧增加。

Bigger machines are priced non-linearly, so doubling CPU or memory can cost 3–4x more. And even the largest instances have a ceiling.

> 更大型服务器的定价呈非线性增长，将 CPU 或内存翻倍可能导致成本增加 3–4 倍。即使是最强大的实例也存在性能上限。

**Horizontal scaling** means adding more servers. It is harder at first because your application must be **stateless**, so any server can handle any request. But it gives you effectively unlimited capacity and built-in redundancy. If one server fails, the system keeps running.

> **水平扩展**意味着增加更多服务器。初期实施难度较高，因为应用程序必须是无状态的，任何服务器才能处理任何请求。但这种方案能提供理论上无限的容量和内置冗余。即使单台服务器发生故障，系统仍可继续运行。

### The Session Problem｜会话问题

This is where horizontal scaling gets tricky. If a user logs in and their session lives in **Server 1's memory**, what happens when the next request lands on **Server 2**? From the app's perspective, the session is missing, so the user looks logged out.

> 这是水平扩展变得棘手的地方。如果用户登录后，其会话驻留在服务器 1 的内存中，那么当下一个请求落到服务器 2 上时会发生什么？从应用的角度看，会话消失了，用户看起来就像登出了一样。

This is the **stateful server problem**, and it's the biggest obstacle to horizontal scaling.

> 这就是有状态服务器问题，也是水平扩展的最大障碍。

There are two common ways to handle it:

> 处理这个问题有两种常见方法：

#### 1. Sticky Sessions (Session Affinity)｜粘性会话（会话亲和性）

The load balancer routes all requests from the same user to the same server, typically using a cookie or IP hash.

> 负载均衡器将同一用户的所有请求路由到同一台服务器，通常通过 Cookie 或 IP 哈希实现。

**Pros｜优点：**

- Requires no application changes
- Works with any session storage

> - 无需修改应用程序
> - 适用于任何会话存储方案

**Cons｜缺点：**

- If that server fails, the user loses their session
- Uneven load distribution if some users are more active than others
- Limits true horizontal scaling (can't freely move users between servers)
- New servers take time to "warm up" with sessions

> - 如果该服务器发生故障，用户将失去其会话信息
> - 如果某些用户比其他用户更活跃，会导致负载分布不均
> - 限制了真正的水平扩展（无法在服务器之间自由移动用户）
> - 新服务器需要时间通过会话完成"预热"

#### 2. External Session Store｜外部会话存储

Move session data out of the application servers into a shared store like **Redis** or **Memcached**.

> 将会话数据从应用服务器迁移到 Redis 或 Memcached 这样的共享存储中。

![External session store with Redis｜Redis 外部会话存储](./ece31d1fcf3353065a5e1fce4d44da25_MD5.webp)

Now any server can handle any request because session data is centralized. This is the pattern most large-scale systems use. The added latency of a Redis lookup (sub-millisecond) is negligible compared to the flexibility it provides.

> 现在任何服务器都能处理任何请求，因为会话数据已实现集中式存储。这是大多数大规模系统采用的模式。Redis 查询（亚毫秒级）增加的延迟，与它提供的灵活性相比可以忽略不计。

You can now handle more traffic and survive server failures. But as your user base grows, you'll notice something: no matter how many application servers you add, they're all hammering the same database. The database is becoming your next bottleneck.

> 现在你能够应对更大的流量，也能抵御服务器故障。但随着用户基数的扩大，你会注意到一个现象：无论增加多少应用服务器，它们都在频繁冲击同一个数据库。数据库正成为下一个瓶颈。

---

## Stage 4: Caching + Read Replicas + CDN (10K–100K Users)｜第四阶段：缓存 + 只读副本 + CDN（1 万–10 万用户）

With 10,000+ users, a new bottleneck emerges: your database. Every request hits the database, and as traffic grows, query latency increases. The database that handled 100 QPS (queries per second) fine starts struggling at 1,000 QPS.

> 当用户规模突破 1 万，一个新的瓶颈随之出现：数据库。每个请求都会触及数据库，随着流量增长，查询延迟也随之增加。那个原本能轻松处理每秒 100 次查询（QPS）的数据库，在面对每秒 1000 次查询时开始吃力。

Read-heavy applications (which most are, with read-to-write ratios of 10:1 or higher) suffer especially hard.

> 对于以读取为主的应用（大多数应用都是如此，读写比通常高达 10:1 甚至更高），影响尤为显著。

This stage introduces three complementary solutions: **caching**, **read replicas**, and **CDNs**. Together, they can reduce database load by 90% or more.

> 此阶段引入三种互补方案：缓存、只读副本和 CDN。三者结合可将数据库负载降低 90% 或更多。

### Caching Layer｜缓存层

Most web applications follow the 80/20 rule: 80% of requests access 20% of the data. A product page viewed 10,000 times doesn't need 10,000 database queries. The user's profile that loads on every page view doesn't need to be fetched fresh each time.

> 多数 Web 应用遵循 80/20 法则：80% 的请求仅访问 20% 的数据。一个被浏览 1 万次的产品页面无需进行 1 万次数据库查询；每次页面加载时显示的用户资料也不必实时重新获取。

Caching stores frequently accessed data in memory for near-instant retrieval. While database queries take 1–100ms, cache reads take 0.1–1ms.

> 缓存将频繁访问的数据存储在内存中，实现近乎即时的检索。数据库查询通常需要 1–100 毫秒，而缓存读取仅需 0.1–1 毫秒。

![Cache-aside pattern｜旁路缓存模式](./91e850e8dd2ded7fa5c8edb42c36d548_MD5.webp)

The most common caching pattern is **cache-aside** (also called lazy loading):

> 最常见的缓存模式是 **cache-aside**（旁路缓存，也称懒加载）：

1. Application checks the cache first
2. If data exists (cache hit), return it immediately
3. If not (cache miss), query the database
4. Store the result in cache for future requests (with TTL)
5. Return the data

> 1. 应用首先检查缓存
> 2. 如果数据存在（缓存命中），立即返回
> 3. 如果不在缓存中（缓存未命中），查询数据库
> 4. 将结果存入缓存供后续请求使用（设置 TTL）
> 5. 返回数据

Redis and Memcached are the standard choices here. Redis is more feature-rich (supports data structures like lists, sets, sorted sets; persistence; pub/sub; Lua scripting), while Memcached is simpler and slightly faster for pure key-value caching.

> Redis 和 Memcached 是此处的标准选择。Redis 功能更丰富（支持列表、集合、有序集合等数据结构，具备持久化、发布/订阅、Lua 脚本功能），而 Memcached 更简单，在纯键值缓存场景下速度略快。

Most teams choose Redis because the additional features are useful (using sorted sets for leaderboards, lists for queues, etc.), and the performance difference is negligible.

> 大多数团队选择 Redis，因为其附加功能实用（如用有序集合做排行榜、列表做队列等），且性能差异可以忽略不计。

#### What to Cache｜缓存哪些内容

Not everything should be cached. Good cache candidates include:

> 并非所有数据都适合缓存。适合缓存的对象包括：

![Good cache candidates｜适合缓存的内容](./595d60349a0ba9597a6d774cbfa50daf_MD5.webp)

**Poor cache candidates｜不适合缓存的数据：**

- Highly personalized data (different for every user, low reuse)
- Frequently changing data (constant invalidation overhead)
- Large blobs (consumes memory without proportional benefit)
- Transactional data where staleness causes issues

> - 高度个性化数据（每位用户各不相同，复用率低）
> - 频繁变更的数据（持续的失效开销）
> - 大型二进制对象（占用内存但收益不成比例）
> - 数据陈旧会引发问题的事务型数据

#### Cache Invalidation｜缓存失效

The hardest part of caching isn't adding it, it's keeping it accurate. When underlying data changes, cached data becomes stale. This is famously one of the "two hard problems in computer science."

> 缓存最困难的部分并非添加缓存，而是确保其准确性。当底层数据发生变化时，缓存数据就会陈旧。这正是计算机科学中著名的"两大难题"之一（缓存失效）。

**Common strategies include｜常见策略包括：**

![Cache invalidation strategies｜缓存失效策略](./02435726460d05eaca2f4e73c0f8b960_MD5.webp)

Most systems start with TTL-based expiration (set cache to expire after 5–60 minutes) and add explicit invalidation for data where staleness causes problems. For example:

> 大多数系统最初采用基于 TTL 的过期机制（将缓存设置为 5–60 分钟后失效），并对数据陈旧会引发问题的场景增加显式失效策略。例如：

```python
def update_user_profile(user_id, new_data):
    # Update database
    db.update("users", user_id, new_data)
    # Invalidate cache
    cache.delete(f"user:{user_id}")
```

The next read will miss the cache and fetch fresh data from the database.

> 下一次读取将无法命中缓存，转而从数据库获取新数据。

### Read Replicas｜只读副本

Even with caching, some requests will still hit the database, especially **writes** and **cache misses**. Read replicas help by distributing read traffic across multiple copies of the database.

> 即使采用了缓存，某些请求仍会访问数据库，特别是写入操作和缓存未命中的情况。只读副本通过将读取流量分散到数据库的多个副本来分担压力。

![Read replicas｜只读副本](./d7fa832b977bef62701674c4a08b01a4_MD5.webp)

The primary database handles all writes. Changes are then replicated (usually asynchronously) to one or more **read replicas**. Your application sends read queries to replicas and keeps the write workload on the primary, which reduces contention and improves overall throughput.

> 主数据库处理所有写入操作。更改随后以异步方式复制到一个或多个只读副本。应用将读取查询发送到副本，把写入负载保留在主库上，从而减少争用并提高整体吞吐量。

#### Replication Lag｜复制延迟

One important consideration is **replication lag**. Since replication is often asynchronous (for performance), replicas might be milliseconds to seconds behind the primary.

> 复制延迟是需要重点考虑的因素。由于复制通常采用异步方式（为了性能），副本数据可能比主节点滞后数毫秒至数秒。

For most applications, this is acceptable. If a social media feed is a second behind, most users will not notice. But some flows require stronger consistency.

> 对大多数应用而言，这可以接受。社交媒体动态延迟一秒，多数用户不会察觉。但某些业务流程需要更强的一致性保障。

A common failure mode is **read-your-writes consistency**:

> 一种常见的故障模式是"读你所写"一致性问题：

A user updates their profile and refreshes immediately. If that read lands on a replica that has not caught up, they see old data and assume the update failed.

> 用户更新个人资料后立即刷新页面。如果该读取请求落在尚未同步完成的副本上，用户会看到旧数据，从而误以为更新失败。

**Solutions｜解决方案：**

1. **Read from primary after writes**: For a short window (N seconds) after a write, route that user's reads to the primary.
2. **Session-level consistency**: Track the user's last write timestamp and only read from replicas that have caught up past that point.
3. **Explicit read-from-primary**: For critical reads (viewing just-updated data), always hit the primary.

> 1. **写入后从主库读取**：在写入后的短暂窗口期（N 秒内），将该用户的读取请求路由至主库。
> 2. **会话级一致性**：跟踪用户上次写入的时间戳，仅从已赶上该时间点的副本读取。
> 3. **显式从主库读取**：对于关键读取（查看刚更新的数据），始终访问主库。

Most frameworks have built-in support for read/write splitting. For example, Rails (ActiveRecord), Django, and Hibernate can route reads to replicas and writes to the primary automatically.

> 大多数框架都内置了读写分离的支持。例如 Rails（ActiveRecord）、Django 和 Hibernate 都能自动将读取路由到副本、写入定向到主库。

### Content Delivery Network (CDN)｜内容分发网络

Static assets like images, CSS, JavaScript, and videos rarely change and don't need to hit your application servers at all. They're also the largest files you serve, which makes them expensive in both bandwidth and compute if you serve them directly.

> 图像、CSS、JavaScript 和视频等静态资源很少变动，完全无需访问应用服务器。这些文件通常也是最庞大的内容，如果直接由服务器提供，将在带宽和计算资源上造成高昂开销。

A **CDN** solves this by caching static assets on globally distributed servers called **edge locations** (or points of presence).

> CDN 通过在全球分布的边缘节点（也称存在点，PoP）上缓存静态资源来解决这个问题。

![CDN edge locations｜CDN 边缘节点](./16d3c719cd465d93226b3b531c210379_MD5.webp)

Here's what happens when a user in Tokyo requests an image:

> 以下是东京用户请求一张图像时发生的情况：

- The request is routed to the **CDN edge in Tokyo** (low latency, say ~50 ms round trip).
- If the file is already cached (**cache hit**), the CDN serves it immediately.
- If it's not cached (**cache miss**), the CDN fetches it from your **origin** (maybe in the US, ~300 ms), stores a copy at the edge, and then returns it to the user.
- The next user in Tokyo gets the cached version from the edge, again at ~50 ms.

> - 请求被路由至东京的 CDN 边缘节点（低延迟，往返约 50 毫秒）。
> - 如果文件已被缓存（缓存命中），CDN 立即返回。
> - 如果未缓存（缓存未命中），CDN 从源站（可能位于美国，约 300 毫秒）获取文件，在边缘节点存储副本，然后返回给用户。
> - 下一位东京用户从边缘节点获取缓存版本，同样只需约 50 毫秒。

Popular CDNs include **Cloudflare** (strong free tier), **AWS CloudFront**, **Fastly**, and **Akamai**.

> 流行的 CDN 包括 Cloudflare（免费套餐强大）、AWS CloudFront、Fastly 和 Akamai。

With caching, read replicas, and a CDN in place, your system can handle steady growth. The next challenge is **spiky traffic**. A viral post, a marketing campaign, or even the difference between 3 AM and 3 PM can create 10x traffic variation. At that point, manually adjusting capacity stops working.

> 缓存、只读副本和 CDN 就位后，系统能够应对稳定增长。接下来的挑战是尖峰流量。一篇爆款帖子、一次营销活动，甚至凌晨 3 点和下午 3 点的差异，都可能造成 10 倍的流量波动。此时，手动调整容量已不再适用。

---

## Stage 5: Auto-Scaling + Stateless Design (100K–500K Users)｜第五阶段：自动扩缩容 + 无状态设计（10 万–50 万用户）

At 100K+ users, traffic patterns become less predictable. You might have:

> 当用户数突破 10 万，流量模式将变得难以预测。你可能会遇到：

- Daily peaks (morning in US, evening in EU)
- Weekly patterns (higher on weekdays for B2B, weekends for consumer)
- Marketing campaign spikes (10x traffic for hours)
- Viral moments (100x traffic, unpredictable duration)

> - 日常高峰（美国的清晨、欧洲的晚间）
> - 周期性波动（B2B 业务在工作日走高，消费级产品在周末迎来高峰）
> - 营销活动引发的尖峰（数小时内流量飙升 10 倍）
> - 病毒式传播时刻（100 倍流量冲击，持续时间不可预测）

At this point, manually adding and removing servers is no longer viable. You need infrastructure that reacts automatically.

> 至此，手动增减服务器已不切实际。你需要能够自动响应的基础设施。

This stage focuses on **auto-scaling** (automatically adjusting capacity) and ensuring your application is truly **stateless** (servers can be added or removed freely without data loss or user impact).

> 此阶段聚焦于自动扩缩容（动态调整容量），并确保应用程序真正无状态（可自由增删服务器，不会导致数据丢失或影响用户）。

### Stateless Architecture｜无状态架构

For auto-scaling to work, your application servers must be interchangeable. Any request can go to any server. Any server can be terminated without losing data. A new server can start handling requests immediately.

> 要实现自动扩缩容，应用服务器必须可以互换：任何请求都能被任何服务器处理；任何服务器都可被终止而不丢失数据；新服务器能立即开始处理请求。

![Stateless application servers｜无状态应用服务器](./8148e5eab1d4faac82f7543cb3e5beee_MD5.webp)

When a new server joins the cluster, it typically:

> 当新服务器加入集群时，它通常会：

1. Starts the application
2. Registers with the load balancer (or gets discovered)
3. Connects to Redis, database, and other shared services
4. Immediately starts handling requests

> 1. 启动应用程序
> 2. 向负载均衡器注册（或被其发现）
> 3. 连接到 Redis、数据库及其他共享服务
> 4. 立即开始处理请求

When a server is removed:

> 当服务器被移除时：

1. Load balancer stops sending new requests
2. In-flight requests complete (graceful shutdown)
3. Server terminates

> 1. 负载均衡器停止发送新请求
> 2. 进行中的请求完成处理（优雅关闭）
> 3. 服务器终止运行

No data is lost, because nothing important is stored locally.

> 数据不会丢失，因为没有任何重要信息存储在本地。

### Auto-Scaling Strategies｜自动扩缩容策略

Auto-scaling adjusts capacity based on metrics. The scaling system continuously monitors metrics and adds or removes servers based on thresholds.

> 自动扩缩容根据指标调整容量。扩缩系统持续监控指标，并根据阈值增减服务器。

Most teams start with CPU-based scaling. It's simple, works for most workloads, and is easy to reason about. Add queue-depth scaling for background job workers.

> 多数团队从基于 CPU 的扩缩容开始——简单直接，适用于大多数工作负载，且易于理解。针对后台任务处理器，建议增加基于队列深度的扩缩容机制。

#### Scaling Parameters｜扩缩容参数

When configuring auto-scaling, you'll set these parameters:

> 配置自动扩缩容时，需设定以下参数：

```yaml
Minimum instances: 2        # Always running, even at zero traffic
Maximum instances: 20       # Cost ceiling and resource limit
Scale-up threshold: 70%     # CPU percentage to trigger scale-up
Scale-down threshold: 30%   # CPU percentage to trigger scale-down
Scale-up cooldown: 3 min    # Wait time after scaling up before next action
Scale-down cooldown: 10 min # Wait time after scaling down
Instance warmup: 2 min      # Time for new instance to become fully operational
```

**Important considerations｜重要注意事项：**

- **Minimum instances**: Should be at least 2 for redundancy. If one fails, the other handles traffic while a replacement spins up.
- **Cooldown periods**: Prevent thrashing (rapidly scaling up and down). Scale-down cooldown is typically longer because removing capacity is riskier than adding it.
- **Instance warmup**: New servers need time to start, load code, warm up caches, establish database connections. Don't count them toward capacity until they're ready.
- **Asymmetric scaling**: Scale up aggressively (react quickly to load), scale down conservatively (don't remove capacity too soon).

> - **最小实例数**：至少保持 2 个实例以确保冗余。若其中一个故障，另一个可在新实例启动期间处理流量。
> - **冷却期**：防止系统抖动（频繁快速伸缩）。缩容冷却期通常更长，因为缩减容量比增加容量的风险更高。
> - **实例预热**：新服务器需要时间启动、加载代码、预热缓存、建立数据库连接。准备就绪前不应将其计入可用容量。
> - **非对称扩缩**：扩容要激进（快速响应负载），缩容要保守（避免过早缩减容量）。

### JWT for Stateless Authentication｜用于无状态认证的 JWT

At this scale, many teams move from session-based to token-based authentication using JWTs (JSON Web Tokens). With session-based auth, every request requires a session store lookup. With JWTs, authentication state is contained in the token itself.

> 在此规模下，许多团队会从基于会话的认证转向使用 JWT（JSON Web Token）的基于令牌的认证。基于会话的认证要求每次请求都查询会话存储，而 JWT 将认证状态直接包含在令牌中。

A JWT has three parts:

> JWT 包含三个部分：

```text
Header.Payload.Signature

eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMjM0NTZ9.signature_here
```

The payload contains claims like user ID, roles, and expiration. The signature ensures the token wasn't tampered with. Any server can verify the signature using a shared secret key without querying a database.

> 载荷（Payload）中包含用户 ID、角色和过期时间等声明（claims）。签名确保令牌未被篡改。任何服务器都可通过共享密钥验证签名，无需查询数据库。

**Trade-offs with JWTs｜使用 JWT 的权衡：**

- **Pro**: Truly stateless, no session store lookup for every request
- **Pro**: Works across services (microservices, mobile apps, third-party APIs)
- **Con**: Can't invalidate individual tokens before expiry (user logs out, but token remains valid)
- **Con**: Token size adds to each request (500 bytes vs 32-byte session ID)

> - **优点**：真正无状态，无需为每个请求查询会话存储
> - **优点**：支持跨服务使用（微服务、移动应用、第三方 API 均可）
> - **缺点**：无法在令牌到期前单独吊销（用户退出登录后令牌依然有效）
> - **缺点**：令牌体积增加每个请求的开销（500 字节对比 32 字节的会话 ID）

A common pattern is **short-lived access tokens** (for example, 15 minutes) plus **long-lived refresh tokens** (for example, 7 days). That limits how long a compromised or stale token can be used.

> 常见方案是短期访问令牌（例如 15 分钟有效期）配合长期刷新令牌（例如 7 天有效期），以此限制泄露或过期令牌的可利用时间窗口。

At this point, your application tier scales elastically. Traffic spikes and more servers spin up. Traffic drops and they spin down.

> 至此，应用层已实现弹性伸缩：流量洪峰时自动扩容，流量回落时自动收缩。

But a new ceiling is coming: the database can only handle so many writes, the monolith becomes harder to change safely, and some operations are too slow to run synchronously. That's when you bring in the heavy machinery.

> 但新的天花板终将出现：数据库的写入能力存在上限，单体架构越来越难以安全地迭代，部分同步操作的耗时已超出可接受范围。这时，就该引入重型装备了。

---

## Stage 6: Sharding + Microservices + Message Queues (500K–1M Users)｜第六阶段：分库分表 + 微服务 + 消息队列（50 万–100 万用户）

With 500K+ users, you'll hit new ceilings that the previous optimizations can't solve:

> 当用户量突破 50 万，系统将面临此前优化方案无法突破的新瓶颈：

- Writes overwhelm a single primary database, even if reads are offloaded to replicas.
- The monolith becomes painful to ship. A small change to notifications forces a full redeploy of the entire application.
- Previously fast operations start taking seconds because too much work is happening synchronously in the request path.
- Different parts of the product need different scaling profiles. Search and feeds may need 10x the capacity of profile pages.

> - 写入操作压垮单一主库，即便读取已分流至副本。
> - 单体架构的交付变得痛苦：对通知功能的小幅修改就迫使整个应用重新部署。
> - 先前很快的操作开始需要数秒，因为请求路径中有过多工作在同步进行。
> - 产品的不同模块需要差异化的扩展配置：搜索和信息流所需的容量可能是个人主页的十倍。

This is where the heavy machinery comes in: **database sharding**, **microservices**, and **asynchronous processing** (message queues).

> 这时就需要引入重型方案：数据库分片、微服务与异步处理（消息队列）。

### Database Sharding｜数据库分片

Read replicas solved read scaling, but writes all still go to one primary database. At high volume, this primary becomes the bottleneck. You're limited by what one machine can handle in terms of:

> 只读副本解决了读扩展问题，但所有写入仍集中到一个主库。高负载下主库成为瓶颈，你受限于单台机器在以下方面的能力：

- Write throughput (inserts, updates, deletes)
- Storage capacity (even big disks have limits)
- Connection count (even with pooling)

> - 写入吞吐量（插入、更新、删除）
> - 存储容量（再大的磁盘也有上限）
> - 连接数（即使使用连接池）

Sharding splits your data across multiple databases based on a **shard key**. Each shard holds a subset of the data and handles both reads and writes for that subset.

> 分片根据分片键（shard key）将数据分布到多个数据库中。每个分片存储一个数据子集，并处理该子集的读写操作。

![Database sharding｜数据库分片](./fe13099a64c41cbf715b5c0434bf4b9e_MD5.webp)

#### Sharding Strategies｜分片策略

![Sharding strategies｜分片策略](./40ce2c6dc680fb6d19b4fee4cee218b9_MD5.webp)

> **Consistent hashing** is a popular improvement over simple hash-based sharding. Instead of `hash(key) % num_shards`, you place keys on a ring. When you add a new shard, only keys adjacent to its position move, not all keys. This means adding a fourth shard moves ~25% of data instead of ~75%.
>
> **一致性哈希**是对简单哈希分片的流行改进。不再使用 `hash(key) % num_shards`，而是将键放置在哈希环上。添加新分片时，只有与其位置相邻的键会移动，而非所有键。这意味着添加第四个分片时，只有约 25% 的数据需要迁移，而不是约 75%。

#### When to Shard｜何时进行分片

Sharding is a **one-way door**. Once you shard:

> 分片是一扇"单向门"。一旦分片：

- Cross-shard queries become expensive or impossible (joining data across shards)
- Transactions spanning shards are complex (two-phase commit or give up on atomicity)
- Schema changes must be applied to all shards
- Operations (backups, migrations) multiply by shard count
- Application code becomes more complex (shard routing logic)

> - 跨分片查询变得昂贵甚至不可能（无法跨分片 JOIN）
> - 跨分片事务变得复杂（两阶段提交，或放弃原子性）
> - Schema 变更必须应用到所有分片
> - 运维操作（备份、迁移）随分片数量成倍增加
> - 应用代码更加复杂（分片路由逻辑）

Before sharding, exhaust these options:

> 在分片之前，请先穷尽这些方案：

1. **Optimize queries**: Add missing indexes, rewrite slow queries, denormalize where helpful
2. **Vertical scaling**: Upgrade to a bigger database server (more CPU, RAM, faster SSDs)
3. **Read replicas**: If read-heavy, add replicas to handle reads
4. **Caching**: Reduce load on database by caching frequently accessed data
5. **Archival**: Move old data to cold storage (separate database, object storage)
6. **Connection pooling**: Reduce connection overhead

> 1. **优化查询**：补齐缺失的索引、改写慢查询、在合适处反规范化
> 2. **垂直扩展**：升级到更高配的数据库服务器（更强 CPU、更大内存、更快的 SSD）
> 3. **只读副本**：读多写少时，增加副本分担读取
> 4. **缓存**：缓存高频访问数据，降低数据库负载
> 5. **归档**：将旧数据迁移到冷存储（独立数据库、对象存储）
> 6. **连接池**：降低连接开销

Only shard when you're truly write-bound and a single node physically cannot handle your throughput, or when your dataset exceeds what fits on one machine.

> 只有当写入真正达到瓶颈、单节点在物理上无法承载吞吐量，或数据集超出单机容量时，才进行分片。

### Microservices｜微服务

As the product and team grow, a monolith becomes harder to evolve safely. Common signals you might benefit from microservices:

> 随着产品和团队规模扩大，单体架构会越来越难以安全演进。可能受益于微服务的常见信号包括：

- A change to one area (like notifications) requires redeploying the entire app.
- Teams can't ship independently without coordinating every release.
- Different parts of the app have different scaling needs (search needs 10 servers, profile viewing needs 2)
- Engineers frequently conflict in the same codebase.
- A bug in one subsystem takes down the whole application.

> - 修改某个区域（如通知功能）就需要重新部署整个应用。
> - 团队无法独立发布，每次上线都要相互协调。
> - 应用的不同部分扩展需求不同（搜索需要 10 台服务器，个人资料页只需要 2 台）。
> - 工程师们在同一代码库中频繁冲突。
> - 一个子系统的 bug 就能拖垮整个应用。

Microservices split the application into independent services that communicate over the network.

> 微服务将应用拆分为通过网络通信的独立服务。

![Microservices architecture｜微服务架构](./5f159ac7707fd68b4100c2955ef95629_MD5.webp)

Each service:

> 每个服务：

- **Owns its data** (a database only it writes to directly)
- **Deploys independently** (ship notifications without touching checkout)
- **Scales independently** (search can scale separately from profiles)
- **Uses fit-for-purpose tech** (search might use Elasticsearch, payments might need Postgres with strong consistency)
- **Exposes a clear API contract** (other services integrate via stable endpoints)

> - **拥有自己的数据**（只有它自己直接写入的数据库）
> - **独立部署**（发布通知功能无需动结账系统）
> - **独立伸缩**（搜索服务可与用户资料服务分开扩展）
> - **采用适合自身的技术**（搜索可能用 Elasticsearch，支付可能需要强一致性的 PostgreSQL）
> - **暴露清晰的 API 契约**（其他服务通过稳定的端点集成）

The trade-off is a big jump in operational complexity. The safest approach is to start with **one extraction**: pick the service with the cleanest boundaries and the clearest independent scaling needs. Avoid splitting into dozens of services upfront.

> 代价是运维复杂度的大幅跃升。最稳妥的做法是从一次拆分开始：选择边界最清晰、独立扩展需求最明确的服务。避免一开始就拆成几十个微服务。

### Message Queues and Async Processing｜消息队列与异步处理

Not everything needs to happen synchronously in the request path. When a user places an order, some steps must complete immediately, while others can happen in the background.

> 并非所有操作都必须在请求路径中同步执行。用户下单时，有些步骤必须立即完成，另一些则可以在后台处理。

**Must be synchronous｜必须同步的：**

- Validate payment method
- Check inventory
- Create order record
- Return order confirmation

> - 验证支付方式
> - 检查库存
> - 创建订单记录
> - 返回订单确认

**Can be asynchronous｜可以异步的：**

- Send confirmation email
- Update analytics dashboard
- Notify warehouse for fulfillment
- Update recommendation engine
- Sync to accounting system

> - 发送确认邮件
> - 更新分析看板
> - 通知仓库发货
> - 更新推荐引擎
> - 同步至会计系统

Message queues like **Kafka**, **RabbitMQ**, or **SQS** decouple producers from consumers. The order service publishes an event like `OrderPlaced`, and downstream systems consume it independently.

> Kafka、RabbitMQ 或 SQS 等消息队列实现了生产者与消费者的解耦。订单服务发布 `OrderPlaced` 这样的事件，下游系统各自独立消费。

![Message queue and async processing｜消息队列与异步处理](./d023a84d9718e2b770091f4a07d968c8_MD5.webp)

**Benefits of async processing｜异步处理的优势：**

- **Resilience**: If email service is down, messages queue up. Order still completes. Email sends when service recovers.
- **Scalability**: Consumers scale independently based on queue depth. Holiday rush? Add more warehouse notification processors without touching the orders service.
- **Decoupling**: The order service doesn't need to know who consumes the event. You can add a new consumer (fraud detection, CRM sync) without changing the producer.
- **Smoothing bursts**: Queues absorb spikes and let downstream systems process at a sustainable rate instead of getting overloaded.
- **Retry handling**: Failed messages can be retried automatically. Dead letter queues capture messages that fail repeatedly for investigation.

> - **弹性**：邮件服务宕机时，消息在队列中堆积，订单仍能完成，邮件在服务恢复后补发。
> - **可扩展性**：消费者可根据队列深度独立扩展。节日高峰？增加仓库通知处理器即可，无需改动订单服务。
> - **解耦**：订单服务无需知道谁消费事件。新增消费者（欺诈检测、CRM 同步）不需要修改生产者。
> - **削峰填谷**：队列吸收流量尖峰，让下游系统以可持续的速率处理，避免被打垮。
> - **重试处理**：失败的消息可自动重试；死信队列捕获反复失败的消息以供排查。

A common real-world pattern is "do the write now, do the heavy work later."

> 一种常见的实践模式是"现在完成写入，重活以后再做"。

For example, in social apps, creating a post is usually a fast write and an immediate success response. Expensive work like fan-out, indexing, notifications, and feed updates happens asynchronously, which is why you sometimes see small delays in like counts or feed propagation.

> 例如在社交应用中，发帖通常是快速写入并立即返回成功。扇出、索引、通知和信息流更新这些耗时操作则异步执行——这就是为什么你有时会看到点赞数或信息流出现短暂延迟。

At this point, your architecture can handle massive scale within a single region. But your users aren't all in one place, and neither should your infrastructure be.

> 此时，你的架构已能在单个区域内支撑巨大规模。但用户并非集中在一处，基础设施也不应如此。

Once you have users across continents, latency becomes noticeable, and a single datacenter becomes a single point of failure for your entire global user base.

> 一旦用户遍布各大洲，延迟问题就会变得显著，而单一数据中心将成为全球用户的单点故障源。

---

## Stage 7: Multi-Region + Advanced Patterns (1M–10M+ Users)｜第七阶段：多区域部署与进阶模式（100 万–1000 万+ 用户）

With millions of users worldwide, new challenges emerge:

> 随着全球用户达到数百万级别，新的挑战开始浮现：

- Users in Australia experience 300ms latency hitting US servers
- A datacenter outage (fire, network partition, cloud provider issue) takes down your entire service
- Your database schema can't efficiently serve both write-heavy real-time updates and read-heavy analytics dashboards
- Different regions have different data residency requirements (GDPR in EU, data localization laws)

> - 澳大利亚用户访问美国服务器要承受 300 毫秒延迟
> - 一次数据中心事故（火灾、网络分区、云服务商故障）会让整个服务停摆
> - 数据库 schema 无法同时高效支撑写密集的实时更新和读密集的分析看板
> - 不同地区有不同的数据驻留要求（欧盟 GDPR、数据本地化法规）

This stage covers **multi-region deployment**, **advanced caching**, and **specialized patterns** like CQRS.

> 本阶段涵盖多区域部署、高级缓存，以及 CQRS 等专项模式。

### Multi-Region Architecture｜多区域架构

Deploying to multiple geographic regions achieves two main goals:

> 部署到多个地理区域主要实现两个目标：

1. **Lower latency**: Users connect to nearby servers. Tokyo users hit Tokyo servers (20ms) instead of US servers (200ms).
2. **Disaster recovery**: If one region fails, others continue serving traffic. True high availability.

> 1. **降低延迟**：用户连接就近的服务器。东京用户访问东京服务器（20 毫秒），而不是美国服务器（200 毫秒）。
> 2. **灾难恢复**：一个区域故障时，其他区域继续服务。真正的高可用。

![Multi-region architecture｜多区域架构](./032ce56e38315b85e8f0bc7e4daaab75_MD5.webp)

There are two main approaches:

> 有两种主要路线：

#### Active-Passive (Primary-Secondary)｜主备（主-从）架构

One region (primary) handles all writes. Other regions serve reads and can take over if the primary fails.

> 一个区域（主区域）处理所有写入，其他区域服务读取，并在主区域故障时接管。

**Pros｜优点：**

- Simpler to implement
- No write conflict resolution needed
- Strong consistency for writes

> - 实现更简单
> - 无需解决写入冲突
> - 写入具有强一致性

**Cons｜缺点：**

- Higher write latency for users far from primary
- Failover isn't instantaneous (DNS propagation, replica promotion)
- Primary region is still a single point of failure

> - 远离主区域的用户写入延迟较高
> - 故障转移不是瞬时的（DNS 传播、副本提升都需要时间）
> - 主区域仍然是单点

#### Active-Active｜双活（主-主）架构

All regions handle both reads and writes. This requires solving the hard problem: what happens when users in US and EU update the same record simultaneously?

> 所有区域同时处理读写。这需要解决一个难题：当美国和欧盟的用户同时更新同一条记录时会发生什么？

**Pros｜优点：**

- Lowest possible latency for all operations
- True high availability, any region failure is seamless
- No single point of failure

> - 所有操作都能实现最低延迟
> - 真正的高可用，任何区域故障都无缝切换
> - 无单点故障

**Cons｜缺点：**

- Conflict resolution is complex (and can cause data issues if done wrong)
- Eventually consistent, not suitable for all data types
- More complex to reason about and debug

> - 冲突解决很复杂（处理不当会导致数据问题）
> - 最终一致性，不适用于所有数据类型
> - 推理和调试都更复杂

Most companies start with active-passive. Active-active requires solving distributed consensus problems and accepting eventual consistency.

> 多数公司从主备模式起步。双活模式需要解决分布式共识问题，并接受最终一致性。

### CAP Theorem at Global Scale｜全球规模下的 CAP 定理

The CAP theorem becomes very real at global scale. It states that a distributed system can only provide two of three guarantees:

> 在全球规模下，CAP 定理变得非常现实。它指出分布式系统最多只能同时满足三项保证中的两项：

- **Consistency**: Every read receives the most recent write
- **Availability**: Every request receives a response (not an error)
- **Partition Tolerance**: System continues despite network partitions

> - **一致性（Consistency）**：每次读取都能得到最新的写入结果
> - **可用性（Availability）**：每个请求都能得到响应（而非错误）
> - **分区容错性（Partition Tolerance）**：网络分区发生时系统仍能运行

Since network partitions between regions are inevitable (undersea cables get cut, cloud providers have outages), you're really choosing between consistency and availability during a partition.

> 由于区域间的网络分区不可避免（海底电缆会被切断，云厂商会出故障），你实际上是在分区发生时，在一致性与可用性之间做抉择。

Most global systems choose **eventual consistency** for most operations:

> 大多数全球化系统在多数操作上选择最终一致性：

- A user's post might take 1–2 seconds to appear for followers in other regions
- A product rating might show slightly different averages in different regions briefly
- User profile updates might take a moment to propagate

> - 用户发布的动态可能要 1–2 秒才对其他区域的粉丝可见
> - 产品评分在不同区域可能短暂显示略有差异的平均值
> - 用户资料更新可能需要片刻才能传播到所有区域

Only operations where inconsistency causes real problems (payments, inventory decrements, financial transactions) require strong consistency, and those might route to a primary region.

> 只有那些不一致会造成实际问题的操作（支付、库存扣减、金融交易）才需要强一致性，这些操作可以路由到主区域处理。

### CQRS Pattern｜CQRS 模式

As systems grow, read and write patterns diverge significantly:

> 随着系统规模增长，读写模式会显著分化：

- Writes need transactions, validation, normalized data, audit logs
- Reads need denormalized data, fast aggregations, full-text search
- Write volume might be 1/100th of read volume

> - 写入需要事务、校验、规范化数据、审计日志
> - 读取需要反规范化数据、快速聚合、全文检索
> - 写入量可能只有读取量的百分之一

**CQRS (Command Query Responsibility Segregation)** separates these concerns entirely.

> **CQRS（命令查询职责分离）**将这两类关注点彻底分开。

![CQRS pattern｜CQRS 模式](./1ddd5e420d7dc5f114b65c95a82fd587_MD5.webp)

The write side uses a normalized schema optimized for data integrity and transactional guarantees. The read side uses denormalized views optimized for query performance. Events synchronize the two.

> 写入端采用规范化 schema，为数据完整性和事务保障优化；读取端采用反规范化视图，为查询性能优化。两侧通过事件同步。

Real-world example: Twitter's timeline architecture.

> 实际案例：Twitter 的时间线架构。

- **Write path**: When you tweet, it's written to a normalized tweets table with proper indexing, constraints, and transactions.
- **Event**: A "tweet created" event fires.
- **Projection**: A fan-out service reads the event and adds the tweet to each follower's timeline (a denormalized, per-user data structure optimized for "show me my feed" queries).
- **Read path**: When you open Twitter, you read from your pre-computed timeline, not a complex query joining tweets, follows, and users.

> - **写入路径**：你发推文时，它被写入规范化的推文表，具备完善的索引、约束和事务。
> - **事件**：一条"推文已创建"事件被触发。
> - **投影**：扇出服务读取事件，把推文写入每位关注者的时间线（一种反规范化的、按用户组织的数据结构，专为"显示我的动态"查询优化）。
> - **读取路径**：你打开 Twitter 时，读到的是预计算好的时间线，而不是一条 JOIN 推文、关注关系和用户信息的复杂查询。

CQRS adds complexity but enables:

> CQRS 增加了复杂度，但带来了：

- Independent scaling of read and write paths
- Optimized schemas for each access pattern
- Different technology choices (PostgreSQL for writes, Elasticsearch for reads)
- Better performance for both operations

> - 读写路径独立扩展
> - 为每种访问模式优化的 schema
> - 差异化的技术选型（写入用 PostgreSQL，查询用 Elasticsearch）
> - 读写双方都获得更好的性能

### Advanced Caching Patterns｜高级缓存模式

At global scale, caching becomes more sophisticated:

> 在全球规模下，缓存机制变得更加精细：

#### Multi-Tier Caching｜多层缓存

![Multi-tier caching (1)｜多层缓存（一）](./e05a202a5f03cc6ea23d004af34ada65_MD5.webp)

![Multi-tier caching (2)｜多层缓存（二）](./51808b2989689ab5556607bf7cd0fdc3_MD5.webp)

#### Cache Warming｜缓存预热

When a new cache server starts (or cache expires after maintenance), the first requests face cache misses, causing latency spikes and origin load. Cache warming pre-populates caches before traffic arrives:

> 新缓存服务器启动（或维护后缓存被清空）时，首批请求会全部未命中，造成延迟尖峰和源站压力。缓存预热在流量到达前预先填充缓存：

- **On deployment**: Load popular items into cache during startup, before receiving traffic
- **Before campaigns**: Before a marketing push, warm caches with products/pages likely to be accessed
- **Cache replication**: When adding a new cache node, copy state from existing nodes

> - **部署时**：启动阶段先把热门条目加载进缓存，再接收流量
> - **活动前**：营销推广开始前，为可能被访问的商品/页面预热缓存
> - **缓存复制**：新增缓存节点时，从现有节点复制状态

> Netflix pre-warms edge caches with popular content before peak hours. When evening viewing starts, the most-watched shows are already cached at edge locations.
>
> Netflix 会在高峰时段前用热门内容预热边缘缓存。晚间观影高峰到来时，最热门的剧集已经缓存在边缘节点上。

#### Write-Behind (Write-Back) Caching｜回写式缓存

For write-heavy workloads, write to cache first and asynchronously persist to database:

> 对于写密集型负载，先写缓存，再异步持久化到数据库：

1. Write goes to cache (immediate return to user)
2. Cache acknowledges write
3. Background process flushes writes to database periodically

> 1. 写入进入缓存（立即返回用户）
> 2. 缓存确认写入
> 3. 后台进程定期将写入刷到数据库

This reduces write latency dramatically but introduces risk: if the cache fails before flushing, writes are lost. Use only when:

> 这能大幅降低写入延迟，但引入了风险：缓存在刷盘前故障，写入就会丢失。仅在以下情况使用：

- Some data loss is acceptable (analytics counters, view counts)
- Cache is highly available (Redis with replication and persistence)
- Durability can be sacrificed for performance

> - 可以接受少量数据丢失（分析计数器、浏览量统计）
> - 缓存高度可用（带复制和持久化的 Redis）
> - 可以牺牲持久性换取性能

You've now built a globally distributed system that handles millions of users with low latency worldwide. But the journey doesn't end here. At truly massive scale, even the best off-the-shelf solutions start showing their limits.

> 至此，你已经构建了一个能以低延迟服务全球数百万用户的分布式系统。但征程并未结束——当规模真正达到海量级别时，即使最优秀的现成方案也会显现极限。

---

## Beyond 10 Million Users｜超越 1000 万用户

At 10 million users and beyond, you enter territory where off-the-shelf solutions don't always work. Companies at this scale often build custom infrastructure tailored to their specific access patterns. The problems become unique to your workload.

> 用户规模超过 1000 万后，你会进入现成方案不再总适用的领域。这一规模的公司往往会针对自己的访问模式构建定制基础设施，问题因负载而异。

### Specialized Data Stores｜专用数据存储

No single database handles all access patterns well. The concept of "polyglot persistence" means using different databases for different use cases:

> 没有任何单一数据库能同时擅长所有访问模式。"多语言持久化"（polyglot persistence）意味着针对不同场景使用不同数据库：

![Specialized data stores (1)｜专用数据存储（一）](./8bf3be79349552983e476e015caceeb0_MD5.webp)

![Specialized data stores (2)｜专用数据存储（二）](./01b5a2f79409a208247836ad8af83719_MD5.webp)

Each database is optimized for specific access patterns. Using PostgreSQL for time-series data works but is inefficient. Using Elasticsearch for transactions is possible but dangerous.

> 每种数据库都为特定访问模式优化。用 PostgreSQL 存时序数据可行但低效；用 Elasticsearch 做事务不是不行，但很危险。

### Custom Solutions at Scale｜规模化定制方案

At extreme scale, some companies build custom infrastructure because their requirements go beyond what general-purpose systems can deliver:

> 在极端规模下，一些公司会构建定制基础设施，因为需求已超出通用系统的能力边界：

- **Facebook's TAO:** A custom data system for the social graph, built to meet Facebook's latency and throughput needs at massive scale when off-the-shelf options couldn't.
- **Google Spanner:** A globally distributed SQL database designed to provide strong consistency across regions, combining properties that were hard to get together at the time.
- **Netflix's EVCache:** A large-scale caching layer built on Memcached, with additional replication, reliability, and operational tooling to support Netflix's traffic patterns.
- **Discord's storage journey:** MongoDB (2015) → Cassandra (2017) → ScyllaDB (2022). Each move was driven by the limits of the previous choice, and Discord has shared detailed write-ups on the trade-offs behind those migrations.
- **Uber's Schemaless:** A MySQL-based storage layer designed to keep transactional semantics while scaling beyond a single MySQL setup, with operational simplicity for teams.

> - **Facebook 的 TAO**：为社交图谱定制的数据系统，在现成方案无法满足 Facebook 海量规模下的延迟与吞吐需求时专门构建。
> - **Google Spanner**：全球分布式 SQL 数据库，旨在跨区域提供强一致性，把当时难以兼得的特性融合在了一起。
> - **Netflix 的 EVCache**：基于 Memcached 构建的大规模缓存层，增强了复制、可靠性与运维工具链，以适配 Netflix 的流量模式。
> - **Discord 的存储演进**：MongoDB（2015）→ Cassandra（2017）→ ScyllaDB（2022）。每次迁移都源于前代方案的极限，Discord 也公开了这些迁移背后权衡的详细文章。
> - **Uber 的 Schemaless**：基于 MySQL 构建的存储层，在突破单机 MySQL 限制的同时保留事务语义，并为团队保持运维上的简单。

These aren't options you'll reach for initially, but they illustrate that scaling is an ongoing journey, not a destination. The architecture that works at 1 million users is rarely the one you'll want at 100 million.

> 这些方案并非初期会考虑的选择，但它们说明扩展是一场持续的旅程，而非终点。适用于 100 万用户的架构，很少是你在 1 亿用户时想要的架构。

### Edge Computing｜边缘计算

The next frontier is pushing computation closer to users. Instead of all logic running in centralized data centers, edge computing runs code at CDN edge locations worldwide:

> 下一个前沿是把计算推向离用户更近的地方。不再是所有逻辑都跑在集中的数据中心，边缘计算让代码在全球 CDN 边缘节点上运行：

- **Cloudflare Workers**: JavaScript/WASM at 250+ edge locations
- **AWS Lambda@Edge**: Lambda functions at CloudFront edge
- **Fastly Compute@Edge**: Compute at Fastly's edge network
- **Deno Deploy**: Globally distributed JavaScript runtime

> - **Cloudflare Workers**：在 250 多个边缘节点运行 JavaScript/WASM
> - **AWS Lambda@Edge**：在 CloudFront 边缘运行 Lambda 函数
> - **Fastly Compute@Edge**：在 Fastly 边缘网络上进行计算
> - **Deno Deploy**：全球分布的 JavaScript 运行时

Edge computing represents a fundamental shift: instead of "request → CDN → origin → CDN → response", many requests become "request → edge → response" with the edge having enough compute capability to handle the logic.

> 边缘计算代表着根本性转变：许多请求从"请求 → CDN → 源站 → CDN → 响应"变为"请求 → 边缘 → 响应"，因为边缘节点已具备足够的算力来处理逻辑。

Now that we've covered the full progression from a single server to global-scale infrastructure, an important question remains: how do you know when to take each step? Scaling too early wastes resources; scaling too late causes outages.

> 走完从单服务器到全球规模基础设施的完整历程后，仍有一个重要问题：如何知道何时迈出每一步？过早扩展浪费资源，过晚扩展导致宕机。

---

## Summary｜小结

Scaling a system from zero to millions of users follows a predictable progression. Each stage solves problems that emerge at specific thresholds:

> 将系统从零扩展到数百万用户，遵循一条可预测的演进路径。每个阶段解决在特定阈值出现的问题：

![Scaling stages summary｜扩展阶段总结](./8e9b30393044d6acbf8e02a4e35ec01f_MD5.webp)

### Key Principles to Remember｜需要牢记的关键原则

1. **Start simple**: Don't optimize for problems you don't have yet. A single server is fine until it isn't.
2. **Measure first**: Identify the actual bottleneck before adding infrastructure. CPU-bound problems need different solutions than I/O-bound ones.
3. **Stateless servers are the prerequisite**: You can't horizontally scale or auto-scale until your servers hold no local state.
4. **Cache aggressively**: Most data is read far more often than written. Caching gives you 10–100x performance improvement for read-heavy workloads.
5. **Async when possible**: Not everything needs to happen in the request path. Email sending, analytics, notifications can all be queued.
6. **Shard reluctantly**: Database sharding is a one-way door with significant complexity. Exhaust other options first.
7. **Accept trade-offs**: Perfect consistency and availability don't coexist during network partitions. Know which operations truly need strong consistency.
8. **Complexity has costs**: Every component you add is a component that can fail, needs monitoring, requires expertise to operate.

> 1. **从简开始**：不要为尚不存在的问题优化。单服务器在不够用时之前一直够用。
> 2. **测量优先**：增加基础设施前先定位真正的瓶颈。CPU 密集型和 I/O 密集型问题的解法不同。
> 3. **无状态是先决条件**：服务器不保存本地状态之前，谈不上水平扩展和自动扩缩容。
> 4. **积极缓存**：大多数数据的读取远多于写入。对读密集型负载，缓存能带来 10–100 倍的性能提升。
> 5. **能异步就异步**：并非所有事都要在请求路径中完成。发邮件、分析、通知都可以入队。
> 6. **谨慎分片**：数据库分片是复杂度极高的单向门，先穷尽其他方案。
> 7. **接受权衡**：网络分区时，完美的一致性与可用性不可兼得。要清楚哪些操作真正需要强一致性。
> 8. **复杂度有成本**：每增加一个组件，就多一个可能故障的点、多一项要监控的对象、多一份运维所需的专业能力。

The path to scale isn't about implementing everything at once. It's about understanding which problems emerge at each stage and applying the right solutions at the right time.

> 扩展之路不在于一次性实现所有方案，而在于理解每个阶段会出现什么问题，并在正确的时机应用正确的方案。

The best architecture is the simplest one that meets your current needs, with a clear path to evolve when those needs change.

> 最好的架构，是能满足当前需求的最简架构，并且在需求变化时有清晰的演进路径。

---

That's it. Thank you so much for reading!

> 以上就是全部内容。非常感谢您的阅读！

For more System Design related content, checkout my website [algomaster.io](https://algomaster.io/)

> 更多系统设计相关内容，请访问作者的网站 [algomaster.io](https://algomaster.io/)。
