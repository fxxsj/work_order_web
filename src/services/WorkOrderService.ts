/**
 * 施工单服务
 *
 * 处理施工单相关的展示与业务规则计算（纯工具函数集合，不再承担 API 调用）。
 */

export const WorkOrderStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export type WorkOrderStatusType = typeof WorkOrderStatus[keyof typeof WorkOrderStatus]

export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export type ApprovalStatusType = typeof ApprovalStatus[keyof typeof ApprovalStatus]

export const Priority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

export type PriorityType = typeof Priority[keyof typeof Priority]

export interface WorkOrderDisplayData extends Record<string, unknown> {
  status_text: string
  approval_status_text: string
  priority_text: string
  priority_type: string
  progress_percentage: number
  is_overdue: boolean
  remaining_days: number | null
  can_edit: boolean
  can_delete: boolean
  can_submit: boolean
  can_start: boolean
  is_completed: boolean
}

export interface WorkOrderStatistics {
  total: number
  pending: number
  in_progress: number
  completed: number
  cancelled: number
  overdue: number
  pending_approval: number
  approved: number
  rejected: number
}

class WorkOrderService {
  calculateProgress(workOrder: Record<string, unknown>): number {
    const progressPercentage = workOrder.progress_percentage as number | undefined
    if (!progressPercentage) {
      const tasks = workOrder.tasks as Array<Record<string, unknown>> | undefined
      if (!tasks || tasks.length === 0) {
        return 0
      }

      const totalTasks = tasks.length
      const completedTasks = tasks.filter(
        (task: any) => task.status === WorkOrderStatus.COMPLETED
      ).length

      return Math.round((completedTasks / totalTasks) * 100)
    }

    return Math.min(Math.max(progressPercentage, 0), 100)
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      [WorkOrderStatus.PENDING]: '待开始',
      [WorkOrderStatus.IN_PROGRESS]: '进行中',
      [WorkOrderStatus.COMPLETED]: '已完成',
      [WorkOrderStatus.CANCELLED]: '已取消'
    }
    return statusMap[status] || status
  }

  getApprovalStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      [ApprovalStatus.PENDING]: '待审核',
      [ApprovalStatus.APPROVED]: '已审核',
      [ApprovalStatus.REJECTED]: '已拒绝'
    }
    return statusMap[status] || status
  }

  getPriorityText(priority: string): string {
    const priorityMap: Record<string, string> = {
      [Priority.LOW]: '低',
      [Priority.NORMAL]: '普通',
      [Priority.HIGH]: '高',
      [Priority.URGENT]: '紧急'
    }
    return priorityMap[priority] || '普通'
  }

  getPriorityType(priority: string): string {
    const typeMap: Record<string, string> = {
      [Priority.LOW]: 'info',
      [Priority.NORMAL]: '',
      [Priority.HIGH]: 'warning',
      [Priority.URGENT]: 'danger'
    }
    return typeMap[priority] || ''
  }

  canEdit(workOrder: Record<string, unknown>): boolean {
    if (workOrder.status === WorkOrderStatus.CANCELLED) {
      return false
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      return false
    }

    if (workOrder.approval_status === ApprovalStatus.APPROVED) {
      return false
    }

    return true
  }

  canDelete(workOrder: Record<string, unknown>): boolean {
    return (
      workOrder.status === WorkOrderStatus.PENDING &&
      workOrder.approval_status === ApprovalStatus.PENDING
    )
  }

  canSubmitForApproval(workOrder: Record<string, unknown>): boolean {
    return (
      workOrder.status === WorkOrderStatus.PENDING &&
      workOrder.approval_status === ApprovalStatus.PENDING
    )
  }

  canStart(workOrder: Record<string, unknown>): boolean {
    return (
      workOrder.approval_status === ApprovalStatus.APPROVED &&
      workOrder.status === WorkOrderStatus.PENDING
    )
  }

  isCompleted(workOrder: Record<string, unknown>): boolean {
    return workOrder.status === WorkOrderStatus.COMPLETED
  }

  isOverdue(workOrder: Record<string, unknown>): boolean {
    if (!workOrder.delivery_date) {
      return false
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      return false
    }

    const deliveryDate = new Date(workOrder.delivery_date as string)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return deliveryDate < today
  }

  getRemainingDays(workOrder: Record<string, unknown>): number | null {
    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      return null
    }

    if (!workOrder.delivery_date) {
      return null
    }

    const deliveryDate = new Date(workOrder.delivery_date as string)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    deliveryDate.setHours(0, 0, 0, 0)

    const diffTime = deliveryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  canAddProduct(workOrder: Record<string, unknown>): boolean {
    return (
      workOrder.status === WorkOrderStatus.PENDING &&
      workOrder.approval_status === ApprovalStatus.PENDING
    )
  }

  canAddProcess(workOrder: Record<string, unknown>): boolean {
    return (
      workOrder.status === WorkOrderStatus.PENDING &&
      workOrder.approval_status === ApprovalStatus.PENDING
    )
  }

  _prepareSubmitData(formData: Record<string, unknown>): Record<string, unknown> {
    const data: Record<string, unknown> = {
      customer: formData.customer,
      production_quantity: formData.production_quantity,
      delivery_date: formData.delivery_date,
      notes: formData.notes || '',
      priority: formData.priority || Priority.NORMAL
    }

    const products = formData.products as Array<Record<string, unknown>> | undefined
    if (products && products.length > 0) {
      data.products_data = products.map((product: any) => ({
        product: product.product_id,
        quantity: product.quantity,
        unit: product.unit || '件'
      }))
    }

    const processes = formData.processes as Array<Record<string, unknown> | number> | undefined
    if (processes && processes.length > 0) {
      data.processes = processes.map((process: any) => typeof process === 'object' ? process.id : process)
    }

    return data
  }

  formatWorkOrderForDisplay(workOrder: Record<string, unknown>): WorkOrderDisplayData {
    return {
      ...workOrder,
      status_text: this.getStatusText(workOrder.status as string),
      approval_status_text: this.getApprovalStatusText(workOrder.approval_status as string),
      priority_text: this.getPriorityText(workOrder.priority as string),
      priority_type: this.getPriorityType(workOrder.priority as string),
      progress_percentage: this.calculateProgress(workOrder),
      is_overdue: this.isOverdue(workOrder),
      remaining_days: this.getRemainingDays(workOrder),
      can_edit: this.canEdit(workOrder),
      can_delete: this.canDelete(workOrder),
      can_submit: this.canSubmitForApproval(workOrder),
      can_start: this.canStart(workOrder),
      is_completed: this.isCompleted(workOrder)
    }
  }

  formatWorkOrderList(workOrders: Array<Record<string, unknown>>): WorkOrderDisplayData[] {
    return workOrders.map(wo => this.formatWorkOrderForDisplay(wo))
  }

  getStatistics(workOrders: Array<Record<string, unknown>>): WorkOrderStatistics {
    const stats: WorkOrderStatistics = {
      total: workOrders.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
      pending_approval: 0,
      approved: 0,
      rejected: 0
    }

    workOrders.forEach(wo => {
      const status = wo.status as string
      const approvalStatus = wo.approval_status as string

      if (status === WorkOrderStatus.PENDING) stats.pending++
      else if (status === WorkOrderStatus.IN_PROGRESS) stats.in_progress++
      else if (status === WorkOrderStatus.COMPLETED) stats.completed++
      else if (status === WorkOrderStatus.CANCELLED) stats.cancelled++

      if (approvalStatus === ApprovalStatus.PENDING) stats.pending_approval++
      else if (approvalStatus === ApprovalStatus.APPROVED) stats.approved++
      else if (approvalStatus === ApprovalStatus.REJECTED) stats.rejected++

      if (this.isOverdue(wo)) stats.overdue++
    })

    return stats
  }
}

const workOrderService = new WorkOrderService()

export default workOrderService
export { WorkOrderService }
