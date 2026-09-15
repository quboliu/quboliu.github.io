---
title: "marksuper.xyz"
description: "跟踪 marksuper.xyz 的文章、作者与主题变化。"
---

> 由 blog-paparazzi skill 产出。全部 63 篇文章链接已逐一验证可访问。

## 〇、博客档案与作者情报

### 博客地址

- 主页：<https://marksuper.xyz/>
- 归档页：<https://marksuper.xyz/archives/>

### 统计信息

- **文章总数：63 篇**（已去除 about / 友链 / 归档等非文章页面）
- **时间跨度：2019-05 ~ 2025-09**，约 6 年 4 个月
- **分类数：10 个**（本报告按主题归纳，见下文一至十）
- 各年份发文量：

| 年份 | 篇数 | 备注                               |
| ---- | ---- | ---------------------------------- |
| 2019 | 2    | 起步期                             |
| 2020 | 6    | Go 基础                            |
| 2021 | 19   | **最高产的一年**                   |
| 2022 | 13   | 算法、Redis、K8s 系列              |
| 2023 | 7    | MySQL 系列为主                     |
| 2024 | 7    | 全年几乎只写设计模式系列           |
| 2025 | 11   | 并发数据结构、分布式组件、投顾笔记 |

- **更新频率**：平均约每月 1 篇；高峰为 2021 年下半年（月均 2 篇以上）；2023-08 ~ 2023-12、2022-04 ~ 2022-08 等有数月空窗。

### 分析

1. **一条清晰的技术纵深主线：Go 后端**。63 篇中约 50 篇与 Go 生态直接相关，且从 2019-2020 的语法/工具入门（git、错误处理、range）逐步深入到 2023-2025 的源码级剖析（Tunny、ant、Machinery、Groupcache、GMP 调度模型）——作者的学习路径是"用着用着就去读源码"。
2. **系列化写作习惯明显**：算法专栏（5 篇）、23 种设计模式（7 篇）、MySQL（8 篇）、并发数据结构（4 篇）、SSL/TLS（2 篇）、Redis（2 篇）、投顾（2 篇）。作者喜欢把一个主题啃完再换下一个。
3. **主题漂移记录了一条职业/兴趣轨迹**：2019-2021 Go 入门与工程实践 → 2021-2022 算法 + 云原生 → 2022-2023 数据库深挖 → 2024 设计模式 → 2025 分布式中间件源码 + **投资顾问考试笔记**（2025 年 7 月、9 月两篇"投顾"），后者暗示作者可能在备考证券从业/投顾资格，或向金融科技方向延伸。
4. **非技术内容极少**（仅 5 篇：以太猫、战俘营经济学、迪士尼攻略、2 篇投顾），博客定位是纯粹的技术笔记。
5. 技术栈画像：**Go 为主力语言**，熟悉 MySQL/Redis/Kafka/NSQ/etcd/Kubernetes/Docker，关注性能优化与高并发，涉猎区块链（2019 年以太猫）与量化工具（GitHub 上 fork 过 goex、goshare）。

### 作者情报

- **网名/署名**：Mark（博客页脚署名 "Mark's Blog"）。
- **GitHub（确认）**：<https://github.com/LittleBeeMark> —— 博客侧边栏直接链接到此账号。账号注册于 2020-06-13，29 个公开仓库，16 followers，绝大多数为 Go 项目，多篇博客文章有对应代码仓库（如 [disneyland](https://github.com/LittleBeeMark/disneyland)、[rabc_dom](https://github.com/LittleBeeMark/rabc_dom)、[apply_dlv](https://github.com/LittleBeeMark/apply_dlv)、[currency_module](https://github.com/LittleBeeMark/currency_module)、[leetcodeByGo](https://github.com/LittleBeeMark/leetcodeByGo)）。GitHub 资料页的 bio/公司/位置均未填写。
- **博客源码托管**：**未找到公开托管**。博客为 Hexo 静态站（Butterfly 主题），部署在自建服务器上（响应头 `nginx/1.14.0 (Ubuntu)`），不是 GitHub Pages；其 GitHub 账号下也没有博客源码仓库。
- **邮箱（确认）**：mark_yangzk@163.com（博客侧边栏 mailto 链接）。邮箱前缀含 "yang"，**推测**作者姓杨，未能确证。
- **其他社媒账号**：**未找到可证实的账号**。页脚的 Twitter/微博/YouTube 图标均指向各平台首页（无账号路径），是 Butterfly 主题的默认占位，并非作者真实账号。
- **个人简介与生平履历**（来自 [about 页](https://marksuper.xyz/about/)，作者自述为一首小诗）：
  - 曾学习**养殖专业七年**，研究方向涉及**基因多样性**（据此推测为水产/畜牧相关专业的硕士及以上学历，未确证）；
  - 后**转行做编程**，自述"说热爱那是虚伪了点"，但"有了点成就感"；
  - 经济动机坦率："曾经的我渴望赚大钱""现在的我仍然想赚大钱，但我更想慢慢积累自己"。
  - 2019 年 5 月发出第一篇技术博客（[给小白的git说明](https://marksuper.xyz/2019/05/15/talkGit/)），与转行时间线吻合；2025 年出现投顾考试笔记，可能正关注证券/投资领域。
- **友链**：<https://agopher.cn/>（其友链页面唯一的友情链接）。

## 一、Go 并发编程与性能优化（15 篇）

- [Goroutine 生命周期](https://marksuper.xyz/2020/02/28/goroutine/)（2020-02）
- [go 并发中的锁](https://marksuper.xyz/2020/09/08/mutex/)（2020-09）
- [go并发模型（超时取消模型）](https://marksuper.xyz/2021/07/21/time_out_module/)（2021-07）
- [使用 Sync Pool 提升程序性能](https://marksuper.xyz/2021/09/02/sync_pool/)（2021-09）
- [go 语言中的 range 真的影响性能吗](https://marksuper.xyz/2021/09/15/range/)（2021-09）
- [聊聊 ErrorGroup 的用法和拓展](https://marksuper.xyz/2021/10/15/error_group/)（2021-10）
- [如何处理一组并发任务](https://marksuper.xyz/2021/10/23/error_group_2/)（2021-10）
- [用 go 处理1分钟百万请求](https://marksuper.xyz/2021/10/08/handle_million_req/)（2021-10）
- [Tunny 库源码深度解读](https://marksuper.xyz/2023/01/23/tunny/)（2023-01）
- [想要写好Go并发不得不掌握的数据结构](https://marksuper.xyz/2025/01/01/currency_truct/)（2025-01）
- [想要写好Go并发不得不掌握的数据结构(2)](https://marksuper.xyz/2025/01/03/currency_struct2/)（2025-01）
- [想要写好Go并发不得不掌握的数据结构(3)](https://marksuper.xyz/2025/01/15/currency_struct3/)（2025-01）
- [想要写好Go并发不得不掌握的数据结构(4)](https://marksuper.xyz/2025/01/25/currency_struct4/)（2025-01）
- [GMP调度模型](https://marksuper.xyz/2025/03/15/gmp/)（2025-03）
- [高性能 Golang 并发包 -- ant](https://marksuper.xyz/2025/05/23/ant/)（2025-05）

## 二、设计模式与代码设计（11 篇）

- [聊聊代码耦合](https://marksuper.xyz/2021/07/15/coupling/)（2021-07）
- [go语言设计模式（Map-Reduce）](https://marksuper.xyz/2021/09/28/design_pattern_map-reduce/)（2021-09）
- [Go 流水线设计模式](https://marksuper.xyz/2022/01/10/go_stream/)（2022-01）
- [结合Golang聊聊23种设计模式---创建型](https://marksuper.xyz/2024/01/28/design1/)（2024-01）
- [结合Golang聊聊23种设计模式---结构型(1)](https://marksuper.xyz/2024/03/28/design2/)（2024-03）
- [结合Golang聊聊23种设计模式---结构型(2)](https://marksuper.xyz/2024/05/28/design3/)（2024-05）
- [结合Golang聊聊23种设计模式---行为型(1)](https://marksuper.xyz/2024/07/28/design4/)（2024-07）
- [结合Golang聊聊23种设计模式---行为型(2)](https://marksuper.xyz/2024/08/15/design5/)（2024-08）
- [结合Golang聊聊23种设计模式---行为型(3)](https://marksuper.xyz/2024/10/15/design6/)（2024-10）
- [设计模式的一些使用原则](https://marksuper.xyz/2024/12/15/design7/)（2024-12）

## 三、数据库：MySQL 与 Redis（11 篇）

- [聊聊 MySQL 索引](https://marksuper.xyz/2020/05/25/index_sql/)（2020-05）
- [Redis 分布式锁，你的使用正确吗](https://marksuper.xyz/2021/07/08/redis_distributed_lock/)（2021-07）
- [Go语言玩转Redis (一)：聊聊 Redis 的学习体系](https://marksuper.xyz/2022/01/25/redis1/)（2022-01）
- [Go 语言玩转Redis (二)：数据结构与应用--字符串](https://marksuper.xyz/2022/02/25/redis2/)（2022-02）
- [Mysql--排序](https://marksuper.xyz/2022/04/20/Mysql_order/)（2022-04）
- [Mysql--锁](https://marksuper.xyz/2022/08/26/Mysql_lock/)（2022-08）
- [Mysql--索引](https://marksuper.xyz/2022/09/23/Mysql_index/)（2022-09）
- [Mysql--事务（mvcc+间隙锁）](https://marksuper.xyz/2023/05/15/Mysql_shiwu/)（2023-05）
- [Mysql--临时表和group by](https://marksuper.xyz/2023/07/15/Mysq_groupby/)（2023-07）
- [Mysql--Join](https://marksuper.xyz/2023/08/01/Mysql_join/)（2023-08）
- [Mysql--如何实现高可用](https://marksuper.xyz/2023/12/15/Mysql_gaokeyong/)（2023-12）

## 四、分布式系统与中间件（5 篇）

- [Go 语言使用定时调度任务大杀器 — XXL-JOB](https://marksuper.xyz/2022/10/13/xxl-job/)（2022-10）
- [Go 语言分布式缓存 Groupcache -- 用法，源码深度解读](https://marksuper.xyz/2025/04/12/groupcache/)（2025-04）
- [用 ETCD + NSQ 实现分布式数据分片处理(Golang)](https://marksuper.xyz/2025/06/28/service_frag/)（2025-06）
- [使用 Maxwell 订阅 MySQL binlog 同步至 Kafka](https://marksuper.xyz/2025/07/01/maxwell/)（2025-07）
- [Go 语言分布式任务处理器 Machinery -- 架构，源码详解篇](https://marksuper.xyz/2025/07/20/machinery1/)（2025-07）

## 五、云原生：Kubernetes 与 Docker（3 篇）

- [K8s的设计理念与架构](https://marksuper.xyz/2022/03/01/k8s-design/)（2022-03）
- [K8s编排对象 -- POD](https://marksuper.xyz/2022/03/15/k8s-pod/)（2022-03）
- [深入理解 Docker](https://marksuper.xyz/2023/02/27/docker/)（2023-02）

## 六、算法专栏（5 篇）

- [算法专栏 (一)：构建自己的算法体系](https://marksuper.xyz/2021/11/22/leetcode1/)（2021-11）
- [算法专栏 (二)：算法复杂度](https://marksuper.xyz/2021/12/10/leetcode2/)（2021-12）
- [算法专栏 (三)：数组](https://marksuper.xyz/2021/12/18/leetcode3/)（2021-12）
- [算法专栏 (四)：链表（上）](https://marksuper.xyz/2021/12/25/leetcode4/)（2021-12）
- [算法专栏 (五)：链表（下）](https://marksuper.xyz/2022/01/03/leetcode5/)（2022-01）

## 七、网络与安全（3 篇）

- [聊聊 SSL/TLS (一）](https://marksuper.xyz/2021/03/03/ssl-tls-1/)（2021-03）
- [聊聊 SSL/TLS (二）](https://marksuper.xyz/2021/03/13/ssl-tls-2/)（2021-03）
- [Casbin 多租户模型（RABC-dom）正确打开方式](https://marksuper.xyz/2021/06/18/casbin_rabc_dom/)（2021-06）

## 八、工程工具与方法（5 篇）

- [给小白的git说明](https://marksuper.xyz/2019/05/15/talkGit/)（2019-05）
- [如何使用 Markdown](https://marksuper.xyz/2020/12/15/markdown/)（2020-12）
- [聊聊go的错误处理](https://marksuper.xyz/2020/03/23/HandleErr/)（2020-03）
- [如何使用 dlv 结合 Goland 进行程序 debug 调试](https://marksuper.xyz/2021/06/29/dlv-goland/)（2021-06）
- [如何使用 benchmark 进行性能分析](https://marksuper.xyz/2021/08/22/benchmark/)（2021-08）

## 九、经济与投顾笔记（3 篇）

- [战俘营经济学](https://marksuper.xyz/2021/01/08/enconomic_zf/)（2021-01）
- [投顾2](https://marksuper.xyz/2025/07/15/tougu2/)（2025-07）
- [投顾1](https://marksuper.xyz/2025/09/15/tougu/)（2025-09）

## 十、生活与猎奇随笔（2 篇）

- [以太猫](https://marksuper.xyz/2019/07/05/tokencat/)（2019-07）
- [程序员如何为女朋友做迪士尼攻略](https://marksuper.xyz/2023/03/26/disneyland/)（2023-03）
