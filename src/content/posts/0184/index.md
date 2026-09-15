---
lang: "zh-CN"
pubDatetime: 2026-09-15T16:20:37+08:00
modDatetime: 2026-09-15T16:33:01+08:00
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

这是一份**活文档**：把平时散落的"概念卡片"按类别整合为一部小型词典，每章一张三列表格——**概念**、**精确定义**、**出处与权威参考**。日后学到新概念，就在对应章节的表格里追加一行，让这份词典持续生长。

收录标准：有独立解释价值、且值得背诵定义的概念单独成行；过于琐碎或只是引用的卡片，要么并入相邻条目，要么舍弃。

## 一、面向对象与设计原则

| 概念 | 定义 | 出处与参考 |
| --- | --- | --- |
| **SOLID 五项原则** | 面向对象设计五原则的合称：①**单一职责**——一个类只有一个引起它变化的原因；②**开闭**——对扩展开放、对修改关闭；③**里氏替换**——子类型可替换基类型而不破坏程序正确性；④**接口隔离**——客户端不应被迫依赖用不到的接口；⑤**依赖倒置**——高层与低层模块都应依赖抽象，细节依赖抽象而非相反。 | Robert C. Martin（Uncle Bob）1990 年代起系统整理；里氏替换源自 Barbara Liskov（Liskov & Wing, *A Behavioral Notion of Subtyping*, 1994）；"SOLID"缩写由 Michael Feathers 于 2004 年前后提出。Martin, *Agile Software Development*, 2002 |
| **控制反转 IoC / 依赖注入 DI** | **IoC**：程序控制流由框架主导而非应用代码——框架调用你，而不是你调用框架（"好莱坞原则"），本质是控制权外包后的主客反转。**DI** 是实现 IoC 的具体手段："依赖"即所需要的协作者，"注入"即传入——对象 A 需要的 B、C、D 由第三方容器装配好递给 A，而非 A 自己创建。 | Martin Fowler, [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html), 2004；[InversionOfControl](https://martinfowler.com/bliki/InversionOfControl.html) |
| **函数选项模式** | Go 的构造参数组织法：不传长参数列表或巨型配置结构体，而是传若干选项函数 `type Option func(*config)`，每个函数修改配置的一个方面；兼顾默认值、可选参数与向后兼容，新增选项不改函数签名。 | Rob Pike, [Self-referential functions and the design of options](https://commandcenter.blogspot.com/2014/01/self-referential-functions-and-design.html), 2014；Dave Cheney, [Functional options for friendly APIs](https://dave.cheney.net/2014/10/17/functional-options-for-friendly-apis), 2014 |
| **ORM 对象关系映射** | Object-Relational Mapping：建立"对象 ↔ 数据库表"的映射，把 SQL 操作抽象为对内存对象的增删改查。代价是**对象-关系阻抗失配**：面向对象的继承与引用图，同关系模型的表与连接天然不同构。 | 术语随 1990 年代面向对象数据库浪潮流行；Martin Fowler, *Patterns of Enterprise Application Architecture*, 2002（Active Record、Data Mapper 等经典模式） |

## 二、语言机制与运行时

| 概念 | 定义 | 出处与参考 |
| --- | --- | --- |
| **反射 Reflection** | 程序在**运行时**检视并修改自身结构（类、方法、字段、类型信息）的能力。普通代码在编译期写死一切；反射像在运行时的落脚点立一面镜子，让程序回头看见编译时的"光源"。 | Rob Pike, [The Laws of Reflection](https://go.dev/blog/laws-of-reflection), Go Blog, 2011；Java 官方文档 [Trail: The Reflection API](https://docs.oracle.com/javase/tutorial/reflect/) |
| **注解 Annotation** | 附着在代码元素（类、方法、字段、参数）上的**结构化元数据**，本身不改变程序语义，由编译器、框架或运行时读取并驱动行为（如 `@Override`、`@Autowired`）。 | [JSR 175](https://jcp.org/en/jsr/detail?id=175) 引入 Java 5（2004）；*Java Language Specification* §9.6–9.7 |
| **可变参数列表** | 允许函数接受**个数不固定**的参数。C：`...` + `stdarg.h` 宏，栈上原始字节、类型不安全；Java：`String...`，本质是数组；C++11：模板参数包 `typename... Args`，类型安全且可异型；Python：`*args` → 元组；Go：`args ...T` → 切片。 | [Go Specification: Passing arguments to ... parameters](https://go.dev/ref/spec#Passing_arguments_to_..._parameters)；ISO C99 §7.15 `<stdarg.h>` |
| **序列化与反序列化** | **序列化**：把内存对象转换为可存储、可传输的字节序列；**反序列化**为其逆过程。核心权衡四维：跨语言性、可读性（文本 vs 二进制）、体积与编解码性能、schema 演进能力。代表方案：JSON、Protocol Buffers、Java 原生序列化。 | [Protocol Buffers 官方文档](https://protobuf.dev/)；[序列化和反序列化 - 美团技术团队](https://tech.meituan.com/2015/02/26/serialization-vs-deserialization.html) |

## 三、算法与复杂度思维

| 概念 | 定义 | 出处与参考 |
| --- | --- | --- |
| **时空权衡 Space-Time Tradeoff** | 在时间与空间之间做交换的算法设计思想。典型为**以空间换时间**：对输入做预处理并存储额外信息以加速后续求解，Levitin 称之为**输入增强**——代表例子有计数排序、字符串匹配的 Horspool / Boyer-Moore 算法、散列表；反向"以时间换空间"同样成立（如嵌入式环境的压缩存储）。 | Anany Levitin, *Introduction to the Design and Analysis of Algorithms*, 3rd ed., 2011, 第 7 章 "Space and Time Trade-Offs"；Wikipedia [Space–time tradeoff](https://en.wikipedia.org/wiki/Space%E2%80%93time_tradeoff) |

## 四、数据库内核（以 PostgreSQL 为语境）

| 概念 | 定义 | 出处与参考 |
| --- | --- | --- |
| **投影 Projection** | 关系代数基本算子 **π**：从关系中挑选若干列、丢弃其余列（并去重），对应 SQL 的 `SELECT` 列表。名字借自线性代数与几何中的投影——把高维对象映射到子空间，只保留指定方向上的信息。 | E. F. Codd, *A Relational Model of Data for Large Shared Data Banks*, CACM, 1970（关系代数开山论文） |
| **查询计划树** | 优化器输出的、由计划节点组成的树状结构，是执行器的"施工图纸"。SQL 的生命周期：解析 → 查询重写 → 逻辑优化（代数等价变换：谓词下推、子查询消除）→ 物理优化（等价方案间的成本比较）→ 生成计划树 → 执行。 | PostgreSQL 官方文档 [EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)；彭智勇、彭煜玮《PostgreSQL 数据库内核分析》 |
| **计划节点 Plan Node** | 查询计划树的节点，对应一种执行算法，以迭代器（火山）模型逐层向上拉取元组。四类：**控制节点**（特殊流程，如 Result 表示 INSERT 的 VALUES）；**扫描节点**（取数据，如 SeqScan、IndexScan）；**物化节点**（共同点是缓存执行结果供上层反复取用，如 Material、Sort、Hash）；**连接节点**（HashJoin、MergeJoin、NestedLoop 三大算法）。 | 《PostgreSQL 数据库内核分析》第 6.4 节；PostgreSQL 源码 `src/backend/executor/`、`nodes/execnodes.h` |
| **DSM 动态共享内存** | Dynamic Shared Memory：PostgreSQL 为**并行查询**在执行期**动态创建**共享内存段的机制（区别于启动时一次性分配的 shared buffers），供 leader 与多个并行 worker 之间交换元组、同步状态，是 9.6 并行查询架构的地基。 | Robert Haas 主导开发：9.4 引入机制、9.6 落地并行扫描；源码 `src/backend/utils/mmgr/dsm.c`；PostgreSQL 文档 [Parallel Plans](https://www.postgresql.org/docs/current/parallel-plans.html) |
| **Hash Join 倾斜 Skew** | 哈希连接按 join key 分桶；当 key 分布不均（某些值特别热）时，对应桶及负责它的并行 worker 处理远超平均的数据量，造成**内存膨胀、分批落盘（batch spill）、并行度失效**。缓解思路：多次哈希分批落盘、识别高频值（MCV）单独处理、改用其他 join 策略。 | Thomas Munro, [Parallel Hash for PostgreSQL](https://www.enterprisedb.com/blog/parallel-hash-postgresql), 2017；PostgreSQL 文档 [Parallel Plans](https://www.postgresql.org/docs/current/parallel-plans.html) |

## 五、系统架构

| 概念 | 定义 | 出处与参考 |
| --- | --- | --- |
| **BFF Backend for Frontend** | 后端拆成众多微服务后，为**每一类前端**（Web、iOS、Android）设立专用的后端聚合层，面向该端需求裁剪，作为前端调用的统一入口；由前端团队自治，负责聚合、裁剪、适配下游微服务。争议点在"胖瘦之争"：BFF 里该放多少业务逻辑。 | Sam Newman, [Backends for Frontends](https://samnewman.io/patterns/architectural/bff/), 2015；Newman, *Building Microservices*, 2nd ed., 2021 |
| **OAuth 2.0** | 一个**授权**（authorization）框架：通过**令牌**机制，把用户对资源的有限访问权委托给第三方应用，第三方始终接触不到用户登录凭据。典型角色：资源拥有者、客户端、授权服务器、资源服务器；典型流程：授权码模式。注意：**OAuth 2.0 管授权不管认证**——"证明你是谁"要交给建立在其上的 OpenID Connect。 | IETF 2012 年发布：[RFC 6749](https://www.rfc-editor.org/rfc/rfc6749)（核心框架）、[RFC 6750](https://www.rfc-editor.org/rfc/rfc6750)（Bearer Token）、[RFC 9700](https://www.rfc-editor.org/rfc/rfc9700)（安全最佳实践） |

## 六、工程文化与实践

| 概念 | 定义 | 出处与参考 |
| --- | --- | --- |
| **测试驱动开发 TDD** | **先写测试、再写实现**的开发节奏：**Red**（写一个会失败的测试）→ **Green**（写恰好通过的最小实现）→ **Refactor**（在测试保护下清理设计）。测试不是事后验证手段，而是设计工具。 | Kent Beck 在极限编程（XP）中体系化；Beck, *Test-Driven Development: By Example*, Addison-Wesley, 2002 |
| **RTFM** | "Read The Fucking Manual"——技术社区对不看文档就提问者的经典回应。收在这里不为讽刺，而为自勉：多数"神秘问题"的答案，其实早就写在手册里。 | 源自大型机时代的黑客文化；[The Jargon File: RTFM](http://www.catb.org/jargon/html/R/RTFM.html)（Eric S. Raymond 主编） |

---

## 更新日志

- 2026-09-15：首版，整合 19 篇概念卡片，归类为六章；空壳卡片补齐定义，引用型卡片补写正文，重复概念并入相邻条目。
- 2026-09-15：二版，改为"每章一张三列表格"的词典版式，便于检索与追加。
