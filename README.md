# 青空博客

基于 Next.js 16、MDX、Tailwind CSS 与 Pagefind 的个人博客，静态发布至 GitHub Pages。

## 本地开发

需要 Node.js 22（见 `.nvmrc`）。

```bash
npm ci
npm run dev
```

常用命令：

```bash
npm run lint
npm run test
npm run build
```

`npm run build` 会将静态站点导出到 `out/`，并为文章与作品生成 `out/pagefind/` 搜索索引。

## CI

`.github/workflows/ci.yml` 在 Pull Request、`master` 分支推送和手动触发时运行：

- ESLint
- Vitest
- Next.js 静态构建与 Pagefind 索引
- 部署产物完整性检查

## CD

`.github/workflows/deploy.yml` 在 `master` 分支推送或手动触发时运行，完成校验后将 `out/` 发布到 GitHub Pages。

仓库的 GitHub Pages 发布源需要设置为 **GitHub Actions**：

`Settings` → `Pages` → `Build and deployment` → `Source` → `GitHub Actions`

站点自定义域名为 `qingkong996.com`，域名配置保存在 `public/CNAME`。
