# 前端复用规范

## 列表页

分页列表页优先使用 `useCrudList`，适用于通过 `getList(params)` 拉取行数据的页面。

- 简单筛选条件放在 `initialFilters`。
- `searchText` 只用于主全文搜索字段。
- UI 字段和 API 参数不一致时使用 `buildParams`，例如把 `date_range` 转成 `start_date` 和 `end_date`。
- 导出参数应从 `filters.value` 派生，确保导出数据和当前可见筛选状态一致。
- 页面专属的辅助数据，例如统计卡片数据、下拉选项列表，应放在 `useCrudList` 外部维护。

## 状态标签

状态、优先级、类型、动作等映射可复用时，优先使用 `StatusTag`。

- 共享映射添加到 `src/constants/statusMeta.js`。
- 后端已返回展示文案时，通过 `label` 传入。
- 除非标签逻辑确实是页面专属，否则不要在页面内重复写 `getStatusType`、`getPriorityType` 这类 helper。

## 统计卡片

摘要指标优先使用 `StatsCards`，不要在页面里重复拼行列、图标、颜色和值格式化标记。

- 传入稳定的 `items` 数组，包含 `key`、`label`、`value`、`format`、`icon` 和语义化 `tone`。
- 当卡片需要在数值旁显示彩色图标块时，使用 `layout="media"`。
- 使用 `span` 控制桌面列宽，并保留组件内置的 `xs=24` / `sm=12` 响应式行为。
- 优先使用全局 token，例如 `--ui-stat-icon-size`、`--ui-filter-control-width`，避免在页面里硬编码尺寸。

## 二次确认操作

调用 `ErrorHandler.confirm` 后必须检查返回值，确认后才能执行动作。

```js
const confirmed = await ErrorHandler.confirm('确定执行该操作？')
if (!confirmed) return
await api.doAction(id)
```

紧凑写法可以使用 `ErrorHandler.withConfirm`，但不能忽略用户取消的路径。

## 可快速新建的选择器

客户、供应商、产品、物料等主数据下拉，如果需要“搜索或新建”能力，必须使用领域选择器组件，不要在业务表单里直接拼裸 `Select`。

当前共享组件位置：

- 客户：`src/views/customer/components/CustomerSelector.vue`
- 客户快速新建：`src/views/customer/components/QuickCustomerCreateDialog.vue`
- 供应商：`src/views/supplier/components/SupplierSelector.vue`
- 供应商快速新建：`src/views/purchase/components/QuickSupplierCreateDialog.vue`
- 产品：`src/views/product/components/ProductSelector.vue`
- 产品快速新建：`src/views/product/components/QuickProductCreateDialog.vue`
- 物料：`src/views/material/components/MaterialSelector.vue`
- 物料快速新建：`src/views/material/components/QuickMaterialCreateDialog.vue`

领域选择器职责：

- 统一包装通用 `Select`，并配置 `remote`、`remoteMethod`、`loading`、`clearable`、`creatable`。
- 内部负责选项加载、远程搜索防抖、空查询短缓存，以及编辑回显时通过 `getDetail(id)` 兜底加载。
- 对父组件只暴露 `update:modelValue` 和 `create` 事件；选择器本身不打开弹窗。
- 必要时暴露很小的追加方法，例如 `appendCustomer`、`appendProduct`、`appendMaterial`，用于把刚创建的记录加入本地选项。

父级表单职责：

- 维护快速新建弹窗的显示状态。
- 维护行级上下文，例如明细表第几行触发了新建。
- 监听 `created` 事件，把新记录加入当前页面列表，并按业务需要回填到当前字段。
- 处理创建后带出的业务字段，例如客户联系人、产品单价、物料单价。

示例：

```vue
<MaterialSelector
  :model-value="row.material"
  :materials="materials"
  @update:model-value="value => handleMaterialChange(index, value)"
  @create="openQuickMaterialCreate(index)"
/>

<QuickMaterialCreateDialog
  v-model:visible="showQuickMaterialCreate"
  @created="handleMaterialCreated"
/>
```

父级记录触发行，并在创建后回填：

```ts
const showQuickMaterialCreate = ref(false)
const pendingMaterialCreateIndex = ref<number | null>(null)

const openQuickMaterialCreate = (index: number | null = null) => {
  pendingMaterialCreateIndex.value = typeof index === 'number' ? index : null
  showQuickMaterialCreate.value = true
}

const handleMaterialCreated = (material: any) => {
  materialList.value.push(material)
  if (pendingMaterialCreateIndex.value !== null && form.materials[pendingMaterialCreateIndex.value]) {
    form.materials[pendingMaterialCreateIndex.value].material = material.id
  }
  pendingMaterialCreateIndex.value = null
}
```

快速新建弹窗契约：

- 标准使用 `visible/update:visible`。
- 同时支持 `modelValue/update:modelValue` 和 `visible/update:visible`，方便不同父组件接入。
- 创建成功后只 emit `created`，由父组件决定是否回填、追加列表、刷新数据。

```ts
const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'created'])

const dialogVisible = computed({
  get: () => props.modelValue ?? props.visible,
  set: (value) => {
    emit('update:modelValue', value)
    emit('update:visible', value)
  }
})
```

适用范围：

- 业务录入表单里选择客户、供应商、产品、物料时，应使用领域选择器。
- 明细表行内选择产品或物料时，也应使用领域选择器，并传递触发行索引。
- 筛选器下拉不应提供快速新建，筛选场景只负责查询已有数据。
- 受业务约束的下拉不应随意快速新建，例如发货单中由客户订单或库存约束的产品选择。
- 自由输入枚举可以保留裸 `Select` 的 `creatable`，例如物流公司名称；这类不是主数据弹窗创建场景。

禁止做法：

- 不要把裸 `Select` 加上 `creatable` 就当成完整功能。
- 不要在多个业务页面重复实现远程搜索、缓存、回显和弹窗逻辑。
- 不要把共享主数据选择器放在某个业务域目录里供其他业务域引用；应放在主数据所属域下。

原因：

裸 `Select` 只能提供 UI 层面的“可创建入口”，无法保证远程搜索、缓存、编辑回显、创建后追加选项、创建后回填当前行等行为一致。主数据下拉必须通过领域选择器收敛，否则后续新增页面会再次出现能力不一致和维护成本上升的问题。
