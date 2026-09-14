# 章节证据定位

本表记录文章各条所引用的小节位置。路径相对于本表所在目录，链接指向当前本地 Typst 源文件。补回小节按实际 include 归属纳入。此表不发布到博客。

### 01．把正确性写成不变量，把故障写成假设

- 第 2 章「可靠性与容错」：[源文件第 324 行](../../chapters/ch02-defining-nonfunctional-requirements.typ)
- 第 9 章「系统模型与现实」：[源文件第 1519 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)
- 第 9 章「区分安全性与活性」：[源文件第 1649 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)
- 第 13 章「追求正确性」：[源文件第 922 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 02．把冗余放到目标故障范围之外

- 第 1 章「存储与计算分离」：[源文件第 662 行](../../chapters/ch01-trade-offs-in-data-systems-architecture.typ)
- 第 2 章「通过冗余容忍硬件故障」：[源文件第 430 行](../../chapters/ch02-defining-nonfunctional-requirements.typ)
- 第 6 章「复制」：[源文件第 3 行](../../chapters/ch06-replication.typ)
- 第 6 章「区域与可用区」：[源文件第 3 行](../../recovered/ch06-regions-and-availability-zones.typ)
- 第 11 章「分布式文件系统」：[源文件第 421 行](../../chapters/ch11-batch-processing.typ)

### 03．在线副本保护当前状态，历史备份保留恢复选择

- 第 6 章「备份与复制」：[源文件第 3 行](../../recovered/ch06-backups-and-replication.typ)
- 第 6 章「设置新的追随者」：[源文件第 162 行](../../chapters/ch06-replication.typ)
- 第 13 章「信任，但要验证」：[源文件第 1517 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 04．先检测信息是否损坏，再谈修复

- 第 4 章「让 B 树可靠」：[源文件第 393 行](../../chapters/ch04-storage-and-retrieval.typ)
- 第 6 章「追赶错过的写入」：[源文件第 1192 行](../../chapters/ch06-replication.typ)
- 第 9 章「较弱形式的撒谎」：[源文件第 1499 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)
- 第 13 章「在面对软件缺陷时维护完整性」：[源文件第 1537 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 05．复杂状态难以一次写完，就先持久化恢复依据

- 第 4 章「让 B 树可靠」：[源文件第 393 行](../../chapters/ch04-storage-and-retrieval.typ)
- 第 6 章「预写式日志传送」：[源文件第 346 行](../../chapters/ch06-replication.typ)
- 第 8 章「原子性」：[源文件第 129 行](../../chapters/ch08-transactions.typ)
- 第 8 章「持久性」：[源文件第 235 行](../../chapters/ch08-transactions.typ)

### 06．给逻辑对象稳定身份，才能跨尝试识别它

- 第 10 章「ID 生成器与逻辑时钟」：[源文件第 581 行](../../chapters/ch10-consistency-and-consensus.typ)
- 第 13 章「唯一标识请求」：[源文件第 1047 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 07．确认消息描述的是一个完成阶段

- 第 6 章「同步复制与异步复制」：[源文件第 102 行](../../chapters/ch06-replication.typ)
- 第 9 章「TCP 的局限性」：[源文件第 171 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)
- 第 12 章「确认与重新投递」：[源文件第 348 行](../../chapters/ch12-stream-processing.typ)

### 08．超时代表缺少结果，需要重试策略而不是武断结论

- 第 2 章「过载系统为何无法自行恢复」：[源文件第 3 行](../../recovered/ch02-overload-recovery.typ)
- 第 5 章「远程过程调用的问题」：[源文件第 852 行](../../chapters/ch05-encoding-and-evolution.typ)
- 第 9 章「超时与无界延迟」：[源文件第 320 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)

### 09．把重复尝试折叠为一次可观察的业务效果

- 第 8 章「再谈恰好一次的消息处理」：[源文件第 2293 行](../../chapters/ch08-transactions.typ)
- 第 12 章「幂等性」：[源文件第 2000 行](../../chapters/ch12-stream-processing.typ)
- 第 13 章「重复抑制」：[源文件第 1000 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)
- 第 13 章「唯一标识请求」：[源文件第 1047 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 10．端到端保证要覆盖真正产生效果的最后一跳

- 第 5 章「持久化执行与工作流」：[源文件第 982 行](../../chapters/ch05-encoding-and-evolution.typ)
- 第 8 章「跨不同系统的分布式事务」：[源文件第 2069 行](../../chapters/ch08-transactions.typ)
- 第 12 章「变更数据捕获与数据库模式」：[源文件第 3 行](../../recovered/ch12-cdc-database-schemas.typ)
- 第 13 章「数据库的端到端论证」：[源文件第 966 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 11．只要操作不交换，就需要定义冲突语义

- 第 5 章「分布式 Actor 框架」：[源文件第 1150 行](../../chapters/ch05-encoding-and-evolution.typ)
- 第 6 章「单领导者复制」：[源文件第 56 行](../../chapters/ch06-replication.typ)
- 第 6 章「处理冲突写入」：[源文件第 896 行](../../chapters/ch06-replication.typ)
- 第 8 章「实际串行执行」：[源文件第 1281 行](../../chapters/ch08-transactions.typ)
- 第 13 章「全序的局限」：[源文件第 149 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 12．利用相交的裁决集合，让新决定承接旧决定

- 第 6 章「使用法定人数读写」：[源文件第 1218 行](../../chapters/ch06-replication.typ)
- 第 6 章「理解法定人数一致性的局限」：[源文件第 1286 行](../../chapters/ch06-replication.typ)
- 第 10 章「共识的微妙之处」：[源文件第 1225 行](../../chapters/ch10-consistency-and-consensus.typ)
- 第 10 章「CAP 定理」：[源文件第 504 行](../../chapters/ch10-consistency-and-consensus.typ)

- 第 10 章「共识的不可能性」：[源文件第 3 行](../../recovered/ch10-impossibility-of-consensus.typ)

### 13．需要因果关系时，记录依赖而不是迷信墙上时钟

- 第 6 章「先发生关系与并发」：[源文件第 1490 行](../../chapters/ch06-replication.typ)
- 第 6 章「版本向量」：[源文件第 1586 行](../../chapters/ch06-replication.typ)
- 第 9 章「不可靠的时钟」：[源文件第 544 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)
- 第 10 章「逻辑时钟」：[源文件第 581 行](../../chapters/ch10-consistency-and-consensus.typ)
- 第 10 章「线性一致的 ID 生成器」：[源文件第 671 行](../../chapters/ch10-consistency-and-consensus.typ)

### 14．权限会过期，就让资源端拒绝旧持有者

- 第 9 章「进程暂停」：[源文件第 930 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)
- 第 9 章「分布式锁与租约」：[源文件第 1236 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)
- 第 9 章「隔离僵尸与延迟请求」：[源文件第 1304 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)

### 15．把共同成立的修改放进同一个提交决定

- 第 8 章「原子性」：[源文件第 129 行](../../chapters/ch08-transactions.typ)
- 第 8 章「两阶段提交」：[源文件第 1921 行](../../chapters/ch08-transactions.typ)
- 第 8 章「承诺体系」：[源文件第 1965 行](../../chapters/ch08-transactions.typ)
- 第 8 章「协调者故障」：[源文件第 2007 行](../../chapters/ch08-transactions.typ)
- 第 10 章「作为共识的原子提交」：[源文件第 1054 行](../../chapters/ch10-consistency-and-consensus.typ)

### 16．不提前阻塞，也可以在提交时验证决策前提

- 第 8 章「条件写入」：[源文件第 961 行](../../chapters/ch08-transactions.typ)
- 第 8 章「写偏差与幻读」：[源文件第 1025 行](../../chapters/ch08-transactions.typ)
- 第 8 章「可串行化快照隔离」：[源文件第 1655 行](../../chapters/ch08-transactions.typ)

### 17．保留多个版本，让读者使用稳定的过去

- 第 8 章「多版本并发控制」：[源文件第 693 行](../../chapters/ch08-transactions.typ)
- 第 8 章「观察一致性快照的可见性规则」：[源文件第 735 行](../../chapters/ch08-transactions.typ)
- 第 8 章「写偏差」：[源文件第 1025 行](../../chapters/ch08-transactions.typ)
- 第 9 章「用于全局快照的同步时钟」：[源文件第 872 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)

### 18．能利用代数性质时，把协调变成合并

- 第 6 章「自动冲突解决」：[源文件第 1022 行](../../chapters/ch06-replication.typ)
- 第 6 章「无冲突复制数据类型与操作转换」：[源文件第 1054 行](../../chapters/ch06-replication.typ)
- 第 8 章「冲突解决与复制」：[源文件第 993 行](../../chapters/ch08-transactions.typ)
- 第 13 章「避免协调的数据系统」：[源文件第 1476 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 19．让常一起访问的数据靠近，减少昂贵的数据移动

- 第 3 章「读写时的数据局部性」：[源文件第 766 行](../../chapters/ch03-data-models-and-query-languages.typ)
- 第 4 章「B 树」：[源文件第 327 行](../../chapters/ch04-storage-and-retrieval.typ)
- 第 4 章「面向列的存储」：[源文件第 691 行](../../chapters/ch04-storage-and-retrieval.typ)
- 第 4 章「全文搜索」：[源文件第 1147 行](../../chapters/ch04-storage-and-retrieval.typ)
- 第 11 章「连接与分组」：[源文件第 1081 行](../../chapters/ch11-batch-processing.typ)

### 20．把固定开销摊给一批工作

- 第 4 章「构建与合并 SSTable」：[源文件第 197 行](../../chapters/ch04-storage-and-retrieval.typ)
- 第 4 章「查询执行：编译与向量化」：[源文件第 956 行](../../chapters/ch04-storage-and-retrieval.typ)
- 第 11 章「批处理模型」：[源文件第 845 行](../../chapters/ch11-batch-processing.typ)
- 第 12 章「微批处理与检查点」：[源文件第 1940 行](../../chapters/ch12-stream-processing.typ)

### 21．用空间和更新成本，换取更便宜的读取

- 第 2 章「物化并更新时间线」：[源文件第 112 行](../../chapters/ch02-defining-nonfunctional-requirements.typ)
- 第 3 章「规范化、反规范化与连接」：[源文件第 265 行](../../chapters/ch03-data-models-and-query-languages.typ)
- 第 4 章「物化视图与数据立方体」：[源文件第 1030 行](../../chapters/ch04-storage-and-retrieval.typ)
- 第 13 章「物化视图与缓存」：[源文件第 730 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 22．用更紧凑的信息表示，减少必须处理的数据

- 第 2 章「计算百分位数」：[源文件第 3 行](../../recovered/ch02-computing-percentiles.typ)
- 第 4 章「布隆过滤器」：[源文件第 257 行](../../chapters/ch04-storage-and-retrieval.typ)
- 第 4 章「列压缩」：[源文件第 785 行](../../chapters/ch04-storage-and-retrieval.typ)
- 第 4 章「向量嵌入」：[源文件第 1208 行](../../chapters/ch04-storage-and-retrieval.typ)

### 23．拆分工作，同时保留需要共同裁决的边界

- 第 7 章「键值数据的分片」：[源文件第 192 行](../../chapters/ch07-sharding.typ)
- 第 7 章「分片与二级索引」：[源文件第 653 行](../../chapters/ch07-sharding.typ)
- 第 8 章「分片」：[源文件第 1401 行](../../chapters/ch08-transactions.typ)
- 第 11 章「数据混洗」：[源文件第 993 行](../../chapters/ch11-batch-processing.typ)
- 第 11 章「连接与分组」：[源文件第 1081 行](../../chapters/ch11-batch-processing.typ)

### 24．优化瓶颈和尾部，而不是只优化平均值

- 第 2 章「响应时间指标的使用」：[源文件第 302 行](../../chapters/ch02-defining-nonfunctional-requirements.typ)
- 第 7 章「偏斜负载与消除热点」：[源文件第 478 行](../../chapters/ch07-sharding.typ)
- 第 11 章「处理故障」：[源文件第 795 行](../../chapters/ch11-batch-processing.typ)

### 25．有限缓冲必须配合流量控制

- 第 2 章「过载系统为何无法自行恢复」：[源文件第 3 行](../../recovered/ch02-overload-recovery.typ)
- 第 9 章「网络拥塞与排队」：[源文件第 370 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)
- 第 11 章「资源分配」：[源文件第 675 行](../../chapters/ch11-batch-processing.typ)
- 第 12 章「消费者跟不上生产者时」：[源文件第 578 行](../../chapters/ch12-stream-processing.typ)

### 26．用间接寻址隔离变化，把协调集中到必要元数据

- 第 1 章「云服务的分层」：[源文件第 628 行](../../chapters/ch01-trade-offs-in-data-systems-architecture.typ)
- 第 1 章「存储与计算分离」：[源文件第 662 行](../../chapters/ch01-trade-offs-in-data-systems-architecture.typ)
- 第 5 章「负载均衡器、服务发现与服务网格」：[源文件第 887 行](../../chapters/ch05-encoding-and-evolution.typ)
- 第 7 章「请求路由」：[源文件第 569 行](../../chapters/ch07-sharding.typ)
- 第 10 章「协调服务」：[源文件第 1290 行](../../chapters/ch10-consistency-and-consensus.typ)

### 27．把变化记录与当前表示分开

- 第 1 章「记录系统与派生数据」：[源文件第 436 行](../../chapters/ch01-trade-offs-in-data-systems-architecture.typ)
- 第 3 章「事件溯源与 CQRS」：[源文件第 1832 行](../../chapters/ch03-data-models-and-query-languages.typ)
- 第 12 章「数据库与流」：[源文件第 638 行](../../chapters/ch12-stream-processing.typ)
- 第 12 章「CDC 与事件溯源的比较」：[源文件第 944 行](../../chapters/ch12-stream-processing.typ)
- 第 13 章「推理数据流」：[源文件第 79 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 28．让相同输入产生相同结果，才能可靠重放

- 第 6 章「基于语句的复制」：[源文件第 310 行](../../chapters/ch06-replication.typ)
- 第 9 章「确定性的力量」：[源文件第 3 行](../../recovered/ch09-power-of-determinism.typ)
- 第 10 章「使用共享日志」：[源文件第 1141 行](../../chapters/ch10-consistency-and-consensus.typ)
- 第 12 章「连接的时间依赖性」：[源文件第 1864 行](../../chapters/ch12-stream-processing.typ)
- 第 13 章「面向可审计性设计」：[源文件第 1595 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 29．保存一致的恢复边界，让状态与进度一起回到过去

- 第 6 章「设置新的追随者」：[源文件第 162 行](../../chapters/ch06-replication.typ)
- 第 12 章「初始快照」：[源文件第 838 行](../../chapters/ch12-stream-processing.typ)
- 第 12 章「微批处理与检查点」：[源文件第 1940 行](../../chapters/ch12-stream-processing.typ)
- 第 12 章「重新审视原子提交」：[源文件第 1974 行](../../chapters/ch12-stream-processing.typ)

### 30．输入只变一点，就尽量只更新受影响的结果

- 第 12 章「增量视图维护」：[源文件第 3 行](../../recovered/ch12-incremental-view-maintenance.typ)
- 第 12 章「表—表连接」：[源文件第 1797 行](../../chapters/ch12-stream-processing.typ)
- 第 13 章「维护派生状态」：[源文件第 232 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)
- 第 13 章「围绕数据流设计应用」：[源文件第 510 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 31．要判断“已经齐了”，必须获得进度依据或声明等待策略

- 第 12 章「事件时间与处理时间」：[源文件第 1527 行](../../chapters/ch12-stream-processing.typ)
- 第 12 章「处理迟到事件」：[源文件第 1565 行](../../chapters/ch12-stream-processing.typ)
- 第 12 章「窗口类型」：[源文件第 1659 行](../../chapters/ch12-stream-processing.typ)

### 32．安全删除历史，需要知道它已不再被依赖

- 第 6 章「捕获先发生关系」：[源文件第 1520 行](../../chapters/ch06-replication.typ)
- 第 8 章「多版本并发控制」：[源文件第 693 行](../../chapters/ch08-transactions.typ)
- 第 12 章「磁盘空间使用」：[源文件第 544 行](../../chapters/ch12-stream-processing.typ)
- 第 12 章「日志压缩」：[源文件第 864 行](../../chapters/ch12-stream-processing.typ)
- 第 12 章「不可变性的局限」：[源文件第 1185 行](../../chapters/ch12-stream-processing.typ)

### 33．新旧版本必然有共存期，就把迁移设计成协议

- 第 5 章「字段标签与模式演进」：[源文件第 365 行](../../chapters/ch05-encoding-and-evolution.typ)
- 第 5 章「写入者模式与读取者模式」：[源文件第 475 行](../../chapters/ch05-encoding-and-evolution.typ)
- 第 13 章「重新处理数据以实现应用演进」：[源文件第 258 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)
- 第 13 章「铁路上的模式迁移」：[源文件第 3 行](../../recovered/ch13-schema-migrations-on-railways.typ)

### 34．把目标与执行方式分开，才能替换和组合实现

- 第 2 章「简单性：管理复杂性」：[源文件第 773 行](../../chapters/ch02-defining-nonfunctional-requirements.typ)
- 第 3 章「声明式查询语言」：[源文件第 3 行](../../recovered/ch03-declarative-query-languages.typ)
- 第 11 章「命令链与自定义程序」：[源文件第 276 行](../../chapters/ch11-batch-processing.typ)
- 第 11 章「查询语言」：[源文件第 1147 行](../../chapters/ch11-batch-processing.typ)
- 第 13 章「解耦数据库」：[源文件第 310 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 35．把验证和修复做成系统能力

- 第 9 章「形式化方法与随机化测试」：[源文件第 1741 行](../../chapters/ch09-the-trouble-with-distributed-systems.typ)
- 第 13 章「信任，但要验证」：[源文件第 1517 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)
- 第 13 章「面向可审计性设计」：[源文件第 1595 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)
- 第 13 章「再论端到端论证」：[源文件第 1621 行](../../chapters/ch13-a-philosophy-of-streaming-systems.typ)

### 36．目标函数必须包括人的权益与系统外部后果

- 第 1 章「数据系统、法律与社会」：[源文件第 948 行](../../chapters/ch01-trade-offs-in-data-systems-architecture.typ)
- 第 12 章「不可变性的局限」：[源文件第 1185 行](../../chapters/ch12-stream-processing.typ)
- 第 14 章「责任与问责」：[源文件第 73 行](../../chapters/ch14-doing-the-right-thing.typ)
- 第 14 章「反馈回路」：[源文件第 99 行](../../chapters/ch14-doing-the-right-thing.typ)
- 第 14 章「隐私与数据使用」：[源文件第 199 行](../../chapters/ch14-doing-the-right-thing.typ)
