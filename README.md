# quboliu.github.io

Astro 正式博客，地址：https://quboliu.github.io/。

## 本地开发

使用 Node.js 22.22.3 或更新版本：

```sh
npm ci
npm run dev
npm run build
```

文章存放于 `src/content/posts/NNNN/index.md` 或 `index.mdx`，图片和附件与文章放在一起。新文章需通过 `npm run content:check`。

## 发布

Push 到 `main` 会触发 GitHub Pages 部署。工作流分别构建正式站与私有草稿站，各自生成搜索索引后合并发布文件；草稿源码不进入此仓库。

仅刷新草稿预览时，先 push 草稿库，再手动运行本仓库的 `Deploy to GitHub Pages` 工作流：

```sh
gh workflow run deploy.yml --repo quboliu/quboliu.github.io --ref main
```

跨仓库读取使用 Actions Secret `MINDINDEX_DEPLOY_KEY`，对应草稿库的只读 Deploy Key。不要把私钥放入源码、构建产物或日志。

两个仓库起初使用相同的主题和设置，之后主题修改需要同步到两处。
