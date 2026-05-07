# 印刷施工单跟踪系统 - Web 前端

> Vue 2 + Element UI Web 前端

## 技术栈

- Vue 2.7, Element UI 2.15, Vue Router 3, Vuex 3

## 关键文件

- `src/api/` - API 接口模块 (27个)
- `src/views/` - 页面视图
- `src/components/` - 公共组件
- `src/router/` - 路由配置
- `src/store/` - Vuex 状态管理

## 架构模式

- **Mixin 模式** - listPageMixin, permissionMixin, crudMixin
- **统一错误处理** - errorHandler.js
- **模块化 API** - BaseAPI 基类 + 各业务模块

## Critical Rules

- 颜色/透明度必须使用设计系统 Token
- 编辑页业务逻辑在对应 `*_edit_page.vue`
- API 调用统一走 `src/api/` 模块

## 开发命令

```bash
npm install
npm run serve
npm run lint
npm run build
```

## Skill Activation

本项目为 Vue 2 遗留前端，目前以维护为主，不激活额外 Skill。
