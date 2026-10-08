---
title: "Anthropic 公司档案：Claude 产品与官方资源导航"
description: "从公司研究到 Claude 产品、API、Agent 开发与开放标准，按实际任务梳理 Anthropic 的官方资源与使用路径。"
subjectName: "Anthropic"
paparazziSection: "companies-products"
paparazziArea: "ai-and-agents"
logo: "/images/paparazzi/anthropic.png"
logoSource: "https://github.com/anthropics"
---

> 核验日期：2026 年 10 月 8 日  
> 面向开发者、研究者及希望高效使用 Claude 的读者。本文按实际任务梳理公开入口，并区分公司站点、官方托管账号、开放标准与第三方合作资源。

**先记住这几个入口：了解公司与研究，去 [Anthropic](https://www.anthropic.com/)；了解产品，去 [Claude](https://claude.com/)；直接使用，去 [claude.ai](https://claude.ai/)；调用 API，去 [Claude Platform](https://platform.claude.com/docs/en/home)；使用 Claude Code 或 Agent SDK，去 [Claude Code Docs](https://code.claude.com/docs/en/overview)。**

这是一份经过核验的导航指南，覆盖主要公开资源及使用路径。它不声称枚举 Anthropic 注册的全部域名、内部系统、每一篇文章或每个历史 URL。涉及价格、模型版本、课程和功能开放范围的内容，优先给出持续维护的入口，避免把易变信息固定成过时清单。

## 目录

- [一 按任务快速定位](#一-按任务快速定位)
- [二 理解域名与资源归属](#二-理解域名与资源归属)
- [三 公司研究与工程内容](#三-公司研究与工程内容)
- [四 产品与使用入口](#四-产品与使用入口)
- [五 API 与 Agent 开发文档](#五-api-与-agent-开发文档)
- [六 学习课程与实践材料](#六-学习课程与实践材料)
- [七 GitHub 与公开研究数据](#七-github-与公开研究数据)
- [八 MCP 与 Agent Skills 开放标准](#八-mcp-与-agent-skills-开放标准)
- [九 支持隐私安全与服务状态](#九-支持隐私安全与服务状态)
- [十 基础设施与第三方渠道](#十-基础设施与第三方渠道)
- [十一 推荐入口与相关地址对照](#十一-推荐入口与相关地址对照)
- [十二 推荐阅读路线与维护方法](#十二-推荐阅读路线与维护方法)

## 一 按任务快速定位

| 你要做什么             | 首选入口                                                                                             | 接下来找什么                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------ |
| 打开 Claude 开始工作   | [claude.ai](https://claude.ai/)                                                                      | 登录后的产品与设置             |
| 了解产品和订阅方案     | [产品官网](https://claude.com/) · [定价](https://claude.com/pricing)                                 | 具体方案的功能、用量与适用范围 |
| 接入 Claude API        | [Platform 文档](https://platform.claude.com/docs/en/home)                                            | Quickstart、模型、API 参考     |
| 管理 API 账户与资源    | [Platform 控制台](https://platform.claude.com/)                                                      | 密钥、用量、账单与组织管理     |
| 安装或配置 Claude Code | [Claude Code 文档](https://code.claude.com/docs/en/overview)                                         | 安装、权限、配置与故障排查     |
| 用 SDK 构建 Agent      | [Agent SDK 文档](https://code.claude.com/docs/en/agent-sdk/overview)                                 | Agent Loop、工具、权限与会话   |
| 学习 Agent 工程方法    | [Engineering](https://www.anthropic.com/engineering) · [开发者博客](https://claude.dev/)             | 架构、上下文、工具和评估       |
| 读论文和研究报告       | [Research](https://www.anthropic.com/research)                                                       | 团队页面、论文原文、数据与代码 |
| 按课程系统学习         | [Claude Academy](https://academy.claude.com/)                                                        | 学习路线、课程与练习           |
| 查看代码样例           | [在线 Cookbook](https://platform.claude.com/cookbook) · [GitHub](https://github.com/anthropics)      | 示例代码、README 与许可证      |
| 查 MCP 协议和服务器    | [MCP 文档](https://modelcontextprotocol.io/) · [Registry](https://registry.modelcontextprotocol.io/) | 规范、SDK、服务器元数据        |
| 处理账号问题或排查故障 | [帮助中心](https://support.claude.com/en/) · [状态页](https://status.claude.com/)                    | 账号说明、已知事故与恢复情况   |

**查当前行为时先读文档，了解设计原因时再读博客。** 旧文章仍有参考价值，但其中的产品名称、安装方式、套餐限制和示例参数可能已经变化。

## 二 理解域名与资源归属

### 2.1 核心域名的分工

| 域名或入口            | 主要用途                                 | 使用时的判断                      |
| --------------------- | ---------------------------------------- | --------------------------------- |
| `www.anthropic.com`   | 公司、研究、新闻、工程、政策与安全承诺   | 查组织信息、研究出处和正式声明    |
| `claude.com`          | 产品介绍、使用资源、方案与商业生态       | 判断产品是否适合自己的工作        |
| `claude.ai`           | Claude 应用                              | 实际使用；许多页面需要登录        |
| `platform.claude.com` | 开发者控制台、API 文档、Cookbook         | 开发和管理 API 应用               |
| `code.claude.com`     | Claude Code 产品入口及文档，含 Agent SDK | 查编码工具和 Agent SDK 的当前用法 |
| `academy.claude.com`  | Claude Academy                           | 免费自学课程与学习路线            |
| `claude.dev`          | 官方开发者博客                           | 开发者经验、教程与实践观点        |

这里的 `anthropic.com`、`claude.com` 和 `claude.ai` 是便于理解的三个核心域名，**并非完整的域名资产清单**。`/research` 是网页路径；`alignment.anthropic.com` 才是子域名。不要把导航栏目自动改写成 `research.anthropic.com` 或 `engineering.anthropic.com`。

### 2.2 五类资源应分开理解

1. **官方站点与产品入口**：例如 Anthropic 主站、Claude 产品站、Platform、Academy，以及官方研究站。
2. **第三方平台上的官方空间**：例如 [GitHub 的 `anthropics`](https://github.com/anthropics)、[Hugging Face 的 `Anthropic`](https://huggingface.co/Anthropic)、Skilljar 培训门户。官方账号并不意味着 Anthropic 拥有整个托管平台。
3. **Anthropic 发起或维护的开放标准**：MCP 与 Agent Skills 有各自的文档和代码组织，治理情况需要分别说明。
4. **产品基础设施**：API、下载、资源文件及嵌入内容所使用的主机，通常没有供读者浏览的首页。
5. **合作伙伴与外部资源**：云服务商、论文平台、扩展商店、合作研究工具。被官网引用或支持，不等于归 Anthropic 所有。

## 三 公司研究与工程内容

### 3.1 公司与正式公告

- [Company](https://www.anthropic.com/company)：公司使命、组织与治理信息；[Leadership](https://www.anthropic.com/company/leadership) 用于查领导团队。
- [News](https://www.anthropic.com/news)：产品与模型发布、合作、公司进展和重大声明。
- [Careers](https://www.anthropic.com/careers) 与 [Jobs](https://www.anthropic.com/careers/jobs)：招聘说明及职位入口。
- [Policy](https://www.anthropic.com/policy)：公共政策观点与建议。它与用户需要遵守的 [Usage Policy](https://www.anthropic.com/legal/aup) 用途不同。

新闻栏目也可能发布研究、安全与技术相关内容，因此不能把“是否位于 `/news/`”当成判断内容深度的标准。找某项研究时，应优先看标题、作者、发布日期和论文链接。

### 3.2 研究总入口与团队页面

[Research](https://www.anthropic.com/research) 适合作为统一起点，再进入具体团队或研究项目。以下是核验时的有效入口：

| 方向     | 入口                                                                           | 主要查找目标                       |
| -------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| 对齐     | [Alignment](https://www.anthropic.com/research/team/alignment)                 | 模型行为、安全、对齐方法与评估     |
| 可解释性 | [Interpretability](https://www.anthropic.com/research/team/interpretability)   | 模型内部机制、特征和电路研究       |
| 经济     | [Economics](https://www.anthropic.com/research/team/economics)                 | AI 使用、就业与经济影响            |
| 社会影响 | [Societal Impacts](https://www.anthropic.com/research/team/societal-impacts)   | 真实使用情境与社会后果             |
| 前沿红队 | [Frontier Red Team](https://www.anthropic.com/research/team/frontier-red-team) | 网络安全、国家安全与高风险能力评估 |

研究文章常有多个层次：主站提供介绍，专业站提供完整 HTML 论文或交互图，GitHub/Hugging Face 提供代码与数据。阅读时沿文章中的正式链接进入，能减少误入同名复现项目的风险。

### 3.3 专业研究站与交互资源

**[Alignment Science Blog](https://alignment.anthropic.com/)** 是 Anthropic 对齐科学团队的官方博客，适合跟进研究笔记、初步结果、评估工具及研究方向。它的发布形式与完整论文不同，引用时应保留作者给出的限制和研究阶段。

**[Transformer Circuits](https://transformer-circuits.pub/)** 是 Anthropic 可解释性研究发布站。除了论文，还包括研究更新与交互展示。可从以下入口体验其组织方式：

- [Scaling Monosemanticity Feature Browser](https://transformer-circuits.pub/2024/scaling-monosemanticity/features/index.html)：论文配套的特征浏览器
- [On the Biology of a Large Language Model](https://transformer-circuits.pub/2025/attribution-graphs/biology.html)：归因图与模型内部计算的研究文章
- [Natural Language Autoencoders](https://transformer-circuits.pub/2026/nla/index.html)：较新的可解释性研究实例

这些可视化往往依赖 JavaScript；文本抓取失败不代表站点失效。图中展示的是特定模型、方法及实验条件下的结果，不能直接概括为所有 Claude 模型的内部工作方式。

**Frontier Red Team 的相关入口包括 [Red 研究站](https://red.anthropic.com/)与[主站团队页](https://www.anthropic.com/research/team/frontier-red-team)。** 本指南优先推荐团队页作为研究导航；查找具体文章时，也可保留原文所用的 Red 站地址。入口之间的访问关系参见第十一节。

### 3.4 科学经济与社会研究项目

[Science Blog](https://www.anthropic.com/science) 发布科学研究、内外部合作与科学工作流程相关内容。它与第四节的 [Claude Science 产品页](https://claude.com/product/claude-science) 分工不同：前者用于阅读研究与实践文章，后者用于了解产品。

- [Anthropic Institute](https://www.anthropic.com/institute)：强大 AI 对社会、经济、安全和研发活动的影响研究。
- [Economic Index](https://www.anthropic.com/economic-index)：经济指数的报告、数据与探索入口。
- [Economic Futures](https://www.anthropic.com/economic-futures)：经济研究支持计划与相关进展。
- [经济情景研究](https://www.anthropic.com/institute/econ-scenarios)：情景假设及可能经济结果的解释页面。

Index、Institute 与 Futures 分别偏向数据项目、研究机构及研究支持计划。若要引用某个经济结论，应继续打开对应报告，核对样本、时间范围和方法，避免把情景分析当成确定预测。

### 3.5 两个值得并行关注的工程入口

[Engineering at Anthropic](https://www.anthropic.com/engineering) 侧重系统设计、Agent 架构、工具、评估和基础设施经验；[claude.dev](https://claude.dev/) 是另一个经官网链接的开发者博客，涵盖教程、实践手册和开发者观点。可按主题分别浏览，不宜仅凭文章出现在另一站点就判断原站内容已被替代。

工程文章适合回答“为什么这样设计”；API 和 Claude Code 文档适合回答“今天怎样配置”。查具体文章时，核对页面标题、内容与日期，不要只凭工具展示的 URL 判断其位置变化。第十二节给出经过核验的阅读顺序。

## 四 产品与使用入口

[claude.com](https://claude.com/) 帮助你了解产品、功能和使用场景；[claude.ai](https://claude.ai/) 是实际应用入口。应用包含登录后的工作区域和设置，许多页面无法在未登录状态下完整浏览。

### 4.1 产品选择与扩展

产品资源应按工作目标浏览。核验时，官方导航包含以下入口：

| 工作目标                   | 产品或资源页面                                                          |
| -------------------------- | ----------------------------------------------------------------------- |
| 了解整体产品               | [产品总览](https://claude.com/product/overview)                         |
| 编写和维护软件             | [Claude Code](https://claude.com/product/claude-code)                   |
| 桌面上的知识工作           | [Cowork](https://claude.com/product/cowork)                             |
| 在 Slack 中与 Claude 协作  | [Tag 与 @Claude](https://claude.com/product/tag)                        |
| 设计与视觉创作             | [Claude Design](https://claude.com/product/design)                      |
| 科学研究相关工作           | [Claude Science](https://claude.com/product/claude-science)             |
| 安全相关工作               | [Claude Security](https://claude.com/product/claude-security)           |
| 浏览器中的使用方式         | [Claude in Chrome](https://claude.com/claude-in-chrome)                 |
| Microsoft 365 集成         | [Claude for Microsoft 365](https://claude.com/claude-for-microsoft-365) |
| 构建自己的应用             | [Claude Platform API](https://claude.com/platform/api)                  |
| 下载客户端与查官方商店入口 | [Download](https://claude.com/download)                                 |

以上是导航定位，功能、支持系统、资格、套餐与区域以各产品页及帮助文档为准。应用下载应从官方 Download 页或 Claude Code 安装文档进入；不要根据站点名称自行寻找安装脚本或扩展商店条目。

- [定价页](https://claude.com/pricing)：比较当前个人与组织方案；具体费用、税费、限制与计费周期以页面及账户显示为准。
- [Marketplace](https://claude.com/marketplace)：扩展生态总入口；[连接器与插件](https://claude.com/marketplace/connectors-plugins)、[插件目录](https://claude.com/marketplace/plugins)和 [Skills](https://claude.com/skills) 分别提供相应资源。
- [客户案例](https://claude.com/customers)：了解实际使用情境，适合启发方案，不能直接替代自己的性能或成本评估。
- [Community](https://claude.com/community)：进入社区与活动。Discord 等邀请可能变化，优先收藏这个官方入口。

连接器、插件、Skills 和 MCP 分别涉及服务连接、扩展打包、工作方法与协议。它们在某些产品中会组合出现，但安装与权限需要按对应产品文档处理。

### 4.2 产品内容与技术内容如何配合阅读

[Claude 产品博客](https://claude.com/blog) 适合了解功能发布与产品用途；[Engineering](https://www.anthropic.com/engineering) 和 [claude.dev](https://claude.dev/) 补充技术实践；[帮助中心](https://support.claude.com/en/) 则更适合回答套餐、账号、操作步骤等问题。

同一功能可能在不同站点有介绍、文档或相关文章。收藏时记录标题、内容用途和浏览器实际访问的地址，比依赖固定的 URL 命名规律更可靠。

## 五 API 与 Agent 开发文档

### 5.1 先选择开发方式

当前官方文档区分了几条开发路径。不要把“调用模型”“使用编码助手”和“运行 Agent”混成同一种接口。

| 开发方式                  | 适合的工作                               | 当前文档                                                                                   |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| Messages API 与客户端 SDK | 自己控制请求、对话状态与工具调用流程     | [Claude Platform](https://platform.claude.com/docs/en/home)                                |
| ant CLI                   | 从终端或脚本调用和管理 Platform 能力     | [SDKs CLI and libraries](https://platform.claude.com/docs/en/cli-sdks-libraries/overview)  |
| Claude Code               | 在终端、IDE、桌面或网页中开展编码任务    | [Claude Code Docs](https://code.claude.com/docs/en/overview)                               |
| Claude Agent SDK          | 在自己管理的进程中构建 Agent             | [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview)                   |
| Claude Managed Agents     | 使用 Anthropic 托管的 Agent 运行基础设施 | [Managed Agents quickstart](https://platform.claude.com/docs/en/managed-agents/quickstart) |

上述区分来自当前 [SDK 与工具总览](https://platform.claude.com/docs/en/cli-sdks-libraries/overview)。选择时先想清楚：谁管理 Agent Loop、工具执行和运行环境，再进入相应文档。

### 5.2 API 开发的常用书签

中文读者可直接使用已核验的[简体中文 Platform 文档](https://platform.claude.com/docs/zh-CN/home)与[简体中文 Claude Code 文档](https://code.claude.com/docs/zh-CN/overview)。涉及刚更新的功能时，可对照英文页、发布日期及发布说明，避免不同语言页面更新进度带来歧义。

- [Quickstart](https://platform.claude.com/docs/en/get-started)：完成首个 API 调用
- [Models overview](https://platform.claude.com/docs/en/models/overview)：查模型、标识符、能力及生命周期入口
- [API 定价](https://platform.claude.com/docs/en/about-claude/pricing)：查模型与相关能力的计费规则
- [SDKs CLI and libraries](https://platform.claude.com/docs/en/cli-sdks-libraries/overview)：选择官方客户端、命令行工具和集成
- [Prompt engineering](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)：提示设计及进一步的最佳实践
- [Release notes](https://platform.claude.com/docs/en/release-notes/overview)：跟踪功能更新和迁移事项
- [Claude Cookbook](https://platform.claude.com/cookbook)：查可运行的示例与实现模式

完整文档还覆盖工具、搜索、代码执行、视觉、文件、结构化输出、缓存、流式响应和批处理等能力。本文保留稳定的入口层级；具体端点与参数请从当前文档导航进入。需要机器可读的页面发现入口时，可用官方 [Platform 索引](https://platform.claude.com/llms.txt)，避免沿用旧目录拼接 URL。

[Platform 控制台](https://platform.claude.com/) 与公开文档属于同一开发者站点，但前者涉及账户资源。API 服务端点则是 `api.anthropic.com`，不要把文档首页、控制台网址或 Claude 网页应用地址当作 API Base URL。

### 5.3 Claude Code 与 Agent SDK

[Claude Code 总览](https://code.claude.com/docs/en/overview) 是安装与使用的可靠起点。[工作原理](https://code.claude.com/docs/en/how-claude-code-works) 介绍其 Agent Loop、工具与上下文管理；[最佳实践](https://code.claude.com/docs/en/best-practices) 适合在入门后阅读。

配置专题包括项目指令与记忆、Skills、Hooks、子 Agent、MCP、权限和 IDE 集成。需要查完整页面列表时，可用官方 [文档索引](https://code.claude.com/docs/llms.txt)，再打开对应的人类可读页面。索引是查找工具，不是另一套独立规范。

**查 Agent SDK 时，本指南推荐 `code.claude.com/docs/en/agent-sdk/` 下的[概述](https://code.claude.com/docs/en/agent-sdk/overview)与 [Agent Loop](https://code.claude.com/docs/en/agent-sdk/agent-loop)。** 相关的 Platform 地址包括 [SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview) 和 [Agent Loop](https://platform.claude.com/docs/en/agent-sdk/agent-loop)。这些地址按同一主题对照列出，访问表现与内容更新情况应分别检查。

## 六 学习课程与实践材料

### 6.1 用 Claude Academy 查系统课程

[Claude Academy](https://academy.claude.com/) 和[课程目录](https://academy.claude.com/courses) 面向自学者。当前课程覆盖 Claude、Claude Code、Cowork、Platform、MCP、Agent Skills、子 Agent 与 AI Fluency，也提供 API 及云平台开发课程。

[Anthropic Learn](https://www.anthropic.com/learn) 可作为学习与 AI 素养相关入口，[Claude Courses](https://claude.com/resources/courses) 也是相关课程地址。需要直接选择课程时，本指南推荐 Academy 目录。

按照 [Academy FAQ](https://academy.claude.com/help/faq)，公开课程免费，目录可直接浏览；登录免费 Claude 账户可保存进度并获得课程完成徽章。徽章、Skilljar 结课证书及另行组织的专业认证，应分别理解。

### 6.2 Skilljar 与专项培训

| 入口                                                                        | 定位                           | 使用建议                                     |
| --------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------- |
| [anthropic.skilljar.com](https://anthropic.skilljar.com/)                   | Skilljar 学习平台              | 查此前课程和证书；账户记录衔接看 Academy FAQ |
| [anthropic-partners.skilljar.com](https://anthropic-partners.skilljar.com/) | 合作伙伴学习门户               | 经官方 FAQ 确认；部分内容需登录或伙伴资格    |
| [Claude Frontier Academy](https://claude.com/programs/frontier-academy)     | 面向企业及伙伴的提名制实践培训 | 与公开自学 Academy 分开选择                  |
| [GitHub courses](https://github.com/anthropics/courses)                     | 历史课程材料                   | 仓库已归档，学习当前产品优先使用 Academy     |

根据官方 FAQ，Skilljar 学习记录与 Academy 账户的衔接需要按匹配邮箱和导入安排处理，不能仅根据学习入口的名称或访问地址判断记录已同步。

### 6.3 课程之外的实践材料

[在线 Cookbook](https://platform.claude.com/cookbook) 便于按主题浏览；[claude-cookbooks 仓库](https://github.com/anthropics/claude-cookbooks) 便于查看和运行代码；[交互式 Prompt 教程](https://github.com/anthropics/prompt-eng-interactive-tutorial) 可用于练习基础方法。示例往往有环境、版本或 API 费用要求，运行前先读 README。

## 七 GitHub 与公开研究数据

[github.com/anthropics](https://github.com/anthropics) 是经 GitHub 域名验证的 Anthropic 组织。这里按用途列出常用仓库，不列星标或仓库总数，避免把热度当成质量、维护状态或许可证的替代指标。

| 用途               | 已核验仓库                                                                                                                                                                  | 需要知道的区别                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| API 客户端         | [anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python) · [anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript)             | API 客户端 SDK；其他语言从文档工具总览进入  |
| Platform 命令行    | [anthropic-cli](https://github.com/anthropics/anthropic-cli)                                                                                                                | `ant` CLI，区别于 Claude Code               |
| Agent SDK          | [claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) · [claude-agent-sdk-typescript](https://github.com/anthropics/claude-agent-sdk-typescript) | 正确仓库名含 `claude-` 前缀                 |
| Claude Code        | [claude-code](https://github.com/anthropics/claude-code)                                                                                                                    | 公开分发、支持与配套资源仓库                |
| GitHub 自动化      | [claude-code-action](https://github.com/anthropics/claude-code-action) · [claude-code-base-action](https://github.com/anthropics/claude-code-base-action)                   | 面向 GitHub 工作流；后者的维护关系看 README |
| 安全审查           | [claude-code-security-review](https://github.com/anthropics/claude-code-security-review)                                                                                    | 安全审查 GitHub Action                      |
| Skills 与插件      | [skills](https://github.com/anthropics/skills) · [claude-plugins-official](https://github.com/anthropics/claude-plugins-official)                                           | Skills 示例及 Anthropic 管理的插件目录      |
| 知识工作与行业示例 | [knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) · [financial-services](https://github.com/anthropics/financial-services)                     | 核实支持产品、依赖和权限后再用              |
| 示例项目           | [claude-cookbooks](https://github.com/anthropics/claude-cookbooks) · [claude-quickstarts](https://github.com/anthropics/claude-quickstarts)                                 | 代码示例与起步模板                          |
| 学习材料           | [prompt-eng-interactive-tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) · [courses](https://github.com/anthropics/courses)                         | 后者已归档，注意材料年代                    |

### 7.1 公开仓库不等于完整开源产品

`claude-code` 是公开的产品配套仓库；其 [LICENSE](https://github.com/anthropics/claude-code/blob/main/LICENSE.md) 保留权利并关联商业条款。不能仅凭仓库公开，就宣称整个 CLI 可按开源许可证自由复制和修改。

另外，`anthropics/github-mcp-server` 是上游 [github/github-mcp-server](https://github.com/github/github-mcp-server) 的 fork；`anthropics/claude-ai-mcp` 的用途是 [Claude MCP 集成问题追踪](https://github.com/anthropics/claude-ai-mcp)。查看归属时要读仓库说明与 fork 标记。开发容器的已确认资源是 [Claude Code 仓库内的 `.devcontainer`](https://github.com/anthropics/claude-code/tree/main/.devcontainer)，不要据此虚构同名独立仓库。

### 7.2 数据集与合作研究工具

[Hugging Face 官方组织](https://huggingface.co/Anthropic) 可用来查公开研究数据。例如 [EconomicIndex](https://huggingface.co/datasets/Anthropic/EconomicIndex) 是经济指数相关数据入口。每个数据集仍需分别阅读数据卡、版本、用途限制与许可证；官方组织页面不能理解为 Claude 模型权重下载站。

[Neuronpedia](https://www.neuronpedia.org/) 是外部合作研究平台。Anthropic 的[电路追踪研究公告](https://www.anthropic.com/research/open-source-circuit-tracing) 会将读者引向合作可视化与代码。沿论文链接进入即可，不应把合作平台算作 Anthropic 自有网站。

## 八 MCP 与 Agent Skills 开放标准

### 8.1 MCP

MCP 用于连接 AI 应用与外部工具、数据及服务。Anthropic 在 [2025 年 12 月的公告](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation) 中宣布将 MCP 捐赠给 Linux Foundation 旗下 Agentic AI Foundation。其生态应列为独立开放项目。

| 资源          | 入口                                                                                                                               | 用途                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 文档与规范    | [modelcontextprotocol.io](https://modelcontextprotocol.io/) · [当前规范入口](https://modelcontextprotocol.io/specification/latest) | 入门、架构、SDK 及版本化规范 |
| 项目博客      | [blog.modelcontextprotocol.io](https://blog.modelcontextprotocol.io/)                                                              | 发布与项目进展               |
| 官方 Registry | [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io/)                                                      | 服务器元数据与发现入口       |
| GitHub 组织   | [modelcontextprotocol](https://github.com/modelcontextprotocol)                                                                    | 规范、SDK 和相关项目         |

实现协议时，应从当前文档导航选择规范版本，记录自己实际使用的版本。核验时，当前规范入口展示 [2026-07-28 版](https://modelcontextprotocol.io/specification/2026-07-28)，2025-11-25 不应继续标作最新版。`spec.modelcontextprotocol.io` 未列为本指南的优先入口；此选择不构成对该地址可用性或访问行为的判断。

Registry 收录、某个客户端支持与具体服务器值得信任是三个不同判断。接入服务器前，仍须核对提供者、权限、数据流和部署方式。

### 8.2 Agent Skills

[agentskills.io](https://agentskills.io/) 提供 Agent Skills 开放标准文档；[agentskills GitHub 组织](https://github.com/agentskills/) 与[规范仓库](https://github.com/agentskills/agentskills) 提供标准相关资源。该组织注明由 Anthropic 维护。

读者可以按需要分三层查找：格式与互操作要求去标准站，Claude 中的使用方法去产品文档，示例去 [anthropics/skills](https://github.com/anthropics/skills)。MCP 的连接协议与 Skills 的工作材料有互补关系，具体实现不宜混为一谈。

## 九 支持隐私安全与服务状态

| 遇到的问题           | 入口                                                                               | 重点检查                       |
| -------------------- | ---------------------------------------------------------------------------------- | ------------------------------ |
| 登录、订阅、功能使用 | [Support](https://support.claude.com/en/)                                          | 适用产品、套餐和操作说明       |
| 服务异常             | [Status](https://status.claude.com/)                                               | 受影响组件与事故更新           |
| 数据使用与隐私问答   | [Privacy Center](https://privacy.claude.com/en/)                                   | 消费者与商业客户分别适用的说明 |
| 安全合规审查         | [Trust Center](https://trust.anthropic.com/)                                       | 适用服务、报告范围与访问要求   |
| 模型评估与系统卡     | [Transparency Hub](https://www.anthropic.com/transparency)                         | 模型版本、报告日期与评估限制   |
| 能力风险管理         | [Responsible Scaling Policy](https://www.anthropic.com/responsible-scaling-policy) | 当前政策文本与版本             |
| Claude 行为原则      | [Claude’s Constitution](https://www.anthropic.com/constitution)                    | 原则文本与解释                 |
| 报告安全漏洞         | [Responsible Disclosure](https://www.anthropic.com/responsible-disclosure-policy)  | 官方渠道、范围与披露要求       |

中文帮助可使用[简体中文帮助中心](https://support.claude.com/zh-CN/)。此外，[区域合规](https://claude.com/regional-compliance)、[内容举报](https://claude.com/form/anthropic-content-reporting)与[文件来源检查](https://claude.com/check-files)各有专门入口。文件检查页面用于了解和使用其核验能力，不宜据此推断所有 Claude 输出都能被可靠识别。

法律文件另从 [隐私政策](https://www.anthropic.com/legal/privacy)、[消费者条款](https://www.anthropic.com/legal/consumer-terms)、[商业条款](https://www.anthropic.com/legal/commercial-terms) 和 [Usage Policy](https://www.anthropic.com/legal/aup) 阅读。导航指南不替代对应协议或具体采购审查。

Trust Center 中的部分材料可能需要申请访问。不能由页面出现某项认证或合规主题，就推断所有产品、使用方式和合同安排都被同样覆盖。

## 十 基础设施与第三方渠道

### 10.1 与产品运行有关的主机

官方 [Claude Code 网络配置文档](https://code.claude.com/docs/en/network-config) 列出了不同功能所需的主机。常见类别包括：

- API 与登录：`api.anthropic.com`、`claude.ai`、`platform.claude.com`
- 下载与资源：`downloads.claude.ai`、`assets-proxy.anthropic.com`
- MCP 代理与嵌入内容：`mcp-proxy.anthropic.com`、`bridge.claudeusercontent.com`、`*.frame.claudeusercontent.com`、`*.claudemcpcontent.com`

这些条目用于理解产品依赖；实际企业防火墙配置应按当前文档、所用功能及组织策略制定。`claudeusercontent.com` 中还可能承载用户内容，不能认定每页都是官方撰写。第三方 Google Storage、npm、GitHub 或 CDN 即使出现在同一网络表中，也不能算作 Anthropic 自有域名。

官方文章还会将 PDF、图片与指南托管在 `assets.anthropic.com`、`www-cdn.anthropic.com`、`resources.anthropic.com` 和 `assets.claude.com` 等资源主机。应从[研究页面](https://www.anthropic.com/research)或[透明度中心](https://www.anthropic.com/transparency)进入具体文件，避免猜测带哈希的路径；资源主机首页没有目录并不异常。

### 10.2 云服务商与托管平台

[Platform 文档](https://platform.claude.com/docs/en/home) 提供 Amazon Bedrock、Google Cloud 和 Microsoft Foundry 的接入入口。它们属于相应云服务商的产品渠道，实际身份认证、可用区域、模型供应、费用与条款应分别核对。

GitHub、Hugging Face、Skilljar、Greenhouse 招聘页以及浏览器/IDE 扩展商店，也都应按“第三方托管的官方资源”理解。建议从官网或官方文档出发前往这些服务，核对发布者名称，避免仅凭搜索结果标题认定官方身份。

获取动态可关注经[官方 Hugging Face 组织](https://huggingface.co/Anthropic)链接的 [AnthropicAI](https://twitter.com/AnthropicAI)，或从[社区页](https://claude.com/community)前往 Discord 与活动。社交动态适合发现内容，正式引用宜回到原始公告、文档或论文。个人文章、社区帖子与外部讲解视频应保留各自作者归属。

## 十一 推荐入口与相关地址对照

### 11.1 按用途选择入口

下表用于选择入口，**不代表全部地址已经迁移，也不保证各入口的内容完全同步**。本次核验中，网页读取工具与读者浏览器对部分地址呈现不同的访问结果。规范链接（canonical）或抓取结果中的地址变化，不能单独证明 HTTP 重定向。

核验补记：2026 年 10 月 8 日，在本次请求环境中，禁用自动跟随的 GET 请求确认了四个 301 响应：`docs.anthropic.com/` 与 `docs.claude.com/` 指向 Platform 文档目录，`console.anthropic.com/` 指向 Platform 控制台，`claude.ai/download` 指向 Claude 下载页。这是特定请求的证据，不能扩大为所有环境的访问结论；另有地址返回访问受限，无法据此确认其跳转关系。

| 用途                 | 本指南推荐入口                                                                                       | 相关地址及使用说明                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| API 与平台文档       | [Platform Docs](https://platform.claude.com/docs/en/home)                                            | [docs.anthropic.com](https://docs.anthropic.com/) 与 [docs.claude.com](https://docs.claude.com/) 也是相关文档地址；具体页面分别检查            |
| 开发者控制台         | [Platform](https://platform.claude.com/)                                                             | 相关地址：[console.anthropic.com](https://console.anthropic.com/)                                                                              |
| 使用帮助             | [Support](https://support.claude.com/en/)                                                            | 相关地址：[support.anthropic.com](https://support.anthropic.com/)                                                                              |
| 应用下载             | [Claude Download](https://claude.com/download)                                                       | 相关地址：[claude.ai/download](https://claude.ai/download)                                                                                     |
| Claude Code 产品介绍 | [Claude Code 产品页](https://claude.com/product/claude-code)                                         | 相关入口：[code.claude.com](https://code.claude.com/)；[文档](https://code.claude.com/docs/en/overview)按具体路径访问                          |
| 服务状态             | [status.claude.com](https://status.claude.com/)                                                      | 相关地址：[status.anthropic.com](https://status.anthropic.com/)                                                                                |
| 隐私问答             | [Privacy Center](https://privacy.claude.com/en/)                                                     | 相关地址：[privacy.anthropic.com](https://privacy.anthropic.com/)                                                                              |
| 学习与 AI 素养       | [Anthropic Learn](https://www.anthropic.com/learn)                                                   | 系统课程可直接前往 [Claude Academy](https://academy.claude.com/)；不要仅凭地址把两页内容视为完全相同                                           |
| 课程选择             | [Academy 课程目录](https://academy.claude.com/courses)                                               | 相关课程地址：[claude.com/resources/courses](https://claude.com/resources/courses)                                                             |
| Agent SDK 概述       | [Code Docs overview](https://code.claude.com/docs/en/agent-sdk/overview)                             | 相关文档地址：[Platform overview](https://platform.claude.com/docs/en/agent-sdk/overview)                                                      |
| Agent Loop           | [Code Docs Agent Loop](https://code.claude.com/docs/en/agent-sdk/agent-loop)                         | 相关文档地址：[Platform Agent Loop](https://platform.claude.com/docs/en/agent-sdk/agent-loop)                                                  |
| Claude Code 最佳实践 | [文档中的最佳实践](https://code.claude.com/docs/en/best-practices)                                   | 相关工程文章地址：[Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices)；核对内容与日期后使用         |
| Agent SDK 工程文章   | [Claude 资源站文章](https://claude.com/resources/articles/building-agents-with-the-claude-agent-sdk) | 相关工程文章地址：[Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) |
| 前沿红队研究         | [Frontier Red Team 团队页](https://www.anthropic.com/research/team/frontier-red-team)                | 相关研究入口：[red.anthropic.com](https://red.anthropic.com/)                                                                                  |
| 经济研究团队         | [Economics](https://www.anthropic.com/research/team/economics)                                       | 采用已确认内容的路径；不宜按团队名称猜测其他路径                                                                                               |
| Cookbook 仓库        | [claude-cookbooks](https://github.com/anthropics/claude-cookbooks)                                   | 文献中也会遇到 [anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook) 地址；以仓库实际显示的名称、说明与内容为准               |

已有书签能正常打开且内容符合所需用途时，无需仅因为另一地址被推荐就删除或批量替换。核对具体标题、内容、日期和浏览器地址栏后再决定；内容可用、规范链接指向与 HTTP 重定向是不同的检查事项。

### 11.2 常见误区

- **根据标题猜链接**：文章 slug、仓库名与目录结构不一定遵循统一规则，应从官方索引或原文链接进入
- **把公开清单当成全部资产**：公开导航、官方账号和产品依赖无法证明公司注册或使用的所有域名
- **把相关地址视为同一页面**：产品介绍、工程文章、操作文档与课程可能讨论同一主题，但用途和更新节奏不同
- **把公开仓库当成完整开源产品**：检查 README、许可证、fork 标记和归档状态
- **用数量或星标判断可靠性**：文章数、仓库数和热度变化很快，不能替代内容与维护情况核查
- **把关联资源都算作公司所有**：开放标准、官方托管账号、合作平台和用户内容需要分别判断归属

未纳入的地址不代表确定不存在；未获得充分证据的推测路径不作为优先推荐链接。已有地址能正常打开所需内容时，无需仅因本指南推荐另一入口而更换书签。

## 十二 推荐阅读路线与维护方法

### 路线 A 从零构建可靠的 Agent

1. [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)：先理解适用场景、工作流与 Agent 的设计取舍
2. [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)：再思考上下文应如何组织
3. [Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)：设计工具与返回信息
4. [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)：尽早定义可验证的成功标准
5. [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works) 与 [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview)：选择并理解实现方式
6. [How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop)：深入运行与工具循环
7. [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)：研究长任务的持续执行
8. [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)：按需要进一步考虑工具规模与效率

这些文章构成方法阅读路线；实现代码时，仍应回到当前 API/SDK 文档核对接口。

### 路线 B 直接接入 API

[Quickstart](https://platform.claude.com/docs/en/get-started) → [模型与能力](https://platform.claude.com/docs/en/models/overview) → [官方 SDK](https://platform.claude.com/docs/en/cli-sdks-libraries/overview) → [Cookbook](https://platform.claude.com/cookbook) → [定价](https://platform.claude.com/docs/en/about-claude/pricing)与[发布说明](https://platform.claude.com/docs/en/release-notes/overview)。

建议先跑通一个最小调用，再补工具、缓存或复杂编排；用自己的任务集评估正确性、延迟和费用。

### 路线 C 高效使用 Claude Code

[总览与安装](https://code.claude.com/docs/en/overview) → [工作原理](https://code.claude.com/docs/en/how-claude-code-works) → [最佳实践](https://code.claude.com/docs/en/best-practices) → 按需要查配置、Skills、Hooks、MCP 与权限；系统学习可转到 [Academy 课程目录](https://academy.claude.com/courses)。

### 路线 D 进入 AI 安全与可解释性研究

[Research](https://www.anthropic.com/research) → [Alignment Science](https://alignment.anthropic.com/) 或 [Transformer Circuits](https://transformer-circuits.pub/) → 对应论文原文及代码数据 → [Frontier Red Team](https://www.anthropic.com/research/team/frontier-red-team) → [Transparency Hub](https://www.anthropic.com/transparency)。

阅读时记录研究对象、实验条件和限制。系统卡、研究论文、政策承诺与产品合规材料分别回答不同问题，宜交叉查看。

### 路线 E 团队选型与推广

[产品官网](https://claude.com/)与[定价](https://claude.com/pricing) → [客户案例](https://claude.com/customers) → [帮助中心](https://support.claude.com/en/)与[隐私中心](https://privacy.claude.com/en/) → [Trust Center](https://trust.anthropic.com/) → [Academy](https://academy.claude.com/)。

把具体工作流、所需权限、数据类型和采购要求列清楚，再判断产品与组织约束是否匹配。

### 如何让这份导航持续可用

1. **收藏入口与少量关键文章**：目录负责发现更新，正文链接负责保存具体证据
2. **引用时写明日期和版本**：模型、API、规范、价格及政策尤其需要
3. **先核对内容，再修收藏**：保留文章标题、日期和实际访问地址，避免仅凭工具结果批量替换域名
4. **分辨页面不存在与访问受限**：登录、JavaScript、地区或抓取限制，都可能影响核验
5. **新链接至少检查两项**：是否由已知官方页面链接；内容、作者、域名验证或仓库归属是否一致

本文以官方页面内容、官方交叉链接、官方代码组织及注明局限的访问观测为依据。公开内容核验不等于逐条核验 HTTP 响应链；读取工具与浏览器表现不一致时，本文保留不确定性。登录后的完整控制台、需授权下载的报告、所有互动功能和所有历史链接未逐一测试。各节的链接同时承担来源与导航功能；如后续发生变化，以目标站点当前说明为准。
