---
lang: "zh-CN"
pubDatetime: 2026-09-15T16:20:37+08:00
timezone: "Asia/Shanghai"
title: "软件工程概念词典：一份可持续生长的术语表"
area: "software-engineering"
featured: false
draft: false
tags:
  - "概念"
  - "设计原则"
  - "数据库"
  - "软件工程"
description: "把散落的概念笔记整合成一份分类术语词典：设计原则、语言机制、算法思维、数据库内核、系统架构、工程文化六大类，每个概念给出精确定义、出处与权威参考，持续更新。"
---
这是一份**活文档**：把平时散落的"概念卡片"按类别整合为一部小型词典。每个条目只做三件事——给出**精确简短的定义**、交代**概念出处**、列出**权威参考文献**。日后学到新概念，就在对应章节追加条目，让这份词典持续生长。

收录标准：有独立解释价值、且值得背诵定义的概念单独成条；过于琐碎或只是引用的卡片，要么并入相邻条目，要么舍弃。

## 一、面向对象与设计原则

### SOLID 五项原则

**定义**：面向对象设计的五项基本原则的合称，目标是让代码可维护、可扩展：

1. **S — 单一职责（SRP）**：一个类只应有一个引起它变化的原因。
2. **O — 开闭原则（OCP）**：软件实体对扩展开放，对修改关闭。
3. **L — 里氏替换（LSP）**：子类型必须能替换其基类型而不破坏程序正确性。
4. **I — 接口隔离（ISP）**：客户端不应被迫依赖它用不到的接口，接口宜小而专一。
5. **D — 依赖倒置（DIP）**：高层模块与低层模块都应依赖抽象；抽象不依赖细节，细节依赖抽象。

**出处**：各项原则由 **Robert C. Martin（Uncle Bob）**在 1990 年代至 2000 年代初的文章与著作中系统整理；其中 LSP 源自 **Barbara Liskov** 1987 年的会议演讲及 Liskov & Wing 1994 年的论文；"SOLID"这一缩写由 **Michael Feathers** 在 2004 年前后提出。

**参考**：

- Robert C. Martin, *Agile Software Development: Principles, Patterns, and Practices*, 2002
- Martin, "Design Principles and Design Patterns", 2000
- Liskov & Wing, "A Behavioral Notion of Subtyping", *ACM TOPLAS*, 1994

### 控制反转（IoC）与依赖注入（DI）

**定义**：**IoC（Inversion of Control，控制反转）**指程序的控制流不再由应用代码主导，而是由框架主导——框架调用你的代码，而不是你的代码调用框架，俗称"好莱坞原则：别打电话给我们，我们会打给你"。**DI（Dependency Injection，依赖注入）**是实现 IoC 的一种具体手段：对象所需要的协作者（依赖）不再由自己创建，而是由外部（通常是容器/框架）在构造时"传入"。

用大白话讲："依赖"就是"所需要的"，"注入"就是"传入"。依赖注入就是把对象 A 需要的 B、C、D 由第三方装配好递给 A——这个第三方必然是个框架。至于"反转"一词：与其说是"反转"，不如说是"控制权外包"。传统顺序是"人（应用代码）控制程序"，IoC 之后是"程序（框架）控制程序"，主动与被动掉了个个儿，故名反转。

**出处**：术语由 **Martin Fowler** 在 2004 年的文章 *Inversion of Control Containers and the Dependency Injection pattern* 中确立，用以区分通用的 IoC 与具体的 DI 模式。

**参考**：

- Martin Fowler, [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html), 2004
- Fowler, [InversionOfControl](https://martinfowler.com/bliki/InversionOfControl.html)

### 函数选项模式（Functional Options Pattern）

**定义**：Go 语言中一种构造函数参数的组织方式——不直接传一长串参数或巨型配置结构体，而是传入若干个"选项函数"（`type Option func(*config)`），每个选项函数负责修改配置的一个方面。它兼顾了默认值、可选参数与向后兼容：新增选项不需要改函数签名。

**出处**：由 **Rob Pike** 2014 年的博客文章 *Self-referential functions and the design of options* 提出雏形，**Dave Cheney** 同年以 *Functional options for friendly APIs* 一文将其命名并推广。

**参考**：

- Rob Pike, [Self-referential functions and the design of options](https://commandcenter.blogspot.com/2014/01/self-referential-functions-and-design.html), 2014
- Dave Cheney, [Functional options for friendly APIs](https://dave.cheney.net/2014/10/17/functional-options-for-friendly-apis), 2014

### ORM（对象关系映射）

**定义**：Object-Relational Mapping，通过"对象 ↔ 数据库表"的映射，把 SQL 操作抽象为对内存对象的操作。代价是所谓**对象-关系阻抗失配（impedance mismatch）**：面向对象的继承、引用图与关系模型的表、连接之间天然不同构。

**出处**：术语随 1990 年代面向对象数据库浪潮流行；Martin Fowler 在 *Patterns of Enterprise Application Architecture*（2002）中系统总结了 Active Record、Data Mapper 等经典 ORM 模式。

**参考**：Martin Fowler, *Patterns of Enterprise Application Architecture*, 2002, Part III "Object-Relational Behavioral Patterns"

## 二、语言机制与运行时

### 反射（Reflection）

**定义**：程序在**运行时**检视并修改自身结构（类、方法、字段、类型信息）的能力。普通代码在编译时就把一切写死；反射则让代码在运行时"照镜子"，看到自己的编译期信息——正如光的传播无法回头，只有在落脚点立一面镜子，才能从终点（运行时）看见起点（编译时）。

**参考**：

- Rob Pike, [The Laws of Reflection](https://go.dev/blog/laws-of-reflection)（Go Blog, 2011）
- Java 官方文档：[Trail: The Reflection API](https://docs.oracle.com/javase/tutorial/reflect/)

### 注解（Annotation）

**定义**：附着在代码元素（类、方法、字段、参数）上的**结构化元数据**，本身不改变程序语义，由编译器、框架或运行时读取并驱动行为（如 Java 的 `@Override`、Spring 的 `@Autowired`）。Java 的注解即 C# 的 attribute、Python 装饰器的元数据近亲。

**出处**：由 **JSR 175** 引入 Java 5（2004）。

**参考**：

- *Java Language Specification*, §9.6–9.7（Annotations）
- [JSR 175: A Metadata Facility for the Java Programming Language](https://jcp.org/en/jsr/detail?id=175)

### 可变参数列表（Variadic Arguments）

**定义**：允许函数接受**个数不固定**参数的语法机制。各语言形态对比：

| 语言 | 语法 | 本质 | 类型安全 |
| --- | --- | --- | --- |
| C | `...` + `stdarg.h` 宏 | 栈上原始字节，需手动解析 | 不安全 |
| Java | `String... args` | 数组 | 安全，同型 |
| C++11+ | `template<typename... Args>` | 模板参数包 | 安全，可异型 |
| Python | `*args` / `**kwargs` | 元组 / 字典 | 动态 |
| Go | `args ...T` | 切片 | 安全，同型 |

**参考**：

- Go Specification: [Passing arguments to ... parameters](https://go.dev/ref/spec#Passing_arguments_to_..._parameters)
- C 标准：`<stdarg.h>`（ISO C99 §7.15）

### 序列化与反序列化

**定义**：**序列化（serialization / marshaling）**是把内存中的对象转换为可存储或可传输的字节序列的过程；**反序列化**是其逆过程。核心权衡在四个维度：跨语言性、可读性（文本 vs 二进制）、体积与编解码性能、以及 schema 演进能力（前后兼容）。代表方案有 JSON（可读、通用）、Protocol Buffers（二进制、schema 驱动）、Java 原生序列化（有安全与兼容性包袱）等。

**参考**：

- [Protocol Buffers 官方文档](https://protobuf.dev/)
- [序列化和反序列化 - 美团技术团队](https://tech.meituan.com/2015/02/26/serialization-vs-deserialization.html)

## 三、算法与复杂度思维

### 时空权衡（Space-Time Tradeoff）

**定义**：在时间与空间之间做交换的一类算法设计思想。典型做法是**以空间换时间**：对输入做预处理，把额外信息存储起来以加速后续求解，Levitin 称之为**输入增强（input enhancement）**，代表例子有计数排序、字符串匹配的 Boyer-Moore / Horspool 算法、散列表。反向的"以时间换空间"同样存在（如嵌入式环境中的压缩存储）。

**出处**：Anany Levitin, *Introduction to the Design and Analysis of Algorithms*（第 7 章 "Space and Time Trade-Offs"）。

**参考**：Levitin 上述著作第 3 版（Addison-Wesley, 2011）；Wikipedia, [Space–time tradeoff](https://en.wikipedia.org/wiki/Space%E2%80%93time_tradeoff)

## 四、数据库内核（以 PostgreSQL 为语境）

### 投影（Projection）

**定义**：关系代数中的基本算子 **π**：从关系中**挑选若干列**、丢弃其余列（并去重），对应 SQL 的 `SELECT` 列表。名字借自线性代数/几何中的投影——把高维对象映射到子空间，只保留某些方向上的信息；关系投影正是把"元组"这个高维对象降到指定的列子空间上。

**出处**：E. F. Codd, "A Relational Model of Data for Large Shared Data Banks", *CACM*, 1970——关系代数的开山论文。

**参考**：Codd 1970；任一数据库教材（如 Silberschatz《Database System Concepts》第 6 章关系代数）

### 查询计划树（Query Plan Tree）

**定义**：优化器输出的、由**计划节点**组成的树状结构，是执行器的"施工图纸"。一条 SQL 的生命周期大致是：

```
SQL 解析 → 查询重写 → 逻辑优化 → 物理优化 → 生成计划树 → 执行计划树
```

逻辑优化做代数等价变换（谓词下推、子查询消除等），物理优化在等价方案间做成本比较（选 SeqScan 还是 IndexScan、选哪种 Join 算法），最终产物就是查询计划树。

**参考**：PostgreSQL 官方文档 [EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)；彭智勇、彭煜玮《PostgreSQL 数据库内核分析》

### 计划节点（Plan Node）

**定义**：查询计划树中的节点，对应一种执行算法，执行时以迭代器（火山）模型逐层向上拉取元组。按职责分四类：

- **控制节点（Control Node）**：处理特殊执行流程，如 `Result` 节点表示 INSERT 的 VALUES 子句。
- **扫描节点（Scan Node）**：从表或索引取数据，如 SeqScan、IndexScan。
- **物化节点（Materialization Node）**：共同特点是会把执行结果**缓存**到辅助存储——首次执行生成全部元组并缓存，供上层节点反复取用，如 Material、Sort、Hash。
- **连接节点（Join Node）**：关系代数连接操作的实现，三大算法为 **HashJoin、MergeJoin、NestedLoop**。

**出处**：《PostgreSQL 数据库内核分析》第 6.4 节；PostgreSQL 源码 `src/backend/executor/` 与 `nodes/execnodes.h`。

### DSM（Dynamic Shared Memory）

**定义**：PostgreSQL 中用于**并行查询**的动态共享内存机制。传统共享内存段（shared buffers 等）在 postmaster 启动时一次性分配且大小固定；DSM 允许在执行期**动态创建**共享内存段，供 leader 进程与多个并行 worker 进程之间交换元组和同步状态，是 9.6 引入的并行查询架构的地基（9.4 先引入机制本身）。

**出处**：由 Robert Haas 主导开发，PostgreSQL 9.4 引入基础设施、9.6 支撑并行顺序扫描落地。

**参考**：

- PostgreSQL 源码 `src/backend/utils/mmgr/dsm.c` 及 `src/include/utils/dsm.h`
- PostgreSQL 文档：[Parallel Plans](https://www.postgresql.org/docs/current/parallel-plans.html)

### Hash Join 的倾斜（Skew）问题

**定义**：哈希连接把 build 侧按 join key 分桶；当 key 分布不均——某些值特别热——时，对应桶（以及并行执行中负责该桶的 worker）会处理远超平均的数据量，造成**内存膨胀、落盘（batch spill）和并行度失效**，这就是数据倾斜。并行 hash join 中尤其明显：分桶均匀与否直接决定 worker 负载是否均衡。缓解思路包括多次哈希分批落盘、识别高频值（MCV）单独处理、或改用其他 join 策略。

**参考**：

- Thomas Munro, [Parallel Hash for PostgreSQL](https://www.enterprisedb.com/blog/parallel-hash-postgresql), 2017
- PostgreSQL 文档 [Parallel Plans](https://www.postgresql.org/docs/current/parallel-plans.html)

## 五、系统架构

### BFF（Backend for Frontend）

**定义**：当后端被拆成众多微服务后，为**每一类前端**（Web、iOS、Android）设立一个专用的、面向其需求裁剪的后端聚合层，作为前端调用的统一入口。BFF 由前端团队自治，负责聚合、裁剪、适配多个下游微服务，避免把"为各端定制"的复杂度塞进通用 API。争议点是"胖瘦之争"：BFF 里该放多少业务逻辑。

**出处**：由 **Sam Newman** 在 2015 年的文章 *Backends for Frontends* 中命名，并写入《Building Microservices》。

**参考**：

- Sam Newman, [Backends for Frontends](https://samnewman.io/patterns/architectural/bff/), 2015
- Newman, *Building Microservices*, 2nd ed., O'Reilly, 2021

### OAuth 2.0

**定义**：一个**授权（authorization）**框架：通过**令牌（token）**机制，把用户对某资源的有限访问权委托给第三方应用，而第三方始终接触不到用户的登录凭据。典型角色有资源拥有者、客户端、授权服务器、资源服务器；典型流程是授权码模式（Authorization Code Grant）。注意：**OAuth 2.0 管授权不管认证**——"证明你是谁"要交给建立在其上的 OpenID Connect。

**出处**：IETF，2012 年发布为 RFC。

**参考**：

- [RFC 6749 — The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
- [RFC 6750 — Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750)
- [OAuth 2.0 Security Best Current Practice（RFC 9700）](https://www.rfc-editor.org/rfc/rfc9700)

## 六、工程文化与实践

### 测试驱动开发（TDD）

**定义**：一种**先写测试、再写实现**的开发节奏，循环为三步：**Red**（写一个会失败的测试）→ **Green**（写恰好能让它通过的最小实现）→ **Refactor**（在测试保护下清理设计）。测试不是事后验证手段，而是设计工具。

**出处**：Kent Beck 在极限编程（XP）实践中将其体系化，2002 年出版专著。

**参考**：Kent Beck, *Test-Driven Development: By Example*, Addison-Wesley, 2002

### RTFM

**定义**：技术社区俚语，"Read The Fucking Manual"的缩写——对不看文档就提问者的经典回应。收在这里不为讽刺，而为自勉：多数"神秘问题"的答案，其实早就写在手册里。

**出处**：源自大型机时代的黑客文化，收录于《The Jargon File》（Eric S. Raymond 主编）。

**参考**：[The Jargon File: RTFM](http://www.catb.org/jargon/html/R/RTFM.html)

---

## 更新日志

- 2026-09-15：首版，整合 19 篇概念卡片，归类为六章；空壳卡片（注解、TDD 等）补齐定义，引用型卡片（函数选项、序列化等）补写正文，与主题重复的并入相邻条目。
