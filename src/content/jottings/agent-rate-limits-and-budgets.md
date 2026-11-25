---
pubDatetime: 2026-11-25T15:00:20+08:00
lang: zh-CN
---

今天重温了一下Salman Munaf的演讲[AI Agents Are Also Distributed Systems](https://quboliu.github.io/posts/0128/)，里面有这么一段内容：
It is also important to assign rate limits and budgets. An agent can run your cost, uh, if it’s not assigned proper budgets and rate limits. It will keep retrying and try to solve the problem that if it’s facing. So it is important that we have set up max turns, max parallelism, max spend, to ensure that the model is not, uh, uh, not crossing the budget boundary that we have set.

同时，限流（Rate Limits）与预算配额管理（Budgets）也必不可少。如果没有严格的预算和频次限制，Agent 在遇到死胡同时会不断重试、不断扩大并发，疯狂烧掉你的资金。所以必须严格设置最大轮数、最大并发数和最大开销阈值，确保模型绝不会逾越预设的成本边界。

想到之前codex在参与制作五代mod大地图的时候，为了视觉上根本看不出来的几毫米的地图细节在无人监管的情况下，自我拉扯了10几个钟头，消耗了我一般的周限额，提交了一堆无意义的内容，最终在整个地图任务没有丝毫有实质性的进展。
