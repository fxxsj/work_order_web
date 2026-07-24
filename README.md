# 印刷生产管理系统 - Web 前端

Vue 3 + Pinia + Vite Web 前端。

## 技术栈

- Vue 3.5
- Vue Router 4
- Pinia 2.3
- TypeScript
- Vite 6
- Tailwind CSS 3 + SCSS
- Vitest

## 目录结构

```
web/
├── src/
│   ├── api/             # API 模块
│   ├── assets/styles/   # 全局样式
│   ├── components/      # 通用组件
│   ├── composables/     # 组合式逻辑
│   ├── constants/       # 常量与状态映射
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia store
│   ├── types/           # TypeScript 类型
│   ├── utils/           # 工具函数
│   └── views/           # 页面
├── docs/                # Web 前端文档
├── tests/               # 测试
├── package.json
└── vite.config.ts
```

## 快速开始

```bash
npm install
npm run dev
```

默认开发地址：`http://localhost:5173`

## 常用命令

```bash
npm run dev
npm run build
npm run type-check
npm run lint:check
npm run test:run
```

## Cloudflare Pages 部署

Cloudflare Pages 可直接连接本仓库的 `main` 分支：

```text
构建命令：npm run build
输出目录：dist
```

在 Pages 的生产环境变量中设置后端地址（不含 `/v1`）：

```dotenv
VITE_API_BASE_URL=https://api.example.com/api
```

`public/env.js` 默认不覆盖 API 地址，因此 Pages 构建时注入的
`VITE_API_BASE_URL` 会生效。若使用容器或 Nginx 部署，也可以在部署阶段
生成 `env.js`，通过 `window.__APP_CONFIG__.API_BASE_URL` 覆盖构建配置。
后端域名、内部地址或其他环境专用信息不要提交到公共仓库。

## 开发约定

- 页面使用 `<script setup lang="ts">`。
- 状态管理使用 Pinia。
- API 调用统一放在 `src/api/`，共享 CRUD 逻辑优先使用 `BaseAPI`。
- 列表页优先使用 `TablePageLayout`、`FilterRow`、`DataTable`、`Pagination`。
- 状态标签优先使用 `StatusTag` 和 `src/constants/statusMeta.js`。
- 颜色、圆角、阴影和动效遵循 [DESIGN.md](DESIGN.md)。

## 文档

- Web 文档索引：[docs/README.md](docs/README.md)
- 设计系统：[DESIGN.md](DESIGN.md)
- 通用组件说明：[src/components/common/README.md](src/components/common/README.md)
- 根文档索引：[../docs/README.md](../docs/README.md)
