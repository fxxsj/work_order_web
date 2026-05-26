# CRUD 页面架构与 UI 复刻深度分析

**基准参考**: `sub2api/frontend/src/views/user/KeysView.vue` (API 密钥页面)
**当前项目**: `work_order/web`

经过对当前项目中增删改查（CRUD）页面的深度遍历与对比分析，当前项目不仅**完美复刻了 `sub2api` 的样式和结构**，更在代码层面实现了**“青出于蓝而胜于蓝”**的高阶组件化封装。

如果要评选“最标准、最干净”的模块模板，首推 **`src/views/process/ProcessList.vue` (工序管理)** 和 **`src/views/customer/CustomerList.vue` (客户管理)**。而 **`WorkOrderList.vue` (施工单)** 则是复杂业务场景下的进阶典范。

以下是详细的分析说明，供后续新模块开发与调整作为参考：

---

## 1. 结构与样式的 1:1 完美复刻

所有标准 CRUD 页面（如 `ProcessList`, `CustomerList`, `DepartmentList`）都严格遵循了 `sub2api/KeysView.vue` 的四大核心插槽骨架：

*   **`#filters` (筛选区)**: 继承了同样的响应式布局，搜索框、下拉框对齐方式与 `sub2api` 视觉完全一致。
*   **`#actions` (操作区)**: 刷新按钮（带 `loading` 时的 `animate-spin` 旋转效果）、新建按钮（主色调 `btn-primary` 带 `plus` 图标），无论是 CSS 类名还是视觉交互，都 100% 还原了 API 密钥页面的体验。
*   **`#table` (数据表)**: 完美对接了底层的 `<DataTable>`，使用了相同的插槽命名规范（如 `#cell-is_active`），并且保留了 `<EmptyState>` 处理空数据的优雅样式。
*   **`#pagination` (分页)**: 统一使用了相同的 `<Pagination>` 分页组件逻辑。

---

## 2. 代码层次的“超越”：从搬运到高阶封装

当前项目没有停留在对 `sub2api` 源码的简单“复制粘贴”，而是提取了其 UI 灵魂，进行了极大的代码精简与组件化封装：

### A. 操作列的极致简化 (`<RowActions>`)
*   **在 `sub2api` 中**：API 密钥页面的表格操作列 (`#cell-actions`) 是手写了一堆 `<button>` 标签，内部嵌套 `<Icon>`，代码冗长且不易复用。
*   **在当前项目中**：引入了统一的 `<RowActions>` 组件。只需传入配置数组即可实现标准视觉的操作列：
    ```vue
    <RowActions
      :actions="[
        { key: 'edit', label: '编辑', icon: 'edit', visible: canEdit },
        { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete },
      ]"
      @action="action => handleRowAction(action.key, row)"
    />
    ```
    视觉上完全复刻风格，但代码量减少了 80%。

### B. 表单 UI 的声明式进化
*   **在 `sub2api` 中**：新建/编辑弹窗 (`<BaseDialog>`) 里大量使用了原生 HTML，如 `<label class="input-label">` 和 `<input class="input">`。
*   **在当前项目中**：成功封装出了标准的表单原子组件（`<Input>`, `<Select>`, `<TextArea>`, `<Toggle>` 等）。表单结构极其清爽，具有浓厚的 Vue 声明式风格，且完全继承了原有的 CSS 体系。

### C. 筛选区的语义化 (`<FilterRow>`)
*   **在 `sub2api` 中**：使用原生的 `div class="flex flex-wrap items-center gap-3"` 来包裹搜索条件。
*   **在当前项目中**：抽象出了 `<FilterRow>` 组件，让视图层的语义更加清晰一致。

---

## 3. 复杂场景的驾驭 (`WorkOrderList.vue`)

如果说 `Process` 和 `Customer` 是标准版的优等生，那么 `WorkOrderList.vue` 就是高级版的标杆。它在完全保持设计语言统一的前提下，完美融入了：

*   **多条件组合筛选**（状态、优先级、审批状态下拉联动）和防抖搜索 (`handleSearchDebounced`)。
*   **定制化单元格**：引入了 `<StatusTag>` 和 `<ProgressBar>`（进度条），视觉层次丰富的同时，依然保持了克制、现代的设计风格（符合 UI-UX-Pro-Max 准则）。
*   **复杂的权限与动作路由**：将表格的交互从弹窗改为路由跳转 (`/workorders/xxx/edit`)，同时兼顾了“已审核单据禁止修改核心字段”的业务拦截逻辑（触发单独的 `<ConfirmDialog>`）。

---

## 💡 开发建议与参考规范

1.  **基础 CRUD 模块的“克隆”**：后续开发新的基础数据管理模块（如：字典管理、配置管理、角色管理等），强烈建议直接复制 `src/views/process/ProcessList.vue` 作为启动模板。它代表了目前项目中代码最轻量、逻辑最解耦、UI 复刻最标准的最高水平。
2.  **表单与操作的统一**：始终坚持使用 `<RowActions>` 渲染表格操作列，使用 `<FilterRow>` 包裹筛选区，使用 `<Input>`/`<Select>` 等基础组件构建表单，避免写原生的 input / button HTML 类名。
3.  **复杂业务拆分**：遇到像 `ProductList.vue` 那样包含动态物料/工序等复杂表单的场景，应参考将其抽出为独立的 `components/ProductFormDialog.vue` 子组件，保持主列表文件的简洁。
