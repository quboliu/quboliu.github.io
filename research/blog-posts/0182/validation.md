# 发布校验

日期：2026-09-14。

- 初始 blog-publish preflight 全部通过：quboliu 账号，固定 origin quboliu/quboliu.github.io，main 分支，干净且与 origin 同步。
- 变更范围仅 src/content/posts/0181、0182 及对应 research/blog-posts/0181、0182。
- 内容格式检查：136 篇通过。
- 修订后 npm run build 通过：Astro check 0 errors / 0 warnings / 0 hints；生成 398 页面；Pagefind 索引 136 篇。
- 两个生成路径 dist/posts/0181/index.html 与 dist/posts/0182/index.html 存在；标题正确；表格分别为 1、4 个；源文链接与正文索引标记正常。
- git diff --check 通过。
- 新建文件名无大写英文字母。
- 原始网页快照和完整 Kimi CLI 输出留在博客仓库研究目录，本目录 .gitignore 将它们排除公开提交；公开来源清单、审稿结果与作者回应。
- 没有创建配图，无独立性能实验；正文的经验数值明确标注为第一方报告。
- DDIA 工作目录没有新增正文或关联材料，因此没有需要从该目录删除的博客副本。

## 修订稿指纹

0181/index.md SHA-256：dc12faac731ed165430c8db11fa4bf6a746374ef09110ef060e3a79ec53e5f22

0182/index.md SHA-256：40bfd07a80b71780730f82b07279cdbac94d2bc0731a7497fce8351c69344d4c

## 发布条件

用户明确授权 Kimi 审稿与回应达成共识后直接提交、推送发布。Kimi 最终复审结果另见 review-2.md；实际发布不以 helper 的本地标题匹配结果为依据，而以 main 推送和部署检查为依据。
