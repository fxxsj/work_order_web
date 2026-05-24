# 表单基础组件契约审计

> 审计日期：2026-05-24
> 范围：`Input`、`Select`、`InputNumber`、`Toggle`、`CheckboxGroup`

## 结论

基础表单控件已经具备新 CRUD 表单需要的 `label`、`hint`、`error`、`disabled` 契约。`Select` 的 Teleport 下拉定位已通过组件测试覆盖，后续页面迁移可以直接使用控件内置 label/hint/error。

## 能力矩阵

| 组件 | label | hint | error | disabled | 备注 |
|------|-------|------|-------|----------|------|
| `Input` | ✅ | ✅ | ✅ 文案 | ✅ | 已符合 preferred 表单契约 |
| `Select` | ✅ | ✅ | ✅ 文案/boolean 兼容 | ✅ | 已补齐表单契约，Teleport 下拉定位有测试覆盖 |
| `InputNumber` | ✅ | ✅ | ✅ 文案 | ✅ | 已补齐表单契约 |
| `Toggle` | ✅ | ✅ | ✅ 文案 | ✅ | 已补齐 disabled、change、aria label |
| `CheckboxGroup` | ✅ | ✅ | ✅ 文案 | ✅ | 已补齐 group disabled 透传 |

## 页面迁移当前写法

复杂控件已经支持内置 label/hint/error。新页面优先直接使用控件契约：

```vue
<div>
  <Select
    v-model="form.department"
    :options="departmentOptions"
    label="上级部门"
    hint="选择上级部门可建立层级"
  />
</div>
```

## 后续组件补齐顺序

1. ✅ `InputNumber`：增加 `label`、`hint`、`error`，保持内部按钮布局不变。
2. ✅ `CheckboxGroup`：增加 `label`、`hint`、`error`，并让 group-level `disabled` 传递到子项。
3. ✅ `Toggle`：增加 `disabled`、`label`、`hint`，保留纯 switch 使用方式。
4. ✅ `Select`：增加外层 label/hint/error 文案，并验证 Teleport 下拉定位不受外层 DOM 影响。

## 验收标准

- 控件支持单列垂直表单布局。
- `error` 为字符串时展示错误文案；无 error 且有 hint 时展示 hint。
- `disabled` 状态视觉与交互一致。
- 不破坏现有 `v-model`、`change`、`blur`、`focus` 事件。
- 每个补齐组件至少新增基础渲染和 disabled/error 测试。
