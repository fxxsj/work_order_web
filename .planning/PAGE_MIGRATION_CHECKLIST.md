# 页面迁移完成清单

> 最后更新：2026-05-24
> 跟踪 Vue 3 + Teal Glass 迁移进度

## 迁移状态说明

| 状态 | 含义 |
|------|------|
| ✅ 完成 | 全部验收通过（type-check + build + test） |
| ⚠️ 跳过 | 确认无需迁移或延后处理 |
| 🔄 待处理 | 尚未开始 |

## 复杂业务页面（Phase 3）

| 页面 | 状态 | 备注 |
|------|------|------|
| PurchaseList.vue | ✅ 完成 | ConfirmDialog loading 已收敛 |
| Delivery.vue | ✅ 完成 | ConfirmDialog loading 已收敛 |
| Quality.vue | ✅ 完成 | 删除操作 loading |
| SalesList.vue | ✅ 完成 | 转换/批量转换 loading |
| WorkOrderList.vue | ✅ 完成 | 删除操作 loading，结构良好 |
| TaskList.vue | ✅ 完成 | 批量操作 loading，结构良好 |
| EmbossingPlateList.vue | ✅ 完成 | 删除/确认 loading |
| FoilingPlateList.vue | ✅ 完成 | 删除/确认 loading |
| Invoice.vue | ✅ 完成 | 提交操作 loading |
| Cost.vue | ✅ 完成 | 计算操作 loading |
| Payment.vue | ✅ 完成 | 删除操作 loading |
| Stock.vue | ⚠️ 跳过 | 无危险 ConfirmDialog |
| Statement.vue | ⚠️ 跳过 | handleConfirm 为空 stub |
| ArtworkList.vue | ✅ 完成 | 结构良好，已确认 |

## 简单/中等 CRUD 页面（Phase 2）

| 页面 | 状态 | 备注 |
|------|------|------|
| DieList.vue | ✅ 完成 | |
| MaterialList.vue | ✅ 完成 | |
| ProductGroupList.vue | ✅ 完成 | |
| DepartmentList.vue | ✅ 完成 | |

## 待评估页面

| 页面 | 状态 | 备注 |
|------|------|------|
| 原生 table 组件 | 🔄 待处理 | 详见 PAGE_LAYOUT_MIGRATION_SCAN.md |
| FormDialog 业务组件 | 🔄 待处理 | 后续随模块迁移评估 |

## 质量门禁

```bash
npm run type-check && npm run build && npm run test:unit -- --run
```

## 验收标准

- [x] 外层使用 `TablePageLayout` 四插槽
- [x] 主列表使用 `DataTable`，列通过 `columns` 定义
- [x] 分页统一放入 `#pagination`
- [x] 删除/确认/审批类操作使用 `ConfirmDialog`
- [x] 新增/编辑弹窗状态使用显式布尔值
- [x] 表单提交有 `submitting`，按钮 disabled 与 loading 文案一致
- [x] 危险操作 ConfirmDialog 配置 `loading` + `loadingText`