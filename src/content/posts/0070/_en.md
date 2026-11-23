---
sourceDigest: "32bc0a6c62f84c058fe51350ff1fed7e19df22399ea3ea511e43517e2df10c2d"
title: "Vibe Coding: An Introduction for My Team (May 12, 2026)"
description: "An internal talk on coding agents, five tools, engineering workflows, failure modes, and my own day-to-day setup."
---

## Part I: Principles and mechanisms

### 1. Forms of agent software

![image](assets/image-20260429132343-ygmbchg.webp)

#### 1. GUI: AI IDEs based on open-source VS Code

![image](assets/image-20260429142708-e4z0i6a.webp)

#### 2. CLIs running on a server or VPS

![image](assets/image-20260429142835-jl5xd71.webp)

![image](assets/image-20260429154548-2l37d8a.webp)

#### 3. Native desktop apps

![image](assets/image-20260429142940-zqbjp77.webp)

### 2. The basic structure of an agent

#### 1. Basic architecture

An agent ≈ **LLM + tools + context management + a ReAct loop**.

![image](assets/image-20260429132442-2c2jn87.webp)

#### 2. LLM capabilities: What powers the agent

##### 2.1 Model capabilities and tools

AI platforms list model capabilities on their API pricing pages. A few representative screenshots show what an agent is built on.

![image](assets/image-20260512140325-busesaf.webp)

##### 2.2 Structured output and tool calling (function calling)

**Structured output** usually means JSON output in the LLM context. It is what carries tool calls. Without reliable structured output, calls fail frequently, the ReAct loop stalls, and the agent cannot be relied on.

**Tool calling** is how the model asks to take action. It uses structured output to specify the tool and its arguments.

It resembles one service making an RPC to another, except the model generates the request. The agent client parses the arguments, executes the tool, and feeds the result back to the model.

![image](assets/image-20260512140355-l8tavb6.webp)

![image](assets/image-20260512140407-mgtn59b.webp)

![image](assets/image-20260512140420-j1pqsa1.webp)

![image](assets/image-20260512140432-zj2d07c.webp)

![image](assets/image-20260512140444-a2ei9at.webp)

#### 3. The agent’s inputs: Context windows and prompt management

> A context window is all the text a language model can refer to when generating a response, including the response itself.
>
> —— Claude API Docs

- The context window includes the system prompt, conversation history, tool results, and file contents. A text prompt is the only way the outside world interacts with the LLM.

![image](assets/image-20260512144421-z5azd7e.webp)

### 3. What agents can do and how they work

#### 1. “Omnipotent” LLMs and concrete requirements

![image](assets/image-20260506122830-6r9tasw.webp)

---

![image](assets/image-20260429142002-hp2jero.webp)

---

![image](assets/image-20260429155254-g0eas5a.webp)

---

![image](assets/image-20260512160056-p6megmn.webp)

#### 2. Agent mechanisms and hard and soft constraints

##### Hard constraints versus soft rules

![image](assets/image-20260512160446-fo18a82.webp)

##### Three layers of mechanisms

![image](assets/image-20260512160617-t0mz9un.webp)

##### How five agent tools implement these mechanisms

The table compares where each mechanism lives, what format it uses, and whether it enforces requirements across Claude Code, Codex (OpenAI CLI), OpenCode (sst/opencode), Cursor, and Trae. The comparison draws on official documentation and open-source repositories.

##### Comparison matrix

| Mechanism | Claude Code | Codex | OpenCode | Cursor | Trae |
| --- | --- | --- | --- | --- | --- |
| **Persistent knowledge** | `CLAUDE.md`<br />Project, user, and enterprise levels | `AGENTS.md`<br />Subdirectory overrides via `AGENTS.override.md` | `AGENTS.md`<br />Backward compatible with `CLAUDE.md` | Plain Markdown `AGENTS.md` at the project root | `.trae/rules/project_rules.md` and `user_rules.md` |
| **Skills** | `.claude/skills/<name>/SKILL.md`<br />Follows the Agent Skills open standard | `.agents/skills/<name>/SKILL.md`<br />Frontmatter requires `name` and `description` | Supports `.opencode/`, `.claude/`, and `.agents/` | `.cursor/skills/<name>/SKILL.md` and `~/.cursor/skills/` | Project skills under .trae/skills/. User skills under ~/.trae/skills/ on macOS and Linux or %userprofile%/.trae/skills/ on Windows. |
| **Rules** | `.claude/rules/*.md`<br />Triggered by globs in frontmatter `paths:` | Uses AGENTS.md and Skills | The documentation calls AGENTS.md “Rules” | `.cursor/rules/*.mdc`<br />Four trigger modes: always, glob, agent-requested, and manual with `@` | `.trae/rules/`, alongside persistent knowledge |
| **Hooks** | `settings.json`<br />More than 30 events and three hook types | `~/.codex/hooks.json` or TOML<br />Six events. Requires the `codex_hooks=true` feature flag | `.opencode/plugins/*.ts`<br />More than 20 events and TypeScript or JavaScript plugins | `hooks.json`<br />Roughly 18 events, including Tab completion | |
| **Slash commands** | `.claude/commands/*.md`<br />Merged into Skills, with legacy paths still supported | `~/.codex/prompts/*.md`<br />Deprecated in favor of Skills | `.opencode/commands/*.md`<br />Supports `$ARGUMENTS`, `$N`, shell substitution, and `@file` | `.cursor/commands/*.md`<br />Minimal Markdown without frontmatter | |
| **Spec template** | No official template | No official template | No official template | No official template | No official template |

##### Notes

1. **AGENTS.md is a convention across tools.** The Linux Foundation’s Agentic AI Foundation hosts it. The official agents.md site lists OpenAI Codex, OpenCode, Cursor, Aider, VS Code, Devin, JetBrains Junie, GitHub Copilot Coding Agent, and Windsurf, among others. **Claude Code does not read AGENTS.md directly**, but its documentation recommends importing it with **`@AGENTS.md`** or sharing it through a symbolic link.
2. **None of these tools supplies an official spec template.** Kiro and OpenSpec provide their own conventions. The tools’ `/init` commands generate files for persistent instructions, such as CLAUDE.md or AGENTS.md. Requirements specifications are outside their scope.

## Part II: Engineering and practice

### 4. Agent coding workflows and frameworks: Putting software engineering into context

The harness ties together documentation, coding, and software engineering.

#### 1. Start with how the engineer thinks

![image](assets/image-20260512150307-wk3t0z5.webp)

![image](assets/image-20260512151807-km01op3.webp)

#### 2. Routine upkeep: From AGENTS.md to skills and specs

![image](assets/image-20260512150400-wi459h6.webp)

![image](assets/image-20260512145317-wt5tdm8.webp)

#### 3. Managing expectations

Correct course promptly and use feedback to refine the result.

![image](assets/image-20260512144531-n7w321t.webp)

#### 4. Review and acceptance: How do you trust code you haven’t seen?

##### 4.1 Humans become the bottleneck

![image](assets/image-20260512141445-fkfteuf.webp)

![image](assets/image-20260512142610-x1o0s5e.webp)

**What can you do about it?**

![image](assets/image-20260429161704-mhy6vm3.webp)

![image](assets/image-20260429164131-wmdcyvz.webp)

##### 4.2 Review

![image](assets/image-20260512142929-24x52op.webp)

##### 4.3 Self-testing and acceptance

![image](assets/image-20260512143819-hoikrou.webp)

#### 5. Moving up to open-source frameworks

Once you have some hands-on experience, you can adopt or take ideas from established workflow frameworks and open-source skill packs.

##### 5.1 openspec（[Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)）

![image](assets/image-20260512163007-rmqw9p3.webp)

##### 5.2 superpowers（[obra/superpowers](https://github.com/obra/superpowers)）

![image](assets/image-20260512163034-rjka8eu.webp)

##### 5.3 mattpocock/skills（[mattpocock/skills](https://github.com/mattpocock/skills)）

![image](assets/image-20260512163050-tvjsgnb.webp)

##### 5.4 Side-by-side comparison

![image](assets/image-20260512162648-051csyp.webp)

#### 6. Unfamiliar domains: Hands-on practice and selective learning

![image](assets/image-20260512152752-017ps3y.webp)

**If you want a better grasp of the work:**

The domain knowledge a task requires can have layers of dependencies. Understanding A may require B, which may require C, which may require D.

![image](assets/image-20260512152616-f6scf2g.webp)

One rule: **Any task whose medium is text is within an LLM’s reach**.

What lies outside that reach is the idea in your head: what you actually want and how clearly you’ve thought it through.

The workflow and tools in between turn that idea into something real. You can hand all of that to an LLM.

**Warning:** Stretch your abilities within reason. If the work goes too far beyond what you can understand, you will not be able to maintain it, iterate on it, or recover when it goes wrong.

### 5. Breakdowns and damage

#### 1. Model capabilities and context degradation

##### 1.1 Why model capabilities matter

![image](assets/image-20260512141824-8by77my.webp)

![image](assets/image-20260512141833-8vdg6jc.webp)

![image](assets/image-20260512154459-kcocb3x.webp)

##### 1.2 Context degradation

> A larger context window lets the model handle more complex and longer prompts, but more context isn’t always better. As token counts rise, accuracy and recall can fall. This is known as context degradation. What goes into the context matters as much as the size of the window.

![image](assets/image-20260512144421-z5azd7e.webp)

![image](assets/image-20260512161904-giyrd1c.webp)

#### 2. Engineer breakdown: Taking on more than you can handle

1. The project’s size and complexity outstrip your knowledge and skills. Iteration and maintenance become dependent on the agent.
2. The engineer stops learning and growing and becomes a conduit between the model and real-world requirements.

![image](assets/image-20260429162017-xl8pgae.webp)

![image](assets/image-20260512154306-520httz.webp)

![image](assets/image-20260429005402-5nacf1r.webp)

#### 3. Safety and damage: Isolate the environment

Keep important tokens, sensitive paths, and credentials out of the LLM context wherever possible. You can set up a dedicated account for the agent, such as a separate GitHub account.

##### 3.1 Prompt injection: “Hey, Xiao Ai”

A stranger being able to wake up a Xiao Ai assistant and issue a command is a simple example of prompt injection.

![image](assets/image-20260429153450-nq0zsx4.webp)

##### 3.2 Database deletion: Isolation and backups

![image](assets/image-20260430111847-can966z.webp)

### 6. My everyday workflow

![image](assets/image-20260512154842-5eyglrw.webp)
