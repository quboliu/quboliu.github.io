---
lang: "zh-CN"
pubDatetime: 2025-09-21T12:00:00+08:00
modDatetime: 2026-08-10T15:33:40+08:00
timezone: "Asia/Shanghai"
title: "论文阅读 | A Note on Distributed Computing｜分布式计算札记"
featured: false
area: "distributed-systems"
draft: false
tags:
  - "论文阅读"
  - "分布式系统"
  - "分布式对象"
  - "局部故障"
  - "软件架构"
description: "按语义单元编排的中英对照精读分布式计算经典札记，说明远程对象为何不能伪装成本地对象，并讨论延迟、并发、内存访问与局部故障对接口和系统设计的根本影响。"
---

<!-- PDF page 1 -->

**A Note on Distributed Computing｜分布式计算札记**

Jim Waldo  
Geoff Wyant  
Ann Wollrath  
Sam Kendall

> Jim Waldo  
> Geoff Wyant  
> Ann Wollrath  
> Sam Kendall

SMLI TR-94-29  
November 1994

> SMLI 技术报告 TR-94-29  
> 1994 年 11 月

**Abstract:｜摘要：**

We argue that objects that interact in a distributed system need to be dealt with in ways that are intrinsically different from objects that interact in a single address space. These differences are required because distributed systems require that the programmer be aware of latency, have a different model of memory access, and take into account issues of concurrency and partial failure.

We look at a number of distributed systems that have attempted to paper over the distinction between local and remote objects, and show that such systems fail to support basic requirements of robustness and reliability. These failures have been masked in the past by the small size of the distributed systems that have been built. In the enterprise-wide distributed systems foreseen in the near future, however, such a masking will be impossible.

We conclude by discussing what is required of both systems-level and application-level programmers and designers if one is to take distribution seriously.

> 我们认为，对于在分布式系统中交互的对象，必须采用与单一地址空间内交互对象有本质区别的方式来处理。之所以必须如此，是因为分布式系统要求程序员意识到延迟，采用不同的内存访问模型，并把并发与局部故障问题纳入考量。
>
> 我们考察了一些曾试图掩盖本地对象与远程对象之区别的分布式系统，并指出这类系统无法满足健壮性与可靠性的基本要求。过去，已建成的分布式系统规模较小，因而掩盖了这些失败。然而，在不久的将来可以预见的企业级分布式系统中，这种掩盖将不再可能。
>
> 最后，我们讨论：若要严肃对待分布式这一事实，系统级和应用级的程序员与设计者分别需要做到什么。

Sun Microsystems Laboratories, Inc.  
A Sun Microsystems, Inc. Business  
M/S 29-01  
2550 Garcia Avenue  
Mountain View, CA 94043

**email addresses:**  
jim.waldo@east.sun.com  
geoff.wyant@east.sun.com  
ann.wollrath@east.sun.com  
sam.kendall@east.sun.com

> Sun Microsystems Laboratories, Inc.  
> Sun Microsystems, Inc. 旗下企业  
> M/S 29-01  
> 2550 Garcia Avenue  
> Mountain View, CA 94043
>
> **电子邮件地址：**  
> jim.waldo@east.sun.com  
> geoff.wyant@east.sun.com  
> ann.wollrath@east.sun.com  
> sam.kendall@east.sun.com

<!-- PDF page 2; printed page 2 -->

**A Note on Distributed Computing｜分布式计算札记**

Jim Waldo, Geoff Wyant, Ann Wollrath, and Sam Kendall

> Jim Waldo、Geoff Wyant、Ann Wollrath、Sam Kendall

Sun Microsystems Laboratories  
2550 Garcia Avenue  
Mountain View, CA 94043

> Sun Microsystems Laboratories  
> 2550 Garcia Avenue  
> Mountain View, CA 94043

## 1 Introduction｜引言

Much of the current work in distributed, object-oriented systems is based on the assumption that objects form a single ontological class. This class consists of all entities that can be fully described by the specification of the set of interfaces supported by the object and the semantics of the operations in those interfaces. The class includes objects that share a single address space, objects that are in separate address spaces on the same machine, and objects that are in separate address spaces on different machines (with, perhaps, different architectures). On the view that all objects are essentially the same kind of entity, these differences in relative location are merely an aspect of the implementation of the object. Indeed, the location of an object may change over time, as an object migrates from one machine to another or the implementation of the object changes.

It is the thesis of this note that this unified view of objects is mistaken. There are fundamental differences between the interactions of distributed objects and the interactions of non-distributed objects. Further, work in distributed object-oriented systems that is based on a model that ignores or denies these differences is doomed to failure, and could easily lead to an industry-wide rejection of the notion of distributed object-based systems.

> 当前许多关于分布式面向对象系统的工作，都建立在这样一个假设之上：对象构成单一的本体论类别。这个类别包含所有能够由两项内容完整描述的实体：对象所支持的一组接口，以及这些接口中各项操作的语义。该类别既包括共享同一地址空间的对象，也包括位于同一台机器不同地址空间中的对象，还包括位于不同机器不同地址空间中的对象（机器甚至可能采用不同的体系结构）。倘若认为所有对象本质上都是同一种实体，那么这些相对位置上的差异便只是对象实现的一个方面。事实上，随着对象从一台机器迁移到另一台机器，或对象实现发生变化，对象的位置也可能随时间改变。
>
> 本文的核心论点是：这种统一的对象观是错误的。分布式对象之间的交互，与非分布式对象之间的交互存在根本差异。进一步说，若分布式面向对象系统建立在忽略或否认这些差异的模型之上，就注定失败，并且很容易导致整个业界排斥基于分布式对象的系统这一理念。

### 1.1 Terminology｜术语

In what follows, we will talk about local and distributed computing. By local computing (local object invocation, etc.), we mean programs that are confined to a single address space. In contrast, we will use the term distributed computing (remote object invocation, etc.) to refer to programs that make calls to other address spaces, possibly on another machine. In the case of distributed computing, nothing is known about the recipient of the call (other than that it supports a particular interface). For example, the client of such a distributed object does not know the hardware architecture on which the recipient of the call is running, or the language in which the recipient was implemented.

Given the above characterizations of “local” and “distributed” computing, the categories are not exhaustive. There is a middle ground, in which calls are made from one address space to another but in which some characteristics of the called object are known. An important class of this sort consists of calls from one address space to another on the same machine; we will discuss these later in the paper.

> 下文将讨论本地计算与分布式计算。所谓本地计算（本地对象调用等），是指局限在单一地址空间内的程序。相较之下，我们用分布式计算（远程对象调用等）来指称会调用其他地址空间的程序；那些地址空间可能位于另一台机器上。在分布式计算中，除了调用接收方支持某个特定接口以外，对它一无所知。例如，这类分布式对象的客户端既不知道调用接收方运行于何种硬件体系结构，也不知道它由何种语言实现。
>
> 按照上述对“本地”计算与“分布式”计算的界定，这两个类别并未穷尽所有情形。两者之间还存在一片中间地带：调用从一个地址空间发往另一个地址空间，但被调用对象的某些特征是已知的。其中一个重要类别，是同一台机器上从一个地址空间向另一个地址空间发出的调用；本文稍后将讨论这种情形。

<!-- PDF pages 3–4; printed pages 3–4 -->

## 2 The Vision of Unified Objects｜统一对象的愿景

There is an overall vision of distributed object-oriented computing in which, from the programmer’s point of view, there is no essential distinction between objects that share an address space and objects that are on two machines with different architectures located on different continents. While this view can most recently be seen in such works as the Object Management Group’s Common Object Request Broker Architecture (CORBA) [1], it has a history that includes such research systems as Arjuna [2], Emerald [3], and Clouds [4].

In such systems, an object, whether local or remote, is defined in terms of a set of interfaces declared in an interface definition language. The implementation of the object is independent of the interface and hidden from other objects. While the underlying mechanisms used to make a method call may differ depending on the location of the object, those mechanisms are hidden from the programmer who writes exactly the same code for either type of call, and the system takes care of delivery.

> 分布式面向对象计算有一种总体愿景：从程序员的角度看，共享同一地址空间的对象，与分处不同大陆、运行在两台体系结构不同的机器上的对象之间，不存在本质区别。最近，这种观点见于对象管理组织的通用对象请求代理体系结构（CORBA）[1] 等工作；若追溯其历史，还包括 Arjuna [2]、Emerald [3] 和 Clouds [4] 等研究系统。
>
> 在这类系统中，无论对象位于本地还是远程，都由接口定义语言声明的一组接口来定义。对象的实现独立于接口，并对其他对象隐藏。尽管发起方法调用所用的底层机制可能随对象位置不同而异，但这些机制对程序员不可见：程序员为两类调用编写完全相同的代码，交付工作则由系统负责。

This vision can be seen as an extension of the goal of remote procedure call (RPC) systems to the object-oriented paradigm. RPC systems attempt to make cross-address space function calls look (to the client programmer) like local function calls. Extending this to the object-oriented programming paradigm allows papering over not just the marshalling of parameters and the unmarshalling of results (as is done in RPC systems) but also the locating and connecting to the target objects. Given the isolation of an object’s implementation from clients of the object, the use of objects for distributed computing seems natural. Whether a given object invocation is local or remote is a function of the implementation of the objects being used, and could possibly change from one method invocation to another on any given object.

Implicit in this vision is that the system will be “objects all the way down”; that is, that all current invocations or calls for system services will be eventually converted into calls that might be to an object residing on some other machine. There is a single paradigm of object use and communication used no matter what the location of the object might be.

> 这一愿景可视为把远程过程调用（RPC）系统的目标扩展到面向对象范式。RPC 系统试图让跨地址空间的函数调用在客户端程序员看来如同本地函数调用。将这一目标扩展到面向对象编程范式后，所掩盖的不仅是参数编组与结果解组（RPC 系统已经如此），还包括对目标对象的定位与连接。既然对象实现与对象客户端彼此隔离，用对象进行分布式计算似乎顺理成章。某次对象调用究竟是本地还是远程，取决于所用对象的实现；对于同一个对象，甚至可能在相邻两次方法调用之间发生变化。
>
> 这一愿景隐含着系统将“自顶至底皆为对象”；也就是说，当前所有对系统服务的调用，最终都将转换成可能发往另一台机器上某个对象的调用。无论对象位于何处，对象的使用与通信都采用同一种范式。

In actual practice, of course, a local member function call and a cross-continent object invocation are not the same thing. The vision is that developers write their applications so that the objects within the application are joined using the same programmatic glue as objects between applications, but it does not require that the two kinds of glue be implemented the same way. What is needed is a variety of implementation techniques, ranging from same-address-space implementations like Microsoft’s Object Linking and Embedding [5] to typical network RPC; different needs for speed, security, reliability, and object co-location can be met by using the right “glue” implementation.

Writing a distributed application in this model proceeds in three phases. The first phase is to write the application without worrying about where objects are located and how their communication is implemented. The developer will simply strive for the natural and correct interface between objects. The system will choose reasonable defaults for object location, and depending on how performance-critical the application is, it may be possible to alpha test it with no further work. Such an approach will enforce a desirable separation between the abstract architecture of the application and any needed performance tuning.

> 当然，在实际中，本地成员函数调用与跨越大陆的对象调用并不是一回事。这个愿景要求开发者在编写应用时，使用同一种程序化“黏合剂”来连接应用内部的对象与应用之间的对象，却不要求两类黏合剂以同样方式实现。所需要的是多种实现技术：从微软对象链接与嵌入 [5] 这样的同地址空间实现，到典型的网络 RPC；只要选用恰当的“黏合剂”实现，就能满足速度、安全性、可靠性与对象共置等不同需求。
>
> 在这一模型下编写分布式应用分为三个阶段。第一阶段先编写应用，不必操心对象位于何处，也不必关心对象间通信如何实现。开发者只需力求设计出对象之间自然而正确的接口。系统会为对象位置选择合理的默认值；视应用对性能的敏感程度而定，甚至可能无需进一步工作便可开展 alpha 测试。这种做法将强制应用的抽象体系结构与所需的性能调优保持一种可取的分离。

The second phase is to tune performance by “concretizing” object locations and communication methods. At this stage, it may be necessary to use as yet unavailable tools to allow analysis of the communication patterns between objects, but it is certainly conceivable that such tools could be produced. Also during the second phase, the right set of interfaces to export to various clients—such as other applications—can be chosen. There is obviously tremendous flexibility here for the application developer. This seems to be the sort of development scenario that is being advocated in systems like Fresco [6], which claim that the decision to make an object local or remote can be put off until after initial system implementation.

The final phase is to test with “real bullets” (e.g., networks being partitioned, machines going down). Interfaces between carefully selected objects can be beefed up as necessary to deal with these sorts of partial failures introduced by distribution by adding replication, transactions, or whatever else is needed. The exact set of these services can be determined only by experience that will be gained during the development of the system and the first applications that will work on the system.

> 第二阶段通过将对象位置与通信方式“具体化”来调优性能。此时或许需要使用目前尚不存在的工具，以便分析对象之间的通信模式，不过完全可以设想这类工具能够被开发出来。第二阶段还可以选择向各种客户端（例如其他应用）导出哪一组恰当的接口。显然，应用开发者在这里拥有极大的灵活性。这似乎正是 Fresco [6] 等系统所倡导的开发场景：它们声称，可以把决定对象应当置于本地还是远程这件事，推迟到系统初步实现完成之后。
>
> 最后一个阶段是用“实弹”测试（例如网络发生分区、机器宕机）。对于精心选择的对象，可以按需增强其间的接口，加入复制、事务或任何其他必要机制，以应对分布式带来的这类局部故障。究竟需要哪一组服务，只能凭借开发该系统及首批运行于该系统之上的应用时所积累的经验来确定。

A central part of the vision is that if an application is built using objects all the way down, in a proper object-oriented fashion, the right “fault points” at which to insert process or machine boundaries will emerge naturally. But if you initially make the wrong choices, they are very easy to change.

One conceptual justification for this vision is that whether a call is local or remote has no impact on the correctness of a program. If an object supports a particular interface, and the support of that interface is semantically correct, it makes no difference to the correctness of the program whether the operation is carried out within the same address space, on some other machine, or off-line by some other piece of equipment. Indeed, seeing location as a part of the implementation of an object and therefore as part of the state that an object hides from the outside world appears to be a natural extension of the object-oriented paradigm.

> 这一愿景的核心内容之一是：如果应用以适当的面向对象方式构建，并且自顶至底皆由对象组成，那么适合插入进程或机器边界的“断点”便会自然浮现。即使最初选错，也很容易更改。
>
> 支撑这一愿景的一项概念性理由是：调用位于本地还是远程，不影响程序的正确性。只要对象支持某个特定接口，而且对该接口的支持在语义上正确，那么操作是在同一地址空间内执行、在另一台机器上执行，还是由某件其他设备离线执行，都不会改变程序的正确性。事实上，把位置视为对象实现的一部分，进而视为对象对外部世界隐藏的状态之一，似乎是对面向对象范式的自然延伸。

Such a system would enjoy many advantages. It would allow the task of software maintenance to be changed in a fundamental way. The granularity of change, and therefore of upgrade, could be changed from the level of the entire system (the current model) to the level of the individual object. As long as the interfaces between objects remain constant, the implementations of those objects can be altered at will. Remote services can be moved into an address space, and objects that share an address space can be split and moved to different machines, as local requirements and needs dictate. An object can be repaired and the repair installed without worry that the change will impact the other objects that make up the system. Indeed, this model appears to be the best way to get away from the “Big Wad of Software” model that currently is causing so much trouble.

This vision is centered around the following principles that may, at first, appear plausible:

> 这样的系统会有诸多优势。它能从根本上改变软件维护工作。变更、进而升级的粒度，可以从整个系统级（当前模型）缩小到单个对象级。只要对象之间的接口保持不变，对象实现便可任意改动。远程服务可以移入某个地址空间，共享地址空间的对象也可以根据具体环境的要求与需要拆分并迁往不同机器。修复某个对象并安装补丁时，无须担心这种变更会影响组成系统的其他对象。事实上，这种模型似乎是摆脱当前造成大量麻烦的“大坨软件”（Big Wad of Software）模型的最佳途径。
>
> 这一愿景以如下几条乍看似乎合理的原则为中心：

- there is a single natural object-oriented design for a given application, regardless of the context in which that application will be deployed;
- failure and performance issues are tied to the implementation of the components of an application, and consideration of these issues should be left out of an initial design; and
- the interface of an object is independent of the context in which that object is used.

> - 对于一个给定应用，无论它将部署于何种情境，都只有一种自然的面向对象设计；
> - 故障与性能问题取决于应用各组件的实现，因此初始设计不应考虑这些问题；并且
> - 对象的接口独立于该对象的使用情境。

Unfortunately, all of these principles are false. In what follows, we will show why these principles are mistaken, and why it is important to recognize the fundamental differences between distributed computing and local computing.

> 遗憾的是，这些原则全都是错的。下文将说明它们错在何处，以及为什么认识到分布式计算与本地计算之间的根本差异至关重要。

## 3 Déjà Vu All Over Again｜似曾相识，周而复始

For those of us either old enough to have experienced it or interested enough in the history of computing to have learned about it, the vision of unified objects is quite familiar. The desire to merge the programming and computational models of local and remote computing is not new.

Communications protocol development has tended to follow two paths. One path has emphasized integration with the current language model. The other path has emphasized solving the problems inherent in distributed computing. Both are necessary, and successful advances in distributed computing synthesize elements from both camps.

Historically, the language approach has been the less influential of the two camps. Every ten years (approximately), members of the language camp notice that the number of distributed applications is relatively small. They look at the programming interfaces and decide that the problem is that the programming model is not close enough to whatever programming model is currently in vogue (messages in the 1970s [7], [8], procedure calls in the 1980s [9], [10], [11], and objects in the 1990s [1], [2]). A furious bout of language and protocol design takes place and a new distributed computing paradigm is announced that is compliant with the latest programming model. After several years, the percentage of distributed applications is discovered not to have increased significantly, and the cycle begins anew.

> 对于年长到亲历过那段历史的人，或对计算史兴趣浓厚、足以了解那段历史的人来说，统一对象的愿景相当熟悉。合并本地计算与远程计算的编程模型和计算模型，这一愿望并不新鲜。
>
> 通信协议的发展往往沿着两条路径前进。一条路径强调与当时的语言模型整合；另一条路径强调解决分布式计算固有的问题。二者都不可或缺；分布式计算中成功的进展，会综合两个阵营的要素。
>
> 从历史上看，语言路线是两个阵营中影响力较弱的一方。大约每十年一次，语言阵营的成员会注意到分布式应用数量相对较少。他们审视编程接口，然后断定问题在于：编程模型与当时流行的编程模型还不够接近（20 世纪 70 年代是消息 [7]、[8]，80 年代是过程调用 [9]、[10]、[11]，90 年代则是对象 [1]、[2]）。随后，一阵狂热的语言与协议设计展开，人们宣布一种与最新编程模型相符的新分布式计算范式。几年后，人们发现分布式应用的比例并未显著上升，于是新一轮循环开始。

A possible explanation for this cycle is that each round is an evolutionary stage for both the local and the distributed programming paradigm. The repetition of the pattern is a result of neither model being sufficient to encompass both activities at any previous stage. However, (this explanation continues) each iteration has brought us closer to a unification of the local and distributed computing models. The current iteration, based on the object-oriented approach to both local and distributed programming, will be the one that produces a single computational model that will suffice for both.

A less optimistic explanation of the failure of each attempt at unification holds that any such attempt will fail for the simple reason that programming distributed applications is not the same as programming non-distributed applications. Just making the communications paradigm the same as the language paradigm is insufficient to make programming distributed programs easier, because communicating between the parts of a distributed application is not the difficult part of that application.

> 对这一循环，一种可能的解释是：每一轮都是本地编程范式与分布式编程范式各自演化的一个阶段。之所以反复出现这一模式，是因为在此前任何阶段，两个模型都不足以同时涵盖两类活动。不过（这一解释接着说），每次迭代都让我们更接近本地计算模型与分布式计算模型的统一。当前这一轮同时以面向对象方法处理本地编程与分布式编程，它将会产生一个足以适用于二者的统一计算模型。
>
> 对每次统一尝试为何失败，还有一种不那么乐观的解释：任何此类尝试都会失败，原因很简单——编写分布式应用不同于编写非分布式应用。仅仅让通信范式与语言范式一致，并不足以使分布式程序更容易编写，因为分布式应用各部分之间的通信并不是这种应用的难点所在。

The hard problems in distributed computing are not the problems of how to get things on and off the wire. The hard problems in distributed computing concern dealing with partial failure and the lack of a central resource manager. The hard problems in distributed computing concern insuring adequate performance and dealing with problems of concurrency. The hard problems have to do with differences in memory access paradigms between local and distributed entities. People attempting to write distributed applications quickly discover that they are spending all of their efforts in these areas and not on the communications protocol programming interface.

This is not to argue against pleasant programming interfaces. However, the law of diminishing returns comes into play rather quickly. Even with a perfect programming model of complete transparency between “fine-grained” language-level objects and “larger-grained” distributed objects, the number of distributed applications would not be noticeably larger if these other problems have not been addressed.

> 分布式计算的难题，不在于怎样把数据送上或取下线路。难题在于如何应对局部故障与中央资源管理器的缺失，在于如何确保足够的性能并处理并发问题，还在于本地实体与分布式实体采用不同的内存访问范式。试图编写分布式应用的人很快就会发现，自己的全部精力都花在这些方面，而不是通信协议的编程接口上。
>
> 这并不是反对设计宜用的编程接口。然而，收益递减规律很快就会显现。即便存在一个完美编程模型，能让“细粒度”的语言级对象与“较粗粒度”的分布式对象之间完全透明，只要其他问题没有得到解决，分布式应用的数量也不会明显增加。

All of this suggests that there is interesting and profitable work to be done in distributed computing, but it needs to be done at a much higher-level than that of “fine-grained” object integration. Providing developers with tools that help manage the complexity of handling the problems of distributed application development as opposed to the generic application development is an area that has been poorly addressed.

> 这一切说明，分布式计算领域确实有既有趣又有价值的工作可做，但工作层次必须远高于“细粒度”对象集成。为开发者提供工具，帮助他们管理分布式应用开发问题相对于一般应用开发所特有的复杂性——这一领域迄今处理得很不充分。

<!-- PDF pages 5–8; printed pages 5–8 -->

## 4 Local and Distributed Computing｜本地计算与分布式计算

The major differences between local and distributed computing concern the areas of latency, memory access, partial failure, and concurrency.[^1] The difference in latency is the most obvious, but in many ways is the least fundamental. The often overlooked differences concerning memory access, partial failure, and concurrency are far more difficult to explain away, and the differences concerning partial failure and concurrency make unifying the local and remote computing models impossible without making unacceptable compromises.

> 本地计算与分布式计算的主要差异，涉及延迟、内存访问、局部故障和并发等方面。延迟差异最显而易见，但从许多意义上说，它最不根本。人们经常忽略的内存访问、局部故障与并发差异，更难用解释消解；其中局部故障与并发方面的差异，使得本地计算模型与远程计算模型不可能在不作出不可接受妥协的前提下实现统一。

[^1]: We are not the first to notice these differences; indeed, they are clearly stated in [12].

    > 我们并非最早注意到这些差异的人；事实上，[12] 已清楚陈述了这些差异。

### 4.1 Latency｜延迟

The most obvious difference between a local object invocation and the invocation of an operation on a remote (or possibly remote) object has to do with the latency of the two calls. The difference between the two is currently between four and five orders of magnitude, and given the relative rates at which processor speed and network latency speeds are changing, the difference in the future promises to be at best no better, and will likely be worse. It is this disparity in efficiency that is often seen as the essential difference between local and distributed computing.

Ignoring the difference between the performance of local and remote invocations can lead to designs whose implementations are virtually assured of having performance problems because the design requires a large amount of communication between components that are in different address spaces and on different machines. Ignoring the difference in the time it takes to make a remote object invocation and the time it takes to make a local object invocation is to ignore one of the major design areas of an application. A properly designed application will require determining, by understanding the application being designed, what objects can be made remote and what objects must be clustered together.

> 本地对象调用与对远程（或可能位于远程的）对象执行操作之间，最明显的区别在于两类调用的延迟。目前两者相差四至五个数量级；考虑到处理器速度与网络延迟改善速度的相对变化率，未来这一差距最乐观也不会缩小，而且很可能会扩大。正是这种效率上的悬殊，常被视为本地计算与分布式计算之间的本质区别。
>
> 忽略本地调用与远程调用的性能差异，可能导致某些设计从实现之初便几乎注定出现性能问题，因为这类设计要求位于不同地址空间、不同机器上的组件进行大量通信。忽略远程对象调用与本地对象调用耗时的差异，就是忽略应用设计的一项主要内容。要恰当地设计应用，就必须理解所设计的应用，并据此判断哪些对象可以置于远程，哪些对象必须聚集在一起。

The vision outlined earlier, however, has an answer to this objection. The answer is two-pronged. The first prong is to rely on the steadily increasing speed of the underlying hardware to make the difference in latency irrelevant. This, it is often argued, is what has happened to efficiency concerns having to do with everything from high level languages to virtual memory. Designing at the cutting edge has always required that the hardware catch up before the design is efficient enough for the real world. Arguments from efficiency seem to have gone out of style in software engineering, since in the past such concerns have always been answered by speed increases in the underlying hardware.

The second prong of the reply is to admit to the need for tools that will allow one to see what the pattern of communication is between the objects that make up an application. Once such tools are available, it will be a matter of tuning to bring objects that are in constant contact to the same address space, while moving those that are in relatively infrequent contact to wherever is most convenient. Since the vision allows all objects to communicate using the same underlying mechanism, such tuning will be possible by simply altering the implementation details (such as object location) of the relevant objects. However, it is important to get the application correct first, and after that one can worry about efficiency.

> 然而，前述愿景对这一异议自有回答，而且回答分为两路。第一路是依赖底层硬件速度持续提高，使延迟差异变得无关紧要。人们常说，从高级语言到虚拟内存，围绕效率的种种担忧最后都是这样消失的。走在技术前沿的设计，总要等到硬件迎头赶上，才足以在现实世界中高效运行。软件工程领域似乎已经不再流行从效率出发的论证，因为过去这类担忧总会被底层硬件的提速化解。
>
> 第二路回答承认，我们需要工具来观察组成应用的对象之间采用何种通信模式。一旦有了这样的工具，接下来就是调优：把不断交互的对象放到同一地址空间，把交互相对稀少的对象移到最方便的位置。由于这一愿景允许所有对象使用同一种底层机制通信，调优只须修改相关对象的实现细节（例如对象位置）即可完成。不过，首要的是先让应用正确，之后再操心效率。

Whether or not it will ever become possible to mask the efficiency difference between a local object invocation and a distributed object invocation is not answerable a priori. Fully masking the distinction would require not only advances in the technology underlying remote object invocation, but would also require changes to the general programming model used by developers.

If the only difference between local and distributed object invocations was the difference in the amount of time it took to make the call, one could strive for a future in which the two kinds of calls would be conceptually indistinguishable. Whether the technology of distributed computing has moved far enough along to allow one to plan products based on such technology would be a matter of judgement, and rational people could disagree as to the wisdom of such an approach.

However, the difference in latency between the two kinds of calls is only the most obvious difference. Indeed, this difference is not really the fundamental difference between the two kinds of calls, and that even if it were possible to develop the technology of distributed calls to an extent that the difference in latency between the two sorts of calls was minimal, it would be unwise to construct a programming paradigm that treated the two calls as essentially similar. In fact, the difference in latency between local and remote calls, because it is so obvious, has been the only difference most see between the two, and has tended to mask the more irreconcilable differences.

> 将来是否终有可能掩盖本地对象调用与分布式对象调用之间的效率差异，无法先验地回答。要完全掩盖这一区别，不仅需要远程对象调用底层技术取得进展，还需要改变开发者所用的一般编程模型。
>
> 如果本地对象调用与分布式对象调用之间唯一的区别只是调用耗时，那么人们可以争取在未来让两类调用在概念上不可区分。分布式计算技术是否已发展到足以据此规划产品，是一个需要判断的问题；理性的人完全可能对这种做法是否明智持不同意见。
>
> 然而，两类调用的延迟差异只是最明显的差异。事实上，它并非两者真正的根本区别；即使分布式调用技术能够发展到让两类调用的延迟差异微乎其微，构建一种把它们视作本质相同的编程范式也并不明智。恰恰因为本地调用与远程调用的延迟差异如此显眼，它成了大多数人所看到的唯一差异，并往往遮蔽了那些更不可调和的差异。

### 4.2 Memory access｜内存访问

A more fundamental (but still obvious) difference between local and remote computing concerns the access to memory in the two cases—specifically in the use of pointers. Simply put, pointers in a local address space are not valid in another (remote) address space. The system can paper over this difference, but for such an approach to be successful, the transparency must be complete. Two choices exist: either all memory access must be controlled by the underlying system, or the programmer must be aware of the different types of access—local and remote. There is no inbetween.

If the desire is to completely unify the programming model—to make remote accesses behave as if they were in fact local—the underlying mechanism must totally control all memory access. Providing distributed shared memory is one way of completely relieving the programmer from worrying about remote memory access (or the difference between local and remote). Using the object-oriented paradigm to the fullest, and requiring the programmer to build an application with “objects all the way down,” (that is, only object references or values are passed as method arguments) is another way to eliminate the boundary between local and remote computing. The layer underneath can exploit this approach by marshalling and unmarshalling method arguments and return values for intra-address space transmission.

> 本地计算与远程计算还有一个更根本（却仍然明显）的区别，涉及两种情形下的内存访问，尤其是指针的使用。简单地说，本地地址空间中的指针，在另一个（远程）地址空间中无效。系统可以掩盖这一区别，但这种做法若要成功，透明性就必须彻底。只有两种选择：要么所有内存访问都由底层系统控制，要么程序员必须意识到本地访问与远程访问是两种不同的访问。不存在中间道路。
>
> 如果目标是彻底统一编程模型——让远程访问表现得仿佛确实发生在本地——那么底层机制就必须完全控制所有内存访问。提供分布式共享内存，是让程序员彻底无须操心远程内存访问（或本地与远程之区别）的一种办法。另一种消除本地计算与远程计算边界的办法，是把面向对象范式贯彻到底，要求程序员以“自顶至底皆为对象”的方式构建应用（即方法参数只传递对象引用或值）。底层可以利用这种做法，为地址空间内部传输而对方法参数和返回值进行编组与解组。

But adding a layer that allows the replacement of all pointers to objects with object references only permits the developer to adopt a unified model of object interaction. Such a unified model cannot be enforced unless one also removes the ability to get address-space-relative pointers from the language used by the developer. Such an approach erects a barrier to programmers who want to start writing distributed applications, in that it requires that those programmers learn a new style of programming which does not use address-space-relative pointers. In requiring that programmers learn such a language, moreover, one gives up the complete transparency between local and distributed computing.

Even if one were to provide a language that did not allow obtaining address-space-relative pointers to objects (or returned an object reference whenever such a pointer was requested), one would need to provide an equivalent way of making cross-address space reference to entities other than objects. Most programmers use pointers as references for many different kinds of entities. These pointers must either be replaced with something that can be used in cross-address space calls or the programmer will need to be aware of the difference between such calls (which will either not allow pointers to such entities, or do something special with those pointers) and local calls. Again, while this could be done, it does violate the doctrine of complete unity between local and remote calls. Because of memory access constraints, the two have to differ.

> 但增加一层机制，用对象引用取代所有指向对象的指针，只是允许开发者采用统一的对象交互模型。除非同时从开发者所用语言中移除获取相对于地址空间之指针的能力，否则无法强制执行这个统一模型。这样的做法会为想开始编写分布式应用的程序员设置一道门槛：它要求程序员学习一种不使用相对于地址空间之指针的新编程风格。而且，一旦要求程序员学习这种语言，也就放弃了本地计算与分布式计算之间的完全透明性。
>
> 即使提供一种不允许取得对象的相对于地址空间之指针的语言（或者每当请求这种指针时都返回对象引用），仍需提供一种等效方式，以便跨地址空间引用对象之外的实体。大多数程序员都用指针引用许多不同种类的实体。这些指针要么必须由可用于跨地址空间调用的东西取代，要么程序员必须意识到这类调用与本地调用之间的区别——前者要么不允许指向这类实体的指针，要么会对这些指针作特殊处理。再说一遍，这并非做不到，却违反了本地调用与远程调用完全统一的信条。受内存访问约束，两者不得不有所区别。

The danger lies in promoting the myth that “remote access and local access are exactly the same” and not enforcing the myth. An underlying mechanism that does not unify all memory accesses while still promoting this myth is both misleading and prone to error. Programmers buying into the myth may believe that they do not have to change the way they think about programming. The programmer is therefore quite likely to make the mistake of using a pointer in the wrong context, producing incorrect results. “Remote is just like local,” such programmers think, “so we have just one unified programming model.” Seemingly, programmers need not change their style of programming. In an incomplete implementation of the underlying mechanism, or one that allows an implementation language that in turn allows direct access to local memory, the system does not take care of all memory accesses, and errors are bound to occur. These errors occur because the programmer is not aware of the difference between local and remote access and what is actually happening “under the covers.”

> 危险在于，一面宣扬“远程访问与本地访问完全相同”的神话，一面又不把这个神话强制落实。底层机制若没有统一所有内存访问，却仍宣扬这一神话，既会误导人，也很容易引发错误。相信这个神话的程序员可能会以为，自己无须改变思考编程的方式。于是，程序员很可能犯下在错误情境中使用指针的错误，从而产生不正确的结果。这类程序员会想：“远程就像本地，所以我们只有一个统一的编程模型。”表面看来，程序员不必改变编程风格。如果底层机制实现得不完整，或者它允许使用一种又能直接访问本地内存的实现语言，系统就不会接管所有内存访问，错误必然发生。这些错误之所以发生，是因为程序员没有意识到本地访问与远程访问的区别，也不知道“幕布之下”实际发生了什么。

The alternative is to explain the difference between local and remote access, making the programmer aware that remote address space access is very different from local access. Even if some of the pain is taken away by using an interface definition language like that specified in [1] and having it generate an intelligent language mapping for operation invocation on distributed objects, the programmer aware of the difference will not make the mistake of using pointers for cross-address space access. The programmer will know it is incorrect. By not masking the difference, the programmer is able to learn when to use one method of access and when to use the other.

Just as with latency, it is logically possible that the difference between local and remote memory access could be completely papered over and a single model of both presented to the programmer. When we turn to the problems introduced to distributed computing by partial failure and concurrency, however, it is not clear that such a unification is even conceptually possible.

> 另一种选择，是明确说明本地访问与远程访问的区别，让程序员意识到远程地址空间访问与本地访问大不相同。即便可以采用 [1] 所规定的接口定义语言，并让它为分布式对象上的操作调用生成智能语言映射，从而减轻一些痛苦，意识到这种差异的程序员也不会误用指针进行跨地址空间访问，因为他知道那是不正确的。只有不掩盖区别，程序员才能学会何时使用一种访问方式，何时使用另一种。
>
> 与延迟一样，从逻辑上说，本地内存访问与远程内存访问之间的差异可以被彻底掩盖，并向程序员呈现一个涵盖二者的统一模型。然而，当我们转向局部故障与并发给分布式计算带来的问题时，甚至在概念上能否实现这种统一都不再明确。

### 4.3 Partial failure and concurrency｜局部故障与并发

While unlikely, it is at least logically possible that the differences in latency and memory access between local computing and distributed computing could be masked. It is not clear that such a masking could be done in such a way that the local computing paradigm could be used to produce distributed applications, but it might still be possible to allow some new programming technique to be used for both activities. Such a masking does not even seem to be logically possible, however, in the case of partial failure and concurrency. These aspects appear to be different in kind in the case of distributed and local computing.[^2]

> 尽管希望渺茫，但从逻辑上说，本地计算与分布式计算在延迟和内存访问上的差异至少有可能被掩盖。尚不清楚这种掩盖能否做到让人用本地计算范式开发分布式应用，但或许仍有可能创造某种新编程技术，同时用于两类活动。然而，对于局部故障与并发，这种掩盖似乎连逻辑上的可能性都不存在。这些方面在分布式计算与本地计算中似乎有类别上的不同。

[^2]: In fact, authors such as Schroeder [12] and Hadzilacos and Toueg [13] take partial failure and concurrency to be the defining problems of distributed computing.

    > 事实上，Schroeder [12] 以及 Hadzilacos 和 Toueg [13] 等作者，把局部故障与并发视为分布式计算的定义性问题。

Partial failure is a central reality of distributed computing. Both the local and the distributed world contain components that are subject to periodic failure. In the case of local computing, such failures are either total, affecting all of the entities that are working together in an application, or detectable by some central resource allocator (such as the operating system on the local machine).

This is not the case in distributed computing, where one component (machine, network link) can fail while the others continue. Not only is the failure of the distributed components independent, but there is no common agent that is able to determine what component has failed and inform the other components of that failure, no global state that can be examined that allows determination of exactly what error has occurred. In a distributed system, the failure of a network link is indistinguishable from the failure of a processor on the other side of that link.

> 局部故障是分布式计算的核心现实。本地世界和分布式世界都包含会不时发生故障的组件。在本地计算中，这类故障要么是全局性的，会影响应用中协同工作的所有实体；要么可以由某个中央资源分配器（例如本地机器的操作系统）检测出来。
>
> 分布式计算并非如此：一个组件（机器、网络链路）可能发生故障，其他组件却继续运行。分布式组件不仅彼此独立地发生故障，而且不存在一个共同代理，既能判定哪个组件出了故障，又能把故障告知其他组件；也不存在一种可供检查的全局状态，让人能准确判断发生了什么错误。在分布式系统中，网络链路故障与链路另一端的处理器故障无法区分。

These sorts of failures are not the same as mere exception raising or the inability to complete a task, which can occur in the case of local computing. This type of failure is caused when a machine crashes during the execution of an object invocation or a network link goes down, occurrences that cause the target object to simply disappear rather than return control to the caller. A central problem in distributed computing is insuring that the state of the whole system is consistent after such a failure; this is a problem that simply does not occur in local computing.

The reality of partial failure has a profound effect on how one designs interfaces and on the semantics of the operations in an interface. Partial failure requires that programs deal with indeterminacy. When a local component fails, it is possible to know the state of the system that caused the failure and the state of the system after the failure. No such determination can be made in the case of a distributed system. Instead, the interfaces that are used for the communication must be designed in such a way that it is possible for the objects to react in a consistent way to possible partial failures.

> 这类故障不同于本地计算中也可能出现的单纯抛出异常或无法完成任务。它发生在执行对象调用期间机器崩溃或网络链路中断之时：此时目标对象会干脆消失，而不是把控制权返回给调用方。分布式计算的一项核心问题，是确保这种故障发生后整个系统的状态仍保持一致；在本地计算中根本不会出现这个问题。
>
> 局部故障这一现实，会深刻影响接口的设计方式和接口中各项操作的语义。局部故障要求程序处理不确定性。本地组件发生故障时，可以知道导致故障的系统状态，也可以知道故障后的系统状态；分布式系统中则无法作出这样的判定。因此，必须把用于通信的接口设计成：面对可能发生的局部故障，对象仍能以一致的方式作出反应。

Being robust in the face of partial failure requires some expression at the interface level. Merely improving the implementation of one component is not sufficient. The interfaces that connect the components must be able to state whenever possible the cause of failure, and there must be interfaces that allow reconstruction of a reasonable state when failure occurs and the cause cannot be determined.

If an object is coresident in an address space with its caller, partial failure is not possible. A function may not complete normally, but it always completes. There is no indeterminism about how much of the computation completed. Partial completion can occur only as a result of circumstances that will cause the other components to fail.

The addition of partial failure as a possibility in the case of distributed computing does not mean that a single object model cannot be used for both distributed computing and local computing. The question is not “can you make remote method invocation look like local method invocation?” but rather “what is the price of making remote method invocation identical to local method invocation?” One of two paths must be chosen if one is going to have a unified model.

> 要在局部故障面前保持健壮，就必须在接口层有所表达。仅仅改进某个组件的实现并不够。连接组件的接口必须尽可能说明故障原因；而当故障发生且原因无法确定时，还必须有接口允许重建一个合理的状态。
>
> 如果对象与其调用方同驻一个地址空间，就不可能发生局部故障。函数可能无法正常完成，但它总会结束。究竟完成了多少计算，并不存在不确定性。只有在某些也会导致其他组件一并故障的情况下，才可能出现部分完成。
>
> 分布式计算多出了局部故障这种可能性，并不意味着不能让分布式计算与本地计算采用同一种对象模型。问题不是“你能否让远程方法调用看起来像本地方法调用？”，而是“让远程方法调用与本地方法调用完全相同，要付出什么代价？”若要采用统一模型，就必须在两条路径中选择一条。

The first path is to treat all objects as if they were local and design all interfaces as if the objects calling them, and being called by them, were local. The result of choosing this path is that the resulting model, when used to produce distributed systems, is essentially indeterministic in the face of partial failure and consequently fragile and non-robust. This path essentially requires ignoring the extra failure modes of distributed computing. Since one can’t get rid of those failures, the price of adopting the model is to require that such failures are unhandled and catastrophic.

The other path is to design all interfaces as if they were remote. That is, the semantics and operations are all designed to be deterministic in the face of failure, both total and partial. However, this introduces unnecessary guarantees and semantics for objects that are never intended to be used remotely. Like the approach to memory access that attempts to require that all access is through system-defined references instead of pointers, this approach must also either rely on the discipline of the programmers using the system or change the implementation language so that all of the forms of distributed indeterminacy are forced to be dealt with on all object invocations.

> 第一条路径，是把所有对象都当成本地对象，并在设计全部接口时假定调用它们的对象与被它们调用的对象均位于本地。选择这条路径的结果是：由此得到的模型一旦用于构建分布式系统，面对局部故障便具有本质上的不确定性，因而脆弱而不健壮。这条路径实质上要求忽略分布式计算额外的故障模式。既然无法消除这些故障，采用该模型的代价，就是让这些故障得不到处理，并成为灾难性故障。
>
> 另一条路径，是把所有接口都当作远程接口来设计。也就是说，所有语义与操作都被设计成面对全局故障和局部故障时仍具有确定性。然而，这会给那些从未打算远程使用的对象引入不必要的保证与语义。如同那种要求所有内存访问都通过系统定义的引用、而不是指针进行的做法一样，这条路径要么必须依靠使用系统的程序员严守纪律，要么必须修改实现语言，强迫所有对象调用处理分布式环境中各种形式的不确定性。

This approach would also defeat the overall purpose of unifying the object models. The real reason for attempting such a unification is to make distributed computing more like local computing and thus make distributed computing easier. This second approach to unifying the models makes local computing as complex as distributed computing. Rather than encouraging the production of distributed applications, such a model will discourage its own adoption by making all object-based computing more difficult.

Similar arguments hold for concurrency. Distributed objects by their nature must handle concurrent method invocations. The same dichotomy applies if one insists on a unified programming model. Either all objects must bear the weight of concurrency semantics, or all objects must ignore the problem and hope for the best when distributed. Again, this is an interface issue and not solely an implementation issue, since dealing with concurrency can take place only by passing information from one object to another through the agency of the interface. So either the overall programming model must ignore significant modes of failure, resulting in a fragile system; or the overall programming model must assume a worst-case complexity model for all objects within a program, making the production of any program, distributed or not, more difficult.

> 这种做法还会挫败统一对象模型的总体目的。试图统一的真正原因，是让分布式计算更像本地计算，从而使分布式计算更容易。这第二种统一模型的做法，却让本地计算变得与分布式计算一样复杂。它非但不会鼓励人们开发分布式应用，反而会让所有基于对象的计算变得更困难，从而使人们不愿采用该模型本身。
>
> 类似的论证也适用于并发。分布式对象由于自身性质，必须处理并发的方法调用。如果坚持采用统一编程模型，同样会面临二选一：要么所有对象都必须承担并发语义的重负；要么所有对象都忽略这个问题，等到被分布式部署时只能听天由命。再者，这是接口问题，而不只是实现问题，因为只有借助接口把信息从一个对象传给另一个对象，才能处理并发。因此，要么总体编程模型忽略重要的故障模式，得到一个脆弱的系统；要么总体编程模型为程序内所有对象都采用最坏情形的复杂度模型，使任何程序——无论是否分布式——都更难开发。

One might argue that a multi-threaded application needs to deal with these same issues. However, there is a subtle difference. In a multi-threaded application, there is no real source of indeterminacy of invocations of operations. The application programmer has complete control over invocation order when desired. A distributed system by its nature introduces truly asynchronous operation invocations. Further, a non-distributed system, even when multi-threaded, is layered on top of a single operating system that can aid the communication between objects and can be used to determine and aid in synchronization and in the recovery of failure. A distributed system, on the other hand, has no single point of resource allocation, synchronization, or failure recovery, and thus is conceptually very different.

> 有人或许会说，多线程应用也需要处理这些问题。然而，两者有一个微妙的区别。在多线程应用中，操作调用并没有真正的不确定性来源；需要时，应用程序员可以完全控制调用顺序。分布式系统由于自身性质，会引入真正异步的操作调用。此外，即便采用多线程，非分布式系统仍构筑在单一操作系统之上；该操作系统能协助对象间通信，也能用于判定并协助同步与故障恢复。相较之下，分布式系统并不存在统一的资源分配点、同步点或故障恢复点，因此在概念上大不相同。

<!-- PDF pages 9–10; printed pages 9–10 -->

## 5 The Myth of “Quality of Service”｜“服务质量”的神话

One could take the position that the way an object deals with latency, memory access, partial failure, and concurrency control is really an aspect of the implementation of that object, and is best described as part of the “quality of service” provided by that implementation. Different implementations of an interface may provide different levels of reliability, scalability, or performance. If one wants to build a more reliable system, one merely needs to choose more reliable implementations of the interfaces making up the system.

On the surface, this seems quite reasonable. If I want a more robust system, I go to my catalog of component vendors. I quiz them about their test methods. I see if they have ISO9000 certification, and I buy my components from the one I trust the most. The components all comply with the defined interfaces, so I can plug them right in; my system is robust and reliable, and I’m happy.

> 有一种立场认为，对象处理延迟、内存访问、局部故障和并发控制的方式，其实只是该对象实现的一个方面，最好把它描述为该实现所提供的“服务质量”的一部分。同一接口的不同实现，可以提供不同水平的可靠性、可扩展性或性能。若想构建更可靠的系统，只须为组成系统的各个接口选择更可靠的实现。
>
> 表面看来，这颇为合理。如果想要更健壮的系统，我就翻开组件供应商名录，盘问他们的测试方法，看看他们是否通过 ISO9000 认证，再从最信任的供应商那里购买组件。所有组件都符合已经定义的接口，所以我可以直接插入使用；我的系统既健壮又可靠，我也很满意。

Let us imagine that I build an application that uses the (mythical) queue interface to enqueue work for some component. My application dutifully enqueues records that represent work to be done. Another application dutifully dequeues them and performs the work. After a while, I notice that my application crashes due to time-outs. I find this extremely annoying, but realize that it’s my fault. My application just isn’t robust enough. It gives up too easily on a time-out. So I change my application to retry the operation until it succeeds. Now I’m happy. I almost never see a time-out. Unfortunately, I now have another problem. Some of the requests seem to get processed two, three, four, or more times. How can this be? The component I bought which implements the queue has allegedly been rigorously tested. It shouldn’t be doing this. I’m angry. I call the vendor and yell at him. After much finger-pointing and research, the culprit is found. The problem turns out to be the way I’m using the queue. Because of my handling of partial failures (which in my naiveté, I had thought to be total), I have been enqueuing work requests multiple times.

> 设想我构建了一个应用，它使用一个（虚构的）队列接口，为某个组件把工作排入队列。我的应用尽职尽责地把代表待办工作的记录入队；另一个应用也尽职尽责地让它们出队并执行工作。过了一阵，我发现应用会因超时而崩溃。这让我非常恼火，但我意识到是自己的错：应用不够健壮，一遇超时就太轻易放弃。于是我修改应用，让它不断重试操作，直到成功。现在我满意了，几乎再也看不到超时。可惜，我又遇到了另一个问题。有些请求似乎被处理了两次、三次、四次，甚至更多次。这怎么可能？我买来的队列实现组件据说经过了严格测试，不该这样。我很生气，打电话把供应商痛骂一顿。经过漫长的互相指责和调查，罪魁祸首终于找到了：问题出在我使用队列的方式上。因为我处理的是局部故障（出于天真，我原以为它们是全局故障），所以把工作请求多次排入了队列。

Well, I yell at the vendor that it is still their fault. Their queue should be detecting the duplicate entry and removing it. I’m not going to continue using this software unless this is fixed. But, since the entities being enqueued are just values, there is no way to do duplicate elimination. The only way to fix this is to change the protocol to add request IDs. But since this is a standardized interface, there is no way to do this.

The moral of this tale is that robustness is not simply a function of the implementations of the interfaces that make up the system. While robustness of the individual components has some effect on the robustness of the overall systems, it is not the sole factor determining system robustness. Many aspects of robustness can be reflected only at the protocol/interface level.

Similar situations can be found throughout the standard set of interfaces. Suppose I want to reliably remove a name from a context. I would be tempted to write code that looks like:

> 好吧，我继续对供应商大吼：这仍然是他们的错。队列本该检测重复条目并将其删除；除非修好，否则我不会继续使用这款软件。然而，由于入队的实体只是值，根本无法消除重复。唯一的修复方法是修改协议、添加请求 ID；但这是一个标准化接口，因此没法这样做。
>
> 这个故事的寓意是：系统是否健壮，并不只是取决于组成系统的各个接口如何实现。单个组件的健壮性固然会影响整个系统的健壮性，却不是决定系统健壮性的唯一因素。健壮性的许多方面，只能在协议/接口层体现。
>
> 整套标准接口中到处都能发现类似情形。假设我想从某个上下文中可靠地移除一个名称，我可能会忍不住写出如下代码：

```cpp
while (true) {
    try {
        context->remove(name);
        break;
    }
    catch (NotFoundInContext) {
        break;
    }
    catch (NetworkServerFaliure) {
        continue;
    }
}
```

> 代码保持原有标识符与拼写：它会持续尝试该操作，成功或发现名称不存在时退出，遇到网络服务器故障则继续重试。

That is, I keep trying the operation until it succeeds (or until I crash). The problem is that my connection to the name server may have gone down, but another client’s may have stayed up. I may have, in fact, successfully removed the name but not discovered it because of a network disconnection. The other client then adds the same name, which I then remove. Unless the naming interface includes an operation to lock a naming context, there is no way that I can make this operation completely robust. Again, we see that robustness/reliability needs to be expressed at the interface level. In the design of any operation, the question has to be asked: what happens if the client chooses to repeat this operation with the exact same parameters as previously? What mechanisms are needed to ensure that they get the desired semantics? These are things that can be expressed only at the interface level. These are issues that can’t be answered by supplying a “more robust implementation” because the lack of robustness is inherent in the interface and not something that can be changed by altering the implementation.

> 也就是说，我不断尝试该操作，直到它成功（或直到程序崩溃）。问题在于，我与名称服务器的连接可能已经中断，另一个客户端的连接却仍然正常。事实上，我或许已经成功移除了名称，只是因为网络断开而未能得知。另一个客户端随后又添加同名项，而我接下来又把它移除了。除非命名接口包含锁定命名上下文的操作，否则我无法让这项操作完全健壮。我们再次看到，健壮性/可靠性需要在接口层表达。设计任何操作时都必须问：如果客户端选择以与上一次完全相同的参数重复此操作，会发生什么？需要什么机制，才能确保它获得期望的语义？这些内容只能在接口层表达。提供一个“更健壮的实现”无法回答这些问题，因为不健壮性是接口固有的，不能靠修改实现来改变。

Similar arguments can be made about performance. Suppose an interface describes an object which maintains sets of other objects. A defining property of sets is that there are no duplicates. Thus, the implementation of this object needs to do duplicate elimination. If the interfaces in the system do not provide a way of testing equality of reference, the objects in the set must be queried to determine equality. Thus, duplicate elimination can be done only by interacting with the objects in the set. It doesn’t matter how fast the objects in the set implement the equality operation. The overall performance of eliminating duplicates is going to be governed by the latency in communicating over the slowest communications link involved. There is no change in the set implementations that can overcome this. An interface design issue has put an upper bound on the performance of this operation.

> 对性能也可以作类似论证。假设某个接口描述了一个维护其他对象之集合的对象。集合的定义性属性之一是不含重复项，因此这个对象的实现需要消除重复。如果系统中的接口没有提供检验引用相等性的方式，就必须查询集合中的对象来判断是否相等。这样一来，只有与集合中的对象交互才能消除重复。集合里的对象实现相等性操作有多快并不重要；消除重复的总体性能，将由所有相关通信链路中最慢一条链路的通信延迟所支配。无论怎样修改集合实现，都无法克服这一点。一个接口设计问题，给这项操作的性能设下了上限。

## 6 Lessons from NFS｜NFS 的教训

We do not need to look far to see the consequences of ignoring the distinction between local and distributed computing at the interface level. NFS®, Sun’s distributed computing file system [14], [15] is an example of a non-distributed application programer interface (API) (open, read, write, close, etc.) re-implemented in a distributed way.

Before NFS and other network file systems, an error status returned from one of these calls indicated something rare: a full disk, or a catastrophe such as a disk crash. Most failures simply crashed the application along with the file system. Further, these errors generally reflected a situation that was either catastrophic for the program receiving the error or one that the user running the program could do something about.

NFS opened the door to partial failure within a file system. It has essentially two modes for dealing with an inaccessible file server: soft mounting and hard mounting. But since the designers of NFS were unwilling (for easily understandable reasons) to change the interface to the file system to reflect the new, distributed nature of file access, neither option is particularly robust.

> 无须舍近求远，就能看到在接口层忽略本地计算与分布式计算之区别会导致什么后果。NFS® 是 Sun 的分布式计算文件系统 [14]、[15]，它把一个非分布式的应用程序员接口（API）（open、read、write、close 等）以分布式方式重新实现。
>
> 在 NFS 和其他网络文件系统出现之前，这类调用若返回错误状态，通常表示某种罕见情形：磁盘已满，或磁盘崩溃一类灾难。大多数故障会让应用与文件系统一同崩溃。此外，这些错误通常反映两类状况之一：要么对收到错误的程序而言是灾难性的，要么运行程序的用户尚可采取某些应对措施。
>
> NFS 为文件系统内部的局部故障打开了大门。对于不可访问的文件服务器，它实质上有两种处理模式：软挂载与硬挂载。但 NFS 的设计者不愿（理由很容易理解）修改文件系统接口，以反映文件访问新的分布式性质，因此两个选项都称不上特别健壮。

Soft mounts expose network or server failure to the client program. Read and write operations return a failure status much more often than in the single-system case, and programs written with no allowance for these failures can easily corrupt the files used by the program. In the early days of NFS, system administrators tried to tune various parameters (time-out length, number of retries) to avoid these problems. These efforts failed. Today, soft mounts are seldom used, and when they are used, their use is generally restricted to read-only file systems or special applications.

Hard mounts mean that the application hangs until the server comes back up. This generally prevents a client program from seeing partial failure, but it leads to a malady familiar to users of workstation networks: one server crashes, and many workstations—even those apparently having nothing to do with that server—freeze. Figuring out the chain of causality is very difficult, and even when the cause of the failure can be determined, the individual user can rarely do anything about it but wait. This kind of brittleness can be reduced only with strong policies and network administration aimed at reducing interdependencies. Nonetheless, hard mounts are now almost universal.

> 软挂载会把网络或服务器故障暴露给客户端程序。读写操作返回失败状态的频率远高于单机系统；若程序编写时没有为这类故障留出余地，便很容易损坏它所使用的文件。NFS 早期，系统管理员试图通过调节各种参数（超时时长、重试次数）来避免这些问题，但这些尝试失败了。如今，软挂载很少使用；即便使用，通常也仅限于只读文件系统或特殊应用。
>
> 硬挂载意味着应用会一直挂起，直到服务器恢复。这通常会阻止客户端程序察觉局部故障，却会带来工作站网络用户十分熟悉的一种顽疾：一台服务器崩溃，许多工作站——甚至是看似与该服务器毫无关系的工作站——都会冻结。梳理其中的因果链非常困难；即使能确定故障原因，单个用户往往也束手无策，只能等待。要减少这种脆弱性，只能依靠旨在降低相互依赖的严格策略与网络管理。尽管如此，硬挂载如今几乎无处不在。

Note that because the NFS protocol is stateless, it assumes clients contain no state of interest with respect to the protocol; in other words, the server doesn’t care what happens to the client. NFS is also a “pure” client-server protocol, which means that failure can be limited to three parties: the client, the server, or the network. This combination of features means that failure modes are simpler than in the more general case of peer-to-peer distributed object-oriented applications where no such limitation on shared state can be made and where servers are themselves clients of other servers. Such peer-to-peer distributed applications can and will fail in far more intricate ways than are currently possible with NFS.

The limitations on the reliability and robustness of NFS have nothing to do with the implementation of the parts of that system. There is no “quality of service” that can be improved to eliminate the need for hard mounting NFS volumes. The problem can be traced to the interface upon which NFS is built, an interface that was designed for non-distributed computing where partial failure was not possible. The reliability of NFS cannot be changed without a change to that interface, a change that will reflect the distributed nature of the application.

> 请注意，由于 NFS 协议是无状态的，它假定客户端不包含任何与协议有关且值得关注的状态；换言之，服务器不在乎客户端发生什么。NFS 还是一种“纯粹的”客户端—服务器协议，这意味着故障可限制在三方之一：客户端、服务器或网络。这些特征组合在一起，使其故障模式比更一般的点对点分布式面向对象应用简单；在后者中，无法对共享状态作出同样限制，而且服务器本身又是其他服务器的客户端。这类点对点分布式应用能够、也必将以远比 NFS 当前所可能出现的方式更为错综复杂地发生故障。
>
> NFS 在可靠性与健壮性上的局限，与系统各部分的实现无关。不存在某种可以通过改进来消除 NFS 卷硬挂载需求的“服务质量”。问题可以追溯到 NFS 所建立的接口：这个接口是为不会发生局部故障的非分布式计算而设计的。若不修改该接口，NFS 的可靠性就无法改变；而这种修改必须反映应用的分布式性质。

This is not to say that NFS has not been successful. In fact, NFS is arguably the most successful distributed application that has been produced. But the limitations on the robustness have set a limitation on the scalability of NFS. Because of the intrinsic unreliability of the NFS protocol, use of NFS is limited to fairly small numbers of machines, geographically co-located and centrally administered. The way NFS has dealt with partial failure has been to informally require a centralized resource manager (a system administrator) who can detect system failure, initiate resource reclamation and insure system consistency. But by introducing this central resource manager, one could argue that NFS is no longer a genuinely distributed application.

> 这并不是说 NFS 没有取得成功。事实上，NFS 堪称迄今最成功的分布式应用。然而，健壮性上的局限也限制了 NFS 的可扩展性。由于 NFS 协议固有的不可靠性，NFS 的使用局限于数量较少、地理上共置且受集中管理的机器。NFS 应对局部故障的办法，是非正式地要求一个集中的资源管理者（系统管理员）存在，由其检测系统故障、启动资源回收并确保系统一致性。但也可以说，引入这个中央资源管理者之后，NFS 就不再是一个真正的分布式应用。

<!-- PDF pages 11–12; printed pages 11–12 -->

## 7 Taking the Difference Seriously｜认真对待差异

Differences in latency, memory access, partial failure, and concurrency make merging of the computational models of local and distributed computing both unwise to attempt and unable to succeed. Merging the models by making local computing follow the model of distributed computing would require major changes in implementation languages (or in how those languages are used) and make local computing far more complex than is otherwise necessary. Merging the models by attempting to make distributed computing follow the model of local computing requires ignoring the different failure modes and basic indeterminacy inherent in distributed computing, leading to systems that are unreliable and incapable of scaling beyond small groups of machines that are geographically co-located and centrally administered.

A better approach is to accept that there are irreconcilable differences between local and distributed computing, and to be conscious of those differences at all stages of the design and implementation of distributed applications. Rather than trying to merge local and remote objects, engineers need to be constantly reminded of the differences between the two, and know when it is appropriate to use each kind of object.

> 延迟、内存访问、局部故障与并发方面的差异，使得合并本地计算与分布式计算的计算模型既不明智，也不可能成功。若让本地计算遵循分布式计算模型来合并二者，就必须大幅修改实现语言（或这些语言的使用方式），并让本地计算变得远比实际所需更复杂。若试图让分布式计算遵循本地计算模型来合并二者，则必须忽略分布式计算固有的不同故障模式与基本不确定性，最终得到不可靠的系统；这种系统无法扩展到地理上共置、受集中管理的少量机器之外。
>
> 更好的办法，是承认本地计算与分布式计算之间存在不可调和的差异，并在分布式应用设计与实现的所有阶段始终意识到这些差异。工程师不应试图合并本地对象与远程对象，而应不断得到提醒，牢记两者的区别，并知道何时适合使用哪一种对象。

Accepting the fundamental difference between local and remote objects does not mean that either sort of object will require its interface to be defined differently. An interface definition language such as IDL can still be used to specify the set of interfaces that define objects. However, an additional part of the definition of a class of objects will be the specification of whether those objects are meant to be used locally or remotely. This decision will need to consider what the anticipated message frequency is for the object, and whether clients of the object can accept the indeterminacy implied by remote access. The decision will be reflected in the interface to the object indirectly, in that the interface for objects that are meant to be accessed remotely will contain operations that allow reliability in the face of partial failure.

It is entirely possible that a given object will often need to be accessed by some objects in ways that cannot allow indeterminacy, and by other objects relatively rarely and in a way that does allow indeterminacy. Such cases should be split into two objects (which might share an implementation) with one having an interface that is best for local access and the other having an interface that is best for remote access.

> 承认本地对象与远程对象的根本区别，并不意味着两类对象的接口必须以不同方式定义。仍然可以使用 IDL 之类的接口定义语言，规定用于定义对象的接口集合。不过，对象类的定义还将多出一项内容：指明这些对象是供本地使用还是远程使用。作出这一决定时，需要考虑对象预期的消息频率，以及对象的客户端能否接受远程访问所隐含的不确定性。这个决定会间接体现在对象接口中：供远程访问的对象，其接口会包含一些操作，使它在局部故障面前仍可保持可靠。
>
> 完全可能出现这样的情况：某个给定对象需要经常由一些对象以不容许不确定性的方式访问，同时又会相对少见地由另一些对象以容许不确定性的方式访问。这种情况下，应把它拆成两个对象（两者可以共享一个实现）：一个具有最适合本地访问的接口，另一个具有最适合远程访问的接口。

A compiler for the interface definition language used to specify classes of objects will need to alter its output based on whether the class definition being compiled is for a class to be used locally or a class being used remotely. For interfaces meant for distributed objects, the code produced might be very much like that generated by RPC stub compilers today. Code for a local interface, however, could be much simpler, probably requiring little more than a class definition in the target language.

While writing code, engineers will have to know whether they are sending messages to local or remote objects, and access those objects differently. While this might seem to add to the programming difficulty, it will in fact aid the programmer by providing a framework under which he or she can learn what to expect from the different kinds of calls. To program completely in the local environment, according to this model, will not require any changes from the programmer’s point of view. The discipline of defining classes of objects using an interface definition language will insure the desired separation of interface from implementation, but the actual process of implementing an interface will be no different than what is done today in an object-oriented language.

> 用于规定对象类的接口定义语言编译器，需要根据当前编译的类定义是供本地使用还是远程使用来改变输出。对于面向分布式对象的接口，生成的代码可能与当今 RPC 存根编译器生成的代码十分相似；本地接口的代码则可以简单得多，或许只需目标语言中的一个类定义。
>
> 编写代码时，工程师必须知道自己是在向本地对象还是远程对象发送消息，并以不同方式访问两类对象。这看似增加了编程难度，实际却能帮助程序员：它提供了一个框架，让程序员学会对不同类型的调用分别抱有何种预期。按照这一模型，完全在本地环境中编程，从程序员的角度看不需要任何改变。使用接口定义语言定义对象类这一纪律，会确保接口与实现按期望分离；但实现接口的实际过程，与当今在面向对象语言中的做法并无不同。

Programming a distributed application will require the use of different techniques than those used for non-distributed applications. Programming a distributed application will require thinking about the problem in a different way than before it was thought about when the solution was a non-distributed application. But that is only to be expected. Distributed objects are different from local objects, and keeping that difference visible will keep the programmer from forgetting the difference and making mistakes. Knowing that an object is outside of the local address space, and perhaps on a different machine, will remind the programmer that he or she needs to program in a way that reflects the kinds of failures, indeterminacy, and concurrency constraints inherent in the use of such objects. Making the difference visible will aid in making the difference part of the design of the system.

Accepting that local and distributed computing are different in an irreconcilable way will also allow an organization to allocate its research and engineering resources more wisely. Rather than using those resources in attempts to paper over the differences between the two kinds of computing, resources can be directed at improving the performance and reliability of each.

> 编写分布式应用，需要采用不同于非分布式应用的技术。以往解决方案是非分布式应用时，人们用一种方式思考问题；现在编写分布式应用，就必须换一种方式思考。但这本就在预料之中。分布式对象不同于本地对象；让这一区别保持可见，可以防止程序员忘记区别而犯错。知道对象位于本地地址空间之外、或许还位于另一台机器上，会提醒程序员：编程方式必须反映使用这类对象所固有的故障类型、不确定性与并发约束。让区别可见，有助于把区别纳入系统设计。
>
> 承认本地计算与分布式计算以不可调和的方式彼此不同，还能让组织更明智地分配研究与工程资源。与其耗费资源去掩盖两类计算的差异，不如把资源分别用于提高二者的性能与可靠性。

One consequence of the view espoused here is that it is a mistake to attempt to construct a system that is “objects all the way down” if one understands the goal as a distributed system constructed of the same kind of objects all the way down. There will be a line where the object model changes; on one side of the line will be distributed objects, and on the other side of the line there will (perhaps) be local objects. On either side of the line, entities on the other side of the line will be opaque; thus one distributed object will not know (or care) if the implementation of another distributed object with which it communicates is made up of objects or is implemented in some other way. Objects on different sides of the line will differ in kind and not just in degree; in particular, the objects will differ in the kinds of failure modes with which they must deal.

> 本文所主张的观点有一个推论：如果把“自顶至底皆为对象”理解为以同一种对象从上到下构建分布式系统，那么试图构建这样的系统就是错误的。对象模型会在某条界线上发生变化：界线一边是分布式对象，另一边则（可能）是本地对象。无论站在哪一边，界线另一边的实体都是不透明的；因此，一个分布式对象既不知道、也不关心与之通信的另一个分布式对象，其实现是由对象组成还是采用了其他方式。界线两边的对象不只是程度有别，而是种类不同；尤其是，它们必须处理的故障模式并不相同。

## 8 A Middle Ground｜中间地带

As noted in Section 2, the distinction between local and distributed objects as we are using the terms is not exhaustive. In particular, there is a third category of objects made up of those that are in different address spaces but are guaranteed to be on the same machine. These are the sorts of objects, for example, that appear to be the basis of systems such as Spring [16] or Clouds [4]. These objects have some of the characteristics of distributed objects, such as increased latency in comparison to local objects and the need for a different model of memory access. However, these objects also share characteristics of local objects, including sharing underlying resource management and failure modes that are more nearly deterministic.

It is possible to make the programming model for such “local-remote” objects more similar to the programming model for local objects than can be done for the general case of distributed objects. Even though the objects are in different address spaces, they are managed by a single resource manager. Because of this, partial failure and the indeterminacy that it brings can be avoided. The programming model for such objects will still differ from that used for objects in the same address space with respect to latency, but the added latency can be reduced to generally acceptable levels. The programming models will still necessarily differ on methods of memory access and concurrency, but these do not have as great an effect on the construction of interfaces as additional failure modes.

> 如第 2 节所述，按本文对术语的用法，本地对象与分布式对象之分并未穷尽所有类别。具体来说，还有第三类对象：它们位于不同地址空间，但可以保证处于同一台机器上。例如，这类对象似乎正是 Spring [16] 或 Clouds [4] 等系统的基础。它们具有分布式对象的某些特征，例如比本地对象延迟更高，并且需要不同的内存访问模型；但它们也具有本地对象的一些特征，包括共享底层资源管理，以及故障模式更接近确定性。
>
> 与一般的分布式对象相比，可以让这类“本地—远程”对象的编程模型更接近本地对象的编程模型。尽管对象位于不同地址空间，却由单一资源管理器统一管理。因此，可以避免局部故障及其带来的不确定性。这类对象的编程模型在延迟方面仍不同于同一地址空间中的对象，但新增延迟可以降低到通常可接受的水平。在内存访问方式与并发方面，两种编程模型仍必然有所不同；不过与新增故障模式相比，这些差异对接口构造的影响没有那么大。

The other reason for treating this class of objects separately from either local objects or generally distributed objects is that a compiler for an interface definition language can be significantly optimized for such cases. Parameter and result passing can be done via shared memory if it is known that the objects communicating are on the same machine. At the very least, marshalling of parameters and the unmarshalling of results can be avoided.

The class of locally distributed objects also forms a group that can lead to significant gains in software modularity. Applications made up of collections of such objects would have the advantage of forced and guaranteed separation between the interface to an object and the implementation of that object, and would allow the replacement of one implementation with another without affecting other parts of the system. Because of this, it might be advantageous to investigate the uses of such a system. However, this activity should not be confused with the unification of local objects with the kinds of distributed objects we have been discussing.

> 把这类对象与本地对象及一般分布式对象区别对待，还有另一个理由：接口定义语言的编译器可以针对这类情形进行显著优化。如果已知通信对象处于同一台机器上，就可以通过共享内存传递参数与结果。至少，参数编组与结果解组可以省去。
>
> 本地分布式对象这一类别还构成一个能够显著提升软件模块化程度的群组。由这类对象集合组成的应用，具有一种优势：对象接口与对象实现之间的分离得到强制和保证；而且可以用一种实现替换另一种实现，而不影响系统的其他部分。因此，研究这类系统的用途或许颇有裨益。不过，不应把这项工作与统一本地对象及本文一直讨论的那类分布式对象混为一谈。

<!-- PDF page 13; printed page 13 -->

## 9 References｜参考文献

[1] The Object Management Group. “Common Object Request Broker: Architecture and Specification.” *OMG Document Number 91.12.1* (1991).

> [1] 对象管理组织。《通用对象请求代理：体系结构与规范》。*OMG 文档编号 91.12.1*（1991）。

[2] [Parrington, Graham D. “Reliable Distributed Programming in C++: The Arjuna Approach.” *USENIX 1990 C++ Conference Proceedings* (1991).

> [2] [Parrington, Graham D.《C++ 中的可靠分布式编程：Arjuna 方法》。*USENIX 1990 C++ 会议论文集*（1991）。

[3] Black, A., N. Hutchinson, E. Jul, H. Levy, and L. Carter. “Distribution and Abstract Types in Emerald.” *IEEE Transactions on Software Engineering* SE-13, no. 1, (January 1987).

> [3] Black, A.、N. Hutchinson、E. Jul、H. Levy、L. Carter。《Emerald 中的分布与抽象类型》。*IEEE 软件工程汇刊* SE-13，第 1 期（1987 年 1 月）。

[4] Dasgupta, P., R. J. Leblanc, and E. Spafford. “The Clouds Project: Designing and Implementing a Fault Tolerant Distributed Operating System.” *Georgia Institute of Technology Technical Report GIT-ICS-85/29.* (1985).

> [4] Dasgupta, P.、R. J. Leblanc、E. Spafford。《Clouds 项目：容错分布式操作系统的设计与实现》。*佐治亚理工学院技术报告 GIT-ICS-85/29*（1985）。

[5] Microsoft Corporation. *Object Linking and Embedding Programmers Reference.* version 1. Microsoft Press, 1992.

> [5] 微软公司。*对象链接与嵌入程序员参考手册*。版本 1。微软出版社，1992。

[6] Linton, Mark. “A Taste of Fresco.” Tutorial given at the *8th Annual X Technical Conference* (January 1994).

> [6] Linton, Mark。《Fresco 初体验》。第 8 届 X 技术年会教程（1994 年 1 月）。

[7] Jaayeri, M., C. Ghezzi, D. Hoffman, D. Middleton, and M. Smotherman. “CSP/80: A Language for Communicating Sequential Processes.” *Proceedings: Distributed Computing CompCon* (Fall 1980).

> [7] Jaayeri, M.、C. Ghezzi、D. Hoffman、D. Middleton、M. Smotherman。《CSP/80：用于通信顺序进程的语言》。*论文集：分布式计算 CompCon*（1980 年秋）。

[8] Cook, Robert. “MOD- A Language for Distributed Processing.” *Proceedings of the 1st International Conference on Distributed Computing Systems* (October 1979).

> [8] Cook, Robert。《MOD——一种分布式处理语言》。*第一届分布式计算系统国际会议论文集*（1979 年 10 月）。

[9] Birrell, A. D. and B. J. Nelson. “Implementing Remote Procedure Calls.” *ACM Transactions on Computer Systems* 2 (1978).

> [9] Birrell, A. D.、B. J. Nelson。《远程过程调用的实现》。*ACM 计算机系统汇刊* 2（1978）。

[10] Hutchinson, N. C., L. L. Peterson, M. B. Abott, and S. O’Malley. “RPC in the x-Kernel: Evaluating New Design Techniques.” *Proceedings of the Twelfth Symposium on Operating Systems Principles* 23, no. 5 (1989).

> [10] Hutchinson, N. C.、L. L. Peterson、M. B. Abott、S. O’Malley。《x-Kernel 中的 RPC：评估新的设计技术》。*第十二届操作系统原理研讨会论文集* 23，第 5 期（1989）。

[11] Zahn, L., T. Dineen, P. Leach, E. Martin, N. Mishkin, J. Pato, and G. Wyant. *Network Computing Architecture.* Prentice Hall, 1990.

> [11] Zahn, L.、T. Dineen、P. Leach、E. Martin、N. Mishkin、J. Pato、G. Wyant。*网络计算体系结构*。Prentice Hall，1990。

[12] Schroeder, Michael D. “A State-of-the-Art Distributed System: Computing with BOB.” In *Distributed Systems,* 2nd ed., S. Mullender, ed., ACM Press, 1993.

> [12] Schroeder, Michael D.《先进的分布式系统：使用 BOB 计算》。载于 *分布式系统* 第 2 版，S. Mullender 编，ACM Press，1993。

[13] Hadzilacos, Vassos and Sam Toueg. “Fault-Tolerant Broadcasts and Related Problems.” In *Distributed Systems,* 2nd ed., S. Mullendar, ed., ACM Press, 1993.

> [13] Hadzilacos, Vassos、Sam Toueg。《容错广播及相关问题》。载于 *分布式系统* 第 2 版，S. Mullendar 编，ACM Press，1993。

[14] Walsh, D., B. Lyon, G. Sager, J. M. Chang, D. Goldberg, S. Kleiman, T. Lyon, R. Sandberg, and P. Weiss. “Overview of the SUN Network File System.” *Proceedings of the Winter Usenix Conference* (1985).

> [14] Walsh, D.、B. Lyon、G. Sager、J. M. Chang、D. Goldberg、S. Kleiman、T. Lyon、R. Sandberg、P. Weiss。《SUN 网络文件系统概览》。*冬季 Usenix 会议论文集*（1985）。

[15] Sandberg, R., D. Goldberg, S. Kleiman, D. Walsh, and B. Lyon. “Design and Implementation of the SUN Network File System.” *Proceedings of the Summer Usenix Conference* (1985).

> [15] Sandberg, R.、D. Goldberg、S. Kleiman、D. Walsh、B. Lyon。《SUN 网络文件系统的设计与实现》。*夏季 Usenix 会议论文集*（1985）。

[16] Khalidi, Yousef A. and Michael N. Nelson. “An Implementation of UNIX on an Object-Oriented Operating System.” *Proceedings of the Winter USENIX Conference* (1993). Also *Sun Microsystems Laboratories, Inc. Technical Report SMLI TR-92-3* (December 1992).

> [16] Khalidi, Yousef A.、Michael N. Nelson。《在面向对象操作系统上实现 UNIX》。*冬季 USENIX 会议论文集*（1993）。另见 *Sun Microsystems Laboratories, Inc. 技术报告 SMLI TR-92-3*（1992 年 12 月）。

<!-- PDF page 14 -->

© Copyright 1994 Sun Microsystems, Inc. The SML Technical Report Series is published by Sun Microsystems Laboratories, a division of Sun Microsystems, Inc. Printed in U.S.A.

> © 1994 Sun Microsystems, Inc. 版权所有。SML 技术报告系列由 Sun Microsystems, Inc. 下属的 Sun Microsystems Laboratories 出版。美国印刷。

Unlimited copying without fee is permitted provided that the copies are not made nor distributed for direct commercial advantage, and credit to the source is given. Otherwise, no part of this work covered by copyright hereon may be reproduced in any form or by any means graphic, electronic, or mechanical, including photocopying, recording, taping, or storage in an information retrieval system, without the prior written permission of the copyright owner.

> 在复制件并非为了直接商业利益而制作或分发、且注明出处的前提下，允许免费、不限量复制。否则，未经版权所有者事先书面许可，本作品受此处版权保护的任何部分，均不得以任何形式或任何手段复制，包括图形、电子或机械手段，以及影印、录音、磁带录制或存入信息检索系统。

**TRADEMARKS**

> **商标**

Sun, Sun Microsystems, and the Sun logo are trademarks or registered trademarks of Sun Microsystems, Inc. UNIX and OPEN LOOK are registered trademarks of UNIX System Laboratories, Inc. All SPARC trademarks, including the SCD Compliant Logo, are trademarks or registered trademarks of SPARC International, Inc. SPARCstation, SPARCserver, SPARCengine, SPARCworks, and SPARCompiler are licensed exclusively to Sun Microsystems, Inc. NFS is a registered trademark of Sun Microsystems, Inc. All other product names mentioned herein are the trademarks of their respective owners.

> Sun、Sun Microsystems 与 Sun 标志是 Sun Microsystems, Inc. 的商标或注册商标。UNIX 与 OPEN LOOK 是 UNIX System Laboratories, Inc. 的注册商标。包括 SCD Compliant Logo 在内的所有 SPARC 商标，均为 SPARC International, Inc. 的商标或注册商标。SPARCstation、SPARCserver、SPARCengine、SPARCworks 与 SPARCompiler 仅授权 Sun Microsystems, Inc. 使用。NFS 是 Sun Microsystems, Inc. 的注册商标。本文提及的所有其他产品名称，均为其各自所有者的商标。

For information regarding the SML Technical Report Series, contact Jeanie Treichel, Editor-in-Chief <jeanie.treichel@eng.sun.com>.  
For distribution issues, contact Amy Tashbook, Assistant Editor <amy.tashbook@eng.sun.com>.

> 有关 SML 技术报告系列的信息，请联系主编 Jeanie Treichel <jeanie.treichel@eng.sun.com>。  
> 有关分发事宜，请联系助理编辑 Amy Tashbook <amy.tashbook@eng.sun.com>。
