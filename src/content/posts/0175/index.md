---
lang: "zh-CN"
pubDatetime: 2026-09-13T14:01:03+08:00
timezone: "Asia/Shanghai"
title: "摘录：协调、约束与道歉的权衡"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "DDIA"
  - "摘录"
  - "分布式系统"
description: "DDIA 第 2 版第 13 章第 806 页摘录：协调和约束减少你为不一致道歉的次数，却可能增加你为中断道歉的次数。你无法把道歉降到零，只能寻找最佳权衡点。"
---
摘自 *Designing Data-Intensive Applications* 第 2 版第 13 章（第 806 页），"协调规避的数据系统"一节末尾。

## 原文（English）

> Another way of looking at coordination and constraints is that they reduce the number of apologies you have to make for inconsistencies but potentially also reduce the performance and availability of your system, and thus potentially increase the number of apologies you have to make for outages. You cannot reduce the number of apologies to zero, but you can aim to find the best trade-off for your needs—the sweet spot with neither too many inconsistencies nor too many availability problems.

## 译文（中文）

> 也可以这样看待协调和约束：它们减少了你必须为不一致而道歉的次数，但也可能降低系统的性能和可用性，从而增加你必须为中断而道歉的次数。你无法把道歉次数降到零，但可以根据需求寻找最佳权衡点——既没有太多不一致，也没有太多可用性问题。
