---
lang: "zh-CN"
pubDatetime: 2026-09-14T11:20:00+08:00
timezone: "Asia/Shanghai"
title: "DDIA 阅读札记：向量数据库索引——从 ANN 到 RAG 与 Agent 检索"
area: "ai-and-agents"
featured: false
draft: false
tags:
  - "DDIA"
  - "向量数据库"
  - "向量索引"
  - "HNSW"
  - "RAG"
  - "Agent"
description: "从 DDIA V2 的 Flat、IVF、HNSW 出发，梳理向量数据库索引的取舍，以及它在混合检索、重排、RAG 和 Agent 取证循环中的位置。"
---

向量数据库常被说成 RAG 的“记忆”，也常被当作给大模型补知识的默认组件。这两种说法都省略了关键部分：**嵌入模型负责把对象表示成坐标，向量索引负责在预算内召回候选；而 RAG 与 Agent 还要决定该找什么、哪些候选可信、哪些证据允许进入上下文。**

DDIA V2 在第 4 章把问题讲得很清楚：语义相近的文档应在高维空间中相近，但高维向量不能指望沿用 R 树等低维空间索引；因此需要专门的向量索引。今天的产品实现已经丰富得多，不过判断一套系统是否合适，仍可以回到这个边界。

![抽象的向量嵌入空间与邻域](./draft-assets/01-embedding-landscape.png)

*图 1：嵌入空间的概念图。点云聚集表达模型学到的相似性；它不是某个语料真实的二维投影。*

## 1. 向量数据库究竟解决什么

设文档片段为 $d$，查询为 $q$，嵌入模型把它们映射为 $e(d)$ 与 $e(q)$。检索的最小目标是找出距离最近的 $k$ 个片段：

$$
\operatorname{topK}_{d \in D}\; \operatorname{sim}(e(q), e(d))
$$

`sim` 常用余弦相似度、内积或欧氏距离。DDIA 特别提醒，语义检索里的 vector 是一串浮点坐标，和 CPU 一次处理一批数据的“向量化执行”不是同一件事。

如果语料只有很小的一部分，最朴素的做法是逐一计算距离。规模、权限过滤、持续写入与延迟目标出现后，问题才从“相似度计算”变成“索引和数据系统”。一套可运营的向量数据库通常还要处理：

- 向量与原文、元数据、权限标签和版本的共同存储；
- 候选召回、标量过滤、去重和重排；
- 写入、删除、更新、索引构建、压缩与副本；
- 对召回率、P95 延迟、成本和数据新鲜度的观测。

所以，向量数据库不是嵌入模型，也不是 RAG 的同义词。它的核心职责是：**在可能很大的候选集合中，以可以控制的成本找到值得进一步判断的对象。**

## 2. DDIA 的三类索引：少看多少候选，承担多少误差

DDIA V2 用 Flat、IVF、HNSW 给出一个很实用的分类。它们没有绝对的优劣，只是把时间、内存、建库成本和召回率放在不同位置。

| 路线 | 查询时做什么 | 优点 | 主要代价 | 适合先考虑的情况 |
|---|---|---|---|---|
| Flat / brute force | 比较每一个向量 | 精确，行为稳定，无训练 | 查询成本随语料线性增长 | 小语料、离线评测、严格校验集 |
| IVF | 先找最近的质心，只扫描若干倒排列表 | 建库快，内存较省，参数直观 | 聚类边界可能漏掉近邻；`nprobe` 越大越慢 | 大批量、可训练、能接受明确的召回旋钮 |
| HNSW | 在多层近邻图中由稀到密地导航 | 常有很好的延迟—召回折中 | 建图与内存较贵，写入和删除须评估 | 读多、低延迟、内存预算足够 |
| DiskANN 一类 | 用磁盘图和内存中的压缩表示协作召回 | 数据集超过内存时仍可扩展 | 依赖 NVMe、缓存和 I/O 调参 | 十亿级以上或 RAM 是首要约束 |

### 2.1 Flat 是基准，不是落后的方案

Flat 的价值在于它给出**精确近邻**。ANN（approximate nearest neighbor，近似最近邻）项目如果没有 Flat 对照，就不知道优化后到底损失了多少向量召回，也无法区分“索引漏了”与“嵌入本来就没有把正确片段排前面”。

在小而高价值的集合里，或者已经用元数据过滤到很小的候选集时，Flat 甚至可以是生产路径。不要为了“用了向量数据库”而过早引入近似误差。

### 2.2 IVF：用分区减少比较次数

IVF 先将向量空间聚类成多个质心，查询只探查离查询最近的若干列表。`nprobe` 就是直接的预算开关：探查更多分区，扫描更多向量，召回率通常提高，延迟也随之提高。

这个机制的弱点也很明确：真正相近的向量可能被聚类边界分到不同列表。pgvector 的文档建议在已有数据后构建 IVFFlat，并将 lists 与 probes 一起调；这不是附带选项，而是 IVF 准确性的组成部分。[pgvector 的 IVFFlat 说明](https://github.com/pgvector/pgvector#ivfflat)

### 2.3 HNSW：用图快速接近候选区域

HNSW 为向量建立分层近邻图。上层节点更少，负责远距离跳转；向下进入更密的图后，再在局部找到更好的候选。这正是 DDIA 的描述，也是原论文的基本结构。[HNSW 原论文](https://arxiv.org/abs/1603.09320)

![HNSW 在三层近邻图中逐层下降](./draft-assets/02-hnsw-descent.png)

*图 2：HNSW 查询路径的概念图。真实索引层数、随机层高、候选队列和邻接表远比图中复杂。*

工程上至少要区分三个旋钮：

- `M`：每层邻接连接的规模，影响图的内存和可导航性；
- `ef_construction`：建图时保留的候选规模，越高通常图越好、构建越慢；
- `ef_search`：查询时探索的候选规模，越高通常召回越好、查询越慢。

以 pgvector 为例，HNSW 相比 IVFFlat 往往有更好的速度—召回折中，但建库更慢、内存占用更高；`ef_search` 直接控制查询质量与速度。[pgvector 的 HNSW 参数与取舍](https://github.com/pgvector/pgvector#hnsw) 因此“默认 HNSW”不是设计结论，而只是开始测量的位置。

### 2.4 PQ、量化与磁盘索引：先缩小候选成本，再决定是否精算

向量以 `float32` 存储很快变得昂贵：维度、向量数和副本数相乘后，内存带宽往往先成为瓶颈。标量量化、二值量化、Product Quantization（PQ）等方法用低精度编码快速筛选候选，再用原始向量重排，是常见的两阶段思路。

当全部图和向量放不进内存时，DiskANN 一类索引把磁盘上的图、内存中的压缩表示和 NVMe 的随机读结合起来。它解决的是容量边界，并没有取消近似、缓存命中和 I/O 尾延迟的权衡。[Milvus 对 DiskANN 的说明](https://milvus.io/docs/disk_index.md)

## 3. 真正容易出错的地方：过滤与近似的交界

RAG 很少是“在所有文档中找最像的十段”。它通常有租户、用户、时间、文档版本、语言、权限和产品线等约束。此时有两种看似相近、结果却完全不同的策略：

1. 先用 ANN 找 20 个候选，再按权限过滤；
2. 让过滤条件参与候选集构造，或者持续扩大 ANN 扫描直到满足过滤后的 `k` 个结果。

第一种会在选择性高的过滤条件下直接丢失召回：候选被过滤掉后，系统不会自动知道还有哪些合格项没有看过。pgvector 的文档明确说明，其近似索引在扫描后应用过滤条件；必要时应为过滤字段建立普通索引、使用分区或启用 iterative scan。[pgvector：过滤与 iterative scan](https://github.com/pgvector/pgvector#filtering)

这带来一个比调 `ef_search` 更基本的实践原则：**权限和租户隔离是候选集定义，不是展示层的后处理。** 对高选择性过滤，先缩小集合再作精确检索常常比盲目扩大全局 HNSW 更可靠；对低选择性过滤，则需要评估 ANN 扫描预算、分区和索引结构。

## 4. 2026 年的检索链路：向量索引只是第一段

市场上的 RAG 方案已经不再把“单向量 Top-K”当作终点。更常见的结构是：

```text
查询理解 / 改写
        ↓
稀疏词法召回  ─┐
密集向量 ANN ──┼─→ 融合与去重 → 重排 → 少量带出处的证据 → LLM
元数据过滤  ───┘
```

![稀疏召回、稠密召回、候选池与重排的抽象链路](./draft-assets/03-retrieval-pipeline.png)

*图 3：现代检索链路的概念图。候选池要足够宽，进入模型上下文的证据要足够窄。*

### 4.1 混合检索：语义相近与精确命中各有不可替代之处

密集向量擅长处理同义表达、意图与模糊表述；BM25 或稀疏向量更擅长错误码、函数名、SKU、法规条款号这类精确字面量。把其中一个当成另一个的替代品，通常会在真实查询里暴露盲区。

OpenAI 的 File Search 已把语义检索和关键词检索作为模型访问文件知识库的组合能力；Qdrant 的查询接口则展示了用 dense、sparse 表示分别预取，再通过 RRF 或其他融合方式组合候选的路径。[OpenAI File Search](https://developers.openai.com/api/docs/guides/tools-file-search)、[Qdrant Hybrid Queries](https://qdrant.tech/documentation/search/hybrid-queries/)

### 4.2 重排：把昂贵的相关性判断留给小候选集

向量索引擅长高速召回，未必擅长判定最终证据。重排器读查询与候选文本的更细粒度交互，把几十到数百个候选重新排序，再交给生成模型少量证据。这样把高成本判断放在窄集合里，通常比把 ANN 调到极高召回更经济。

另一条正在成熟的路线是 late interaction / multivector：一个文档保留多个 token 或片段向量，而不先池化为一个向量。它能保留更细的匹配信号，却会显著增加存储和计算。因此更适合重排阶段，而不是默认给每个 token 建 HNSW 图。Qdrant 的文档也明确将这种多向量表示与候选重排联系起来。[Qdrant：Multivector 与 Late Interaction](https://qdrant.tech/documentation/tutorials-search-engineering/using-multivector-representations/)

### 4.3 分块、上下文和索引是同一个系统的三个切面

错误分块会让最好的索引也只能召回不完整的证据。将表格行拆散、把代词与标题分离、跨章节丢掉版本边界，都会让嵌入表示失真。Anthropic 的 Contextual Retrieval 讨论了在嵌入和词法索引前，为每个块补上文档级上下文的做法；其公开实验不能替代自己的评测，却足以说明分块策略、上下文与重排不能独立决策。[Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval)

一个有用的顺序是：先定义用户真正要找的**可引用证据单元**，再决定怎样分块、怎样表示、怎样建立索引。不要从“模型最多能接受多少 token”反推所有切块边界。

## 5. Agent 改变的不是索引，而是检索的调用方式

单轮 RAG 常把检索视为回答前的一次函数调用。Agent 会把它变成取证循环：判断问题是否需要外部信息，选择语料与过滤条件，检查证据是否足够，再决定改写查询、扩大候选、切换数据源还是调用工具。

![Agent 围绕知识库、工作记忆和工具进行取证循环](./draft-assets/04-agent-evidence-loop.png)

*图 4：Agent 的检索循环。向量库提供候选，规划器和校验器负责决定下一步；二者不可互相替代。*

这类系统通常至少有三种不同的“记忆”，不应混放进一个索引：

| 数据 | 适合的检索问题 | 需要保留的约束 |
|---|---|---|
| 受治理的知识库 | “哪份制度、手册、代码或案例可作为证据？” | 权限、版本、生效时间、出处 |
| 会话与任务工作记忆 | “我刚验证过什么、还缺什么？” | 生命周期短、可追溯、与用户会话绑定 |
| 工具与结构化数据 | “当前库存、订单状态、指标是多少？” | 用 API / SQL 获取事实，向量检索只做路由或辅助解释 |

把实时库存或账务余额只嵌入进向量库，会把本应由事务和权限系统保证的正确性，降格为相似度问题。反过来，把全部历史知识塞进 Agent 上下文也会丢掉检索、版本和引用边界。向量索引最合适的角色仍是：**为下一步推理提供受约束、可回看的候选证据。**

## 6. 选型与调参：先写清楚预算，再选算法

可以先用下面的决策顺序，而不是从产品名开始：

1. **先定正确性边界。** 是否必须精确？是否有严格权限、时间点、租户隔离和删除要求？若候选经高选择性过滤后很小，先测 Flat 或关系数据库中的精确路径。
2. **再定规模与工作负载。** 数据能否放内存？是读多写少，还是高频增删？HNSW 的内存和建图成本是否可以接受？IVF 是否有足够稳定的数据训练质心？
3. **将表示与索引分开实验。** 固定一份带人工相关性标注的查询集，分别测嵌入模型、分块、过滤策略、ANN 参数和重排器。
4. **用端到端指标收口。** 除了 ANN recall@K，还应记录证据 recall、重排后的 nDCG / MRR、答案有无出处支持、P95 延迟、每请求成本和新数据可见延迟。

其中有一个常见反模式：线上答案差，就不断把 `ef_search`、`nprobe` 或 Top-K 调大。这样可能掩盖问题、增加成本，并把更多无关文本送入模型。更可靠的做法是沿链路定位：正确片段是否入库？分块是否保留语境？过滤是否先排除了它？ANN 是否漏召回？重排是否降错了它？模型是否真正引用了它？

## 结语

DDIA V2 对向量索引的启发并不复杂：向量表示让“语义相近”成为可计算的距离，索引让这种计算可以扩展；但任何加速都意味着某种预算和误差边界。

今天的 RAG 与 Agent 系统把这条链拉长了。HNSW、IVF、量化和磁盘索引解决的是候选生成；混合检索与重排改善相关性；分块、版本和权限决定证据是否可用；Agent 则决定何时继续取证。把这些层次拆开设计、拆开评测，才不会把“向量数据库索引”误当成一键解决知识、事实和推理的问题。

## 参考资料

- 本地 DDIA V2 第 4 章 “Vector Embeddings / 向量嵌入”
- [Malkov & Yashunin, HNSW 原论文](https://arxiv.org/abs/1603.09320)
- [pgvector：HNSW、IVFFlat、过滤与 iterative scan](https://github.com/pgvector/pgvector)
- [Milvus：HNSW](https://milvus.io/docs/hnsw.md) 与 [DiskANN](https://milvus.io/docs/disk_index.md)
- [Qdrant：Hybrid Queries](https://qdrant.tech/documentation/search/hybrid-queries/) 与 [Multivector / Late Interaction](https://qdrant.tech/documentation/tutorials-search-engineering/using-multivector-representations/)
- [OpenAI File Search](https://developers.openai.com/api/docs/guides/tools-file-search)
- [Anthropic Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval)
