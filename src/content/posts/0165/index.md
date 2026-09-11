---
lang: "zh-CN"
pubDatetime: 2026-09-11T23:32:54+08:00
timezone: "Asia/Shanghai"
title: "订阅-推送全链路：从硬件中断到 WebSocket，一次自底向上的实现盘点"
area: "distributed-systems"
featured: false
draft: false
tags:
  - "DDIA"
  - "订阅推送"
  - "架构"
  - "分布式系统"
description: "DDIA 分析了订阅推送的适用场景与优势，却没讲各层实现细节。本文自底向上盘点硬件中断、epoll/inotify、LISTEN/NOTIFY 与逻辑复制、Kafka/etcd/RabbitMQ/MQTT、SSE/..."
---
DDIA 第二版第 13 章花了好几节论证「订阅-推送」的价值：数据库是只能轮询的被动可变变量（P773）；把状态变更一路推到终端设备，每台设备就是一个小事件流的小型订阅者（P780）；订阅请求本质上是与另一侧过去和未来事件的**持久连接**（P783）。但它只讲场景与思想，没讲实现——现实中每一层抽象的「推」到底是怎么做到的？

本文自底向上盘点五个层次：**硬件 → 操作系统 → 数据库 → 消息中间件 → Web/应用协议**。每个机制回答三个问题：订阅关系登记在哪里？事件沿什么链路送达？它是真推送、长轮询，还是混合？所有技术细节均以官方文档、正式规范或官方源码为依据，参考文献统一列在文末。

## 1. 硬件层：推送的原点，但只推「发生了」

**外部中断 vs 轮询。** Intel SDM 定义：中断是「程序执行期间随机发生的、响应硬件信号」的事件——CPU 是被通知方。链路是：设备拉高中断线 → 中断控制器（8259A PIC 或 I/O APIC）→ CPU 用 vector 查 IDT → 跳转 handler。「订阅表」就是 IDT（vector → handler 入口）。对照面：没有专属中断通道时，驱动只能反复读设备状态寄存器——内核 MSI 文档官方描述了这种轮询的代价。

**MSI/MSI-X：中断本身是一次内存写。** SDM §10.11 原文：设备「把 Message Data Register 的内容写到 Message Address Register 包含的地址」来请求服务——一笔 PCI 内存写事务，地址落在 `0xFEE00000` 起始的区域，平台把它解释为中断消息。系统软件在设备配置阶段把「写给谁、写什么 vector」编程进设备的 PCI 配置空间——**订阅表跟着发布者（设备）走**。内核文档还点出一个关键设计理由：MSI 写不能越过此前的 DMA 数据写（PCI 序规则），所以中断到达时数据保证已在内存，handler 免做防御性回读——**推送通道与数据通道的次序保证，是可用性的前提**。

**DMA 完成通知。** 驱动把缓冲区交给设备，设备绕过 CPU 直接读写内存，完成后以中断通知；DMAengine 框架里回调挂在每个事务描述符上，由 tasklet（软中断上下文，不是硬中断）调用。CPU 读数据前必须先 `dma_sync_single_for_cpu()` 交还缓冲区所有权。

**缓存一致性：硬件级的失效推送。** MESI 协议下，对 S（Shared）状态的 cache line 写入必须先获取独占所有权——写事件被主动传播给所有副本持有者，其他副本转 Invalid。「订阅者列表」是隐式的：就是各核 cache 里该行的副本本身。规模化之后，Intel QPI 白皮书记载了从「所有 snoop 流量都广播」到 snoop filter / home snoop 的演进——**登记一份「谁持有副本」的目录，把广播推送变成定向推送**。

> 本层共性：**推通知、拉数据**。中断只携带 vector，DMA 中断只说「完成了」，一致性协议只推「失效/所有权」——数据永远走另一条路（DMA/共享内存/cache-to-cache）由接收方自取。另外，NAPI 的存在说明「推送降级为轮询」本身就是硬件/驱动层的背压手段：高负载时屏蔽中断、转为带 budget 的轮询。

## 2. 操作系统层：订阅的持久化是分水岭

**select/poll vs epoll。** 先纠正一个流行误读：select/poll 并不是忙轮询——man page 写明调用线程同样**睡眠等待**、被内核唤醒。它们之"轮询"在于**订阅关系不持久**：每次调用都要把完整 fd 集合从用户态传入（select 的 `fd_set` 还是 value-result 参数），内核每次重新登记等待队列，开销随 fd 数线性增长，且 fd 号受 `FD_SETSIZE=1024` 限制。epoll 把订阅与收事件拆开：`epoll_ctl(ADD)` 把 fd 登记进内核持久维护的 interest list；内核源码 `fs/eventpoll.c` 显示，文件就绪时驱动/协议栈的 `wake_up()` 触发 `ep_poll_callback()`，把条目挂入 ready list 并唤醒睡在 `epoll_wait` 里的线程。ET（边缘触发）只在状态变化时报告，必须配合非阻塞 fd 读到 `EAGAIN` 为止；LT 与 poll 语义相同。

**inotify：订阅文件系统。** `inotify_add_watch` 登记「路径 + 事件位掩码」，事件以结构化记录入队，应用 `read` 取走。队列有界（`max_queued_events`），溢出时丢事件但**必发一个 `IN_Q_OVERFLOW`** 告知「你丢东西了，请重建缓存」——背压信号的标准形态。

**signal：最古老的进程级推送。** 真异步：内核在返回用户态前构造栈帧、把程序计数器指向 handler。但标准信号**不排队**——同种信号多次产生只记一次 pending；实时信号可排队、可携带附加值，受 `RLIMIT_SIGPENDING` 限制。信息密度极低，更像中断而非消息。

**eventfd/signalfd/timerfd。** 把任意通知、信号、定时器统一归一成「fd 可读 + read 取结构化数据」，全部能被 epoll 这个统一枢纽多路复用。

**io_uring：不是推，是共享内存环 + 可选提示。** SQ/CQ 两个环形缓冲区用 `mmap` 映射为内核-用户共享内存；内核完成 I/O 后直接把 CQE 写到 CQ 尾，用户态比较 head/tail 即可发现，**收完成事件不需要任何系统调用**。eventfd 通知只是可选的 hint——man page 原话：「只能当作检查 CQ 环的提示」，批量完成可能只触发一次通知。

**kqueue（macOS/BSD）与 IOCP（Windows）。** kqueue 用一次 `kevent()` 同时承担订阅登记（changelist）与取事件（eventlist），filter 机制统一了 I/O、文件、信号、定时器、进程事件。IOCP 是这一层背压最完备的实现：完成包 FIFO 入队，`GetQueuedCompletionStatus` 取走，concurrency value 硬限制并发线程数，阻塞线程按 LIFO 唤醒（利于缓存热度）。

> 本层共性：内核→用户态方向是真推（线程睡眠、事件唤醒，无忙轮询），但推上来的几乎总是「有事件了」这个事实本身，数据由用户态 read 自取。**订阅关系是否持久化（epoll_ctl 一次登记 vs select 每次重建）才是"订阅-推送"与"轮询"在 OS 层的准确分界线**——不是睡不睡眠。

## 3. 数据库层：信号易失，可靠流派全部基于日志

**PostgreSQL LISTEN/NOTIFY：真推送，但只推信号。** `LISTEN` 把会话登记为通道监听器（会话结束自动清除，不落盘）；`NOTIFY` 的事件在**事务提交后**经协议层 `NotificationResponse` 消息（'A' 类型，载荷 = PID + 通道名 + payload）由服务器主动写入各监听连接。事务语义干净：提交前不投递、同事务同 payload 去重、按提交顺序投递。限制同样官方：payload 必须小于 8000 字节；通知队列上限 8GB，**队列满时提交直接失败**（背压传导给写入方）；文档建议大数据放表里、通知只发键——典型用法是缓存失效信号，收到后回表重查。（上一篇[观察者模式对照](https://quboliu.github.io/posts/0162/)有更详细的分析。）

**PG 逻辑复制 / MySQL 复制：官方定性都是"订阅端拉"。** PG 文档原文：「Subscribers **pull** data from the publications they subscribe to」；MySQL 文档同样写明：「replica **pulls** the data from the source, rather than the source pushing」。但连接建立后，数据流是服务器沿复制连接不间断下发的：PG 的 walsender 用 pgoutput 把 WAL 逻辑解码后持续流式发送 `XLogData`；MySQL 的 `Binlog Dump` 线程持续发送 binlog 事件。可靠性来自**日志 + 持久位点**：PG 的复制槽在确认前阻止 WAL 回收（形成背压，代价是 WAL 堆积）；订阅端定期回发已应用 LSN。

**MongoDB Change Streams：长轮询 + resume token。** 底层数据源是 oplog；官方文档写明「Each change stream holds a connection open with a `getMore` operation while waiting for the next event」——本质是挂起式游标。断点续传靠每个事件的 `_id`（resume token），要求 oplog 保留足够历史。只通知 majority-committed 的变更；update 事件默认只含 delta，要当前文档得开 `fullDocument: "updateLookup"`——又是「通知 + 可选再查」。

**Redis keyspace notifications：fire-and-forget。** 事件走 Pub/Sub 通道（`__keyspace@0__:*` / `__keyevent@0__:*`），官方警告原文：断线重连期间的事件**全部丢失**。RESP3 协议倒是定义了真正的 Push 帧类型（首字节 `>`），允许服务器随时带外下发。

**RethinkDB Changefeeds：官方自认不保证送达。** 对查询结果链式调用 `.changes()` 得到无限游标，服务器持续投递 `{old_val, new_val}`；客户端处理不过来时默认把多次变更 squash 成最新状态。官方原文：「unidirectional with no acknowledgement… **cannot guarantee delivery**。需要送达保证请去用消息中间件。」

**SQL Server Query Notifications：基于 Service Broker 的「变了」信号。** 登记一条 SELECT，结果集变化时经 Service Broker 队列投递通知；通知不含新数据，应用收到后重新查询——缓存失效场景的标准实现。（流行说法称该功能已弃用，经查官方弃用列表截至 SQL Server 2025 并未列入，不采用。）

> 本层共性：**通知与数据分离**（payload 上限、只发键、只发 delta、只发「变了」）；**订阅绑连接、丢事件是默认行为**；而例外的可靠流派（逻辑复制、binlog、change streams）全部基于「日志 + 持久位点」——可靠性不是推出来的，是**订阅端记住拉到哪里**换来的。

## 4. 消息中间件层：唯一的拉模型和它的对照组

**Kafka：本层唯一的拉模型，等待被搬到了 broker 端。** 不存在 broker 主动向 consumer 发消息的通道；consumer 循环 `poll()` 发 Fetch 请求。长轮询由两个参数实现：`fetch.min.bytes`（默认 1）——数据不足时请求等待数据累积；`fetch.max.wait.ms`（默认 500ms）——服务器阻塞响应的最长时间。源码层面，数据不足的 Fetch 被构造为 `DelayedFetch` 挂入 `DelayedOperationPurgatory`，以分区为 watch key，分区有新数据写入时按 key 触发 `tryComplete` 立即回响应，超时由时间轮兜底。消费位点（offset）完全由客户端持有——自主控速、任意回拨重放，代价是时延与空转请求。

**etcd Watch：真推送 + revision 续传。** `Watch` 是 gRPC 双向流：客户端发 `WatchCreateRequest`（可带 `start_revision`），服务端返回 `watch_id`，此后事件由服务端主动下推。服务端 `watchableStore` 把 watcher 分 synced/unsynced 两组：提交后直接向 synced watcher 的 channel 发事件；unsynced 的每 100ms 扫描补历史。channel 缓冲固定 128，写不下的慢 watcher 被移入 victims 异步重试——内置背压。官方保证 Ordered/Unique/Reliable/Atomic/**Resumable**：断开后用「最后收到的 revision +1」重建；起点早于 compaction 窗口则 `compact_revision` 置位取消（ErrCompacted）。

**RabbitMQ：官方直称 Push API。** `basic.consume` 登记订阅后，broker 主动发 `basic.deliver` 帧下推消息，文档原话「Applications can subscribe to have RabbitMQ **push** enqueued messages to them」。流控闭环：`basic.qos` 的 prefetch count 限制未确认消息数，消费者 ack 后释放额度，**推送速率被确认速率钳制**。文档同时明确反对用 `basic.get` 轮询（「highly inefficient」）。

**MQTT：broker 向匹配订阅者发送消息副本。** OASIS 规范定义 Server 职责：处理 SUBSCRIBE/UNSUBSCRIBE，向每个匹配订阅的 Client 发送 Application Message 的副本——发布与投递复用 `PUBLISH` 报文。QoS 分级：QoS 0 至多一次（不确认不重试）；QoS 1 至少一次（PUBACK 确认 + DUP 重发）；QoS 2 恰好一次（PUBREC/PUBREL/PUBCOMP 两步确认）。

**NATS：一个系统，两种形态。** Core NATS 是纯粹的 at-most-once 真推送：「消息到达发布时刻**在线**的每个订阅者…服务器不存储」。JetStream 在其上加持久层：Stream 存消息并赋序列号，Consumer 是跟踪客户端进度的服务端游标，ack 推进、超时重投，可推拉双模、at-least-once。

> 本层共性：**连接方向 ≠ 数据推送方向**——五种系统都由客户端发起 TCP 连接，但除 Kafka 外订阅后都是服务端主动下推；判断推拉要看订阅之后是否还需客户端发请求。**真推送必须配套背压**（prefetch/ack、128 缓冲 + victims）；**「持久化 + 位置续传」是推送可靠性的通用补丁**——稳态推送、异常时退化为按位点（revision/序列号/offset）拉取。

## 5. Web/应用协议层：围绕「HTTP 不能推」的一整部演进史

**原点：HTTP 原生不支持推送。** RFC 6202 原话：服务器「不能与客户端发起连接，也不能发送未被请求的响应」。这一层的全部历史都是围绕这个缺陷展开的。

**长轮询与 Comet：挂起的拉取。** 服务器 hold open 请求，有事件或超时前不响应；客户端收到响应立即再发下一个——保证服务器手里始终挂着一个可回事件的请求。Bayeux、BOSH 是历史协议形态。RFC 6202 自己承认这类技术「拉伸了 HTTP 的原始语义」。

**WebSocket（RFC 6455）：握手之后脱离 HTTP。** 客户端发 `Upgrade: websocket` + `Sec-WebSocket-Key`，服务器回 `101 Switching Protocols`（`Sec-WebSocket-Accept` = key 拼固定 GUID 的 SHA-1）；此后同一 TCP 连接上跑二进制帧（opcode：文本/二进制/关闭/Ping/Pong，客户端帧必须掩码）。规范 §1.2：「双方可各自独立地随时发送数据」——真全双工推送。它没有内置订阅概念，订阅语义由应用层自定。

**SSE（WHATWG）：一次请求 + 永不结束的响应流。** `new EventSource(url)` 即发起一个普通 HTTP fetch（`Accept: text/event-stream`），这条挂起的请求本身就是订阅。服务器逐行写 `data:`/`event:`/`id:`/`retry:` 字段。浏览器**自动重连**（规范建议指数退避），重连自动携带 `Last-Event-ID` 请求头供服务器续传，服务器可用流内 `retry:` 调整间隔、用 `204` 告知停止重连。单向：客户端回发数据需另发普通请求。规范还专门设想了移动场景：浏览器可把连接托管给网络侧 push proxy，设备休眠、代理代收。

**HTTP/2 Server Push 的兴衰：一次失败的真推送实验。** RFC 7540 定义了 `PUSH_PROMISE`：服务器对与客户端请求相关联的资源抢先推响应，客户端可用 `SETTINGS_ENABLE_PUSH=0` 或 `RST_STREAM` 拒绝。结局：Chrome 官方博客披露使用率仅 1.25%（复测 0.7%）、无清晰净收益，**Chrome 106 起默认禁用**，官方推荐的替代是 **103 Early Hints**——只发提示，由浏览器决定是否请求。**纯推数据而不给接收方控制权的设计失败了，「推提示 + 接收方决定拉取」存活下来。**

**gRPC streaming：一次调用订阅一条流。** Server streaming：客户端发一个请求，服务器在响应流上持续写消息序列；bidirectional streaming：两条流相互独立。单 RPC 内保证消息顺序；底层即 HTTP/2 流，天然多路复用。etcd watch 就是它。
**GraphQL subscriptions：语义层定义推送，传输层刻意留白。** 规范把 subscription 定义为「Source Stream → Response Stream」的映射：源事件流上每个新事件触发一次执行，结果推给订阅者；传输、ACK、重传全部留给实现。事实标准 `graphql-transport-ws` 跑在 WebSocket 上：`ConnectionInit`/`ConnectionAck` 初始化，`Subscribe`（带唯一 id）登记订阅，服务器持续推 `Next`，内置 Ping/Pong 心跳和 44xx 关闭码。
**Webhook：角色反转的真推送。** 以 GitHub 为例：订阅者在设置里登记 payload URL + 事件类型（订阅表由事件生产方持有）；事件发生时 GitHub 作为 HTTP **客户端**向该 URL POST 事件数据（`X-GitHub-Event` 头），接收方须 10 秒内回 2XX，支持重新投递。官方定位即轮询的替代品。代价：订阅者自己必须是公网可达的服务器（NAT 后得用 smee.io 之类转发）。
**APNs/FCM：平台级推送单例。** Apple 官方文档：APNs 与用户设备维持「经认证的、加密的、持久的 IP 连接」，设备离线可暂存、上线转发，可为省电合并（coalesce）同一应用的多个通知；App 注册获得 device token 作为推送地址。Google FCM 类似：下行消息经平台级传输层（Android 走 ATL）送达。应用不各自维持长连接，推送通道由操作系统/厂商服务统一管理——推送在这里是**共享基础设施**。

## 6. 跨层收束：五条贯穿全链路的模式

把五层摆在一起，共性清晰得近乎刺眼：

1. **推通知、拉数据。** 中断只带 vector，PG 通知限 8000 字节，Redis 只发 key 名，MongoDB 默认只发 delta，HTTP/2 push 的遗产是只发提示——payload 逐级瘦身，数据永远走另一条路。
2. **订阅关系的登记位置和持久化是分水岭。** select 每次重建订阅 vs epoll 一次登记；LISTEN 绑会话 vs 复制槽持久化；Core NATS 不存 vs JetStream 存。订阅越持久，可靠性越高，成本也越高。
3. **可靠性 = 日志 + 位点续传。** Last-Event-ID、resume token、revision、offset、复制槽 LSN——全是同一个东西：断点续传位点。稳态推送，异常退化为按位点拉取。这也解释了为什么 PG/MySQL/Kafka 官方都把「可靠的那些」定性为**拉**。
4. **背压是推送的必需品。** prefetch/ack、inotify 的 IN_Q_OVERFLOW、etcd 的 victims、IOCP 的并发上限、PG 队列满即拒绝提交——无界缓冲的推送在各层都不存在。
5. **DDIA 的那句话在这里字字落地**：「订阅请求是与另一侧过去和未来事件的持久连接」——SSE 的 Last-Event-ID 续的是「过去」，挂起的流等的是「未来」。DDIA 说订阅变更「才刚刚开始作为一种功能出现」，从硬件中断到 APNs 的这条链路看，它其实已经以十几种形态渗入了每一层——只是每一层都各自重新发明了同一套东西：登记、推送、位点、背压。

## 参考文献

**硬件层**
- [Intel® 64 and IA-32 Architectures Software Developer Manuals](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)（Vol. 3A §6 中断与异常、§10 APIC、§10.11 MSI、§11.4 MESI）
- [PCI MSI/MSI-X — Linux kernel documentation](https://docs.kernel.org/PCI/msi-howto.html)
- [DMA API HOWTO — Linux kernel documentation](https://docs.kernel.org/core-api/dma-api-howto.html) 与 [DMAengine client documentation](https://docs.kernel.org/driver-api/dmaengine/client.html)
- [An Introduction to the Intel QuickPath Interconnect（Intel 官方白皮书）](https://www.intel.de/content/dam/doc/white-paper/quick-path-interconnect-introduction-paper.pdf)
- [NAPI — Linux kernel documentation](https://docs.kernel.org/networking/napi.html)

**操作系统层**
- [epoll(7)](https://man7.org/linux/man-pages/man7/epoll.7.html)、[select(2)](https://man7.org/linux/man-pages/man2/select.2.html)、[poll(2)](https://man7.org/linux/man-pages/man2/poll.2.html)、[inotify(7)](https://man7.org/linux/man-pages/man7/inotify.7.html)、[signal(7)](https://man7.org/linux/man-pages/man7/signal.7.html)、[eventfd(2)](https://man7.org/linux/man-pages/man2/eventfd.2.html)、[signalfd(2)](https://man7.org/linux/man-pages/man2/signalfd.2.html)、[timerfd_create(2)](https://man7.org/linux/man-pages/man2/timerfd_create.2.html)、[io_uring(7)](https://man7.org/linux/man-pages/man7/io_uring.7.html)、[io_uring_register(2)](https://man7.org/linux/man-pages/man2/io_uring_register.2.html) — man7.org
- [fs/eventpoll.c — Linux 内核源码](https://raw.githubusercontent.com/torvalds/linux/master/fs/eventpoll.c)（`ep_poll_callback` 链路）
- [kqueue(2) — FreeBSD man page](https://man.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2) 与 [kqueue(2) — Apple Developer](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/kqueue.2.html)
- [I/O Completion Ports — Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/fileio/i-o-completion-ports)

**数据库层**
- [NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)、[LISTEN](https://www.postgresql.org/docs/current/sql-listen.html)、[Message Formats](https://www.postgresql.org/docs/current/protocol-message-formats.html)、[Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html)、[Logical Replication Architecture](https://www.postgresql.org/docs/current/logical-replication-architecture.html)、[Streaming Replication Protocol](https://www.postgresql.org/docs/current/protocol-replication.html) — PostgreSQL Documentation
- [Replication Implementation](https://dev.mysql.com/doc/refman/8.4/en/replication-implementation.html) 与 [Replication Threads](https://dev.mysql.com/doc/refman/8.4/en/replication-threads.html) — MySQL 8.4 Reference Manual
- [Change Streams](https://www.mongodb.com/docs/manual/changeStreams/) 与 [$changeStream](https://www.mongodb.com/docs/manual/reference/operator/aggregation/changeStream/) — MongoDB Manual
- [Redis keyspace notifications](https://redis.io/docs/latest/develop/use/keyspace-notifications/) 与 [RESP protocol spec](https://redis.io/docs/latest/develop/reference/protocol-spec/) — Redis Docs
- [Changefeeds in RethinkDB](https://rethinkdb.com/docs/changefeeds/javascript/) — RethinkDB Docs
- [Query Notifications in SQL Server (ADO.NET)](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/sql/query-notifications-in-sql-server) 与 [Deprecated Database Engine Features in SQL Server 2025](https://learn.microsoft.com/en-us/sql/database-engine/deprecated-database-engine-features-in-sql-server-2025?view=sql-server-ver17) — Microsoft Learn

**消息中间件层**
- [Consumer Configs](https://kafka.apache.org/41/configuration/consumer-configs/)、[KafkaConsumer Javadoc](https://kafka.apache.org/40/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html)、[ReplicaManager.scala](https://github.com/apache/kafka/blob/trunk/core/src/main/scala/kafka/server/ReplicaManager.scala)、[DelayedFetch.java](https://github.com/apache/kafka/blob/trunk/server/src/main/java/org/apache/kafka/server/purgatory/DelayedFetch.java) — Apache Kafka 官方文档与源码
- [etcd Watch API](https://etcd.io/docs/v3.5/learning/api/)、[API guarantees](https://etcd.io/docs/v3.5/learning/api_guarantees/)、[watchable_store.go](https://github.com/etcd-io/etcd/blob/main/server/storage/mvcc/watchable_store.go) — etcd 官方文档与源码
- [Consumers](https://www.rabbitmq.com/docs/consumers) 与 [Consumer Prefetch](https://www.rabbitmq.com/docs/consumer-prefetch) — RabbitMQ 官方文档
- [MQTT Version 3.1.1 — OASIS Standard](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
- [Core NATS](https://docs.nats.io/learn/core-nats/) 与 [JetStream](https://docs.nats.io/concepts/jetstream) — NATS 官方文档

**Web/应用协议层**
- [RFC 6202 — Known Issues and Best Practices for the Use of Long Polling and Streaming in Bidirectional HTTP](https://www.rfc-editor.org/rfc/rfc6202.html)
- [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455.html)
- [Server-sent events — WHATWG HTML Standard](https://html.spec.whatwg.org/multipage/server-sent-events.html) 与 [Using server-sent events — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [RFC 7540 §8.2 — Server Push](https://www.rfc-editor.org/rfc/rfc7540#section-8.2) 与 [Removing HTTP/2 Server Push — Chrome 官方博客](https://developer.chrome.com/blog/removing-push)
- [gRPC Core Concepts](https://grpc.io/docs/what-is-grpc/core-concepts/)
- [GraphQL Specification October2021 §6.2.3](https://spec.graphql.org/October2021/#sec-Subscription) 与 [graphql-ws PROTOCOL.md](https://github.com/enisdenjo/graphql-ws/blob/master/PROTOCOL.md)
- [About webhooks](https://docs.github.com/en/webhooks/about-webhooks) 与 [Handling webhook deliveries](https://docs.github.com/en/webhooks/using-webhooks/handling-webhook-deliveries) — GitHub Docs
- [Setting up a remote notification server — Apple Developer](https://developer.apple.com/documentation/usernotifications/setting-up-a-remote-notification-server) 与 [FCM Architectural Overview](https://firebase.google.com/docs/cloud-messaging/fcm-architecture)

**DDIA 语境**
- 《Designing Data-Intensive Applications》第二版，第 13 章：「分离应用代码与状态」「有状态且支持离线的客户端」「端到端事件流」「读取同样是事件」
- 本博客相关文章：[0162 观察者模式——etcd Watch 与 PG NOTIFY 对照](https://quboliu.github.io/posts/0162/)、[0163 读写路径边界调研](https://quboliu.github.io/posts/0163/)
