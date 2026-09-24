---
title: "huanglianjing.com"
description: "追踪黄廉净个人站的 Go、数据库、基础设施、AI 与读书记录。"
subjectName: "黄廉净 / huanglianjing"
paparazziTier: "notable"
avatarCandidates:
  - url: "https://avatars.githubusercontent.com/u/6270403?v=4"
    source: "GitHub"
    profileUrl: "https://github.com/huanglianjing"
  - url: "https://github.com/huanglianjing.png?size=400"
    source: "GitHub profile image"
    profileUrl: "https://github.com/huanglianjing"
---

## 〇、博客档案与作者情报

- **五档定位（2026-09-24）：** 第四档。[个人站文章归档](https://huanglianjing.com/article)截至上次调查有 122 篇，Go、数据库与基础设施专题持续多年；更广范围的作品采用情况尚缺证据。

### 博客地址与统计

- **博客主页：** [huanglianjing.com](https://huanglianjing.com/)，当前站点标题为 “Moondo”；首页是前端单页应用，文章数据通过公开 API 加载。
- **文章归档：** [文章入口](https://huanglianjing.com/article)；[sitemap.xml](https://huanglianjing.com/sitemap.xml)列出文章路由；本报告以站点文章 API 的完整分页结果为准，而不是只抓首页当前可见的部分。
- **数据接口：** [article list API](https://huanglianjing.com/api/article/list?page=0)；API 从 page=0 到 page=12 共返回 122 条文章记录，字段包含标题、日期、分类、标签和摘要。
- **调查截点：** 2026-09-15。站点 API 解析出 **122 篇**有标题、日期和可访问路由的文章；每篇文章在下方只出现一次。
- **时间跨度：** 2021-06-12 至 2026-08-30；最新文章为[新版博客的设计与实现](https://huanglianjing.com/article/%E6%96%B0%E7%89%88%E5%8D%9A%E5%AE%A2%E7%9A%84%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0)。
- **分类数：** 20 个站点原生分类；报告将它们人工合并为 9 个主题组，保留原生分类统计作为校验。

### 年度发文量

| 年份 | 篇数 |
| ---: | ---: |
| 2026 | 10 |
| 2025 | 31 |
| 2024 | 25 |
| 2023 | 34 |
| 2022 | 5 |
| 2021 | 17 |

### 更新节奏与主题迁移

- 122 篇文章的相邻发布日期间隔中位数约 **5 天**；2021–2023 先建立 Go、数据库和基础设施知识底座，2024–2025 进入 MySQL、Redis、Go 工程库和分布式专题的连续更新阶段。
- 2026 年目前有 10 篇文章，最新内容集中在博客重构、singleflight、NAS 素材库、Claude Code/OpenCode 和大模型提问方法；这表明技术主题从传统后端继续向个人开发工具和 AI 工作流扩展。
- Go 是站点最大的原生分类，共 49 篇；数据库 29 篇，Linux 8 篇，消息队列 5 篇。作者的核心输出仍是工程知识，而不是泛泛的产品体验。
- [新版博客的设计与实现](https://huanglianjing.com/article/%E6%96%B0%E7%89%88%E5%8D%9A%E5%AE%A2%E7%9A%84%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0)自述旧站采用 Hugo + PaperMod，新站使用 Go、GORM、Gin、SQLite 和 Vue；博客本身是作者持续实践的一个项目。

### 站点原生分类分布

| 分类 | 篇数 |
| --- | ---: |
| Go | 49 |
| 数据库 | 29 |
| Linux | 8 |
| 消息队列 | 5 |
| AI | 3 |
| macOS | 3 |
| 年度总结 | 3 |
| web | 3 |
| 博客 | 2 |
| 读书笔记 | 2 |
| 随笔 | 2 |
| 分布式 | 2 |
| 编码 | 2 |
| 版本控制 | 2 |
| 广告 | 2 |
| NAS | 1 |
| 网络 | 1 |
| 监控 | 1 |
| 系统架构 | 1 |
| 容器 | 1 |
| **合计** | **122** |

### 作者情报：黄廉净 / huanglianjing

- **身份确认：** [GitHub 用户 API](https://api.github.com/users/huanglianjing)显示 login 为 huanglianjing，blog 字段为 huanglianjing.com，所在地为 China；public name 和 bio 字段为空。
- **公开账号快照：** 截至 2026-09-15，GitHub profile 显示 7 个 public repositories、21 个 followers；账号创建于 2013-12-27，profile updated_at 为 2026-07-11。数字会变化，仅作为调查截点记录。
- **公开证据：** 上次调查可核验的 7 个公开仓库中，最高 star 数为 [huanglianjing.com](https://github.com/huanglianjing/huanglianjing.com) 的 1 star；本次没有找到其出版或开源书籍、广泛采用的工具等更强证据，因此归入第四档。
- **项目动向：** [blog](https://github.com/huanglianjing/blog) 是当前网站源码，最近一次 push 为 2026-08-30；[article](https://github.com/huanglianjing/article) 是文章仓库，最近一次 push 同为 2026-08-30；[moonterm](https://github.com/huanglianjing/moonterm) 最近一次 push 为 2026-08-29；[tool](https://github.com/huanglianjing/tool) 最近一次 push 为 2026-08-02。
- **历史项目：** [huanglianjing.com](https://github.com/huanglianjing/huanglianjing.com)是旧站源码，最近一次 push 为 2026-05-17；[gradient](https://github.com/huanglianjing/gradient)和[moolody](https://github.com/huanglianjing/moolody)分别是渐变图片/视频与旋律生成器实验项目，star 数均为 0。
- **技术画像：** 公开文章从 Go 基础、标准库、并发、缓存和消息队列出发，延伸到 MySQL/Redis/MongoDB/ClickHouse，再进入 Linux、博客工程、AI coding agent 和阅读记录；技术宽度大于单一语言专栏，但目前仍属于个人知识型站点。
- **履历边界：** 没有在 GitHub profile、个人站点公开页面或文章数据中找到稳定的在线简历、职业履历或可交叉验证的雇主信息；不根据同名账号推断身份。

### 最近可见的公开更新

以下按文章发布日期列出最新 12 篇；日期直接来自站点 API。

- [新版博客的设计与实现](https://huanglianjing.com/article/%E6%96%B0%E7%89%88%E5%8D%9A%E5%AE%A2%E7%9A%84%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0)（2026-08-30）
- [singleflight：重复请求合并](https://huanglianjing.com/article/singleflight%EF%BC%9A%E9%87%8D%E5%A4%8D%E8%AF%B7%E6%B1%82%E5%90%88%E5%B9%B6)（2026-08-06）
- [相册测试素材库](https://huanglianjing.com/article/%E7%9B%B8%E5%86%8C%E6%B5%8B%E8%AF%95%E7%B4%A0%E6%9D%90%E5%BA%93)（2026-06-21）
- [OpenCode使用指南](https://huanglianjing.com/article/OpenCode%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97)（2026-05-17）
- [Claude Code使用指南](https://huanglianjing.com/article/Claude%20Code%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97)（2026-05-05）
- [大模型提问方式与提问模版](https://huanglianjing.com/article/%E5%A4%A7%E6%A8%A1%E5%9E%8B%E6%8F%90%E9%97%AE%E6%96%B9%E5%BC%8F%E4%B8%8E%E6%8F%90%E9%97%AE%E6%A8%A1%E7%89%88)（2026-04-26）
- [Ghostty的配置与使用](https://huanglianjing.com/article/Ghostty%E7%9A%84%E9%85%8D%E7%BD%AE%E4%B8%8E%E4%BD%BF%E7%94%A8)（2026-03-31）
- [Neo4j基础概念](https://huanglianjing.com/article/Neo4j%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)（2026-03-29）
- [TCPIP协议族](https://huanglianjing.com/article/TCPIP%E5%8D%8F%E8%AE%AE%E6%97%8F)（2026-02-22）
- [2025年度总结](https://huanglianjing.com/article/2025%E5%B9%B4%E5%BA%A6%E6%80%BB%E7%BB%93)（2026-01-01）
- [《自律修炼手册》读书笔记](https://huanglianjing.com/article/%E3%80%8A%E8%87%AA%E5%BE%8B%E4%BF%AE%E7%82%BC%E6%89%8B%E5%86%8C%E3%80%8B%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0)（2025-11-08）
- [PostgreSQL扩展插件：pgvector](https://huanglianjing.com/article/PostgreSQL%E6%89%A9%E5%B1%95%E6%8F%92%E4%BB%B6%EF%BC%9Apgvector)（2025-09-20）

### 社交、项目与内容入口

- [个人站](https://huanglianjing.com/)：文章、分类、标签和关于页面的主入口。
- [GitHub 主页](https://github.com/huanglianjing)：源码、文章仓库、moonterm 和其他实验项目入口。
- [文章仓库](https://github.com/huanglianjing/article)：GitHub profile 中与博客内容直接对应的公开仓库。
- [站点源码](https://github.com/huanglianjing/blog)：当前网站代码，适合追踪内容系统和技术栈变化。
- 暂未在公开 profile 和个人站点中核验到可归属作者的稳定微博、知乎、X、LinkedIn 或公开简历入口，不添加同名社交账号。

### 头像与履历来源

- **头像优先级 1：** [GitHub avatar](https://avatars.githubusercontent.com/u/6270403?v=4)，对应 huanglianjing 账号。
- **头像优先级 2：** [GitHub profile image endpoint](https://github.com/huanglianjing.png?size=400)，作为同源尺寸兜底。
- **最终兜底：** 如果两个远程头像都不可用，Paparazzi 卡片使用“黄廉净 / huanglianjing”的首字符生成 initials，不会留下破图空位。
- **履历来源：** 以 [GitHub profile](https://github.com/huanglianjing)、[GitHub 用户 API](https://api.github.com/users/huanglianjing)、[个人站 About](https://huanglianjing.com/article/%E5%85%B3%E4%BA%8E%E6%88%91)和[新版博客说明](https://huanglianjing.com/article/%E6%96%B0%E7%89%88%E5%8D%9A%E5%AE%A2%E7%9A%84%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0)为准；未找到公开 CV。

### 归类说明

下方文章按站点原生 category_name 合并到更适合 Paparazzi 导航的主题组；标题、链接和日期来自站点 API。原生分类分布表与主题组篇数相加均闭合到 122 篇。

## 一、Go 语言与后端工程（49 篇）

Go 是站点最大的技术分类，从基础语法、标准库、runtime、并发原语，到 Gin、GORM、Kafka、Redis 和各种工程库，构成一条完整的后端学习路径。

- [singleflight：重复请求合并](https://huanglianjing.com/article/singleflight%EF%BC%9A%E9%87%8D%E5%A4%8D%E8%AF%B7%E6%B1%82%E5%90%88%E5%B9%B6)（2026-08-06）
- [Go sync.RWMutex原理解析](https://huanglianjing.com/article/Go%20sync.RWMutex%E5%8E%9F%E7%90%86%E8%A7%A3%E6%9E%90)（2024-10-19）
- [Go sync.Mutex原理解析](https://huanglianjing.com/article/Go%20sync.Mutex%E5%8E%9F%E7%90%86%E8%A7%A3%E6%9E%90)（2024-10-06）
- [sarama：Go Kafka客户端](https://huanglianjing.com/article/sarama%EF%BC%9AGo%20Kafka%E5%AE%A2%E6%88%B7%E7%AB%AF)（2024-04-21）
- [go-redis：Go Redis客户端的使用](https://huanglianjing.com/article/go-redis%EF%BC%9AGo%20Redis%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%9A%84%E4%BD%BF%E7%94%A8)（2024-04-20）
- [cron：Go定时任务的使用与源码分析](https://huanglianjing.com/article/cron%EF%BC%9AGo%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90)（2024-04-20）
- [ulule limiter：Go限流器的使用与源码分析](https://huanglianjing.com/article/ulule%20limiter%EF%BC%9AGo%E9%99%90%E6%B5%81%E5%99%A8%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90)（2024-03-31）
- [snowflake：Go分布式ID生成算法](https://huanglianjing.com/article/snowflake%EF%BC%9AGo%E5%88%86%E5%B8%83%E5%BC%8FID%E7%94%9F%E6%88%90%E7%AE%97%E6%B3%95)（2024-03-30）
- [jinzhu now：Go时间工具包](https://huanglianjing.com/article/jinzhu%20now%EF%BC%9AGo%E6%97%B6%E9%97%B4%E5%B7%A5%E5%85%B7%E5%8C%85)（2024-03-26）
- [uuid：Go通用唯一标识符生成](https://huanglianjing.com/article/uuid%EF%BC%9AGo%E9%80%9A%E7%94%A8%E5%94%AF%E4%B8%80%E6%A0%87%E8%AF%86%E7%AC%A6%E7%94%9F%E6%88%90)（2024-03-16）
- [viper：Go配置文件](https://huanglianjing.com/article/viper%EF%BC%9AGo%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)（2024-03-15）
- [zap：Go高性能日志](https://huanglianjing.com/article/zap%EF%BC%9AGo%E9%AB%98%E6%80%A7%E8%83%BD%E6%97%A5%E5%BF%97)（2024-03-09）
- [GORM：Go ORM框架](https://huanglianjing.com/article/GORM%EF%BC%9AGo%20ORM%E6%A1%86%E6%9E%B6)（2024-03-09）
- [copier：Go结构体复制工具](https://huanglianjing.com/article/copier%EF%BC%9AGo%E7%BB%93%E6%9E%84%E4%BD%93%E5%A4%8D%E5%88%B6%E5%B7%A5%E5%85%B7)（2024-03-03）
- [Go泛型的使用](https://huanglianjing.com/article/Go%E6%B3%9B%E5%9E%8B%E7%9A%84%E4%BD%BF%E7%94%A8)（2024-03-01）
- [Gin：Go网络框架的使用与原理分析](https://huanglianjing.com/article/Gin%EF%BC%9AGo%E7%BD%91%E7%BB%9C%E6%A1%86%E6%9E%B6%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E5%8E%9F%E7%90%86%E5%88%86%E6%9E%90)（2024-02-25）
- [ratelimit：Go限流器的使用与源码分析](https://huanglianjing.com/article/ratelimit%EF%BC%9AGo%E9%99%90%E6%B5%81%E5%99%A8%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90)（2024-02-24）
- [Go单元测试与基准测试](https://huanglianjing.com/article/Go%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95%E4%B8%8E%E5%9F%BA%E5%87%86%E6%B5%8B%E8%AF%95)（2024-02-11）
- [Go内存分配与垃圾回收的原理分析](https://huanglianjing.com/article/Go%E5%86%85%E5%AD%98%E5%88%86%E9%85%8D%E4%B8%8E%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6%E7%9A%84%E5%8E%9F%E7%90%86%E5%88%86%E6%9E%90)（2024-01-28）
- [Go GMP调度器的设计与原理](https://huanglianjing.com/article/Go%20GMP%E8%B0%83%E5%BA%A6%E5%99%A8%E7%9A%84%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%8E%9F%E7%90%86)（2023-12-23）
- [ants：Go高性能协程池的使用与源码分析](https://huanglianjing.com/article/ants%EF%BC%9AGo%E9%AB%98%E6%80%A7%E8%83%BD%E5%8D%8F%E7%A8%8B%E6%B1%A0%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90)（2023-12-03）
- [go-cache：Go本地缓存的使用与源码分析](https://huanglianjing.com/article/go-cache%EF%BC%9AGo%E6%9C%AC%E5%9C%B0%E7%BC%93%E5%AD%98%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90)（2023-11-26）
- [Go通道的使用与原理](https://huanglianjing.com/article/Go%E9%80%9A%E9%81%93%E7%9A%84%E4%BD%BF%E7%94%A8%E4%B8%8E%E5%8E%9F%E7%90%86)（2023-11-18）
- [Go标准库：signal](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Asignal)（2023-09-22）
- [Go标准库：os](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Aos)（2023-09-22）
- [Go标准库：net](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Anet)（2023-09-22）
- [Go标准库：io](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Aio)（2023-09-22）
- [Go标准库：http](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Ahttp)（2023-09-22）
- [Go标准库：builtin](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Abuiltin)（2023-09-22）
- [Go标准库：bufio](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Abufio)（2023-09-22）
- [Go标准库：sync](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Async)（2023-09-18）
- [Go标准库：sort](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Asort)（2023-09-18）
- [Go标准库：regexp](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Aregexp)（2023-09-18）
- [Go标准库：math](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Amath)（2023-09-18）
- [Go标准库：atomic](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Aatomic)（2023-09-18）
- [Go Modules：包管理](https://huanglianjing.com/article/Go%20Modules%EF%BC%9A%E5%8C%85%E7%AE%A1%E7%90%86)（2023-08-24）
- [Go程序的启动和退出](https://huanglianjing.com/article/Go%E7%A8%8B%E5%BA%8F%E7%9A%84%E5%90%AF%E5%8A%A8%E5%92%8C%E9%80%80%E5%87%BA)（2023-08-17）
- [Go标准库：log](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Alog)（2023-07-13）
- [Go pprof性能分析](https://huanglianjing.com/article/Go%20pprof%E6%80%A7%E8%83%BD%E5%88%86%E6%9E%90)（2023-07-10）
- [Go标准库：strings](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Astrings)（2023-07-06）
- [Go标准库：reflect](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Areflect)（2023-07-06）
- [Go标准库：json](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Ajson)（2023-07-06）
- [Go标准库：errors](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Aerrors)（2023-07-06）
- [Go标准库：time](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Atime)（2023-07-05）
- [Go标准库：strconv](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Astrconv)（2023-07-05）
- [Go标准库：fmt](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Afmt)（2023-07-05）
- [Go标准库：context](https://huanglianjing.com/article/Go%E6%A0%87%E5%87%86%E5%BA%93%EF%BC%9Acontext)（2023-07-04）
- [Go安装和使用](https://huanglianjing.com/article/Go%E5%AE%89%E8%A3%85%E5%92%8C%E4%BD%BF%E7%94%A8)（2021-06-30）
- [Go基础语法](https://huanglianjing.com/article/Go%E5%9F%BA%E7%A1%80%E8%AF%AD%E6%B3%95)（2021-06-30）

## 二、数据库、搜索与存储（29 篇）

覆盖 MySQL、Redis、MongoDB、ClickHouse、PostgreSQL/pgvector、Faiss 与 Neo4j，既有入门概念，也有架构、索引、事务、日志和源码分析。

- [Neo4j基础概念](https://huanglianjing.com/article/Neo4j%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)（2026-03-29）
- [PostgreSQL扩展插件：pgvector](https://huanglianjing.com/article/PostgreSQL%E6%89%A9%E5%B1%95%E6%8F%92%E4%BB%B6%EF%BC%9Apgvector)（2025-09-20）
- [Faiss基础概念](https://huanglianjing.com/article/Faiss%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)（2025-09-20）
- [ClickHouse MergeTree表引擎](https://huanglianjing.com/article/ClickHouse%20MergeTree%E8%A1%A8%E5%BC%95%E6%93%8E)（2025-09-14）
- [ClickHouse基础概念](https://huanglianjing.com/article/ClickHouse%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)（2025-09-13）
- [MongoDB WiredTiger存储引擎](https://huanglianjing.com/article/MongoDB%20WiredTiger%E5%AD%98%E5%82%A8%E5%BC%95%E6%93%8E)（2025-09-09）
- [MongoDB基础概念](https://huanglianjing.com/article/MongoDB%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)（2025-09-05）
- [Redis缓存设计](https://huanglianjing.com/article/Redis%E7%BC%93%E5%AD%98%E8%AE%BE%E8%AE%A1)（2025-08-18）
- [Redis的使用场景](https://huanglianjing.com/article/Redis%E7%9A%84%E4%BD%BF%E7%94%A8%E5%9C%BA%E6%99%AF)（2025-08-16）
- [Redis最佳实践和问题排查](https://huanglianjing.com/article/Redis%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5%E5%92%8C%E9%97%AE%E9%A2%98%E6%8E%92%E6%9F%A5)（2025-08-16）
- [Redis服务器架构](https://huanglianjing.com/article/Redis%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%9E%B6%E6%9E%84)（2025-08-13）
- [Redis源码分析：基础数据结构](https://huanglianjing.com/article/Redis%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%EF%BC%9A%E5%9F%BA%E7%A1%80%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84)（2025-08-12）
- [Redis Sentinel](https://huanglianjing.com/article/Redis%20Sentinel)（2025-08-09）
- [Redis Cluster](https://huanglianjing.com/article/Redis%20Cluster)（2025-08-09）
- [MySQL的使用场景](https://huanglianjing.com/article/MySQL%E7%9A%84%E4%BD%BF%E7%94%A8%E5%9C%BA%E6%99%AF)（2025-08-01）
- [MySQL优化指南](https://huanglianjing.com/article/MySQL%E4%BC%98%E5%8C%96%E6%8C%87%E5%8D%97)（2025-03-17）
- [MySQL的日志](https://huanglianjing.com/article/MySQL%E7%9A%84%E6%97%A5%E5%BF%97)（2025-03-14）
- [MySQL的锁](https://huanglianjing.com/article/MySQL%E7%9A%84%E9%94%81)（2025-03-09）
- [MySQL的索引](https://huanglianjing.com/article/MySQL%E7%9A%84%E7%B4%A2%E5%BC%95)（2025-03-08）
- [MySQL的事务](https://huanglianjing.com/article/MySQL%E7%9A%84%E4%BA%8B%E5%8A%A1)（2025-03-08）
- [MySQL的函数](https://huanglianjing.com/article/MySQL%E7%9A%84%E5%87%BD%E6%95%B0)（2025-03-06）
- [MySQL安装与使用](https://huanglianjing.com/article/MySQL%E5%AE%89%E8%A3%85%E4%B8%8E%E4%BD%BF%E7%94%A8)（2025-03-02）
- [MySQL基础知识](https://huanglianjing.com/article/MySQL%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86)（2025-03-02）
- [MySQL常用操作](https://huanglianjing.com/article/MySQL%E5%B8%B8%E7%94%A8%E6%93%8D%E4%BD%9C)（2025-02-28）
- [TDSQL开发规范与最佳实践](https://huanglianjing.com/article/TDSQL%E5%BC%80%E5%8F%91%E8%A7%84%E8%8C%83%E4%B8%8E%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5)（2024-05-12）
- [Prometheus基础概念](https://huanglianjing.com/article/Prometheus%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)（2022-03-07）
- [Redis基础概念](https://huanglianjing.com/article/Redis%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)（2021-12-19）
- [Redis安装与使用](https://huanglianjing.com/article/Redis%E5%AE%89%E8%A3%85%E4%B8%8E%E4%BD%BF%E7%94%A8)（2021-12-18）
- [SQL基础语句用法](https://huanglianjing.com/article/SQL%E5%9F%BA%E7%A1%80%E8%AF%AD%E5%8F%A5%E7%94%A8%E6%B3%95)（2021-11-07）

## 三、消息、网络与分布式系统（9 篇）

收录 Kafka、TCP/IP、CAP/BASE、限流和广告媒体系统架构等内容，体现作者从组件使用向系统设计和可靠性问题的延伸。

- [TCPIP协议族](https://huanglianjing.com/article/TCPIP%E5%8D%8F%E8%AE%AE%E6%97%8F)（2026-02-22）
- [广告媒体平台对接系统的架构升级优化](https://huanglianjing.com/article/%E5%B9%BF%E5%91%8A%E5%AA%92%E4%BD%93%E5%B9%B3%E5%8F%B0%E5%AF%B9%E6%8E%A5%E7%B3%BB%E7%BB%9F%E7%9A%84%E6%9E%B6%E6%9E%84%E5%8D%87%E7%BA%A7%E4%BC%98%E5%8C%96)（2024-05-19）
- [分布式基础理论：CAP和BASE](https://huanglianjing.com/article/%E5%88%86%E5%B8%83%E5%BC%8F%E5%9F%BA%E7%A1%80%E7%90%86%E8%AE%BA%EF%BC%9ACAP%E5%92%8CBASE)（2024-05-05）
- [常用限流算法介绍](https://huanglianjing.com/article/%E5%B8%B8%E7%94%A8%E9%99%90%E6%B5%81%E7%AE%97%E6%B3%95%E4%BB%8B%E7%BB%8D)（2024-05-03）
- [Kafka常见问题](https://huanglianjing.com/article/Kafka%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)（2021-10-28）
- [Kafka安装、配置与使用](https://huanglianjing.com/article/Kafka%E5%AE%89%E8%A3%85%E3%80%81%E9%85%8D%E7%BD%AE%E4%B8%8E%E4%BD%BF%E7%94%A8)（2021-10-26）
- [Kafka再均衡原理及源码分析](https://huanglianjing.com/article/Kafka%E5%86%8D%E5%9D%87%E8%A1%A1%E5%8E%9F%E7%90%86%E5%8F%8A%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90)（2021-10-13）
- [Kafka对ZooKeeper的依赖与移除](https://huanglianjing.com/article/Kafka%E5%AF%B9ZooKeeper%E7%9A%84%E4%BE%9D%E8%B5%96%E4%B8%8E%E7%A7%BB%E9%99%A4)（2021-10-03）
- [Kafka基础概念](https://huanglianjing.com/article/Kafka%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)（2021-09-28）

## 四、Linux、macOS 与基础设施（14 篇）

包括 Linux 命令、shell、Makefile、Vim、开发配置，macOS/Homebrew/Ghostty，Docker、监控告警和 NAS 素材等日常工程基础设施。

- [相册测试素材库](https://huanglianjing.com/article/%E7%9B%B8%E5%86%8C%E6%B5%8B%E8%AF%95%E7%B4%A0%E6%9D%90%E5%BA%93)（2026-06-21）
- [Ghostty的配置与使用](https://huanglianjing.com/article/Ghostty%E7%9A%84%E9%85%8D%E7%BD%AE%E4%B8%8E%E4%BD%BF%E7%94%A8)（2026-03-31）
- [Makefile基础语法](https://huanglianjing.com/article/Makefile%E5%9F%BA%E7%A1%80%E8%AF%AD%E6%B3%95)（2025-05-25）
- [Linux软件安装工具的使用](https://huanglianjing.com/article/Linux%E8%BD%AF%E4%BB%B6%E5%AE%89%E8%A3%85%E5%B7%A5%E5%85%B7%E7%9A%84%E4%BD%BF%E7%94%A8)（2025-05-17）
- [Linux shell基础语法](https://huanglianjing.com/article/Linux%20shell%E5%9F%BA%E7%A1%80%E8%AF%AD%E6%B3%95)（2025-05-17）
- [Linux常用系统操作](https://huanglianjing.com/article/Linux%E5%B8%B8%E7%94%A8%E7%B3%BB%E7%BB%9F%E6%93%8D%E4%BD%9C)（2025-05-05）
- [我的开发配置](https://huanglianjing.com/article/%E6%88%91%E7%9A%84%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE)（2025-04-13）
- [crontab定时任务的用法](https://huanglianjing.com/article/crontab%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1%E7%9A%84%E7%94%A8%E6%B3%95)（2024-11-03）
- [系统监控与告警点梳理](https://huanglianjing.com/article/%E7%B3%BB%E7%BB%9F%E7%9B%91%E6%8E%A7%E4%B8%8E%E5%91%8A%E8%AD%A6%E7%82%B9%E6%A2%B3%E7%90%86)（2024-09-15）
- [Linux基础命令用法](https://huanglianjing.com/article/Linux%E5%9F%BA%E7%A1%80%E5%91%BD%E4%BB%A4%E7%94%A8%E6%B3%95)（2023-08-10）
- [macOS的快捷键与常用软件](https://huanglianjing.com/article/macOS%E7%9A%84%E5%BF%AB%E6%8D%B7%E9%94%AE%E4%B8%8E%E5%B8%B8%E7%94%A8%E8%BD%AF%E4%BB%B6)（2023-07-21）
- [Homebrew的安装和使用](https://huanglianjing.com/article/Homebrew%E7%9A%84%E5%AE%89%E8%A3%85%E5%92%8C%E4%BD%BF%E7%94%A8)（2023-07-21）
- [Docker入门与命令](https://huanglianjing.com/article/Docker%E5%85%A5%E9%97%A8%E4%B8%8E%E5%91%BD%E4%BB%A4)（2022-02-27）
- [Vim操作命令](https://huanglianjing.com/article/Vim%E6%93%8D%E4%BD%9C%E5%91%BD%E4%BB%A4)（2021-07-16）

## 五、AI 与开发工具（3 篇）

2026 年新增的 AI 内容集中讨论 Claude Code、OpenCode 和大模型提问方法，显示站点开始把 AI coding agent 纳入开发工具链。

- [OpenCode使用指南](https://huanglianjing.com/article/OpenCode%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97)（2026-05-17）
- [Claude Code使用指南](https://huanglianjing.com/article/Claude%20Code%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97)（2026-05-05）
- [大模型提问方式与提问模版](https://huanglianjing.com/article/%E5%A4%A7%E6%A8%A1%E5%9E%8B%E6%8F%90%E9%97%AE%E6%96%B9%E5%BC%8F%E4%B8%8E%E6%8F%90%E9%97%AE%E6%A8%A1%E7%89%88)（2026-04-26）

## 六、Web、编码与版本控制（7 篇）

保留 HTML/CSS/JavaScript、JSON/XML/YAML/TOML、Git 基础和开发规范等通用工程知识。

- [常用数据格式语法介绍：JSON、XML、YAML、TOML](https://huanglianjing.com/article/%E5%B8%B8%E7%94%A8%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F%E8%AF%AD%E6%B3%95%E4%BB%8B%E7%BB%8D%EF%BC%9AJSON%E3%80%81XML%E3%80%81YAML%E3%80%81TOML)（2023-09-13）
- [Git开发规范](https://huanglianjing.com/article/Git%E5%BC%80%E5%8F%91%E8%A7%84%E8%8C%83)（2023-09-13）
- [Git基础概念与常用命令](https://huanglianjing.com/article/Git%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5%E4%B8%8E%E5%B8%B8%E7%94%A8%E5%91%BD%E4%BB%A4)（2021-11-14）
- [JavaScript基础知识](https://huanglianjing.com/article/JavaScript%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86)（2021-10-07）
- [Markdown基础语法](https://huanglianjing.com/article/Markdown%E5%9F%BA%E7%A1%80%E8%AF%AD%E6%B3%95)（2021-07-11）
- [HTML基础知识](https://huanglianjing.com/article/HTML%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86)（2021-06-30）
- [CSS基础知识](https://huanglianjing.com/article/CSS%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86)（2021-06-30）

## 七、博客建设与个人记录（2 篇）

记录旧博客迁移、新博客的设计与实现以及 Hugo 部署，能直接观察作者内容基础设施的演进。

- [新版博客的设计与实现](https://huanglianjing.com/article/%E6%96%B0%E7%89%88%E5%8D%9A%E5%AE%A2%E7%9A%84%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0)（2026-08-30）
- [Hugo的部署与使用](https://huanglianjing.com/article/Hugo%E7%9A%84%E9%83%A8%E7%BD%B2%E4%B8%8E%E4%BD%BF%E7%94%A8)（2023-07-17）

## 八、阅读、年度总结与随笔（7 篇）

包含《原子习惯》《自律修炼手册》读书笔记、年度回顾、关于我和专注力训练，构成技术内容之外的个人知识记录。

- [2025年度总结](https://huanglianjing.com/article/2025%E5%B9%B4%E5%BA%A6%E6%80%BB%E7%BB%93)（2026-01-01）
- [《自律修炼手册》读书笔记](https://huanglianjing.com/article/%E3%80%8A%E8%87%AA%E5%BE%8B%E4%BF%AE%E7%82%BC%E6%89%8B%E5%86%8C%E3%80%8B%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0)（2025-11-08）
- [专注力训练](https://huanglianjing.com/article/%E4%B8%93%E6%B3%A8%E5%8A%9B%E8%AE%AD%E7%BB%83)（2025-02-18）
- [2024年度总结](https://huanglianjing.com/article/2024%E5%B9%B4%E5%BA%A6%E6%80%BB%E7%BB%93)（2025-01-13）
- [《原子习惯》读书笔记](https://huanglianjing.com/article/%E3%80%8A%E5%8E%9F%E5%AD%90%E4%B9%A0%E6%83%AF%E3%80%8B%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0)（2024-11-09）
- [关于我](https://huanglianjing.com/article/%E5%85%B3%E4%BA%8E%E6%88%91)（2022-01-16）
- [2021年度总结](https://huanglianjing.com/article/2021%E5%B9%B4%E5%BA%A6%E6%80%BB%E7%BB%93)（2022-01-16）

## 九、广告业务与平台实践（2 篇）

集中记录计算广告基础与腾讯广告开发，属于业务平台实践线索，和技术基础文章相互补充。

- [计算广告基础概念](https://huanglianjing.com/article/%E8%AE%A1%E7%AE%97%E5%B9%BF%E5%91%8A%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)（2022-02-01）
- [腾讯广告开发笔记](https://huanglianjing.com/article/%E8%85%BE%E8%AE%AF%E5%B9%BF%E5%91%8A%E5%BC%80%E5%8F%91%E7%AC%94%E8%AE%B0)（2021-06-12）

## 十、追踪结论

黄廉净（huanglianjing）的公开轨迹是一份持续扩张的个人技术知识库：2021 年从 Go、Kafka、Redis 和 Linux 基础开始，2023–2025 年形成 Go 工程库、数据库和系统基础设施的密集内容，2026 年则增加了 AI coding agent、博客重构、NAS 和个人效率主题。站点的文章规模和更新频率值得持续跟踪；当前作品证据支持第四档。

后续优先检查 [文章 API](https://huanglianjing.com/api/article/list?page=0)、[sitemap](https://huanglianjing.com/sitemap.xml)、[article 仓库](https://github.com/huanglianjing/article)和 [blog 仓库](https://github.com/huanglianjing/blog)；若未来出现 100+ star 项目、公开书籍或系列课程，再按分档规则重新评估。
