---
title: "brendangregg.com"
description: "跟踪 Brendan Gregg 的系统性能、DTrace、eBPF、火焰图与云基础设施资料。"
subjectName: "Brendan Gregg"
paparazziTier: "top"
avatarCandidates:
  - url: "https://www.brendangregg.com/Images/brendan_rajasthan2011_thumb.jpg"
    source: "个人网站照片"
    profileUrl: "https://www.brendangregg.com/"
  - url: "https://avatars.githubusercontent.com/u/1101211?v=4"
    source: "GitHub"
    profileUrl: "https://github.com/brendangregg"
  - url: "https://github.com/brendangregg.png?size=400"
    source: "GitHub profile image"
    profileUrl: "https://github.com/brendangregg"
---

## 〇、博客档案与作者情报

### 博客地址与统计

- **博客主页：** [Brendan Gregg's Blog](https://www.brendangregg.com/blog/)
- **完整归档：** [Blog Archive](https://www.brendangregg.com/blog/archive.html)
- **RSS：** [Brendan Gregg Blog RSS](https://www.brendangregg.com/blog/rss.xml)
- **调查截点：** 2026-09-15；博客当前可见的最新文章是 2026-02-07 发布的 [Why I joined OpenAI](https://www.brendangregg.com/blog/2026-02-07/why-i-joined-openai.html)。
- **文章总数：** 266 篇。统计口径是合并博客主页和历史归档中的日期条目，再按文章 URL 去重；博客主页主要承载较新的列表，Archive 补齐更早的 dtrace.org 与 Blogspot 迁移文章。
- **时间跨度：** 2005-05-26 至 2026-02-07。
- **分类数：** 8 个主题组；以下是本报告的人工归纳，不等同于站点原生标签，每篇文章只出现一次。
- **发现与复核：** 该站是较早的静态 HTML 博客，通用发现器会把站内资料页一并识别为候选 URL，因此最终以博客主页和 [Archive](https://www.brendangregg.com/blog/archive.html) 的日期条目人工复核，并以文章 URL 去重。

### 年度发文量

| 年份 | 篇数 |
| ---: | ---: |
| 2005 |   10 |
| 2006 |   17 |
| 2007 |    8 |
| 2008 |    8 |
| 2009 |   20 |
| 2010 |    4 |
| 2011 |   26 |
| 2012 |   10 |
| 2013 |    8 |
| 2014 |   36 |
| 2015 |   21 |
| 2016 |   28 |
| 2017 |   19 |
| 2018 |   10 |
| 2019 |    7 |
| 2020 |    3 |
| 2021 |   11 |
| 2022 |    4 |
| 2023 |    3 |
| 2024 |    5 |
| 2025 |    7 |
| 2026 |    1 |

### 更新节奏与主题迁移

- 2005–2013 共 111 篇，早期主线是 DTrace、Solaris、ZFS、存储和系统性能；其中 2006 年开始出现 DTrace 工具与平台实践，2009–2011 年转向更密集的存储、云分析和延迟分析。
- 2014–2018 共 114 篇，是全站最密集的技术转型期：Linux perf/ftrace、火焰图、云实例、Netflix 性能工程和 eBPF 工具链逐渐成为主轴；2014 年 36 篇、2016 年 28 篇、2017 年 19 篇。
- 2019–2021 共 21 篇，主题明显收束到 BPF/eBPF、可观测性、系统性能书籍和 SRE；[BPF Performance Tools](https://www.brendangregg.com/bpf-performance-tools-book.html) 的出版与相关教程是这一阶段的标志。
- 2022–2026 共 20 篇，发文转为事件驱动和阶段性记录，内容包括 Intel 任职、远程工作、AI Flame Graphs、Linux 危机工具、工程方法，以及 2026 年加入 OpenAI 后的数据中心性能工作。
- 所有文章相邻日期间隔的中位数为 14 天，平均间隔为 28.5 天；只看 30 天以内的连续活跃区间，中位数为 6.5 天，说明他通常以短周期连发，再长时间沉淀。
- 最明显的空档包括 2023-04-28→2024-03-10（317 天）、2022-05-02→2023-02-17（291 天）、2020-11-04→2021-05-09（186 天）和 2024-10-29→2025-05-01（184 天）。这些空档更像职业/项目阶段切换，不代表作者停止公开活动；其演讲、书籍和工具页面仍在独立更新。

### 主题统计

| 主题 | 篇数 |
| --- | ---: |
| eBPF、BPF 与 Linux 动态追踪 |   58 |
| 火焰图、FlameScope 与性能可视化 |   28 |
| 系统性能方法、指标与基准测试 |   33 |
| 云计算、容器、虚拟化、网络与存储 |   48 |
| DTrace、Solaris、FreeBSD 与传统系统工具 |   41 |
| 语言运行时、应用性能与调试 |   14 |
| 书籍、会议、职业与工程文化 |   34 |
| 个人记录、实验与其他观察 |   10 |
| **合计** | **266** |

### 作者情报：Brendan Gregg

- **当前公开身份：** [个人网站首页](https://www.brendangregg.com/)目前写明，他在 OpenAI 负责 ChatGPT 的数据中心性能工作；页面同时注明此前曾在 Netflix 工作。
- **职业轨迹：** [官方 Bio](https://www.brendangregg.com/bio.html)记录了他在 Sun Microsystems、Netflix、Intel 以及独立咨询/培训阶段的系统性能工作。GitHub API 快照中的 company 字段仍为 Intel，因此这里把 GitHub 字段视为尚未更新的历史资料，不覆盖个人网站的当前声明。
- **方法论贡献：** 官方 Bio 明确列出 DTraceToolkit、Ftrace perf-tools，以及对 bcc/bpftrace 的贡献；同时列出 USE 方法、off-CPU 分析、TSA 方法、热图、火焰图和 FlameScope 等方法或可视化。
- **教学与公开活动：** Bio 页称其作为独立顾问和技术培训师授课，累计学员超过 2,000 人，并列出 USENIX、Kernel Recipes、SREcon 等演讲、访谈和主题演讲记录。
- **地域信息：** 个人网站 Bio 记载他出生于澳大利亚，2021 年回到悉尼；GitHub API 的公开资料也标为 Sydney, Australia。

### 代表项目与技术影响

| 项目 | 公开定位 | GitHub 快照（2026-09-15） |
| --- | --- | ---: |
| [FlameGraph](https://github.com/brendangregg/FlameGraph) | stack trace 可视化工具，火焰图生态的核心入口 | 19,754 stars / 2,111 forks |
| [perf-tools](https://github.com/brendangregg/perf-tools) | 基于 Linux perf_events 与 ftrace 的性能分析工具 | 10,468 stars / 1,669 forks |
| [bpf-perf-tools-book](https://github.com/brendangregg/bpf-perf-tools-book) | 《BPF Performance Tools》官方代码与实验仓库 | 1,825 stars / 307 forks |
| [HeatMap](https://github.com/brendangregg/HeatMap) | 热图生成工具 | 331 stars / 58 forks |
| [pmc-cloud-tools](https://github.com/brendangregg/pmc-cloud-tools) | 云环境 Performance Monitoring Counter 工具 | 286 stars / 42 forks |

- GitHub 账号的 [公开资料](https://github.com/brendangregg)在本次快照中有 42 个 public repositories、8,912 个 followers、0 following；[GitHub 用户 API](https://api.github.com/users/brendangregg)显示账号创建于 2011-10-04。Stars、followers 和仓库更新时间都会变化，这里只把它们当作调查截点快照。
- 相关生态还包括 [iovisor/bcc](https://github.com/iovisor/bcc) 与 [bpftrace/bpftrace](https://github.com/bpftrace/bpftrace)。这里不把它们写成 Brendan 单独拥有的项目，而是按照官方 Bio 的表述，记录其贡献关系和生态影响。
- 发现了同名的 [brendangregg.github.io 仓库](https://github.com/brendangregg/brendangregg.github.io)，但它的内容和更新时间不足以证明承载当前完整站点；当前网站本身仍以独立 HTML 站点为主要公开形态，因此不把这个旧仓库误报成全站源码。

### 社交、出版与公开资料

- [Mastodon](https://aus.social/@brendangregg)：个人网站首页明确列出的账号。
- [X/Twitter](https://twitter.com/brendangregg)：个人网站首页列出的旧社交入口；是否活跃以平台当前状态为准。
- [GitHub](https://github.com/brendangregg)：代码、工具仓库和公开项目动态。
- [演讲、访谈与履历](https://www.brendangregg.com/bio.html)：官方 Bio 汇总了公开演讲、访谈、培训和奖项记录。
- [Books and Recommended Reading](https://www.brendangregg.com/books.html)：官方书目页列出《Systems Performance》第二版、《BPF Performance Tools》、《DTrace》和《Solaris Performance and Tools》等著作，以及相关领域的延伸阅读。
- [Systems Performance, 2nd Edition](https://www.brendangregg.com/systems-performance-2nd-edition-book.html)：官方书页说明第二版扩展了 BPF/BCC/bpftrace、perf、ftrace、Linux 和云环境内容，并继续强调性能、延迟和异常值分析。
- [BPF Performance Tools](https://www.brendangregg.com/bpf-performance-tools-book.html)：官方书页介绍 BPF/eBPF、BCC 与 bpftrace 在性能、可观测性和安全场景中的使用。

### 官方技术资料入口

- [Flame Graphs](https://www.brendangregg.com/flamegraphs.html)、[FlameScope](https://www.brendangregg.com/flamescope.html)、[Heat Maps](https://www.brendangregg.com/heatmaps.html)：可视化工具与方法。
- [eBPF](https://www.brendangregg.com/ebpf.html)、[Linux perf](https://www.brendangregg.com/linuxperf.html)、[perf](https://www.brendangregg.com/perf.html)：Linux 性能与动态观测工具入口。
- [USE Method](https://www.brendangregg.com/usemethod.html)、[Performance Methodology](https://www.brendangregg.com/methodology.html)、[Off-CPU Analysis](https://www.brendangregg.com/offcpuanalysis.html)：系统化调查性能问题的方法论。
- [TSA Method](https://www.brendangregg.com/tsamethod.html)、[Working Set Size](https://www.brendangregg.com/wss.html)：时间序列分析和工作集大小等专题资料。

### 头像与履历来源

- **头像优先级 1：** [个人网站照片](https://www.brendangregg.com/Images/brendan_rajasthan2011_thumb.jpg)，来自其官方站点的公开图片，适合作为主要头像来源。
- **头像优先级 2：** [GitHub avatar](https://avatars.githubusercontent.com/u/1101211?v=4)，对应 [brendangregg GitHub 账号](https://github.com/brendangregg)。
- **头像优先级 3：** [GitHub profile image endpoint](https://github.com/brendangregg.png?size=400)，作为同一账号的备用图片入口。
- **履历来源：** 未把搜索结果中的第三方简介当成简历；职业信息以[官方 Bio](https://www.brendangregg.com/bio.html)和[个人网站首页](https://www.brendangregg.com/)为主，GitHub 资料只作为代码身份和公开统计的交叉证据。
- 若以上头像都失效，Paparazzi 卡片会按站点现有组件回退到 Brendan Gregg 的首字母，不会留下破图。

### 归类说明

以下按文章标题、博客上下文、官方技术资料和作者公开履历人工归类；分类服务于 Paparazzi 导航，不代表站点原生标签。书籍、会议和职业动向集中放入第七档，纯个人记录放入第八档；技术文章按其主要问题域只归入一个主题。

## 一、eBPF、BPF 与 Linux 动态追踪（58 篇）

从 Linux perf、ftrace 到 eBPF、bcc、bpftrace，记录工具链从实验性能力走向生产观测与安全边界的过程。

- [No More Blue Fridays](https://www.brendangregg.com/blog/2024-07-22/no-more-blue-fridays.html)（2024-07-22）
- [eBPF Documentary](https://www.brendangregg.com/blog/2024-03-10/ebpf-documentary.html)（2024-03-10）
- [eBPF Observability Tools Are Not Security Tools](https://www.brendangregg.com/blog/2023-04-28/ebpf-security-issues.html)（2023-04-28）
- [How To Add eBPF Observability To Your Product](https://www.brendangregg.com/blog/2021-07-03/how-to-add-bpf-observability.html)（2021-07-03）
- [USENIX LISA2021 BPF Internals (eBPF)](https://www.brendangregg.com/blog/2021-06-15/bpf-internals.html)（2021-06-15）
- [BPF binaries: BTF, CO-RE, and the future of BPF perf tools](https://www.brendangregg.com/blog/2020-11-04/bpf-co-re-btf-libbpf.html)（2020-11-04）
- [BPF Theremin, Tetris, and Typewriters](https://www.brendangregg.com/blog/2019-12-22/bpf-theremin.html)（2019-12-22）
- [BPF: A New Type of Software](https://www.brendangregg.com/blog/2019-12-02/bpf-a-new-type-of-software.html)（2019-12-02）
- [Two kernel mysteries and the most technical talk I've ever seen](https://www.brendangregg.com/blog/2019-10-15/kernelrecipes-kernel-ftrace-internals.html)（2019-10-15）
- [A thorough introduction to bpftrace](https://www.brendangregg.com/blog/2019-08-19/bpftrace.html)（2019-08-19）
- [BPF Performance Tools: Linux System and Application Observability (book)](https://www.brendangregg.com/blog/2019-07-15/bpf-performance-tools-book.html)（2019-07-15）
- [Learn eBPF Tracing: Tutorial and Examples](https://www.brendangregg.com/blog/2019-01-01/learn-ebpf-tracing.html)（2019-01-01）
- [bpftrace (DTrace 2.0) for Linux 2018](https://www.brendangregg.com/blog/2018-10-08/dtrace-for-linux-2018.html)（2018-10-08）
- [Linux bcc/eBPF tcpdrop](https://www.brendangregg.com/blog/2018-05-31/linux-tcpdrop.html)（2018-05-31）
- [TCP Tracepoints](https://www.brendangregg.com/blog/2018-03-22/tcp-tracepoints.html)（2018-03-22）
- [USENIX/LISA 2016 Linux bcc/BPF Tools](https://www.brendangregg.com/blog/2017-04-29/usenix-lisa-2016-bcc-bpf-tools.html)（2017-04-29）
- [perf sched for Linux CPU scheduler analysis](https://www.brendangregg.com/blog/2017-03-16/perf-sched.html)（2017-03-16）
- [Golang bcc/BPF Function Tracing](https://www.brendangregg.com/blog/2017-01-31/golang-bcc-bpf-function-tracing.html)（2017-01-31）
- [Give me 15 minutes and I'll change your view of Linux tracing](https://www.brendangregg.com/blog/2016-12-27/linux-tracing-in-15-minutes.html)（2016-12-27）
- [Linux bcc/BPF tcplife: TCP Lifespans](https://www.brendangregg.com/blog/2016-11-30/linux-bcc-tcplife.html)（2016-11-30）
- [DTrace for Linux 2016](https://www.brendangregg.com/blog/2016-10-27/dtrace-for-linux-2016.html)（2016-10-27）
- [Linux 4.9's Efficient BPF-based Profiler](https://www.brendangregg.com/blog/2016-10-21/linux-efficient-profiler.html)（2016-10-21）
- [Linux bcc tcptop](https://www.brendangregg.com/blog/2016-10-15/linux-bcc-tcptop.html)（2016-10-15）
- [Linux bcc/BPF Node.js USDT Tracing](https://www.brendangregg.com/blog/2016-10-12/linux-bcc-nodejs-usdt.html)（2016-10-12）
- [Linux bcc/BPF Run Queue (Scheduler) Latency](https://www.brendangregg.com/blog/2016-10-08/linux-bcc-runqlat.html)（2016-10-08）
- [Linux bcc ext4 Latency Tracing](https://www.brendangregg.com/blog/2016-10-06/linux-bcc-ext4dist-ext4slower.html)（2016-10-06）
- [Linux MySQL Slow Query Tracing with bcc/BPF](https://www.brendangregg.com/blog/2016-10-04/linux-bcc-mysqld-qslower.html)（2016-10-04）
- [Linux bcc Tracing Security Capabilities](https://www.brendangregg.com/blog/2016-10-01/linux-bcc-security-capabilities.html)（2016-10-01）
- [Ubuntu Xenial bcc/BPF](https://www.brendangregg.com/blog/2016-06-14/ubuntu-xenial-bcc-bpf.html)（2016-06-14）
- [Hist Triggers in Linux 4.7](https://www.brendangregg.com/blog/2016-06-08/linux-hist-triggers.html)（2016-06-08）
- [Linux 4.5 perf folded format](https://www.brendangregg.com/blog/2016-04-30/linux-perf-folded.html)（2016-04-30）
- [Linux BPF/bcc Road Ahead, March 2016](https://www.brendangregg.com/blog/2016-03-28/linux-bpf-bcc-road-ahead-2016.html)（2016-03-28）
- [Linux BPF Superpowers](https://www.brendangregg.com/blog/2016-03-05/linux-bpf-superpowers.html)（2016-03-05）
- [Linux eBPF/bcc uprobes](https://www.brendangregg.com/blog/2016-02-08/linux-ebpf-bcc-uprobes.html)（2016-02-08）
- [Who is waking the waker? (Linux chain graph prototype)](https://www.brendangregg.com/blog/2016-02-05/ebpf-chaingraph-prototype.html)（2016-02-05）
- [Linux Wakeup and Off-Wake Profiling](https://www.brendangregg.com/blog/2016-02-01/linux-wakeup-offwake-profiling.html)（2016-02-01）
- [Linux eBPF Stack Trace Hack](https://www.brendangregg.com/blog/2016-01-18/ebpf-stack-trace-hack.html)（2016-01-18）
- [Linux Performance Analysis in 60s (video)](https://www.brendangregg.com/blog/2015-12-03/linux-perf-60s-video.html)（2015-12-03）
- [tcpconnect and tcpaccept for Linux (bcc)](https://www.brendangregg.com/blog/2015-10-31/tcpconnect-tcpaccept-bcc.html)（2015-10-31）
- [bcc: Taming Linux 4.3+ Tracing Superpowers](https://www.brendangregg.com/blog/2015-09-22/bcc-linux-4.3-tracing.html)（2015-09-22）
- [Choosing a Linux Tracer (2015)](https://www.brendangregg.com/blog/2015-07-08/choosing-a-linux-tracer.html)（2015-07-08）
- [Hacking Linux USDT with Ftrace](https://www.brendangregg.com/blog/2015-07-03/hacking-linux-usdt-ftrace.html)（2015-07-03）
- [Linux uprobe: User-Level Dynamic Tracing](https://www.brendangregg.com/blog/2015-06-28/linux-ftrace-uprobe.html)（2015-06-28）
- [eBPF: One Small Step](https://www.brendangregg.com/blog/2015-05-15/ebpf-one-small-step.html)（2015-05-15）
- [USENIX/LISA 2014 New Tools and Old Secrets (perf-tools)](https://www.brendangregg.com/blog/2015-03-17/usenix-lisa-2014-linux-ftrace-perf-tools.html)（2015-03-17）
- [Linux perf_events Off-CPU Time Flame Graph](https://www.brendangregg.com/blog/2015-02-26/linux-perf-off-cpu-flame-graph.html)（2015-02-26）
- [Linux Performance Tools 2014](https://www.brendangregg.com/blog/2014-11-22/linux-perf-tools-2014.html)（2014-11-22）
- [Kernel Line Tracing: Linux perf Rides the Rocket](https://www.brendangregg.com/blog/2014-09-11/perf-kernel-line-tracing.html)（2014-09-11）
- [Linux ftrace TCP Retransmit Tracing](https://www.brendangregg.com/blog/2014-09-06/linux-ftrace-tcp-retransmit-tracing.html)（2014-09-06）
- [ftrace: The Hidden Light Switch](https://www.brendangregg.com/blog/2014-08-30/ftrace-the-hidden-light-switch.html)（2014-08-30）
- [execsnoop For Linux: See Short-Lived Processes](https://www.brendangregg.com/blog/2014-07-28/execsnoop-for-linux.html)（2014-07-28）
- [opensnoop For Linux](https://www.brendangregg.com/blog/2014-07-25/opensnoop-for-linux.html)（2014-07-25）
- [iosnoop For Linux](https://www.brendangregg.com/blog/2014-07-16/iosnoop-for-linux.html)（2014-07-16）
- [Linux ftrace Function Counting](https://www.brendangregg.com/blog/2014-07-13/linux-ftrace-function-counting.html)（2014-07-13）
- [perf Hacktogram](https://www.brendangregg.com/blog/2014-07-10/perf-hacktogram.html)（2014-07-10）
- [perf Counting](https://www.brendangregg.com/blog/2014-07-03/perf-counting.html)（2014-07-03）
- [perf Static Tracepoints](https://www.brendangregg.com/blog/2014-06-29/perf-static-tracepoints.html)（2014-06-29）
- [perf CPU Sampling](https://www.brendangregg.com/blog/2014-06-22/perf-cpu-sample.html)（2014-06-22）

## 二、火焰图、FlameScope 与性能可视化（28 篇）

围绕火焰图、热图、FlameScope 和交互式可视化，展示如何把性能数据变成可定位、可沟通的证据。

- [Doom GPU Flame Graphs](https://www.brendangregg.com/blog/2025-05-01/doom-gpu-flame-graphs.html)（2025-05-01）
- [AI Flame Graphs](https://www.brendangregg.com/blog/2024-10-29/ai-flame-graphs.html)（2024-10-29）
- [FlameScope Origin](https://www.brendangregg.com/blog/2018-12-15/flamescope-origin.html)（2018-12-15）
- [FlameScope Pattern Recognition](https://www.brendangregg.com/blog/2018-11-08/flamescope-pattern-recognition.html)（2018-11-08）
- [Coloring Flame Graphs: Code Hues](https://www.brendangregg.com/blog/2017-07-30/coloring-flamegraphs-code-type.html)（2017-07-30）
- [Java Package Flame Graph](https://www.brendangregg.com/blog/2017-06-30/package-flame-graph.html)（2017-06-30）
- [USENIX/LISA 2013 Blazing Performance with Flame Graphs](https://www.brendangregg.com/blog/2017-04-23/usenix-lisa-2013-flame-graphs.html)（2017-04-23）
- [Flame Graphs vs Tree Maps vs Sunburst](https://www.brendangregg.com/blog/2017-02-06/flamegraphs-vs-treemaps-vs-sunburst.html)（2017-02-06）
- [Where has my disk space gone? Flame graphs for file systems](https://www.brendangregg.com/blog/2017-02-05/file-system-flame-graph.html)（2017-02-05）
- [Unikernel Profiling: Flame Graphs from dom0](https://www.brendangregg.com/blog/2016-01-27/unikernel-profiling-from-dom0.html)（2016-01-27）
- [Linux eBPF Off-CPU Flame Graph](https://www.brendangregg.com/blog/2016-01-20/ebpf-offcpu-flame-graph.html)（2016-01-20）
- [Java Mixed-Mode Flame Graphs at Netflix, JavaOne 2015](https://www.brendangregg.com/blog/2015-11-06/java-mixed-mode-flame-graphs.html)（2015-11-06）
- [Flame Graph Search](https://www.brendangregg.com/blog/2015-08-11/flame-graph-search.html)（2015-08-11）
- [FreeBSD Off-CPU Flame Graphs](https://www.brendangregg.com/blog/2015-03-12/freebsd-offcpu-flame-graphs.html)（2015-03-12）
- [FreeBSD Flame Graphs](https://www.brendangregg.com/blog/2015-03-10/freebsd-flame-graphs.html)（2015-03-10）
- [Differential Flame Graphs](https://www.brendangregg.com/blog/2014-11-09/differential-flame-graphs.html)（2014-11-09）
- [CPI Flame Graphs: Catching Your CPUs Napping](https://www.brendangregg.com/blog/2014-10-31/cpi-flame-graphs.html)（2014-10-31）
- [node.js Flame Graphs on Linux](https://www.brendangregg.com/blog/2014-09-17/node-flame-graphs-on-linux.html)（2014-09-17）
- [Linux iosnoop Latency Heat Maps](https://www.brendangregg.com/blog/2014-07-23/linux-iosnoop-latency-heat-maps.html)（2014-07-23）
- [perf Heat Maps](https://www.brendangregg.com/blog/2014-07-01/perf-heat-maps.html)（2014-07-01）
- [Java Flame Graphs](https://www.brendangregg.com/blog/2014-06-12/java-flame-graphs.html)（2014-06-12）
- [USENIX LISA 2010: Visualizations for Performance Analysis](https://www.brendangregg.com/blog/2012-12-10/usenix-lisa-2010-visualizations-for-performance.html)（2012-12-10）
- [Viewing the Invisible](https://www.brendangregg.com/blog/2011-06-27/viewing-the-invisible.html)（2011-06-27）
- [Visualizing System Latency](https://www.brendangregg.com/blog/2010-06-05/visualizing-system-latency.html)（2010-06-05）
- [Latency Art: X marks the spot](https://www.brendangregg.com/blog/2009-06-12/latency-art-x-marks-the-spot.html)（2009-06-12）
- [Heat Map Analytics](https://www.brendangregg.com/blog/2009-03-17/heat-map-analytics.html)（2009-03-17）
- [Latency Art: Rainbow Pterodactyl](https://www.brendangregg.com/blog/2009-03-12/latency-art-rainbow-pterodactyl.html)（2009-03-12）
- [Colortrace](https://www.brendangregg.com/blog/2007-01-29/colortrace.html)（2007-01-29）

## 三、系统性能方法、指标与基准测试（33 篇）

聚焦 USE 方法、系统性能方法论、指标、工作集、负载与基准测试，以及如何避免被错误的数字带偏。

- [Linux Crisis Tools](https://www.brendangregg.com/blog/2024-03-24/linux-crisis-tools.html)（2024-03-24）
- [The Return of the Frame Pointers](https://www.brendangregg.com/blog/2024-03-17/the-return-of-the-frame-pointers.html)（2024-03-17）
- [What is Observability](https://www.brendangregg.com/blog/2021-05-23/what-is-observability.html)（2021-05-23）
- [Systems Performance: Enterprise and the Cloud, 2nd Edition](https://www.brendangregg.com/blog/2020-07-15/systems-performance-2nd-edition.html)（2020-07-15）
- [LISA2019 Linux Systems Performance](https://www.brendangregg.com/blog/2020-03-08/lisa2019-linux-systems-performance.html)（2020-03-08）
- [Evaluating the Evaluation: A Benchmarking Checklist](https://www.brendangregg.com/blog/2018-06-30/benchmarking-checklist.html)（2018-06-30）
- [KPTI/KAISER Meltdown Initial Performance Regressions](https://www.brendangregg.com/blog/2018-02-09/kpti-kaiser-meltdown-performance.html)（2018-02-09）
- [How To Measure the Working Set Size on Linux](https://www.brendangregg.com/blog/2018-01-17/measure-working-set-size.html)（2018-01-17）
- [EuroBSDcon: System Performance Analysis Methodologies](https://www.brendangregg.com/blog/2017-10-28/bsd-performance-analysis-methodologies.html)（2017-10-28）
- [Linux Load Averages: Solving the Mystery](https://www.brendangregg.com/blog/2017-08-08/linux-load-averages.html)（2017-08-08）
- [CPU Utilization is Wrong](https://www.brendangregg.com/blog/2017-05-09/cpu-utilization-is-wrong.html)（2017-05-09）
- [SREcon: Performance Checklists for SREs 2016](https://www.brendangregg.com/blog/2016-05-04/srecon2016-perf-checklists-for-sres.html)（2016-05-04）
- [SE-Radio Episode 225: Systems Performance](https://www.brendangregg.com/blog/2015-04-30/se-radio-systems-performance.html)（2015-04-30）
- [Linux Page Cache Hit Ratio](https://www.brendangregg.com/blog/2014-12-31/linux-page-cache-hit-ratio.html)（2014-12-31）
- [Linux Performance Tools at LinuxCon North America 2014](https://www.brendangregg.com/blog/2014-08-23/linux-perf-tools-linuxcon-na-2014.html)（2014-08-23）
- [USENIX/LISA 2013 Metrics Workshop](https://www.brendangregg.com/blog/2014-05-16/usenix-lisa-2013-metrics-workshop.html)（2014-05-16）
- [The Benchmark Paradox](https://www.brendangregg.com/blog/2014-05-03/the-benchmark-paradox.html)（2014-05-03）
- [The noploop CPU Benchmark](https://www.brendangregg.com/blog/2014-04-26/the-noploop-cpu-benchmark.html)（2014-04-26）
- [Another 10 Performance Wins](https://www.brendangregg.com/blog/2014-02-11/another-10-performance-wins.html)（2014-02-11）
- [Systems Performance: Enterprise and the Cloud](https://www.brendangregg.com/blog/2013-07-17/systems-performance-enterprise-and-cloud.html)（2013-07-17）
- [USENIX LISA 2012: Performance Analysis Methodology](https://www.brendangregg.com/blog/2012-12-13/usenix-lisa-2012-performance-analysis-methodology.html)（2012-12-13）
- [FISL13: The USE Method](https://www.brendangregg.com/blog/2012-09-21/fisl13-the-use-method.html)（2012-09-21）
- [10 Performance Wins](https://www.brendangregg.com/blog/2012-08-09/10-performance-wins.html)（2012-08-09）
- [Performance Analysis talk at SCALE10x](https://www.brendangregg.com/blog/2012-01-30/performance-analysis-talk-at-scale10x.html)（2012-01-30）
- [2000x performance win](https://www.brendangregg.com/blog/2011-12-08/2000x-performance-win.html)（2011-12-08）
- [Tweaking memory on the fly](https://www.brendangregg.com/blog/2011-06-30/tweaking-memory-on-the-fly.html)（2011-06-30）
- [Performance Instrumentation Counters: short talk](https://www.brendangregg.com/blog/2010-05-15/performance-instrumentation-counters-short-talk.html)（2010-05-15）
- [FROSUG perf horrors](https://www.brendangregg.com/blog/2009-11-11/frosug-perf-horrors.html)（2009-11-11）
- [Performance Testing the 7000 series, part 3 of 3](https://www.brendangregg.com/blog/2009-05-26/performance-testing-the-7000-series3.html)（2009-05-26）
- [Performance Testing the 7000 series, part 2 of 3](https://www.brendangregg.com/blog/2009-04-02/performance-testing-the-7000-series2.html)（2009-04-02）
- [Performance Testing the 7000 series, part 1 of 3](https://www.brendangregg.com/blog/2009-03-23/performance-testing-the-7000-series1.html)（2009-03-23）
- [Status Dashboard](https://www.brendangregg.com/blog/2008-11-10/status-dashboard.html)（2008-11-10）
- [AMD64 PICs, CPI](https://www.brendangregg.com/blog/2007-02-27/amd64-pics.html)（2007-02-27）

## 四、云计算、容器、虚拟化、网络与存储（48 篇）

覆盖 Netflix、云实例、容器、虚拟化、ZFS、NFS、网络、磁盘和存储系统中的性能工程。

- [ZFS Is Mysteriously Eating My CPU](https://www.brendangregg.com/blog/2021-09-06/zfs-is-mysteriously-eating-my-cpu.html)（2021-09-06）
- [Analyzing a High Rate of Paging](https://www.brendangregg.com/blog/2021-08-30/high-rate-of-paging.html)（2021-08-30）
- [Poor Disk Performance](https://www.brendangregg.com/blog/2021-05-09/poor-disk-performance.html)（2021-05-09）
- [YOW! 2018 Cloud Performance Root Cause Analysis at Netflix](https://www.brendangregg.com/blog/2019-04-26/yow2018-cloud-performance-netflix.html)（2019-04-26）
- [Sloth Cloud Instance](https://www.brendangregg.com/blog/2018-05-19/sloth-cloud-instance.html)（2018-05-19）
- [AWS re:Invent 2017: How Netflix Tunes EC2](https://www.brendangregg.com/blog/2017-12-31/reinvent-netflix-ec2-tuning.html)（2017-12-31）
- [AWS EC2 Virtualization 2017: Introducing Nitro](https://www.brendangregg.com/blog/2017-11-29/aws-ec2-virtualization-2017.html)（2017-11-29）
- [Container Performance Analysis at DockerCon 2017](https://www.brendangregg.com/blog/2017-05-15/container-performance-analysis-dockercon-2017.html)（2017-05-15）
- [The PMCs of EC2: Measuring IPC](https://www.brendangregg.com/blog/2017-05-04/the-pmcs-of-ec2.html)（2017-05-04）
- [Sudden Disk Utilization](https://www.brendangregg.com/blog/2016-09-03/sudden-disk-busy.html)（2016-09-03）
- [Netflix Instance Analysis Requirements](https://www.brendangregg.com/blog/2015-06-23/netflix-instance-analysis-requirements.html)（2015-06-23）
- [Performance Tuning Linux Instances on EC2](https://www.brendangregg.com/blog/2015-03-03/performance-tuning-linux-instances-on-ec2.html)（2015-03-03）
- [SCALE13x: Linux Profiling at Netflix](https://www.brendangregg.com/blog/2015-02-27/linux-profiling-at-netflix.html)（2015-02-27）
- [From Clouds to Roots: Performance Analysis at Netflix](https://www.brendangregg.com/blog/2014-09-27/from-clouds-to-roots.html)（2014-09-27）
- [The MSRs of EC2](https://www.brendangregg.com/blog/2014-09-15/the-msrs-of-ec2.html)（2014-09-15）
- [Xen Feature Detection](https://www.brendangregg.com/blog/2014-05-09/xen-feature-detection.html)（2014-05-09）
- [Xen Modes: What Color Is Your Xen?](https://www.brendangregg.com/blog/2014-05-07/what-color-is-your-xen.html)（2014-05-07）
- [Benchmarking the Cloud](https://www.brendangregg.com/blog/2014-01-10/benchmarking-the-cloud.html)（2014-01-10）
- [Virtualization Performance: Zones, KVM, Xen](https://www.brendangregg.com/blog/2013-01-11/virtualization-performance-zones-kvm-xen.html)（2013-01-11）
- [zfsday: ZFS Performance Analysis and Tools](https://www.brendangregg.com/blog/2012-12-29/zfsday-zfs-performance-analysis-and-tools.html)（2012-12-29）
- [Activity of the ZFS ARC](https://www.brendangregg.com/blog/2012-01-09/activity-of-the-zfs-arc.html)（2012-01-09）
- [Observing Observer: A Cloud Analytics Case Study](https://www.brendangregg.com/blog/2011-09-26/observing-observer-cloud-analytics.html)（2011-09-26）
- [File System Latency: part 5](https://www.brendangregg.com/blog/2011-06-03/file-system-latency-part-5.html)（2011-06-03）
- [File System Latency: part 4](https://www.brendangregg.com/blog/2011-05-24/file-system-latency-part-4.html)（2011-05-24）
- [File System Latency: part 3](https://www.brendangregg.com/blog/2011-05-18/file-system-latency-part-3.html)（2011-05-18）
- [File System Latency: part 2](https://www.brendangregg.com/blog/2011-05-13/file-system-latency-part-2.html)（2011-05-13）
- [File System Latency: part 1](https://www.brendangregg.com/blog/2011-05-11/file-system-latency-part-1.html)（2011-05-11）
- [Cloud Analytics: first video](https://www.brendangregg.com/blog/2011-01-24/cloud-analytics-first-video.html)（2011-01-24）
- [iSCSI before and after](https://www.brendangregg.com/blog/2010-01-27/iscsi-before-and-after.html)（2010-01-27）
- [NFS Analytics example](https://www.brendangregg.com/blog/2009-11-17/nfs-analytics-example.html)（2009-11-17）
- [Hybrid Storage Pool: Top Speeds](https://www.brendangregg.com/blog/2009-10-08/hybrid-storage-pool-top-speeds.html)（2009-10-08）
- [7410 hardware update, and analyzing the HyperTransport](https://www.brendangregg.com/blog/2009-09-22/analyzing-the-hypertransport.html)（2009-09-22）
- [SLOG Screenshots](https://www.brendangregg.com/blog/2009-06-26/slog-screenshots.html)（2009-06-26）
- [My Sun Storage 7310 perf limits](https://www.brendangregg.com/blog/2009-05-27/my-sun-storage-7310-perf-limits.html)（2009-05-27）
- [CIFS at 1 Gbyte/sec](https://www.brendangregg.com/blog/2009-03-03/cifs-at-1gbs.html)（2009-03-03）
- [Networking Analytics Example](https://www.brendangregg.com/blog/2009-02-23/networking-analytics-example.html)（2009-02-23）
- [DRAM Latency](https://www.brendangregg.com/blog/2009-02-06/dram-latency.html)（2009-02-06）
- [L2ARC Screenshots](https://www.brendangregg.com/blog/2009-01-30/l2arc-screenshots.html)（2009-01-30）
- [My Sun Storage 7410 perf limits](https://www.brendangregg.com/blog/2009-01-09/my-sun-storage-7410-perf-limits.html)（2009-01-09）
- [1 Gbyte/sec NFS, streaming from disk](https://www.brendangregg.com/blog/2009-01-09/1gbs-nfs-from-disk.html)（2009-01-09）
- [Unusual Disk Latency](https://www.brendangregg.com/blog/2008-12-31/unusual-disk-latency.html)（2008-12-31）
- [JBOD Analytics Example](https://www.brendangregg.com/blog/2008-12-31/jbod-analytics-example.html)（2008-12-31）
- [Up to 2 Gbytes/sec NFS](https://www.brendangregg.com/blog/2008-12-15/up-to-2gbs-nfs.html)（2008-12-15）
- [A quarter million NFS IOPS](https://www.brendangregg.com/blog/2008-12-02/a-quarter-million-nfs-iops.html)（2008-12-02）
- [ZFS L2ARC](https://www.brendangregg.com/blog/2008-07-22/zfs-l2arc.html)（2008-07-22）
- [How much CPU does a down interface chew?](https://www.brendangregg.com/blog/2006-08-11/how-much-cpu-does-a-down-interface-chew.html)（2006-08-11）
- [ZFS](https://www.brendangregg.com/blog/2005-11-20/zfs.html)（2005-11-20）
- [Network Monitoring](https://www.brendangregg.com/blog/2005-10-09/network-monitoring.html)（2005-10-09）

## 五、DTrace、Solaris、FreeBSD 与传统系统工具（41 篇）

保留 DTraceToolkit、Solaris、FreeBSD、SystemTap 和早期系统工具的历史线索，呈现作者方法论的根系。

- [Solaris to Linux Migration 2017](https://www.brendangregg.com/blog/2017-09-05/solaris-to-linux-2017.html)（2017-09-05）
- [The DTraceToolkit Project Has Ended](https://www.brendangregg.com/blog/2015-05-15/dtracetoolkit-has-ended.html)（2015-05-15）
- [MeetBSD CA: Performance Analysis of BSD](https://www.brendangregg.com/blog/2015-03-06/performance-analysis-bsd.html)（2015-03-06）
- [Tracing Summit 2014: From DTrace To Linux](https://www.brendangregg.com/blog/2015-02-28/from-dtrace-to-linux.html)（2015-02-28）
- [DTraceToolkit 0.XX Mistakes](https://www.brendangregg.com/blog/2013-09-05/dtracetoolkit-0xx-mistakes.html)（2013-09-05）
- [DTracing in Anger](https://www.brendangregg.com/blog/2012-11-14/dtracing-in-anger.html)（2012-11-14）
- [DTrace Training](https://www.brendangregg.com/blog/2012-08-12/dtrace-training.html)（2012-08-12）
- [dtrace.conf 2012 videos](https://www.brendangregg.com/blog/2012-05-08/dtrace-conf-2012-videos.html)（2012-05-08）
- [DTrace variable types](https://www.brendangregg.com/blog/2011-11-25/dtrace-variable-types.html)（2011-11-25）
- [Solaris 11 DTrace syscall Provider Changes](https://www.brendangregg.com/blog/2011-11-09/solaris-11-dtrace-syscall-provider.html)（2011-11-09）
- [Using SystemTap](https://www.brendangregg.com/blog/2011-10-15/using-systemtap.html)（2011-10-15）
- [Top 10 DTrace scripts for Mac OS X](https://www.brendangregg.com/blog/2011-10-10/top-10-dtrace-scripts-for-mac-os-x.html)（2011-10-10）
- [Breaking Down MySQL/Percona Query Latency With DTrace](https://www.brendangregg.com/blog/2011-07-06/breaking-down-mysqlpercona-dtrace.html)（2011-07-06）
- [MySQL performance schema and DTrace](https://www.brendangregg.com/blog/2011-06-23/mysql-performance-schema-and-dtrace.html)（2011-06-23）
- [MySQL Query Latency with the DTrace pid Provider](https://www.brendangregg.com/blog/2011-03-14/mysql-query-latency-dtrace.html)（2011-03-14）
- [DTrace pid Provider Links](https://www.brendangregg.com/blog/2011-02-19/dtrace-pid-provider-links.html)（2011-02-19）
- [DTrace pid Provider Overhead](https://www.brendangregg.com/blog/2011-02-18/dtrace-pid-provider-overhead.html)（2011-02-18）
- [DTrace pid Provider Instructions](https://www.brendangregg.com/blog/2011-02-16/dtrace-pid-provider-instructions.html)（2011-02-16）
- [DTrace pid Provider return](https://www.brendangregg.com/blog/2011-02-14/dtrace-pid-provider-return.html)（2011-02-14）
- [DTrace pid Provider Arguments](https://www.brendangregg.com/blog/2011-02-11/dtrace-pid-provider-arguments.html)（2011-02-11）
- [DTrace pid Provider](https://www.brendangregg.com/blog/2011-02-09/dtrace-pid-provider.html)（2011-02-09）
- [DTrace Cheatsheet](https://www.brendangregg.com/blog/2009-11-05/dtrace-cheatsheet.html)（2009-11-05）
- [DTrace in New York](https://www.brendangregg.com/blog/2008-06-24/dtrace-in-new-york.html)（2008-06-24）
- [DTraceToolkit in MacOS X](https://www.brendangregg.com/blog/2008-02-18/dtracetoolkit-in-macosx.html)（2008-02-18）
- [DTraceToolkit ver 0.99](https://www.brendangregg.com/blog/2007-10-05/dtracetoolkit-099.html)（2007-10-05）
- [DTrace Bourne shell (sh) provider](https://www.brendangregg.com/blog/2007-08-10/dtrace-bourne-shell-sh-provider1.html)（2007-08-10）
- [iSCSI DTrace Provider](https://www.brendangregg.com/blog/2007-07-31/iscsi-dtrace-provider.html)（2007-07-31）
- [JavaScript Provider ver 2.0](https://www.brendangregg.com/blog/2007-07-30/javascript-provider-ver-2-0.html)（2007-07-30）
- [DTracing Off-CPU Time](https://www.brendangregg.com/blog/2007-07-29/dtracing-off-cpu-time.html)（2007-07-29）
- [DTracing vim Latency](https://www.brendangregg.com/blog/2006-11-04/dtracing-vim-latency.html)（2006-11-04）
- [DTrace TCP provider at CEC 2006](https://www.brendangregg.com/blog/2006-10-05/dtrace-tcp-provider-at-cec.html)（2006-10-05）
- [DTrace meets JavaScript](https://www.brendangregg.com/blog/2006-09-18/dtrace-meets-javascript.html)（2006-09-18）
- [Solaris Performance and Tools](https://www.brendangregg.com/blog/2006-08-08/solaris-performance-and-tools.html)（2006-08-08）
- [DTraceTazTool - alpha release](https://www.brendangregg.com/blog/2006-05-31/dtracetaztool-alpha-release.html)（2006-05-31）
- [DTracing Scheduling Classes](https://www.brendangregg.com/blog/2006-05-28/dtracing-scheduling-classes.html)（2006-05-28）
- [DTraceToolkit ver 0.96](https://www.brendangregg.com/blog/2006-04-25/dtracetoolkit-096.html)（2006-04-25）
- [Learn DTrace, visit Sydney](https://www.brendangregg.com/blog/2006-02-12/learn-dtrace-visit-sydney.html)（2006-02-12）
- [Solaris checkcable 0.95](https://www.brendangregg.com/blog/2006-01-27/checkcable.html)（2006-01-27）
- [Solaris Performance Metrics](https://www.brendangregg.com/blog/2005-12-11/solaris-performance-metrics.html)（2005-12-11）
- [DTrace Translators](https://www.brendangregg.com/blog/2005-11-25/dtrace-translators.html)（2005-11-25）
- [mdb ::wumpus](https://www.brendangregg.com/blog/2005-09-26/mdb-wumpus.html)（2005-09-26）

## 六、语言运行时、应用性能与调试（14 篇）

整理 Java、Node.js、JavaScript、Golang、MySQL、TensorFlow、编译器和调试工具等应用侧案例。

- [TensorFlow Library Performance](https://www.brendangregg.com/blog/2022-04-09/tensorflow-library-performance.html)（2022-04-09）
- [Slack's Secret STDERR Messages](https://www.brendangregg.com/blog/2021-08-27/slack-crashes-secret-stderr.html)（2021-08-27）
- [Java Warmup](https://www.brendangregg.com/blog/2016-09-28/java-warmup.html)（2016-09-28）
- [gdb Debugging Full Example (Tutorial): ncurses](https://www.brendangregg.com/blog/2016-08-09/gdb-example-ncurses.html)（2016-08-09）
- [llnode for Node.js Memory Leak Analysis](https://www.brendangregg.com/blog/2016-07-13/llnode-nodejs-memory-leak-analysis.html)（2016-07-13）
- [Java CPU Sampling Using hprof](https://www.brendangregg.com/blog/2014-06-09/java-cpu-sampling-using-hprof.html)（2014-06-09）
- [OS X 10.9.3 Recurring Panics](https://www.brendangregg.com/blog/2014-05-23/osx-10.9.3-is-toxic.html)（2014-05-23）
- [strace Wow Much Syscall](https://www.brendangregg.com/blog/2014-05-11/strace-wow-much-syscall.html)（2014-05-11）
- [Compilers Love Messing With Benchmarks](https://www.brendangregg.com/blog/2014-05-02/compilers-love-messing-with-benchmarks.html)（2014-05-02）
- [Compilers: Let Me Obfuscate That For You](https://www.brendangregg.com/blog/2014-04-27/let-me-obfuscate-that-for-you.html)（2014-04-27）
- [Audio Volume CLI](https://www.brendangregg.com/blog/2007-03-05/audio-volume-cli.html)（2007-03-05）
- [Ged - GUI-ed](https://www.brendangregg.com/blog/2006-05-08/ged-gui-ed.html)（2006-05-08）
- [findbill](https://www.brendangregg.com/blog/2006-01-10/findbill.html)（2006-01-10）
- [APC](https://www.brendangregg.com/blog/2005-08-28/apc.html)（2005-08-28）

## 七、书籍、会议、职业与工程文化（34 篇）

包含书籍出版、培训、会议、职业转折、团队文化和工程组织观察，追踪技术之外的公开动向。

- [Why I joined OpenAI](https://www.brendangregg.com/blog/2026-02-07/why-i-joined-openai.html)（2026-02-07）
- [Leaving Intel](https://www.brendangregg.com/blog/2025-12-05/leaving-intel.html)（2025-12-05）
- [On "AI Brendans" or "Virtual Brendans"](https://www.brendangregg.com/blog/2025-11-28/ai-virtual-brendans.html)（2025-11-28）
- [Intel is listening, don't waste your shot](https://www.brendangregg.com/blog/2025-11-22/intel-is-listening.html)（2025-11-22）
- [Third Stage Engineering](https://www.brendangregg.com/blog/2025-11-17/third-stage-engineering.html)（2025-11-17）
- [When to Hire a Computer Performance Engineering Team (2025) part 1 of 2](https://www.brendangregg.com/blog/2025-08-04/when-to-hire-a-computer-performance-engineering-team-2025-part1.html)（2025-08-04）
- [3 Years of Extremely Remote Work](https://www.brendangregg.com/blog/2025-05-22/3-years-of-extremely-remote-work.html)（2025-05-22）
- [USENIX SREcon APAC 2022: Computing Performance: What's on the Horizon](https://www.brendangregg.com/blog/2023-03-01/computer-performance-future-2022.html)（2023-03-01）
- [USENIX SREcon APAC 2023: CFP](https://www.brendangregg.com/blog/2023-02-17/srecon-apac-2023.html)（2023-02-17）
- [Brendan@Intel.com](https://www.brendangregg.com/blog/2022-05-02/brendan-at-intel.html)（2022-05-02）
- [Netflix End of Series 1](https://www.brendangregg.com/blog/2022-04-15/netflix-farewell-1.html)（2022-04-15）
- [USENIX LISA2021 Computing Performance: On the Horizon](https://www.brendangregg.com/blog/2021-07-05/computing-performance-on-the-horizon.html)（2021-07-05）
- [Moving my US tech job to Australia](https://www.brendangregg.com/blog/2021-05-29/moving-to-australia.html)（2021-05-29）
- [USENIX LISA 2018: CFP Now Open](https://www.brendangregg.com/blog/2018-04-30/usenix-lisa-2018-cfp.html)（2018-04-30）
- [Brilliant Jerks in Engineering](https://www.brendangregg.com/blog/2017-11-13/brilliant-jerks.html)（2017-11-13）
- [Working at Netflix 2017](https://www.brendangregg.com/blog/2017-05-16/working-at-netflix-2017.html)（2017-05-16）
- [Working at Netflix 2016](https://www.brendangregg.com/blog/2016-03-30/working-at-netflix-2016.html)（2016-03-30）
- [Working at Netflix](https://www.brendangregg.com/blog/2015-01-20/working-at-netflix.html)（2015-01-20）
- [Free, as in, We Own Your IP](https://www.brendangregg.com/blog/2014-05-17/free-as-in-we-own-your-ip.html)（2014-05-17）
- [A New, Static, Blog](https://www.brendangregg.com/blog/2014-04-20/a-new-static-blog.html)（2014-04-20）
- [Cloud Performance Training](https://www.brendangregg.com/blog/2013-11-13/cloud-performance-traning.html)（2013-11-13）
- [Systems Performance: available now](https://www.brendangregg.com/blog/2013-10-28/systems-performance-available-now.html)（2013-10-28）
- [Open Source Systems Performance](https://www.brendangregg.com/blog/2013-10-20/open-source-systems-performance.html)（2013-10-20）
- [DTrace Book short videos](https://www.brendangregg.com/blog/2011-10-02/dtrace-book-short-videos.html)（2011-10-02）
- [DTrace book talk SFOSUG](https://www.brendangregg.com/blog/2011-03-08/dtrace-book-talk-sf.html)（2011-03-08）
- [DTrace book sample chapter: File Systems](https://www.brendangregg.com/blog/2011-02-23/dtrace-book-sample-chapter-file-systems.html)（2011-02-23）
- [DTrace book coming soon](https://www.brendangregg.com/blog/2010-09-23/dtrace-book-coming-soon.html)（2010-09-23）
- [KCA2009](https://www.brendangregg.com/blog/2009-07-09/kca2009.html)（2009-07-09）
- [Brendan joins Sun](https://www.brendangregg.com/blog/2006-09-17/brendan-joins-sun.html)（2006-09-17）
- [DTrace Slides](https://www.brendangregg.com/blog/2006-07-18/dtrace-slides.html)（2006-07-18）
- [Solaris Internals 2nd Edition](https://www.brendangregg.com/blog/2006-04-04/solaris-internals-2nd-edition.html)（2006-04-04）
- [Homepage](https://www.brendangregg.com/blog/2005-12-01/homepage.html)（2005-12-01）
- [Sys Admin Magazine](https://www.brendangregg.com/blog/2005-11-30/sys-admin-magazine.html)（2005-11-30）
- [Created This](https://www.brendangregg.com/blog/2005-05-26/created-this.html)（2005-05-26）

## 八、个人记录、实验与其他观察（10 篇）

收录个人随笔、实验原型、历史记录和难以归入主线的观察，避免把它们硬塞进技术主题。

- [Why Don't You Use ...](https://www.brendangregg.com/blog/2022-03-19/why-dont-you-use.html)（2022-03-19）
- [The Speed of Time](https://www.brendangregg.com/blog/2021-09-26/the-speed-of-time.html)（2021-09-26）
- [An Unbelievable Demo](https://www.brendangregg.com/blog/2021-06-04/an-unbelievable-demo.html)（2021-06-04）
- [Total Solar Eclipse 2017](https://www.brendangregg.com/blog/2017-08-24/total-solar-eclipse-2017.html)（2017-08-24）
- [Deirdré](https://www.brendangregg.com/blog/2016-07-23/deirdre.html)（2016-07-23）
- [Control T for TENEX](https://www.brendangregg.com/blog/2013-10-05/control-t-for-tenex.html)（2013-10-05）
- [The Greatest Tool that Never Worked: har](https://www.brendangregg.com/blog/2013-05-27/the-greatest-tool-that-never-worked-har.html)（2013-05-27）
- [Updates from California](https://www.brendangregg.com/blog/2006-12-14/update-from-california.html)（2006-12-14）
- [Brendan Clones](https://www.brendangregg.com/blog/2006-01-12/brendan-clones.html)（2006-01-12）
- [DExplorer](https://www.brendangregg.com/blog/2005-06-27/dexplorer.html)（2005-06-27）
