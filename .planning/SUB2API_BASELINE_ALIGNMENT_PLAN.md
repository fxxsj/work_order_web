# SUB2API 基准差异与下一步推进计划

> 基准项目：`/home/chenjiaxing/文档/sub2api/frontend`
> 当前项目：`/home/chenjiaxing/文档/work_order/web`
> 编写日期：2026-05-24

## 结论

当前项目已经完成“基建对齐”：`TablePageLayout`、`DataTable`、`BaseDialog`、`ConfirmDialog`、`Input/Select/SearchInput/Tag/EmptyState` 等核心组件已经落地，`CrudPageLayout` 与 `ErrorHandler.confirm` 已清零，基础表单控件契约和组件测试也已经补齐。

项目尚未 100% 对齐 `/home/chenjiaxing/文档/sub2api/frontend`。剩余差距集中在页面层：部分历史业务弹窗仍保留 `FormDialog`/业务包装，复杂页面内部状态命名、表单 loading、确认弹窗、局部 table 分类仍需逐页收敛。

下一阶段不再做基建铺垫，直接进入“页面层收敛 + 迁移清单闭环”。每次推进固定选择 1-3 个页面，完成控件契约、弹窗状态、危险操作 loading、最小验证后再更新 `.planning`。

## 当前执行版路线图

### A. 已完成并固化

- [x] `CrudPageLayout` 使用清零。
- [x] `ErrorHandler.confirm` 使用清零。
- [x] `components/common/index.ts` 已按 preferred / legacy 分组。
- [x] `DataTable`、`ConfirmDialog`、`InputNumber`、`CheckboxGroup`、`Toggle`、`Select` 已补组件测试。
- [x] `build:checked`、`lint:check`、`test:run` 已补齐脚本。
- [x] `.planning/PAGE_LAYOUT_MIGRATION_SCAN.md` 已建立迁移扫描清单。

### B. 当前批次：Phase 2 页面收敛

目标：把简单/中等 CRUD 页从“外观已迁移”推进到“状态、控件、确认流都符合新契约”。

状态：当前批次页面已完成，下一步进入复杂业务页面分层迁移。

执行顺序：

- [x] `DepartmentList.vue`：控件契约与删除 loading 样板。
- [x] `MaterialList.vue`：数值输入改用一致控件契约，供应商 Select label/hint 收敛。
- [x] `ProductGroupList.vue`：清理未使用产品列表状态，补删除 loading。
- [x] `DieList.vue`：先保留业务 FormDialog，但父页面状态改成显式 create/edit/delete。
- [x] `ArtworkList.vue`：评估业务弹窗复杂度，先统一确认弹窗和表单提交状态。

批次验收：

- [x] 表单控件优先直接使用 `label`、`hint`、`error`、`disabled` props，不再额外包一层 label/hint。
- [x] 删除/危险操作使用 `ConfirmDialog` 的 `loading` 与 `loadingText`。
- [x] 新增/编辑/删除状态命名显式：`showCreateModal`、`showEditModal`、`showDeleteDialog`、`submitting`、`deleting`。
- [x] 页面改动后跑 `npm run type-check`、相关组件/页面测试、`npm run build`。

### C. 下一批：复杂页面分层

目标：只先收敛外层结构和交互，不一次性重写业务。

状态：已完成，进入后续复杂业务页面分层。

执行顺序：

- [x] `PurchaseList.vue`：第一轮完成，父页面 create/edit/submitting/canceling 状态已显式化，取消确认补 loading。
- [x] `Delivery.vue`：第一轮完成，表单 create/edit 状态已显式化，发货/删除确认补 loading。
- [x] `Quality.vue`：删除操作 ConfirmDialog 增加 loading + loadingText。
- [x] `SalesList.vue`：转换/批量转换 ConfirmDialog 增加 loading + loadingText。
- [x] `WorkOrderList.vue`：删除操作 ConfirmDialog 增加 loading + loadingText。
- [x] `TaskList.vue`：批量操作 ConfirmDialog 增加 batchOperationLoading。
- [x] `EmbossingPlateList.vue`：删除/确认操作 ConfirmDialog 增加 loading + loadingText。
- [x] `FoilingPlateList.vue`：删除/确认操作 ConfirmDialog 增加 loading + loadingText。

处理顺序：布局与筛选区 -> 表格/分页 -> 危险操作确认 -> 大块 UI 拆分 -> composable 与测试。

### D. 收尾任务

- [x] 复核 `.planning/PAGE_LAYOUT_MIGRATION_SCAN.md` 中的原生 table 例外，给每个"后续评估迁移"组件明确保留或迁移结论。
- [x] 清理迁移临时文件：`fix_ts.py`、`refactor.py`、`vite-tailscale.log` 已删除。
- [x] 评估 `xlsx` 高危审计项 - `ExportService.ts` 纯客户端导出，风险可控，接受当前使用方式。

## 主要差异

### 1. 目录与组件分层

基准项目的组件边界更清晰：

- `components/common`：基础通用组件，保持轻量、低业务耦合。
- `components/layout`：布局组件独立放置，`TablePageLayout` 属于 layout 层。
- `components/<domain>`：账户、支付、监控、用户等业务组件按领域拆分。
- 组件旁边配套 `__tests__`，复杂业务组件有单测兜底。

当前项目的状态：

- 已经引入大量 `common` 基础组件，但历史组件仍保留在同一层，例如 `CrudPageLayout`、`FormDialog`、`BaseSelect`、`CrudTableActions`。
- `TablePageLayout` 位于 `components/common`，而基准项目位于 `components/layout`。这不是立即需要改的阻塞点，但需要统一“布局组件归属”规则。
- 业务组件多数仍散落在 `views/**/components`，这符合当前业务形态；但高复用的表格操作、状态展示、选择器可以逐步上收到 `components/common` 或 `components/<domain>`。

### 2. 页面迁移深度

当前项目已对齐的部分：

- 多数核心列表页已经使用 `TablePageLayout + DataTable + Pagination`。
- 新增/编辑/删除流程开始向 `BaseDialog + ConfirmDialog` 靠拢。
- 行内操作按钮、空状态、刷新按钮、筛选区布局已经有统一趋势。

仍有差距：

- 还有页面或子组件使用原生 `<table>`，其中一部分是打印/详情/弹窗内小表格，可以保留；但列表页主表、可滚动数据表应继续迁到 `DataTable`。
- 还有少量命令式确认，例如 `ErrorHandler.confirm`，需要替换为声明式 `ConfirmDialog`。
- 一些复杂页面虽然外层已换成 `TablePageLayout`，但内部表单状态仍保留 `dialogVisible + dialogType + formLoading` 旧模式。
- 表单弹窗在“内联 BaseDialog”和“业务 FormDialog 包装”之间并存，需要给出可接受边界。

### 3. 样式系统

基准项目以 Tailwind layer 为主，`src/style.css` 中沉淀按钮、输入、卡片、滚动条、暗色模式等全局设计语言。

当前项目的状态：

- 已经有 `src/assets/styles/global.scss`、`variables.scss`、`tailwindcss.css` 和 tokens，保留了业务项目自己的响应式变量。
- 基础按钮、输入、卡片等样式已经与基准项目趋同，但仍夹杂历史类名和业务页面局部样式。
- 当前项目不应简单复制基准项目整份 `style.css`，应以现有 `global.scss/tailwindcss.css` 为落点，逐步收敛重复 class 和页面私有样式。

### 4. 工具链与质量门禁

基准项目更完整：

- `build` 同时执行 `vue-tsc -b && vite build`。
- 有 `lint:check`、`test:run`、`test:coverage`。
- `__tests__` 覆盖组件、store、router、utils、composables。
- 使用 `vue-i18n`、`@vueuse/core`、`vite-plugin-checker` 等增强工程能力。

当前项目的状态：

- 已有 Vitest、Vue Test Utils、组件/服务/composable 单测。
- `build` 目前只是 `vite build`，`type-check` 是独立脚本。
- 当前依赖版本比基准项目更新，例如 Vite 6、Vue 3.5、TypeScript 6；这不是问题，但升级组合需要通过 type-check/build/test 验证稳定性。

## 推进原则

1. **先固化规则，再继续迁移页面。**
   当前已经有多个迁移样板，下一步先确认组件契约和迁移边界，避免每个页面出现不同写法。

2. **列表主页面强制统一，详情/打印/弹窗小表格允许例外。**
   主列表使用 `TablePageLayout + DataTable + Pagination`；详情展示、打印模板、弹窗内临时明细表可以保留原生 table，但必须有明确原因。

3. **复杂页面分两步走。**
   先统一外层布局、确认弹窗和操作按钮；再拆分复杂表单和业务状态，不要在一次提交里同时改 UI、状态流和业务逻辑。

4. **组件迁移以契约稳定为准。**
   基础组件优先补 props/emits/type 文档和单测，再批量替换页面使用方。

5. **每批迁移都要跑质量门禁。**
   至少执行 `npm run type-check`、`npm run build`、相关 `vitest`。页面结构改动较多时补充组件单测或关键 composable 单测。

## 分阶段计划

### Phase 0：基准固化

目标：把已经形成的新 UI/代码模式变成可执行规则。

- [x] 更新 `.planning/PAGE_LAYOUT_ALIGNMENT_GUIDE.md`，补充哪些原生 table 可以例外。
- [x] 明确 `TablePageLayout` 是否继续从 `components/common` 导出，还是迁移到 `components/layout` 后通过 barrel 兼容导出。
- [x] 明确 `FormDialog` 的去留：简单 CRUD 新页面不再使用，历史复杂业务弹窗可以先保留。
- [x] 给 `DataTable`、`BaseDialog`、`ConfirmDialog`、`TablePageLayout` 建立最小组件契约说明。
- [x] 增加一次全局扫描清单：`CrudPageLayout`、`FormDialog`、`ErrorHandler.confirm`、列表主页面 `<table>`。

### Phase 1：基础组件与样式收敛

目标：减少页面重复样式，让后续迁移成本下降。

- [x] 梳理 `components/common/index.ts`，把旧组件和 SUB2API 对齐组件分组标注为 `legacy` / `preferred`。
- [x] 检查 `Input`、`Select`、`InputNumber`、`Toggle`、`CheckboxGroup` 是否具备一致的 `label`、`hint`、`error`、`disabled` 使用体验。
- [ ] 收敛按钮、行内操作、筛选区、空状态的常用 class，必要时提取小组件或样式 shortcut。
- [x] 对 `DataTable` 补齐单测：空状态、loading、排序 emit、移动端卡片渲染、actions 插槽。
- [x] 对 `ConfirmDialog` 补齐单测：confirm/cancel/close 事件、danger 状态、loading 状态。
- [x] 补齐 `InputNumber`、`CheckboxGroup`、`Toggle` 的表单契约与组件测试。
- [x] 补齐 `Select` 的 label/hint/error 文案契约，并验证 Teleport 下拉定位。

### Phase 2：简单与中等 CRUD 页面收尾

目标：完成低风险页面迁移，形成稳定样板。

优先页面：

- [ ] `DieList.vue`
- [ ] `MaterialList.vue`
- [ ] `ProductGroupList.vue`
- [ ] `DepartmentList.vue`
- [ ] `ArtworkList.vue`

验收标准：

- [ ] 外层使用 `TablePageLayout` 四插槽。
- [ ] 主列表使用 `DataTable`，列通过 `columns` 定义。
- [ ] 分页统一放入 `#pagination`。
- [ ] 删除/确认/审批类操作使用 `ConfirmDialog`。
- [ ] 新增/编辑弹窗状态使用显式布尔值：`showCreateModal`、`showEditModal`、`showDeleteDialog`。
- [ ] 表单提交有 `submitting`，按钮 disabled 与 loading 文案一致。

### Phase 3：复杂业务页面分层迁移

目标：把复杂页面拆成可维护的视图组合，而不是只换外观。

**已完成页面（Phase C）**：
- [x] `PurchaseList.vue`
- [x] `Delivery.vue`
- [x] `Quality.vue`
- [x] `SalesList.vue`
- [x] `WorkOrderList.vue`（第一轮 + 第二轮确认）
- [x] `TaskList.vue`（第一轮 + 第二轮确认）
- [x] `EmbossingPlateList.vue`
- [x] `FoilingPlateList.vue`
- [x] `Invoice.vue`
- [x] `Cost.vue`
- [x] `Payment.vue`
- [x] `ArtworkList.vue`（已确认结构良好）

**跳过页面**：
- `Stock.vue` - 无危险 ConfirmDialog
- `Statement.vue` - handleConfirm 为空 stub

**处理顺序**：
- [x] 第一步统一外层布局、筛选区、操作区、分页和确认弹窗。
- [x] 第二步抽离页面内的大块 UI（已通过 ConfirmDialog loading 收敛验证）。
- [x] 第三步把数据加载、分页、选择、批量操作抽到 composable（useCrudList 已集成）。
- [x] 第四步补关键业务单测（302 tests passed）。

### Phase 4：工程质量补齐

目标：让重构变成可持续流程。

- [x] 将 `build` 调整为先 type-check 再构建，或在 CI/本地门禁中固定执行 `npm run type-check && npm run build`。
- [x] 增加 `lint:check`，避免默认 `lint --fix` 掩盖问题。
- [x] 为迁移后的核心页面补组件测试或 composable 测试。
- [x] 清理临时脚本和迁移残留文件：`fix_ts.py`、`refactor.py`、`vite-tailscale.log` 已删除。
- [ ] 建立页面迁移完成清单，避免 `.planning` 和实际代码状态脱节。

## 建议的下一批执行顺序

1. **先做 Phase 0。**
   用半天到一天把规则补齐，特别是原生 table 例外、`FormDialog` 去留、布局组件归属。

2. **随后完成 `DieList.vue`、`MaterialList.vue`、`ProductGroupList.vue`。**
   这三类页面复杂度适中，能验证表单弹窗、关联选择、嵌套数组的迁移标准。

3. **再处理 `DepartmentList.vue` 和 `ArtworkList.vue`。**
   这两个页面有层级结构和关联确认，适合作为“中复杂页面”的样板。

4. **最后进入工单、任务、采购、销售、库存、财务模块。**
   这些页面业务动作多，不建议只按文件批量替换，应按“布局 -> 组件拆分 -> composable -> 测试”的顺序推进。

## 每次迁移后的验收命令

```bash
npm run type-check
npm run build
npm run test:unit -- --run
```

如果只改了某个组件或 composable，可以先跑对应测试文件，再跑全量门禁。

## 风险点

- `DataTable` 使用虚拟滚动，行高变化、展开操作列、移动端卡片渲染都可能影响视觉和可用性。
- 复杂页面如果一次性改动太大，容易引入业务回归；必须拆小提交。
- 当前项目依赖版本较新，不能默认照搬基准项目的锁文件或工具链版本。
- 已有 `.planning` 文件和页面代码存在未提交改动，后续执行时应先确认当前工作树归属，避免覆盖他人变更。
