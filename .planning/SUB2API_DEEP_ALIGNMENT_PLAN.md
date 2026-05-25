# 以 sub2api/frontend 为基准的深度对齐计划

> 更新日期：2026-05-25  
> 基准项目：`/home/chenjiaxing/文档/sub2api/frontend`  
> 当前项目：`/home/chenjiaxing/文档/work_order/web`  
> 审查范围：两端 `src`、`components`、`views`、`composables`、`stores`、`router`、样式入口、测试组织、构建脚本  
> 报告口径：按当前代码实际状态重写；用户最近一轮调整已纳入基线，不再作为待办重复列出。

## 1. 当前结论

当前项目已经完成了“对齐 sub2api 基础页面架构”的大部分工作。`TablePageLayout`、`DataTable`、`RowActions`、`SummaryTable`、`LineItemsTable`、`FilterRow`、`DescriptionGrid` 等基础组件已形成可复用体系；`src/views` 中原生 table 已基本只剩打印视图；路由也已开始按领域拆分到 `src/router/modules/*`。

现在与 sub2api 的差距已经从“页面样式和组件缺失”转为：

- 领域组件目录刚建立，但 `components/workorder`、`components/task`、`components/inventory` 目前仍只有占位 `index.ts`，真实业务组件仍大量散在 `views/**/components`。
- composable 层有进展，已新增并导出 `useExportJob`，但任务看板、工单流程、明细项管理等高复杂业务行为仍未抽出。
- 测试覆盖开始补齐，已有组件、store、service、composable、api 基础测试，但还缺 `LineItemsTable`、`useExportJob`、router 守卫和领域业务组件测试。
- 样式残留已经明显减少，但视图层仍有少量 `<style>` / `style=`；组件层仍有可视化、虚拟滚动、表格行为样式，需要分类治理。
- 路由拆分已经启动，但 meta 标准化、title 解析独立文件、router 测试还没完成。

下一步不应继续以“清 table 数量”为主，而应以“领域组件真实迁移 + composable 行为沉淀 + 测试防回归 + 样式资产治理”为主。

## 2. 当前扫描基线

### 2.1 规模对比

| 项目 | Vue 文件数 | 组件组织 | 测试/工程成熟度 |
| --- | ---: | --- | --- |
| sub2api/frontend | 247 | `common`、`layout`、`account`、`payment`、`channels`、`user`、`charts` 等领域目录完整 | API、router、stores、components、composables、utils 均有测试，含 coverage 脚本 |
| work_order/web | 205 | `common`、`layout`、`dispatch` 已稳定；`workorder`、`task`、`inventory` 目录已创建但未迁入真实组件 | 已有组件、composable、store、service、api 基础测试，但缺 router/coverage/关键领域组件测试 |

### 2.2 当前项目残留

`src/views` 范围：

| 类型 | 当前状态 |
| --- | --- |
| 原生 table | 仅 `src/views/workorder/components/WorkOrderPrint.vue` |
| 页面级 `<style>` | `DashboardMobile.vue`、`AuditLogList.vue`、`WorkOrderForm.vue`、`WorkOrderPrint.vue` |
| 内联 `style=` | `SupervisorDashboard.vue`、`TaskColumn.vue`、`TaskDragDropList.vue`、`WorkOrderList.vue`、`ProcessManagement.vue`、`SyncTaskPrompt.vue` |

`src/**/*.vue` 范围：

| 类型 | 当前状态 |
| --- | --- |
| 原生 table | `DataTable`、`LineItemsTable`、`SummaryTable`、`VirtualTable`、`DispatchPreviewTable`、`VirtualList`、`WorkOrderPrint` |
| `<style>` | 33 个 Vue 文件，主要集中在通用组件、可视化组件、布局组件和少量视图 |
| 内联 `style=` | 26 个 Vue 文件，主要集中在虚拟滚动、可视化、弹窗、任务看板和少量视图 |

说明：

- 视图层 table 已达可接受状态，`WorkOrderPrint.vue` 属于打印例外。
- 组件层 table 是表格组件本体或虚拟滚动/打印场景，不应继续按“命中即问题”处理。
- 下一轮扫描应按“是否有合理职责”审查，而不是只追求清零。

## 3. 已完成且不再作为待办展开

### 3.1 页面表格与基础组件

- `DataTable`、`TablePageLayout` 已对齐 sub2api 的核心结构。
- `SummaryTable` 已覆盖 dashboard、task、finance、workorder 详情类只读表。
- `LineItemsTable` 已覆盖采购、发货、销售、产品、图稿、版类、工单拆分、任务拆分等明细编辑表。
- `RowActions` 已支持 `tone`、`visible`、`disabled`、`loading`、`loadingLabel`、`title`。
- `DescriptionGrid` / `DescriptionItem` 已清理旧描述网格。

### 3.2 路由模块化启动

已新增：

- `src/router/modules/workorder.ts`
- `src/router/modules/master-data.ts`
- `src/router/modules/plates.ts`
- `src/router/modules/procurement.ts`
- `src/router/modules/sales.ts`
- `src/router/modules/task.ts`
- `src/router/modules/finance.ts`
- `src/router/modules/inventory.ts`

`src/router/index.ts` 已开始只保留顶层路由、守卫和模块组合。

### 3.3 领域目录入口启动

已新增：

- `src/components/workorder/index.ts`
- `src/components/task/index.ts`
- `src/components/inventory/index.ts`

`vite.config.ts` 的 `Components` 自动导入目录已包含这三个领域目录。

当前状态：目录已建立，但仍是空导出，下一步要迁入真实组件。

### 3.4 composable 扩展

已新增并导出：

- `src/composables/useExportJob.ts`

当前状态：可复用导出任务生命周期已经初步抽出，但还缺测试，也需要确认是否有页面实际接入。

## 4. 与 sub2api 的剩余关键差异

### 4.1 领域组件还没有真正落地

sub2api 的强项是业务组件目录真实承载复杂 UI：

- `components/account/*`
- `components/payment/*`
- `components/channels/*`
- `components/user/*`
- `components/charts/*`

当前项目虽然已有领域目录入口，但真实组件仍在：

- `src/views/workorder/components/*`
- `src/views/task/components/*`
- `src/views/inventory/components/*`
- `src/views/purchase/components/*`
- `src/views/finance/components/*`

这意味着 route view 和页面内组件的边界仍没有完全稳定。下一步应迁真实组件，而不是继续新增空目录。

### 4.2 composable 还偏 CRUD，生产域行为不足

当前已有：

- `useCrudList`
- `useCRUD`
- `useCrudPermission`
- `useExport`
- `useExportJob`
- `useForm`
- `usePagination`
- `useTableLoader`
- `useTableSelection`
- `useKeyedDebouncedSearch`

仍缺：

- 工单流程状态与动作抽象。
- 任务看板拖拽、分派、批量操作状态抽象。
- 明细项增删改和金额/数量计算抽象。
- 复杂筛选 URL/query 同步。
- 路由加载/标题/权限元信息的测试化抽象。

### 4.3 测试覆盖仍低于基准

当前测试已有：

- components：`DataTable`、`RowActions`、`SummaryTable`、`FilterRow`、`DescriptionGrid` 等。
- composables：`useCrudList`、`usePagination`。
- stores：`uiStore`、`userStore`。
- services：`FormValidationService`、`PermissionService`、`TaskService`、`WorkOrderService`。
- api/utils：`BaseAPI`、`date`。

仍缺：

- `LineItemsTable.spec.ts`
- `useExportJob.spec.ts`
- router 守卫/模块路由测试。
- 领域组件测试：任务拆分、任务看板、工单详情、发货/质检。
- coverage 脚本。

### 4.4 样式治理进入后半段

视图层样式残留已经很少，但 `global.scss` 仍有历史页面选择器和布局组：

- `.card-container`
- `.page-container`
- `.work-order-list`
- `.customer-list`
- `.payment-container`
- `.cost-container`
- `.statement-container`
- `.button-group`
- `.filter-group`
- `.action-group`

这些应逐步转为组件布局、utility class 或 token，而不是长期作为全局页面约定存在。

### 4.5 路由拆分还未完成治理闭环

当前路由拆分已经开始，但仍缺：

- route meta 类型约束。
- title 解析独立模块。
- 路由守卫测试。
- 模块路由导出一致性检查。
- 是否需要导航加载状态 / route prefetch 的最终决策。

## 5. 下一步推进计划

### Phase 1：领域组件目录真实迁移

目标：让 `components/workorder`、`components/task`、`components/inventory` 不再是空目录，逐步承载稳定业务 UI。

优先迁移：

- `src/views/workorder/components/WorkOrderBasicInfo.vue`
- `src/views/workorder/components/WorkOrderHeaderActions.vue`
- `src/views/workorder/components/WorkOrderProducts.vue`
- `src/views/workorder/components/WorkOrderMaterials.vue`
- `src/views/workorder/components/WorkOrderProcessTasks.vue`
- `src/views/task/components/TaskCard.vue`
- `src/views/task/components/TaskActions.vue`
- `src/views/task/components/TaskFilters.vue`
- `src/views/inventory/components/DeliveryStats.vue`
- `src/views/inventory/components/DeliveryFilters.vue`

执行原则：

- 先迁“稳定展示/操作组件”，暂缓强耦合弹窗。
- 迁移时只改 import 路径和导出边界，不做行为重写。
- 每迁一个领域目录，补 `index.ts` 明确导出。
- 保持 props down / emits up，不让领域组件直接读取路由状态。

验收：

- `components/workorder`、`components/task`、`components/inventory` 至少各有真实组件导出。
- 对应 view 仍只负责编排和数据连接。
- `npm run type-check`、`npm run lint:check -- --quiet`、`npm run build` 通过。

### Phase 2：补齐关键测试

目标：对齐 sub2api 的测试治理方式，从“通用组件冒烟”提升到“关键行为防回归”。

优先新增：

- `tests/unit/components/LineItemsTable.spec.ts`
- `tests/unit/composables/useExportJob.spec.ts`
- `tests/unit/router/routerGuards.spec.ts`
- `tests/unit/router/routeModules.spec.ts`
- `tests/unit/components/DataTable.spec.ts` 补充移动卡片、rowClass、排序、空态分支。

建议新增脚本：

```json
"test:coverage": "vitest run --coverage"
```

执行顺序：

1. 先补 `LineItemsTable` 和 `useExportJob`。
2. 再补 router 守卫和模块路由。
3. 最后补领域组件迁移后的组件测试。

验收：

- 新增测试可以独立运行。
- `npm run test:run` 通过。
- coverage 脚本可执行，是否设置阈值另行决定。

### Phase 3：业务 composable 沉淀

目标：把生产域复杂行为从视图和大组件中抽出。

优先抽取：

- `useLineItems`：明细默认行、增删、金额/数量计算、空态判断。
- `useTaskBoard`：任务列、拖拽分派、批量操作、看板刷新。
- `useWorkOrderFlow`：工单流程节点、审批、同步提示、状态流转。
- `usePageFilters`：复杂筛选状态、重置、持久化或 query 同步。

当前已有 `useExportJob`，下一步应：

- 给它补测试。
- 找到实际导出记录页面接入点，避免成为孤立工具。
- 如果接口返回结构在不同模块差异较大，用 options 规范适配层，不把业务字段写死。

验收：

- route/view 中 handler 数量下降。
- 复杂页面的 computed/watch 分支减少。
- composable 返回只读状态或明确 actions，避免外部任意修改内部状态。

### Phase 4：样式资产治理

目标：保留当前 token/scss 成果，同时向 sub2api 的集中 `@layer` + utility 方法靠拢。

优先处理：

- 审计 `src/assets/styles/global.scss` 中历史页面选择器是否仍被引用。
- 将 `.work-order-list`、`.payment-container`、`.cost-container`、`.statement-container` 等页面 class 迁到布局组件或页面 utility。
- 清理视图层剩余 `<style>`：
  - `DashboardMobile.vue`
  - `AuditLogList.vue`
  - `WorkOrderForm.vue`
  - `WorkOrderPrint.vue` 保留但隔离为打印样式。
- 清理视图层剩余 `style=`：
  - `SupervisorDashboard.vue`
  - `TaskColumn.vue`
  - `TaskDragDropList.vue`
  - `WorkOrderList.vue`
  - `ProcessManagement.vue`
  - `SyncTaskPrompt.vue`

保留原则：

- 虚拟滚动高度、canvas/可视化尺寸、打印布局可以保留样式，但要封装或注释用途。
- 普通间距、颜色、列宽优先使用 utility、token、组件 props 或列配置。

### Phase 5：路由治理闭环

目标：把当前“已拆模块”推进到“可测试、可维护、meta 规范”的状态。

任务：

- 增加 route meta 类型定义：`title`、`requiresAuth`、`requiresAdmin`、`requiresPermission`、`breadcrumb`、`description`。
- 抽出 `resolveDocumentTitle` 到 `src/router/title.ts`。
- 为 `checkAuthentication` 或守卫逻辑提供可测试边界。
- 给 `src/router/modules/*` 补模块路由测试，确保 path/name/permission 不回退。
- 评估是否需要引入 `useNavigationLoading` 到 router 守卫中。

验收：

- `router/index.ts` 只保留 router 创建、顶层组合和守卫装配。
- 路由模块新增/修改有测试保护。

### Phase 6：common 组件去重和分层

目标：避免迁移期产生的 common 组件长期重复。

需要审查：

- `CrudPageLayout` vs `TablePageLayout`
- `CrudTableActions` vs `RowActions`
- `FilterBar` / `SearchBar` vs `FilterRow` / `SearchInput`
- `StatusBadge` vs `StatusTag`
- `StatCard` vs `StatsCards`

处理策略：

- 有真实差异和调用场景：保留并写清楚职责。
- 只是迁移遗留别名：逐步替换后删除。
- 保留组件必须有 README 或注释说明使用场景。

## 6. 不建议照搬 sub2api 的内容

- 不建议直接引入 sub2api 的 `account`、`payment`、`channels`、`user` 业务目录名；当前项目应使用工单、任务、库存、采购、销售等领域。
- 不建议为了对齐而引入完整 i18n；当前项目是中文生产系统，除非有明确多语言需求。
- 不建议强行清零所有 `<style>`；复杂可视化、虚拟滚动、打印样式可以保留。
- 不建议继续以 table 命中数量作为主要指标；现在需要看职责是否合理。

## 7. 推荐执行顺序

1. 补 `LineItemsTable.spec.ts` 和 `useExportJob.spec.ts`，让新增抽象先有测试。
2. 将 `WorkOrderBasicInfo`、`WorkOrderProducts`、`TaskCard`、`DeliveryStats` 等稳定组件迁入领域目录。
3. 给路由模块补测试，并抽 `title.ts` / meta 类型。
4. 审计并清理 `global.scss` 历史页面选择器。
5. 抽 `useLineItems`、`useTaskBoard`、`useWorkOrderFlow`。
6. 做 common 组件去重审查。

## 8. 每轮验证

每一轮代码改动至少执行：

```bash
npm run type-check
npm run lint:check -- --quiet
npm run test:run
npm run build
```

每轮文档更新至少同步：

- 当前扫描计数。
- 新迁移的领域组件和导出。
- 新增或变更的 composable。
- 新增测试。
- 保留 `<style>` / `style=` / 原生 table 的理由。
