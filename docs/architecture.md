# Web 前端架构

> Vue 3 + Pinia + Vite Web 前端架构说明。

## 目录结构

```
web/
├── src/
│   ├── api/              # API 接口模块
│   │   ├── base/         # BaseAPI 基类
│   │   └── workorder/    # 业务模块 API
│   ├── components/       # 公共组件
│   ├── composables/      # 逻辑复用 (替代 Mixin)
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── views/            # 页面视图
│   └── assets/styles/    # 样式文件
├── docs/                 # 文档
├── tests/                # 测试
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json
```

## 架构模式

- **Composition API**：`<script setup>` 语法 + TypeScript
- **Pinia Store**：状态管理
- **Composables**：逻辑复用
- **统一错误处理**：errorHandler.js
- **模块化 API**：BaseAPI 基类 + 各业务模块

## 设计系统

- **Teal Glass**：基于 sub2api 风格的设计系统
- 主色调：Teal (#14b8a6)
- 圆角：rounded-xl (12px)
- 暗色模式：class 策略
- 详见 `DESIGN.md`

## 关键约定

- 颜色/透明度必须使用设计系统 Token
- 编辑页业务逻辑在对应 `*_edit_page.vue`
- API 调用统一走 `src/api/` 模块
- 使用 `<script setup>` + TypeScript
