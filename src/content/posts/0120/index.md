---
lang: "zh-CN"
pubDatetime: 2026-08-14T16:49:58+08:00
modDatetime: 2026-08-14T17:44:22+08:00
timezone: "Asia/Shanghai"
title: "论文阅读 | The Network is Reliable｜网络是可靠的：现实世界通信故障的非正式调查"
contentType: "paper-translation"
featured: false
area: "distributed-systems"
draft: false
tags:
  - "论文阅读"
  - "论文翻译"
  - "分布式系统"
  - "网络分区"
  - "故障恢复"
description: "Peter Bailis 与 Kyle Kingsbury 对真实世界通信故障案例的非正式调查，按 ACM Queue 定稿编排的中英对照全文。"
---

> 网络是可靠的：现实世界通信故障的非正式调查

**Peter Bailis, UC Berkeley**<br>
**Kyle Kingsbury, Jepsen Networks**

> **Peter Bailis，加州大学伯克利分校**<br>
> **Kyle Kingsbury，Jepsen Networks**

“The network is reliable” tops Peter Deutsch’s classic list, “[Eight fallacies of distributed computing](https://blogs.oracle.com/jag/resource/Fallacies.html),” “all [of which] prove to be false in the long run and all [of which] cause big trouble and painful learning experiences.” Accounting for and understanding the implications of network behavior is key to designing robust distributed programs—in fact, six of Deutsch’s “fallacies” directly pertain to limitations on networked communications. This should be unsurprising: the ability (and often requirement) to communicate over a shared channel is a defining characteristic of distributed programs, and many of the key results in the field pertain to the possibility and impossibility of performing distributed computations under particular sets of network conditions.

> “网络是可靠的”位列 Peter Deutsch 经典的“分布式计算八大谬误”之首，而这些谬误“从长远来看全都会被证明是错误的，并且全都会带来大麻烦和痛苦的教训”。要设计健壮的分布式程序，关键在于把网络行为纳入考虑并理解其影响——事实上，Deutsch 的八条“谬误”中有六条直接涉及联网通信的局限。这并不令人意外：通过共享信道进行通信的能力（以及通常情况下的必要性）是分布式程序的定义性特征，而该领域许多关键成果都讨论了在特定网络条件下执行分布式计算的可能性与不可能性。

For example, the celebrated FLP impossibility result [9] demonstrates the inability to guarantee consensus in an asynchronous network (i.e., one facing indefinite communication partitions between processes) with one faulty process. This means that, in the presence of unreliable (untimely) message delivery, basic operations such as modifying the set of machines in a cluster (i.e., maintaining group membership, as systems such as Zookeeper are tasked with today) are not guaranteed to complete in the event of both network asynchrony and individual server failures. Related results describe the inability to guarantee the progress of serializable transactions [7], linearizable reads/writes [11], and a variety of useful, programmer-friendly guarantees [3] under adverse conditions. The implications of these results are not simply academic: these impossibility results have motivated a proliferation of systems and designs offering a range of alternative guarantees in the event of network failures [5]. Under a friendlier, more reliable network that guarantees timely message delivery, however, FLP and many of these related results no longer hold [8]: by making stronger guarantees about network behavior, we can circumvent the programmability implications of these impossibility proofs.

> 例如，著名的 FLP 不可能性结果 [9] 表明：在异步网络中（即进程之间可能无限期发生通信分区的网络），只要有一个进程发生故障，就无法保证达成共识。这意味着，当消息交付不可靠（或不及时）时，如果同时出现网络异步和单台服务器故障，诸如修改集群机器集合这样的基本操作——也就是维护组成员关系，今天的 ZooKeeper 等系统正承担这类任务——便无法保证完成。相关结果还说明，在不利条件下，无法保证可串行化事务 [7]、线性一致读写 [11] 以及多种实用且对程序员友好的保证 [3] 持续取得进展。这些结论的影响并不只是学术上的：正是这些不可能性结果，促使大量系统和设计在发生网络故障时提供不同的替代保证 [5]。然而，在一个更友好、更可靠、能够保证消息及时交付的网络中，FLP 以及许多相关结果将不再成立 [8]：通过对网络行为作出更强的保证，我们可以绕开这些不可能性证明给可编程性带来的限制。

Therefore, the degree of reliability in deployment environments is critical in robust systems design and directly determines the kinds of operations that systems can reliably perform without waiting. Unfortunately, the degree to which networks are actually reliable in the real world is the subject of considerable and evolving debate. Some people have claimed that networks are reliable (or that partitions are rare enough in practice) and that we are too concerned with designing for theoretical failure modes. Conversely, others attest that partitions do occur in their deployments, and that, as [James Hamilton of AWS (Amazon Web Services) neatly summarizes](http://perspectives.mvdirona.com/2010/04/07/StonebrakerOnCAPTheoremAndDatabases.aspx), “Network partitions should be rare but net gear continues to cause more issues than it should.” So who’s right?

> 因此，部署环境的可靠程度对健壮系统的设计至关重要，并直接决定系统无需等待便能可靠执行哪些操作。遗憾的是，现实世界中的网络究竟有多可靠，一直是一个争议颇多且不断演变的话题。有些人声称网络是可靠的（或者说，实践中的分区足够罕见），认为我们过度关注了针对理论故障模式的设计。另一些人则证实，他们的部署中确实会发生分区；正如 AWS（Amazon Web Services）的 James Hamilton 所精辟概括的：“网络分区理应很少见，但网络设备仍在制造超出其应有数量的问题。”那么，究竟谁是对的？

A key challenge in this discussion is the lack of evidence. We have few normalized bases for comparing network and application reliability—and even less data. We can track link availability and estimate packet loss, but understanding the end-to-end effect on applications is more difficult. The scant evidence we have is difficult to generalize: it is often deployment-specific and closely tied to particular vendors, topologies, and application designs. Worse, even when organizations have a clear picture of their network’s behavior, they rarely share specifics. Finally, distributed systems are designed to resist failure, which means that noticeable outages often depend on complex interactions of failure modes. Many applications silently degrade when the network fails, and resulting problems may not be understood for some time, if ever.

> 这场讨论面临的一项关键挑战是缺少证据。我们几乎没有用于比较网络可靠性与应用可靠性的标准化基准，数据就更少了。我们可以追踪链路可用性并估算丢包率，但要理解它对应用造成的端到端影响则更加困难。现有的少量证据也很难推广：它们往往只适用于特定部署，并与特定供应商、拓扑和应用设计紧密相关。更糟的是，即使某个组织清楚掌握了自身网络的行为，也很少会分享具体细节。最后，分布式系统本来就是为抵抗故障而设计的，这意味着可被察觉的中断通常取决于多种故障模式之间的复杂相互作用。网络故障时，许多应用会悄无声息地降级，由此产生的问题可能要过一段时间才会被理解，甚至永远不会被理解。

As a result, much of what we believe about the failure modes of real-world distributed systems is founded on guesswork and rumor. Sysadmins and developers will swap stories over beer, but detailed, public postmortems and comprehensive surveys of network availability are few and far between. In this article, we’d like to informally bring a few of these stories (which, in most cases, are unabashedly anecdotal) together. Our focus is on descriptions of actual network behavior when possible and (more often), when not, on the implications of network failures and asynchrony for real-world systems deployments. We believe this is a first step toward a more open and honest discussion of real-world partition behavior, and, ultimately, toward more robust distributed systems design.

> 因而，我们对现实世界分布式系统故障模式的许多认识，都建立在猜测与传闻之上。系统管理员和开发者会边喝啤酒边交换故事，但详尽、公开的事后分析以及全面的网络可用性调查却寥寥无几。本文希望以一种非正式方式汇集其中一些故事——其中大多数毫不掩饰地只是轶闻。只要条件允许，我们就聚焦于对真实网络行为的描述；而在更常见的、无法做到这一点的情况下，则关注网络故障与异步对现实系统部署造成的影响。我们相信，这是朝着更加开放、诚实地讨论现实世界分区行为迈出的第一步，并最终有助于设计出更加健壮的分布式系统。

## Rumblings from Large Deployments｜大型部署传来的动静

To start off, let’s consider evidence from big players in distributed systems: companies running globally distributed infrastructure with hundreds of thousands of servers. These reports perhaps best summarize operations in the large, distilling the experience of operating what are likely the biggest distributed systems ever deployed. These companies’ publications (unlike many of the reports we will examine later) often capture aggregate system behavior and large-scale statistical trends, and indicate (often obliquely) that partitions are of concern in their deployments.

> 首先，让我们考察分布式系统大型参与者提供的证据：这些公司运营着由数十万台服务器组成、分布于全球的基础设施。这些报告也许最能概括超大规模运维的情况，凝练了运行可能是史上规模最大的分布式系统所积累的经验。这些公司的公开资料与后文将考察的许多报告不同，往往能够捕捉系统的整体行为和大规模统计趋势，并且表明——尽管表达常常相当含蓄——分区确实是其部署中需要关切的问题。

### The Microsoft Data-Center Study｜微软数据中心研究

A team from the University of Toronto and Microsoft Research studied the behavior of network failures in several of Microsoft’s data centers [12]. They found an average failure rate of 5.2 devices per day and 40.8 links per day, with a median time to repair of approximately five minutes (and a maximum of one week). While the researchers note that correlating link failures and communication partitions is challenging, they estimate a median packet loss of 59,000 packets per failure. Perhaps of more concern is their finding that network redundancy improves median traffic by only 43 percent—that is, network redundancy does not eliminate common causes of network failure.

> 多伦多大学与微软研究院组成的团队研究了微软若干数据中心中的网络故障行为 [12]。他们发现，平均每天有 5.2 台设备和 40.8 条链路发生故障；修复时间的中位数约为 5 分钟，最长则达到一周。研究人员指出，很难把链路故障与通信分区关联起来，但他们估计每次故障造成的丢包数中位数为 59,000。也许更值得担忧的是，他们发现网络冗余只使流量中位数改善了 43%；换句话说，网络冗余并不能消除网络故障的常见成因。

### HP Enterprise Managed Networks｜HP 企业托管网络

A joint study between researchers at the University of California, San Diego, and HP Labs [examined](http://www.hpl.hp.com/techreports/2012/HPL-2012-101.pdf) the causes and severity of network failures in HP’s managed networks by analyzing support-ticket data. “Connectivity”-related tickets accounted for 11.4 percent of support tickets (14 percent of which were of the highest-priority level), with a median incident duration of 2 hours and 45 minutes for the highest-priority tickets and a median duration of 4 hours and 18 minutes for all tickets.

> 加州大学圣迭戈分校与 HP Labs 的研究人员开展了一项联合研究，通过分析支持工单数据来考察 HP 托管网络中网络故障的成因与严重程度。与“连接性”有关的工单占全部支持工单的 11.4%，其中 14% 属于最高优先级。最高优先级事件的持续时间中位数为 2 小时 45 分钟，所有优先级事件的持续时间中位数则为 4 小时 18 分钟。

### Google Chubby｜Google Chubby

Google’s [paper](http://research.google.com/archive/chubby-osdi06.pdf) describing the design and operation of Chubby, its distributed lock manager, outlines the root causes of 61 outages over 700 days of operation across several clusters. Of the nine outages that lasted more than 30 seconds, four were caused by network maintenance and two were caused by “suspected network connectivity problems.”

> Google 介绍其分布式锁管理器 Chubby 的设计与运行情况的论文，列出了多个集群在 700 天运行期间发生的 61 次中断的根本原因。在 9 次持续超过 30 秒的中断中，有 4 次由网络维护引起，另有 2 次由“疑似网络连接问题”引起。

### Google’s Design Lessons from Distributed Systems｜Google 的分布式系统设计经验

In [*Design Lessons and Advice from Building Large Scale Distributed Systems*](http://www.cs.cornell.edu/projects/ladis2009/talks/dean-keynote-ladis2009.pdf), Google Fellow Jeff Dean suggested that a typical first year for a new Google cluster involves:

- Five racks going wonky (40–80 machines seeing 50 percent packet loss).
- Eight network maintenance events (four of which might cause ~30-minute random connectivity losses).
- Three router failures (resulting in the need to pull traffic immediately for an hour).

> 在 *Design Lessons and Advice from Building Large Scale Distributed Systems*（《构建大规模分布式系统的设计经验与建议》）中，Google Fellow Jeff Dean 指出，一个新的 Google 集群在典型的第一年里会经历：
>
> - 5 个机架表现异常（40–80 台机器出现 50% 丢包）；
> - 8 次网络维护（其中 4 次可能造成约 30 分钟的随机连接中断）；
> - 3 次路由器故障（需要立即撤走流量，持续一小时）。

While Google doesn’t tell us much about the application-level consequences of its network partitions, Dean suggested that they were of concern, citing the perennial challenge of creating “easy-to-use abstractions for resolving conflicting updates to multiple versions of a piece of state,” useful for “reconciling replicated state in different data centers after repairing a network partition.”

> 虽然 Google 没有详细说明网络分区在应用层造成的后果，但 Dean 表明这是一个需要关切的问题。他举出的长期挑战是，创建“易于使用的抽象，以解决某份状态的多个版本之间相互冲突的更新”；这样的抽象可用于“在网络分区修复后，对不同数据中心中的复制状态进行协调”。

### Amazon Dynamo｜Amazon Dynamo

Amazon’s [Dynamo paper](http://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) frequently cites the incidence of partitions as a key design consideration. Specifically, the authors note that they rejected designs from “traditional replicated relational database systems” because they “are not capable of handling network partitions.”

> Amazon 的 Dynamo 论文多次把分区的发生视为一项关键设计考量。作者特别指出，他们拒绝采用“传统复制式关系数据库系统”的设计，因为这些系统“无法处理网络分区”。

### Yahoo! PNUTS/Sherpa｜Yahoo! PNUTS/Sherpa

[Yahoo! PNUTS/Sherpa](http://www.mpi-sws.org/~druschel/courses/ds/papers/cooper-pnuts.pdf) was designed as a distributed database operating in geographically distinct data centers. Originally, PNUTS supported a strongly consistent “timeline consistency” operation, with one master per data item. The developers noted, however, that in the event of network partitioning or server failures, this design decision was too restrictive for many applications [16]:

> Yahoo! PNUTS/Sherpa 被设计为运行在不同地理位置的数据中心中的分布式数据库。PNUTS 最初支持强一致的“时间线一致性”操作，每个数据项只有一个主节点。然而，开发者指出，在发生网络分区或服务器故障时，这一设计决策对许多应用而言限制过强 [16]：

> The first deployment of Sherpa supported the timeline-consistency model—namely, all replicas of a record apply all updates in the same order—and has API-level features to enable applications to cope with asynchronous replication. Strict adherence leads to difficult situations under network partitioning or server failures. These can be partially addressed with override procedures and local data replication, but in many circumstances, applications need a relaxed approach.

> > Sherpa 的首次部署支持时间线一致性模型——也就是说，一条记录的所有副本都以相同顺序应用全部更新——并在 API 层提供了一些功能，使应用能够应对异步复制。在网络分区或服务器故障时，严格遵守这一模型会导致棘手局面。覆盖流程和本地数据复制可以缓解其中一部分问题，但在许多情况下，应用需要一种更宽松的方法。

According to the same report, PNUTS now offers weaker consistency alternatives providing availability during partitions.

> 同一份报告称，PNUTS 后来提供了更弱的一致性选项，从而在分区期间维持可用性。

## Data-Center Network Failures｜数据中心网络故障

Data-center networks are subject to power failure, misconfiguration, firmware bugs, topology changes, cable damage, and malicious traffic. Their failure modes are accordingly diverse.

> 数据中心网络会遭遇电力故障、配置错误、固件缺陷、拓扑变化、线缆损坏以及恶意流量，因此其故障模式也多种多样。

### Power Failure on Both Redundant Switches｜两台冗余交换机同时断电

As Microsoft’s SIGCOMM paper suggests, redundancy doesn’t always prevent link failure. [When a power distribution unit failed](http://status.fogcreek.com/2011/06/postmortem.html) and took down one of two redundant top-of-rack switches, Fog Creek lost service for a subset of customers on that rack but remained consistent and available for most users. The other switch in that rack, however, also lost power for undetermined reasons. That failure isolated the two neighboring racks from each other, taking down all On Demand services.

> 正如微软的 SIGCOMM 论文所表明的，冗余并不总能防止链路故障。一个配电单元发生故障，导致两台冗余机架顶交换机中的一台停机后，Fog Creek 对该机架上部分客户的服务中断，但对大多数用户仍保持一致且可用。然而，该机架中的另一台交换机也因不明原因断电。这个故障使相邻的两个机架彼此隔离，导致全部 On Demand 服务中断。

### Switch Split-Brain Caused by BPDU Flood｜BPDU 泛洪引发交换机脑裂

During a planned network reconfiguration to improve reliability, Fog Creek Software suddenly lost access to its network [10].

> Fog Creek Software 在一次旨在提高可靠性的计划内网络重配置期间，突然失去了对其网络的访问 [10]。

> A network loop had formed between several switches. The gateways controlling access to the switch management network were isolated from each other, generating a split-brain scenario. Neither was accessible due to a...multi-switch BPDU (bridge protocol data unit) flood, indicating a spanning-tree flap. This is most likely what was changing the loop domain.

> > 多台交换机之间形成了一个网络环路。控制交换机管理网络访问的网关彼此隔离，形成了脑裂局面。由于……多交换机 BPDU（桥接协议数据单元）泛洪，两个网关都无法访问；这表明生成树发生了抖动，而它很可能正是改变环路域的原因。

According to the BPDU standard, the flood shouldn’t have happened. But it did, and this deviation from the system’s assumptions resulted in two hours of total service unavailability.

> 按照 BPDU 标准，这种泛洪本不应该发生。但它确实发生了，而这种偏离系统假设的行为造成了整整两小时的服务完全不可用。

### Bridge Loops, Misconfiguration, Broken MAC Caches｜桥接环路、错误配置与损坏的 MAC 缓存

To address high latencies caused by a daisy-chained network topology, Github [installed a set of aggregation switches](https://github.com/blog/1346-network-problems-last-friday) in its data center. Despite a redundant network, the installation process resulted in bridge loops, and switches disabled links to prevent failure. This problem was quickly resolved, but later investigation revealed that many interfaces were still pegged at 100 percent capacity.

> 为解决菊花链网络拓扑造成的高延迟，Github 在其数据中心安装了一组汇聚交换机。尽管网络具有冗余，安装过程仍产生了桥接环路，交换机于是禁用链路以防止故障。这个问题很快得到解决，但随后的调查发现，许多接口仍持续处于 100% 容量占用状态。

While that problem was under investigation, a misconfigured switch triggered aberrant automatic fault-detection behavior: when one link was disabled, the fault detector disabled all links, leading to 18 minutes of downtime. The problem was traced to a firmware bug preventing switches from updating their MAC (media access control) address caches correctly, forcing them to broadcast most packets to every interface.

> 在调查上述问题期间，一台配置错误的交换机触发了异常的自动故障检测行为：当一条链路被禁用时，故障检测器禁用了全部链路，导致服务停机 18 分钟。最终查明，问题源于一个固件缺陷；它使交换机无法正确更新 MAC（媒体访问控制）地址缓存，迫使交换机把大多数数据包广播到每一个接口。

### MLAG, Spanning Tree, and STONITH｜MLAG、生成树与 STONITH

[In December 2012](https://github.com/blog/1364-downtime-last-saturday), a planned software update on an aggregation switch caused instability at Github. To collect diagnostic information, the network vendor killed a particular software agent running on one of the aggregation switches.

> 2012 年 12 月，一台汇聚交换机上的计划内软件更新导致 Github 出现不稳定。为了收集诊断信息，网络设备供应商终止了其中一台汇聚交换机上运行的某个软件代理。

Github’s aggregation switches are clustered in pairs using a feature called MLAG (multi-chassis link aggregation), which presents two physical switches as a single L2 (layer-2) device. The MLAG failure-detection protocol relies on both Ethernet link state and a logical heartbeat message exchanged between nodes. When the switch agent was killed, it was unable to shut down the Ethernet link, preventing the still-healthy aggregation switch from handling link aggregation, spanning-tree, and other L2 protocols. This forced a spanning-tree leader election and reconvergence for all links, blocking all traffic between access switches for 90 seconds.

> Github 的汇聚交换机通过 MLAG（多机箱链路聚合）功能两两组成集群，对外呈现为一个 L2（二层）设备。MLAG 故障检测协议同时依赖以太网链路状态和节点之间交换的逻辑心跳消息。交换机代理被终止后，它无法关闭以太网链路，使仍然健康的汇聚交换机无法正常处理链路聚合、生成树以及其他二层协议。结果，系统被迫为所有链路执行生成树主节点选举和重新收敛，接入交换机之间的全部流量因此被阻断 90 秒。

This 90-second network partition caused file servers using Pacemaker and DRBD (Distributed Replicated Block Device) for HA (high availability) failover to declare each other dead, and to issue STONITH (shoot the other node in the head) messages to one another. The network partition delayed delivery of those messages, causing some file-server pairs to believe they were both active. When the network recovered, both nodes shot each other at the same time. With both nodes dead, files belonging to the pair were unavailable.

> 这次持续 90 秒的网络分区，使采用 Pacemaker 和 DRBD（Distributed Replicated Block Device，分布式复制块设备）进行 HA（高可用）故障切换的文件服务器互相宣布对方已经死亡，并彼此发送 STONITH（Shoot The Other Node In The Head，“一枪干掉另一个节点”）消息。网络分区延迟了这些消息的交付，导致某些文件服务器对认为双方都处于活动状态。网络恢复后，两个节点同时向对方“开枪”。由于两个节点都已停机，属于该服务器对的文件全部不可用。

To prevent file-system corruption, DRBD requires that administrators ensure the original primary node is still the primary node before resuming replication. For pairs where both nodes were primary, the ops team had to examine log files or bring each node online in isolation to determine its state. Recovering those downed file-server pairs took five hours, during which Github service was significantly degraded.

> 为防止文件系统损坏，DRBD 要求管理员在恢复复制之前确认原主节点仍然是主节点。对于两个节点都成为主节点的服务器对，运维团队不得不检查日志文件，或者把每个节点隔离后单独上线，以判断其状态。恢复这些停机的文件服务器对耗时五小时，在此期间 Github 服务严重降级。

## Cloud Networks｜云网络

Large-scale virtualized environments are notorious for transient latency, dropped packets, and full-blown network partitions, often affecting a particular software version or availability zone. Sometimes the failures occur between specific subsections of the provider’s data center, revealing planes of cleavage in the underlying hardware topology.

> 大规模虚拟化环境因瞬时延迟、丢包和彻底的网络分区而声名狼藉，这些故障往往影响某个特定软件版本或可用区。有时，故障发生在云服务商数据中心的特定子区域之间，暴露出底层硬件拓扑中的断裂面。

### An Isolated MongoDB Primary on EC2｜EC2 上被隔离的 MongoDB 主节点

In a comment on [*Call me maybe: MongoDB*](http://aphyr.com/posts/284-call-me-maybe-mongodb), Scott Bessler observed exactly the same failure mode Kyle demonstrated earlier:

> Scott Bessler 在 *Call me maybe: MongoDB*（《打给我吧，也许：MongoDB》）的一条评论中，观察到了与 Kyle 此前演示完全相同的故障模式：

> [This scenario] happened to us today when EC2 West region had network issues that caused a network partition that separated PRIMARY from its 2 SECONDARIES in a 3 node replset. 2 hours later the old primary rejoined and rolled back everything on the new primary.

> > 今天我们就遇到了[这种情形]：EC2 西部区域发生网络问题，引发网络分区，把一个三节点副本集中的 PRIMARY 与它的两个 SECONDARY 隔离开来。两小时后，旧主节点重新加入，并回滚了新主节点上的所有内容。

This partition caused two hours of write loss. From our conversations with large-scale MongoDB users, we gather that network events causing failover on Amazon’s EC2 (Elastic Compute Cloud) are common. Simultaneous primaries accepting writes for multiple days are anecdotally common.

> 这次分区造成两小时的写入丢失。根据我们与大型 MongoDB 用户的交流，在 Amazon EC2（Elastic Compute Cloud，弹性计算云）上，因网络事件而触发故障切换十分常见。轶闻表明，多个主节点同时接受写入并持续数天的情况也并不少见。

### Mnesia Split-Brain on EC2｜EC2 上的 Mnesia 脑裂

Outages can leave two nodes connected to the Internet but unable to see each other. This type of partition is especially dangerous, as writes to both sides of a partitioned cluster can cause inconsistency and lost data. Paul Mineiro [reports exactly this scenario](http://dukesoferl.blogspot.com/2008/03/network-partition-oops.html?m=1) in an Mnesia cluster, which diverged overnight. The cluster’s state wasn’t critical, so the operations team simply nuked one side of the cluster. They conclude: “The experience has convinced us that we need to prioritize up our network partition recovery strategy.”

> 故障可能使两个节点都保持互联网连接，却彼此不可见。这种分区尤其危险，因为向分区集群的两侧同时写入会造成不一致和数据丢失。Paul Mineiro 报告了一起完全符合这种情形的 Mnesia 集群事故：集群在一夜之间发生分歧。由于集群状态并不关键，运维团队干脆彻底清除了集群的一侧。他们总结道：“这次经历让我们确信，必须提高网络分区恢复策略的优先级。”

### EC2 Instability Causing MongoDB and ElasticSearch Unavailability｜EC2 不稳定导致 MongoDB 与 ElasticSearch 不可用

Network disruptions in EC2 can affect only certain groups of nodes. For example, [one report](https://forums.aws.amazon.com/thread.jspa?messageID=454155) of a total partition between the front-end and back-end servers states that a site’s servers lose their connections to all back-end instances for a few seconds, several times a month. Even though the disruptions were short, they resulted in 30- to 45-minute outages and a corrupted index for ElasticSearch. As problems escalated, the outages occurred “2 to 4 times a day.”

> EC2 中的网络中断可能只影响某些节点组。例如，一份关于前端与后端服务器之间完全分区的报告称，该站点的服务器每月会有数次与所有后端实例失去连接，每次持续数秒。尽管中断时间很短，却会造成 30–45 分钟的服务不可用，并损坏 ElasticSearch 索引。随着问题恶化，中断频率增至“每天 2 到 4 次”。

### AWS EBS Outage｜AWS EBS 中断

On April 21, 2011, AWS suffered unavailability for 12 hours [2], causing hundreds of high-profile Web sites to go offline. As a part of normal AWS scaling activities, Amazon engineers had shifted traffic away from a router in the EBS (Elastic Block Store) network in a single U.S. East AZ (Availability Zone), but, due to incorrect routing policies:

> 2011 年 4 月 21 日，AWS 经历了长达 12 小时的不可用 [2]，导致数百个知名网站离线。作为 AWS 常规扩容操作的一部分，Amazon 工程师将流量从美国东部某个 AZ（Availability Zone，可用区）内 EBS（Elastic Block Store，弹性块存储）网络的一台路由器上迁走；但由于路由策略错误：

> ...many EBS nodes in the affected Availability Zone were completely isolated from other EBS nodes in its cluster. Unlike a normal network interruption, this change disconnected both the primary and secondary network simultaneously, leaving the affected nodes completely isolated from one another.

> > ……受影响可用区内的许多 EBS 节点与其集群中的其他 EBS 节点完全隔离。与普通网络中断不同，这次变更同时切断了主网络和备用网络，使受影响的节点彼此完全隔离。

The partition, coupled with aggressive failure-recovery code, caused a mirroring storm that caused network congestion and triggered a previously unknown race condition in EBS. EC2 was unavailable for roughly 12 hours, and EBS was unavailable or degraded for more than 80 hours.

> 分区与激进的故障恢复代码共同引发了一场镜像风暴，造成网络拥塞，并触发了 EBS 中一个此前未知的竞态条件。EC2 不可用约 12 小时，而 EBS 的不可用或降级状态持续了 80 多个小时。

The EBS failure also caused an outage in Amazon’s RDS (Relational Database Service). When one AZ fails, RDS is designed to failover to a different AZ; however, 2.5 percent of multi-AZ databases in U.S. East failed to failover because of a bug in the failover protocol.

> EBS 故障还导致 Amazon RDS（Relational Database Service，关系数据库服务）中断。RDS 被设计为在一个 AZ 故障时切换到另一个 AZ；然而，由于故障切换协议中的一个缺陷，美国东部区域有 2.5% 的多可用区数据库未能完成切换。

This correlated failure caused widespread outages for clients relying on AWS. For example, [Heroku reported](https://status.heroku.com/incidents/151) between 16 and 60 hours of unavailability for its users’ databases.

> 这种相关性故障使依赖 AWS 的客户大面积中断。例如，Heroku 报告称，其用户数据库的不可用时间介于 16 到 60 小时之间。

### Isolated Redis Primary on EC2｜EC2 上被隔离的 Redis 主节点

On July 18, 2013, Twilio’s billing system, which stores account credits in Redis, failed [19]. A network partition isolated the Redis primary from all secondaries. Because Twilio did not promote a new secondary, writes to the primary remained consistent. When the primary became visible to the secondaries again, however, all secondaries simultaneously initiated a full resynchronization with the primary, overloading it and causing Redis-dependent services to fail.

> 2013 年 7 月 18 日，使用 Redis 存储账户余额的 Twilio 计费系统发生故障 [19]。一次网络分区把 Redis 主节点与所有从节点隔离开来。由于 Twilio 没有提升新的从节点，写入主节点的数据仍保持一致。然而，当从节点再次能够看到主节点时，所有从节点同时发起了与主节点的完整重新同步，使主节点过载，并导致依赖 Redis 的服务失败。

The ops team restarted the Redis primary to address the high load. Upon restart, however, the Redis primary reloaded an incorrect configuration file, which caused it to enter read-only mode. With all account balances at zero, and in read-only mode, every Twilio API call caused the billing system to recharge customer credit cards automatically, resulting in 1.1 percent of customers being overbilled over a period of 40 minutes. For example, [Appointment Reminder reported](https://news.ycombinator.com/item?id=6094813) that every SMS message and phone call it issued resulted in a $500 charge to its credit card, which stopped accepting charges after $3,500.

> 运维团队重启 Redis 主节点以缓解高负载。然而重启后，Redis 主节点加载了错误的配置文件，因而进入只读模式。在所有账户余额均为零且系统只读的情况下，每一次 Twilio API 调用都会使计费系统自动再次从客户信用卡扣款，导致 1.1% 的客户在 40 分钟内被超额收费。例如，Appointment Reminder 报告称，它每发出一条短信或一次电话呼叫，信用卡就会被收取 500 美元；累计扣款达到 3,500 美元后，该卡停止接受扣款。

Twilio recovered the Redis state from an independent billing system—a relational data store—and after some hiccups, restored proper service, including credits to affected users.

> Twilio 从一个独立的计费系统——关系型数据存储——恢复了 Redis 状态，并在经历一些波折后恢复正常服务，其中包括向受影响用户返还余额。

## Hosting Providers｜托管服务商

Running your own data center can be cheaper and more reliable than using public cloud infrastructure, but it means you have to be a network and server administrator. What about hosting providers, which rent dedicated or virtualized hardware to users and often take care of the network and hardware setup for you?

> 自建数据中心可能比使用公有云基础设施更便宜、更可靠，但这意味着你必须自己充当网络和服务器管理员。那么托管服务商又如何呢？它们把专用或虚拟化硬件出租给用户，而且通常代为处理网络与硬件配置。

### An Undetected GlusterFS Split-Brain｜未被检测到的 GlusterFS 脑裂

Freistil IT hosts its servers with a colocation/managed-hosting provider. Its monitoring system alerted Freistil to a 50–100 percent packet loss localized to a specific data center [15]. The network failure, caused by a router firmware bug, returned the next day. Elevated packet loss caused the GlusterFS distributed file system to enter split-brain undetected:

> Freistil IT 把服务器托管在一家机房托管/托管服务商处。其监控系统向 Freistil 发出告警：某个特定数据中心出现局部 50%–100% 的丢包 [15]。这起由路由器固件缺陷引发的网络故障在第二天再次出现。高丢包率使 GlusterFS 分布式文件系统进入脑裂状态，却没有被检测出来：

> ...we became aware of [problems] in the afternoon when a customer called our support hotline because their website failed to deliver certain image files. We found that this was caused by a split-brain situation...and the self-heal algorithm built into the Gluster file system was not able to resolve this inconsistency between the two data sets.

> > ……下午，一位客户因为网站无法提供某些图片文件而拨打支持热线，我们这才意识到[问题]。我们发现，原因是发生了脑裂……而 Gluster 文件系统内置的自愈算法无法解决两份数据集之间的不一致。

Repairing that inconsistency led to a “brief overload of the Web nodes because of a short surge in network traffic.”

> 修复这种不一致又造成“网络流量短时激增，使 Web 节点出现短暂过载”。

### An Anonymous Hosting Provider｜一家匿名托管服务商

Anecdotally, many major managed hosting providers experience network failures. One company running 100–200 nodes on a major hosting provider reported that in a 90-day period the provider’s network went through five distinct periods of partitions. Some partitions disabled connectivity between the provider’s cloud network and the public Internet, and others separated the cloud network from the provider’s internal managed-hosting network.

> 据传闻，许多大型托管服务商都会发生网络故障。一家公司在某大型托管服务商上运行着 100–200 个节点；它报告称，在 90 天内，该服务商的网络经历了五段彼此独立的分区时期。有些分区切断了服务商云网络与公共互联网之间的连接，另一些则把云网络与服务商内部的托管网络隔离开来。

### Pacemaker/Heartbeat Split-Brain｜Pacemaker/Heartbeat 脑裂

[A post to Linux-HA](http://readlist.com/lists/lists.linux-ha.org/linux-ha/6/31964.html) details a long-running partition between a Heartbeat pair, in which two Linode VMs each declared the other dead and claimed a shared IP for themselves. Successive posts suggest further network problems: e-mails failed to dispatch because of DNS (Domain Name System) resolution failure, and nodes reported, “Network unreachable.” In this case, the impact appears to have been minimal, in part because the partitioned application was just a proxy.

> Linux-HA 上的一篇帖子详细记录了一对 Heartbeat 节点之间长期存在的分区：两台 Linode 虚拟机都宣布对方已经死亡，并各自占用了共享 IP。后续帖子显示还存在更多网络问题：电子邮件因 DNS（Domain Name System，域名系统）解析失败而无法发出，节点则报告“网络不可达”。在这个案例中，影响似乎相当有限，部分原因是发生分区的应用仅仅是一个代理。

## Wide Area Networks｜广域网

While we have largely focused on failures over local area networks (or near-local networks), WAN (wide area network) failures are also common, if less frequently documented. These failures are particularly interesting because there are often fewer redundant WAN routes and because systems guaranteeing high availability (and disaster recovery) often require distribution across multiple data centers. Accordingly, graceful degradation under partitions or increased latency is especially important for geographically widespread services.

> 尽管我们此前主要关注局域网（或近似局域的网络）中的故障，但 WAN（wide area network，广域网）故障同样常见，只是被记录下来的频率更低。这类故障尤其值得关注，因为广域网中的冗余路由通常更少，而保证高可用性（和灾难恢复）的系统往往又必须分布到多个数据中心。因此，对于在地理上广泛分布的服务来说，在分区或延迟升高时实现优雅降级尤为重要。

### CENIC Study｜CENIC 研究

Researchers at the UCSD analyzed five years of operation in the CENIC (Corporation for Education Network Initiatives in California) WAN [18], which contains more than 200 routers across California. By cross-correlating link failures and additional external BGP (Border Gateway Protocol) and traceroute data, they discovered more than 500 “isolating network partitions” that caused connectivity problems between hosts. Average partition duration ranged from 6 minutes for software-related failures to more than 8.2 hours for hardware-related failures (median 2.7 and 32 minutes; 95th percentile of 19.9 minutes and 3.7 days, respectively).

> UCSD 的研究人员分析了 CENIC（Corporation for Education Network Initiatives in California，加州教育网络计划公司）广域网五年的运行情况 [18]；该网络在加州各地拥有 200 多台路由器。通过交叉关联链路故障、外部 BGP（Border Gateway Protocol，边界网关协议）数据和 traceroute 数据，他们发现了 500 多次造成主机间连接问题的“隔离型网络分区”。由软件引发的分区平均持续 6 分钟，硬件引发的分区平均持续 8.2 小时以上；二者的中位数分别为 2.7 分钟和 32 分钟，第 95 百分位则分别为 19.9 分钟和 3.7 天。

### PagerDuty｜PagerDuty

PagerDuty designed its system to remain available in the face of node, data-center, or even provider failure; its services are replicated between two EC2 regions and a data center hosted by Linode. [On April 13, 2013](http://blog.pagerduty.com/2013/04/outage-post-mortem-april-13-2013/), an AWS peering point in northern California degraded, causing connectivity issues for one of PagerDuty’s EC2 nodes. As latencies between AWS Availability Zones rose, the notification dispatch system lost quorum and stopped dispatching messages entirely.

> PagerDuty 将系统设计成即使节点、数据中心乃至服务商发生故障，也能保持可用；其服务复制在两个 EC2 区域和一个由 Linode 托管的数据中心之间。2013 年 4 月 13 日，位于北加州的一个 AWS 对等互联点发生性能下降，导致 PagerDuty 的一个 EC2 节点出现连接问题。随着 AWS 可用区之间的延迟升高，通知分发系统失去 quorum，并彻底停止发送消息。

Even though PagerDuty’s infrastructure was designed with partition tolerance in mind, correlated failures caused by a shared peering point between two data centers resulted in 18 minutes of unavailability, dropping inbound API requests and delaying queued pages until quorum was reestablished.

> 尽管 PagerDuty 的基础设施在设计时考虑了分区容忍，但两个数据中心共享的对等互联点引发了相关性故障，仍造成 18 分钟的不可用。在重新建立 quorum 之前，传入的 API 请求被丢弃，队列中的寻呼通知也被延迟。

## Global Routing Failures｜全球路由故障

Despite the high level of redundancy in Internet systems, some network failures take place on a global scale.

> 尽管互联网系统具有高度冗余，有些网络故障仍会在全球范围内发生。

### CloudFlare｜CloudFlare

CloudFlare runs 23 data centers with redundant network paths and anycast failover. In response to a DDoS (distributed denial-of-service) attack against one of its customers, the CloudFlare operations team deployed a new firewall rule to drop packets of a specific size [17]. Juniper’s FlowSpec protocol propagated that rule to all CloudFlare edge routers—but then:

> CloudFlare 运营着 23 个数据中心，配有冗余网络路径和任播故障切换。为应对针对某个客户的 DDoS（distributed denial-of-service，分布式拒绝服务）攻击，CloudFlare 运维团队部署了一条新的防火墙规则，用于丢弃特定大小的数据包 [17]。Juniper 的 FlowSpec 协议把这条规则传播到了 CloudFlare 的所有边缘路由器——然而随后发生了：

> What should have happened is that no packet should have matched that rule because no packet was actually that large. What happened instead is that the routers encountered the rule and then proceeded to consume all their RAM until they crashed.

> > 本应发生的情况是，没有任何数据包会匹配这条规则，因为实际上不存在那么大的数据包。然而真正发生的是：路由器遇到这条规则后，开始耗尽自己的全部 RAM，直至崩溃。

Recovering from the failure was complicated by routers that failed to reboot automatically and by inaccessible management ports.

> 有些路由器未能自动重启，还有一些管理端口无法访问，这些问题使故障恢复变得更加复杂。

> Even though some data centers came back online initially, they fell back over again because all the traffic across our entire network hit them and overloaded their resources.

> > 尽管有些数据中心最初重新上线，但很快又再次倒下，因为我们整个网络的全部流量都涌向它们，使其资源过载。

CloudFlare monitors its network carefully, and the operations team had immediate visibility into the failure. Coordinating globally distributed systems is complex, however, and calling on-site engineers to find and reboot routers by hand takes time. Recovery began after 30 minutes and was complete after an hour of unavailability.

> CloudFlare 对其网络进行严密监控，运维团队也立即看到了故障。然而，协调全球分布式系统非常复杂，召集现场工程师寻找并手动重启路由器也需要时间。30 分钟后恢复工作开始，系统在不可用一小时后完全恢复。

### Juniper Routing Bug｜Juniper 路由缺陷

A firmware bug introduced as a part of an upgrade in Juniper Networks’ routers [caused outages](http://www.eweek.com/c/a/IT-Infrastructure/Bug-in-Juniper-Router-Firmware-Update-Causes-Massive-Internet-Outage-709180/) in Level 3 Communications’ networking backbone in 2011. This subsequently knocked services offline, including Time Warner Cable, RIM BlackBerry, and several UK Internet service providers.

> Juniper Networks 路由器的一次升级引入了固件缺陷，并在 2011 年造成 Level 3 Communications 网络骨干中断。随后，包括 Time Warner Cable、RIM BlackBerry 和英国数家互联网服务商在内的服务纷纷离线。

### Global BGP Outages｜全球 BGP 中断

There have been several global Internet outages related to BGP misconfiguration. Notably, in 2008 Pakistan Telecom, responding to a government edict to block YouTube.com, incorrectly advertised its (blocked) route to other providers, which hijacked traffic from the site and [briefly rendered it unreachable](http://news.cnet.com/8301-10784_3-9878655-7.html).

> 全球互联网曾发生数起与 BGP 配置错误有关的中断。一个著名案例发生在 2008 年：Pakistan Telecom 为执行政府封锁 YouTube.com 的命令，错误地向其他服务商通告了其（已被封锁的）路由，从而劫持了发往该网站的流量，并使其短时间内无法访问。

In 2010 a group of Duke University researchers achieved a similar effect by [testing an experimental flag in the BGP](http://www.merit.edu/mail.archives/nanog/msg11505.html). Similar incidents occurred [in 2006](http://www.renesys.com/2006/01/coned-steals-the-net/), knocking sites such as Martha Stewart Living and the *New York Times* offline; [in 2005](http://www.renesys.com/2005/12/internetwide-nearcatastrophela/), where a misconfiguration in Turkey attempted a redirect for the entire Internet; and [in 1997](http://merit.edu/mail.archives/nanog/1997-04/msg00380.html).

> 2010 年，杜克大学的一组研究人员在测试 BGP 中的一个实验性标志时，造成了类似影响。类似事件还发生在 2006 年，当时 Martha Stewart Living 和《纽约时报》等网站离线；2005 年，土耳其的一项错误配置试图重定向整个互联网；以及 1997 年。

## NICs and Drivers｜网卡与驱动程序

Unreliable networking hardware and/or drivers are implicated in a broad array of partitions.

> 各种各样的分区背后，都可能牵涉不可靠的网络硬件和/或驱动程序。

### BCM5709 and Friends｜BCM5709 及其同类

As a classic example of NIC (network interface controller) unreliability, [Marc Donges and Michael Chan](http://www.spinics.net/lists/netdev/msg210485.html) describe how their popular Broadcom BCM5709 chip dropped inbound but not outbound packets. The primary server was unable to service requests, but, because it could still send heartbeats to its hot spare, the spare considered the primary alive and refused to take over. Their service was unavailable for five hours and did not recover without a reboot.

> Marc Donges 和 Michael Chan 描述了广泛使用的 Broadcom BCM5709 芯片如何只丢弃入站包、却不丢弃出站包，这是 NIC（network interface controller，网络接口控制器）不可靠性的一个经典案例。主服务器无法处理请求，但由于仍能向热备机发送心跳，热备机认为主服务器还活着，因而拒绝接管。服务不可用长达五小时，而且不重启就无法恢复。

[Sven Ulland followed up](http://www.spinics.net/lists/netdev/msg210491.html), reporting the same symptoms with the BCM5709S chipset on Linux 2.6.32-41squeeze2. Despite pulling commits from mainline, which supposedly fixed a similar set of issues with the bnx2 driver, Ulland’s team was unable to resolve the issue until version 2.6.38.

> Sven Ulland 随后跟进报告称，在 Linux 2.6.32-41squeeze2 上使用 BCM5709S 芯片组时出现了相同症状。尽管从主线拉取了据称能够修复 bnx2 驱动中一组类似问题的提交，Ulland 的团队仍然直到 2.6.38 版本才解决问题。

As a large number of servers shipped the BCM5709, the larger impact of these firmware bugs was widely observed. For example, the 5709 had a bug in the [802.3x flow control](http://monolight.cc/2011/08/flow-control-flaw-in-broadcom-bcm5709-nics-and-bcm56xxx-switches/), leading to extraneous PAUSE frames when the chipset crashed or its buffer filled up. This problem was magnified by the BCM56314 and BCM56820 switch-on-a-chip devices (found in many top-of-rack switches), which, by default, sent PAUSE frames to any interface communicating with the offending 5709 NIC. This led to cascading failures on entire switches or networks.

> 由于大量服务器搭载 BCM5709 出货，这些固件缺陷造成的广泛影响也被大量观察到。例如，5709 的 802.3x 流量控制存在缺陷，当芯片组崩溃或缓冲区被填满时，会发出多余的 PAUSE 帧。BCM56314 和 BCM56820 片上交换机设备（许多机架顶交换机都使用它们）进一步放大了问题：默认情况下，它们会向所有正在与问题 5709 网卡通信的接口发送 PAUSE 帧，最终在整台交换机乃至整个网络中引发级联故障。

The bnx2 driver could also cause transient or flapping network failures, as described in an [ElasticSearch failure report](http://elasticsearch-users.115913.n3.nabble.com/Cluster-Split-Brain-td3333510.html). Meanwhile, the Broadcom 57711 was notorious for [causing high latencies under load with jumbo frames](http://communities.vmware.com/thread/284628?start=0&tstart=0), a particularly thorny issue for ESX users with iSCSI-backed storage.

> 正如一份 ElasticSearch 故障报告所述，bnx2 驱动还可能造成瞬时或反复抖动的网络故障。与此同时，Broadcom 57711 因在巨型帧负载下造成高延迟而臭名昭著；对于使用 iSCSI 后端存储的 ESX 用户，这尤其棘手。

### Intel 82574 Packet of Death｜Intel 82574“死亡数据包”

A motherboard manufacturer failed to flash the EEPROM correctly for its Intel 82574–based system. The result was a very-hard-to-diagnose error in which an inbound SIP (Session Initiation Protocol) packet of a particular structure would disable the NIC [14]. Only a cold restart would bring the system back to normal.

> 一家主板制造商未能为其基于 Intel 82574 的系统正确烧录 EEPROM。结果产生了一种极难诊断的错误：一个具有特定结构的入站 SIP（Session Initiation Protocol，会话发起协议）数据包会使网卡失效 [14]。只有冷重启才能让系统恢复正常。

### A GlusterFS Partition Caused by a Driver Bug｜驱动缺陷引发的 GlusterFS 分区

After a scheduled upgrade, CityCloud noticed unexpected network failures in two distinct GlusterFS pairs, followed by a third [6]. Suspecting link aggregation, CityCloud disabled the feature on its switches and allowed self-healing operations to proceed.

> 一次计划内升级后，CityCloud 先后在两个不同的 GlusterFS 对中观察到意外网络故障，随后第三个 GlusterFS 对也出现故障 [6]。CityCloud 怀疑链路聚合是原因，于是在交换机上禁用了该功能，并让自愈操作继续进行。

Roughly 12 hours later, the network failures returned. CityCloud identified the cause as a driver issue and updated the downed node, returning service. The outage, however, resulted in data inconsistency between GlusterFS pairs and data corruption between virtual machine file systems.

> 大约 12 小时后，网络故障再次出现。CityCloud 确认原因为驱动问题，更新了停机节点并恢复服务。然而，这次中断已经造成 GlusterFS 对之间的数据不一致，以及虚拟机文件系统中的数据损坏。

## Application-Level Failures｜应用层故障

Not all asynchrony originates in the physical network. Sometimes dropped or delayed messages are a consequence of crashes, program errors, operating-system scheduler latency, or overloaded processes. The following studies highlight the fact that communication failures—wherein the system delays or drops messages—can occur at any layer of the software stack, and that designs that expect synchronous communication may behave unexpectedly during periods of asynchrony.

> 并非所有异步都源于物理网络。有时，消息丢失或延迟是由崩溃、程序错误、操作系统调度器延迟或进程过载造成的。下面这些案例说明，通信故障——也就是系统延迟或丢弃消息——可能发生在软件栈的任何一层；而期待同步通信的设计，在异步期间可能表现出意外行为。

### CPU Use and Service Contention｜CPU 使用与服务争用

[Bonsai.io discovered](http://www.bonsai.io/blog/2013/03/05/outage-post-mortem) high CPU and memory use on an ElasticSearch node combined with difficulty connecting to various cluster components, likely a consequence of an “excessively high number of expensive requests being allowed through to the cluster.”

> Bonsai.io 发现，一个 ElasticSearch 节点的 CPU 和内存使用率很高，同时难以连接到多个集群组件；原因很可能是“允许数量过多的高开销请求进入集群”。

Upon restarting the servers, the cluster split into two independent components. A subsequent restart resolved the split-brain behavior, but customers complained they were unable to delete or create indices. The logs revealed that servers were repeatedly trying to recover unassigned indices, which “poisoned the cluster’s attempt to service normal traffic which changes the cluster state.” The failure led to 20 minutes of unavailability and six hours of degraded service.

> 服务器重启后，集群分裂成两个相互独立的部分。再次重启解决了脑裂行为，但客户反映无法删除或创建索引。日志显示，服务器不断尝试恢复尚未分配的索引，这“毒害了集群处理会改变集群状态的正常流量的尝试”。此次故障导致 20 分钟不可用，以及六小时的服务降级。

### Long GC Pauses and I/O｜长时间 GC 停顿与 I/O

Stop-the-world garbage collection and blocking for disk I/O can cause runtime latencies on the order of seconds to minutes. As [Searchbox IO](http://blog.searchbox.io/blog/2013/03/03/january-postmortem) and [several other production users](https://github.com/elasticsearch/elasticsearch/issues/2488) have found, GC (garbage collection) pressure in an ElasticSearch cluster can cause secondary nodes to declare a primary dead and to attempt a new election. Because of nonmajority quorum configuration, ElasticSearch elected two different primaries, leading to inconsistency and downtime. Surprisingly, even with majority quorums, due to protocol design, ElasticSearch does not currently prevent simultaneous master election; GC pauses and high IO_WAIT times due to I/O can cause split-brain behavior, write loss, and index corruption.

> Stop-the-world 垃圾回收以及磁盘 I/O 阻塞，会造成从数秒到数分钟不等的运行时延迟。Searchbox IO 和其他若干生产用户发现，ElasticSearch 集群中的 GC（garbage collection，垃圾回收）压力可能使从节点宣布主节点已经死亡，并尝试发起新一轮选举。由于 quorum 配置未要求多数节点，ElasticSearch 选出了两个不同的主节点，导致不一致与停机。令人意外的是，即使采用多数 quorum，受协议设计所限，当时的 ElasticSearch 仍不能阻止同时选出多个主节点；GC 停顿和 I/O 导致的高 IO_WAIT 时间都可能引发脑裂、写入丢失和索引损坏。

### MySQL Overload and a Pacemaker Segfault｜MySQL 过载与 Pacemaker 段错误

In 2012, a routine database migration caused unexpectedly high load on the MySQL primary at Github [13]. The cluster coordinator, unable to perform health checks against the busy MySQL server, decided the primary was down and promoted a secondary. The secondary had a cold cache and performed poorly, causing failover back to the original primary. The operations team manually halted this automatic failover, and the site appeared to recover.

> 2012 年，Github 的一次例行数据库迁移给 MySQL 主节点带来了意外的高负载 [13]。集群协调器无法对繁忙的 MySQL 服务器执行健康检查，于是判定主节点已经停机，并提升了一个从节点。该从节点的缓存尚未预热，性能很差，因而系统又故障切换回原主节点。运维团队手动停止了这种自动故障切换，网站看起来恢复了正常。

The next morning, the operations team discovered that the standby MySQL node was no longer replicating changes from the primary. Operations decided to disable the coordinator’s maintenance mode and allow the replication manager to fix the problem. Unfortunately, this triggered a segfault in the coordinator, and a conflict between manual configuration and the automated replication tools rendered github.com unavailable.

> 第二天早上，运维团队发现备用 MySQL 节点已不再复制主节点的变更。运维人员决定关闭协调器的维护模式，让复制管理器修复问题。不幸的是，这触发了协调器中的段错误，而手动配置与自动复制工具之间的冲突则使 github.com 陷入不可用。

The partition caused inconsistency in the MySQL database—both between the secondary and primary, and between MySQL and other data stores such as Redis. Because foreign key relationships were not consistent, Github showed private repositories to the wrong users’ dashboards and incorrectly routed some newly created repositories.

> 分区造成 MySQL 数据库不一致：主从节点之间不一致，MySQL 与 Redis 等其他数据存储之间也不一致。由于外键关系不一致，Github 把私有仓库显示在了错误用户的控制面板上，还把一些新创建的仓库路由到了错误位置。

### DRBD Split-Brain｜DRBD 脑裂

When a two-node cluster partitions, there are no cases in which a node can reliably declare itself to be the primary. When this happens to a DRBD file system, [as one user reported](http://serverfault.com/questions/485545/dual-primary-ocfs2-drbd-encountered-split-brain-is-recovery-always-going-to-be), both nodes can remain online and accept writes, leading to divergent file-system-level changes.

> 当一个双节点集群发生分区时，没有任何情况下某个节点能够可靠地宣布自己是主节点。一位用户报告称，DRBD 文件系统发生这种情况时，两个节点都可能保持在线并接受写入，导致文件系统层面的变更彼此分歧。

### A NetWare Split-Brain｜NetWare 脑裂

Short-lived failures can lead to long outages. In a [Usenet post to `novell.support.cluster-services`](http://novell.support.cluster-services.free-usenet.eu/Split-Brain-Condition_T31677168_S1), an admin reports that a two-node failover cluster running Novell NetWare experienced transient network outages. The secondary node eventually killed itself, and the primary (though still running) was no longer reachable by other hosts on the network. The post goes on to detail a series of network partition events correlated with backup jobs.

> 短暂故障可能导致长时间中断。在发往 `novell.support.cluster-services` 的一篇 Usenet 帖子中，一名管理员报告称，一个运行 Novell NetWare 的双节点故障切换集群经历了瞬时网络中断。从节点最终自行关闭，而主节点虽然仍在运行，却无法被网络中的其他主机访问。帖子随后详细描述了一系列与备份任务相关联的网络分区事件。

### VoltDB Split-Brain on EC2｜EC2 上的 VoltDB 脑裂

[One VoltDB user reports regular network failures causing replica divergence](https://forum.voltdb.com/showthread.php?552-Nodes-stop-talking-to-each-other-and-form-independent-clusters) but also indicates that the network logs included no dropped packets. Because this cluster had not enabled split-brain detection, both nodes ran as isolated primaries, causing significant data loss.

> 一名 VoltDB 用户报告称，经常发生的网络故障导致副本分歧，但网络日志中又没有任何丢包记录。由于该集群没有启用脑裂检测，两个节点都以彼此隔离的主节点身份运行，造成了严重的数据丢失。

### Mystery RabbitMQ Partitions｜神秘的 RabbitMQ 分区

Sometimes, nobody knows why a system partitions. This [RabbitMQ failure](http://serverfault.com/questions/497308/rabbitmq-network-partition-error) seems like one of those cases: few retransmits, no large gaps between messages, and no clear loss of connectivity between nodes. Increasing the partition-detection timeout to two minutes reduced the frequency of partitions but didn’t prevent them altogether.

> 有时候，没人知道系统为什么会发生分区。这次 RabbitMQ 故障似乎就是这样的案例：重传很少，消息之间没有很大的时间间隔，节点之间也没有明显失去连接。把分区检测超时提高到两分钟后，分区发生频率有所下降，但仍未被彻底阻止。

### ElasticSearch Discovery Failure on EC2｜EC2 上的 ElasticSearch 发现故障

[Another EC2 split-brain](http://elasticsearch-users.115913.n3.nabble.com/EC2-discovery-leads-to-two-masters-td3239318.html): a two-node cluster failed to converge on “roughly 1 out of 10 startups” when discovery messages took longer than three seconds to exchange. As a result, both nodes would start as primaries with the same cluster name. Since ElasticSearch doesn’t demote primaries automatically, split-brain persisted until administrators intervened. Increasing the discovery timeout to 15 seconds resolved the issue.

> 另一起 EC2 脑裂案例中，当发现消息的交换耗时超过三秒时，一个双节点集群“每启动大约 10 次就有 1 次”无法收敛。结果，两个节点会使用同一个集群名，各自以主节点身份启动。由于 ElasticSearch 不会自动降级主节点，脑裂会一直持续到管理员介入。把发现超时提高到 15 秒后，问题得到解决。

### RabbitMQ and ElasticSearch on Windows Azure｜Windows Azure 上的 RabbitMQ 与 ElasticSearch

There are a few scattered reports of Windows Azure partitions, such as [one account](http://rabbitmq.1065348.n5.nabble.com/Instable-HA-cluster-td24690.html) of a RabbitMQ cluster that entered split-brain on a weekly basis. There’s also [a report of an ElasticSearch split-brain](https://groups.google.com/forum/?fromgroups#!topic/elasticsearch/muZtKij3nUw), but since Azure is a relative newcomer compared with EC2, descriptions of its network reliability are limited.

> 关于 Windows Azure 分区的报告零星可见，例如有一份记录称，某个 RabbitMQ 集群每周都会进入脑裂状态。另有一份 ElasticSearch 脑裂报告；不过，与 EC2 相比，Azure 当时还是相对较新的参与者，因此对其网络可靠性的描述十分有限。

## Conclusions: Where Do We Go from Here?｜结论：我们将何去何从？

This article is meant as a reference point—to illustrate that, according to a wide range of (often informal) accounts, communication failures occur in many real-world environments. Processes, servers, NICs, switches, and local and wide area networks can all fail, with real economic consequences. Network outages can suddenly occur in systems that have been stable for months at a time, during routine upgrades, or as a result of emergency maintenance. The consequences of these outages range from increased latency and temporary unavailability to inconsistency, corruption, and data loss. Split-brain is not an academic concern: it happens to all kinds of systems—sometimes for days on end. Partitions deserve serious consideration.

> 本文意在提供一个参考点，以说明：大量（通常是非正式的）记录表明，通信故障会发生在许多现实环境中。进程、服务器、网卡、交换机、局域网和广域网全都可能发生故障，并造成真实的经济后果。一个已经稳定运行数月的系统，可能在例行升级期间或因紧急维护而突然发生网络中断。这些中断造成的后果，从延迟升高、暂时不可用，一直到不一致、数据损坏和数据丢失。脑裂并非学术上的空想：它会发生在各种系统中，有时甚至连续数日。分区值得被认真对待。

On the other hand, some networks really are reliable. Engineers at major financial firms have anecdotally reported that despite putting serious effort into designing systems that gracefully tolerate partitions, their networks rarely, if ever, exhibit partition behavior. Cautious engineering and aggressive network advances (along with lots of money) can prevent outages. Moreover, in this article, we have presented failure scenarios; we acknowledge it’s much harder to demonstrate that network failures have not occurred.

> 另一方面，有些网络的确非常可靠。大型金融机构的工程师曾以轶闻方式报告称，尽管他们投入了大量精力来设计能够优雅容忍分区的系统，但其网络很少表现出分区行为，甚至从未出现过。谨慎的工程实践、积极采用先进网络技术（再加上大量资金）确实能够防止中断。此外，本文展示的是故障场景；我们也承认，要证明网络故障没有发生过要困难得多。

Not all organizations, however, can afford the cost or operational complexity of highly reliable networks. From Google and Amazon (which operate commodity and/or low-cost hardware because of sheer scale) to one-person startups built on shoestring budgets, communication-isolating network failures are a real risk, in addition to the variety of other failure modes (including human error) that real-world distributed systems face.

> 然而，并非所有组织都负担得起高可靠网络的成本或运维复杂度。从 Google 和 Amazon——由于规模极大，它们需要运行普通和/或低成本硬件——到靠微薄预算起步的单人创业公司，造成通信隔离的网络故障都是一种真实风险；而现实世界的分布式系统还要面对其他各种故障模式，其中也包括人为错误。

It’s important to consider this risk before a partition occurs, because it’s much easier to make decisions about partition behavior on a whiteboard than to redesign, reengineer, and upgrade a complex system in a production environment—especially when it’s throwing errors at your users. For some applications, failure is an option—but you should characterize and explicitly account for it as a part of your design. Finally, given the additional latency [1] and coordination benefits [4] of partition-aware designs, you might just find that accounting for these partitions delivers benefits in the average case as well.

> 在分区发生之前考虑这种风险非常重要，因为在白板上决定系统面对分区时应有何种行为，远比在生产环境中重新设计、重新实现并升级复杂系统容易——尤其是在系统正不断向用户抛出错误的时候。对某些应用来说，允许失败是一种选择；但你应当刻画这种失败，并在设计中明确把它考虑进去。最后，鉴于分区感知设计还能带来延迟方面 [1] 和协调方面 [4] 的额外收益，你也许会发现，把这些分区纳入考虑甚至能改善平均情况下的表现。

We invite you to contribute your own experiences with or without network partitions. Open a pull request on https://github.com/aphyr/partitions-post (which, incidentally, contains all references), leave a comment, write a blog post, or release a postmortem. Data will inform this conversation, future designs, and, ultimately, the availability of the systems on which we all depend.

> 我们邀请你贡献自己经历过或未曾经历网络分区的经验。你可以在 https://github.com/aphyr/partitions-post（顺带一提，其中包含全部参考资料）提交 pull request、留下评论、撰写博客文章，或者发布事后分析。数据将为这场讨论、未来的设计，以及最终我们所有人所依赖系统的可用性提供依据。

## References｜参考文献

1. Abadi, D. 2012. “Consistency tradeoffs in modern distributed database system design: CAP is only part of the story.” *Computer* 45(2): 37–42; http://dl.acm.org/citation.cfm?id=2360959.

> 1. Abadi, D.，2012。“现代分布式数据库系统设计中的一致性权衡：CAP 只是故事的一部分”。*Computer* 45(2)：37–42；http://dl.acm.org/citation.cfm?id=2360959。

2. Amazon Web Services. 2011. “Summary of the Amazon EC2 and Amazon RDS service disruption in the U.S. East region”; http://aws.amazon.com/message/65648/.

> 2. Amazon Web Services，2011。“Amazon EC2 与 Amazon RDS 美国东部区域服务中断总结”；http://aws.amazon.com/message/65648/。

3. Bailis, P., Davidson, A., Fekete, A., Ghodsi, A., Hellerstein, J.M., Stoica, I. 2014. “Highly available transactions: virtues and limitations.” In *Proceedings of VLDB* (to appear); http://www.bailis.org/papers/hat-vldb2014.pdf.

> 3. Bailis, P.、Davidson, A.、Fekete, A.、Ghodsi, A.、Hellerstein, J.M.、Stoica, I.，2014。“高可用事务：优点与局限”。拟发表于 *Proceedings of VLDB*；http://www.bailis.org/papers/hat-vldb2014.pdf。

4. Bailis, P., Fekete, A., Franklin, M.J., Ghodsi, A., Hellerstein, J.M., Stoica, I. 2014. “Coordination-avoiding database systems”; http://arxiv.org/abs/1402.2237.

> 4. Bailis, P.、Fekete, A.、Franklin, M.J.、Ghodsi, A.、Hellerstein, J.M.、Stoica, I.，2014。“避免协调的数据库系统”；http://arxiv.org/abs/1402.2237。

5. Bailis, P., Ghodsi, A. 2013. “Eventual consistency today: limitations, extensions, and beyond.” *ACM Queue* 11(3); http://queue.acm.org/detail.cfm?id=2462076.

> 5. Bailis, P.、Ghodsi, A.，2013。“当今的最终一致性：局限、扩展及更远处”。*ACM Queue* 11(3)；http://queue.acm.org/detail.cfm?id=2462076。

6. CityCloud. 2011; https://www.citycloud.eu/cloud-computing/post-mortem/.

> 6. CityCloud，2011；https://www.citycloud.eu/cloud-computing/post-mortem/。

7. Davidson, S.B., Garcia-Molina, H., Skeen, D. 1985. “Consistency in a partitioned network: a survey.” *ACM Computing Surveys* 17(3): 341–370; http://dl.acm.org/citation.cfm?id=5508.

> 7. Davidson, S.B.、Garcia-Molina, H.、Skeen, D.，1985。“分区网络中的一致性：综述”。*ACM Computing Surveys* 17(3)：341–370；http://dl.acm.org/citation.cfm?id=5508。

8. Dwork, C., Lynch, M., Stockmeyer, L. 1988. “Consensus in the presence of partial synchrony.” *Journal of the ACM* 35(2): 288–323; http://dl.acm.org/citation.cfm?id=42283.

> 8. Dwork, C.、Lynch, M.、Stockmeyer, L.，1988。“部分同步条件下的共识”。*Journal of the ACM* 35(2)：288–323；http://dl.acm.org/citation.cfm?id=42283。

9. Fischer, M.J., Lynch, N.A., Patterson, M.S. 1985. “Impossibility of distributed consensus with one faulty process.” *Journal of the ACM* 32(2): 374–382; http://dl.acm.org/citation.cfm?id=214121.

> 9. Fischer, M.J.、Lynch, N.A.、Patterson, M.S.，1985。“存在一个故障进程时分布式共识的不可能性”。*Journal of the ACM* 32(2)：374–382；http://dl.acm.org/citation.cfm?id=214121。

10. Fog Creek Software. 2012. “May 5–6 network maintenance post-mortem”; http://status.fogcreek.com/2012/05/may-5-6-network-maintenance-post-mortem.html.

> 10. Fog Creek Software，2012。“5 月 5–6 日网络维护事后分析”；http://status.fogcreek.com/2012/05/may-5-6-network-maintenance-post-mortem.html。

11. Gilbert, S., Lynch, N. 2002. “Brewer’s conjecture and the feasibility of consistent, available, partition-tolerant Web services.” *ACM SIGACT News* 33(2): 51–59; http://dl.acm.org/citation.cfm?id=564601.

> 11. Gilbert, S.、Lynch, N.，2002。“Brewer 猜想与一致、可用、分区容忍 Web 服务的可行性”。*ACM SIGACT News* 33(2)：51–59；http://dl.acm.org/citation.cfm?id=564601。

12. Gill, P., Jain, N., Nagappan, N. 2011. “Understanding network failures in data centers: measurement, analysis, and implications.” In *Proceedings of SIGCOMM*; http://research.microsoft.com/en-us/um/people/navendu/papers/sigcomm11netwiser.pdf.

> 12. Gill, P.、Jain, N.、Nagappan, N.，2011。“理解数据中心中的网络故障：测量、分析与影响”。收录于 *Proceedings of SIGCOMM*；http://research.microsoft.com/en-us/um/people/navendu/papers/sigcomm11netwiser.pdf。

13. Github. 2012. “Github availability this week”; https://github.com/blog/1261-github-availability-this-week.

> 13. Github，2012。“本周 Github 可用性”；https://github.com/blog/1261-github-availability-this-week。

14. Kielhofner, K. 2013. “Packets of death”; http://blog.krisk.org/2013/02/packets-of-death.html.

> 14. Kielhofner, K.，2013。“死亡数据包”；http://blog.krisk.org/2013/02/packets-of-death.html。

15. Lillich, J. 2013. “Post mortem: network issues last week”; http://www.freistil.it/2013/02/post-mortem-network-issues-last-week/.

> 15. Lillich, J.，2013。“事后分析：上周的网络问题”；http://www.freistil.it/2013/02/post-mortem-network-issues-last-week/。

16. Narayan, P.P.S. 2010. “Sherpa update”; https://developer.yahoo.com/blogs/ydn/sherpa-7992.html#4.

> 16. Narayan, P.P.S.，2010。“Sherpa 更新”；https://developer.yahoo.com/blogs/ydn/sherpa-7992.html#4。

17. Prince, M. 2013. “Today’s outage post mortem”; http://blog.cloudflare.com/todays-outage-post-mortem-82515.

> 17. Prince, M.，2013。“今日中断事后分析”；http://blog.cloudflare.com/todays-outage-post-mortem-82515。

18. Turner, D., Levchenko, K., Snoeren, A., Savage, S. 2010. “California fault lines: understanding the causes and impact of network failures.” In *Proceedings of SIGCOMM*; http://cseweb.ucsd.edu/~snoeren/papers/cenic-sigcomm10.pdf.

> 18. Turner, D.、Levchenko, K.、Snoeren, A.、Savage, S.，2010。“加州断层线：理解网络故障的成因与影响”。收录于 *Proceedings of SIGCOMM*；http://cseweb.ucsd.edu/~snoeren/papers/cenic-sigcomm10.pdf。

19. Twilio. 2013. “Billing incident post-mortem: breakdown, analysis and root cause”; http://www.twilio.com/blog/2013/07/billing-incident-post-mortem.html.

> 19. Twilio，2013。“计费事件事后分析：经过、分析与根本原因”；http://www.twilio.com/blog/2013/07/billing-incident-post-mortem.html。

## Love It, Hate It? Let Us Know｜无论喜欢还是讨厌，请告诉我们

feedback@queue.acm.org

> 反馈邮箱：feedback@queue.acm.org

## About the Authors｜关于作者

**Peter Bailis** is a graduate student of computer science and a member of the AMPLab and BOOM projects at UC Berkeley. He currently studies database and distributed systems, with a particular focus on fast and scalable data serving and transaction processing. He holds an A.B. from Harvard College and is the recipient of the NSF Graduate Research Fellowship and the Berkeley Fellowship for Graduate Study. He blogs regularly at http://bailis.org/blog and tweets as `@pbailis`.

> **Peter Bailis** 是加州大学伯克利分校计算机科学研究生，也是 AMPLab 和 BOOM 项目成员。他研究数据库与分布式系统，尤其关注快速、可扩展的数据服务和事务处理。他拥有 Harvard College 的 A.B. 学位，并获得 NSF Graduate Research Fellowship 与 Berkeley Fellowship for Graduate Study。他经常在 http://bailis.org/blog 写作，Twitter 账号为 `@pbailis`。

**Kyle Kingsbury** is the author of Riemann, Timelike, and a slew of other open-source packages. In his free time he verifies distributed systems’ safety claims as a part of the Jepsen project.

> **Kyle Kingsbury** 是 Riemann、Timelike 以及众多其他开源软件包的作者。他在业余时间通过 Jepsen 项目验证分布式系统的安全性声明。

© 2014 ACM 1542-7730/14/0700 &#36;10.00

> © 2014 ACM 1542-7730/14/0700 &#36;10.00
