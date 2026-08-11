---
lang: "zh-CN"
pubDatetime: 2024-08-25T12:00:00+08:00
modDatetime: 2026-08-10T21:05:34+08:00
timezone: "Asia/Shanghai"
title: "论文阅读 | Borg, Omega, and Kubernetes｜从 Borg、Omega 到 Kubernetes"
contentType: "paper-translation"
featured: false
area: "kubernetes"
draft: false
tags:
  - "论文阅读"
  - "Kubernetes"
  - "Borg"
  - "Omega"
  - "容器编排"
  - "分布式系统"
description: "ACM Queue 经典文章中英对照精读：回顾 Google 从 Borg、Omega 到 Kubernetes 的十年演进，以及容器、声明式 API、控制循环和系统边界背后的经验。"
---
> **Original publication｜原文信息**
>
> Brendan Burns, Brian Grant, David Oppenheimer, Eric Brewer, and John Wilkes. “Borg, Omega, and Kubernetes.” *ACM Queue*, 14 (2016), pp. 70–93. [Google Research](https://research.google/pubs/borg-omega-and-kubernetes/) · [Archived PDF](https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/44843.pdf)
>
> Source PDF SHA-256: `0679da43280d8c3903eb23b1516b92087c3168430ff2a65e70e0e426a86a5a4b`. The article contains no figures or tables. The pull quotes and author biographies visible in the PDF are retained below.
>
> 原文发表于 2016 年《ACM Queue》，共 24 页。本文以 Google Research 提供的 PDF 为唯一排版与文字依据，完整保留正文、两处侧栏摘引、7 条参考文献、作者简介与版权信息，并按语义单元在英文后紧接中文译文。

---

**Borg, Omega, and Kubernetes｜从 Borg、Omega 到 Kubernetes**

**Lessons learned from three container-management systems over a decade｜十年三代容器管理系统的经验教训**

**Brendan Burns, Brian Grant, David Oppenheimer, Eric Brewer, and John Wilkes, Google Inc.**

> **Brendan Burns、Brian Grant、David Oppenheimer、Eric Brewer、John Wilkes，Google Inc.**

<!-- PDF pages 1–3 -->

Though widespread interest in software containers is a relatively recent phenomenon, at Google we have been managing Linux containers at scale for more than ten years and built three different container-management systems in that time. Each system was heavily influenced by its predecessors, even though they were developed for different reasons. This article describes the lessons we’ve learned from developing and operating them.

The first unified container-management system developed at Google was the system we internally call Borg.<sup>7</sup> It was built to manage both long-running services and batch jobs, which had previously been handled by two separate systems: Babysitter and the Global Work Queue. The latter’s architecture strongly influenced Borg, but was focused on batch jobs; both predated Linux control groups. Borg shares machines between these two types of applications as a way of increasing resource utilization and thereby reducing costs. Such sharing was possible because container support in the Linux kernel was becoming available (indeed, Google contributed much of the container code to the Linux kernel), which enabled better isolation between latency-sensitive user-facing services and CPU-hungry batch processes.

> 尽管软件容器受到广泛关注还是相对较近的现象，但 Google 已经规模化管理 Linux 容器十余年，并在此期间构建了三套不同的容器管理系统。三者虽然出于不同原因而开发，却都深受前代系统影响。本文总结我们在开发和运行这些系统时获得的经验。
>
> Google 开发的第一套统一容器管理系统，就是内部称为 Borg 的系统。<sup>7</sup> 它用于同时管理长时间运行的服务和批处理作业；此前，这两类工作分别由 Babysitter 与 Global Work Queue 两套系统处理。后者的架构对 Borg 影响很深，但重点在批处理作业上；两套系统出现时都早于 Linux 控制组。Borg 让这两类应用共享机器，以提高资源利用率并降低成本。之所以能够共享，是因为 Linux 内核开始具备容器支持——事实上，Google 为 Linux 内核贡献了相当一部分容器代码——从而能够更好地隔离对延迟敏感的面向用户服务与大量消耗 CPU 的批处理进程。

As more and more applications were developed to run on top of Borg, our application and infrastructure teams developed a broad ecosystem of tools and services for it. These systems provided mechanisms for configuring and updating jobs; predicting resource requirements; dynamically pushing configuration files to running jobs; service discovery and load balancing; auto-scaling; machine-lifecycle management; quota management; and much more. The development of this ecosystem was driven by the needs of different teams inside Google, and the result was a somewhat heterogeneous, ad-hoc collection of systems that Borg’s users had to configure and interact with, using several different configuration languages and processes. Borg remains the primary container-management system within Google because of its scale, breadth of features, and extreme robustness.

Omega,<sup>6</sup> an offspring of Borg, was driven by a desire to improve the software engineering of the Borg ecosystem. It applied many of the patterns that had proved successful in Borg, but was built from the ground up to have a more consistent, principled architecture. Omega stored the state of the cluster in a centralized Paxos-based transaction-oriented store that was accessed by the different parts of the cluster control plane (such as schedulers), using optimistic concurrency control to handle the occasional conflicts. This decoupling allowed the Borgmaster’s functionality to be broken into separate components that acted as peers, rather than funneling every change through a monolithic, centralized master. Many of Omega’s innovations (including multiple schedulers) have since been folded into Borg.

> 随着越来越多的应用构建在 Borg 之上，应用与基础设施团队围绕它开发出庞大的工具和服务生态。这些系统提供了作业配置与更新、资源需求预测、向运行中作业动态推送配置文件、服务发现与负载均衡、自动扩缩容、机器生命周期管理、配额管理等众多机制。这个生态由 Google 内部不同团队的需求驱动，最终形成了一组较为异构、临时拼接的系统；Borg 用户不得不使用多种配置语言和流程来配置并操作它们。凭借规模、广泛的功能和极强的稳健性，Borg 至今仍是 Google 内部主要的容器管理系统。
>
> Omega<sup>6</sup> 脱胎于 Borg，其动力是改善 Borg 生态的软件工程质量。它沿用了许多已在 Borg 中证明成功的模式，但从零开始构建，以获得更加一致、更有原则的架构。Omega 把集群状态存放在一个集中式、基于 Paxos、面向事务的存储中；调度器等控制平面组件访问该存储，并以乐观并发控制处理偶发冲突。这种解耦让 Borgmaster 的功能可以拆成彼此平等的独立组件，不必再让每项变更都流经单体的集中式主节点。Omega 的许多创新——包括多调度器——后来也被纳入 Borg。

The third container-management system developed at Google was Kubernetes.<sup>4</sup> It was conceived of and developed in a world where external developers were becoming interested in Linux containers, and Google had developed a growing business selling public-cloud infrastructure. Kubernetes is open source—a contrast to Borg and Omega, which were developed as purely Google-internal systems. Like Omega, Kubernetes has at its core a shared persistent store, with components watching for changes to relevant objects. In contrast to Omega, which exposes the store directly to trusted control-plane components, state in Kubernetes is accessed exclusively through a domain-specific REST API that applies higher-level versioning, validation, semantics, and policy, in support of a more diverse array of clients. More importantly, Kubernetes was developed with a stronger focus on the experience of developers writing applications that run in a cluster: its main design goal is to make it easy to deploy and manage complex distributed systems, while still benefiting from the improved utilization that containers enable.

This article describes some of the knowledge gained and lessons learned during Google’s journey from Borg to Kubernetes.

> Google 开发的第三套容器管理系统是 Kubernetes。<sup>4</sup> 它诞生并成长于这样一个环境：外部开发者开始关注 Linux 容器，Google 出售公有云基础设施的业务也日益壮大。Kubernetes 是开源的，这与纯粹作为 Google 内部系统开发的 Borg 和 Omega 不同。与 Omega 一样，Kubernetes 以共享持久化存储为核心，各组件监视相关对象的变化。Omega 直接向可信的控制平面组件暴露存储；Kubernetes 则不同，所有状态只能通过领域专用的 REST API 访问，该 API 在存储之上施加更高层次的版本管理、校验、语义和策略，以支持更多样的客户端。更重要的是，Kubernetes 更加重视集群应用开发者的体验：它的主要设计目标，是让复杂分布式系统易于部署和管理，同时继续享受容器提高资源利用率所带来的收益。
>
> 本文介绍 Google 从 Borg 走向 Kubernetes 的过程中积累的一部分认识与经验。

## Containers｜容器

<!-- PDF pages 3–5 -->

Historically, the first containers just provided isolation of the root file system (via chroot), with FreeBSD jails extending this to additional namespaces such as process IDs. Solaris subsequently pioneered and explored many enhancements. Linux control groups (cgroups) adopted many of these ideas, and development in this area continues today.

The resource isolation provided by containers has enabled Google to drive utilization significantly higher than industry norms. For example, Borg uses containers to co-locate batch jobs with latency-sensitive, user-facing jobs on the same physical machines. The user-facing jobs reserve more resources than they usually need—allowing them to handle load spikes and fail-over—and these mostly-unused resources can be reclaimed to run batch jobs. Containers provide the resource-management tools that make this possible, as well as robust kernel-level resource isolation to prevent the processes from interfering with one another. We achieved this by enhancing Linux containers concurrently with Borg’s development. The isolation is not perfect, though: containers cannot prevent interference in resources that the operating-system kernel doesn’t manage, such as level 3 processor caches and memory bandwidth, and containers need to be supported by an additional security layer (such as virtual machines) to protect against the kinds of malicious actors found in the cloud.

> 最早的容器只通过 `chroot` 隔离根文件系统，FreeBSD jail 又把隔离扩展到进程 ID 等其他命名空间。Solaris 随后率先探索了许多增强能力。Linux 控制组（cgroup）吸收了其中不少思想，这一领域直到今天仍在发展。
>
> 容器提供的资源隔离，使 Google 能够把资源利用率推到显著高于行业常态的水平。例如，Borg 利用容器把批处理作业和对延迟敏感、面向用户的作业共同放在同一台物理机上。面向用户的作业会预留多于日常所需的资源，以应对负载突增和故障转移；这些大多闲置的资源则可以回收给批处理作业使用。容器既提供了实现这一点所需的资源管理工具，也通过稳健的内核级资源隔离防止进程相互干扰。我们在开发 Borg 的同时增强 Linux 容器，才获得了这种能力。不过隔离并不完美：对于操作系统内核没有管理的资源，例如三级处理器缓存与内存带宽，容器无法阻止干扰；面对云环境中的恶意行为者，容器还需要虚拟机等额外安全层的支撑。

A modern container is more than just an isolation mechanism: it also includes an image—the files that make up the application that runs inside the container. Within Google, MPM (Midas Package Manager) is used to build and deploy container images. The same symbiotic relationship between the isolation mechanism and MPM packages can be found between the Docker daemon and the Docker image registry. In the remainder of this article we use the word container to encompass both of these aspects: the runtime isolation and the image.

> 现代容器不只是一种隔离机制，还包括镜像——也就是构成容器内应用的文件。在 Google 内部，MPM（Midas Package Manager）用于构建和部署容器镜像。隔离机制与 MPM 软件包之间的这种共生关系，也存在于 Docker daemon 与 Docker 镜像仓库之间。本文余下部分所说的“容器”，同时涵盖运行时隔离与镜像这两个方面。

## Application-oriented infrastructure｜面向应用的基础设施

<!-- PDF pages 5–10 -->

Over time it became clear that the benefits of containerization go beyond merely enabling higher levels of utilization. Containerization transforms the data center from being machine-oriented to being application-oriented. This section discusses two examples:

* Containers encapsulate the application environment, abstracting away many details of machines and operating systems from the application developer and the deployment infrastructure.
* Because well-designed containers and container images are scoped to a single application, managing containers means managing applications rather than machines. This shift of management APIs from machine-oriented to application oriented dramatically improves application deployment and introspection.

> 随着时间推移，我们逐渐认识到，容器化的收益远不止提高资源利用率。容器化把数据中心从“以机器为中心”转变为“以应用为中心”。以下是两个例子：
>
> * 容器封装应用环境，为应用开发者和部署基础设施屏蔽机器及操作系统的诸多细节。
> * 设计良好的容器与容器镜像只面向单个应用，因此管理容器就是管理应用，而非管理机器。管理 API 从面向机器转向面向应用，显著改善了应用部署和内省能力。

### Application environment｜应用环境

The original purpose of the cgroup, chroot, and namespace facilities in the kernel was to protect applications from noisy, nosey, and messy neighbors. Combining these with container images created an abstraction that also isolates applications from the (heterogeneous) operating systems on which they run. This decoupling of image and OS makes it possible to provide the same deployment environment in both development and production, which, in turn, improves deployment reliability and speeds up development by reducing inconsistencies and friction.

The key to making this abstraction work is having a hermetic container image that can encapsulate almost all of an application’s dependencies into a package that can be deployed into the container. If this is done correctly, the only local external dependencies will be on the Linux kernel system-call interface. While this limited interface dramatically improves the portability of images, it is not perfect: applications can still be exposed to churn in the OS interface, particularly in the wide surface area exposed by socket options, `/proc`, and arguments to `ioctl` calls. Our hope is that ongoing efforts such as the Open Container Initiative (<https://www.opencontainers.org/>) will further clarify the surface area of the container abstraction.

> 内核中 cgroup、`chroot` 和 namespace 机制的初衷，是保护应用免受吵闹、窥探或混乱的“邻居”干扰。把这些机制与容器镜像结合起来后，得到了一种还能把应用与其运行所在的异构操作系统隔离开的抽象。镜像与操作系统的解耦，使开发环境和生产环境可以采用相同的部署环境；一致性提高、摩擦减少，进而提升了部署可靠性，也加快了开发速度。
>
> 让这种抽象成立的关键，是拥有一个封闭自足的容器镜像，能够把应用几乎所有依赖都封装进可部署到容器的软件包。若能正确做到这一点，应用在本地唯一的外部依赖就是 Linux 内核系统调用接口。这个有限接口大幅提升了镜像的可移植性，但仍不完美：操作系统接口的变化依旧可能波及应用，尤其是 socket 选项、`/proc` 和 `ioctl` 调用参数所暴露的广阔表面。我们希望 Open Container Initiative（<https://www.opencontainers.org/>）等持续推进的工作，能够进一步厘清容器抽象的边界。

Nonetheless, the isolation and dependency minimization provided by containers have proved quite effective at Google, and the container has become the sole runnable entity supported by the Google infrastructure. One consequence is that Google has only a small number of OS versions deployed across its entire fleet of machines at any one time, and it needs only a small staff of people to maintain them and push out new versions.

There are many ways to achieve these hermetic images. In Borg, program binaries are statically linked at build time to known-good library versions hosted in the company-wide repository.<sup>5</sup> Even so, the Borg container image is not quite as airtight as it could have been: applications share a so-called base image that is installed once on the machine rather than being packaged in each container. This base image contains utilities such as `tar` and the `libc` library, so upgrades to the base image can affect running applications and have occasionally been a significant source of trouble.

More modern container image formats such as Docker and ACI harden this abstraction further and get closer to the hermetic ideal by eliminating implicit host OS dependencies and requiring an explicit user command to share image data between containers.

> 尽管如此，容器提供的隔离与依赖最小化在 Google 被证明非常有效，容器也成为 Google 基础设施唯一支持的可运行实体。结果之一是：任何时刻，Google 整个机器集群只需部署少数几个操作系统版本，也只需要一支很小的团队来维护它们并发布新版本。
>
> 实现这种封闭自足镜像的方式很多。在 Borg 中，程序二进制文件会在构建时，与公司级仓库中已知可靠版本的库进行静态链接。<sup>5</sup> 即便如此，Borg 容器镜像仍没有达到本可实现的严密程度：应用共享一个所谓“基础镜像”，它只在机器上安装一次，而不是打包进每个容器。基础镜像包含 `tar`、`libc` 等工具和库，因此升级基础镜像可能影响正在运行的应用，偶尔还会引发严重问题。
>
> Docker 和 ACI 等较新的容器镜像格式进一步强化了这一抽象：它们消除对宿主操作系统的隐式依赖，并要求用户通过显式命令在容器间共享镜像数据，从而更接近封闭自足的理想状态。

### Containers as the unit of management｜以容器作为管理单元

Building management APIs around containers rather than machines shifts the “primary key” of the data center from machine to application. This has many benefits: (1) it relieves application developers and operations teams from worrying about specific details of machines and operating systems; (2) it provides the infrastructure team flexibility to roll out new hardware and upgrade operating systems with minimal impact on running applications and their developers; and (3) it ties telemetry collected by the management system (e.g., metrics such as CPU and memory usage) to applications rather than machines, which dramatically improves application monitoring and introspection, especially when scale-up, machine failures, or maintenance cause application instances to move.

> 围绕容器而不是机器构建管理 API，会把数据中心的“主键”从机器转为应用。这带来许多收益：（1）应用开发者和运维团队不再需要操心机器与操作系统的具体细节；（2）基础设施团队可以灵活上线新硬件和升级操作系统，而只对运行中的应用及其开发者产生最小影响；（3）管理系统收集的遥测数据——例如 CPU 与内存用量——关联到应用而非机器，从而显著改善应用监控和内省；当扩容、机器故障或维护导致应用实例迁移时，这一点尤其重要。

> **Pull quote｜侧栏摘引：** Building management APIs around containers rather than machines shifts the “primary key” of the data center from machine to application.｜围绕容器而非机器构建管理 API，会把数据中心的“主键”从机器转为应用。

Containers provide convenient points to register generic APIs that enable the flow of information between the management system and an application without either knowing much about the particulars of the other’s implementation. In Borg, this API is a series of HTTP endpoints attached to each container. For example, the `/healthz` endpoint reports application health to the orchestrator. When an unhealthy application is detected, it is automatically terminated and restarted. This self-healing is a key building block for reliable distributed systems. (Kubernetes offers similar functionality; the health check uses a user-specified HTTP endpoint or `exec` command that runs inside the container.)

Additional information can be provided by or for containers and displayed in various user interfaces. For example, Borg applications can provide a simple text status message that can be updated dynamically, and Kubernetes provides key-value annotations stored in each object’s metadata that can be used to communicate application structure. Such annotations can be set by the container itself or other actors in the management system (e.g., the process rolling out an updated version of the container).

In the other direction, the container-management system can communicate information into the container such as resource limits, container metadata for propagation to logging and monitoring (e.g., user name, job name, identity), and notices that provide graceful-termination warnings in advance of node maintenance.

> 容器为注册通用 API 提供了便利位置，使管理系统与应用之间可以传递信息，而双方都不必深入了解对方的实现细节。在 Borg 中，这套 API 是附着于每个容器的一系列 HTTP 端点。例如，`/healthz` 端点向编排器报告应用健康状况；一旦发现应用不健康，系统会自动终止并重启它。这种自愈能力是可靠分布式系统的重要基石。（Kubernetes 提供类似功能；健康检查使用用户指定的 HTTP 端点，或在容器内部运行的 `exec` 命令。）
>
> 容器还可以提供信息，或由系统为其提供信息，再通过各种用户界面展示。例如，Borg 应用可以提供一条可动态更新的简单文本状态消息；Kubernetes 则在每个对象的元数据中保存键值注解，用来传达应用结构。这些注解既可由容器自身设置，也可由管理系统中的其他参与者设置，例如发布新版容器的进程。
>
> 反过来，容器管理系统也可以把信息传入容器，例如资源限制、需要传播到日志与监控系统的容器元数据（用户名、作业名、身份等），以及在节点维护前发出的优雅终止预告。

Containers can also provide application-oriented monitoring in other ways: for example, Linux kernel cgroups provide resource-utilization data about the application, and these can be extended with custom metrics exported using HTTP APIs, as described earlier. This data enables the development of generic tools like an auto-scaler or cAdvisor<sup>3</sup> that can record and use metrics without understanding the specifics of each application. Because the container is the application, there is no need to (de)multiplex signals from multiple applications running inside a physical or virtual machine. This is simpler, more robust, and permits finer-grained reporting and control of metrics and logs. Compare this to having to `ssh` into a machine to run `top`. Though it is possible for developers to `ssh` into their containers, they rarely need to.

Monitoring is just one example. The application-oriented shift has ripple effects throughout the management infrastructure. Our load balancers don’t balance traffic across machines; they balance across application instances. Logs are keyed by application, not machine, so they can easily be collected and aggregated across instances without pollution from multiple applications or system operations. We can detect application failures and more readily ascribe failure causes without having to disentangle them from machine-level signals. Fundamentally, because the identity of an instance being managed by the container manager lines up exactly with the identity of the instance expected by the application developer, it is easier to build, manage, and debug applications.

> 容器还可以通过其他方式提供面向应用的监控。例如，Linux 内核 cgroup 提供应用的资源利用率数据，还可以像前文所述，通过 HTTP API 导出的自定义指标加以扩展。这些数据使自动扩缩容器、cAdvisor<sup>3</sup> 等通用工具可以记录和使用指标，而无需理解每个应用的具体细节。由于容器就是应用，因此不必再对一台物理机或虚拟机中多个应用的信号进行复用或解复用。这样更简单、更稳健，也允许更细粒度地报告和控制指标与日志。与之相比，登录机器执行 `top` 显得笨重得多。开发者虽然可以通过 `ssh` 进入容器，但很少需要这样做。
>
> 监控只是一个例子。以应用为中心的转变会在整个管理基础设施中产生连锁效应。我们的负载均衡器不是在机器间均衡流量，而是在应用实例间均衡；日志按应用而非机器建立索引，因此可以轻松跨实例收集和聚合，不会混入多个应用或系统操作的噪声；我们还能检测应用故障，更容易判定故障原因，而不必先把它们与机器级信号分离。归根结底，容器管理器所管理实例的身份，与应用开发者所理解的实例身份完全一致，因此应用更容易构建、管理和调试。

Finally, although so far we have focused on applications being 1:1 with containers, in reality we use nested containers that are co-scheduled on the same machine: the outermost one provides a pool of resources; the inner ones provide deployment isolation. In Borg, the outermost container is called a resource allocation, or alloc; in Kubernetes, it is called a pod. Borg also allows top-level application containers to run outside allocs; this has been a source of much inconvenience, so Kubernetes regularizes things and always runs an application container inside a top-level pod, even if the pod contains a single container.

A common use pattern is for a pod to hold an instance of a complex application. The major part of the application sits in one of the child containers, and other child containers run supporting functions such as log rotation or click-log offloading to a distributed file system. Compared to combining the functionality into a single binary, this makes it easy to have different teams develop the distinct pieces of functionality, and it improves robustness (the offloading continues even if the main application gets wedged), composability (it’s easy to add a new small support service, because it operates in the private execution environment provided by its own container), and fine-grained resource isolation (each runs in its own resources, so the logging system can’t starve the main app, or vice versa).

> 最后，尽管前文一直假定应用与容器一一对应，实践中我们使用的是共同调度到同一台机器上的嵌套容器：最外层容器提供资源池，内层容器提供部署隔离。在 Borg 中，最外层容器称为资源分配（resource allocation，简称 alloc）；在 Kubernetes 中，它称为 Pod。Borg 还允许顶层应用容器脱离 alloc 运行，这带来了诸多不便；Kubernetes 因而统一了规则：即使 Pod 只包含一个容器，应用容器也始终运行在顶层 Pod 内。
>
> 一种常见模式，是让一个 Pod 承载复杂应用的一个实例。应用主体位于其中一个子容器，其他子容器则负责日志轮转、把点击日志卸载到分布式文件系统等辅助功能。与把所有功能合并进一个二进制程序相比，这样既便于不同团队分别开发各项功能，也提高了稳健性（即使主应用卡死，卸载仍能继续）、可组合性（新的小型辅助服务可以在自身容器提供的私有执行环境中运行，因而很容易加入），并实现细粒度资源隔离（各组件使用各自资源，日志系统不会饿死主应用，反之亦然）。

### Orchestration is the beginning, not the end｜编排只是起点，而非终点

<!-- PDF pages 10–14 -->

The original Borg system made it possible to run disparate workloads on shared machines to improve resource utilization. The rapid evolution of support services in the Borg ecosystem, however, showed that container management per se was just the beginning of an environment for developing and managing reliable distributed systems. Many different systems have been built in, on, and around Borg to improve upon the basic container-management services that Borg provided. The following partial list gives an idea of their range and variety:

* Naming and service discovery (the Borg Name Service, or BNS).
* Master election, using Chubby.<sup>2</sup>
* Application-aware load balancing.
* Horizontal (number of instances) and vertical (size of an instance) autoscaling.
* Rollout tools that manage the careful deployment of new binaries and configuration data.
* Workflow tools (e.g., to allow running multijob analysis pipelines with interdependencies between the stages).
* Monitoring tools to gather information about containers, aggregate it, present it on dashboards, and use it to trigger alerts.

> 最初的 Borg 使不同工作负载能够在共享机器上运行，从而提高资源利用率。然而，Borg 生态中辅助服务的快速演进表明，容器管理本身只是开发和管理可靠分布式系统环境的起点。人们在 Borg 之内、之上和周围构建了许多不同系统，以增强 Borg 提供的基础容器管理服务。下面这份不完整清单足以说明其广度和多样性：
>
> * 命名与服务发现（Borg Name Service，BNS）。
> * 使用 Chubby<sup>2</sup> 进行主节点选举。
> * 感知应用的负载均衡。
> * 水平自动扩缩容（实例数量）和垂直自动扩缩容（实例大小）。
> * 谨慎管理新版二进制程序与配置数据部署过程的发布工具。
> * 工作流工具，例如运行阶段间存在依赖关系的多作业分析流水线。
> * 收集容器信息、加以聚合、呈现在仪表盘上并据此触发告警的监控工具。

These services were built organically to solve problems that application teams experienced. The successful ones were picked up, adopted widely, and made other developers’ lives easier. Unfortunately, these tools typically picked idiosyncratic APIs, conventions (such as file locations), and depth of Borg integration. An undesired side effect was to increase the complexity of deploying applications in the Borg ecosystem.

Kubernetes attempts to avert this increased complexity by adopting a consistent approach to its APIs. For example, every Kubernetes object has three basic fields in its description: `ObjectMetadata`, `Specification` (or `Spec`), and `Status`.

The Object Metadata is the same for all objects in the system; it contains information such as the object’s name, UID (unique identifier), an object version number (for optimistic concurrency control), and labels (key-value pairs, see below). The contents of Spec and Status vary by object type, but their concept does not: Spec is used to describe the desired state of the object, whereas Status provides read-only information about the current state of the object.

> 这些服务从实际需求中自然生长，用来解决应用团队遇到的问题。成功的服务会被其他团队接纳、广泛采用，从而让更多开发者的工作变得轻松。遗憾的是，这些工具通常各自选择独特的 API、约定（例如文件位置）以及与 Borg 的集成深度；一个意料之外的副作用，就是提高了在 Borg 生态中部署应用的复杂度。
>
> Kubernetes 试图通过一致的 API 方法避免这种复杂度增长。例如，每个 Kubernetes 对象的描述都有三个基本字段：`ObjectMetadata`、`Specification`（或 `Spec`）和 `Status`。
>
> 系统内所有对象的 Object Metadata 都相同，其中包含对象名称、UID（唯一标识符）、对象版本号（用于乐观并发控制）和标签（键值对，见下文）等信息。Spec 与 Status 的具体内容因对象类型而异，但概念始终不变：Spec 描述对象的期望状态，Status 提供对象当前状态的只读信息。

This uniform API provides many benefits. Learning the system is simpler: similar information applies to all objects, and writing generic tools that work across all objects is simpler, which in turn enables the development of a consistent user experience. Learning from Borg and Omega, Kubernetes is built from a set of composable building blocks that can readily be extended by its users. A common API and object-metadata structure makes that much easier. For example, the pod API is usable by people, internal Kubernetes components, and external automation tools. To further this consistency, Kubernetes is being extended to enable users to add their own APIs dynamically, alongside the core Kubernetes functionality.

Consistency is also achieved via decoupling in the Kubernetes API. Separation of concerns between API components means that higher-level services all share the same common basic building blocks. A good example of this is the separation between the Kubernetes replication controller and its horizontal auto-scaling system. A replication controller ensures the existence of the desired number of pods for a given role (e.g., “front end”). The autoscaler, in turn, relies on this capability and simply adjusts the desired number of pods, without worrying about how those pods are created or deleted. The autoscaler implementation can focus on demand—and usage—predictions, and ignore the details of how to implement its decisions.

> 统一 API 带来许多好处。学习系统更简单，因为相似的信息适用于所有对象；编写跨对象工作的通用工具也更容易，进而能够形成一致的用户体验。吸收 Borg 与 Omega 的经验后，Kubernetes 由一组可组合的构件组成，用户可以轻松扩展它们；通用 API 和对象元数据结构让扩展容易得多。例如，Pod API 既可供人使用，也可供 Kubernetes 内部组件和外部自动化工具使用。为了进一步强化一致性，Kubernetes 还在扩展能力，使用户能够在核心功能旁动态加入自己的 API。
>
> Kubernetes API 还通过解耦实现一致性。API 组件之间关注点分离，意味着更高层服务都能共享同一组基础构件。Kubernetes 复制控制器与水平自动扩缩容系统的分离，就是一个好例子。复制控制器保证某个角色——例如“前端”——始终存在期望数量的 Pod；自动扩缩容器依赖这一能力，只需调整 Pod 的期望数量，不必关心这些 Pod 如何创建或删除。这样，自动扩缩容器的实现就可以专注于需求和用量预测，忽略落实决策的具体细节。

Decoupling ensures that multiple related but different components share a similar look and feel. For example, Kubernetes has three different forms of replicated pods:

* `ReplicationController`: run-forever replicated containers (e.g., web servers).
* `DaemonSet`: ensure a single instance on each node in the cluster (e.g., logging agents).
* `Job`: a run-to-completion controller that knows how to run a (possibly parallelized) batch job from start to finish.

Regardless of the differences in policy, all three of these controllers rely on the common pod object to specify the containers they wish to run.

Consistency is also achieved through common design patterns for different Kubernetes components. The idea of a reconciliation controller loop is shared throughout Borg, Omega, and Kubernetes to improve the resiliency of a system: it compares a desired state (e.g., how many pods should match a label-selector query) against the observed state (the number of such pods that it can find), and takes actions to converge the observed and desired states. Because all action is based on observation rather than a state diagram, reconciliation loops are robust to failures and perturbations: when a controller fails or restarts it simply picks up where it left off.

> 解耦让多个相互关联但又不同的组件拥有相似的观感。例如，Kubernetes 有三种不同形式的复制 Pod：
>
> * `ReplicationController`：让复制容器一直运行，例如 Web 服务器。
> * `DaemonSet`：保证集群每个节点上各有一个实例，例如日志代理。
> * `Job`：一种运行至完成的控制器，知道如何从头到尾运行一个可能并行化的批处理作业。
>
> 尽管策略不同，三种控制器都依赖共同的 Pod 对象来描述希望运行的容器。
>
> Kubernetes 的不同组件还通过共同设计模式取得一致性。为提升系统韧性，Borg、Omega 和 Kubernetes 都采用协调控制器循环：它把期望状态——例如应该有多少个 Pod 匹配某个标签选择器查询——与观测状态——实际找到多少个这样的 Pod——进行比较，然后采取行动，使观测状态向期望状态收敛。由于所有行动都以观察为依据，而不是依赖状态图，协调循环能够稳健应对故障与扰动：控制器发生故障或重启后，只需从中断之处继续工作。

The design of Kubernetes as a combination of microservices and small control loops is an example of control through choreography—achieving a desired emergent behavior by combining the effects of separate, autonomous entities that collaborate. This is a conscious design choice in contrast to a centralized orchestration system, which may be easier to construct at first but tends to become brittle and rigid over time, especially in the presence of unanticipated errors or state changes.

> Kubernetes 把微服务与小型控制循环组合起来，是“通过编舞实现控制”的一个例子：让彼此独立、自主而又相互协作的实体共同作用，从而涌现出期望行为。这是一个有意识的设计选择，与集中式编排系统形成对照。集中式系统起初也许更容易构建，但随着时间推移往往变得脆弱僵化，在出现未预料的错误或状态变化时尤其如此。

## Things to avoid｜应当避免的事情

<!-- PDF pages 14–19 -->

While developing these systems we have learned almost as many things not to do as ideas that are worth doing. We present some of them here in the hopes that others can focus on making new mistakes, rather than repeating ours.

> 在开发这些系统的过程中，我们学到的“不该做什么”，几乎与“哪些想法值得做”同样多。这里列出其中一些，希望后来者可以专注于犯新的错误，而不是重复我们的错误。

### Don’t make the container system manage port numbers｜不要让容器系统管理端口号

All containers running on a Borg machine share the host’s IP address, so Borg assigns the containers unique port numbers as part of the scheduling process. A container will get a new port number when it moves to a new machine and (sometimes) when it is restarted on the same machine. This means that traditional networking services such as the DNS (Domain Name System) have to be replaced by home-brew versions; service clients do not know the port number assigned to the service *a priori* and have to be told; port numbers cannot be embedded in URLs, requiring name-based redirection mechanisms; and tools that rely on simple IP addresses need to be rewritten to handle IP:port pairs.

Learning from our experiences with Borg, we decided that Kubernetes would allocate an IP address per pod, thus aligning network identity (IP address) with application identity. This makes it much easier to run off-the-shelf software on Kubernetes: applications are free to use static well-known ports (e.g., 80 for HTTP traffic), and existing, familiar tools can be used for things like network segmentation, bandwidth throttling, and management. All of the popular cloud platforms provide networking underlays that enable IP-per-pod; on bare metal, one can use an SDN (Software Defined Network) overlay or configure L3 routing to handle multiple IPs per machine.

> Borg 机器上的所有容器共享宿主机 IP 地址，因此 Borg 在调度过程中为容器分配唯一端口号。容器迁移到新机器时会获得新端口号；有时即使在同一台机器上重启，端口号也会变化。这意味着 DNS（域名系统）等传统网络服务必须由自研版本取代；服务客户端无法预先知道分配给服务的端口号，必须由系统告知；端口号不能嵌入 URL，因此还需要基于名称的重定向机制；依赖简单 IP 地址的工具，也必须重写才能处理 IP:端口对。
>
> 根据 Borg 的经验，我们决定让 Kubernetes 为每个 Pod 分配一个 IP 地址，从而使网络身份（IP 地址）与应用身份对齐。这让 Kubernetes 更容易运行现成软件：应用可以自由使用固定的知名端口，例如 HTTP 的 80 端口；网络分段、带宽限流和管理也可以继续使用现有的熟悉工具。主流云平台都提供支持“一 Pod 一 IP”的底层网络；在裸机上，可以使用 SDN（软件定义网络）覆盖层，或配置三层路由，让一台机器承载多个 IP。

### Don’t just number containers: give them labels｜不要只给容器编号：给它们加标签

If you allow users to create containers easily, they tend to create lots of them, and soon need a way to group and organize them. Borg provides jobs to group identical tasks (its name for containers). A job is a compact vector of one or more identical tasks, indexed sequentially from zero. This provides a lot of power and is simple and straightforward, but we came to regret its rigidity over time. For example, when a task dies and has to be restarted on another machine, the same slot in the task vector has to do double duty: to identify the new copy and to point to the old one in case it needs to be debugged. When tasks in the middle of the vector exit, the vector ends up with holes. The vector makes it very hard to support jobs that span multiple clusters in a layer above Borg. There are also insidious, unexpected interactions between Borg’s job-update semantics (which typically restarts tasks in index order when doing rolling upgrades) and an application’s use of the task index (e.g., to do sharding or partitioning of a dataset across the tasks): if the application uses range sharding based on the task index, Borg’s restart policy can cause data unavailability, as it takes down adjacent tasks. Borg also provides no easy way to add application-relevant metadata to a job, such as role (e.g., “frontend”), or rollout status (e.g., “canary”), so people encode this information into job names that they decode using regular expressions.

> 如果用户可以轻易创建容器，他们往往会创建很多，很快就需要对容器进行分组和组织。Borg 用 Job 来归组相同的 Task——Borg 对容器的称呼。一个 Job 是由一个或多个相同 Task 构成的紧凑向量，从零开始顺序编号。这种方法能力很强，也简单直接，但时间一久，我们开始后悔它过于僵硬。例如，某个 Task 死亡并需要在另一台机器上重启时，Task 向量中的同一槽位必须身兼二职：既标识新副本，又要指向旧副本以备调试。向量中部的 Task 退出后，向量就会留下空洞。它也让 Borg 上层很难支持跨多个集群的 Job。Borg 的 Job 更新语义与应用使用 Task 索引的方式之间，还存在隐蔽而出人意料的相互作用：滚动升级通常按索引顺序重启 Task；如果应用依据 Task 索引对数据集进行范围分片，Borg 的重启策略就会连续停掉相邻 Task，导致数据不可用。Borg 也没有简便方式为 Job 添加与应用相关的元数据，例如角色（“frontend”）或发布状态（“canary”）；于是人们只好把信息编码进 Job 名称，再用正则表达式解码。

In contrast, Kubernetes primarily uses labels to identify groups of containers. A label is a key/value pair that contains information that helps identify the object. A pod might have the labels `role=frontend` and `stage=production`, indicating that this container is serving as a production front-end instance. Labels can be dynamically added, removed, and modified by either automated tools or users, and different teams can manage their own labels largely independently. Sets of objects are defined by label selectors (e.g., `stage==production && role==frontend`). Sets can overlap, and an object can be in multiple sets, so labels are inherently more flexible than explicit lists of objects or simple static properties. Because a set is defined by a dynamic query, a new one can be created at any time. Label selectors are the grouping mechanism in Kubernetes, and define the scope of all management operations that can span multiple entities.

Even in those circumstances where knowing the identity of a task in a set is helpful (e.g., for static role assignment and work-partitioning or sharding), appropriate per-pod labels can be used to reproduce the effect of task indexes, though it is the responsibility of the application (or some other management system external to Kubernetes) to provide such labeling. Labels and label selectors provide a general mechanism that gives the best of both worlds.

> 与之不同，Kubernetes 主要通过标签标识容器组。标签是包含对象识别信息的键值对。一个 Pod 可能带有 `role=frontend` 和 `stage=production` 标签，表示该容器是生产环境的前端实例。自动化工具或用户都可以动态添加、删除和修改标签，不同团队基本可以独立管理自己的标签。对象集合由标签选择器定义，例如 `stage==production && role==frontend`。集合可以相互重叠，一个对象也可以同时属于多个集合，因此标签天生比显式对象列表或简单静态属性更灵活。集合由动态查询定义，所以任何时刻都能创建新集合。标签选择器是 Kubernetes 的分组机制，也定义了所有跨多个实体的管理操作范围。
>
> 即使在需要知道集合内某项 Task 身份的场景——例如静态角色分配、工作划分或分片——也可以用恰当的逐 Pod 标签复现 Task 索引的效果；不过，提供这些标签是应用或 Kubernetes 外部其他管理系统的责任。标签与标签选择器是一套兼得两者所长的通用机制。

### Be careful with ownership｜谨慎处理所有权

In Borg, tasks do not exist independently from jobs. Creating a job creates its tasks; those tasks are forever associated with that particular job, and deleting the job deletes the tasks. This is convenient, but it has a major drawback: because there is only one grouping mechanism, it needs to handle all use cases. For example, a job has to store parameters that make sense only for service or batch jobs but not both, and users must develop workarounds when the job abstraction doesn’t handle a use case (e.g., a `DaemonSet` that replicates a single pod to all nodes in the cluster).

In Kubernetes, pod-lifecycle management components such as replication controllers determine which pods they are responsible for using label selectors, so multiple controllers might think they have jurisdiction over a single pod. It is important to prevent such conflicts through appropriate configuration choices. But the flexibility of labels has compensating advantages—for example, the separation of controllers and pods means that it is possible to “orphan” and “adopt” containers. Consider a load-balanced service that uses a label selector to identify the set of pods to send traffic to. If one of these pods starts misbehaving, that pod can be quarantined from serving requests by removing one or more of the labels that cause it to be targeted by the Kubernetes service load balancer. The pod is no longer serving traffic, but it will remain up and can be debugged *in situ*. In the meantime, the replication controller managing the pods that implements the service automatically creates a replacement pod for the misbehaving one.

> 在 Borg 中，Task 不能脱离 Job 独立存在。创建 Job 就会创建它的 Task；这些 Task 永远与该 Job 绑定，删除 Job 也会删除 Task。这很方便，却有一个重大缺点：系统只有一种分组机制，因此它必须承担所有用例。例如，一个 Job 不得不同时存放只对服务作业或只对批处理作业有意义、但不适用于另一类作业的参数；当 Job 抽象无法处理某种用例时，用户又必须自行变通，例如实现把单个 Pod 复制到集群所有节点的 `DaemonSet`。
>
> 在 Kubernetes 中，复制控制器等 Pod 生命周期管理组件通过标签选择器确定自己负责哪些 Pod，因此多个控制器可能都认为某个 Pod 归自己管辖。必须通过恰当配置来避免这类冲突。不过标签的灵活性也带来补偿性优势：控制器与 Pod 分离，使容器可以被“遗弃”和“收养”。设想一个负载均衡服务，它用标签选择器找出应该接收流量的 Pod 集合。若其中一个 Pod 开始出现异常，可以移除使 Kubernetes 服务负载均衡器选中它的一个或多个标签，将其隔离出请求服务路径。Pod 不再承载流量，但会继续运行，可以就地调试；与此同时，负责该服务 Pod 的复制控制器会自动创建一个新 Pod，替代异常实例。

### Don’t expose raw state｜不要暴露原始状态

A key difference between Borg, Omega, and Kubernetes is in their API architectures. The Borgmaster is a monolithic component that knows the semantics of every API operation. It contains the cluster management logic such as the state machines for jobs, tasks, and machines; and it runs the Paxos-based replicated storage system used to record the master’s state. In contrast, Omega has no centralized component except the store, which simply holds passive state information and enforces optimistic concurrency control: all logic and semantics are pushed into the clients of the store, which directly read and write the store contents. In practice, every Omega component uses the same client-side library for the store, which does packing/unpacking of data structures, retries, and enforces semantic consistency.

Kubernetes picks a middle ground that provides the flexibility and scalability of Omega’s componentized architecture while enforcing system-wide invariants, policies, and data transformations. It does this by forcing all store accesses through a centralized API server that hides the details of the store implementation and provides services for object validation, defaulting, and versioning. As in Omega, the client components are decoupled from one another and can evolve or be replaced independently (which is especially important in the open-source environment), but the centralization makes it easy to enforce common semantics, invariants, and policies.

> Borg、Omega 与 Kubernetes 的一个关键区别，在于 API 架构。Borgmaster 是单体组件，理解每个 API 操作的语义。它包含 Job、Task、机器状态机等集群管理逻辑，也运行用于记录主节点状态、基于 Paxos 的复制存储系统。Omega 除存储外没有任何集中式组件；存储只保存被动状态信息并实施乐观并发控制，所有逻辑和语义都被推到存储客户端，由它们直接读写存储内容。实践中，每个 Omega 组件都使用同一个存储客户端库，由它负责数据结构打包与解包、重试，以及语义一致性约束。
>
> Kubernetes 选择了一条中间道路：既提供 Omega 组件化架构的灵活性和可扩展性，又实施全系统不变量、策略与数据转换。为此，它强制所有存储访问经过集中式 API Server；API Server 隐藏存储实现细节，并提供对象校验、默认值填充与版本管理服务。与 Omega 一样，客户端组件彼此解耦，可以独立演进或替换——这在开源环境中尤其重要；与此同时，集中入口又让公共语义、不变量和策略易于实施。

> **Pull quote｜侧栏摘引：** A key difference between Borg, Omega, and Kubernetes is in their API architectures.｜Borg、Omega 与 Kubernetes 的一个关键区别，在于它们的 API 架构。

## Some open, hard problems｜一些尚未解决的难题

<!-- PDF pages 19–22 -->

Even with years of container-management experience, we feel there are a number of problems that we still don’t have good answers for. This section describes a couple of particularly knotty ones, in the hope of fostering discussion and solutions.

> 即便拥有多年容器管理经验，我们仍觉得有不少问题没有好的答案。本节介绍其中两个尤其棘手的问题，希望由此推动讨论并催生解决方案。

### Configuration｜配置

Of all the problems we have confronted, the ones over which the most brainpower, ink, and code have been spilled are related to managing configurations—the set of values supplied to applications, rather than hard-coded into them. In truth, we could have devoted this entire article to the subject and still have had more to say. What follows are a few highlights.

First, application configuration becomes the catch-all location for implementing all of the things that the container-management system doesn’t (yet) do. Over the history of Borg this has included:

* Boilerplate reduction (e.g., defaulting task-restart policies appropriate to the workload, such as service or batch jobs).
* Adjusting and validating application parameters and command-line flags.
* Implementing workarounds for missing API abstractions such as package (image) management.
* Libraries of configuration templates for applications.
* Release-management tools.
* Image version specification.

> 在我们面对的所有问题中，耗费最多脑力、笔墨和代码的，都与配置管理有关——也就是提供给应用、而不是硬编码在应用内部的一组值。事实上，即使整篇文章都用来讨论这个主题，我们仍会意犹未尽。下面只列几个重点。
>
> 首先，应用配置会成为一个无所不包的场所，用来实现容器管理系统尚未提供的一切能力。在 Borg 的历史中，这包括：
>
> * 减少样板配置，例如根据服务作业或批处理作业等工作负载，默认采用恰当的 Task 重启策略。
> * 调整并校验应用参数与命令行标志。
> * 为软件包（镜像）管理等缺失的 API 抽象实现变通方案。
> * 应用配置模板库。
> * 发布管理工具。
> * 镜像版本规范。

To cope with these kinds of requirements, configuration-management systems tend to invent a domain-specific configuration language that (eventually) becomes Turing complete, starting from the desire to perform computation on the data in the configuration (e.g., to adjust the amount of memory to give a server as a function of the number of shards in the service). The result is the kind of inscrutable “configuration is code” that people were trying to avoid by eliminating hard-coded parameters in the application’s source code. It doesn’t reduce operational complexity or make the configurations easier to debug or change; it just moves the computations from a real programming language to a domain-specific one, which typically has weaker development tools such as debuggers and unit test frameworks.

We believe the most effective approach is to accept this need, embrace the inevitability of programmatic configuration, and maintain a clean separation between computation and data. The language to represent the data should be a simple, data-only format such as JSON or YAML, and programmatic modification of this data should be done in a real programming language, where there are well-understood semantics, as well as good tooling. Interestingly, this same separation of computation and data can be seen in front-end development with frameworks such as Angular that maintain a crisp separation between the worlds of markup (data) and JavaScript (computation).

> 为满足这类需求，配置管理系统往往会发明一种领域专用配置语言；起初只是想对配置数据做些计算——例如根据服务分片数调整服务器内存——最终却演变成图灵完备语言。结果恰恰成为一种晦涩难懂的“配置即代码”，而人们把硬编码参数从应用源码中移除，本来就是为了避免这种局面。它既没有降低运维复杂度，也没有让配置更易调试或修改，只是把计算从真正的编程语言搬进领域专用语言；后者的调试器、单元测试框架等开发工具通常还更弱。
>
> 我们认为，最有效的做法是接受这种需求，承认程序化配置不可避免，同时保持计算与数据清晰分离。数据应以 JSON、YAML 等简单、纯数据格式表示；对数据进行程序化修改，则应使用语义清楚、工具完善的真正编程语言。有趣的是，Angular 等前端框架也体现了同样的计算与数据分离：标记（数据）与 JavaScript（计算）之间界限分明。

### Dependency management｜依赖管理

Standing up a service typically also means standing up a series of related services (monitoring, storage, Continuous Integration / Continuous Deployment (CI/CD), etc). If an application has dependencies on other applications, wouldn’t it be nice if those dependencies (and any transitive dependencies they may have) were automatically instantiated by the cluster-management system?

To complicate things, instantiating the dependencies is rarely as simple as just starting a new copy—for example, it may require registering as a consumer of an existing service (e.g., Bigtable as a service) and passing authentication, authorization, and billing information across those transitive dependencies. Almost no system, however, captures, maintains, or exposes this kind of dependency information, so automating even common cases at the infrastructure level is nearly impossible. Turning up a new application remains complicated for the user, making it harder for developers to build new services, and often results in the most recent best practices not being followed, which affects the reliability of the resulting service.

> 启动一个服务，通常也意味着要启动一系列相关服务，例如监控、存储、持续集成与持续部署（CI/CD）等。如果应用依赖其他应用，能由集群管理系统自动实例化这些依赖——以及依赖的传递依赖——岂不更好？
>
> 问题在于，实例化依赖很少只是启动一个新副本这么简单。例如，系统可能需要把应用注册为某个现有服务——如服务化 Bigtable——的消费者，还要沿传递依赖传递身份认证、鉴权和计费信息。然而，几乎没有系统会捕获、维护或暴露这类依赖信息，因此即使是常见场景，也几乎无法在基础设施层自动化。对用户而言，启动新应用依然复杂；开发者更难构建新服务，也往往无法遵循最新最佳实践，最终影响服务可靠性。

A standard problem is that it is hard to keep dependency information up to date if it is provided manually, and at the same time attempts to determine it automatically (e.g., by tracing accesses) fail to capture the semantic information needed to understand the result. (Did that access have to go to that instance, or would any instance have sufficed?) One possible way to make progress is to require that an application enumerate the services on which it depends, and have the infrastructure refuse to allow access to any others. (We do this for compiler imports in our build system.<sup>1</sup>) The incentive would be enabling the infrastructure to do useful things in return, such as automatic setup, authentication, and connectivity.

Unfortunately, the perceived complexity of systems that express, analyze, and use system dependencies has been too high, and so they haven’t yet been added to a mainstream container-management system. We still hope that Kubernetes might be a platform on which such tools can be built, but doing so remains an open challenge.

> 一个典型问题是：依赖信息若靠手工提供，就很难保持最新；若试图通过访问追踪等方式自动推断，又无法捕获理解结果所必需的语义信息。（那次访问必须发往那个实例，还是任意实例都可以？）一种可能的推进方式，是要求应用枚举自己依赖的服务，并让基础设施拒绝其访问任何其他服务。（我们的构建系统对编译器 import 就这样做。<sup>1</sup>）作为回报，基础设施可以提供自动安装、身份认证和连通性等实用能力，从而形成激励。
>
> 遗憾的是，人们一直认为表达、分析和使用系统依赖关系的系统过于复杂，因此它们尚未进入主流容器管理系统。我们仍希望 Kubernetes 可以成为构建这类工具的平台，但如何实现依旧是一个开放挑战。

## Conclusions｜结论

<!-- PDF pages 22–24 -->

A decade’s worth of experience building container-management systems has taught us much, and we have embedded many of those lessons into Kubernetes, Google’s most recent container-management system. Its goals are to build on the capabilities of containers to provide significant gains in programmer productivity and ease of both manual and automated system management. We hope you’ll join us in extending and improving it.

> 十年构建容器管理系统的经验教会了我们很多，其中许多经验已经融入 Google 最新的容器管理系统 Kubernetes。它的目标是在容器能力之上，显著提高程序员生产力，同时让人工与自动化系统管理都更加容易。我们希望你也加入进来，一同扩展并改进它。

## References｜参考文献

1. Bazel: {fast, correct}—choose two; <http://bazel.io>.

   > Bazel：{快速、正确}——二选一；<http://bazel.io>。

2. Burrows, M. 2006. The Chubby lock service for loosely coupled distributed systems. Symposium on Operating System Design and Implementation (OSDI), Seattle, WA.

   > Burrows, M.，2006。《松耦合分布式系统的 Chubby 锁服务》。操作系统设计与实现研讨会（OSDI），美国华盛顿州西雅图。

3. cAdvisor; <https://github.com/google/cadvisor>.

   > cAdvisor；<https://github.com/google/cadvisor>。

4. Kubernetes; <http://kubernetes.io/>.

   > Kubernetes；<http://kubernetes.io/>。

5. Metz, C. 2015. Google is 2 billion lines of code—and it’s all in one place. *Wired* (September); <http://www.wired.com/2015/09/google-2-billion-lines-codeand-one-place/>.

   > Metz, C.，2015。《Google 拥有 20 亿行代码——而且全在一个地方》。《Wired》（9 月）；<http://www.wired.com/2015/09/google-2-billion-lines-codeand-one-place/>。

6. Schwarzkopf, M., Konwinski, A., Abd-el-Malek, M., Wilkes, J. 2013. Omega: flexible, scalable schedulers for large compute clusters. European Conference on Computer Systems (EuroSys), Prague, Czech Republic.

   > Schwarzkopf, M.、Konwinski, A.、Abd-el-Malek, M.、Wilkes, J.，2013。《Omega：面向大规模计算集群的灵活、可扩展调度器》。欧洲计算机系统会议（EuroSys），捷克共和国布拉格。

7. Verma, A., Pedrosa, L., Korupolu, M. R., Oppenheimer, D., Tune, E., Wilkes, J. 2015. Large-scale cluster management at Google with Borg. European Conference on Computer Systems (EuroSys), Bordeaux, France.

   > Verma, A.、Pedrosa, L.、Korupolu, M. R.、Oppenheimer, D.、Tune, E.、Wilkes, J.，2015。《使用 Borg 在 Google 进行大规模集群管理》。欧洲计算机系统会议（EuroSys），法国波尔多。

**LOVE IT, HATE IT? LET US KNOW feedback@queue.acm.org｜无论喜欢还是讨厌，欢迎来信：feedback@queue.acm.org**

## About the authors｜作者简介

Brendan Burns (`@brendandburns`) is a software engineer at Google, where he co-founded the Kubernetes project. He received his Ph.D. from the University of Massachusetts Amherst in 2007. Prior to working on Kubernetes and cloud, he worked on low-latency indexing for Google’s web-search infrastructure.

> Brendan Burns（`@brendandburns`）是 Google 软件工程师，也是 Kubernetes 项目的联合创始人。他于 2007 年获得马萨诸塞大学阿默斯特分校博士学位。在从事 Kubernetes 与云计算工作之前，他负责 Google Web 搜索基础设施的低延迟索引。

Brian Grant is a software engineer at Google. He was previously a technical lead of Borg and founder of the Omega project and is now design lead of Kubernetes.

> Brian Grant 是 Google 软件工程师，曾任 Borg 技术负责人并创立 Omega 项目，现任 Kubernetes 设计负责人。

David Oppenheimer is a software engineer at Google and a tech lead on the Kubernetes project. He received a PhD from UC Berkeley in 2005 and joined Google in 2007, where he was a tech lead on the Borg and Omega cluster-management systems prior to Kubernetes.

> David Oppenheimer 是 Google 软件工程师，也是 Kubernetes 项目技术负责人。他于 2005 年获得加州大学伯克利分校博士学位，2007 年加入 Google；在 Kubernetes 之前，他曾担任 Borg 与 Omega 集群管理系统的技术负责人。

Eric Brewer is VP Infrastructure at Google and a professor at UC Berkeley, where he pioneered scalable servers and elastic infrastructure.

> Eric Brewer 是 Google 基础设施副总裁、加州大学伯克利分校教授，曾开创可扩展服务器与弹性基础设施领域的工作。

John Wilkes has been working on cluster management and infrastructure services at Google since 2008. Before that, he spent time at HP Labs, becoming an HP and ACM Fellow in 2002. He is interested in far too many aspects of distributed systems, but a recurring theme has been technologies that allow systems to manage themselves. In his spare time he continues, stubbornly, trying to learn how to blow glass.

> John Wilkes 自 2008 年起在 Google 从事集群管理和基础设施服务工作。此前他曾就职于 HP Labs，并于 2002 年成为 HP Fellow 与 ACM Fellow。他感兴趣的分布式系统方向多得数不胜数，但反复出现的主题，是让系统能够自我管理的技术。业余时间里，他仍执着地尝试学习玻璃吹制。

Copyright © 2016 by the ACM. All rights reserved.

> 版权所有 © 2016 ACM。保留所有权利。
