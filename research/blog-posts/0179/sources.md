# 0179 调研记录：向量数据库索引技术

## DDIA-V2 本地来源

- `DDIA-V2-Typest-dual全校版/chapters/ch04-storage-and-retrieval.typ`，第 4 章 “Vector Embeddings / 向量嵌入”，约第 1208–1305 行。
  - 嵌入是文本或多模态对象在高维空间中的表示；向量索引以距离函数找相近点。
  - DDIA 区分 Flat、IVF 与 HNSW：前者精确但全量扫描，后两者是通过少看候选来换取速度的近似索引。
  - 特别避免混淆：语义检索中的 vector 是浮点坐标，不是 CPU 的向量化执行。

## 外部一手资料（访问于 2026-09-13）

1. [HNSW 原论文](https://arxiv.org/abs/1603.09320)：分层近邻图、顶层稀疏且逐层细化的基本机制。
2. [pgvector 文档：索引、HNSW 与 IVFFlat](https://github.com/pgvector/pgvector#hnsw)：精确搜索与 ANN 的区别；HNSW 的内存/建库代价；IVFFlat 的 lists 与 probes；带过滤 ANN 的召回风险和 iterative scan。
3. [Milvus：HNSW](https://milvus.io/docs/hnsw.md) 与 [DiskANN](https://milvus.io/docs/disk_index.md)：HNSW 参数的工程含义，以及将大规模图索引落在 NVMe 上的路径。
4. [Qdrant：Hybrid queries](https://qdrant.tech/documentation/search/hybrid-queries/)：密集与稀疏表示的融合；[multivector / late interaction](https://qdrant.tech/documentation/tutorials-search-engineering/using-multivector-representations/)：多向量常更适合作为候选重排而不是为每个 token 建 ANN 图。
5. [OpenAI File Search](https://developers.openai.com/api/docs/guides/tools-file-search)：托管的文件检索工具将语义检索与关键词检索用于模型回答前的知识库访问。
6. [Anthropic Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval)：分块会丢失文档上下文；语义向量、BM25、重排与评测应当作为可组合的检索链路。文中实验数据仅代表其测试集，文章不把它外推为通用基准。

## 文章判断

- 向量数据库首先是“向量候选集的存储、索引、过滤与运营系统”，不是嵌入模型本身，也不是 RAG 的同义词。
- ANN 的损失预算必须和语义表示、过滤、混合召回、重排分开看；只调 HNSW 的 `ef` 无法修复错误分块、错误权限过滤或模型无法区分的语义。
- 2026 年常见生产链路是候选召回（dense + lexical）→ 融合 → 重排 → 证据裁剪，而不是一次 Top-K 向量搜索。
- Agent 会把检索从单轮问答变为“规划、取证、判断不足、再取证”的循环；向量索引提供候选，而不负责事实验证、权限边界或工具调用。
