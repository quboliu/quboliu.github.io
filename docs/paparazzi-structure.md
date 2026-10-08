# Paparazzi 栏目与档案

Paparazzi 首页以档案浏览为主，按栏目分区展示精选入口；栏目页展示完整列表。人物保留五档分类，公司与产品不套用人物档位。现有 `/paparazzi/<slug>` 档案地址保持不变。

## 新增栏目

在 `src/data/paparazziCategories.ts` 的 `PAPARAZZI_CATEGORIES` 中添加稳定 slug、名称、说明及允许的对象类型，导航与 `/paparazzi/category/<slug>` 列表页自动生成。新增对象类型时同时更新 `PAPARAZZI_SUBJECT_TYPES` 和 `SUBJECT_TYPE_NAMES`。通用页面框架同步到两站，档案内容按目标站独立维护。

## 新增档案

Markdown 放在 `src/content/pages/paparazzi/`。文件名必须在该目录树中唯一，作为公开档案 URL 的 slug。保留人物档案默认分类，以兼容已有内容；新档案显式填写栏目和类型。

```yaml
title: "Anthropic 公司档案：Claude 产品与官方资源导航"
subjectName: "Anthropic"
description: "说明这份档案关注的内容。"
paparazziCategory: "companies-products"
subjectType: "company"
verifiedDate: "2026-10-08"
website: "https://www.anthropic.com/"
relatedProducts: ["Claude"]
```

`verifiedDate` 只记录实际资料核查日期，不能随文字修改自动刷新；未核查的旧档案不补造日期。`relatedProducts` 是关联产品名称，不会生成尚不存在的产品档案链接。`avatarCandidates` 可继续配置公开头像或 Logo，缺失时显示名称首字母。人物必须声明 `paparazziTier`。

Anthropic 首篇采用用户提供的官方资源导航稿，保留原文核验日期与资料范围，不将导航指南扩写为未经调研的公司历史档案。
