---
sourceDigest: "c415c4cffa30957e2df0d4f18c617a0da434500530f495d051ee5c4db897f18f"
title: "AI Agents Are Also Distributed Systems"
description: "Full transcript of Salman Munaf's AI Engineer World's Fair 2024 talk on agent loops, remote tool calls, idempotency, state, and observability."
---

<aside class="source-note">

**Video Source**

- Talk: Salman Munaf, *AI Agents Are Also Distributed Systems*
- Event: AI Engineer World's Fair, July 2, 2024
- Original video: [YouTube — AI Agents Are Also Distributed Systems](https://www.youtube.com/watch?v=hD9-V56FNRI)

Organized along the video timeline, preserving the full spoken transcript with only heading levels, timestamps, and formatting adjusted for readability. Slide numbers follow the talk's order.

</aside>

## Intro and Walk-On (00:00–00:12)

**Opening video bumper: AI Engineer World's Fair sponsor roll; speaker Salman Munaf walks onto the stage.**

## Opening Remarks (00:13–01:06)

**Slide 1: *AI Agents Are Also Distributed Systems | Salman Munaf | Leadership 1 • July 2, 2024***

### 00:13–00:20

Hello everyone, good afternoon. Today, uh, I will be talking about AI agents are also distributed systems.

### 00:20–00:50

So, as, uh, the models have started to become more complex, initially the, uh, LLM models were just text in, text out, without performing any actions, and the, uh, effect that they can produce was just a wrong model output. However, with now the capability of agent—the rise in agentic capabilities, where the systems can now talk to external systems,

### 00:50–01:06

uh, it has turned into a distributed systems, and it is important to incorporate distributed systems thinking and concepts when building AI agents. So I will be going over that, uh, in this talk.

## Part 1: When AI Agents Fail — Lessons from Distributed Systems (01:06–02:17)

**Slide 2: *When AI Agents Fail: Lessons from Distributed Systems***

### 01:06–01:41

So, you guys might have, uh, heard about incidents being caused by AI agents. Uh, for instance, the Replit AI agent deleting a production incident—production database, or Air Canada chatbot basically making an, uh, an incorrect refund. And both of these, uh, incidents, or a lot of these incidents, could have been prevented, uh, by good systems thinking when building these, uh, AI agents.

### 01:41–02:17

So for instance, for the Replit incident, we could have good—we could have robust backups, we could have scoped authority, we should—we shouldn't ideally have, uh, allowed AI agents to delete production databases. Moreover, for Air Canada chatbot, it would have been, uh, a good idea to have authoritative source of truth retrieval, so that it's not making, uh, decisions based on stale or incorrect policies.

## Part 2: The Architectural Shift — From Chatbot to Production System (02:17–03:30)

**Slide 3: *THE ARCHITECTURAL SHIFT: From Chatbot to Production System***

### 02:17–02:44

So, let's, uh, go over the transition from chatbot to production system. Uh, so, initially when we were in the, uh, in the, uh, age where LLMs were just chatbots, uh, we had prompt in, and we were outputting text. There were no side effects, the agent was not interacting with any other system.

### 02:44–03:13

However, due to agentic—in the agentic era, in the agentic revolution, now those agents, uh, by ingesting prompt, can run an agent loop, call external services, call tools, and also perform state changes. The architectural boundary now has moved, uh, way beyond an LLM model. And the difference is that it can now cause side effects in the outside world.

### 03:13–03:30

So, when building AI agents, it is important to recognize the external systems that it is talking to, the states that, uh, it is interacting with, and what credentials does it have, and the actions that it can perform.

## Part 3: Mental Model — The Probabilistic Coordinator (03:30–04:41)

**Slide 4: *MENTAL MODEL: The Probabilistic Coordinator***

### 03:30–03:57

Uh, I ideally like to think about it as, uh, AI agents as basically having a probabilistic coordinator. In distributed systems as well, we used to have services which were coordinating, uh, multi-step workflows. However, they were deterministic in nature.

### 03:57–04:24

But in the case of AI agent, the AI acts as a probabilistic coordinator. The kind of actions that it can take can vary quite a lot. It is not just a decision tree that, uh, we typically in traditional systems would have mapped out. And those, uh, actions can have severe consequences, uh, if they are not confined by having deterministic controls in place.

### 04:24–04:41

So it is important to ensure, uh, that we have deterministic controls in place to ensure that agent—or the AI agent is not performing any, uh, actions that might be, uh, problematic.

## Part 4: The Agent Loop Is a Distributed Workflow (04:41–06:52)

**Slide 5: *THE AGENT LOOP: The Loop Is a Distributed Workflow (Plan -> Act -> Observe -> Persist -> Decide)***

### 04:41–05:12

So, uh, let's, uh, discuss the, how a typical agent loop might look like. So, at first it might, uh, do some planning, then based on that plan it will perform an action, and it will then observe the results of those actions, and, uh, it might persist that into some data store, and then decide what to do next.

### 05:12–05:43

Each step in this loop is basically crossing a boundary. During planning, it can interact with data sources to retrieve some data. Uh, during action, it can call external APIs, tools, uh, databases, and perform any actions. During observation phase, it can get partial results and basically plan or make subsequent actions based on those partial results.

### 05:43–06:01

It can persist incorrect data, and, uh, when deciding, it might also decide to perform an incorrect action, or, uh, worse, it can also do a retry storm.

### 06:01–06:25

So it is very important when building an agent loop to persist every step of the process. Whatever actions the agent is doing, whatever context it is retrieving, it is important to persist that, so that if anything fails, the agent is able to recognize where it failed, and it can perform, uh, a reversible action—it can perform undo operations.

### 06:25–06:52

Similarly, there should be explicit transitions, uh, identified for each step. So for instance, if an agent is making a call, if it fails, what it should do? What should be the transaction to compensate for a—for a irreversible or unsafe operation? For instance, if an agent sends a wrong email to a customer, what should it do to compensate for that?

## Part 5: Tool Calls Are Remote Calls (06:52–09:03)

**Slide 6: *REMOTE CALLS: Tool Calls Are Remote Calls***

### 06:52–07:31

So, uh, tool calls are just wrappers around, uh, external external APIs, databases, queues, uh, and so on. And, uh, with, uh, when calling—when making these remote calls, there are some failures that you incorporate, uh, such as network delays, timeouts, uh, you can make duplicate requests, or worse, the server-side request, uh, might succeed, however the client might be reported an error.

### 07:31–08:04

We have seen instances where, uh, a database might have written the data, however due to some other errors, the server might have reported, uh, to us the error, and, uh, with humans in the loop, we can basically perform corrective actions based on by seeing the database and actual source of truth. But in agent's case, we need to ensure that we have proper guardrails in place.

### 08:04–08:33

So for instance, an agent calls ‘refund customer’, uh, tool call, which basically performs a refund to the customer. The request times out. Did the refund happen or not? What will the agent infer from that? Would it retry, uh, refunding to the customer? Basically, the timeout does not actually mean that a failure had occurred; it means unknown.

### 08:33–09:03

And it is important, when designing these tools, it is important to have request IDs, idempotency keys, so that when making duplicate requests, they are not causing duplicate side effects. And the system can always do a status lookup, like what the previous request was and what was the status of that, so that it is not making side effects with duplicate requests.

## Part 6: Reliability Patterns — Safe Retries Require Idempotency (09:03–10:24)

**Slide 7: *RELIABILITY PATTERNS: Safe Retries Require Idempotency***

### 09:03–09:38

So, AI agents, when they—whenever they, uh, uh, whenever they, uh, they face failures, they retry. Their first, uh, action is to perform retries. So it is really important to have idempotency baked in. If a same request is coming in to an external API or the tool, it should recognize that this is a duplicate request and ensure that no side effects are taking place.

### 09:38–10:00

Moreover, we should also prevent, uh, AI agents to perform retry storms to external APIs, because this can cause cascading failures. We should have max turns, budget spend, and max parallel calls to ensure that the fan-out is not that large.

### 10:00–10:24

Moreover, we should have exponential backoff in place to ensure that, uh, the downstream dependencies are not being, uh, burdened. And we should also have compensation, uh, operations in place for, uh, operations that can have side effects.

## Part 7: State Management — Memory Is Production State (10:24–12:06)

**Slide 8: *STATE MANAGEMENT: Memory Is Production State***

### 10:24–11:00

So, uh, a lot of, uh, teams when building AI agents think of AI agent context as just a context. However, when that context can influence an action, it's a state, and that state can become stale, that can conflict with the authoritative data, or corrupt future actions that the agent might perform.

### 11:00–11:25

I like to classify it into two different types of, uh, memory that the agent has: First is the short-term memory, which is the chat thread, uh, that the agent has, uh, the, which is tied to a single execution thread. And the second is the long-term memory: it can be project files, uh, system prompts, uh, databases that it interacts with, the cache layer, and so on.

### 11:25–12:06

It is important to, uh, to decide what will be the source of truth when these, uh, different data sources have conflicting information. And we should ideally treat memory as a cache which can be invalidated, which can have provenance attached to it. So for instance, whenever a data store or a database is updated, or the source of truth is updated, we invalidate the context or the memory that the agent has, to ensure that it is not making actions based on the incorrect or stale data.

## Part 8: Failure Handling — Partial Failure Requires Compensation (12:06–13:17)

**Slide 9: *FAILURE HANDLING: Partial Failure Requires Compensation***

### 12:06–12:51

So, usually these agents perform multi-step actions. And the agent can succeed on the first couple of steps and then it fail. It is important to reverse the entire transaction that was performed, and these can then cross system boundaries. So for instance, an agent can update an internal ticket, send an email to a customer, and fail to update the CRM. We need to figure out what is the correct compensation operation when it hits that failure.

### 12:51–13:17

So for instance, as I mentioned earlier, that, uh, it improperly sends an incorrect email to the customer, it is important that the compensation operation is defined for the AI agent to ensure that it is sending an apology email to the customer or an email that is correcting that mistake.

## Part 9: Flow Control — Control the Loop (13:17–14:50)

**Slide 10: *FLOW CONTROL: Control the Loop***

### 13:17–13:54

So, uh, the AI agent basically runs in a loop, and whenever, uh, like it can, it can do multiple calls, it can, it can have a retry, uh, retry loop that it can run based, uh, whenever it fails. So it is important to have circuit breakers whenever it is making external calls, to ensure that the, uh, that the, uh, that it is not, uh, burdening the downstream system. For instance, if a downstream is unhealthy, there should be circuit breakers in place that prevents AI agents to call, call that dependency.

### 13:54–14:14

Moreover, it also prevents cascading failures when, for instance, the downstream dependency is unhealthy or is saturated.

### 14:14–14:50

It is also important to assign rate limits and budgets. An agent can run your cost, uh, if it's not assigned proper budgets and rate limits. It will keep retrying and try to solve the problem that if it's facing. So it is important that we have set up max turns, max parallelism, max spend, to ensure that the model is not, uh, uh, not crossing the budget boundary that we have set.

## Part 10: Authority — Scope the Authority (14:50–16:30)

**Slide 11: *AUTHORITY: Scope the Authority***

### 14:50–15:34

Moreover, ideally, uh, usually whenever we are building AI agents, uh, we usually try to give all the permissions that it can have to ensure that it has all—that it can perform the task that we have. That's the first step that we take usually—to give the AI agents all the privileges to perform any actions. Like for instance, if it's interacting with a database, we just give it all the read/write access to the entire table.

### 15:34–15:52

However, it is important to give scoped credentials to it. There should be separate read and write permissions, and there should be allowlists for the tools that it can call. A harmless model can become dangerous when it can perform unsafe operations.

### 15:52–16:30

Moreover, a human approval shouldn't be tied to a blanket approval. It should be tied to, uh, action, timestamp, actor, and expiration. So for instance, if a user has given an approval to approve a $30 refund, it shouldn't turn into a subsequent approval for $300 refund. It is important that whenever an approval is given, it should be tied to the particular parameters that it was asked for.

## Part 11: Observability & Debugging — Trace the Causal Path (16:30–17:30)

**Slide 12: *OBSERVABILITY & DEBUGGING: Trace The Causal Path***

### 16:30–17:00

So, uh, observability is an important requirement when building AI agents, because logs are not enough. Teams need to reconstruct, when an agent failed, what happened, what information was it reacting to, and why it failed. And logs alone are not enough for teams to determine that.

### 17:00–17:30

It is important to trace the model that was called, the prompt that was given to it, and also the tool calls that were made, the request that was made, the response from the tool, the errors that it got, the retrieved context—what the agent was reacting to—the writes that it made, and the approvals that it got, and so on.

## Part 12: Closing Thesis — The Architecture Is the Safety Case (17:30–19:30)

**Slide 13: *CLOSING THESIS: The Architecture Is the Safety Case***

### 17:30–18:03

So, uh, I would like to, uh, end with, uh, the idea that, yes, model capability matters. Having good models improves the likelihood of it making, uh, correct operations, smarter models reduce mistakes, it improves the capability that the model has. However, it cannot eliminate network failures, stale data, or adversarial input.

### 18:03–18:46

It is important, when building this architecture, we also reason about: can we bound, observe, and recover from actions performed by the AI agent? It is important to have tool contracts in place to ensure that it is only allowed to make operations that provide the contract. And the contracts are clearly establishing the request and response types, the schema, and all these tools have idempotency baked into it, so that when repeated requests are sent in, it is not causing unsafe operations to be retried.

### 18:46–19:19

Moreover, there should be source of truth decisions made when there are conflicting memory states. It is important for the agent to realize this is the source of truth data that it should rely on. And we should have retry policies, like rate limits set in to ensure that the agent is not retrying aggressively. Moreover, permissions should be set up, there should be traces and recovery paths.

### 19:19–19:30

So, when building AI agents, we should also ask what the system lets it do when it is wrong. Thank you.

## Closing and Applause (19:30–19:48)

**Applause as the speaker leaves the stage; closing bumper with AI Engineer World's Fair links and sponsors.**

---

Original video: [https://www.youtube.com/watch?v=hD9-V56FNRI](https://www.youtube.com/watch?v=hD9-V56FNRI)
