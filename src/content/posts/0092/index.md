---
lang: "zh-CN"
pubDatetime: 2026-08-09T12:00:00+08:00
timezone: "Asia/Shanghai"
title: "论文阅读 | Paxos Made Simple（中英对照全文）"
featured: false
area: "distributed-systems"
draft: false
tags:
  - "论文阅读"
  - "分布式系统"
  - "共识算法"
  - "Paxos"
  - "状态机复制"
description: "Leslie Lamport 的 Paxos 经典论文中英对照全文，从安全性约束逐步推导两阶段共识算法，并说明学习者、活性、稳定存储与多实例状态机复制。"
---

> Paxos 简明论

Leslie Lamport

> 莱斯利·兰伯特

01 Nov 2001

> 2001 年 11 月 1 日

## Abstract

> 摘要

The Paxos algorithm, when presented in plain English, is very simple.

> 如果用平实的英语来讲，Paxos 算法非常简单。

## Contents

> 目录

1 Introduction 1

> 1 引言　1

2 The Consensus Algorithm 1

> 2 共识算法　1

2.1 The Problem 1

> 2.1 问题　1

2.2 Choosing a Value 2

> 2.2 选定一个值　2

2.3 Learning a Chosen Value 6

> 2.3 获知已选定的值　6

2.4 Progress 7

> 2.4 进展　7

2.5 The Implementation 7

> 2.5 实现　7

3 Implementing a State Machine 8

> 3 实现状态机　8

References 11

> 参考文献　11

## 1 Introduction

> 1 引言

The Paxos algorithm for implementing a fault-tolerant distributed system has been regarded as difficult to understand, perhaps because the original presentation was Greek to many readers [5]. In fact, it is among the simplest and most obvious of distributed algorithms. At its heart is a consensus algorithm—the “synod” algorithm of [5]. The next section shows that this consensus algorithm follows almost unavoidably from the properties we want it to satisfy. The last section explains the complete Paxos algorithm, which is obtained by the straightforward application of consensus to the state machine approach for building a distributed system—an approach that should be well-known, since it is the subject of what is probably the most often-cited article on the theory of distributed systems [4].

> 用来实现容错分布式系统的 Paxos 算法一直被认为难以理解，也许是因为最初的论述对许多读者而言如同希腊文一般晦涩 [5]。事实上，它是最简单、最显而易见的分布式算法之一。其核心是一种共识算法——即文献 [5] 中的“宗教会议”（synod）算法。下一节将说明：从我们希望它满足的性质出发，几乎不可避免地就会推导出这一共识算法。最后一节解释完整的 Paxos 算法；它不过是把共识直接应用于构建分布式系统的状态机方法而得到的。这个方法理应广为人知，因为分布式系统理论中大概被引用最多的论文 [4]，讨论的正是它。

## 2 The Consensus Algorithm

> 2 共识算法

### 2.1 The Problem

> 2.1 问题

Assume a collection of processes that can propose values. A consensus algorithm ensures that a single one among the proposed values is chosen. If no value is proposed, then no value should be chosen. If a value has been chosen, then processes should be able to learn the chosen value. The safety requirements for consensus are:

> 假设有一组能够提出值的进程。共识算法保证从所提出的值中只选定一个。如果没有提出任何值，就不应选定任何值。如果某个值已经选定，各进程就应当能够获知这个被选定的值。共识的安全性要求如下：

- Only a value that has been proposed may be chosen,

  > 只有被提出过的值才可能被选定；

- Only a single value is chosen, and

  > 只能选定一个值；并且

- A process never learns that a value has been chosen unless it actually has been.

  > 除非某个值确实已经被选定，否则进程绝不会获知它已被选定。

We won’t try to specify precise liveness requirements. However, the goal is to ensure that some proposed value is eventually chosen and, if a value has been chosen, then a process can eventually learn the value.

> 我们不打算给出精确的活性要求。不过，目标是保证最终会有某个被提出的值获选；而一旦某个值已经选定，进程最终就能获知这个值。

We let the three roles in the consensus algorithm be performed by three classes of agents: proposers, acceptors, and learners. In an implementation, a single process may act as more than one agent, but the mapping from agents to processes does not concern us here.

> 我们让三类代理承担共识算法中的三种角色：提议者、接受者和学习者。在具体实现中，一个进程可以充当不止一个代理，但代理如何映射到进程并非我们在此关心的问题。

Assume that agents can communicate with one another by sending messages. We use the customary asynchronous, non-Byzantine model, in which:

> 假设代理之间能够通过发送消息相互通信。我们采用通常的异步、非拜占庭模型，其中：

- Agents operate at arbitrary speed, may fail by stopping, and may restart. Since all agents may fail after a value is chosen and then restart, a solution is impossible unless some information can be remembered by an agent that has failed and restarted.

  > 代理可以按任意速度运行，可能因停止而失效，也可能重新启动。由于所有代理都可能在某个值被选定后失效并随后重启，除非失效后重启的代理能够记住某些信息，否则问题不可能得到解决。

- Messages can take arbitrarily long to be delivered, can be duplicated, and can be lost, but they are not corrupted.

  > 消息的递送可能耗费任意长的时间，消息可能重复，也可能丢失，但不会被篡改。

### 2.2 Choosing a Value

> 2.2 选定一个值

The easiest way to choose a value is to have a single acceptor agent. A proposer sends a proposal to the acceptor, who chooses the first proposed value that it receives. Although simple, this solution is unsatisfactory because the failure of the acceptor makes any further progress impossible.

> 选定一个值最容易的办法，是只设置一个接受者代理。提议者把提案发送给接受者，接受者选定它收到的第一个提议值。这个办法虽然简单，却并不令人满意，因为接受者一旦失效，系统便不可能再有任何进展。

So, let’s try another way of choosing a value. Instead of a single acceptor, let’s use multiple acceptor agents. A proposer sends a proposed value to a set of acceptors. An acceptor may accept the proposed value. The value is chosen when a large enough set of acceptors have accepted it. How large is large enough? To ensure that only a single value is chosen, we can let a large enough set consist of any majority of the agents. Because any two majorities have at least one acceptor in common, this works if an acceptor can accept at most one value. (There is an obvious generalization of a majority that has been observed in numerous papers, apparently starting with [3].)

> 那么，让我们换一种选值方法。我们不用单一接受者，而使用多个接受者代理。提议者把一个提议值发送给一组接受者；接受者可以接受这个提议值。当一个足够大的接受者集合接受了它，这个值便被选定。多大才算足够大？为了保证只选定一个值，我们可以规定，任意一个由过半数代理组成的集合都足够大。任意两个多数集合至少共有一个接受者，因此只要每个接受者至多接受一个值，这个办法就能奏效。（对“多数集合”有一种显而易见的推广，许多论文都曾提到，似乎始于文献 [3]。）

In the absence of failure or message loss, we want a value to be chosen even if only one value is proposed by a single proposer. This suggests the requirement:

> 在没有失效或消息丢失的情况下，即使只有一个提议者提出一个值，我们也希望它能被选定。这提示了如下要求：

**P1.** An acceptor must accept the first proposal that it receives.

> **P1.** 接受者必须接受它收到的第一个提案。

But this requirement raises a problem. Several values could be proposed by different proposers at about the same time, leading to a situation in which every acceptor has accepted a value, but no single value is accepted by a majority of them. Even with just two proposed values, if each is accepted by about half the acceptors, failure of a single acceptor could make it impossible to learn which of the values was chosen.

> 但这个要求带来了一个问题。不同提议者可能在差不多同一时间提出若干个值，从而出现这样的局面：每个接受者都接受了某个值，却没有任何一个值获得过半数接受者的接受。即使只有两个提议值，只要每个值各自被约半数接受者接受，那么一个接受者的失效就可能使人无法获知究竟哪个值被选定了。

P1 and the requirement that a value is chosen only when it is accepted by a majority of acceptors imply that an acceptor must be allowed to accept more than one proposal. We keep track of the different proposals that an acceptor may accept by assigning a (natural) number to each proposal, so a proposal consists of a proposal number and a value. To prevent confusion, we require that different proposals have different numbers. How this is achieved depends on the implementation, so for now we just assume it. A value is chosen when a single proposal with that value has been accepted by a majority of the acceptors. In that case, we say that the proposal (as well as its value) has been chosen.

> P1 与“一个值只有在获得多数接受者接受时才算被选定”这一要求共同意味着：必须允许接受者接受多个提案。为了追踪接受者可能接受的不同提案，我们给每个提案赋予一个（自然数）编号，因此一个提案由提案编号和一个值组成。为免混淆，我们要求不同提案具有不同编号。如何做到这一点取决于具体实现，所以眼下只把它作为假设。当某个携带该值的单一提案被多数接受者接受时，这个值便被选定。在这种情况下，我们称这个提案（以及它的值）已被选定。

We can allow multiple proposals to be chosen, but we must guarantee that all chosen proposals have the same value. By induction on the proposal number, it suffices to guarantee:

> 我们可以允许多个提案被选定，但必须保证所有被选定的提案都具有同一个值。对提案编号作归纳，只需保证：

**P2.** If a proposal with value $v$ is chosen, then every higher-numbered proposal that is chosen has value $v$.

> **P2.** 如果一个值为 $v$ 的提案被选定，那么每个被选定的更高编号提案都具有值 $v$。

Since numbers are totally ordered, condition P2 guarantees the crucial safety property that only a single value is chosen.

> 由于编号是全序的，条件 P2 保证了“只能选定一个值”这一至关重要的安全性质。

To be chosen, a proposal must be accepted by at least one acceptor. So, we can satisfy P2 by satisfying:

> 一个提案要被选定，至少必须由一个接受者接受。因此，可以通过满足下列条件来满足 P2：

**P2ᵃ.** If a proposal with value $v$ is chosen, then every higher-numbered proposal accepted by any acceptor has value $v$.

> **P2ᵃ.** 如果一个值为 $v$ 的提案被选定，那么任意接受者接受的每个更高编号提案都具有值 $v$。

We still maintain P1 to ensure that some proposal is chosen. Because communication is asynchronous, a proposal could be chosen with some particular acceptor $c$ never having received any proposal. Suppose a new proposer “wakes up” and issues a higher-numbered proposal with a different value. P1 requires $c$ to accept this proposal, violating P2ᵃ. Maintaining both P1 and P2ᵃ requires strengthening P2ᵃ to:

> 我们仍然保留 P1，以保证会有某个提案被选定。由于通信是异步的，某个提案可能在某个特定接受者 $c$ 从未收到过任何提案的情况下被选定。假设一个新的提议者“醒来”，发出一个值不同、编号更高的提案。P1 要求 $c$ 接受这个提案，从而违反 P2ᵃ。要同时维持 P1 和 P2ᵃ，就需要把 P2ᵃ 加强为：

**P2ᵇ.** If a proposal with value $v$ is chosen, then every higher-numbered proposal issued by any proposer has value $v$.

> **P2ᵇ.** 如果一个值为 $v$ 的提案被选定，那么任意提议者发出的每个更高编号提案都具有值 $v$。

Since a proposal must be issued by a proposer before it can be accepted by an acceptor, P2ᵇ implies P2ᵃ, which in turn implies P2.

> 因为提案在被接受者接受之前必先由提议者发出，所以 P2ᵇ 蕴含 P2ᵃ，而 P2ᵃ 又蕴含 P2。

To discover how to satisfy P2ᵇ, let’s consider how we would prove that it holds. We would assume that some proposal with number $m$ and value $v$ is chosen and show that any proposal issued with number $n > m$ also has value $v$. We would make the proof easier by using induction on $n$, so we can prove that proposal number $n$ has value $v$ under the additional assumption that every proposal issued with a number in $m\mathbin{..}(n - 1)$ has value $v$, where $i\mathbin{..}j$ denotes the set of numbers from $i$ through $j$. For the proposal numbered $m$ to be chosen, there must be some set $C$ consisting of a majority of acceptors such that every acceptor in $C$ accepted it. Combining this with the induction assumption, the hypothesis that $m$ is chosen implies:

> 为了弄清如何满足 P2ᵇ，让我们考虑应当怎样证明它成立。假设某个编号为 $m$、值为 $v$ 的提案已经被选定，然后证明任意一个编号为 $n > m$ 的已发出提案也具有值 $v$。对 $n$ 使用归纳法可以简化证明；这样，在额外假设编号处于 $m\mathbin{..}(n - 1)$ 的每个已发出提案都具有值 $v$ 的前提下，我们便可以证明编号为 $n$ 的提案具有值 $v$，其中 $i\mathbin{..}j$ 表示从 $i$ 到 $j$ 的数的集合。要使编号为 $m$ 的提案被选定，必然存在一个由多数接受者组成的集合 $C$，使得 $C$ 中的每个接受者都接受了它。把这一事实与归纳假设结合起来，“$m$ 已被选定”这一假设意味着：

> Every acceptor in $C$ has accepted a proposal with number in $m\mathbin{..}(n - 1)$, and every proposal with number in $m\mathbin{..}(n - 1)$ accepted by any acceptor has value $v$.

> > $C$ 中的每个接受者都接受过一个编号处于 $m\mathbin{..}(n - 1)$ 的提案，而且任意接受者所接受的每个编号处于 $m\mathbin{..}(n - 1)$ 的提案都具有值 $v$。

Since any set $S$ consisting of a majority of acceptors contains at least one member of $C$, we can conclude that a proposal numbered $n$ has value $v$ by ensuring that the following invariant is maintained:

> 由于任何由多数接受者组成的集合 $S$ 都至少包含 $C$ 的一个成员，只要保证维持以下不变式，我们就能得出编号为 $n$ 的提案具有值 $v$：

**P2ᶜ.** For any $v$ and $n$, if a proposal with value $v$ and number $n$ is issued, then there is a set $S$ consisting of a majority of acceptors such that either (a) no acceptor in $S$ has accepted any proposal numbered less than $n$, or (b) $v$ is the value of the highest-numbered proposal among all proposals numbered less than $n$ accepted by the acceptors in $S$.

> **P2ᶜ.** 对任意 $v$ 和 $n$，如果发出了一个值为 $v$、编号为 $n$ 的提案，那么必定存在一个由多数接受者组成的集合 $S$，并且或者（a）$S$ 中没有任何接受者接受过编号小于 $n$ 的提案，或者（b）在 $S$ 中各接受者所接受的、编号小于 $n$ 的所有提案中，编号最高的提案的值为 $v$。

We can therefore satisfy P2ᵇ by maintaining the invariance of P2ᶜ.

> 因而，我们可以通过保持 P2ᶜ 的不变性来满足 P2ᵇ。

To maintain the invariance of P2ᶜ, a proposer that wants to issue a proposal numbered $n$ must learn the highest-numbered proposal with number less than $n$, if any, that has been or will be accepted by each acceptor in some majority of acceptors. Learning about proposals already accepted is easy enough; predicting future acceptances is hard. Instead of trying to predict the future, the proposer controls it by extracting a promise that there won’t be any such acceptances. In other words, the proposer requests that the acceptors not accept any more proposals numbered less than $n$. This leads to the following algorithm for issuing proposals.

> 为了保持 P2ᶜ 的不变性，想要发出编号为 $n$ 的提议者必须获知：在某个多数接受者集合中，每个接受者已经接受或将会接受的编号小于 $n$ 的提案里，编号最高的提案（若有）是哪一个。获知已经接受的提案很容易；预测未来的接受却很困难。提议者不去设法预测未来，而是通过取得一个不会再有这种接受的承诺来控制未来。换言之，提议者请求接受者不要再接受任何编号小于 $n$ 的提案。由此得到以下提案发出算法。

1. A proposer chooses a new proposal number $n$ and sends a request to each member of some set of acceptors, asking it to respond with:

   > 提议者选择一个新的提案编号 $n$，并向某个接受者集合中的每个成员发送请求，要求它在响应中给出：

   (a) A promise never again to accept a proposal numbered less than $n$, and

   > （a）承诺不再接受任何编号小于 $n$ 的提案；以及

   (b) The proposal with the highest number less than $n$ that it has accepted, if any.

   > （b）它已接受的、编号小于 $n$ 的提案中编号最高的一个（如果有）。

   I will call such a request a _prepare_ request with number $n$.

   > 我把这种请求称为编号为 $n$ 的*准备*请求。

2. If the proposer receives the requested responses from a majority of the acceptors, then it can issue a proposal with number $n$ and value $v$, where $v$ is the value of the highest-numbered proposal among the responses, or is any value selected by the proposer if the responders reported no proposals.

   > 如果提议者收到了多数接受者按要求作出的响应，那么它就可以发出一个编号为 $n$、值为 $v$ 的提案；其中，$v$ 是各响应所报告的提案中编号最高者的值；如果响应者没有报告任何提案，则 $v$ 可以是提议者选定的任意值。

A proposer issues a proposal by sending, to some set of acceptors, a request that the proposal be accepted. (This need not be the same set of acceptors that responded to the initial requests.) Let’s call this an _accept_ request.

> 提议者通过向某个接受者集合发送要求接受该提案的请求来发出提案。（这个接受者集合不必与响应最初请求的集合相同。）我们把这种请求称为*接受*请求。

This describes a proposer’s algorithm. What about an acceptor? It can receive two kinds of requests from proposers: _prepare_ requests and _accept_ requests. An acceptor can ignore any request without compromising safety. So, we need to say only when it is allowed to respond to a request. It can always respond to a _prepare_ request. It can respond to an _accept_ request, accepting the proposal, iff it has not promised not to. In other words:

> 以上描述了提议者的算法。那么接受者呢？它可能从提议者那里收到两类请求：*准备*请求和*接受*请求。接受者忽略任何请求都不会损害安全性。因此，我们只需说明它在什么时候可以响应请求。它总是可以响应*准备*请求。它可以响应*接受*请求并接受提案，当且仅当它没有承诺不这样做。换言之：

**P1ᵃ.** An acceptor can accept a proposal numbered $n$ iff it has not responded to a prepare request having a number greater than $n$.

> **P1ᵃ.** 接受者可以接受编号为 $n$ 的提案，当且仅当它尚未响应过编号大于 $n$ 的准备请求。

Observe that P1ᵃ subsumes P1.

> 注意，P1ᵃ 包含了 P1。

We now have a complete algorithm for choosing a value that satisfies the required safety properties—assuming unique proposal numbers. The final algorithm is obtained by making one small optimization.

> 现在，假定提案编号唯一，我们已经有了一套满足所要求安全性质的完整选值算法。再作一个小小的优化，就得到最终算法。

Suppose an acceptor receives a _prepare_ request numbered $n$, but it has already responded to a _prepare_ request numbered greater than $n$, thereby promising not to accept any new proposal numbered $n$. There is then no reason for the acceptor to respond to the new _prepare_ request, since it will not accept the proposal numbered $n$ that the proposer wants to issue. So we have the acceptor ignore such a _prepare_ request. We also have it ignore a _prepare_ request for a proposal it has already accepted.

> 假设一个接受者收到了编号为 $n$ 的*准备*请求，但它此前已经响应过编号大于 $n$ 的*准备*请求，因而承诺不接受任何新的编号为 $n$ 的提案。此时它没有理由响应这个新的*准备*请求，因为它不会接受提议者想要发出的编号为 $n$ 的提案。因此，我们让接受者忽略这种*准备*请求。对于它已经接受过的提案所对应的*准备*请求，我们也让它忽略。

With this optimization, an acceptor needs to remember only the highest-numbered proposal that it has ever accepted and the number of the highest-numbered prepare request to which it has responded. Because P2ᶜ must be kept invariant regardless of failures, an acceptor must remember this information even if it fails and then restarts. Note that the proposer can always abandon a proposal and forget all about it—as long as it never tries to issue another proposal with the same number.

> 经过这一优化，接受者只需记住自己曾经接受的最高编号提案，以及自己曾经响应的最高编号准备请求的编号。由于无论发生何种失效都必须保持 P2ᶜ 不变，接受者即使失效后重启，也必须记得这些信息。注意，提议者总是可以放弃一个提案并把它彻底忘掉——只要它永远不再尝试发出另一个具有相同编号的提案。

Putting the actions of the proposer and acceptor together, we see that the algorithm operates in the following two phases.

> 把提议者和接受者的动作合在一起，可以看到该算法分以下两个阶段运行。

**Phase 1.** (a) A proposer selects a proposal number $n$ and sends a _prepare_ request with number $n$ to a majority of acceptors.

> **阶段 1。**（a）提议者选择一个提案编号 $n$，并向多数接受者发送编号为 $n$ 的*准备*请求。

(b) If an acceptor receives a _prepare_ request with number $n$ greater than that of any _prepare_ request to which it has already responded, then it responds to the request with a promise not to accept any more proposals numbered less than $n$ and with the highest-numbered proposal (if any) that it has accepted.

> （b）如果接受者收到的*准备*请求的编号 $n$ 大于它已响应过的任何*准备*请求的编号，那么它响应这个请求，承诺不再接受编号小于 $n$ 的提案，并附上它已接受的最高编号提案（如果有）。

**Phase 2.** (a) If the proposer receives a response to its _prepare_ requests (numbered $n$) from a majority of acceptors, then it sends an _accept_ request to each of those acceptors for a proposal numbered $n$ with a value $v$, where $v$ is the value of the highest-numbered proposal among the responses, or is any value if the responses reported no proposals.

> **阶段 2。**（a）如果提议者从多数接受者那里收到了对其（编号为 $n$ 的）*准备*请求的响应，那么它就向这些接受者逐一发送*接受*请求，请它们接受编号为 $n$、值为 $v$ 的提案；其中，$v$ 是各响应所报告提案中编号最高者的值；如果响应没有报告任何提案，$v$ 则可以是任意值。

(b) If an acceptor receives an _accept_ request for a proposal numbered $n$, it accepts the proposal unless it has already responded to a _prepare_ request having a number greater than $n$.

> （b）如果接受者收到一个针对编号为 $n$ 的提案的*接受*请求，它就接受该提案，除非它此前已经响应过编号大于 $n$ 的*准备*请求。

A proposer can make multiple proposals, so long as it follows the algorithm for each one. It can abandon a proposal in the middle of the protocol at any time. (Correctness is maintained, even though requests and/or responses for the proposal may arrive at their destinations long after the proposal was abandoned.) It is probably a good idea to abandon a proposal if some proposer has begun trying to issue a higher-numbered one. Therefore, if an acceptor ignores a _prepare_ or _accept_ request because it has already received a _prepare_ request with a higher number, then it should probably inform the proposer, who should then abandon its proposal. This is a performance optimization that does not affect correctness.

> 只要对每个提案都遵循这一算法，提议者就可以提出多个提案。它可以在协议进行到一半时随时放弃某个提案。（即使该提案的请求和/或响应可能在它被放弃很久之后才抵达目的地，正确性仍能得到保持。）如果某个提议者已经开始尝试发出编号更高的提案，放弃当前提案大概是明智之举。因此，如果接受者因为已经收到编号更高的*准备*请求而忽略某个*准备*请求或*接受*请求，它或许应当通知提议者，后者随即应当放弃自己的提案。这是一项不影响正确性的性能优化。

### 2.3 Learning a Chosen Value

> 2.3 获知已选定的值

To learn that a value has been chosen, a learner must find out that a proposal has been accepted by a majority of acceptors. The obvious algorithm is to have each acceptor, whenever it accepts a proposal, respond to all learners, sending them the proposal. This allows learners to find out about a chosen value as soon as possible, but it requires each acceptor to respond to each learner—a number of responses equal to the product of the number of acceptors and the number of learners.

> 学习者要获知某个值已经被选定，就必须查明某个提案已被多数接受者接受。显而易见的算法是：每当接受者接受一个提案时，就向所有学习者作出响应，把该提案发送给它们。这让学习者能够尽快获知已选定的值，但要求每个接受者都响应每个学习者——响应数量等于接受者数量与学习者数量的乘积。

The assumption of non-Byzantine failures makes it easy for one learner to find out from another learner that a value has been accepted. We can have the acceptors respond with their acceptances to a distinguished learner, which in turn informs the other learners when a value has been chosen. This approach requires an extra round for all the learners to discover the chosen value. It is also less reliable, since the distinguished learner could fail. But it requires a number of responses equal only to the sum of the number of acceptors and the number of learners.

> 非拜占庭失效这一假设，使一个学习者很容易从另一个学习者那里获知某个值已经被接受。我们可以让接受者把自己的接受结果响应给一个指定学习者，再由该学习者在某个值被选定时通知其他学习者。这种方法需要额外一轮通信，所有学习者才能得知被选定的值。它的可靠性也较低，因为指定学习者可能失效。不过，它所需的响应数量仅等于接受者数量与学习者数量之和。

More generally, the acceptors could respond with their acceptances to some set of distinguished learners, each of which can then inform all the learners when a value has been chosen. Using a larger set of distinguished learners provides greater reliability at the cost of greater communication complexity.

> 更一般地说，接受者可以把自己的接受结果响应给某个指定学习者集合；值被选定后，其中每个指定学习者都可以通知所有学习者。采用更大的指定学习者集合能提高可靠性，代价则是更高的通信复杂度。

Because of message loss, a value could be chosen with no learner ever finding out. The learner could ask the acceptors what proposals they have accepted, but failure of an acceptor could make it impossible to know whether or not a majority had accepted a particular proposal. In that case, learners will find out what value is chosen only when a new proposal is chosen. If a learner needs to know whether a value has been chosen, it can have a proposer issue a proposal, using the algorithm described above.

> 由于消息可能丢失，一个值可能已经被选定，却始终没有任何学习者得知。学习者可以询问接受者它们接受过哪些提案，但某个接受者的失效可能使人无法判断某个特定提案是否已获得多数接受者的接受。在这种情况下，只有等一个新提案被选定后，学习者才能知道选定的是什么值。如果学习者需要知道是否已有值被选定，它可以让某个提议者使用上述算法发出一个提案。

### 2.4 Progress

> 2.4 进展

It’s easy to construct a scenario in which two proposers each keep issuing a sequence of proposals with increasing numbers, none of which are ever chosen. Proposer $p$ completes phase 1 for a proposal number $n_1$. Another proposer $q$ then completes phase 1 for a proposal number $n_2 > n_1$. Proposer $p$’s phase 2 accept requests for a proposal numbered $n_1$ are ignored because the acceptors have all promised not to accept any new proposal numbered less than $n_2$. So, proposer $p$ then begins and completes phase 1 for a new proposal number $n_3 > n_2$, causing the second phase 2 accept requests of proposer $q$ to be ignored. And so on.

> 很容易构造这样一种情形：两个提议者各自不断发出编号递增的一系列提案，却始终没有一个被选定。提议者 $p$ 完成编号为 $n_1$ 的提案的阶段 1。随后，另一个提议者 $q$ 完成编号为 $n_2 > n_1$ 的提案的阶段 1。由于接受者都已承诺不接受任何编号小于 $n_2$ 的新提案，提议者 $p$ 针对编号为 $n_1$ 的提案所发送的阶段 2 接受请求被忽略。于是，提议者 $p$ 又开始并完成一个编号为 $n_3 > n_2$ 的新提案的阶段 1，致使提议者 $q$ 的第二阶段接受请求被忽略。如此循环不已。

To guarantee progress, a distinguished proposer must be selected as the only one to try issuing proposals. If the distinguished proposer can communicate successfully with a majority of acceptors, and if it uses a proposal with number greater than any already used, then it will succeed in issuing a proposal that is accepted. By abandoning a proposal and trying again if it learns about some request with a higher proposal number, the distinguished proposer will eventually choose a high enough proposal number.

> 为了保证取得进展，必须选出一个指定提议者，并让它成为唯一尝试发出提案的提议者。如果指定提议者能够与多数接受者成功通信，并且采用的提案编号高于任何已经使用过的编号，那么它将成功发出一个会被接受的提案。如果指定提议者得知某个请求具有更高的提案编号，便放弃当前提案并再次尝试，那么它最终会选到足够高的提案编号。

If enough of the system (proposer, acceptors, and communication network) is working properly, liveness can therefore be achieved by electing a single distinguished proposer. The famous result of Fischer, Lynch, and Patterson [1] implies that a reliable algorithm for electing a proposer must use either randomness or real time—for example, by using timeouts. However, safety is ensured regardless of the success or failure of the election.

> 因此，只要系统中有足够多的部分（提议者、接受者和通信网络）正常工作，就可以通过选举唯一的指定提议者来实现活性。Fischer、Lynch 和 Patterson 的著名结果 [1] 意味着，一个可靠的提议者选举算法必须使用随机性或真实时间——例如使用超时。不过，无论选举成功还是失败，安全性都能得到保证。

### 2.5 The Implementation

> 2.5 实现

The Paxos algorithm [5] assumes a network of processes. In its consensus algorithm, each process plays the role of proposer, acceptor, and learner. The algorithm chooses a leader, which plays the roles of the distinguished proposer and the distinguished learner. The Paxos consensus algorithm is precisely the one described above, where requests and responses are sent as ordinary messages. (Response messages are tagged with the corresponding proposal number to prevent confusion.) Stable storage, preserved during failures, is used to maintain the information that the acceptor must remember. An acceptor records its intended response in stable storage before actually sending the response.

> Paxos 算法 [5] 假设存在一个进程网络。在其共识算法中，每个进程都充当提议者、接受者和学习者。算法选出一个领导者，由它担任指定提议者和指定学习者。Paxos 共识算法正是上文所述的算法，其中请求与响应以普通消息的形式发送。（响应消息会标上相应的提案编号，以免混淆。）系统使用失效期间仍能保存内容的稳定存储，来维护接受者必须记住的信息。接受者在真正发送响应之前，先把它打算作出的响应记录到稳定存储中。

All that remains is to describe the mechanism for guaranteeing that no two proposals are ever issued with the same number. Different proposers choose their numbers from disjoint sets of numbers, so two different proposers never issue a proposal with the same number. Each proposer remembers (in stable storage) the highest-numbered proposal it has tried to issue, and begins phase 1 with a higher proposal number than any it has already used.

> 余下的只需说明一种机制，以保证绝不会有两个提案以相同编号发出。不同提议者从互不相交的编号集合中选择编号，因此两个不同的提议者绝不会发出编号相同的提案。每个提议者都在稳定存储中记住自己曾试图发出的最高编号提案，并用一个高于自己此前所用任何编号的提案编号开始阶段 1。

## 3 Implementing a State Machine

> 3 实现状态机

A simple way to implement a distributed system is as a collection of clients that issue commands to a central server. The server can be described as a deterministic state machine that performs client commands in some sequence. The state machine has a current state; it performs a step by taking as input a command and producing an output and a new state. For example, the clients of a distributed banking system might be tellers, and the state-machine state might consist of the account balances of all users. A withdrawal would be performed by executing a state machine command that decreases an account’s balance if and only if the balance is greater than the amount withdrawn, producing as output the old and new balances.

> 实现分布式系统的一种简单方式，是把它实现为一组向中央服务器发出命令的客户端。服务器可以描述为一台按某种顺序执行客户端命令的确定性状态机。状态机具有当前状态；它以一条命令为输入，产生一个输出和一个新状态，从而完成一步。例如，分布式银行系统的客户端可以是柜员，而状态机的状态可以由所有用户的账户余额组成。执行取款，就是执行一条状态机命令：当且仅当账户余额大于取款金额时才减少余额，并把原余额和新余额作为输出。

An implementation that uses a single central server fails if that server fails. We therefore instead use a collection of servers, each one independently implementing the state machine. Because the state machine is deterministic, all the servers will produce the same sequences of states and outputs if they all execute the same sequence of commands. A client issuing a command can then use the output generated for it by any server.

> 使用单一中央服务器的实现在该服务器失效时也会失效。因此，我们改用一组服务器，每台服务器都独立实现这台状态机。由于状态机是确定性的，如果所有服务器执行相同的命令序列，它们就会产生相同的状态序列和输出序列。发出命令的客户端因而可以使用任意服务器为它生成的输出。

To guarantee that all servers execute the same sequence of state machine commands, we implement a sequence of separate instances of the Paxos consensus algorithm, the value chosen by the $i^{th}$ instance being the $i^{th}$ state machine command in the sequence. Each server plays all the roles (proposer, acceptor, and learner) in each instance of the algorithm. For now, I assume that the set of servers is fixed, so all instances of the consensus algorithm use the same sets of agents.

> 为保证所有服务器执行同一个状态机命令序列，我们实现一系列彼此独立的 Paxos 共识算法实例：第 $i$ 个实例选定的值，就是序列中的第 $i$ 条状态机命令。每台服务器在算法的每个实例中都扮演全部角色（提议者、接受者和学习者）。目前我先假设服务器集合固定不变，因此共识算法的所有实例都使用相同的代理集合。

In normal operation, a single server is elected to be the leader, which acts as the distinguished proposer (the only one that tries to issue proposals) in all instances of the consensus algorithm. Clients send commands to the leader, who decides where in the sequence each command should appear. If the leader decides that a certain client command should be the 135th command, it tries to have that command chosen as the value of the 135th instance of the consensus algorithm. It will usually succeed. It might fail because of failures, or because another server also believes itself to be the leader and has a different idea of what the 135th command should be. But the consensus algorithm ensures that at most one command can be chosen as the 135th one.

> 正常运行时，系统选出一台服务器作为领导者，它在共识算法的所有实例中充当指定提议者（即唯一尝试发出提案者）。客户端把命令发送给领导者，由领导者决定每条命令应当出现在序列的什么位置。如果领导者决定某条客户端命令应当成为第 135 条命令，它就尝试让该命令被选为共识算法第 135 个实例的值。它通常会成功；也可能因为发生失效而失败，或者因为另一台服务器也认为自己是领导者，对第 135 条命令应是什么持有不同看法而失败。但共识算法保证，至多只有一条命令能被选为第 135 条命令。

Key to the efficiency of this approach is that, in the Paxos consensus algorithm, the value to be proposed is not chosen until phase 2. Recall that, after completing phase 1 of the proposer’s algorithm, either the value to be proposed is determined or else the proposer is free to propose any value.

> 这一方法之所以高效，关键在于 Paxos 共识算法直到阶段 2 才选择要提出的值。回想一下，提议者算法完成阶段 1 后，要么待提出的值已经确定，要么提议者可以自由提出任意值。

I will now describe how the Paxos state machine implementation works during normal operation. Later, I will discuss what can go wrong. I consider what happens when the previous leader has just failed and a new leader has been selected. (System startup is a special case in which no commands have yet been proposed.)

> 下面我将描述 Paxos 状态机实现在正常运行期间如何工作。稍后再讨论可能出什么问题。我考虑的是前一位领导者刚刚失效、新领导者已经选出的情形。（系统启动是一种尚未提出任何命令的特殊情况。）

The new leader, being a learner in all instances of the consensus algorithm, should know most of the commands that have already been chosen. Suppose it knows commands 1–134, 138, and 139—that is, the values chosen in instances 1–134, 138, and 139 of the consensus algorithm. (We will see later how such a gap in the command sequence could arise.) It then executes phase 1 of instances 135–137 and of all instances greater than 139. (I describe below how this is done.) Suppose that the outcome of these executions determine the value to be proposed in instances 135 and 140, but leaves the proposed value unconstrained in all other instances. The leader then executes phase 2 for instances 135 and 140, thereby choosing commands 135 and 140.

> 新领导者是共识算法所有实例中的学习者，理应知道大部分已经选定的命令。假设它知道命令 1–134、138 和 139，也就是共识算法实例 1–134、138 和 139 中选定的值。（稍后会看到，命令序列中为何会出现这种空缺。）随后，它对实例 135–137 以及所有大于 139 的实例执行阶段 1。（下文会说明如何做到这一点。）假设这些执行的结果确定了实例 135 和 140 中要提出的值，却没有约束其他所有实例中的提议值。领导者随即对实例 135 和 140 执行阶段 2，从而选定命令 135 和 140。

The leader, as well as any other server that learns all the commands the leader knows, can now execute commands 1–135. However, it can’t execute commands 138–140, which it also knows, because commands 136 and 137 have yet to be chosen. The leader could take the next two commands requested by clients to be commands 136 and 137. Instead, we let it fill the gap immediately by proposing, as commands 136 and 137, a special “no-op” command that leaves the state unchanged. (It does this by executing phase 2 of instances 136 and 137 of the consensus algorithm.) Once these no-op commands have been chosen, commands 138–140 can be executed.

> 领导者以及任何获知了领导者所知全部命令的其他服务器，现在都可以执行命令 1–135。然而，它们还不能执行同样已经获知的命令 138–140，因为命令 136 和 137 尚未被选定。领导者本可以把客户端接下来请求的两条命令当作命令 136 和 137。我们则让它立即填补这个空缺：把一种保持状态不变的特殊“空操作”命令提议为命令 136 和 137。（它通过执行共识算法实例 136 和 137 的阶段 2 来做到这一点。）这些空操作命令一旦被选定，命令 138–140 就可以执行。

Commands 1–140 have now been chosen. The leader has also completed phase 1 for all instances greater than 140 of the consensus algorithm, and it is free to propose any value in phase 2 of those instances. It assigns command number 141 to the next command requested by a client, proposing it as the value in phase 2 of instance 141 of the consensus algorithm. It proposes the next client command it receives as command 142, and so on.

> 此时，命令 1–140 都已被选定。领导者还完成了共识算法所有大于 140 的实例的阶段 1，并且可以在这些实例的阶段 2 中自由提出任意值。它把编号 141 分配给客户端请求的下一条命令，在共识算法实例 141 的阶段 2 中把该命令作为值提出；它把随后收到的客户端命令提议为命令 142，依此类推。

The leader can propose command 142 before it learns that its proposed command 141 has been chosen. It’s possible for all the messages it sent in proposing command 141 to be lost, and for command 142 to be chosen before any other server has learned what the leader proposed as command 141. When the leader fails to receive the expected response to its phase 2 messages in instance 141, it will retransmit those messages. If all goes well, its proposed command will be chosen. However, it could fail first, leaving a gap in the sequence of chosen commands. In general, suppose a leader can get $\alpha$ commands ahead—that is, it can propose commands $i + 1$ through $i + \alpha$ after commands 1 through $i$ are chosen. A gap of up to $\alpha - 1$ commands could then arise.

> 领导者可以在获知自己提出的命令 141 已被选定之前，就提出命令 142。它为提出命令 141 而发送的全部消息都有可能丢失，而命令 142 可能在其他任何服务器获知领导者把什么提议为命令 141 之前就被选定。当领导者未能收到实例 141 中阶段 2 消息的预期响应时，它会重传这些消息。如果一切顺利，它提出的命令就会被选定。然而，它也可能先失效，从而在已选定命令的序列中留下空缺。一般而言，假设领导者可以超前 $\alpha$ 条命令——也就是说，命令 1 到 $i$ 被选定之后，它可以提出命令 $i + 1$ 到 $i + \alpha$。这样就可能出现最多 $\alpha - 1$ 条命令的空缺。

A newly chosen leader executes phase 1 for infinitely many instances of the consensus algorithm—in the scenario above, for instances 135–137 and all instances greater than 139. Using the same proposal number for all instances, it can do this by sending a single reasonably short message to the other servers. In phase 1, an acceptor responds with more than a simple OK only if it has already received a phase 2 message from some proposer. (In the scenario, this was the case only for instances 135 and 140.) Thus, a server (acting as acceptor) can respond for all instances with a single reasonably short message. Executing these infinitely many instances of phase 1 therefore poses no problem.

> 新选出的领导者会对共识算法的无穷多个实例执行阶段 1——在上述情形中，就是实例 135–137 和所有大于 139 的实例。它对所有实例使用同一个提案编号，只需向其他服务器发送一条长度合理的消息就能做到这一点。在阶段 1 中，只有当接受者已经收到过某个提议者的阶段 2 消息时，它的响应才会包含比简单的 OK 更多的内容。（在上述情形中，只有实例 135 和 140 属于这种情况。）因此，一台服务器（充当接受者时）只需一条长度合理的消息，就能对所有实例作出响应。于是，对这无穷多个实例执行阶段 1 并不会带来问题。

Since failure of the leader and election of a new one should be rare events, the effective cost of executing a state machine command—that is, of achieving consensus on the command/value—is the cost of executing only phase 2 of the consensus algorithm. It can be shown that phase 2 of the Paxos consensus algorithm has the minimum possible cost of any algorithm for reaching agreement in the presence of faults [2]. Hence, the Paxos algorithm is essentially optimal.

> 由于领导者失效和新领导者选举理应是少见事件，执行一条状态机命令——也就是就该命令/值达成共识——的实际成本，仅相当于执行共识算法阶段 2 的成本。可以证明，在存在故障的情况下，Paxos 共识算法阶段 2 的成本达到了任何一致性算法所可能达到的最低值 [2]。因此，Paxos 算法基本上是最优的。

This discussion of the normal operation of the system assumes that there is always a single leader, except for a brief period between the failure of the current leader and the election of a new one. In abnormal circumstances, the leader election might fail. If no server is acting as leader, then no new commands will be proposed. If multiple servers think they are leaders, then they can all propose values in the same instance of the consensus algorithm, which could prevent any value from being chosen. However, safety is preserved—two different servers will never disagree on the value chosen as the $i^{th}$ state machine command. Election of a single leader is needed only to ensure progress.

> 上面对系统正常运行的讨论假定：除当前领导者失效与新领导者选出之间的一小段时间外，始终只有一个领导者。在异常情况下，领导者选举可能失败。如果没有服务器充当领导者，就不会提出新命令。如果多台服务器都认为自己是领导者，它们就可能在共识算法的同一实例中全都提出值，从而可能使任何值都无法被选定。不过，安全性依然得到保持——两台不同的服务器绝不会对选作第 $i$ 条状态机命令的值产生分歧。选出唯一领导者只是为了保证进展。

If the set of servers can change, then there must be some way of determining what servers implement what instances of the consensus algorithm. The easiest way to do this is through the state machine itself. The current set of servers can be made part of the state and can be changed with ordinary state-machine commands. We can allow a leader to get $\alpha$ commands ahead by letting the set of servers that execute instance $i + \alpha$ of the consensus algorithm be specified by the state after execution of the $i^{th}$ state machine command. This permits a simple implementation of an arbitrarily sophisticated reconfiguration algorithm.

> 如果服务器集合可以变化，就必须有某种办法确定哪些服务器实现共识算法的哪些实例。最简单的做法是通过状态机本身来确定。可以让当前服务器集合成为状态的一部分，并通过普通的状态机命令改变它。我们可以让领导者超前 $\alpha$ 条命令：规定执行共识算法实例 $i + \alpha$ 的服务器集合，由执行第 $i$ 条状态机命令之后的状态指定。这样，再复杂的重新配置算法也可以得到简单实现。

## References

> 参考文献

[1] Michael J. Fischer, Nancy Lynch, and Michael S. Paterson. Impossibility of distributed consensus with one faulty process. _Journal of the ACM_, 32(2):374–382, April 1985.

> [1] Michael J. Fischer、Nancy Lynch 与 Michael S. Paterson。《单个故障进程条件下分布式共识的不可能性》。_Journal of the ACM_，32(2):374–382，1985 年 4 月。

[2] Idit Keidar and Sergio Rajsbaum. On the cost of fault-tolerant consensus when there are no faults—a tutorial. Technical Report MIT-LCS-TR-821, Laboratory for Computer Science, Massachusetts Institute Technology, Cambridge, MA, 02139, May 2001. also published in _SIGACT News_ 32(2) (June 2001).

> [2] Idit Keidar 与 Sergio Rajsbaum。《无故障时容错共识的成本——教程》。技术报告 MIT-LCS-TR-821，计算机科学实验室，麻省理工学院，马萨诸塞州剑桥市 02139，2001 年 5 月；另发表于 _SIGACT News_ 32(2)（2001 年 6 月）。

[3] Leslie Lamport. The implementation of reliable distributed multiprocess systems. _Computer Networks_, 2:95–114, 1978.

> [3] Leslie Lamport。《可靠分布式多进程系统的实现》。_Computer Networks_，2:95–114，1978 年。

[4] Leslie Lamport. Time, clocks, and the ordering of events in a distributed system. _Communications of the ACM_, 21(7):558–565, July 1978.

> [4] Leslie Lamport。《分布式系统中的时间、时钟与事件排序》。_Communications of the ACM_，21(7):558–565，1978 年 7 月。

[5] Leslie Lamport. The part-time parliament. _ACM Transactions on Computer Systems_, 16(2):133–169, May 1998.

> [5] Leslie Lamport。《兼职议会》。_ACM Transactions on Computer Systems_，16(2):133–169，1998 年 5 月。
