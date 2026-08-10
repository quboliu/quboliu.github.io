---
lang: "zh-CN"
pubDatetime: 2025-12-14T12:00:00+08:00
modDatetime: 2026-08-10T15:33:40+08:00
timezone: "Asia/Shanghai"
title: "论文阅读 | Disaggregation: A New Architecture for Cloud Databases｜解耦：云数据库的一种新架构"
featured: false
area: "databases"
draft: false
tags:
  - "论文阅读"
  - "云原生数据库"
  - "数据库架构"
description: "Xiangyao Yu 关于云数据库从存算分离走向广义模块解耦与服务化的 2025 年论文，按语义单元编排的中英对照全文。"
---

**Disaggregation: A New Architecture for Cloud Databases｜解耦：云数据库的一种新架构**

**Xiangyao Yu**<br>
University of Wisconsin-Madison<br>
yxy@cs.wisc.edu

> **Xiangyao Yu**<br>
> 威斯康星大学麦迪逊分校<br>
> yxy@cs.wisc.edu

## ABSTRACT｜摘要

Disaggregation—the separation of database components into independently managed and scalable services—has emerged as a foundational architecture for cloud-native databases. It enables key benefits such as elasticity, resource pooling, and cost efficiency. This paper offers a perspective on the disaggregation trend, tracing its evolution, and presents a set of research efforts that redesign and optimize distributed databases in this new architecture. Finally, the paper outlines future directions and open challenges, highlighting disaggregation as a rich and still largely unexplored area for database research.

> 解耦——即把数据库组件拆分为可独立管理、独立扩展的服务——已经成为云原生数据库的一种基础架构。它带来了弹性伸缩、资源池化和成本效率等关键收益。本文从一个观察视角审视解耦趋势，追溯其演进过程，并介绍一系列面向这种新架构、重新设计和优化分布式数据库的研究工作。最后，本文概述未来方向与开放挑战，并指出解耦是数据库研究中内涵丰富、但在很大程度上仍未被探索的领域。

### PVLDB Reference Format:｜PVLDB 参考文献格式：

Xiangyao Yu. Disaggregation: A New Architecture for Cloud Databases. PVLDB, 18(12): 5527 - 5530, 2025. doi:10.14778/3750601.3760520

> Xiangyao Yu。《解耦：云数据库的一种新架构》。PVLDB，18(12)：5527 - 5530，2025。doi:10.14778/3750601.3760520

## 1 INTRODUCTION｜引言

Databases are transitioning from on-premises deployments to the cloud. Modern cloud databases adopt a disaggregation architecture where different system components, such as computation and storage layers, are managed as physically separated services. Disaggregation enables independent scaling and billing of resources, as well as resource pooling, which significantly improves cost efficiency and elasticity of cloud databases.

Disaggregation represents a fundamental architectural shift that departs from traditional assumptions in database systems. It extends distributed databases from a single tightly coupled cluster to multiple loosely coupled clusters, each responsible for a subset of database functions. This shift opens a vast new design space: rethinking classic database protocols, redistributing traditional database functions across disaggregated components, introducing new disaggregated components to enable novel features, and beyond. Optimizations for the disaggregation architecture have been explored in both research and production systems in recent years, but many challenges and research opportunities remain, especially as cloud platforms and cloud databases continue to evolve.

> 数据库正在从本地部署转向云端。现代云数据库采用解耦架构，将计算层、存储层等不同系统组件作为物理分离的服务来管理。解耦使资源能够独立伸缩、独立计费并实现池化，从而显著提高云数据库的成本效率与弹性。
>
> 解耦代表着一次根本性的架构转变，脱离了数据库系统中的传统假设。它把分布式数据库从单个紧耦合集群扩展为多个松耦合集群，每个集群负责一部分数据库功能。这一转变打开了广阔的新设计空间：重新思考经典数据库协议，在解耦组件之间重新分配传统数据库功能，引入新的解耦组件以实现新特性，等等。近年来，研究系统和生产系统都已探索针对解耦架构的优化，但仍有许多挑战与研究机会，尤其是在云平台和云数据库持续演进的背景下。

This paper aims to offer a perspective on how disaggregation is reshaping the database landscape today and potential directions for the future. The paper begins by briefly describing the key characteristics of the disaggregation architecture and its evolution, from storage disaggregation to more general disaggregation (Section 2). It then highlights several research projects from our lab that introduce new techniques to optimize for the architecture (Section 3). Finally, the paper discusses several future directions from the author’s perspective (Section 4), followed by a conclusion (Section 5).

> 本文旨在提供一个观察视角，说明解耦如今正如何重塑数据库格局，并探讨其未来可能的发展方向。文章首先简要介绍解耦架构的关键特征及其演进，即从存储解耦走向更一般化的解耦（第 2 节）；随后重点介绍本实验室的若干研究项目，这些项目提出了适应该架构的新优化技术（第 3 节）；最后从作者视角讨论若干未来方向（第 4 节），并以结论收尾（第 5 节）。

This work is licensed under the Creative Commons BY-NC-ND 4.0 International License. Visit https://creativecommons.org/licenses/by-nc-nd/4.0/ to view a copy of this license. For any use beyond those covered by this license, obtain permission by emailing info@vldb.org. Copyright is held by the owner/author(s). Publication rights licensed to the VLDB Endowment.

> 本作品依据知识共享署名—非商业性使用—禁止演绎 4.0 国际许可协议（Creative Commons BY-NC-ND 4.0 International License）授权。请访问 https://creativecommons.org/licenses/by-nc-nd/4.0/ 查看该许可协议的副本。任何超出该许可范围的使用，均须发送电子邮件至 info@vldb.org 获取许可。版权由所有者／作者持有；出版权许可给 VLDB Endowment。

Proceedings of the VLDB Endowment, Vol. 18, No. 12 ISSN 2150-8097. doi:10.14778/3750601.3760520

> 《Proceedings of the VLDB Endowment》，第 18 卷，第 12 期，ISSN 2150-8097。doi:10.14778/3750601.3760520

## 2 THE EVOLUTION OF DISAGGREGATION ARCHITECTURE｜解耦架构的演进

A key advantage of the cloud over on-premises systems is _on-demand scalability_—the capability for users to dynamically allocate and release resources and pay only for what they use. Classic database architectures, such as shared-nothing, struggle to fully exploit this feature. As a result, cloud-native databases have begun to adopt a new disaggregation architecture.

> 与本地系统相比，云的一项关键优势是*按需伸缩能力*——用户可以动态分配和释放资源，并且只为实际使用量付费。无共享（shared-nothing）等经典数据库架构很难充分利用这一特性。因此，云原生数据库开始采用新的解耦架构。

### 2.1 Storage disaggregation｜存储解耦

Early cloud-native databases, such as Snowflake [9, 22] and Aurora [20, 21], adopt a storage-disaggregation architecture, where _compute_ and _storage_ clusters are physically separated. The two clusters can scale independently and often use different cluster sizes and machine types.

The disaggregation of storage and compute is driven by the fundamental mismatches between these two services: (1) Compute is significantly more expensive than storage in modern cloud environments. (2) Compute demands fluctuate more drastically while storage demands change slowly. (3) Compute can often be stateless and thus easier to scale in contrast to the inherently stateful storage service. By decoupling these two services, the expensive compute layer can quickly scale up/down and out/in to accommodate workload changes, while the cheaper storage service can stay relatively stable with less frequent reconfigurations.

> Snowflake [9, 22] 和 Aurora [20, 21] 等早期云原生数据库采用存储解耦（即存算分离）架构，其中*计算*集群与*存储*集群在物理上相互分离。两个集群可以独立伸缩，且往往采用不同的集群规模和机器类型。
>
> 存储与计算之所以解耦，是因为这两类服务之间存在根本性错配：(1) 在现代云环境中，计算的成本显著高于存储；(2) 计算需求的波动更加剧烈，而存储需求变化缓慢；(3) 计算通常可以是无状态的，因而比天然有状态的存储服务更容易伸缩。将两类服务解耦后，昂贵的计算层可以迅速纵向扩缩与横向扩缩，以适应工作负载变化；成本较低的存储服务则可保持相对稳定，减少重新配置的频率。

Storage disaggregation resembles the traditional on-premises shared-disk architecture in that both physically separate the compute and storage components. However, cloud storage services offer richer capabilities, such as built-in high availability, multi-region durability, built-in horizontal scalability, and advanced APIs. These capabilities enable new use cases beyond what traditional shared-disk systems could support. Moreover, the principle of disaggregation can be generalized beyond compute and storage, as discussed in the next subsection.

> 存储解耦与传统本地共享磁盘（shared-disk）架构相似，因为二者都在物理上分离计算组件和存储组件。然而，云存储服务提供了更丰富的能力，例如内置高可用、跨区域持久性、内置横向伸缩能力以及高级 API。这些能力支持了传统共享磁盘系统力所不及的新用例。此外，解耦原则还可以推广到计算与存储之外，下一小节将对此展开讨论。

### 2.2 Generalized Disaggregation｜广义解耦

Besides enabling independent scalability, disaggregation can also improve the modularity of complex systems and facilitate sharing and pooling of resources, leading to higher efficiency. Driven by these salient features, modern cloud databases are being disaggregated into even more components, beyond just compute and storage. The list below shows several examples but is by no means exhaustive.

> 除了实现独立伸缩之外，解耦还可以提高复杂系统的模块化程度，并促进资源共享与池化，从而提升效率。在这些突出特性的推动下，现代云数据库正在拆分为更多彼此解耦的组件，不再局限于计算与存储。下面列举若干示例，但绝非穷尽。

**Further Disaggregated Storage.**: Socrates [3] adopts a design similar to Aurora but further disaggregates the storage layer into (1) a logging service, (2) a page cache, and (3) a durable page store. These services have different storage footprint, performance, and cost tradeoffs that can be better optimized when they are physically separated. For example, the logging service has a small data footprint but stringent write-latency requirements, and therefore can be deployed over more advanced storage technologies.

> **进一步解耦存储。**：Socrates [3] 采用与 Aurora 类似的设计，但进一步把存储层解耦为：(1) 日志服务，(2) 页面缓存，(3) 持久页面存储。这些服务在存储占用、性能和成本权衡方面各不相同，将其物理分离后可以分别进行更有针对性的优化。例如，日志服务的数据占用较小，但对写入延迟要求严格，因此可以部署在更先进的存储技术之上。（译注：原文小标题句点后又接冒号，写作 “Storage.:”；此处照录其标点结构。）

**Computation Pushdown.**: Both Redshift Spectrum [6] and S3 Select [1] introduce a serverless layer close to the storage service to process a subset of query operators, such as filtering and aggregation. Remote Compaction in RocksDB [11] pushes compaction in LSM tree to a dedicated host. The pushdown layer can execute these operators in a serverless manner with massive parallelism and high cost-efficiency. It can significantly reduce the network traffic sent to the compute layer, which improves the overall performance.

> **计算下推。**：Redshift Spectrum [6] 和 S3 Select [1] 都在靠近存储服务的位置引入无服务器层，用于处理过滤、聚合等一部分查询算子。RocksDB 的远程压实（Remote Compaction）[11] 则把 LSM 树的压实操作下推到专用主机。下推层可以无服务器方式执行这些算子，获得大规模并行能力和较高的成本效率；它能够显著减少发送到计算层的网络流量，从而改善整体性能。（译注：原文小标题句点后又接冒号，写作 “Pushdown.:”；此处照录其标点结构。）

**Intermediate Data Caching.**: Snowflake introduces a _Distributed Ephemeral Storage_ layer for spilling intermediate results [22]; the insight is that intermediate query results do not require strong durability but prefer lower access latency. Instead of using S3, a storage service specifically designed for intermediate results can make better performance and cost tradeoff.

> **中间数据缓存。**：Snowflake 引入了一个*分布式临时存储*层，用于溢写中间结果 [22]；其洞见是，中间查询结果不需要强持久性，却更看重较低的访问延迟。与使用 S3 相比，专为中间结果设计的存储服务可以在性能与成本之间作出更好的权衡。（译注：原文小标题句点后又接冒号，写作 “Caching.:”；末句 “make better performance and cost tradeoff” 的单复数和搭配也略显不规则，译文按其语义处理。）

**Metadata Layer in Lakehouse.**: The lakehouse architecture [5] introduces a metadata layer that sits between the compute and storage layers. The metadata layer can support various database functions, including transaction management [4], data quality enforcement, and data governance features, etc. Similar to the computation pushdown layer, this middle layer can handle operations that are closely tied to storage but cannot be easily pushed into the storage service itself.

> **湖仓中的元数据层。**：湖仓架构 [5] 引入了位于计算层与存储层之间的元数据层。元数据层可以支持多种数据库功能，包括事务管理 [4]、数据质量约束和数据治理功能等。与计算下推层类似，这个中间层可以处理那些与存储关系密切、却难以直接下推到存储服务内部的操作。（译注：原文小标题句点后又接冒号，写作 “Lakehouse.:”；此处照录其标点结构。）

**Memory Disaggregation.**: PolarDB [8] goes beyond storage disaggregation and further disaggregates a shared pool of remote memory. This design allows memory to be provisioned, scaled, and shared independently from compute, improving overall resource utilization and reducing memory over-provisioning. High-speed network technology such as RDMA or CXL can mitigate the increased memory access latency.

> **内存解耦。**：PolarDB [8] 超越存储解耦，进一步把共享远程内存池从计算中解耦出来。这种设计使内存可以独立于计算进行供给、伸缩与共享，从而提高整体资源利用率，并减少内存的过度供给。RDMA 或 CXL 等高速网络技术可以缓解由此增加的内存访问延迟。（译注：原文小标题句点后又接冒号，写作 “Disaggregation.:”；此处照录其标点结构。）

### 2.3 Design Tradeoff in Disaggregation Architecture｜解耦架构中的设计权衡

Disaggregation enables rich design flexibility and optimizations that were not possible in traditional monolithic database architectures. Each component in a disaggregated system can itself be a complex distributed system, offering rich functionalities. Given the large number of functions in a typical database, there exists an enormous design space for partitioning these functions into physically separated system components. Today, we are still in the early stages of exploring this design space. As cloud platforms continue to evolve, this space will likely expand further, opening up new opportunities for research and system development.

One important tradeoff in disaggregated databases is the degree of disaggregation vs. performance. Since disaggregated components are physically separated, communication between components can incur significant overhead. In general, the more aggressively a system is disaggregated, the higher performance overhead it needs to pay. In fact, with sufficient optimizations, traditional shared-nothing architecture can incur less network traffic and offer better performance than disaggregation architectures [19]. As a result, disaggregation should be applied judiciously and we should avoid disaggregating components when the resulting communication overhead cannot be justified. At the same time, this tradeoff motivates new research opportunities that can reduce communication costs between disaggregated components.

> 解耦带来了丰富的设计灵活性与优化可能，而这些在传统单体数据库架构中无法实现。解耦系统中的每个组件本身都可以是一个复杂的分布式系统，提供丰富功能。典型数据库包含大量功能，因此，如何把这些功能划分到物理分离的系统组件中，存在极其广阔的设计空间。如今，我们对这一设计空间的探索仍处于早期阶段。随着云平台不断演进，这一空间很可能继续扩展，为研究和系统开发带来新的机会。
>
> 解耦数据库的一项重要权衡，是解耦程度与性能之间的取舍。由于解耦组件在物理上相互分离，组件间通信可能带来显著开销。一般而言，系统解耦得越激进，需要付出的性能开销就越高。事实上，经过充分优化的传统无共享架构可能产生更少的网络流量，并提供优于解耦架构的性能 [19]。因此，解耦应审慎使用；如果由此产生的通信开销得不到合理回报，就应避免拆分组件。与此同时，这一权衡也催生了新的研究机会，以降低解耦组件之间的通信成本。

## 3 EXPLORING THE DESIGN SPACE OF DISAGGREGATION｜探索解耦的设计空间

In this section, I present several projects from my lab that explore the design space of disaggregated databases. These efforts revisit fundamental protocols (Section 3.1), re-architect core database functions (Section 3.2), and demonstrate how disaggregation can enable new system capabilities (Section 3.3).

> 本节介绍本实验室探索解耦数据库设计空间的若干项目。这些工作重新审视基础协议（第 3.1 节），重新设计数据库核心功能的架构（第 3.2 节），并展示解耦如何赋予系统新的能力（第 3.3 节）。

### 3.1 Rethinking Core Protocols｜重新思考核心协议

Many foundational protocols in database systems were designed with the assumption of a traditional architecture, such as shared-nothing. As a result, they need to be revisited in the context of disaggregation. One such example is the two-phase commit (2PC) protocol.

**Cornus.** 2PC is a protocol for a distributed transaction to reach a final decision (i.e., commit or abort) across participating servers. Each participant logs its own vote (i.e., VOTE-YES or VOTE-NO) locally, and a coordinator logs the final decision, which determines the transaction’s outcome. If any participant votes no, the transaction must abort. Even if all participants vote yes, the outcome may still be an abort under certain failure scenarios—for example, if the coordinator times out while waiting for votes.

A well-known limitation of 2PC is the _blocking problem_, which occurs when the coordinator fails before broadcasting the final decision. In a shared-nothing architecture, where compute and storage are tightly coupled, the coordinator’s log becomes inaccessible after a failure. As a result, the system cannot determine the transaction’s outcome or even whether a decision was made. This uncertainty forces all participants of the pending transaction to hold their locks, potentially blocking other transactions indefinitely until the failed coordinator recovers and replays its log.

> 数据库系统中的许多基础协议都以无共享等传统架构为前提进行设计。因此，需要在解耦语境下重新审视它们；两阶段提交（2PC）协议便是其中一例。
>
> **Cornus。**2PC 是一种协议，使分布式事务能够在各参与服务器之间达成最终决定（即提交或中止）。每个参与者在本地记录自己的投票（即 VOTE-YES 或 VOTE-NO），协调者则记录决定事务结果的最终决议。只要有任何参与者投反对票，事务就必须中止。即使所有参与者都投赞成票，在某些故障场景下结果仍可能是中止——例如协调者在等待投票时超时。
>
> 2PC 一个广为人知的局限是*阻塞问题*：协调者在广播最终决定之前发生故障时，就会出现这一问题。在计算与存储紧密耦合的无共享架构中，协调者故障后，其日志将无法访问。因此，系统既不能确定事务结果，甚至也无法知道是否已经作出决定。这种不确定性迫使待决事务的所有参与者继续持有锁，可能无限期阻塞其他事务，直至故障协调者恢复并重放其日志。

Fundamentally, the blocking problem exists because a failed node’s log cannot be accessed by other servers in the system. While this is true in shared-nothing systems, it is no longer the case in a storage disaggregation architecture, where storage is provided as a separate, highly available service. Even if a compute server fails, its log is stored in the storage service and remains accessible to other active servers in the system.

Cornus [13] is a 2PC protocol specifically optimized for storage disaggregation, leveraging the insight above. While the full protocol is described in detail in the original paper, its core idea is simple: Cornus allows active nodes to vote NO on behalf of failed nodes by directly writing to the failed node’s log in the disaggregated storage service. It uses a compare-and-swap-like API to ensure that only one decision can be recorded, preserving correctness. Another benefit of Cornus is that the critical execution path of 2PC is reduced from two logging events to one logging event. This optimization is viable because the ground truth of a distributed transaction is no longer determined by the coordinator’s log but the _collective votes from all participants’ log files_; this allows the removal of the coordinator’s log which reduces latency.

> 从根本上说，阻塞问题之所以存在，是因为系统中的其他服务器无法访问故障节点的日志。这在无共享系统中确实如此；但在存储解耦架构中，存储由独立的高可用服务提供，情况已不再相同。即使计算服务器发生故障，其日志仍保存在存储服务中，系统内其他活跃服务器依然可以访问。
>
> Cornus [13] 是专门针对存储解耦优化的 2PC 协议，它利用了上述洞见。完整协议在原论文中有详细描述，但其核心思想很简单：Cornus 允许活跃节点直接写入故障节点在解耦存储服务中的日志，从而代表故障节点投 NO 票。它使用一种类似比较并交换（compare-and-swap）的 API，确保只能记录一个决定，以维持正确性。Cornus 的另一个好处，是把 2PC 的关键执行路径从两次日志记录缩减为一次。之所以能这样优化，是因为分布式事务的事实依据不再由协调者日志决定，而是由*所有参与者日志文件中的集体投票*决定；因此可以移除协调者日志，降低延迟。

**Marlin.** The disaggregation in modern cloud databases mostly focus on the data planes. For the control plane, many disaggregated systems still rely on external, centralized coordination services, such as ZooKeeper [15] and etcd [2]. These coordination services lack elasticity, thereby introducing operational complexity and performance bottleneck.

> **Marlin。**现代云数据库中的解耦大多集中在数据平面。至于控制平面，许多解耦系统仍依赖 ZooKeeper [15] 和 etcd [2] 等外部集中式协调服务。这些协调服务缺乏弹性，因而带来运维复杂性和性能瓶颈。（译注：原文 “The disaggregation ... mostly focus” 存在主谓不一致，且末尾使用单数 “performance bottleneck”；英文按原样保留。）

Marlin [14] is a cloud-native coordination mechanism (i.e., the control plane) that is specifically designed for the storage disaggregation architecture. Marlin eliminates the need for external coordination services by consolidating coordination functionality into the existing cloud-native database it manages. Specifically, it stores coordination state (e.g., cluster membership, data mapping) in the disaggregated storage layer and performs coordination logic using compute-layer transaction managers. This design enables scalable, cost-efficient coordination for disaggregated databases.

To ensure correctness and efficiency, Marlin adopts a new 2PC protocol that further extends Cornus. In Marlin’s commit protocol, a participant does not have to be a compute node; instead, it can be either a compute node or a log instance in the disaggregated storage. This allows different compute nodes to initiate a reconfiguration, and enforce a global decision across multiple log files.

> Marlin [14] 是专为存储解耦架构设计的云原生协调机制（即控制平面）。Marlin 把协调功能整合进其所管理的现有云原生数据库中，从而不再需要外部协调服务。具体而言，它将协调状态（例如集群成员关系、数据映射）存入解耦存储层，并使用计算层事务管理器执行协调逻辑。这一设计为解耦数据库提供了可伸缩且具成本效率的协调能力。
>
> 为确保正确性与效率，Marlin 采用了一种在 Cornus 基础上进一步扩展的新 2PC 协议。在 Marlin 的提交协议中，参与者不必是计算节点；它既可以是计算节点，也可以是解耦存储中的日志实例。这使不同的计算节点都能发起重新配置，并在多个日志文件之间实施全局决定。

### 3.2 Disaggregating The Query Engine｜解耦查询引擎

One limitation of disaggregation architecture is the network overhead between different components. In our earlier study [19], we found that disaggregation can impose a 10× throughput degradation compared to a highly-optimized shared-nothing database due to excessive network traffic. Therefore, an important goal in disaggregated database design is to develop optimizations to mitigate the network bottleneck.

Computation pushdown is a well-established technique to reduce data traffic to the compute engine, especially when the pushdown operators are selective. The idea has been extensively explored in the context of database machines [12, 23], Smart Disk/SSD [10], processing-in-memory (PIM) [16], and cloud databases [6]. In fact, the pushdown idea fits even better in the storage disaggregation context compared to computational storage devices (e.g., Smart Disk/SSD, PIM). This is because cloud storage, as a service, has richer support for resource management, security, and data consistency, compared to hardware devices [7, 27].

> 解耦架构的一项局限是不同组件之间的网络开销。在我们此前的研究 [19] 中发现，由于网络流量过大，相比高度优化的无共享数据库，解耦可能造成吞吐量下降至原来的十分之一。因而，解耦数据库设计的一项重要目标，是开发能够缓解网络瓶颈的优化技术。
>
> 计算下推是一项成熟技术，用来减少流向计算引擎的数据流量，尤其适用于筛选性较强的下推算子。这一思路已在数据库机 [12, 23]、智能磁盘／SSD [10]、存内处理（PIM）[16] 和云数据库 [6] 等场景中得到广泛探索。事实上，与计算型存储设备（例如智能磁盘／SSD、PIM）相比，下推理念更契合存储解耦场景。这是因为，作为服务的云存储在资源管理、安全性和数据一致性方面，比硬件设备提供了更丰富的支持 [7, 27]。

**PushdownDB.** We have developed PushdownDB [28], a database engine that uses S3 Select [1], a serverless layer in front of S3, to pushdown basic operators (e.g., filter, aggregation) that are natively supported in S3 Select, and more advanced operators (e.g., group-by, top-K, probe in hash join) that we built by leveraging existing filter and aggregation support. PushdownDB can reduce query runtime by 6.7× and cost by 30%, validating the potential of the idea.

**FlexPushdownDB (FPDB).** One issue of pushdown is its inherent tension with data caching in the compute layer—another technique to reduce network traffic; most systems implement only one of these two ideas. In FlexPushdownDB (FPDB) [24], we aim to combine these two techniques in a single design. The key observation is that many common operators—such as filtering, aggregation, hash probe, etc.—can execute on both cached data locally and use pushdown to process remote data simultaneously; the results of the two execution paths can then be merged. FPDB employs a _fine-grained hybrid execution mode_ to combine the benefits of caching and pushdown, and outperforms both techniques alone by 2.2×.

> **PushdownDB。**我们开发了 PushdownDB [28]。该数据库引擎使用位于 S3 前端的无服务器层 S3 Select [1]，下推 S3 Select 原生支持的基本算子（例如过滤、聚合），并借助现有的过滤和聚合支持，实现并下推更高级的算子（例如分组、Top-K、哈希连接中的探测）。PushdownDB 可将查询运行时间缩短 6.7 倍、成本降低 30%，验证了这一思路的潜力。
>
> **FlexPushdownDB（FPDB）。**下推的一个问题，是它与计算层数据缓存之间存在内在张力；数据缓存是另一种减少网络流量的技术，而大多数系统只实现这两种思路中的一种。在 FlexPushdownDB（FPDB）[24] 中，我们试图把两种技术结合在同一个设计中。关键观察是，许多常用算子——例如过滤、聚合、哈希探测等——既可以在本地缓存数据上执行，又可以同时通过下推处理远程数据；随后再合并两条执行路径的结果。FPDB 采用*细粒度混合执行模式*，综合缓存与下推的优势，性能比单独使用任一技术高 2.2 倍。

**Adaptive Pushdown.** By default, a pushdown request does not consider the pushdown layer’s computational capacity, which can sometimes be scarce (e.g., due to multi-tenancy), causing pushdown to underperform. With adaptive pushdown [25], the pushdown layer can choose to _push back_ the task if it has no resource to execute it, and the compute layer can directly read the remote data to execute the task locally. This work also identifies two more operators that are amenable to pushdown, _selection bitmap_ and _distributed data shuffle_, which are common in distributed columnar databases. These techniques lead to 1.7–3× further speedup.

> **自适应下推。**默认情况下，下推请求不会考虑下推层的计算容量；该容量有时可能不足（例如受多租户影响），从而导致下推表现不佳。采用自适应下推 [25] 后，如果下推层没有资源执行任务，它可以选择把任务*推回*，由计算层直接读取远程数据并在本地执行。这项工作还识别出另外两种适合下推、且常见于分布式列式数据库的算子：*选择位图*与*分布式数据混洗*。这些技术进一步带来 1.7–3 倍加速。（译注：原文使用单数表达 “has no resource”；英文按原样保留，译文依语义译为“没有资源”。）

### 3.3 Enabling New Capabilities｜赋予系统新能力

Modern applications increasingly demand _real-time analytics_ so that the most up-to-date insights can be extracted from the data. Hybrid Transactional/Analytical Processing (HTAP) addresses this need by integrating TP and AP into a single engine. However, existing HTAP solutions require a compulsory migration—users need to migrate from existing TP and AP databases to a new HTAP engine, incurring extra migration cost and complexity.

**Hermes.** We aim to achieve _off-the-shelf_ real-time analytics on top of existing TP and AP engines, so that users can enjoy real-time analytics without migrating away from their existing databases running in the cloud. The key idea is to introduce a new _Hermes layer_ [17] that sits between compute and storage, that intercepts the logging events in the TP engine(s) and the read requests in the AP engine(s). Hermes will replay the recent transactional logs from TP engines and merge the updates into the analytical reads from the AP engines, such that each analytical query can see the latest updates. In the background, Hermes will merge updates in batches into the stable analytical storage.

> 现代应用对*实时分析*的需求日益增长，以便从数据中提取最新洞见。混合事务／分析处理（HTAP）通过把事务处理（TP）与分析处理（AP）集成进单一引擎来满足这一需求。然而，现有 HTAP 方案要求强制迁移——用户需要从既有 TP 和 AP 数据库迁移到新的 HTAP 引擎，由此产生额外的迁移成本与复杂性。
>
> **Hermes。**我们的目标是在现有 TP 与 AP 引擎之上实现*开箱即用*的实时分析，使用户无须迁离正在云中运行的现有数据库，便可获得实时分析能力。核心思路是在计算与存储之间引入新的 _Hermes 层_ [17]，拦截 TP 引擎中的日志事件和 AP 引擎中的读取请求。Hermes 会重放 TP 引擎最近的事务日志，并把其中的更新合并到来自 AP 引擎的分析读取中，使每个分析查询都能看到最新更新。在后台，Hermes 会分批将更新合并进稳定的分析存储。

Hermes also supports _True HTAP transactions_ [18], which are transactions that contain long-running analytical queries within. We refer to this capability as _Transactional Analytics_. Hermes allows the analytical query within a transaction to run in the AP side of the system, thereby reducing the overall execution time. Hermes can support different isolation levels for these cross-engine transactions, such as read committed, snapshot isolation, and serializability.

> Hermes 还支持*真正的 HTAP 事务* [18]，即内部包含长时间运行的分析查询的事务。我们把这种能力称为*事务分析（Transactional Analytics）*。Hermes 允许事务内的分析查询在系统的 AP 侧运行，从而缩短整体执行时间。对于这类跨引擎事务，Hermes 可以支持不同隔离级别，例如读已提交、快照隔离和可串行化。

## 4 FUTURE WORK｜未来工作

We are still in the early stage in exploring the design space of disaggregation architecture and tremendous opportunities exist ahead for the community to explore. Below are few directions that I find promising. This list is by no means exhaustive, but rather a set of initial thoughts intended to spark deeper discussion and inspire new ideas.

> 我们对解耦架构设计空间的探索仍处于早期阶段，前方存在大量机会，有待整个社区发掘。下面是我认为颇有前景的几个方向。这份清单绝非穷尽，而只是一组初步思考，旨在激发更深入的讨论和新的想法。（译注：原文 “in the early stage in exploring” 和 “Below are few directions” 的表达略显不规则；英文按原样保留。）

**Disaggregate More Database Functions.** While the disaggregation of many database functions have been studied as discussed in earlier sections, many other database functions (e.g., indexing, concurrency control, query optimization, statistics management, materialized view, etc.) remain underexplored. Moreover, many of these functions can be consolidated into a unified disaggregated component; for example, the pushdown layer, lakehouse metadata layer, and Hermes layer are all middle layers between compute and storage. The design space opens up rich research opportunities.

> **解耦更多数据库功能。**如前文所述，尽管许多数据库功能的解耦已经得到研究，但索引、并发控制、查询优化、统计信息管理、物化视图等许多其他数据库功能仍缺乏探索。此外，其中多种功能可以整合进统一的解耦组件；例如，下推层、湖仓元数据层和 Hermes 层都是位于计算与存储之间的中间层。这一设计空间带来了丰富的研究机会。（译注：原文 “the disaggregation ... have been studied” 存在主谓不一致；英文按原样保留。）

**Multi-Cloud Database.** Disaggregation architecture today largely focuses on a single cloud. When databases expand to a multi-cloud environment (e.g., multiple public clouds or hybrid public/private clouds), the cross-cloud communication overhead can be significant. This calls for the design of _multi-disaggregated systems_, where components are disaggregated within each cloud but the communication between clouds must be a first-class design consideration.

> **多云数据库。**当前的解耦架构主要聚焦于单一云。当数据库扩展到多云环境（例如多个公有云，或公有云／私有云混合环境）时，跨云通信开销可能十分显著。这就要求设计*多重解耦系统*：组件在每个云内部彼此解耦，同时必须把云间通信作为一等设计考量。

**Embrace New Hardware.**: Disaggregation naturally facilitates the adoption of new hardware, such as GPU, FPDB, RDMA, CXL, since different components can use different hardware for the best performance cost tradeoff. This flexibility opens up even further research and development opportunities. For example, in our own research, we use GPU to replace the execution engine of DuckDB and achieve significant speedup by leveraging the massive parallelism of GPU hardware [26].

> **拥抱新硬件。**：解耦天然有利于采用 GPU、FPDB、RDMA、CXL 等新硬件，因为不同组件可以使用不同硬件，以取得最佳的性能—成本权衡。这种灵活性进一步带来了研究与开发机会。例如，在我们自己的研究中，我们用 GPU 替换 DuckDB 的执行引擎，并借助 GPU 硬件的大规模并行能力获得显著加速 [26]。（译注：原文将 “FPDB” 与 GPU、RDMA、CXL 并列为硬件；此处疑似本应为 “FPGA”，但为避免静默纠错，英文和译文均保留 “FPDB”。原文小标题句点后又接冒号，写作 “Hardware.:”，亦照录。）

## 5 CONCLUSION｜结论

Disaggregation is emerging as the new architectural trend for cloud-native databases, offering new opportunities and challenges for performance, cost efficiency, elasticity, and modularity. We are still in the early stages of exploring this paradigm, and the design space remains vast and largely unexplored. Now is a great time for the community to rethink traditional assumptions and build a new system foundation for disaggregated cloud databases.

> 解耦正在成为云原生数据库新的架构趋势，在性能、成本效率、弹性和模块化方面带来新的机会与挑战。我们对这一范式的探索仍处于早期阶段，其设计空间依然广阔，并且大部分尚未被探索。现在正是整个社区重新思考传统假设、为解耦云数据库构筑新系统基础的好时机。

## ACKNOWLEDGMENTS｜致谢

The work presented in this paper was mainly done by my outstanding PhD students Zhihan Guo, Elena Milkai, Yifei Yang, and Wenjie Hu. I would like to thank Michael Stonebraker for his invaluable mentoring, guidance, and collaboration over the years. I was fortunate to work with many amazing collaborators, most notably Philip Bernstein, Mahesh Balakrishnan, Jignesh Patel, Marco Serafini, and Ashraf Aboulnaga. I want to thank AnHai Doan, Joseph Hellerstein, Andrew Pavlo, Samuel Madden, and Daniel Abadi for their constant encouragement and support during my early research career. This research was funded in part by the NSF CAREER Award IIS-2144588 and NSF Award STTR-2135007, a Sloan fellowship, a Microsoft Research PhD Fellowship, the Wisconsin Alumni Research Foundation (WARF), gifts from Google and Snowflake, and donations from UW–Madison alumni.

> 本文介绍的工作主要由我杰出的博士生 Zhihan Guo、Elena Milkai、Yifei Yang 和 Wenjie Hu 完成。感谢 Michael Stonebraker 多年来给予我的宝贵教诲、指导与合作。我有幸与许多出色的合作者共事，其中尤其包括 Philip Bernstein、Mahesh Balakrishnan、Jignesh Patel、Marco Serafini 和 Ashraf Aboulnaga。感谢 AnHai Doan、Joseph Hellerstein、Andrew Pavlo、Samuel Madden 和 Daniel Abadi 在我研究生涯早期始终给予鼓励与支持。本研究的部分经费来自美国国家科学基金会 CAREER 奖 IIS-2144588、NSF 奖 STTR-2135007、斯隆研究奖、微软研究院博士奖学金、威斯康星校友研究基金会（WARF）、Google 与 Snowflake 的赠款，以及威斯康星大学麦迪逊分校校友的捐赠。

## REFERENCES｜参考文献

[1] [n.d.]. S3 Select and Glacier Select – Retrieving subsets of objects. https://aws.amazon.com/blogs/aws/s3-glacier-select. Accessed: 2025-08-07.

> [1] [无日期]。S3 Select 与 Glacier Select——检索对象的子集。https://aws.amazon.com/blogs/aws/s3-glacier-select。访问日期：2025-08-07。

[2] 2024. etcd. https://etcd.io. Accessed: 2025-08-07.

> [2] 2024。etcd。https://etcd.io。访问日期：2025-08-07。

[3] Panagiotis Antonopoulos, Alex Budovski, Cristian Diaconu, Alejandro Hernandez Saenz, Jack Hu, Hanuma Kodavalla, Donald Kossmann, Sandeep Lingam, Umar Farooq Minhas, Naveen Prakash, et al. 2019. Socrates: The new sql server in the cloud. In SIGMOD. 1743–1756.

> [3] Panagiotis Antonopoulos、Alex Budovski、Cristian Diaconu、Alejandro Hernandez Saenz、Jack Hu、Hanuma Kodavalla、Donald Kossmann、Sandeep Lingam、Umar Farooq Minhas、Naveen Prakash 等。2019。Socrates：云中的新型 SQL 服务器。载于 SIGMOD。1743–1756。

[4] Michael Armbrust, Tathagata Das, Liwen Sun, Burak Yavuz, Shixiong Zhu, Mukul Murthy, Joseph Torres, Herman van Hovell, Adrian Ionescu, Alicja Łuszczak, et al. 2020. Delta lake: high-performance ACID table storage over cloud object stores. VLDB 13, 12 (2020), 3411–3424.

> [4] Michael Armbrust、Tathagata Das、Liwen Sun、Burak Yavuz、Shixiong Zhu、Mukul Murthy、Joseph Torres、Herman van Hovell、Adrian Ionescu、Alicja Łuszczak 等。2020。Delta Lake：云对象存储之上的高性能 ACID 表存储。VLDB 13，12（2020），3411–3424。

[5] Michael Armbrust, Ali Ghodsi, Reynold Xin, Matei Zaharia, et al. 2021. Lakehouse: a new generation of open platforms that unify data warehousing and advanced analytics. In CIDR, Vol. 8. 28.

> [5] Michael Armbrust、Ali Ghodsi、Reynold Xin、Matei Zaharia 等。2021。湖仓：统一数据仓库与高级分析的新一代开放平台。载于 CIDR，第 8 卷。28。

[6] Nikos Armenatzoglou, Sanuj Basu, Naga Bhanoori, Mengchu Cai, Naresh Chainani, Kiran Chinta, Venkatraman Govindaraju, Todd J Green, Monish Gupta, Sebastian Hillig, et al. 2022. Amazon Redshift re-invented. In SIGMOD. 2205–2217.

> [6] Nikos Armenatzoglou、Sanuj Basu、Naga Bhanoori、Mengchu Cai、Naresh Chainani、Kiran Chinta、Venkatraman Govindaraju、Todd J Green、Monish Gupta、Sebastian Hillig 等。2022。Amazon Redshift 重塑。载于 SIGMOD。2205–2217。

[7] Antonio Barbalace and Jaeyoung Do. 2021. Computational storage: Where are we today?. In CIDR.

> [7] Antonio Barbalace、Jaeyoung Do。2021。计算存储：我们今天身处何处？载于 CIDR。（译注：原文问号后又接句点，写作 “today?.”；此处照录。）

[8] Wei Cao, Yingqiang Zhang, Xinjun Yang, Feifei Li, Sheng Wang, Qingda Hu, Xuntao Cheng, Zongzhi Chen, Zhenjun Liu, Jing Fang, et al. 2021. Polardb serverless: A cloud native database for disaggregated data centers. In SIGMOD. 2477–2489.

> [8] Wei Cao、Yingqiang Zhang、Xinjun Yang、Feifei Li、Sheng Wang、Qingda Hu、Xuntao Cheng、Zongzhi Chen、Zhenjun Liu、Jing Fang 等。2021。PolarDB Serverless：面向解耦数据中心的云原生数据库。载于 SIGMOD。2477–2489。

[9] Benoit Dageville, Thierry Cruanes, Marcin Zukowski, Vadim Antonov, Artin Avanes, Jon Bock, Jonathan Claybaugh, Daniel Engovatov, Martin Hentschel, Jiansheng Huang, Allison W. Lee, Ashish Motivala, Abdul Q. Munir, Steven Pelley, Peter Povinec, Greg Rahn, Spyridon Triantafyllis, and Philipp Unterbrunner. 2016. The Snowflake Elastic Data Warehouse. In SIGMOD. 215–226.

> [9] Benoit Dageville、Thierry Cruanes、Marcin Zukowski、Vadim Antonov、Artin Avanes、Jon Bock、Jonathan Claybaugh、Daniel Engovatov、Martin Hentschel、Jiansheng Huang、Allison W. Lee、Ashish Motivala、Abdul Q. Munir、Steven Pelley、Peter Povinec、Greg Rahn、Spyridon Triantafyllis、Philipp Unterbrunner。2016。Snowflake 弹性数据仓库。载于 SIGMOD。215–226。

[10] Jaeyoung Do, Yang-Suk Kee, Jignesh M. Patel, Chanik Park, Kwanghyun Park, and David J. DeWitt. 2013. Query Processing on Smart SSDs: Opportunities and Challenges. In SIGMOD. 1221–1230.

> [10] Jaeyoung Do、Yang-Suk Kee、Jignesh M. Patel、Chanik Park、Kwanghyun Park、David J. DeWitt。2013。智能 SSD 上的查询处理：机遇与挑战。载于 SIGMOD。1221–1230。

[11] Siying Dong, Shiva Shankar P, Satadru Pan, Anand Ananthabhotla, Dhanabal Ekambaram, Abhinav Sharma, Shobhit Dayal, Nishant Vinaybhai Parikh, Yanqin Jin, Albert Kim, et al. 2023. Disaggregating rocksdb: A production experience. In SIGMOD, Vol. 1. ACM New York, NY, USA, 1–24.

> [11] Siying Dong、Shiva Shankar P、Satadru Pan、Anand Ananthabhotla、Dhanabal Ekambaram、Abhinav Sharma、Shobhit Dayal、Nishant Vinaybhai Parikh、Yanqin Jin、Albert Kim 等。2023。解耦 RocksDB：一次生产实践。载于 SIGMOD，第 1 卷。ACM，美国纽约州纽约市，1–24。

[12] Phil Francisco. 2011. The Netezza Data Appliance Architecture.

> [12] Phil Francisco。2011。Netezza 数据设备架构。

[13] Zhihan Guo, Xinyu Zeng, Kan Wu, Wuh-Chwen Hwang, Ziwei Ren, Xiangyao Yu, Mahesh Balakrishnan, and Philip A Bernstein. 2022. Cornus: Atomic commit for a cloud DBMS with storage disaggregation. VLDB 16, 2 (2022), 379–392.

> [13] Zhihan Guo、Xinyu Zeng、Kan Wu、Wuh-Chwen Hwang、Ziwei Ren、Xiangyao Yu、Mahesh Balakrishnan、Philip A Bernstein。2022。Cornus：面向存储解耦云 DBMS 的原子提交。VLDB 16，2（2022），379–392。

[14] Wenjie Hu, Guanzhou Hu, Mahesh Balakrishnan, and Xiangyao Yu. 2026. Marlin: Efficient Coordination for Autoscaling Cloud DBMS. In SIGMOD.

> [14] Wenjie Hu、Guanzhou Hu、Mahesh Balakrishnan、Xiangyao Yu。2026。Marlin：面向自动伸缩云 DBMS 的高效协调。载于 SIGMOD。

[15] Patrick Hunt, Mahadev Konar, Flavio P Junqueira, and Benjamin Reed. 2010. {ZooKeeper}: Wait-free coordination for internet-scale systems. In USENIX ATC.

> [15] Patrick Hunt、Mahadev Konar、Flavio P Junqueira、Benjamin Reed。2010。{ZooKeeper}：面向互联网规模系统的无等待协调。载于 USENIX ATC。

[16] Tiago R. Kepe, Eduardo C. de Almeida, and Marco A. Z. Alves. 2019. Database Processing-in-Memory: An Experimental Study. VLDB 13, 3 (2019), 334–347.

> [16] Tiago R. Kepe、Eduardo C. de Almeida、Marco A. Z. Alves。2019。数据库存内处理：一项实验研究。VLDB 13，3（2019），334–347。

[17] Elena Milkai, Xiangyao Yu, and Jignesh Patel. 2025. Hermes: Off-the-Shelf Real-Time Transactional Analytics. VLDB (2025).

> [17] Elena Milkai、Xiangyao Yu、Jignesh Patel。2025。Hermes：开箱即用的实时事务分析。VLDB（2025）。

[18] Fatma Özcan, Yuanyuan Tian, and Pinar Tözün. 2017. Hybrid transactional/analytical processing: A survey. In SIGMOD. 1771–1775.

> [18] Fatma Özcan、Yuanyuan Tian、Pinar Tözün。2017。混合事务／分析处理：综述。载于 SIGMOD。1771–1775。

[19] Junjay Tan, Thanaa Ghanem, Matthew Perron, Xiangyao Yu, Michael Stonebraker, David DeWitt, Marco Serafini, Ashraf Aboulnaga, and Tim Kraska. 2019. Choosing A Cloud DBMS: Architectures and Tradeoffs. VLDB 12, 12 (2019), 2170–2182.

> [19] Junjay Tan、Thanaa Ghanem、Matthew Perron、Xiangyao Yu、Michael Stonebraker、David DeWitt、Marco Serafini、Ashraf Aboulnaga、Tim Kraska。2019。选择云 DBMS：架构与权衡。VLDB 12，12（2019），2170–2182。

[20] Alexandre Verbitski, Anurag Gupta, Debanjan Saha, Murali Brahmadesam, Kamal Gupta, Raman Mittal, Sailesh Krishnamurthy, Sandor Maurice, Tengiz Kharatishvili, and Xiaofeng Bao. 2017. Amazon Aurora: Design Considerations for High Throughput Cloud-Native Relational Databases. In SIGMOD. 1041–1052.

> [20] Alexandre Verbitski、Anurag Gupta、Debanjan Saha、Murali Brahmadesam、Kamal Gupta、Raman Mittal、Sailesh Krishnamurthy、Sandor Maurice、Tengiz Kharatishvili、Xiaofeng Bao。2017。Amazon Aurora：高吞吐云原生关系数据库的设计考量。载于 SIGMOD。1041–1052。

[21] Alexandre Verbitski, Anurag Gupta, Debanjan Saha, James Corey, Kamal Gupta, Murali Brahmadesam, Raman Mittal, Sailesh Krishnamurthy, Sandor Maurice, Tengiz Kharatishvilli, et al. 2018. Amazon Aurora: On Avoiding Distributed Consensus for I/Os, Commits, and Membership Changes. In SIGMOD. 789–796.

> [21] Alexandre Verbitski、Anurag Gupta、Debanjan Saha、James Corey、Kamal Gupta、Murali Brahmadesam、Raman Mittal、Sailesh Krishnamurthy、Sandor Maurice、Tengiz Kharatishvilli 等。2018。Amazon Aurora：避免为 I/O、提交和成员关系变更进行分布式共识。载于 SIGMOD。789–796。

[22] Midhul Vuppalapati, Justin Miron, Rachit Agarwal, Dan Truong, Ashish Motivala, and Thierry Cruanes. 2020. Building an Elastic Query Engine on Disaggregated Storage. In NSDI. 449–462.

> [22] Midhul Vuppalapati、Justin Miron、Rachit Agarwal、Dan Truong、Ashish Motivala、Thierry Cruanes。2020。在解耦存储之上构建弹性查询引擎。载于 NSDI。449–462。

[23] Ronald Weiss. 2012. A Technical Overview of the Oracle Exadata Database Machine and Exadata Storage Server. Oracle White Paper. (2012).

> [23] Ronald Weiss。2012。Oracle Exadata 数据库机与 Exadata 存储服务器技术概览。Oracle 白皮书。（2012）。

[24] Yifei Yang, Matt Youill, Matthew Woicik, Yizhou Liu, Xiangyao Yu, Marco Serafini, Ashraf Aboulnaga, and Michael Stonebraker. 2021. FlexPushdownDB: Hybrid Pushdown and Caching in a Cloud DBMS. VLDB 14, 11 (2021), 2101–2113.

> [24] Yifei Yang、Matt Youill、Matthew Woicik、Yizhou Liu、Xiangyao Yu、Marco Serafini、Ashraf Aboulnaga、Michael Stonebraker。2021。FlexPushdownDB：云 DBMS 中的混合下推与缓存。VLDB 14，11（2021），2101–2113。

[25] Yifei Yang, Xiangyao Yu, Marco Serafini, Ashraf Aboulnaga, and Michael Stonebraker. 2024. FlexpushdownDB: rethinking computation pushdown for cloud OLAP DBMSs. VLDB Journal 33, 5 (2024), 1643–1670.

> [25] Yifei Yang、Xiangyao Yu、Marco Serafini、Ashraf Aboulnaga、Michael Stonebraker。2024。FlexpushdownDB：重新思考云 OLAP DBMS 的计算下推。VLDB Journal 33，5（2024），1643–1670。

[26] Bobbi Yogatama, Yifei Yang, Kevin Kristensen, Devesh Sarda, Abigale Kim, Adrian Cockcroft, Yu Teng, Joshua Patterson, Gregory Kimball, Wes McKinney, Weiwei Gong, and Xiangyao Yu. 2025. Rethinking Analytical Processing in the GPU Era. arXiv preprint arXiv:2508.04701 (2025).

> [26] Bobbi Yogatama、Yifei Yang、Kevin Kristensen、Devesh Sarda、Abigale Kim、Adrian Cockcroft、Yu Teng、Joshua Patterson、Gregory Kimball、Wes McKinney、Weiwei Gong、Xiangyao Yu。2025。重新思考 GPU 时代的分析处理。arXiv 预印本 arXiv:2508.04701（2025）。

[27] Xiangyao Yu. 2022. Computation Pushdown across Layers in the Storage Hierarchy. https://www.sigarch.org/computation-pushdown-across-layers-in-the-storage-hierarchy. Accessed: 2025-08-07.

> [27] Xiangyao Yu。2022。跨越存储层次结构各层的计算下推。https://www.sigarch.org/computation-pushdown-across-layers-in-the-storage-hierarchy。访问日期：2025-08-07。

[28] Xiangyao Yu, Matt Youill, Matthew Woicik, Abdurrahman Ghanem, Marco Serafini, Ashraf Aboulnaga, and Michael Stonebraker. 2020. PushdownDB: Accelerating a DBMS using S3 Computation. In ICDE. 1802–1805.

> [28] Xiangyao Yu、Matt Youill、Matthew Woicik、Abdurrahman Ghanem、Marco Serafini、Ashraf Aboulnaga、Michael Stonebraker。2020。PushdownDB：使用 S3 计算加速 DBMS。载于 ICDE。1802–1805。
