---
lang: "zh-CN"
pubDatetime: 2026-09-11T11:30:09+08:00
timezone: "Asia/Shanghai"
title: "DDIA 阅读札记：写入的样子，为什么不必是查询的样子？"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "DDIA"
  - "数据库"
  - "CQRS"
description: "用电商订单解释 DDIA 中的一句疑问：读写可以共用一套模型，但不必如此。写入维护业务事实，查询使用按需派生的表示。"
---
DDIA 第二版第 12 章有一句话：

> The traditional approach to database and schema design is based on the fallacy that data must be written in the same form as it will be queried.

即：“传统的数据库和模式设计建立在一种谬误之上：数据必须以查询时使用的同一种形式写入。”出处见 [第 12 章：Stream Processing](https://learning.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/ch12.html)。

这里的 schema 指**表结构、字段和关系**。“同一种形式”，指读写共用同一套数据模型。

用一个电商订单的例子就容易理解了。

用户下单时，系统把数据写进两张表：

```text
订单表：订单编号、用户、状态
订单明细表：订单编号、商品、数量、成交单价
```

用户打开“我的订单”时，再查询这些表，连接明细、汇总金额，拼出页面需要的结果。这就是常见做法：**写入这套表，查询也围绕这套表进行。**

如果页面访问量很大，每次连接和汇总都很费劲，我们可能想把总金额、商品摘要提前存好。但这又增加了冗余，修改时得维护多份数据。于是，同一套模型开始在“方便写”和“方便读”之间纠结。

换一个思路：业务写入仍然使用原来的表，再通过 CDC 或业务事件，持续更新一张专门供页面查询的表：

```text
订单列表读模型：
用户：42
订单：1001
状态：已付款
总金额：199 元
商品摘要：键盘 × 1，鼠标 × 1
```

页面直接读取它，无需每次重新拼装。整个过程是：

```text
下单、付款 → 业务表 → CDC / 事件 → 转换程序 → 订单列表读模型
```

**写入模型负责业务规则，读取模型负责查询便利。** 两者可以采用不同结构，甚至仍然放在同一个数据库里。这体现了 CQRS（Command Query Responsibility Segregation，命令查询职责分离）的思路。

重复数据依然存在，但现在有明确的转换程序负责维护它。因此，写入端可以使用规范化的结构，读取端可以使用反规范化的结构，不必让一套模型包办所有需求。这也不要求一定使用事件溯源，CDC 同样可以产生派生视图。

书中“谬误”这个词很重，真正需要抓住的是“必须”：**读写共用一套模型可以很合理，但不是唯一选择。** 分开以后也有成本——转换逻辑需要维护，异步更新可能让刚提交的订单暂时没有出现在列表里。
