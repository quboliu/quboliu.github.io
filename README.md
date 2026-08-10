# quboliu.github.io

[![Deploy to GitHub Pages](https://github.com/quboliu/quboliu.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/quboliu/quboliu.github.io/actions/workflows/deploy.yml)

基于 AstroPaper、MDX 和 GitHub Pages 的博客，地址为
[quboliu.github.io](https://quboliu.github.io/)。

## 已包含

- Markdown 与 MDX 文章
- 本地图片优化和响应式输出
- 基于 KaTeX 的数学公式渲染
- YouTube、哔哩哔哩延迟加载嵌入
- 外部 MP4 与字幕轨道
- Areas、标签、归档、分页和全文搜索
- RSS、Sitemap、Open Graph 与结构化数据
- 深色/浅色主题
- 基于 GitHub Discussions 的 Giscus 评论接口
- 推送到 `main` 后自动发布到 GitHub Pages

## 本地开发

需要 Node.js 22.22.3 或更高版本。

```bash
npm install
npm run dev
```

完整检查与静态构建：

```bash
npm run format:check
npm run lint
npm run build
npm run preview
```

`npm run build` 会运行 Astro 类型检查、生成静态页面并建立 Pagefind
搜索索引。

## 写一篇文章

文章位于 `src/content/posts/`。建议一篇文章使用一个目录，把图片与正文放在一起：

```text
src/content/posts/
└── my-post/
    ├── index.mdx
    ├── cover.webp
    └── diagram.png
```

可以从 `src/content/posts/_templates/_post.mdx` 复制。最小 frontmatter：

```yaml
---
lang: "zh-CN"
pubDatetime: 2026-07-30T12:00:00-04:00
title: "文章标题"
area: "tools-and-workflow"
draft: false
tags:
  - 技术
description: "一句话摘要"
---
```

`area` 是必填的单值字段，必须使用 `src/data/areas.ts` 中定义的稳定
slug；显示名称和描述统一在该文件中维护。

本地图片使用普通 Markdown：

```md
![清晰描述图片内容](./diagram.png)
```

### 嵌入视频

MDX 文章顶部导入组件：

```mdx
import VideoEmbed from "@/components/VideoEmbed.astro";
import HostedVideo from "@/components/HostedVideo.astro";
```

YouTube：

```mdx
<VideoEmbed provider="youtube" id="视频 ID" title="视频标题" start={0} />
```

哔哩哔哩：

```mdx
<VideoEmbed provider="bilibili" id="BV 号" title="视频标题" page={1} />
```

对象存储或视频服务中的 MP4：

```mdx
<HostedVideo
  src="https://media.example.com/video.mp4"
  poster="/images/video-cover.webp"
  captions="https://media.example.com/video.zh.vtt"
  title="视频标题"
/>
```

不要把大型视频文件提交到博客仓库。

## 启用评论

1. 在仓库设置中启用 GitHub Discussions。
2. 安装 [Giscus GitHub App](https://github.com/apps/giscus)。
3. 在 [giscus.app/zh-CN](https://giscus.app/zh-CN) 选择仓库和
   `Announcements` 分类。
4. 在仓库 `Settings → Secrets and variables → Actions → Variables`
   中添加：

   - `PUBLIC_GISCUS_REPO_ID`
   - `PUBLIC_GISCUS_CATEGORY_ID`

重新运行部署工作流后，评论区会自动出现。没有配置这些变量时，生产站点不会输出空评论区。

## 首次发布

1. GitHub 仓库名必须是 `quboliu.github.io`。
2. 打开 `Settings → Pages`。
3. 在 `Build and deployment → Source` 中选择 `GitHub Actions`。
4. 推送 `main` 分支，或手动运行 `Deploy to GitHub Pages` 工作流。

如需独立域名，在 GitHub Pages 中配置域名后，把
`astro-paper.config.ts` 的 `site.url` 改为新地址。

## 常用配置

- 站点信息与社交链接：`astro-paper.config.ts`
- Areas 名称、描述与顺序：`src/data/areas.ts`
- 首页：`src/pages/index.astro`
- 英文界面文案：`src/i18n/lang/en.ts`
- 关于页正文：`src/content/pages/about.md`
- 视频组件：`src/components/VideoEmbed.astro`
- 评论组件：`src/components/Comments.astro`
- 默认分享图：`public/default-og.jpg`

## 致谢与许可

站点基于 [AstroPaper](https://github.com/satnaing/astro-paper) 修改，
代码按 [MIT License](LICENSE) 发布。文章、图片和其他个人内容除特别说明外保留所有权利。
