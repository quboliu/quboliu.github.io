---
lang: "zh-CN"
pubDatetime: 2024-08-04T16:05:02+08:00
modDatetime: 2024-08-04T16:07:22+08:00
timezone: "Asia/Shanghai"
title: "vs-piclist的一个小问题"
featured: false
draft: false
tags: []
description: "在使用vs-piclist自动上传“当前文件中的图片”的时候，会把部分普通的url连接也尝试上传，有些只是一些普通的网址而已，也被尝试上传到图床。"
---

在使用vs-piclist自动上传“当前文件中的图片”的时候，会把部分普通的url连接也尝试上传，有些只是一些普通的网址而已，也被尝试上传到图床。

最关键的是，这些连接还会被替换。这是个小问题。

不知道后面有没有机会修改一下它这个源代码，做一下限制，只识别给定后缀的那种url链接。
