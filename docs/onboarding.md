# Web 前端上手指南

## 前置要求

- Node.js 18+
- npm 或 pnpm

## 快速开始

```bash
# 安装
bash scripts/setup.sh

# 启动开发服务器
bash scripts/dev.sh

# 运行测试
bash scripts/test.sh

# 运行代码检查
bash scripts/lint.sh
```

## 手动安装（如脚本不可用）

```bash
npm install
npm run dev
```

## 开发命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产包
npm run lint       # ESLint 检查
npm run test:unit  # 运行单元测试
npm run preview    # 预览生产构建
```

## 注意事项

- 默认端口 5173
- 环境变量通过 `public/env.js` 注入
- 样式使用 Tailwind CSS 3 + SCSS
