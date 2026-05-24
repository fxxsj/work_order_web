# 项目基准比对与下一步推进计划

## 1. 概览 (Overview)

本次比对基准项目（`sub2api/frontend` - AI API Gateway）与当前重构项目（`work_order/web` - 印刷施工单跟踪系统前端）。
当前项目在架构上进行了轻量化和业务垂直化的重构，提升了开发体验（DX），统一了样式规范，并去除了与核心业务无关的冗余代码。

## 2. 差异对比情况 (Differences Comparison)

### 2.1 依赖与工程化 (Dependencies & Tooling)
* **新增构建优化**：引入了 `unplugin-auto-import` 和 `unplugin-vue-components`。Vue API (如 `ref`, `computed`)、Vue Router、Pinia 均实现了自动导入，并自动注册了 `src/components` 目录下的组件，大幅减少了样板代码。
* **样式引擎替换**：从纯 CSS / PostCSS 演进为 `SCSS + Tailwind CSS`，在保留 Tailwind 原子化优势的同时，增强了对复杂样式的编写能力（如 `variables.scss` 变量抽离）。
* **业务依赖调整**：
  * **移除**：去除了 Stripe、Airwallex 等支付依赖，去除了 `vue-i18n`（内部系统通常不需要多语言），去除了 `driver.js` 等引导库。
  * **新增**：引入 `dayjs` 替代原生时间处理，引入 `pinia-plugin-persistedstate` 统一处理状态持久化。

### 2.2 代码结构重构 (Code Structure)
* **目录瘦身与重组**：
  * 移除了 `i18n` 目录。
  * 新增了 `src/services/` 目录，预计用于更规范的 API 请求封装（Axios 实例与拦截器）。
  * 新增了 `src/directives/` 目录，封装了如 `vLoading` 等全局指令。
  * 样式文件从散落状态统一归纳至 `src/assets/styles/` (`global.scss`, `tailwindcss.css`)。
* **入口文件 (`main.ts`) 规范化**：
  * 增加了全局错误捕获 (`app.config.errorHandler`)。
  * 增加了全局指令注册和全局属性注册（如 `$formatDate`）。
  * 主题初始化逻辑与 Store (`useUIStore`) 深度结合，替代了原本直接操作 DOM 的粗暴做法。
  * 增加了完整的应用初始化流程（`initApp()` 恢复用户会话）。

### 2.3 组件与状态 (Components & State)
* **组件规划**：`vite.config.ts` 明确将 `components/common` (通用组件) 和 `components/dispatch` (业务组件：派单) 纳入自动解析，说明组件库已经有了清晰的层级划分。
* **状态持久化**：全面接入 `pinia-plugin-persistedstate`，取代了之前可能存在的手动 `localStorage` 读写。

---

## 3. 下一步的推进方向 (Next Steps)

鉴于目前前端基础设施（工程化配置、样式方案、状态管理、网络请求骨架）已经搭建完毕并完成了初步瘦身，接下来的推进方向应聚焦于**业务核心链路的打通与 UI/UX 的高品质落地**。

### 3.1 阶段一：基础框架与 UI 体系完善 (1-2天)
* **API 请求层联调确认**：检查 `src/services/` 下的 Axios 封装，确认 Request/Response 拦截器是否已正确处理 Token 携带、全局错误提示、401 登出逻辑。
* **UI/UX 规范落地**：
  * 基于 SCSS 和 Tailwind，确定系统的主题色调和基础布局 (Layout)。
  * 完成 Header（头部导航/用户信息）、Sidebar（侧边栏菜单）、Main（主内容区）的框架搭建。
  * 结合系统特性（“印刷施工单跟踪”），设计现代化、直观的界面，要求使用阴影、圆角、微动效等提升质感。

### 3.2 阶段二：核心业务模块开发 (3-5天)
基于之前规划的 `dispatch`（派单）等模块，依次实现：
* **工单列表与筛选 (Work Order List)**：表格展示、分页、状态过滤。
* **派单管理组件 (Dispatch Module)**：表单提交、状态流转操作。
* **数据看板 (Dashboard)**：如果业务需要，展示当前进行中、已完成的工单统计（可考虑是否重新引入轻量级图表库）。

### 3.3 阶段三：体验优化与测试 (1-2天)
* **全局加载与交互反馈**：确保所有的异步请求都有正确的 Loading 状态（利用 `vLoading` 指令）和操作成功/失败的 Toast 提示。
* **路由守卫完善**：确保未登录用户无法访问系统页面，权限控制精确到具体路由。
* **代码清理与规范检查**：运行 `npm run lint` 和 `npm run type-check` 确保 TypeScript 类型完全闭环，没有隐患。
