# 内容与交付核对

- 范围：扫描 14 章全部小节与 include 的 recovered 小节，按机制阅读相关段落，针对保证边界回查正文；不是逐句翻译，也不声称逐项穷举所有产品。
- 结构：36 条机制均有约束与推导、基本机制、实际落地、边界、章节依据。
- 证据：source-map.md 记录引用小节的真实源文件位置；经标题匹配，无缺失小节。
- 一手资料：核对 PostgreSQL、RabbitMQ、Stripe、Raft、Protobuf、Debezium、Temporal、Flink、RocksDB、Parquet、Cassandra、Materialize 与 Lamport 论文等。
- 关键复核：复制与备份、quorum 与共识、因果顺序与实时顺序、fencing 的资源端执行、幂等与交换性、快照与可串行化、检查点与外部副作用、水位线与迟到策略、日志回收与消费者契约。
- 图像：内置 Image Gen 生成七幅中文图并逐图视觉检查；日志／派生视图图二次修改，移除了无依据的计数柱图与时间戳，改为日志定义顺序。
- 所有图均为机制示意；参数范围、例外与协议假设在相邻正文／图注说明。
- 原书正文与研究摘录不复制到博客，只发布原创归纳和七幅新图。
- 博客内容校验：通过，110 篇文章。
- 完整构建：通过，Astro check 为 0 errors、0 warnings，Pagefind 生成成功。
- 产物检查：1 个 H1、36 个编号条目、7 个插图引用全部存在。
- 视觉检查：Chromium 桌面 1440×1100、移动端 412×915 页面截图检查通过；插图另在原始尺寸逐图检查。
- 一致性：本地／博客正文规范化图片路径后完全一致，7 个原图 SHA-256 一致。
- 网页图像：自动生成 WebP，7 张合计约 0.8 MB。
- 提交：c6a2837，范围仅 src/content/posts/0156 的 8 个文件。
- 博客地址：https://quboliu.github.io/posts/0156/
- 线上部署：GitHub Actions 34442210073 build 与 deploy 均成功。
- 线上检查：文章 HTTP 200，36 个编号条目完整，7 张 WebP 图片均 HTTP 200，最终 FLP 补充段落已上线。
