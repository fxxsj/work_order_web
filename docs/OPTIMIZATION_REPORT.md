# 组件对齐优化报告

> 基于与 sub2api/frontend 最佳实践的对比分析

**创建日期:** 2026-05-23
**更新日期:** 2026-06-01
**状态:** ✅ 第五轮技术债清理完成
**版本:** v5.0

---

## 一、优化目标

将 work_order_web 组件系统与 sub2api/frontend 最佳实践激进对齐，消除所有不一致和死代码。

---

## 二、修复清单

### P0-1: FormDialog API 修复 ✅

**问题:** FormDialog 使用 `v-model` 传给 BaseDialog，但 BaseDialog 期望 `:show` prop

**文件:** `src/components/common/FormDialog.vue`

---

### P0-2: SearchBar 死代码清理 ✅

**问题:** SearchBar 组件从未被任何文件导入使用

**文件:** `src/components/common/index.ts` - 已移除导出

---

### P0-3: ElMessageBox 迁移到 ConfirmDialog ✅

**迁移文件:**
- `src/components/layout/AppHeader.vue` - 退出登录确认
- `src/views/workorder/WorkOrderList.vue` - 编辑已审核施工单确认
- `src/views/die/components/DieFormDialog.vue` - 切换刀模类型确认

---

### P0-4: StatusBadge 迁移到 StatusTag ✅

**增强 StatusTag:** 新增 `variant` prop 支持直接指定颜色类型

**迁移文件:**
- `src/views/workorder/components/MaterialStatusDialog.vue`
- `src/views/task/components/CompleteTaskDialog.vue`

**移除导出:**
- `src/components/common/index.ts` - StatusBadge 已移除

---

## 三、组件状态最终清单

### 核心表单组件 ✅

| 组件 | 状态 |
|------|------|
| Input | ✅ |
| Select | ✅ |
| TextArea | ✅ |
| Toggle | ✅ |
| SearchInput | ✅ |
| InputNumber | ✅ |

### 对话框组件 ✅

| 组件 | 状态 |
|------|------|
| BaseDialog | ✅ |
| ConfirmDialog | ✅ 已启用（从 ElMessageBox 迁移） |
| FormDialog | ✅ 已修复 |

### 展示组件 ✅

| 组件 | 状态 |
|------|------|
| DataTable | ✅ |
| Pagination | ✅ |
| EmptyState | ✅ |
| LoadingSpinner | ✅ |
| StatCard | ✅ |
| StatusTag | ✅ 已增强（支持 variant prop） |

### 骨架屏组件 ✅

| 组件 | 状态 |
|------|------|
| Skeleton | ✅ |
| SkeletonLoader | ✅ 预设模式 |

### 已清理 ⚠️

| 组件 | 状态 |
|------|------|
| SearchBar | ⚠️ 已移除导出 |
| StatusBadge | ⚠️ 已移除导出，已迁移到 StatusTag |
| userRole.ts | ⚠️ 已删除 Vuex 兼容层，Dashboard 直接使用 Pinia userStore |
| StatsCards labelIcon 映射 | ⚠️ 已删除旧 Element Plus 图标映射 |
| 任务 due_date fallback | ⚠️ 已删除，任务统一使用 deadline |

---

## 四、确认对话框使用规范

### 标准模式
```vue
<ConfirmDialog
  :show="isOpen"
  title="确认操作"
  message="确定要执行此操作吗？"
  confirm-text="确定"
  cancel-text="取消"
  @confirm="handleConfirm"
  @cancel="handleCancel"
/>
```

### 危险操作模式
```vue
<ConfirmDialog
  :show="isOpen"
  title="删除确认"
  message="确定要删除吗？此操作不可撤销。"
  confirm-text="删除"
  :danger="true"
  @confirm="handleDelete"
  @cancel="handleCancel"
/>
```

---

## 五、StatusTag variant 使用

```vue
<!-- 成功状态 -->
<StatusTag label="已完成" variant="success" />

<!-- 警告状态 -->
<StatusTag label="待处理" variant="warning" />

<!-- 危险状态 -->
<StatusTag label="已拒绝" variant="danger" />

<!-- 信息状态 -->
<StatusTag label="进行中" variant="info" />
```

---

## 六、构建验证

```
✓ built in 8.56s
```

---

## 七、变更摘要

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-05-23 | v1.0 | 初始文档 |
| 2026-05-23 | v2.0 | FormDialog 修复、SearchBar 清理 |
| 2026-05-23 | v3.0 | ElMessageBox → ConfirmDialog 迁移 |
| 2026-05-23 | v4.0 | StatusBadge → StatusTag 迁移，StatusTag 增强 |
| 2026-06-01 | v5.0 | 删除 Vuex 角色兼容层、任务 due_date fallback、StatsCards 旧图标映射，并迁移对账单字段到正式 API |
