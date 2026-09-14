# 数据库复制日志博客配套材料

博客主文：[DDIA 复制日志分类与数据库实现对照](https://quboliu.github.io/posts/0178/)。

文稿使用本地 DDIA V2 第 6 章、PostgreSQL 18 与 MySQL 8.4 官方资料，结合 AWS 等厂商对物理／逻辑复制的用语。正文就近提供资料链接。

## 实验范围

2026-09-10 在两个临时、无网络端口暴露的 Docker 容器内运行，版本分别为 PostgreSQL 18.6 与 MySQL 8.4.11。未访问业务数据库。实测限于日志生成与读取，不含双节点网络抓包、故障切换或性能测试。文中的协议时序和应用流程来自官方资料。

MySQL 8.4 精简容器未包含 mysqlbinlog，因此保存的是服务器 SHOW BINLOG EVENTS 输出与原始 binlog。正文明确区分 mysqlbinlog 显示形式示意与真实终端输出。

## 复现日志

在自行准备的空白测试实例中执行 [postgres-demo.sql](postgres-demo.sql) 或 [mysql-demo.sql](mysql-demo.sql)。不要在已经存在同名测试对象的数据库重复执行。

PostgreSQL 配置要求 `wal_level=logical`，并安装提供 `test_decoding` 的组件。执行 SQL 后记录 begin_lsn、end_lsn 和 data_directory，使用同版本工具：

```bash
pg_waldump -p /实际数据目录/pg_wal -s 起点LSN -e 终点LSN
```

本次运行的实际范围是 `0/17EA740` 到 `0/17EA960`。其他实例的 LSN、OID、事务号、时间戳和 FPI 数量会不同。不要将本文数值硬编码为复现条件。逻辑槽的 peek 接口不会推进消费位置；实验完成后可在确认不再使用时删除两个实验槽。

MySQL 需开启 binlog。本文还开启 GTID、`enforce_gtid_consistency`，使用 InnoDB，关闭事务压缩，不加密 binlog。每次 FLUSH 后的 SHOW BINARY LOG STATUS 可用于记录文件名。分别运行：

```sql
SHOW BINLOG EVENTS IN '实际的文件名';
```

如已安装同版本 mysqlbinlog，可对保存的文件执行：

```bash
mysqlbinlog --base64-output=DECODE-ROWS -vv evidence/mysql-row-full.binlog
```

本次真实文件：000004 为语句更新，000005 为 ROW/FULL，000006 为 ROW/MINIMAL。为了便于阅读，附件原始文件重命名为 mysql-statement.binlog、mysql-row-full.binlog、mysql-row-minimal.binlog，内部事件保持原样。

## 检查附件中的字节

```bash
python3 inspect_samples.py
```

这个脚本只支持本文两个 INT 列的样本，不是通用 binlog 消费器。它验证事件长度、CRC32、Table_map 对象与列类型、行镜像，以及 pgoutput U 的字段长度和值，输出 sample-verification.txt。

## 插图

使用内置 Image Gen 生成，共 9 张正文插图；提示词保存在 `figure-prompts.json`，追加生成及修订指令保存在 `figure-revisions.json`。正文采用的 9 张修订版位于[文章目录](../../../src/content/posts/0178/)；`assets/` 仅保留替换前版本的生成记录。

已检查中文关键标签、复制箭头、事件头大小、PG 固定头校验字段、CopyData/XLogData 嵌套关系，以及真实行值的十六进制。结构图明确为示意，真实字节图为实验载荷节选；细节以正文、样本和官方资料为准。
