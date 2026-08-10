---
lang: "zh-CN"
pubDatetime: 2024-08-12T09:01:54+08:00
modDatetime: 2024-08-12T09:06:07+08:00
timezone: "Asia/Shanghai"
title: "详解IPC"
featured: false
area: "operating-systems"
draft: false
tags: []
description: "IPC: Inter-Process Communication"
---

- IPC: Inter-Process Communication

- 管道（Pipe）：分为无名管道和有名管道。无名管道只能在具有亲缘关系（如父子进程）的进程间使用，而有名管道可以在无亲缘关系的进程间使用。  
  例如，一个进程可以将数据写入管道，另一个进程从管道中读取数据。

- 消息队列（Message Queue）：进程可以向消息队列发送消息，也可以从消息队列接收消息。  
  像在分布式系统中，不同节点的进程可以通过消息队列来交换任务分配等信息。

- 共享内存（Shared Memory）：这是进程间通信中效率最高的一种方式。多个进程可以共享一块内存区域，直接对其进行读写操作。  
  比如多个图像处理进程可以共享一块内存来存储正在处理的图像数据。

- 信号量（Semaphore）：主要用于实现进程间的同步和互斥。  
  例如，限制同时访问某个资源的进程数量。

- 套接字（Socket）：不仅可以用于同一台机器上的进程间通信，还可以用于不同机器上的进程间通信。  
  常见的网络服务就是通过套接字来实现进程间的通信。
