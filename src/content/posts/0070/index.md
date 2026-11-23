---
lang: "zh-CN"
pubDatetime: 2026-05-12T12:00:00+08:00
timezone: "Asia/Shanghai"
title: "2026.05.12-Vibe Coding 组内扫盲分享"
featured: true
area: "ai-and-agents"
draft: false
tags:
  - "Vibe Coding"
  - "Agent"
  - "分享"
description: "一次 Vibe Coding 分享：Agent 的软件形态与本质结构、Claude Code / Codex / OpenCode / Cursor / Trae 五种工具的机制对比、工程化流程与框架、崩溃与破坏的教训，以及个人日常工作流。"
---

## 上篇 · 原理与机制

### 一. Agent 软件形态

![image](assets/image-20260429132343-ygmbchg.webp)

#### 1. 基于 VSCode 开源版本的 AI-IDE：GUI

![image](assets/image-20260429142708-e4z0i6a.webp)

#### 2. 运行在服务器 / VPS 中的 CLI

![image](assets/image-20260429142835-jl5xd71.webp)

![image](assets/image-20260429154548-2l37d8a.webp)

#### 3. 原生桌面 APP

![image](assets/image-20260429142940-zqbjp77.webp)

### 二. Agent 的本质结构

#### 1. Agent 基本架构

一个 Agent ≈ **LLM + 工具集 + 上下文管理 + ReAct 循环**。

![image](assets/image-20260429132442-2c2jn87.webp)

#### 2. LLM 的能力——Agent 的“硬件级”支撑

##### 2.1 模型能力和模型工具

各家 AI 开放平台在 API 售卖页上，都会列出自家模型的能力清单。下面挑几张典型的截图，看看 Agent 的"地基"由什么组成。

![image](assets/image-20260512140325-busesaf.webp)

##### 2.2 Structured Output 和 Tool Calling（Function Calling）

**Structured Output（结构化输出）** ：在大模型领域，结构化输出基本等同于"JSON 输出"。它是工具调用的载体——没有稳定的结构化输出，工具调用就会频繁失败，ReAct 循环跑不下去，Agent 的可用性也无从谈起。

**Tool Calling（工具调用）** ：大模型的"手臂"。模型通过结构化输出，表达"我要用哪个工具、传什么参数"。

这和传统软件里一个服务发起 RPC 调用很像，区别在于：请求是大模型自己生成的。Agent 客户端拿到响应后，解析参数、执行工具、把结果再喂回给模型。

![image](assets/image-20260512140355-l8tavb6.webp)

![image](assets/image-20260512140407-mgtn59b.webp)

![image](assets/image-20260512140420-j1pqsa1.webp)

![image](assets/image-20260512140432-zj2d07c.webp)

![image](assets/image-20260512140444-a2ei9at.webp)

#### 3. Agent 的入口和"令牌"：上下文窗口和 Prompt管理

> "上下文窗口" 是指语言模型在生成响应时可以引用的所有文本，包括响应本身。
>
> —— Claude API Docs

- 上下文窗口：所有信息（系统提示、对话历史、工具结果、文件内容）—— 文本格式的prompt，外部世界和LLM交互的唯一入口。

![image](assets/image-20260512144421-z5azd7e.webp)

### 三. Agent的能力与机制

#### 1. “全知全能”的llm和具体的需求

![image](assets/image-20260506122830-6r9tasw.webp)

---

![image](assets/image-20260429142002-hp2jero.webp)

---

![image](assets/image-20260429155254-g0eas5a.webp)

---

![image](assets/image-20260512160056-p6megmn.webp)

#### 2. Agent 机制概览与硬软约束

##### 硬约束 vs 软规则

![image](assets/image-20260512160446-fo18a82.webp)

##### 机制全景：三层

![image](assets/image-20260512160617-t0mz9un.webp)

##### 五种 Agent 工具下的具体形态

下面对比 Claude Code、Codex（OpenAI CLI）、OpenCode（sst/opencode）、Cursor、Trae 五种工具中，每种机制的**位置 / 格式 / 是否硬性规定**。所有事实均来自各家官方文档或开源仓库，引用见小节末尾。

##### 总览矩阵

| 机制               | Claude Code                                                      | Codex                                                                         | OpenCode                                                              | Cursor                                                                                    | Trae                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **持久知识**       | `CLAUDE.md`<br />项目/用户/企业三级                              | `AGENTS.md`<br />+`AGENTS.override.md`子目录覆盖                              | `AGENTS.md`<br />向下兼容`CLAUDE.md`                                  | `AGENTS.md`<br />项目根，纯 Markdown                                                      | `.trae/rules/project_rules.md`<br />+`user_rules.md`                                                                                                                                   |
| **Skills**         | `.claude/skills/<name>/SKILL.md`<br />遵循 Agent Skills 开放标准 | `.agents/skills/<name>/SKILL.md`<br />frontmatter 必需`name`+`description`    | 同时识别`.opencode/`、`.claude/`、`.agents/`三套路径                  | `.cursor/skills/<name>/SKILL.md`<br />+`~/.cursor/skills/`                                | 项目技能：项目所在路径下的 .trae/skills/ 目录。<br />全局技能：<br />macOS/Linux：本地根目录 ~/.trae/skills。<br />Windows：本地根目录 %userprofile%/.trae/skills。                    |
| **Rules**          | `.claude/rules/*.md`<br />frontmatter`paths:`glob 触发           | 无独立 Rules，靠 AGENTS.md + Skills                                           | 无独立 Rules，文档里的 "Rules" 即 AGENTS.md                           | `.cursor/rules/*.mdc`<br />**四种触发模式**：always / globs / agent-requested / manual`@` | `.trae/rules/`（与持久知识同源）                                                                                                                                                       |
| **Hooks**          | `settings.json`<br />**30+ 事件**，五种 hook 类型                | `~/.codex/hooks.json`或 TOML<br />6 个事件，需 feature flag`codex_hooks=true` | `.opencode/plugins/*.ts`<br />20+ 事件，TS/JS 插件                    | `.cursor/hooks.json`<br />~18 事件，**唯一覆盖 Tab 补全**                                 |                                                                                                                                                                                        |
| **Slash Commands** | `.claude/commands/*.md`<br />已并入 Skills，老路径仍兼容         | `~/.codex/prompts/`<br />**已 deprecated**，官方推荐迁向 Skills               | `.opencode/commands/*.md`<br />支持`$ARGUMENTS`、`!`cmd \``、`@file\` | `.cursor/commands/*.md`<br />v1.6+ 起支持                                                 | 命令目录<br />项目命令：项目所在路径下的 .trae/commands 目录。<br />全局命令：<br />macOS/Linux：本地根目录 ~/.trae/commands。<br />Windows：本地根目录 %userprofile%/.trae/commands。 |
| **SPEC 模板**      | 无官方模板                                                       | 无官方模板                                                                    | 无官方模板                                                            | 无官方模板                                                                                | 无官方模板                                                                                                                                                                             |

##### 说明

1. **AGENTS.md 已经是跨工具公约**。由 Linux Foundation 旗下的 Agentic AI Foundation 托管，agents.md 官方列出的支持方包括 OpenAI Codex、OpenCode、Cursor、Aider、Zed、VS Code、Devin、JetBrains Junie、GitHub Copilot Coding Agent、Windsurf、Augment 等。**Claude Code 不直接读 AGENTS.md，但官方文档明确推荐** **`@AGENTS.md`** **导入或建符号链接互通**。
2. **没有任何一家提供"官方 SPEC 文档模板"** 。kiro、openspec 都是社区方案。各家 `/init` 只生成持久知识文件（CLAUDE.md / AGENTS.md）的脚手架，不涉及需求规范。

## 下篇 · 工程与实践

### 四. Agent 编码的"流程与框架"——在上下文中“封装”软件工程

Harness：从写文档、写代码到软件工程

#### 1. 根节点：研发人员的思维是起点

![image](assets/image-20260512150307-wk3t0z5.webp)

![image](assets/image-20260512151807-km01op3.webp)

#### 2. 研发人员的日常维护：从 AGENTS.md 到 SKILL 到 SPEC文档

![image](assets/image-20260512150400-wi459h6.webp)

![image](assets/image-20260512145317-wt5tdm8.webp)

#### 3. 预期管理

及时纠正 && 反馈纠正

![image](assets/image-20260512144531-n7w321t.webp)

#### 4. Review 和验收：看不到代码心里没底？

##### 4.1 人类成为“瓶颈”

![image](assets/image-20260512141445-fkfteuf.webp)

![image](assets/image-20260512142610-x1o0s5e.webp)

**怎么解决？**

![image](assets/image-20260429161704-mhy6vm3.webp)

![image](assets/image-20260429164131-wmdcyvz.webp)

##### 4.2 Review

![image](assets/image-20260512142929-24x52op.webp)

##### 4.3 自测验收

![image](assets/image-20260512143819-hoikrou.webp)

#### 5. 升级：开源框架

有了上手体验之后，可以引入或参考成熟的流程管理框架与开源 Skill 包。

##### 5.1 openspec（[Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)）

![image](assets/image-20260512163007-rmqw9p3.webp)

##### 5.2 superpowers（[obra/superpowers](https://github.com/obra/superpowers)）

![image](assets/image-20260512163034-rjka8eu.webp)

##### 5.3 mattpocock/skills（[mattpocock/skills](https://github.com/mattpocock/skills)）

![image](assets/image-20260512163050-tvjsgnb.webp)

##### 5.4 横向对比

![image](assets/image-20260512162648-051csyp.webp)

#### 6. 新领域知识：快速实践与选择性学习

![image](assets/image-20260512152752-017ps3y.webp)

**如果想要提升掌握感：**

任务涉及到的领域知识可能层层依赖：理解A 需要 理解B，理解B 需要 理解C，理解C 需要 理解D。

![image](assets/image-20260512152616-f6scf2g.webp)

一条原则：**凡是媒介是文本格式的任务，都属于 LLM 的射程**。

唯一不在它射程内的，是你脑子里的想法——你究竟想要什么，想得够不够清楚。

中间所有流程性、工具性的环节，都是把"想法"投射到现实世界的媒介，全部可以让 LLM 代劳。

**警告**：请在合理的范围内预支自己的能力，一旦严重超出自己的认知能力，结果就是不可维护、不可迭代、不可收拾。

### 五. 崩溃与破坏

#### 1. 大模型能力与上下文衰退

##### 1.1 大模型能力的决定性作用

![image](assets/image-20260512141824-8by77my.webp)

![image](assets/image-20260512141833-8vdg6jc.webp)

![image](assets/image-20260512154459-kcocb3x.webp)

##### 1.2 上下文衰退

> 更大的上下文窗口允许模型处理更复杂、更长的提示，但更多上下文并不一定更好。随着 token 数量增加，准确性和召回率会下降，这种现象被称为"上下文衰退"。这使得"上下文里放什么"与"窗口有多大"同等重要。

![image](assets/image-20260512144421-z5azd7e.webp)

![image](assets/image-20260512161904-giyrd1c.webp)

#### 2. 研发人员崩溃：能力透支

1. 知识和技能严重超支，项目规模与复杂度远超出个人的认知与能力范畴，项目迭代和维护与Agent强绑定。
2. 研发人员没有学习，没有成长，彻底沦为大模型与物理世界需求的信息传输“管道”。

![image](assets/image-20260429162017-xl8pgae.webp)

![image](assets/image-20260512154306-520httz.webp)

![image](assets/image-20260429005402-5nacf1r.webp)

#### 3. 安全与破坏 —— 做好隔离

尽量不要把关键的token或者敏感路径，敏感账密之类的暴露在llm上下文中，可以给它新建一条专用的账户，譬如专用的github账户等。

##### 3.1 提示词攻击："你好，小爱同学"

陌生人能唤醒小爱同学然后下达指令算是一种最简单的“提示词攻击”。

![image](assets/image-20260429153450-nq0zsx4.webp)

##### 3.2 删库跑路：隔离与备份

![image](assets/image-20260430111847-can966z.webp)

### 六. 个人日常工作流

![image](assets/image-20260512154842-5eyglrw.webp)
