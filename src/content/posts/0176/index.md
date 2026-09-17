---
lang: "zh-CN"
pubDatetime: 2026-09-14T00:57:48+08:00
modDatetime: 2026-09-17T12:26:03+08:00
timezone: "Asia/Shanghai"
title: "重置直觉（一）——计算机系统的数字直觉"
area: "software-engineering"
featured: false
draft: false
tags:
  - "重置直觉"
  - "性能分析"
  - "计算机系统"
  - "数据库"
  - "分布式系统"
description: "用官方规格、原始论文与权威机构资料建立数字直觉：计算、内存、存储、网络、数据库、消息系统、一致性与容量规划，并逐项标明数字的适用条件。"
---
做系统设计时，我希望脑子里有几把尺子：一次计算有多快，一次数据搬运有多贵，一次跨地域通信要等多久，以及一个看似不起眼的请求量会积累出多大的存储需求。

这些尺子必须能追溯出处。本文只使用厂商与项目官方资料、标准文档、原始论文及权威机构出版物；厂商测试仍然只是特定条件下的测试，并不自动成为生产承诺。

**资料核对日期：2026-09-13（UTC）。** 硬件选取有明确规格的代表型号，软件实验保留原始版本与年份。本文不是最新产品性能排行榜。

## 1. 先认清数字的身份

下文标记「规格」的数字是产品标称值；「实测」是指定实验的结果；「示例」是官方文档展示的输出，但配置可能披露不完整；「推算」是本文根据已给出的公式和明确假设计算的结果。推算不代表实测。

| 概念 | 应建立的直觉 | 来源或口径 |
| --- | --- | --- |
| 时间尺度 | 1 ms = 1,000 μs = 1,000,000 ns | SI 前缀换算，[NIST][si] |
| 十进制容量 | 1 MB = 1,000,000 B；1 GB = 1,000,000,000 B | [NIST][units] |
| 二进制容量 | 1 MiB = 1,048,576 B；1 GiB = 1,073,741,824 B | [NIST][units] |
| 位与字节 | 本文按 1 B = 8 bit；Gb/s 与 GB/s 相差 8 倍 | [NIST][units]；换算不扣协议开销 |
| 吞吐量 | QPS 是查询数/s，TPS 是事务数/s，IOPS 是 I/O 次数/s，messages/s 是消息数/s | 计数对象必须保留；一个事务可能有多条 SQL，参见 [pgbench][pgbench] |

尤其要把**延迟**与**吞吐量**分开。很多请求并行完成时，每秒完成的请求数可以很高，而单个请求仍然很慢。把 IOPS 取倒数就当作单次 I/O 延迟，是最容易犯的错误之一。

### 1.1 先从心跳、眨眼和屏幕动画找感觉

先不用记纳秒。我们用生活里的几件事，把毫秒接到能感受到的时间上。下面的倍数都以 **1 ms 为基准**，由时间相除得到，不是额外的测量结论。

| 生活参照 | 时间间隔 | 是 1 ms 的多少倍 | 依据与边界 |
| --- | --- | --- | --- |
| 屏幕动画以 60 帧/s 均匀更新，相邻两帧之间 | 约 16.7 ms | 约 16.7 倍 | `1000 / 60`；[MDN 动画性能文档][frames]也给出这一帧预算；不表示所有屏幕都固定在 60 帧/s |
| 静息时两次心跳之间的平均间隔 | 约 600–1,000 ms，即 0.6–1 s | 约 600–1,000 倍 | [美国心脏协会][heartbeat]给出安静坐卧、感觉良好时的正常静息心率范围 60–100 次/分钟；间隔按 `60 / 心率` 秒推算，不代表每个人、每一拍都如此 |
| 两次眨眼之间的平均间隔 | 约 3,000–4,000 ms，即 3–4 s | 约 3,000–4,000 倍 | [美国国立眼科研究所（NIH/NEI）][blink]给出平均每分钟约 15–20 次眨眼；按 `60 / 次数` 推算，这是眨眼之间的间隔，**不是一次眨眼的持续时间** |

于是，**100 ms 相当于 60 帧/s 动画的 6 个帧间隔**；1 ms 只占一个这样的帧间隔的约 6%。这里比较的是时间长度，不是说一次异步网络请求会让画面丢掉 6 帧，也不是人体感知阈值的结论。

### 1.2 再把微秒放大到生活尺度

做一个纯粹的比例模型：**假如把 1 μs 放大成 1 秒**，所有时间统一放大 100 万倍，会发生什么？这些是选定刻度的单位换算，不是某款硬件的实测延迟；时间前缀沿用 [NIST][si]。

| 原来的时间 | 是 1 μs 的多少倍 | 放大后相当于 |
| --- | --- | --- |
| 1 ns | 0.001 倍，即千分之一 | 1 ms |
| 1 μs | 1 倍 | 1 秒 |
| 1 ms | 1,000 倍 | 16 分 40 秒 |
| 100 ms | 100,000 倍 | 27 小时 46 分 40 秒 |
| 1 s | 1,000,000 倍 | 约 11.57 天，按每天 24 小时 |

同样叫“一次等待”，微秒与百毫秒之间却隔着 **10 万倍**。后文看到本机通信、磁盘和跨地域网络时，可以不断回到这把尺子。倍数统一写成“A 是 B 的多少倍”，避免“快几倍”究竟指耗时还是吞吐的歧义。

科学计数法可以让比例更显眼：`1 μs = 10⁻⁶ s`，`1 ms = 10⁻³ s`，`100 ms = 10⁻¹ s`。统一成秒以后，指数相差 3，就相差 `10³ = 1,000` 倍；指数相差 5，就相差 `10⁵ = 100,000` 倍。若前面的系数不同，也要一起相除，例如 `3 × 10⁻³ / (2 × 10⁻⁶) = 1.5 × 10³`，不能只看指数。

后文的映射都遵守一个规则：**时间放大 k 倍，次数和字节数不变，单位映射时间内的速率就缩为原来的 1/k**。不同示例可能选不同基准，每次都会重新声明；不要跨表混用。

## 2. CPU 与内存：周期、并行度和搬运能力

| 对象 | 数字 | 条件与含义 | 出处 |
| --- | --- | --- | --- |
| Intel Core i9-14900K | 最高睿频 6.00 GHz | 规格；经 Thermal Velocity Boost 达成，不是全核心持续运行频率 | [Intel 产品规格][intel] |
| 6 GHz 的一个时钟周期 | 约 0.167 ns | 推算：1 / (6 × 10⁹) 秒；不是一条指令的固定耗时 | [Intel 频率][intel] + 倒数换算 |
| AMD EPYC 9754 | 128 核、256 线程；基础频率 2.25 GHz | 规格；硬件线程数不是独立物理核心数 | [AMD 产品规格][amd] |
| i9-14900K 内存带宽 | 最高 89.6 GB/s | 规格；最大内存带宽，不是一个线程必然达到的带宽 | [Intel][intel] |
| EPYC 9754 内存接口 | 12 通道、最高 DDR5-4800 MT/s | 数据表为 1DPC（每通道一条内存）条件；MT/s 是传输率 | [AMD][amd]、[数据表][amd-sheet] |
| EPYC 9754 理论内存带宽 | 460.8 GB/s | 规格表所列每插槽带宽；需要相应内存配置 | [AMD 9004 数据表][amd-sheet] |

频率告诉我们时间刻度，不能直接换算成任意程序的“每秒运算次数”。程序还有指令依赖、分支、缓存未命中、访存与同步等待；向量运算和标量运算的计数方式也不同。

缓存也需要绑定架构。Intel《Optimization Reference Manual》248966-050US（2024 年 4 月）§2.7.3、表 2-16，列出 **Skylake Client** 的下列参数：[官方手册，印刷页 2-36 / PDF 第 80 页][intel-manual]。

| 缓存层级 | 最快延迟 | 相对 L1 的延迟倍数（推算） | 缓存行大小 |
| --- | --- | --- | --- |
| L1 Data | 4 个周期 | 1 倍 | 64 B |
| L2 | 12 个周期 | 3 倍 | 64 B |
| 共享 L3 | 44 个周期 | 11 倍 | 64 B |

原表标的是 Fastest Latency，脚注明确软件可见延迟受访问模式等因素影响。它不是全部 CPU 的通用值，也不描述前面 i9-14900K 或 EPYC 的缓存延迟。DRAM 访问还受内存时序、NUMA 位置、控制器与负载影响，不能由峰值带宽的倒数得到。

DRAM 本身可以从具体模块的时序建立直觉。Kingston **KSM48R40BS8-16HA，DDR5-4800 CL40** 的数据表列出以下参数：[官方模块数据表，第 1 页][dram]。

| DRAM 时序参数 | 规格值 | 含义 |
| --- | --- | --- |
| CL(IDD) | 40 个周期 | 模块表中的 CAS 时序参数；不是 CPU 从内存读取数据的完整延迟 |
| tRPmin | 16 ns | 最小行预充电时间 |
| tRFCmin | 295 ns | 刷新至激活/刷新命令的最小时间间隔；不是每次读都增加这段等待 |

这些时序不能简单相加成所有内存访问的固定耗时。行是否已打开、是否需要刷新、请求是否排队，都会影响实际路径。

比如，假设 CPU 固定运行在 3 GHz，一个 1 ms 的等待对应 **300 万个时钟周期**。这是 `3 × 10⁹ × 10⁻³` 的单位推算，不是某款 CPU 的测量值。它提示我们：当瓶颈在毫秒级 I/O 时，优化几个算术操作往往还没有碰到主要矛盾。

把这个假设继续放大：**让 3 GHz CPU 的一个周期变成 1 秒**，时间放大 `3 × 10⁹` 倍。原来的 `1 ms = 10⁻³ s` 就对应 `3 × 10⁶ s`，约 **34.72 天**（每天按 86,400 秒）。在这个时钟里，“等一次毫秒级操作”相当于等一个多月；这只是周期与等待时间的比例，不意味着 CPU 在等待期间无法调度其他工作。

## 3. GPU：先看精度，再看算力

以下均取自 NVIDIA 同一张 **H100 SXM** 官方规格表，避免混用 SXM、NVL 与不同精度。[NVIDIA H100][h100]

| 指标 | 官方数字 | 阅读条件 |
| --- | --- | --- |
| FP32 | 67 TFLOPS | 标称浮点吞吐量；不是 LLM tokens/s |
| FP64 | 34 TFLOPS | 普通 FP64 路径 |
| FP64 Tensor Core | 67 TFLOPS | Tensor Core 路径，不能与上一行混为一谈 |
| BFLOAT16 Tensor Core | 1,979 TFLOPS | 官方星号明确：**包含稀疏性条件** |
| FP8 Tensor Core | 3,958 TFLOPS | 同样包含稀疏性条件，且精度不同 |
| GPU 显存 | 80 GB | 容量规格 |
| 显存带宽 | 3.35 TB/s | 标称带宽，不是应用保证值 |
| 最大 TDP | 最高 700 W，可配置 | 热设计功耗指标，不是固定实测耗电 |

这张表的每行来源都是上述 Product Specifications。记住 GPU 的一个大数字时，应把型号、计算路径、精度和稀疏性一起记住。

把 FP32 写成科学计数法，就是 `67 TFLOPS = 6.7 × 10¹³ FLOP/s`。**假设连续达到该标称吞吐，并把原来的 1 秒放大为 10¹² 秒**，映射后的速率就是每秒 67 次浮点运算。这里保留的是运算总数与时间的比例，不是说一条 GPU 指令需要多久，也不是拿 GPU 与人类心算作性能比较。

还可以做一个明确的下界推算：假设真的以 3.35 TB/s 连续读取 80 GB，纯读一遍需要约 **23.9 ms**，计算为 `80 / 3350` 秒。这没有计算内核工作、额外读写和调度开销，不能作为模型推理时间。[输入来自 H100 规格][h100]

## 4. 存储：顺序带宽、随机 IOPS、落盘延迟是三把尺子

| 对象 | 数字 | 必须保留的条件 | 出处 |
| --- | --- | --- | --- |
| Seagate Exos X18 HDD | 7,200 RPM；平均旋转等待约 4.16 ms | 规格；旋转等待不包含寻道等完整访问成本 | [Exos X18 数据表][hdd] |
| Exos X18 顺序传输 | 外圈最高 270 MB/s（258 MiB/s） | 规格；OD 表示外圈，不能当全盘恒定速度 | [同一数据表][hdd] |
| Exos X18 随机读 | 170 IOPS | 数据表口径：4K、QD16、WCD；不是 QD1 延迟 | [同一数据表][hdd] |
| Samsung 990 PRO | 顺序读最高 7,450 MB/s；写最高 6,900 MB/s | 2022 年发布规格；IOmeter 1.1.0；Ryzen 7 5800X、DDR4-3600 16 GB × 2（超频）、ASRock X570 Taichi、Windows 10 Pro 64 位 | [Samsung 官方发布与脚注][ssd] |
| 同份 990 PRO 随机规格 | 读最高 140 万 IOPS；写最高 155 万 IOPS | QD32；该发布表口径，不能套用到任意容量和所有后续版本 | [Samsung][ssd] |
| Amazon EBS gp3 基线 | 3,000 IOPS、125 MiB/s | 规格；基线并非产品上限，IOPS 与带宽分别受约束 | [AWS gp3 文档][gp3] |
| EBS gp3 延迟 | 个位数毫秒 | 官方产品描述；不是 P99 保证 | [AWS][gp3] |
| EBS io2 Block Express | 16 KiB I/O 的平均延迟设计目标低于 500 μs | 挂载到 Nitro 实例时的设计目标；保留 I/O 大小与“平均”口径 | [AWS io2 文档][io2] |

其中，`60 / 7200 / 2 ≈ 0.004167` 秒解释了 HDD 半圈等待的尺度。实际随机读还要考虑磁头移动、排队和控制器处理。

存储计算可以落到一个具体例子：假设每次请求正好对应一次 **4 KiB** 的 EBS I/O，3,000 IOPS 对应约 **11.72 MiB/s**。若正好对应一次 **16 KiB** I/O，则约为 **46.88 MiB/s**。这两项是 `IOPS × I/O 大小` 的推算，都低于 gp3 的 125 MiB/s 基线带宽；小块随机访问完全可能先用尽 IOPS。[gp3 输入][gp3]、[单位换算][units]

数据库的一次事务可能产生多个 I/O，也可能因缓存与批量落盘减少实际 I/O。因此，上表不能直接换算成数据库 TPS。

### 4.1 把一次 query 或 I/O 放大成 1 秒

下面不为任何产品编造实测成绩，而是选择几个**假设的单次操作耗时**练习读数。把耗时 **100 μs 的基准操作定义为映射后的 1 秒**，时间统一放大 `10⁴` 倍；这与 1.2 的 `10⁶` 倍是两把不同的尺子。

| 假设的单次耗时 | 统一写成秒 | 是基准耗时的多少倍 | 映射后要等多久 |
| --- | --- | --- | --- |
| 100 μs | 10⁻⁴ s | 1 倍 | 1 秒 |
| 1 ms | 10⁻³ s | 10¹ 倍 | 10 秒 |
| 10 ms | 10⁻² s | 10² 倍 | 1 分 40 秒 |
| 100 ms | 10⁻¹ s | 10³ 倍 | 16 分 40 秒 |
| 1 s | 10⁰ s | 10⁴ 倍 | 2 小时 46 分 40 秒 |
| 10 s | 10¹ s | 10⁵ 倍 | 1 天 3 小时 46 分 40 秒 |

每行都按 `映射时间 = 原始时间 × 10⁴` 推算，[单位依据][si]。如果基准操作像等一秒，那么耗时 100 ms 的操作就像等十几分钟，耗时 10 s 的操作就像等了一天多。这里仅比较完成一次要多久；不能用这张表判断并发系统每秒完成多少次。

## 5. 网络：带宽决定搬运，RTT 决定等待

### 5.1 链路速率的算术直觉

下面的 1、10、100 Gb/s 是选定的链路速率输入，**只计算序列化时间**，不含协议、拥塞、慢启动与磁盘成本。按前文 8 bit/B 和十进制单位换算。[单位依据][units]

| 假设链路速率 | 不扣开销的字节速率 | 传输 1 GB 的理论最短序列化时间 | 相对 1 Gb/s（推算） |
| --- | --- | --- | --- |
| 1 Gb/s | 125 MB/s | 8 s | 速率 1 倍，耗时 1 倍 |
| 10 Gb/s | 1.25 GB/s | 0.8 s | 速率 10 倍，耗时 1/10 |
| 100 Gb/s | 12.5 GB/s | 0.08 s | 速率 100 倍，耗时 1/100 |

### 5.2 跨地域 RTT：使用实际地域对

先放两个本机与局域通信的参考尺度。Redis 官方延迟文档给出的是经验性描述，未附完整测试平台与分位数，证据强度低于下面有统计窗口的 Azure 表：[Redis 延迟诊断，Latency induced by network and communication][redis-latency]。

| 场景 | 官方参考值 | 限定 |
| --- | --- | --- |
| 1 Gbit/s 网络通信 | 典型约 200 μs | 依赖网络与系统硬件；不能仅凭“千兆”推定延迟，也不把该值强行标成单程或 P50 RTT |
| Unix domain socket | 可低至 30 μs | 本机通信；不是跨主机网络性能 |

下面取自 **Azure 官方网络统计，2026-07-30 数据集、截至该日的 30 天窗口，P50 RTT，单位 ms**。箭头表示探测发起地域与目标地域；每个数字本身仍是往返时间，不能把箭头理解成单程延迟。它们不代表公网用户、任意云厂商或 P99。[Microsoft 测量说明与表格][azure]

| 源地域 → 目标地域 | P50 RTT | 是首行 8 ms 的多少倍（推算） | 相当于 60 帧/s 的几个帧间隔（推算） |
| --- | --- | --- | --- |
| East US → East US 2 | 8 ms | 1 倍 | 0.48 个 |
| East US → West US | 69 ms | 约 8.63 倍 | 4.14 个 |
| Japan East → West US | 107 ms | 约 13.38 倍 | 6.42 个 |
| South Africa North → West US | 273 ms | 约 34.13 倍 | 16.38 个 |

后两列分别是 `RTT / 8 ms` 和 `RTT × 60 / 1000`。它们比较该数据集的时间尺度，不意味着所有请求都恰好耗时如此，也不意味着请求期间屏幕停止刷新。

沿用 4.1 的 **100 μs → 1 秒**时钟，这四个 RTT 从小到大分别变成 **1 分 20 秒、11 分 30 秒、17 分 50 秒、45 分 30 秒**。例如 `273 ms = 2.73 × 10⁻¹ s`，与基准 `10⁻⁴ s` 相除得到 `2.73 × 10³` 倍，即映射后的 2,730 秒。就像基准操作只需等一秒，而这个地域对的一次往返要等四十五分半；比较的是前述 P50 统计值，不是每次请求的保证。

串行通信会放大这笔成本。**假设**一条长连接上，每次操作只允许一个在途请求，端到端平均耗时固定为 100 ms，忽略客户端思考时间，则最多约 **10 次/s**；这是 `1 / 0.1` 的推算，不是服务器的处理上限。Redis 官方也特别提醒，串行同步压测可能主要测到网络往返和客户端成本。[Redis benchmark][redis]

### 5.3 协议与在途数据

| 项目 | 数字直觉 | 条件与出处 |
| --- | --- | --- |
| TLS 1.3 完整握手 | 常规流程为 1 RTT 级握手交互 | 不含 TCP 建连、DNS；HelloRetryRequest 会增加交互，参见 [RFC 8446 §2][tls] |
| TLS 1.3 0-RTT 数据 | 恢复连接时可发送 early data | 并非所有请求都能安全使用，存在重放风险；[RFC 8446 §2.3、§8][tls] |
| 10 Gb/s、100 ms RTT | 带宽时延积为 125 MB | 推算：`10×10⁹ × 0.1 / 8`；表示填满这条路径所需的在途数据尺度，[RFC 7323 §1.1][tcp] |

最后一行解释了为什么“带宽很大”仍然可能传不快：还要有足够的发送窗口与并发数据，才能让长距离链路持续工作。

## 6. 数据库、中间件与对象存储：带条件的吞吐量

这部分的数字最容易被误用。以下案例用于理解**操作类型、并发和确认语义如何影响吞吐量**，不是产品排名。每个系统应使用自己的生产负载重新测量。

### 6.1 Redis：官方示例也要区分配置完整程度

| 场景 | 文档中的结果 | 条件与证据等级 |
| --- | --- | --- |
| 随机 key 的 SET | 72,144.87 requests/s | 示例：100 万请求、10 万 key 空间、50 客户端、3 B value、keep-alive；未披露该例完整硬件与版本 |
| 流水线 SET | 1,536,098.25 requests/s | 示例：MacBook Air 11 英寸、100 万请求、`-P 16`；具体机型年份、CPU、Redis 版本及持久化配置未完整披露 |
| 同一流水线示例 GET | 1,811,594.25 requests/s | 同上；不能与上一种随机 key 测试直接计算流水线加速比 |

来源：[Redis 官方 benchmark 文档的 key space 与 pipelining 小节][redis]。这几行能够展示数量级，却不足以作为采购依据；持久化设置不完整的 SET 结果不能当作同步落盘吞吐量。

### 6.2 MySQL：精确到工作负载的历史实验

| 场景 | 结果 | 完整阅读方式 |
| --- | --- | --- |
| MySQL 8.0.15 内存主键点查 | 128 客户端时约 180 万 TPS（POINT_SELECT 负载） | 2019 年官方工程实验；2 × Xeon Platinum 8168，每插槽 24 核、2.70 GHz，原文记作 48 CPU cores；客户端和服务端共用这些核心；数据在 buffer pool |
| 同一实验延迟 | 128 客户端时约 70 μs；512 时约 300 μs | 官方图文实验中的查询响应时间口径；不能写成 P99；增加连接后吞吐并未继续线性增加 |

来源：[MySQL 官方工程文章，Long Lived Connections、图 6–7][mysql]。原文使用 TPS 描述这个点查测试；这里保留 POINT_SELECT，避免让人误以为是每秒完成同样数量的复杂读写事务。

### 6.3 PostgreSQL：有出处，也要承认出处不够做容量规划

| 官方材料 | 数字 | 可以与不可以得出的结论 |
| --- | --- | --- |
| PostgreSQL 9.2 发布材料（2012） | 读查询最高 350,000/s；数据写入最高 14,000/s | **历史官方发布宣称**；该发布页未给出完整实验配置，读写不是同一操作口径，不能直接相除或套用到当前版本 |
| pgbench 工具 | 默认事务包含多条 SQL | 先定义事务再读 TPS；文档里的示范输出不是产品性能保证，也不是正式 TPC-B 成绩 |

出处：[PostgreSQL 9.2 Press Kit][pg92]、[PostgreSQL 18 pgbench][pgbench]。

这也是筛选资料的一条边界：官方来源可以证明“项目发布过这个数字”，却未必能证明“你的机器也能达到这个数字”。当前生产 PostgreSQL 的可用 TPS 应由具体 SQL、索引、数据量、缓存命中、事务冲突与持久化要求共同定义。

### 6.4 etcd：同一套配置下，并发改变吞吐与延迟

官方基线使用 **etcd 3.2.0、Go 1.8.3、Ubuntu 17.04**。GCE 集群为 3 台成员机器，每台 8 vCPU、16 GB 内存、50 GB SSD；压测机为 16 vCPU、30 GB 内存、50 GB SSD。key 为 8 B，value 为 256 B。注意：文档位于 v3.5 路径，**实验版本仍是 3.2.0**。[etcd Performance][etcd]

| 操作 | 连接 / 客户端 | 平均 QPS | 文档所列平均延迟 |
| --- | --- | --- | --- |
| 向 leader 写入；1 万次 | 1 / 1 | 583 | 1.6 ms |
| 向 leader 写入；10 万次 | 100 / 1,000 | 44,341 | 22 ms |
| 线性一致读；10 万次 | 100 / 1,000 | 141,578 | 5.5 ms |
| Serializable 读；10 万次 | 100 / 1,000 | 185,758 | 2.2 ms |

etcd 的 Serializable 读可以由单个成员响应，可能返回旧数据；不能因为更高 QPS 就把它当成同等语义的线性一致读。[同一文档][etcd]

### 6.5 Kafka：必须说明是否等待确认

| 原始论文的生产者实验 | 平均吞吐 | 实验条件 |
| --- | --- | --- |
| batch size = 1 | 50,000 messages/s | 2011 年论文；单 producer 与单 broker；每条 200 B，共 1,000 万条 |
| batch size = 50 | 400,000 messages/s | 同一硬件与工作负载，改变批量大小 |

把这两行相除：批量大小是原来的 **50 倍**，吞吐量是原来的 **8 倍**（`400,000 / 50,000`），不是 50 倍。这是该实验的结果比值，不是任意批处理都能获得的加速比。

两台 Linux 机器均为 8 个 2 GHz 核心、16 GB 内存、6 块磁盘组成 RAID 10，网络为 1 Gb/s。**该实验的 broker 异步刷盘，Kafka 生产者不等待 broker 确认**。论文明确说明，这不能保证每条发出的消息都被 broker 收到；batch=50 时已接近打满该实验的网络链路。因此不能将其当作现代多副本、`acks=all` 的持久化写入成绩。出处：[Kreps、Narkhede、Rao，NetDB 2011，§5][kafka]。

### 6.6 S3：请求率和总字节数也要分开

| 对象 | 官方数字 | 条件与含义 |
| --- | --- | --- |
| 每个 partitioned S3 prefix | 至少 3,500 次 PUT/COPY/POST/DELETE/s | 官方性能指南给出的可达请求率；不是整个 bucket 的硬上限 |
| 同口径读取 | 至少 5,500 次 GET/HEAD/s | 可以通过多个 prefix 并行扩展；扩展过程并非瞬时 |

出处：[AWS S3 性能设计指南][s3-perf]。对象大小还决定总带宽；高请求率与大对象吞吐不能混为同一个指标。

### 6.7 把 QPS 换成“映射后的一天完成多少次”

继续沿用 **100 μs → 1 秒、时间放大 10⁴ 倍**的时钟。这次看的是整个系统的完成速率，而不是单个请求的耗时。下面的 QPS 均为选定的算术输入，**不是 Redis、MySQL 或 PostgreSQL 的实测排名**；假设系统在所讨论的窗口内稳定达到该完成速率。

| 假设的原始完成速率 | 映射后的完成速率：QPS / 10⁴ | 映射后 1 天完成的查询数 |
| --- | --- | --- |
| 100 QPS = 10² 次/s | 10⁻² 次/s，即平均每 100 秒完成 1 次 | 864 次 = 8.64 × 10² 次 |
| 10,000 QPS = 10⁴ 次/s | 10⁰ 次/s，即平均每秒完成 1 次 | 86,400 次 = 8.64 × 10⁴ 次 |
| 1,000,000 QPS = 10⁶ 次/s | 10² 次/s，即平均每秒完成 100 次 | 8,640,000 次 = 8.64 × 10⁶ 次 |

计算式为 `一天的完成数 = QPS / 10⁴ × 86,400`。**映射后的一天只对应原来的 8.64 秒**，因此这一列不是现实世界每天的业务量。它让我们看清：同一个放慢了的世界里，有的系统一天完成几百次，有的完成几百万次，比例仍然是 `10⁴` 倍。

这里“平均每秒完成 1 次”**不代表每个查询只花 1 秒**。完成可能来自许多并发请求，也可能成批发生。举例来说，原系统若平均每秒完成 `10⁴` 次查询、每次平均停留 `20 ms = 2 × 10⁻² s`，映射后就是平均每秒完成 1 次、每次平均停留 **200 秒，即 3 分 20 秒**。在第 9 节 Little 定律的稳态条件下，两边的平均在途请求数都为 **200**：`10⁴ × 0.02 = 1 × 200`。时间和速率一起换尺子，请求数没有凭空改变。[Little 定律来源][little]

如果读的是 IOPS，也可以用同样的算式换成“一天完成多少次 I/O”，但计数对象始终是 I/O，不能偷换成查询或事务。

## 7. 页面、日志和数据保留：小单位如何积成大容量

| 对象 | 数字 | 来源或推算条件 |
| --- | --- | --- |
| PostgreSQL 通常的数据页 | 8 KiB | 官方写作 8 kB，按其数据库块大小语义换成 KiB；可在编译时改变，[页面布局][pg-page] |
| PostgreSQL 页头 | 24 B | 常规页布局，[同一文档][pg-page] |
| PostgreSQL 行定位项 | 每项 4 B | ItemIdData；不包含行内容，[同一文档][pg-page] |
| PostgreSQL 堆行固定头 | 大多数机器上 23 B | 不含对齐、NULL bitmap 等，[同一文档][pg-page] |
| PostgreSQL 默认 WAL segment | 16 MiB | 可在 initdb 时改变；一个 segment 不等于一个事务，[WAL Internals][pg-wal] |
| 假设每秒 10 万条、每条 1 KB | 每日 8.64 TB 原始负载 | 推算：`100,000 × 1,000 × 86,400` B；按每日 24 小时持续，未计压缩与元数据 |
| 上述负载保留 7 天 | 60.48 TB 原始负载 | 推算：`8.64 × 7`；未计索引、日志、临时空间与冗余副本 |

后两行只有容量算术，没有假定某款消息系统能达到这个写入速度；单位沿用 [NIST 十进制口径][units]。反过来看，给系统增加一个长期保留的事件流，容量成本可能比消息处理逻辑本身更值得先算。

用科学计数法再算一次：`10⁵ 条/s × 10³ B/条 = 10⁸ B/s`，一天乘以 `8.64 × 10⁴ s`，就是 `8.64 × 10¹² B = 8.64 TB`。若把这条流的**时间放大 10⁵ 倍**，它就变成“每秒只记录一条 1 KB 数据”，看起来很悠闲；但原来一天的 `8.64 × 10⁹` 条记录，在这个时钟下要写 **100,000 天**，约 **274 年**（按每年 365 天）。数据总量仍是 8.64 TB，变化的只是时间刻度。这是容量积累的类比，不是设备可持续运行年限的预测。

## 8. 一致性与可用性：副本不是免费的

| 场景 | 数字 | 条件与出处 |
| --- | --- | --- |
| Raft 3 节点集群 | 多数派 2；可容忍 1 个节点不可用仍有机会推进 | 剩余节点须能通信，符合崩溃故障模型；[Raft 论文 §2、§5][raft] |
| Raft 5 节点集群 | 多数派 3；可容忍 2 个节点不可用仍有机会推进 | 同上；不包括拜占庭故障 |
| Raft 论文选举超时示例 | 随机 150–300 ms | 论文 §5.2 的例子，不是所有实现的推荐默认值 |
| 时间可用性 99.9% | 30 天内允许约 43.2 分钟不可用 | 无计划停机豁免的时间口径，[Google SRE][availability] |
| 时间可用性 99.99% | 同口径约 4.32 分钟 | [Google SRE][availability] |
| 时间可用性 99.999% | 同口径约 25.9 秒 | [Google SRE][availability] |
| S3 Standard 年度耐久性设计目标 | 99.999999999% | 衡量数据保存，不等于服务可用性，[AWS][durability] |
| S3 Standard 年度可用性设计目标 | 99.99% | 与上一行是不同指标；设计目标也不等于 SLA 赔付条款，[AWS][durability] |

副本数量能告诉我们法定多数，但不能独立决定写延迟。etcd 官方文档强调，提交性能受成员之间网络往返和持久化 I/O 约束；批量处理能提高吞吐，却不会让这些成本消失。[etcd 性能说明][etcd]

可用性也要看对比较对象：在相同统计窗口和时间口径下，从 99.9% 到 99.99%，**允许的不可用时间缩至原来的 1/10**；再到 99.999%，又缩至 1/10，总共缩至 99.9% 时的 1/100。它不是“服务速度提升 10 倍”，而是故障时间预算收紧了。

把允许不可用的比例写出来，差距更直接：分别为 `10⁻³`、`10⁻⁴`、`10⁻⁵`。若把第一档预算 43.2 分钟统一映射成 **1 小时**，后两档就只剩 **6 分钟、36 秒**。这是同一时间窗口内预算的比例映射，按未取整的比例计算；不是增加了实际可用的停机时间。

## 9. 把数字连起来：并发、尾延迟和能耗

### 9.1 Little 定律

John D. C. Little 的原始论文给出稳态排队关系 **L = λW**：系统内平均请求数 = 平均到达率 × 平均停留时间。使用时需要统一系统边界，并满足相应稳定性条件。[Little，Operations Research，1961][little]

| 明确假设的场景 | 推算结果 | 工程含义 |
| --- | --- | --- |
| 稳定处理 10,000 请求/s，平均停留 20 ms | 平均在途 200 个请求 | `10,000 × 0.020`；不是“必须建 200 个数据库连接” |
| 相同吞吐，平均停留升至 200 ms | 平均在途 2,000 个请求 | 停留时间是原来的 10 倍，平均在途请求数也为 10 倍；同样的流量可以占用更多缓冲区和上下文 |

这是关系式，不是通过强行增加并发就必然提高吞吐的保证。

### 9.2 一次请求等待很多下游时，尾部会被放大

《The Tail at Scale》讨论了大规模扇出服务的尾延迟问题。[Dean 与 Barroso，CACM 2013][tail] 用一个可复算的独立事件模型感受其尺度：

| 假设 | 至少一个下游超时的概率 | 推算 |
| --- | --- | --- |
| 每个下游独立地有 1% 概率超过指定阈值；调用 1 个 | 1% | `1 − 0.99` |
| 同样条件；并行调用 10 个且全部等待 | 约 9.56% | `1 − 0.99^10` |
| 同样条件；并行调用 100 个且全部等待 | 约 63.4% | `1 − 0.99^100` |

这是独立性假设下的概率计算，不是论文对所有系统给出的实测值。共享网络、同一存储、集中式暂停都会引入相关性，实际风险需要观测。

### 9.3 功率与电量

| 场景 | 数字 | 条件与出处 |
| --- | --- | --- |
| 假设一张 GPU 持续消耗 700 W，运行 24 小时 | 16.8 kWh | `0.7 kW × 24 h`；以 H100 SXM 最大 TDP 作假设输入，不表示真实功耗恒等于 TDP，[NVIDIA][h100] |
| 假设 8 张均以此功率运行 24 小时 | 134.4 kWh | `16.8 × 8`；只算 GPU，未计 CPU、网络、电源损耗和制冷 |

## 10. 把这篇文章当作自己的测量起点

遇到一个性能数字，我会先问：数的是什么，在哪个系统边界测量，使用了什么负载，最后确认了什么。读请求、事务提交、消息发送成功、持久化完成，各有自己的成本。

真正用于上线的测试记录至少应该保留：硬件与版本、数据量及大小分布、读写比例、并发、批量、缓存状态、副本与确认策略，以及吞吐量、平均延迟、P95/P99 和错误率。可以从本文的数量级建立假设，再用自己的工作负载修正它。

## 来源索引

以下链接均指向官方机构、产品或项目资料、标准正文或原始论文。引用位置已放在对应表格旁；动态文档可能更新，应同时保留本文写明的版本、型号与数据日期。

- [NIST：SI 前缀][si]；[二进制与十进制前缀][units]。
- [Intel：i9-14900K 规格][intel]；[AMD：EPYC 9754 规格][amd]、[EPYC 9004 数据表][amd-sheet]。
- [Intel：Optimization Reference Manual，248966-050US，表 2-16][intel-manual]。
- [Kingston：KSM48R40BS8-16HA 模块数据表][dram]。
- [NVIDIA：H100 Product Specifications][h100]。
- [Seagate：Exos X18 数据表，DS2045-3-2102GB][hdd]；[Samsung：990 PRO 官方发布，2022-08-25][ssd]。
- [AWS：gp3][gp3]、[io2 Block Express][io2]、[S3 性能设计指南][s3-perf]、[S3 耐久性与可用性][durability]。
- [Microsoft：Azure 地域 RTT 统计][azure]；[RFC 8446：TLS 1.3][tls]；[RFC 7323：TCP 高性能扩展][tcp]。
- [Redis benchmark][redis]、[延迟诊断][redis-latency]；[MySQL Connection Handling and Scaling，2019-03-19][mysql]。
- [PostgreSQL 9.2 发布资料][pg92]；[PostgreSQL 18：pgbench][pgbench]、[页面布局][pg-page]、[WAL Internals][pg-wal]。
- [etcd：Performance，表中实验版本 3.2.0][etcd]。
- [Kreps 等：Kafka: a Distributed Messaging System for Log Processing，NetDB 2011，§5][kafka]；由 [Apache Kafka 论文目录](https://kafka.apache.org/community/books_and_papers/)指向该原文。
- [Ongaro 与 Ousterhout：In Search of an Understandable Consensus Algorithm，2014][raft]。
- [Google SRE：Availability Table][availability]。
- [Little：A Proof for the Queuing Formula: L = λW，Operations Research 9(3)，383–387，1961][little]。
- [Dean 与 Barroso：The Tail at Scale，CACM 56(2)，74–80，2013][tail]。

[si]: https://www.nist.gov/pml/special-publication-330/sp-330-section-3
[frames]: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate
[heartbeat]: https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse
[blink]: https://www.nei.nih.gov/eye-health-information/healthy-vision/nei-for-kids/visual-system
[units]: https://physics.nist.gov/cuu/Units/binary.html
[intel]: https://www.intel.com/content/www/us/en/products/sku/236773/intel-core-i9-processor-14900k-36m-cache-up-to-6-00-ghz/specifications.html
[intel-manual]: https://cdrdv2-public.intel.com/821612/248966-Optimization-Reference-Manual-V1-050.pdf
[dram]: https://www.kingston.com/datasheets/KSM48R40BS8-16HA.pdf
[amd]: https://www.amd.com/en/products/processors/server/epyc/4th-generation-9004-and-8004-series/amd-epyc-9754.html
[amd-sheet]: https://www.amd.com/content/dam/amd/en/documents/products/epyc/epyc-9004-series-processors-data-sheet.pdf
[h100]: https://www.nvidia.com/en-us/data-center/h100/
[hdd]: https://www.seagate.com/files/www-content/datasheets/pdfs/exos-x18-channel-DS2045-3-2102GB-en_EM.pdf
[ssd]: https://news.samsung.com/global/samsung-electronics-unveils-high-performance-990-pro-ssd-optimized-for-gaming-and-creative-applications
[gp3]: https://docs.aws.amazon.com/ebs/latest/userguide/general-purpose.html
[io2]: https://docs.aws.amazon.com/ebs/latest/userguide/provisioned-iops.html
[azure]: https://learn.microsoft.com/en-us/azure/networking/azure-network-latency
[tls]: https://www.rfc-editor.org/rfc/rfc8446.html
[tcp]: https://www.rfc-editor.org/rfc/rfc7323.html
[redis]: https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/benchmarks/
[redis-latency]: https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/
[mysql]: https://dev.mysql.com/blog-archive/mysql-connection-handling-and-scaling/
[pg92]: https://www.postgresql.org/about/press/presskit92/
[pgbench]: https://www.postgresql.org/docs/18/pgbench.html
[pg-page]: https://www.postgresql.org/docs/18/storage-page-layout.html
[pg-wal]: https://www.postgresql.org/docs/18/wal-internals.html
[etcd]: https://etcd.io/docs/v3.5/op-guide/performance/
[kafka]: https://www.microsoft.com/en-us/research/wp-content/uploads/2017/09/Kafka.pdf
[s3-perf]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html
[raft]: https://raft.github.io/raft.pdf
[availability]: https://sre.google/sre-book/availability-table/
[durability]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html
[little]: https://pubsonline.informs.org/doi/10.1287/opre.9.3.383
[tail]: https://research.google/pubs/the-tail-at-scale/
