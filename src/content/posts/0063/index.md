---
lang: "zh-CN"
pubDatetime: 2024-08-16T17:53:05+08:00
modDatetime: 2024-08-18T12:35:17+08:00
timezone: "Asia/Shanghai"
title: "阅读归纳-Go领域那些年我们一起追过的大佬"
featured: false
area: "go"
draft: false
tags: []
description: "整理 Go 领域开发者、博客、书籍与项目资源，作为持续补充的学习索引。"
---

## 人物基本信息

本博客源自于<a href="https://www.cnblogs.com/qcrao-2018/p/14490148.html" rel="noopener" target="_blank">https://www.cnblogs.com/qcrao-2018/p/14490148.html</a>的笔记，意学习一些大佬。后来个人在互联网游荡的时候，还是能看到不少“高人”的，于是动念头，搜集这些人。主要是看看他们的博客，Github，能加上微信自然是最好了。如果后面内容做的多了，或许可以归纳一下，做成awesome-xxxx这种，但是还是先博客记录一下仅。

---

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th style="text-align: center;">人物</th>
<th style="text-align: center;">个人信息</th>
<th>领域</th>
<th>内容</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="text-align: center;">caoz</td>
<td style="text-align: center;"><a href="https://book.douban.com/search/%E6%9B%B9%E6%94%BF" rel="noopener" target="_blank">曹政</a><br />
互联网百晓生<br />
</td>
<td>1. Go</td>
<td>书籍：《你凭什么做好互联网》<br />
公众号：caoz 的梦呓<br />
知识星球：<br />
</td>
</tr>
<tr class="even">
<td style="text-align: center;">煎鱼</td>
<td style="text-align: center;">煎架<br />
陈剑煜<br />
</td>
<td>1. Go</td>
<td>书籍：《<a href="https://golang2.eddycjy.com/" rel="noopener" target="_blank">Go 语言编程之旅</a>》<br />
博客：<a href="https://eddycjy.com/posts/" rel="noopener" target="_blank">https://eddycjy.com/posts/</a><br />
Github：<a href="https://github.com/eddycjy" rel="noopener" target="_blank">github.com/eddycjy</a></td>
</tr>
<tr class="odd">
<td style="text-align: center;">halfrost</td>
<td style="text-align: center;">人称霜神</td>
<td>1.Go</td>
<td>博客：<a href="https://halfrost.com/author/halfrost/" rel="noopener" target="_blank">https://halfrost.com/author/halfrost/</a><br />
书籍：《<a href="https://github.com/halfrost/LeetCode-Go" rel="noopener" target="_blank">LeetCode CookBook</a>》</td>
</tr>
<tr class="even">
<td style="text-align: center;">欧神</td>
<td style="text-align: center;">欧长坤</td>
<td>1.Go</td>
<td>书籍：《<a href="https://golang.design/under-the-hood/" rel="noopener" target="_blank">Go 语言原本</a>》<br />
文章：<a href="https://mp.weixin.qq.com/s/o2oMMh0PF5ZSoYD0XOBY2Q" rel="noopener" target="_blank">《Go GC 20问》</a><br />
博客：<a href="https://changkun.de/" rel="noopener" target="_blank">Dr. Changkun Ou</a><br />
Github：<a href="https://github.com/changkun" rel="noopener" target="_blank">changkun (Changkun Ou) (github.com)</a></td>
</tr>
<tr class="odd">
<td style="text-align: center;">xargin</td>
<td style="text-align: center;">曹大</td>
<td>1. Go</td>
<td>书籍：《Go 语言高级编程》<br />
博客：<a href="https://xargin.com/" rel="noopener" target="_blank">xargin.com</a></td>
</tr>
<tr class="even">
<td style="text-align: center;">Stefno</td>
<td style="text-align: center;">饶全成</td>
<td>1. Go</td>
<td>书籍：《Go 程序员面试笔试宝典》</td>
</tr>
<tr class="odd">
<td style="text-align: center;">Draven</td>
<td style="text-align: center;"></td>
<td>1. Go</td>
<td>博客：<a href="https://draven.co/" rel="noopener" target="_blank">https://draven.co/</a><br />
<a href="https://draveness.me/" rel="noopener" target="_blank">面向信仰编程 (draveness.me)</a><br />
书籍：《Go语言设计与实现》</td>
</tr>
<tr class="even">
<td style="text-align: center;">杨文</td>
<td style="text-align: center;"></td>
<td>1. Go</td>
<td>博客：<a href="https://maiyang.me/" rel="noopener" target="_blank">https://maiyang.me/</a></td>
</tr>
<tr class="odd">
<td style="text-align: center;">雨痕</td>
<td style="text-align: center;"></td>
<td>1. Go</td>
<td>Github：<a href="https://github.com/qyuhen" rel="noopener" target="_blank">https://github.com/qyuhen</a><br />
书籍：《Go语言学习笔记》(微信读书有)<br />
书籍：<a href="https://www.yuque.com/qyuhen/go" rel="noopener" target="_blank">Go 程序设计 · 语雀 (yuque.com)</a><br />
知识星球：雨痕学堂(在他Github里)</td>
</tr>
<tr class="even">
<td style="text-align: center;">白明</td>
<td style="text-align: center;"></td>
<td>1. Go</td>
<td>书籍：《Go语言精进之路》<br />
博客：<a href="https://tonybai.com/" rel="noopener" target="_blank">tonybai.com/</a></td>
</tr>
<tr class="odd">
<td style="text-align: center;">封幼林</td>
<td style="text-align: center;"></td>
<td>1. Go</td>
<td>书籍：<a href="https://book-go-runtime.netlify.app/#/" rel="noopener" target="_blank">《深度探索Go语言》</a><br />
</td>
</tr>
<tr class="even">
<td style="text-align: center;">刘丹冰</td>
<td style="text-align: center;"></td>
<td>1. Go</td>
<td>书籍：<a href="https://github.com/aceld/golang/tree/main" rel="noopener" target="_blank">《深入理解Go语言-Go修养之路》</a><br />
Github：<a href="https://github.com/aceld" rel="noopener" target="_blank">aceld (刘丹冰) (github.com)</a><br />
</td>
</tr>
<tr class="odd">
<td style="text-align: center;">LeoYang90</td>
<td style="text-align: center;"></td>
<td>1. Go</td>
<td></td>
</tr>
<tr class="even">
<td style="text-align: center;">huanglianjing</td>
<td style="text-align: center;"></td>
<td>1. Go<br />
2. 数据库<br />
3. 消息队列</td>
<td>wechat: moondo_<br />
Email: <a href="mailto:huanglianjing@gmail.com">huanglianjing@gmail.com</a><br />
GitHub: <a href="https://github.com/huanglianjing" rel="noopener" target="_blank">https://github.com/huanglianjing</a><br />
Blog: <a href="https://huanglianjing.com/" rel="noopener" target="_blank">https://huanglianjing.com/</a><br />
清评曰：Go GMP调度器的设计与原理这篇文章我比较看重</td>
</tr>
<tr class="odd">
<td style="text-align: center;">HHTCodeRv</td>
<td style="text-align: center;"></td>
<td>1. Go</td>
<td>书籍：<a href="https://gohandbook1.haohongfan.com/" rel="noopener" target="_blank">《Go源码分析与实战》</a><br />
微信：HHFCodeRv</td>
</tr>
<tr class="even">
<td style="text-align: center;">chenyahui</td>
<td style="text-align: center;"></td>
<td></td>
<td>Github：<a href="https://github.com/chenyahui" rel="noopener" target="_blank">chenyahui (cyhone) (github.com)</a><br />
博客：<a href="https://www.cyhone.com/" rel="noopener" target="_blank">编程沉思录 (cyhone.com)</a><br />
清评曰：Golang源码剖析系列打眼一看还好。</td>
</tr>
<tr class="even">
<td style="text-align: center;">PegasusWang</td>
<td style="text-align: center;"></td>
<td></td>
<td>书籍：<a href="https://pegasuswang.readthedocs.io/zh/latest/golang/go%E8%AF%AD%E8%A8%80%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/" rel="noopener" target="_blank">《Go学习笔记源码剖析》</a><br />
GitHub: <a href="https://github.com/pegasuswang" rel="noopener" target="_blank">https://github.com/pegasuswang</a><br />
邮件：<a href="mailto:291374108@qq.com">291374108@qq.com</a></td>
</tr>
</tbody>
</table>

- [ ] 后期可能会更新一些外国的大佬，到时候再说，ToDo一下。

## 格言

此处格言主要来自文章，不再更新，新的格言包括下面的，都在about中。

- 在职场上要让自己“发声”，让自己被看见，才有机会进阶。

- 不要认为这是水到渠成，自然而然的事情，尽早准备，尽早开始，是有必要的。

- 分享即学习，你写文章、做分享 PPT 的时候，其实也是一个整理思路的过程。

- 如果不写下来，你很难发现自己其实有些地方没有完全理解。

- 如果没有太强的技术，没有太好的开源项目——我相信这是大部分人的现状。那么让自己发声的一个有效方法就是写文档、写文章。无论是源码分析，还是对业务系统的总结，或是排查故障的经过，都可以写成文章。写文章就是说话嘛，说话谁都会。我们把要说的话写下来，有条理、有章法，一件事情说清楚了，也就够了。

- 而且，我最早就强调过的，分享即学习，无论是整理分享的过程，还是分享中遭遇各种 diss 的过程，其实都是你学习进步的过程，尽早地拥抱分享，主动分享，你的进步就会越快，也越容易获得职场关键人物的重视。

- 在公司的话，要主动去做一些别人不愿意做的事情，并且做出一些成绩出来。慢慢上面的人就能看到你，有重要的业务才会考虑到你。

- 先不要太计较很多东西，先做出成绩。

- Leader 给你一件事情，你做好了，他才有可能给你更多、更重要的事情，你才可能有成绩。

  > 清评曰：这个方向，做事的方法是这样的。但是切记提防PUA，被利用。

- 还有一些内容是论文或文档的翻译，翻译它们而不是仅仅看一遍，对我们深刻理解内容是很有帮助的。连曹大都这样做了，我们有什么理由不做呢？

## 原文链接：

<a href="https://www.cnblogs.com/qcrao-2018/p/14490148.html" rel="noopener" target="_blank">那些年我们一起追过的大佬 - Stefno - 博客园 (cnblogs.com)</a>
