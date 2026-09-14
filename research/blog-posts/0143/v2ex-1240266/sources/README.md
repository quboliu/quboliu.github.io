# 资料与证据

## 原始资料

来源：[V2EX 主题 1240266](https://v2ex.com/t/1240266#reply34)。本次读取主帖及网页可见的 #1–#37，未发现分页。#34 只是赞同 #4/#16，评审没有限定为这一条回复。网页晚于公开 API：API 当时仅返回 32 条回复，主题计数也较旧；因此楼层以 HTML 为准。讨论持续更新，不能把本次快照称为最终完整讨论。

- [topic.html](topic.html)：原始网页，保留主帖与楼层上下文。
- [replies.json](replies.json)：从网页整理的楼层、作者、正文、回复 ID 和直达链接。
- [topic-api.json](topic-api.json)：辅助核对主帖的公开 API 响应，不能用其回复数覆盖网页。
- [manifest.json](manifest.json)：获取时间、来源、文件 SHA-256。

这些是本地研究材料，不代表评论作者参与了本项目、认可本设计，也未把原帖全文另行发布。本文“评审”是对公开建议的技术分析。

## 技术与法律核对资料

以下为 2026-09-08 查阅的官方资料。设计中引用的是相关能力与边界，不代表厂商已对本方案作出保证。

| 来源 | 支持的判断 |
|---|---|
| [S3 概述](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) | 对象存储与媒体协议解析分层 |
| [S3 预签名 URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) | 有效期、重复使用和同 key 上传覆盖风险 |
| [S3 复制](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html) | 跨区域复制为异步能力，不能直接推导零 RPO |
| [CloudFront 私有内容](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html) | 播放授权与私有内容分发 |
| [RDS Multi-AZ 单备用](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html) | 同步备用、故障切换与非读扩展边界 |
| [AWS Regions/AZs](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/) | 区域和可用区故障域区分 |
| [Route 53 GeoDNS](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy-geo.html) | 按查询来源地理位置路由，不理解租户归属 |
| [RFC 8656](https://www.rfc-editor.org/rfc/rfc8656.html) | TURN 是 NAT 穿越中的中继协议 |
| [R2 数据位置](https://developers.cloudflare.com/r2/reference/data-location/) | location hint 与 jurisdiction 的保证不同 |
| [EDPB 国际数据传输指南](https://www.edpb.europa.eu/sme/be-compliant/international-data-transfers_en) | 跨境传输需满足条件，并非一律禁止 |
| [GDPR 正文](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng) | 第 83 条罚款层级，纠正评论中的 10% 表述 |

## 证据等级

F 编号为原帖事实陈述，仍是发帖人的自述；R 为整理后的需求；A 为设计假设；D 为本次选定的技术决策；T 为未来验收用例。产品能力以官方文档核对；性能、费用、客户法定义务及现有源码行为，没有测试或合同证据时均不写成已证实。
