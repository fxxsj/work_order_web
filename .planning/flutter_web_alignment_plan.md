# 页面对齐分析与调整计划 (Flutter vs Web)

## 1. 概述
通过对比上级目录 `flutter` (基于 `lib/src/app/page_registry.dart` 与路由配置) 与当前 `web` (基于 `src/router/index.ts` 与 `views` 目录) 的页面结构，我们对双端的页面一致性进行了详细分析。

总体而言，Web端与Flutter端的核心页面（如工作台、施工单、基础数据、模板、库存、财务等主流程）有较高的重合度，但 Web 端存在部分模块页面缺失（需要新增）以及部分历史模块有多余页面（需要移除）的情况。

## 2. 差异分析报告

### 2.1 基础模块 & 基础数据 (基本对齐)
- **已对齐**: 登录(Login)、个人信息(Profile)、工作台(Dashboard)、客户(Customers)、部门(Departments)、工序(Processes)、产品(Products)、物料(Materials)、产品组(Product Groups)、各类模具(Artworks, Dies, Foiling, Embossing)、供应商(Suppliers)、审计日志(Audit Logs)。
- **差异**: Flutter端在路由中定义了 `/register`（注册页面），而 Web 端路由中没有独立的注册页面。*(注：若 Web 端不开放自主注册，可忽略)*。

### 2.2 核心业务单据 (完全对齐)
- **已对齐**: 施工单管理(WorkOrders)、销售订单(SalesOrders)、采购单(PurchaseOrders)。对应列表、新建、详情、编辑的路由与结构双端一致。

### 2.3 任务管理模块 (Web端有多余页面)
- **Flutter 端拥有**:
  - 任务列表 (`tasks_list`)
  - 分派规则配置 (`tasks_rules`)
  - 操作员任务中心 (`tasks_operator`)
  - 主管看板 (`tasks_supervisor`)
- **Web 端拥有**: 以上四个页面均存在。
- **差异 (Web 多出)**:
  - 部门任务看板 (`views/task/Board.vue`, 路由 `tasks/board`)
  - 协作统计 (`views/task/Stats.vue`, 路由 `tasks/stats`)
  - 分派历史 (`views/task/AssignmentHistory.vue`, 路由 `tasks/assignment-history`)

### 2.4 库存管理模块 (Web端缺失)
- **Flutter 端拥有**:
  - 成品库存 (`stocks`)
  - 发货管理 (`delivery`)
  - 质量检验 (`quality`)
  - **入库管理** (`stock_ins`)
  - **出库管理** (`stock_outs`)
- **差异 (Web 缺失)**: 入库管理和出库管理在 Web 端无对应的路由及视图组件。

### 2.5 财务模块 (Web端缺失)
- **Flutter 端拥有**:
  - 发票 (`invoices`)
  - 收款 (`payments`)
  - 生产成本 (`costs`)
  - 对账单 (`statements`)
  - **成本中心** (`cost_centers`)
  - **成本项目** (`cost_items`)
  - **付款计划** (`payment_plans`)
- **差异 (Web 缺失)**: 成本中心、成本项目、付款计划在 Web 端无对应页面及路由。

### 2.6 通知与日志 (Web端缺失)
- **差异 (Web 缺失)**:
  - **工序日志**：Flutter 有 `process_logs`，Web端缺失对应的单独日志列表页。
  - **系统通知管理**：Flutter 有 `system_notifications` (管理员通知管理)，Web端只有常规的个人通知中心(Notification)。

---

## 3. 页面调整计划 (以 Flutter 为基准)

为了使 Web 端页面严格对齐 Flutter 端，制定以下调整计划：

### 3.1 阶段一：新增缺失页面及路由 (补充 Web 功能)
在 Web 端的 `src/views/` 目录下创建相应的空页面组件，并在 `src/router/index.ts` 中注册。

- **库存模块 (Inventory)**
  - `[新增]` `src/views/inventory/StockIn.vue`
  - `[新增]` `src/views/inventory/StockOut.vue`
  - `[路由]` 增加 `/inventory/stock-ins` 和 `/inventory/stock-outs`
- **财务模块 (Finance)**
  - `[新增]` `src/views/finance/CostCenter.vue`
  - `[新增]` `src/views/finance/CostItem.vue`
  - `[新增]` `src/views/finance/PaymentPlan.vue`
  - `[路由]` 增加 `/finance/cost-centers`, `/finance/cost-items`, `/finance/payment-plans`
- **工序与系统记录**
  - `[新增]` `src/views/process/ProcessLog.vue` 
  - `[路由]` 增加 `/processes/logs`
- **通知管理 (Notification Admin)**
  - `[新增]` `src/views/notification/NotificationAdmin.vue` 
  - `[路由]` 增加 `/notifications/admin` 

### 3.2 阶段二：移除冗余页面及路由 (精简 Web 代码)
Web 端部分视图在 Flutter 架构重构后已被废弃或未包含，需要进行移除以保持严格对齐。

- **任务管理 (Tasks)**
  - `[移除]` `src/views/task/Board.vue`
  - `[移除]` `src/views/task/Stats.vue`
  - `[移除]` `src/views/task/AssignmentHistory.vue`
  - `[路由]` 从 `src/router/index.ts` 中删除上述三个路由。

### 3.3 阶段三：导航菜单同步
在完成页面增删后，需要修改 Web 端的侧边栏导航组件（通常在 `src/components/layout/` 中或从后台接口拉取），将新增的路由加入菜单配置中，并剔除已移除的路由项，确保双端 UI 入口一致。

### 3.4 阶段四：深度对齐修正 (Deep Check Findings)
经过对 Flutter 核心菜单配置 `nav_config.dart` 的深度比对，发现 Web 端还存在以下未完全对齐的细节，需要进行修正：

**1. 侧边栏菜单项遗漏与多余：**
- `[新增菜单]` 任务管理下缺失 **操作员任务中心** (`/tasks/operator`) 和 **主管看板** (`/tasks/supervisor`)。
- `[隐藏菜单]` 工序日志 (`/process-logs`) 在 Flutter 中配置为 `showInSidebar: false`，因此不应该出现在 Web 的侧边栏中。

**2. 路由路径对齐：**
- **工序日志**: Web 现为 `/processes/logs`，需修改为 `/process-logs`。
- **系统通知管理**: Web 现为 `/notifications/admin`，需修改为 `/system-notifications`。

**3. 菜单文案 (Label) 对齐：**
- **客户订单**: Web 现为“销售订单”，需改为“**客户订单**” (`/sales-orders`)。
- **默认分派部门**: Web 现为“分派规则配置”，需改为“**默认分派部门**” (`/tasks/assignment-rules`)。
- **入库单**: Web 现为“入库管理”，需改为“**入库单**” (`/inventory/stock-ins`)。
- **出库单**: Web 现为“出库管理”，需改为“**出库单**” (`/inventory/stock-outs`)。
- **收款计划**: Web 现为“付款计划”，需改为“**收款计划**” (`/finance/payment-plans`)。
- **通知管理**: 系统通知管理在 Flutter 中文案为“**通知管理**” (`/system-notifications`)。
