# 施工单完整生命周期状态流转

施工单有 **两个独立的状态维度**：**审批状态** (`approval_status`) 和 **生产状态** (`status`)。

---

## 一、审批状态流转 (`approval_status`)

### 所有状态值

| 值 | 中文 | 说明 |
|---|---|---|
| `draft` | 草稿 | 新建后的初始状态 |
| `submitted` (前端也用 `pending`) | 待审核/已提交 | 已提交等待业务员审核 |
| `approved` | 已审核 | 业务员审核通过 |
| `rejected` | 已拒绝 | 业务员审核拒绝 |

### 状态流转图

```
  draft ──提交审核──> submitted ──通过审核──> approved
                      ↑   ↑                     │
                      │   └── 拒绝审核 ──> rejected
                      │                          │
                      └──── 重新提交 ─────────────┘
```

后端转换规则（`APPROVAL_STATUS_TRANSITIONS`）：
- `draft` → 只能到 `submitted`
- `submitted` → 可到 `approved` 或 `rejected`
- `rejected` → 只能到 `submitted`
- `approved` → 可到 `submitted`（重新审核）

### 每个流转的触发方式

| 流转 | 触发页面 | UI 操作 | API 调用 | 权限 |
|---|---|---|---|---|
| `draft → submitted` | **新建页** `WorkOrderForm.vue` | 点击"存为草稿"后弹窗选"立即提交"，或点击"直接发布"（auto_approve=true 自动跳过） | `workOrderAPI.submitApproval(id, {})` 或 `workOrderFlowAPI.submitApproval(id, {auto_approve:true})` | 创建者 |
| `submitted → approved` | **详情页** `WorkOrderDetail.vue` 中 `WorkOrderApproval.vue` 组件 | 点击"通过审核"按钮 | `workOrderAPI.approve(id, {status:'approved', comment})` | `workorder.approve_workorder` + 业务员必须是该客户的负责人 |
| `submitted → rejected` | **详情页** 同上 | 点击"拒绝审核"（需两步，第二步必须填写拒绝原因） | `workOrderAPI.reject(id, {status:'rejected', comment, rejection_reason})` | 同上 |
| `rejected → submitted` | **详情页** 同上 | 填写修改说明后点击"提交审核" | `workOrderAPI.resubmit(id)` | 创建者/管理员 |

**审核操作不在列表页**，只能在施工单详情页完成。

---

## 二、生产状态流转 (`status`)

### 所有状态值

| 值 | 中文 | 说明 |
|---|---|---|
| `pending` | 待开始 | 初始生产状态 |
| `in_progress` | 进行中 | 审核通过后自动进入 |
| `paused` | 已暂停 | 手动暂停 |
| `completed` | 已完成 | 所有工序完成后自动进入 |
| `cancelled` | 已取消 | 手动取消 |

### 状态流转图

```
  pending ──(审核通过自动触发)──> in_progress ──(所有工序完成自动触发)──> completed
                ↑       │
                │       ├── (手动切换) ──> paused
                │       │                     │
                │       └── (手动切换) ──> cancelled
                │
                └── (审核拒绝时 reset)
```

### 每个流转的触发方式

| 流转 | 触发方式 | UI 位置 | API |
|---|---|---|---|
| `pending → in_progress` | **自动**：审核通过时后端自动设置 | 无手动操作 | 后端 `WorkOrderFlowService.handle_approval_passed()` |
| `in_progress → completed` | **自动**：当所有工序(`WorkOrderProcess`)都完成时自动触发 | 无手动操作 | 后端 `WorkOrderProcess.check_and_update_status()` |
| 任意 → 任意（手动） | 详情页基本信息区的状态下拉菜单 | `WorkOrderBasicInfo.vue` 中"状态"字段旁的下拉选择器（有 `canEdit` 权限时显示） | `workOrderAPI.updateStatus(id, {status: value})` |
| `rejected → pending` | **自动**：审核拒绝时后端自动 reset | 无手动操作 | 后端 `WorkOrderFlowService.handle_approval_rejected()` |

注意：`WorkOrderBasicInfo.vue` 中的状态下拉菜单（`statusOptions`）包含全部 5 个状态值，理论上可以在任意状态间切换，后端 `updateStatus()` 也没有做转换限制，只校验值是否在 `STATUS_CHOICES` 中。

---

## 三、完整生命周期路线图

### 典型路径（正常流程）

```
1. 新建施工单
   approval_status = draft, status = pending
   页面: WorkOrderForm.vue (/workorders/create)

2a. 存为草稿 → 弹窗"是否立即提交审核？" → 确认
    approval_status: draft → submitted
    API: workOrderAPI.submitApproval()

2b. 或点击"直接发布"
    approval_status: draft → submitted → approved (自动)
    status: pending → in_progress (自动)
    API: workOrderFlowAPI.submitApproval({auto_approve:true})

3. 业务员在详情页审核通过
   approval_status: submitted → approved
   status: pending → in_progress (后端自动)
   页面: WorkOrderDetail.vue (/workorders/:id)
   组件: WorkOrderApproval.vue

4. 生产执行（通过操作员任务中心完成各工序）
   工序: pending → in_progress → completed
   页面: OperatorCenter.vue (/tasks/operator)

5. 所有工序完成，施工单自动完成
   status: in_progress → completed (后端自动)
```

### 异常路径

```
3'. 业务员审核拒绝
    approval_status: submitted → rejected
    status: reset → pending
    页面: WorkOrderDetail.vue

3''. 修改后重新提交
     approval_status: rejected → submitted
     页面: WorkOrderDetail.vue
     API: workOrderAPI.resubmit()
```

---

## 四、关键 UI 位置汇总

| 操作 | 页面 | 路由 | 关键文件 |
|---|---|---|---|
| 新建施工单 | 新建/编辑表单 | `/workorders/create` | `WorkOrderForm.vue` |
| 存为草稿 | 新建页底部按钮 | 同上 | `WorkOrderForm.vue:250` |
| 直接发布（auto_approve） | 新建页底部按钮 | 同上 | `WorkOrderForm.vue:252-268` |
| 提交审核（草稿→待审核） | 新建页弹窗 | 同上 | `WorkOrderForm.vue:195-204` |
| 审核通过/拒绝 | **施工单详情页** | `/workorders/:id` | `WorkOrderApproval.vue` (被 `WorkOrderDetail.vue:31-38` 引用) |
| 重新提交 | 施工单详情页 | 同上 | `WorkOrderApproval.vue:60-84` |
| 手动切换生产状态 | 施工单详情页 | 同上 | `WorkOrderBasicInfo.vue:42-96`（状态下拉菜单） |
| 按审批状态筛选 | 列表页筛选栏 | `/workorders` | `WorkOrderList.vue:13-19` |
| 列表行操作 | 列表页 | 同上 | 只有 查看/编辑/删除，**没有审核操作** |

---

## 五、权限要求

| 操作 | 权限 | 额外条件 |
|---|---|---|
| 编辑施工单 | `workorder.change_workorder` | 审核通过后只能改非核心字段 |
| 删除施工单 | `workorder.delete_workorder` | — |
| **审核施工单** | `workorder.approve_workorder` | 业务员角色只能审核自己负责客户的施工单，超级用户不受限 |
| 切换生产状态 | `workorder.change_workorder` | — |

---

## 六、后端关键文件索引

| 文件 | 职责 |
|---|---|
| `backend/workorder/models/core.py` | WorkOrder 模型定义，`STATUS_CHOICES`，`APPROVAL_STATUS_TRANSITIONS` |
| `backend/workorder/models/base.py` | `ApprovalFieldsMixin`，审批状态字段 |
| `backend/workorder/constants/status.py` | 集中式状态常量 (`WorkOrderStatus`, `WorkOrderApprovalStatus`, `ProcessStatus`, `TaskStatus`) |
| `backend/workorder/services/work_order_service.py` | 基本状态更新和审批方法 |
| `backend/workorder/services/work_order_flow_service.py` | 完整生命周期编排（提交/通过/拒绝/重新提交） |
| `backend/workorder/services/work_order_process_service.py` | 工序状态转换（启动/完成） |
| `backend/workorder/services/approval_service.py` | 通用审批服务 |
