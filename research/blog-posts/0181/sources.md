# 来源与写作边界

核查日期：2026-09-14。正文使用官方历史、作者回忆、项目文档与原始论文，不进行组件性能排名，无独立基准实验。全文引用链接贴近对应事实。

- PostgreSQL：官方 history.html（1986、Postgres95、1996 命名），extend.html（扩展机制），datatype-json.html、textsearch.html；pgvector 官方仓库。
- Redis：Redis Turns 10；Salvatore Sanfilippo 2009-06-27 的 How Redis is behaving in production with lloogg.com；当前数据类型、持久化及分布式锁官方文档。
- Kafka：LinkedIn 2011-01-11 开源公告、2011-07-21 原始项目介绍；Apache Kafka 4.1 官方 introduction、upgrade、zk2kraft 页面。4.0 移除 ZooKeeper 是历史事实，不称 4.1 为最新版。
- ZooKeeper：Hunt 等，USENIX ATC 2010 原始论文，特别是第 1–3 页及锁 recipe；当前官方概述。避免把本地普通读说成线性一致读。
- etcd：CNCF 2020 毕业公告核对 2013 年 CoreOS 起源；v3.6 Why etcd 和 API guarantees。注意文档中的 serializable 读取特指允许旧读，不能混同数据库可串行化隔离级别。
- Nginx：Igor Sysoev 2008-05-04 邮件 history of Nginx；官方二十周年回顾；nginx.org 功能介绍与 proxy_next_upstream 文档。

两篇一起交本地 Kimi 审稿，审稿请求、原始输出与主作者回应归档在 ../0182/。没有生成配图或外部实验，没有博客资料写入 DDIA 工作目录。
