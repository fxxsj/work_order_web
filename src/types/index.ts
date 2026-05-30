/**
 * 业务模型类型定义
 */

// ============ 用户与认证 ============

export interface User {
  id: number
  username: string
  email?: string
  name?: string
  phone?: string
  avatar?: string
  role_codes?: string[]
  roles?: string[]
  groups?: string[]
  permissions?: string[]
  is_superuser?: boolean
  is_staff?: boolean
  access_token?: string
  refresh_token?: string
  /** Access token expiration timestamp (Unix seconds) */
  access_expires_at?: number
  department?: number
  department_name?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user?: User
}

// ============ 客户 ============

export interface Customer {
  id: number
  name: string
  code?: string
  contact?: string
  phone?: string
  address?: string
  email?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

// ============ 施工单 ============

export type WorkOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'in_production'
  | 'completed'
  | 'cancelled'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface WorkOrder {
  id: number
  order_no: string
  customer?: number
  customer_name?: string
  salesperson?: number
  salesperson_name?: string
  status: WorkOrderStatus
  approval_status?: ApprovalStatus
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  products?: WorkOrderProduct[]
  order_processes?: WorkOrderProcess[]
  materials?: WorkOrderMaterial[]
  artworks?: Artwork[]
  dies?: Die[]
  notes?: string
  expected_date?: string
  delivery_date?: string
  created_at?: string
  updated_at?: string
  creator?: number
  creator_name?: string
  purchase_order_summaries?: PurchaseOrderSummary[]
}

export interface WorkOrderProduct {
  id?: number
  product?: number
  product_name?: string
  product_code?: string
  quantity: number
  unit?: string
  unit_price?: number
  total_price?: number
  notes?: string
}

export interface WorkOrderProcess {
  id: number
  process: number
  process_name?: string
  department?: number
  department_name?: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  assignee?: number
  assignee_name?: string
  started_at?: string
  completed_at?: string
  notes?: string
  order?: number
}

export interface WorkOrderMaterial {
  id?: number
  material?: number
  material_name?: string
  material_code?: string
  quantity: number
  unit?: string
  in_stock?: number
  shortage?: number
  notes?: string
}

// ============ 工序 ============

export interface Process {
  id: number
  name: string
  code?: string
  department?: number
  department_name?: string
  sequence?: number
  notes?: string
}

// ============ 产品 ============

export interface Product {
  id: number
  name: string
  code?: string
  category?: string
  unit?: string
  price?: number
  notes?: string
}

// ============ 物料 ============

export interface Material {
  id: number
  name: string
  code?: string
  unit?: string
  price?: number
  stock?: number
  min_stock?: number
  supplier?: number
  supplier_name?: string
  notes?: string
}

// ============ 刀模 ============

export interface Die {
  id: number
  code: string
  name?: string
  customer?: number
  customer_name?: string
  status?: 'active' | 'inactive' | 'borrowed'
  notes?: string
  created_at?: string
}

// ============ 图稿 ============

export interface Artwork {
  id: number
  code: string
  name?: string
  customer?: number
  customer_name?: string
  file_url?: string
  thumbnail_url?: string
  status?: 'pending' | 'approved' | 'rejected'
  notes?: string
  created_at?: string
}

// ============ 烫金版/压凸版 ============

export interface FoilingPlate {
  id: number
  code: string
  name?: string
  customer?: number
  customer_name?: string
  status?: 'active' | 'inactive'
  notes?: string
}

export interface EmbossingPlate {
  id: number
  code: string
  name?: string
  customer?: number
  customer_name?: string
  status?: 'active' | 'inactive'
  notes?: string
}

// ============ 供应商 ============

export interface Supplier {
  id: number
  name: string
  code?: string
  contact?: string
  phone?: string
  address?: string
  email?: string
  notes?: string
}

// ============ 部门 ============

export interface Department {
  id: number
  name: string
  code?: string
  manager?: number
  manager_name?: string
  parent?: number
  notes?: string
}

// ============ 任务 ============

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'paused'

export interface Task {
  id: number
  title: string
  description?: string
  work_order?: number
  work_order_no?: string
  process?: number
  process_name?: string
  assignee?: number
  assignee_name?: string
  assignee_department?: number
  assignee_department_name?: string
  status: TaskStatus
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  due_date?: string
  started_at?: string
  completed_at?: string
  created_at?: string
  updated_at?: string
  creator?: number
  creator_name?: string
  logs?: TaskLog[]
}

export interface TaskLog {
  id: number
  task: number
  action: string
  operator: number
  operator_name?: string
  content?: string
  created_at: string
}

// ============ 采购单 ============

export type PurchaseStatus = 'pending' | 'approved' | 'purchased' | 'received' | 'cancelled'

export interface PurchaseOrder {
  id: number
  order_no: string
  supplier: number
  supplier_name?: string
  work_order?: number
  work_order_no?: string
  status: PurchaseStatus
  total_amount?: number
  expected_date?: string
  received_date?: string
  items?: PurchaseOrderItem[]
  notes?: string
  created_at?: string
  updated_at?: string
  creator?: number
  creator_name?: string
}

export interface PurchaseOrderItem {
  id?: number
  material: number
  material_name?: string
  material_code?: string
  quantity: number
  unit?: string
  unit_price?: number
  total_price?: number
  received_quantity?: number
}

export interface PurchaseOrderSummary {
  id: number
  order_no: string
  supplier_name: string
  total_amount: number
  status: PurchaseStatus
}

// ============ 客户订单 ============

export type SalesStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'in_production' | 'completed' | 'cancelled'

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export type ApprovalStatusType = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface SalesOrder {
  id: number
  order_number: string
  customer: number
  customer_name?: string
  customer_code?: string
  status: SalesStatus
  status_display?: string
  payment_status: PaymentStatus
  payment_status_display?: string
  approval_status?: ApprovalStatusType
  approval_comment?: string
  rejection_reason?: string
  contract_number?: string
  contact_person?: string
  contact_phone?: string
  shipping_address?: string
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  discount_amount?: number
  total_amount?: number
  deposit_amount?: number
  paid_amount?: number
  payment_date?: string
  order_date?: string
  delivery_date?: string
  actual_delivery_date?: string
  completion_reason?: string
  notes?: string
  items_count?: number
  work_order_count?: number
  created_by?: number
  items?: SalesOrderItem[]
  work_order_numbers?: string[]
  delivery_order_numbers?: string[]
  invoice_numbers?: string[]
  work_order_summaries?: WorkOrderSummary[]
  delivery_order_summaries?: DeliveryOrderSummary[]
  invoice_summaries?: InvoiceSummary[]
  payment_count?: number
  pending_payment_plan_count?: number
  pending_payment_plan_amount?: number
  unpaid_amount?: number
  created_at?: string
  updated_at?: string
}

export interface SalesOrderItem {
  id?: number
  product: number
  product_name?: string
  product_code?: string
  specification?: string
  quantity: number
  delivered_quantity?: number
  unit?: string
  unit_price?: number
  tax_rate?: number
  discount_amount?: number
  subtotal?: number
  notes?: string
}

export interface WorkOrderSummary {
  id: number
  number: string
  status?: string
  status_display?: string
}

export interface DeliveryOrderSummary {
  id: number
  number: string
  status?: string
  status_display?: string
}

export interface InvoiceSummary {
  id: number
  number: string
  status?: string
  status_display?: string
}

// ============ 库存 ============

export interface Stock {
  id: number
  product: number
  product_name?: string
  product_code?: string
  quantity: number
  unit?: string
  location?: string
  updated_at?: string
}

// ============ 发货 ============

export interface Delivery {
  id: number
  order_no: string
  sales_order?: number
  sales_order_no?: string
  customer: number
  customer_name?: string
  status: 'pending' | 'shipped' | 'delivered'
  shipment_date?: string
  tracking_number?: string
  items?: DeliveryItem[]
  notes?: string
  created_at?: string
}

export interface DeliveryItem {
  id?: number
  product: number
  product_name?: string
  quantity: number
}

// ============ 质量检验 ============

export interface QualityInspection {
  id: number
  order_no: string
  work_order?: number
  work_order_no?: string
  inspector?: number
  inspector_name?: string
  result: 'pass' | 'fail' | 'rework'
  quantity_passed?: number
  quantity_failed?: number
  defects?: string
  notes?: string
  inspected_at?: string
  created_at?: string
}

// ============ 发票 ============

export interface Invoice {
  id: number
  invoice_no: string
  sales_order?: number
  sales_order_no?: string
  customer: number
  customer_name?: string
  amount: number
  tax_amount?: number
  total_amount?: number
  status: 'issued' | 'paid' | 'cancelled'
  issue_date?: string
  due_date?: string
  paid_date?: string
  notes?: string
}

// ============ 付款 ============

export interface Payment {
  id: number
  payment_no: string
  customer: number
  customer_name?: string
  amount: number
  payment_method?: 'bank_transfer' | 'cash' | 'wechat' | 'alipay'
  status: 'pending' | 'completed' | 'refunded'
  payment_date?: string
  notes?: string
}

// ============ 对账单 ============

export interface Statement {
  id: number
  statement_no: string
  customer: number
  customer_name?: string
  period_start: string
  period_end: string
  opening_balance?: number
  closing_balance?: number
  total_sales?: number
  total_payments?: number
  status: 'draft' | 'confirmed' | 'settled'
  notes?: string
}

// ============ 成本 ============

export interface CostRecord {
  id: number
  work_order: number
  work_order_no?: string
  cost_type: string
  amount: number
  notes?: string
  created_at?: string
}

// ============ 通知 ============

export interface Notification {
  id: number | string
  title: string
  content?: string
  notification_type?: string
  notification_type_display?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  priority_display?: string
  type?: 'info' | 'warning' | 'success' | 'error'
  is_read?: boolean
  read_at?: string | null
  link?: string
  created_at?: string
  work_order_id?: number | null
  work_order_process_id?: number | null
  task_id?: number | null
  purchase_order_id?: number | null
  data?: Record<string, unknown>
}

export interface Toast {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  message: string
  title?: string
  duration?: number
  startTime?: number
}

// ============ 审计日志 ============

export interface AuditLog {
  id: number
  action: string
  content_type: number
  object_repr?: string
  user: number
  user_name?: string
  changes?: Record<string, [unknown, unknown]>
  created_at: string
}

// ============ 统计 ============

export interface WorkOrderStatistics {
  total: number
  by_status: Record<WorkOrderStatus, number>
  by_priority: Record<string, number>
  this_month: number
  this_week: number
}

export interface TaskStatistics {
  total: number
  by_status: Record<TaskStatus, number>
  my_pending: number
  my_in_progress: number
  my_completed: number
}

// ============ 通用分页 ============

// ApiResponse 和分页类型统一在 types/api.ts 中定义，此处重新导出避免破坏现有导入路径
export type { ApiResponse, ApiErrorResponse, PaginatedApiResponse } from './api'

/**
 * 分页数据结构（与后端 DRF CustomPagination 对应）
 * data.count / data.next / data.previous / data.results
 */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ListParams {
  page?: number
  page_size?: number
  ordering?: string
  search?: string
  [key: string]: unknown
}

// ============ 通用 CRUD 操作 ============

export type CrudAction = 'list' | 'create' | 'detail' | 'update' | 'delete' | 'batch_delete'

export interface CrudPermissions {
  list?: boolean
  create?: boolean
  detail?: boolean
  update?: boolean
  delete?: boolean
  batch_delete?: boolean
}
