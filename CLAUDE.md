# 印刷生产管理系统 - Web 前端

> Vue 3 + Pinia + Vite Web 前端

## 技术栈

- Vue 3.5, Vue Router 4, Pinia 2.3, TypeScript
- 构建工具: Vite 6
- 样式: Tailwind CSS 3 + SCSS + 自研通用组件
- 国际化: 无 (中文单语言)

## 关键文件

- `src/api/` - API 接口模块
- `src/views/` - 页面视图
- `src/components/` - 公共组件
- `src/router/` - 路由配置
- `src/stores/` - Pinia 状态管理
- `src/assets/styles/` - 样式文件

## 架构模式

- **Composition API** - `<script setup>` 语法
- **Pinia Store** - 状态管理
- **Composables** - 逻辑复用 (替代 Mixin)
- **统一错误处理** - errorHandler.js
- **模块化 API** - BaseAPI 基类 + 各业务模块

## 设计系统

- **Teal Glass** - 基于 sub2api 风格的设计系统
- 主色调: Teal (#14b8a6)
- 圆角: rounded-xl (12px)
- 暗色模式: class 策略
- 详见 `DESIGN.md`

## Critical Rules

- 颜色/透明度必须使用设计系统 Token
- 编辑页业务逻辑在对应 `*_edit_page.vue`
- API 调用统一走 `src/api/` 模块
- 使用 `<script setup>` + TypeScript

## 开发命令

```bash
npm install
npm run dev
npm run lint
npm run build
npm run test:unit
```

## Skill Activation

按当前 Vue 3 + Vite 架构补齐页面和组件即可。
