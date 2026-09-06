---
lang: "zh-CN"
pubDatetime: 2026-09-06T12:52:40+08:00
timezone: "Asia/Shanghai"
title: "技术演讲 | AI Agents Are Also Distributed Systems｜AI Agent 也是分布式系统（完整逐字稿，中英对照）"
contentType: "docs-translation"
area: "ai-and-agents"
featured: false
draft: false
tags:
  - "技术演讲"
  - "AI Agent"
  - "分布式系统"
  - "可靠性"
  - "可观测性"
  - "安全"
description: "Salman Munaf 在 AI Engineer World's Fair 2024 的完整演讲逐字稿：从 Agent 循环、远程工具调用与状态管理，到幂等性、补偿、权限和可观测性。"
---
> **视频来源**
>
> - 演讲：Salman Munaf，*AI Agents Are Also Distributed Systems*
> - 活动：AI Engineer World's Fair，2024 年 7 月 2 日
> - 原视频：[YouTube｜AI Agents Are Also Distributed Systems](https://www.youtube.com/watch?v=hD9-V56FNRI)
>
> 本文按视频时间线整理，保留所提供文字稿中的完整英文现场口语、停顿与重复，以及逐句中文对照；仅调整标题层级、时间戳和排版以便阅读。幻灯片编号按演讲中的切换顺序标注。

## 片头与登台（00:00–00:12）

*现场视频片头动画：AI Engineer World's Fair，赞助商列表展示；演讲人 Salman Munaf 走上讲台。*

## 开场引言（00:13–01:06）

**幻灯片 1：*AI Agents Are Also Distributed Systems | Salman Munaf | Leadership 1 • July 2, 2024***

### 00:13–00:20

**英文原文**

> Hello everyone, good afternoon. Today, uh, I will be talking about AI agents are also distributed systems.

**中文直译**

> 大家下午好。今天，呃，我演讲的主题是《AI Agent 本质上也是分布式系统》。

### 00:20–00:50

**英文原文**

> So, as, uh, the models have started to become more complex, initially the, uh, LLM models were just text in, text out, without performing any actions, and the, uh, effect that they can produce was just a wrong model output. However, with now the capability of agent—the rise in agentic capabilities, where the systems can now talk to external systems,

**中文直译**

> 随着模型开始变得越来越复杂，起初大语言模型仅仅是“输入文本、输出文本”，不执行任何实际操作，它们可能产生的负面影响仅仅是给出一个错误的模型输出。然而，伴随着如今 Agent 能力的发展——即 Agent 范式能力的兴起，系统现在能够与外部系统进行通信交互了，

### 00:50–01:06

**英文原文**

> uh, it has turned into a distributed systems, and it is important to incorporate distributed systems thinking and concepts when building AI agents. So I will be going over that, uh, in this talk.

**中文直译**

> 呃，它已经演变成了一个分布式系统。因此在构建 AI Agent 时，融入分布式系统的思维与概念变得至关重要。我将在本次演讲中详细探讨这一点。

## 第一部分：AI Agent 故障案例与分布式启示（01:06–02:17）

**幻灯片 2：*When AI Agents Fail: Lessons from Distributed Systems***

### 01:06–01:41

**英文原文**

> So, you guys might have, uh, heard about incidents being caused by AI agents. Uh, for instance, the Replit AI agent deleting a production incident—production database, or Air Canada chatbot basically making an, uh, an incorrect refund. And both of these, uh, incidents, or a lot of these incidents, could have been prevented, uh, by good systems thinking when building these, uh, AI agents.

**中文直译**

> 大家可能听说过一些由 AI Agent 引发的生产事故。呃，比如 Replit 的 AI Agent 误删了生产事……生产数据库；或者加拿大航空（Air Canada）的聊天机器人承诺了错误的退款政策。这两起事故，或者说这类事故中的绝大多数，在构建这些 AI Agent 时本都可以通过良好的系统工程思维来避免。

### 01:41–02:17

**英文原文**

> So for instance, for the Replit incident, we could have good—we could have robust backups, we could have scoped authority, we should—we shouldn't ideally have, uh, allowed AI agents to delete production databases. Moreover, for Air Canada chatbot, it would have been, uh, a good idea to have authoritative source of truth retrieval, so that it's not making, uh, decisions based on stale or incorrect policies.

**中文直译**

> 例如针对 Replit 的事故，我们本应具备完善且鲁棒的备份机制，本应有严格限定的作用域权限，在理想情况下绝对不应该允许 AI Agent 拥有删除生产数据库的权限。再比如加拿大航空的机器人，如果引入了权威真实数据源（Source of Truth）的检索机制，它就不会基于过期或错误的政策做出决策了。

## 第二部分：架构转变：从 Chatbot 到生产系统（02:17–03:30）

**幻灯片 3：*THE ARCHITECTURAL SHIFT: From Chatbot to Production System***

### 02:17–02:44

**英文原文**

> So, let's, uh, go over the transition from chatbot to production system. Uh, so, initially when we were in the, uh, in the, uh, age where LLMs were just chatbots, uh, we had prompt in, and we were outputting text. There were no side effects, the agent was not interacting with any other system.

**中文直译**

> 现在让我们来看一下从 Chatbot 到生产系统的架构演进。最初，当我们还处于大模型仅仅作为聊天机器人的时代，我们输入 Prompt，模型输出文本。这不会产生任何外部副作用（Side Effects），Agent 也没有与任何其他外部系统发生交互。

### 02:44–03:13

**英文原文**

> However, due to agentic—in the agentic era, in the agentic revolution, now those agents, uh, by ingesting prompt, can run an agent loop, call external services, call tools, and also perform state changes. The architectural boundary now has moved, uh, way beyond an LLM model. And the difference is that it can now cause side effects in the outside world.

**中文直译**

> 然而，在当下的 Agent 时代与变革中，这些 Agent 接收 Prompt 之后，可以运行 Agent 循环、调用外部服务、调用工具，并且能够执行状态变更（State Changes）。系统的架构边界已经远远超出了 LLM 模型本身。最根本的区别在于：它现在能够对外部物理世界产生副作用。

### 03:13–03:30

**英文原文**

> So, when building AI agents, it is important to recognize the external systems that it is talking to, the states that, uh, it is interacting with, and what credentials does it have, and the actions that it can perform.

**中文直译**

> 因此，在构建 AI Agent 时，明确识别它正在与哪些外部系统通信、它正在与哪些状态交互、它持有什么凭据，以及它能够执行哪些具体操作，是至关重要的。

## 第三部分：心智模型：概率型协调器（03:30–04:41）

**幻灯片 4：*MENTAL MODEL: The Probabilistic Coordinator***

### 03:30–03:57

**英文原文**

> Uh, I ideally like to think about it as, uh, AI agents as basically having a probabilistic coordinator. In distributed systems as well, we used to have services which were coordinating, uh, multi-step workflows. However, they were deterministic in nature.

**中文直译**

> 我个人倾向于将 AI Agent 的核心理解为一个“概率型协调器”（Probabilistic Coordinator）。在传统的分布式系统中，我们同样拥有协调多步骤工作流的服务，但它们在本质上是确定性的（Deterministic）。

### 03:57–04:24

**英文原文**

> But in the case of AI agent, the AI acts as a probabilistic coordinator. The kind of actions that it can take can vary quite a lot. It is not just a decision tree that, uh, we typically in traditional systems would have mapped out. And those, uh, actions can have severe consequences, uh, if they are not confined by having deterministic controls in place.

**中文直译**

> 但在 AI Agent 中，AI 充当的是一个概率型的协调组件。它可能采取的操作种类差异极大，绝不仅仅是我们在传统系统中预先画好的决策树。如果不对这些操作加以确定性的控制约束，它们就可能导致极其严重的后果。

### 04:24–04:41

**英文原文**

> So it is important to ensure, uh, that we have deterministic controls in place to ensure that agent—or the AI agent is not performing any, uh, actions that might be, uh, problematic.

**中文直译**

> 因此，我们必须引入确定性控制（如状态机、重试机制、权限及审批流），确保 AI Agent 不会执行任何可能带来隐患的异常操作。

## 第四部分：Agent 循环即分布式工作流（04:41–06:52）

**幻灯片 5：*THE AGENT LOOP: The Loop Is a Distributed Workflow (Plan -> Act -> Observe -> Persist -> Decide)***

### 04:41–05:12

**英文原文**

> So, uh, let's, uh, discuss the, how a typical agent loop might look like. So, at first it might, uh, do some planning, then based on that plan it will perform an action, and it will then observe the results of those actions, and, uh, it might persist that into some data store, and then decide what to do next.

**中文直译**

> 现在让我们探讨一下典型的 Agent 循环是什么样的。首先，它会进行规划（Plan）；基于该规划去执行操作（Act）；随后观察操作的结果（Observe）；接着它可能会把结果持久化存储到某个数据源中（Persist）；最后决定下一步做什么（Decide）。

### 05:12–05:43

**英文原文**

> Each step in this loop is basically crossing a boundary. During planning, it can interact with data sources to retrieve some data. Uh, during action, it can call external APIs, tools, uh, databases, and perform any actions. During observation phase, it can get partial results and basically plan or make subsequent actions based on those partial results.

**中文直译**

> 这个循环中的每一步实质上都在跨越系统边界。在规划阶段，它可能与数据源交互以检索数据；在执行阶段，它可以调用外部 API、工具、数据库并执行动作；在观察阶段，它可能只拿到部分结果，并基于这些残缺的结果去规划或推进后续动作。

### 05:43–06:01

**英文原文**

> It can persist incorrect data, and, uh, when deciding, it might also decide to perform an incorrect action, or, uh, worse, it can also do a retry storm.

**中文直译**

> 它可能会持久化错误的数据；而在决策阶段，它可能会决定执行一个错误的操作，更糟糕的是，它甚至可能触发重试风暴（Retry Storm）。

### 06:01–06:25

**英文原文**

> So it is very important when building an agent loop to persist every step of the process. Whatever actions the agent is doing, whatever context it is retrieving, it is important to persist that, so that if anything fails, the agent is able to recognize where it failed, and it can perform, uh, a reversible action—it can perform undo operations.

**中文直译**

> 因此，在构建 Agent 循环时，持久化记录流程中的每一个步骤尤为重要。无论 Agent 执行了什么操作、检索了什么上下文，都必须持久化下来。这样一旦发生故障，Agent 才能定位它是在哪一步失败的，进而能够执行逆向操作或 Undo 回滚。

### 06:25–06:52

**英文原文**

> Similarly, there should be explicit transitions, uh, identified for each step. So for instance, if an agent is making a call, if it fails, what it should do? What should be the transaction to compensate for a—for a irreversible or unsafe operation? For instance, if an agent sends a wrong email to a customer, what should it do to compensate for that?

**中文直译**

> 同样地，每一步之间必须定义明确的状态转移逻辑。例如，如果 Agent 发起一次调用失败了，它该做什么？针对不可逆或不安全的操作，应当执行什么样的补偿事务？举个例子：如果 Agent 给客户错发了一封邮件，它应该怎样去执行补偿动作来挽回错误？

## 第五部分：工具调用本质上是远程 RPC 调用（06:52–09:03）

**幻灯片 6：*REMOTE CALLS: Tool Calls Are Remote Calls***

### 06:52–07:31

**英文原文**

> So, uh, tool calls are just wrappers around, uh, external external APIs, databases, queues, uh, and so on. And, uh, with, uh, when calling—when making these remote calls, there are some failures that you incorporate, uh, such as network delays, timeouts, uh, you can make duplicate requests, or worse, the server-side request, uh, might succeed, however the client might be reported an error.

**中文直译**

> 所谓的工具调用（Tool Calls），本质上只是对外部 API、数据库、消息队列等组件的一层包装。在发起这些远程调用时，你必然会遭遇分布式系统的各种故障：网络延迟、超时、重复请求，或者更糟糕的隐蔽故障——服务端实际执行成功了，但客户端却收到了报错。

### 07:31–08:04

**英文原文**

> We have seen instances where, uh, a database might have written the data, however due to some other errors, the server might have reported, uh, to us the error, and, uh, with humans in the loop, we can basically perform corrective actions based on by seeing the database and actual source of truth. But in agent's case, we need to ensure that we have proper guardrails in place.

**中文直译**

> 我们见过很多这样的场景：数据库实际上已经写入了数据，但由于某些后续错误，服务端向我们返回了异常。如果有人类在流程中（Human-in-the-loop），我们人类可以通过去查看底层数据库和权威事实来源来手动修正；但在全自动 Agent 的场景下，我们必须通过健全的护栏机制来兜底。

### 08:04–08:33

**英文原文**

> So for instance, an agent calls ‘refund customer’, uh, tool call, which basically performs a refund to the customer. The request times out. Did the refund happen or not? What will the agent infer from that? Would it retry, uh, refunding to the customer? Basically, the timeout does not actually mean that a failure had occurred; it means unknown.

**中文直译**

> 比如，Agent 调用了一个“向客户退款”的工具。请求超时了。那么退款到底发生了没有？Agent 会据此推断出什么？它会盲目向客户重新发起退款吗？在分布式领域，超时绝不等于失败，超时意味着“状态未知”（Unknown）。

### 08:33–09:03

**英文原文**

> And it is important, when designing these tools, it is important to have request IDs, idempotency keys, so that when making duplicate requests, they are not causing duplicate side effects. And the system can always do a status lookup, like what the previous request was and what was the status of that, so that it is not making side effects with duplicate requests.

**中文直译**

> 所以在设计这些工具接口时，必须引入请求 ID（Request ID）和幂等键（Idempotency Key），确保发起重复请求时不会引发重复扣款等副作用。同时系统必须支持状态查询机制（Status Lookup），能够查到前一个请求究竟处于什么状态，从而杜绝重复调用产生的破坏。

## 第六部分：可靠性模式：安全重试依赖幂等性（09:03–10:24）

**幻灯片 7：*RELIABILITY PATTERNS: Safe Retries Require Idempotency***

### 09:03–09:38

**英文原文**

> So, AI agents, when they—whenever they, uh, uh, whenever they, uh, they face failures, they retry. Their first, uh, action is to perform retries. So it is really important to have idempotency baked in. If a same request is coming in to an external API or the tool, it should recognize that this is a duplicate request and ensure that no side effects are taking place.

**中文直译**

> AI Agent 无论何时遇到错误，它们的第一反应往往都是直接重试。因此，在底层内置幂等性设计至关重要。当相同的请求再次抵达外部 API 或工具时，服务端必须能够识别出这是一个重复请求，并确保不会产生二次副作用。

### 09:38–10:00

**英文原文**

> Moreover, we should also prevent, uh, AI agents to perform retry storms to external APIs, because this can cause cascading failures. We should have max turns, budget spend, and max parallel calls to ensure that the fan-out is not that large.

**中文直译**

> 此外，我们必须阻止 AI Agent 向外部接口发起“重试风暴”，因为这会导致下游系统的级联崩溃。我们必须设定最大轮数（Max Turns）、花费预算上限（Budget Spend）和最大并发调用数（Max Parallel Calls），控制调用扇出（Fan-out）规模。

### 10:00–10:24

**英文原文**

> Moreover, we should have exponential backoff in place to ensure that, uh, the downstream dependencies are not being, uh, burdened. And we should also have compensation, uh, operations in place for, uh, operations that can have side effects.

**中文直译**

> 并且，我们应当引入指数退避（Exponential Backoff）机制，防止压垮下游依赖。针对具有副作用的操作，还必须配套定义补偿操作机制。

## 第七部分：状态管理：记忆就是生产环境的状态（10:24–12:06）

**幻灯片 8：*STATE MANAGEMENT: Memory Is Production State***

### 10:24–11:00

**英文原文**

> So, uh, a lot of, uh, teams when building AI agents think of AI agent context as just a context. However, when that context can influence an action, it's a state, and that state can become stale, that can conflict with the authoritative data, or corrupt future actions that the agent might perform.

**中文直译**

> 许多团队在做开发时，仅仅把 Agent 的上下文当作普通文本。但只要这段上下文能够左右后续的操作，它本质上就是系统的状态（State）。而状态就会面临陈旧过期、与权威数据源冲突，甚至污染损坏 Agent 未来动作的风险。

### 11:00–11:25

**英文原文**

> I like to classify it into two different types of, uh, memory that the agent has: First is the short-term memory, which is the chat thread, uh, that the agent has, uh, the, which is tied to a single execution thread. And the second is the long-term memory: it can be project files, uh, system prompts, uh, databases that it interacts with, the cache layer, and so on.

**中文直译**

> 我习惯把 Agent 的记忆划分为两类：第一类是短期记忆，即绑定在单次执行线程上的会话上下文（Chat Thread）；第二类是长期记忆，包括项目文件、系统提示词、所交互的数据库、缓存层等等。

### 11:25–12:06

**英文原文**

> It is important to, uh, to decide what will be the source of truth when these, uh, different data sources have conflicting information. And we should ideally treat memory as a cache which can be invalidated, which can have provenance attached to it. So for instance, whenever a data store or a database is updated, or the source of truth is updated, we invalidate the context or the memory that the agent has, to ensure that it is not making actions based on the incorrect or stale data.

**中文直译**

> 当这些不同的数据源产生冲突时，必须明确界定谁才是“权威真实源”（Source of Truth）。在架构上，我们应当把 Agent 的记忆视同为带有失效机制、可溯源的数据缓存（Cache）。一旦底层数据库或事实源发生了更新，就必须主动让 Agent 持有的上下文或记忆失效，防止它基于过期或错误数据去执行操作。

## 第八部分：故障处理：部分失败必须依赖补偿机制（12:06–13:17）

**幻灯片 9：*FAILURE HANDLING: Partial Failure Requires Compensation***

### 12:06–12:51

**英文原文**

> So, usually these agents perform multi-step actions. And the agent can succeed on the first couple of steps and then it fail. It is important to reverse the entire transaction that was performed, and these can then cross system boundaries. So for instance, an agent can update an internal ticket, send an email to a customer, and fail to update the CRM. We need to figure out what is the correct compensation operation when it hits that failure.

**中文直译**

> 通常 Agent 都是执行跨服务的多步骤长流程。它完全可能在顺利完成前两步后，在第三步遭遇失败。跨越异构系统边界时，全量自动回滚（Rollback）通常只是一种幻想。比如：Agent 更新了内部工单，向客户发送了邮件，但在更新 CRM 系统时失败了。我们必须在系统设计中明确：当触发局部失败时，对应的补偿操作（Compensation）究竟是什么。

### 12:51–13:17

**英文原文**

> So for instance, as I mentioned earlier, that, uh, it improperly sends an incorrect email to the customer, it is important that the compensation operation is defined for the AI agent to ensure that it is sending an apology email to the customer or an email that is correcting that mistake.

**中文直译**

> 就像我刚才提到的例子，如果它错误地向客户发出了邮件，就必须为 Agent 显式定义补偿操作，驱动它去发送一封致歉说明或更正邮件来弥补这个错误。

## 第九部分：流量控制：控制 Agent 的执行循环（13:17–14:50）

**幻灯片 10：*FLOW CONTROL: Control the Loop***

### 13:17–13:54

**英文原文**

> So, uh, the AI agent basically runs in a loop, and whenever, uh, like it can, it can do multiple calls, it can, it can have a retry, uh, retry loop that it can run based, uh, whenever it fails. So it is important to have circuit breakers whenever it is making external calls, to ensure that the, uh, that the, uh, that it is not, uh, burdening the downstream system. For instance, if a downstream is unhealthy, there should be circuit breakers in place that prevents AI agents to call, call that dependency.

**中文直译**

> AI Agent 核心运行在一个循环中。它会并发发起多个调用，一旦失败就可能陷入死循环重试。因此，在对外调用时必须部署熔断器（Circuit Breakers）。当下游服务出现异常或亚健康时，熔断器应当立即阻断 Agent，阻止它继续向不健康的依赖服务倾泻流量。

### 13:54–14:14

**英文原文**

> Moreover, it also prevents cascading failures when, for instance, the downstream dependency is unhealthy or is saturated.

**中文直译**

> 这也能有效防止下游依赖在达到饱和或发生故障时，演变成整个系统的雪崩级联失效。

### 14:14–14:50

**英文原文**

> It is also important to assign rate limits and budgets. An agent can run your cost, uh, if it's not assigned proper budgets and rate limits. It will keep retrying and try to solve the problem that if it's facing. So it is important that we have set up max turns, max parallelism, max spend, to ensure that the model is not, uh, uh, not crossing the budget boundary that we have set.

**中文直译**

> 同时，限流（Rate Limits）与预算配额管理（Budgets）也必不可少。如果没有严格的预算和频次限制，Agent 在遇到死胡同时会不断重试、不断扩大并发，疯狂烧掉你的资金。所以必须严格设置最大轮数、最大并发数和最大开销阈值，确保模型绝不会逾越预设的成本边界。

## 第十部分：权限管控：最小权限与持久化审批（14:50–16:30）

**幻灯片 11：*AUTHORITY: Scope the Authority***

### 14:50–15:34

**英文原文**

> Moreover, ideally, uh, usually whenever we are building AI agents, uh, we usually try to give all the permissions that it can have to ensure that it has all—that it can perform the task that we have. That's the first step that we take usually—to give the AI agents all the privileges to perform any actions. Like for instance, if it's interacting with a database, we just give it all the read/write access to the entire table.

**中文直译**

> 此外，通常我们在最初开发 Agent 时，习惯于把所有权限统统放开，生怕限制了它执行任务的能力。这是很多人常犯的第一步错误——直接赋予 Agent 操作一切的最高权限。比如对接数据库时，就图省事直接给整张表的读写全权限。

### 15:34–15:52

**英文原文**

> However, it is important to give scoped credentials to it. There should be separate read and write permissions, and there should be allowlists for the tools that it can call. A harmless model can become dangerous when it can perform unsafe operations.

**中文直译**

> 然而在工程落地中，必须贯彻最小权限原则（Scoped Credentials）。严格分离读、写与执行权限，并针对可调用的工具建立白名单机制（Allowlists）。一个原本无害的模型，一旦赋予了执行破坏性操作的能力，瞬间就会变成极度危险的安全隐患。

### 15:52–16:30

**英文原文**

> Moreover, a human approval shouldn't be tied to a blanket approval. It should be tied to, uh, action, timestamp, actor, and expiration. So for instance, if a user has given an approval to approve a $30 refund, it shouldn't turn into a subsequent approval for $300 refund. It is important that whenever an approval is given, it should be tied to the particular parameters that it was asked for.

**中文直译**

> 再者，所谓的人工审批机制绝不能是一张“万能通行证”（Blanket Approval）。每一次审批都必须强绑定具体的动作、时间戳、执行主体及过期时间。举个例子：如果管理员批准了一笔 30 美元的退款申请，这个授权决不能被 Agent 挪用来擅自执行后续 300 美元的退款。审批事件必须在工作流层面与特定的请求参数进行不可篡改的硬绑定。

## 第十一部分：可观测性：追踪因果链路（16:30–17:30）

**幻灯片 12：*OBSERVABILITY & DEBUGGING: Trace The Causal Path***

### 16:30–17:00

**英文原文**

> So, uh, observability is an important requirement when building AI agents, because logs are not enough. Teams need to reconstruct, when an agent failed, what happened, what information was it reacting to, and why it failed. And logs alone are not enough for teams to determine that.

**中文直译**

> 可观测性是构建 AI Agent 的核心要求，因为单纯看日志（Logs）是远远不够的。当 Agent 崩溃或行为失常时，工程团队必须能够复原整个因果链路：究竟发生了什么？Agent 当时是基于什么输入做出的反应？为什么会失败？单凭扁平的日志根本无法回答这些问题。

### 17:00–17:30

**英文原文**

> It is important to trace the model that was called, the prompt that was given to it, and also the tool calls that were made, the request that was made, the response from the tool, the errors that it got, the retrieved context—what the agent was reacting to—the writes that it made, and the approvals that it got, and so on.

**中文直译**

> 必须建立完整的因果追踪（Tracing）：记录每次调用的具体模型与参数、当时传入的完整 Prompt、发起的每一次工具调用及入参、工具返回的原生响应与报错、检索召回的上下文信息、持久化状态写入，以及获取的每一项人工审批等等。

## 第十二部分：总结：架构本身就是安全用例（17:30–19:30）

**幻灯片 13：*CLOSING THESIS: The Architecture Is the Safety Case***

### 17:30–18:03

**英文原文**

> So, uh, I would like to, uh, end with, uh, the idea that, yes, model capability matters. Having good models improves the likelihood of it making, uh, correct operations, smarter models reduce mistakes, it improves the capability that the model has. However, it cannot eliminate network failures, stale data, or adversarial input.

**中文直译**

> 在演讲的最后，我想强调：是的，底层基础模型的能力确实非常重要。更强大的模型能够提高执行正确操作的概率，更聪明的模型能减少幻觉和推理犯错。但是，更强大的模型永远不可能消除网络中断、陈旧脏数据或者对抗性恶意攻击。

### 18:03–18:46

**英文原文**

> It is important, when building this architecture, we also reason about: can we bound, observe, and recover from actions performed by the AI agent? It is important to have tool contracts in place to ensure that it is only allowed to make operations that provide the contract. And the contracts are clearly establishing the request and response types, the schema, and all these tools have idempotency baked into it, so that when repeated requests are sent in, it is not causing unsafe operations to be retried.

**中文直译**

> 在构建这套架构时，我们必须深入审视这三个核心问题：面对 AI Agent 的行为，我们能否有效约束边界（Bound）？能否全链路观测（Observe）？能否在出错后优雅恢复（Recover）？我们必须建立工具调用契约（Tool Contracts），严格界定请求与响应的数据结构 Schema；并在接口中固化幂等性，防止不安全操作在重试中失控。

### 18:46–19:19

**英文原文**

> Moreover, there should be source of truth decisions made when there are conflicting memory states. It is important for the agent to realize this is the source of truth data that it should rely on. And we should have retry policies, like rate limits set in to ensure that the agent is not retrying aggressively. Moreover, permissions should be set up, there should be traces and recovery paths.

**中文直译**

> 同时，当记忆状态发生冲突时，系统必须有裁决权威事实源的兜底规则。Agent 必须明确知道到底哪一份数据才是可信源。我们还必须配置完备的重试策略与频控阈值，遏制激进重试。设定精细的权限边界、可观测追踪链路以及灾后恢复路径。

### 19:19–19:30

**英文原文**

> So, when building AI agents, we should also ask what the system lets it do when it is wrong. Thank you.

**中文直译**

> 因此，当我们着手构建 AI Agent 时，不要只问它有多聪明；更应该拷问：**当它一旦犯错时，我们的系统允许它做出什么出格的事？** 谢谢大家。

## 致谢与片尾（19:30–19:48）

*观众掌声，演讲人鞠躬下台；片尾动画：AI Engineer World's Fair 官网链接与赞助商信息。*

---

原视频：[https://www.youtube.com/watch?v=hD9-V56FNRI](https://www.youtube.com/watch?v=hD9-V56FNRI)
