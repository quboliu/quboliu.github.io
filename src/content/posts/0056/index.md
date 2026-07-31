---
lang: "zh-CN"
pubDatetime: 2024-08-15T00:22:59+08:00
modDatetime: 2024-08-16T17:52:30+08:00
timezone: "Asia/Shanghai"
title: "CPU特权级指令和非特权级指令罗列"
featured: false
draft: false
tags: []
description: "有少量非常关键的指令属于特权指令，这些指令只有0特权级任务有权限执行。在我们的操作系统中，特权指令包括以下几种： hlt指令。显然，低特权级任务不能随意将CPU挂起 sti、cli指令，以及其他试图修改IF位的指令，如popf。低特权级任务不能关中断，否则抢占式任务切换就失效了 试图修改IOPL的指令，如popf…"
---

> 有少量非常关键的指令属于特权指令，这些指令只有0特权级任务有权限执行。在我们的操作系统中，特权指令包括以下几种：  
> hlt指令。显然，低特权级任务不能随意将CPU挂起  
> sti、cli指令，以及其他试图修改IF位的指令，如popf。低特权级任务不能关中断，否则抢占式任务切换就失效了  
> 试图修改IOPL的指令，如popf。低特权级任务不能修改IO特权级，否则对IO端口的保护机制就失效了  
> 任何试图读取或修改控制寄存器、GDTR、LDTR（局部描述符表，在我们的操作系统中未使用）、IDTR、TR（见下文）的指令。如mov cr0, eax、lgdt等。这些指令对CPU有重大影响，例如，修改CR0能开关保护模式和分页模式，这显然不能供低特权级任务随意使用  
> invlpg指令。低特权级任务不能干预TLB

### 谁来决定哪些指令应保持特权？是硬件制造商还是操作系统开发人员.

这个是stack overflow上的一个问题。

- <a href="https://stackoverflow.com/questions/61957135/who-decides-which-instructions-are-to-be-kept-privileged-is-it-the-hardware-man" rel="noopener" target="_blank">https://stackoverflow.com/questions/61957135/who-decides-which-instructions-are-to-be-kept-privileged-is-it-the-hardware-man</a>

## 参考文献

1.  《Intel64与IA-32架构软件开发者手册》
2.  《Intel 80386程序员参考手册》
3.  <a href="https://www.cnblogs.com/yingyulou/p/17825525.html" rel="noopener" target="_blank">https://www.cnblogs.com/yingyulou/p/17825525.html</a>
4.  <a href="https://blog.csdn.net/yanbw/article/details/123883866" rel="noopener" target="_blank">https://blog.csdn.net/yanbw/article/details/123883866</a>
