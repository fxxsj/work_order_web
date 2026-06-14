/**
 * 任务业务逻辑服务
 *
 * 处理任务相关的业务逻辑，将业务逻辑从 Vue 组件中分离
 */

import BaseService from './base/BaseService'
import api from '@/api'

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus]

export const TaskType = {
  GENERAL: 'general',
  PLATE_MAKING: 'plate_making',
  CUTTING: 'cutting',
  PRINTING: 'printing',
  FOILING: 'foiling',
  EMBOSSING: 'embossing',
  DIE_CUTTING: 'die_cutting',
  PACKAGING: 'packaging'
} as const

export type TaskTypeType = typeof TaskType[keyof typeof TaskType]

export interface CompleteTaskOptions {
  completionReason?: string
  notes?: string
  artworkIds?: number[]
  dieIds?: number[]
  quantityDefective?: number
  version?: number | null
}

export interface StatusOption {
  value: string
  label: string
}

class TaskService extends BaseService {
  constructor() {
    super(api)
  }

  async getTasks(params: Record<string, unknown> = {}): Promise<ReturnType<BaseService['execute']>> {
    return this.execute(
      () => (this.apiClient as Record<string, (...args: unknown[]) => Promise<{ data: unknown }>>).list(params),
      { showLoading: true }
    )
  }

  async getTaskDetail(taskId: number): Promise<ReturnType<BaseService['execute']>> {
    return this.execute(
      () => (this.apiClient as Record<string, (...args: unknown[]) => Promise<{ data: unknown }>>).getDetail(taskId),
      { showLoading: true }
    )
  }

  async updateTaskQuantity(taskId: number, increment: number, version: number): Promise<ReturnType<BaseService['execute']>> {
    return this.execute(
      () => (this.apiClient as Record<string, (...args: unknown[]) => Promise<{ data: unknown }>>).updateQuantity(taskId, {
        quantity_increment: increment,
        version
      }),
      {
        showLoading: true,
        errorMessage: (error: unknown) => {
          const err = error as Record<string, unknown>
          const response = err.response as Record<string, unknown> | undefined
          if (response?.status === 409) {
            return '任务已被其他操作员更新，请刷新后重试'
          }
          return '' // 使用默认错误处理
        }
      }
    )
  }

  async completeTask(taskId: number, options: CompleteTaskOptions = {}): Promise<ReturnType<BaseService['execute']>> {
    const {
      completionReason = '',
      notes = '',
      artworkIds = [],
      dieIds = [],
      quantityDefective = 0,
      version = null
    } = options

    return this.execute(
      () => (this.apiClient as Record<string, (...args: unknown[]) => Promise<{ data: unknown }>>).complete(taskId, {
        completion_reason: completionReason,
        notes,
        artwork_ids: artworkIds,
        die_ids: dieIds,
        quantity_defective: quantityDefective,
        version
      }),
      { showLoading: true }
    )
  }

  async assignTask(taskId: number, departmentId: number, operatorId: number | null = null): Promise<ReturnType<BaseService['execute']>> {
    return this.execute(
      () => (this.apiClient as Record<string, (...args: unknown[]) => Promise<{ data: unknown }>>).assign(taskId, {
        assigned_department: departmentId,
        assigned_operator: operatorId
      }),
      { showLoading: true }
    )
  }

  async splitTask(taskId: number, splits: Array<Record<string, unknown>>): Promise<ReturnType<BaseService['execute']>> {
    return this.execute(
      () => (this.apiClient as Record<string, (...args: unknown[]) => Promise<{ data: unknown }>>).split(taskId, { splits }),
      { showLoading: true }
    )
  }

  calculateProgress(task: Record<string, unknown>): number {
    const productionQuantity = task.production_quantity as number
    if (!productionQuantity || productionQuantity === 0) {
      return 0
    }

    const quantityCompleted = task.quantity_completed as number
    const progress = (quantityCompleted / productionQuantity) * 100
    return Math.min(Math.round(progress), 100)
  }

  canComplete(task: Record<string, unknown>): boolean {
    const status = task.status as string
    if (status === TaskStatus.COMPLETED || status === TaskStatus.CANCELLED) {
      return false
    }

    const taskType = task.task_type as string
    if (taskType === TaskType.PLATE_MAKING) {
      const artwork = task.artwork as Record<string, unknown> | undefined
      if (artwork && !artwork.confirmed) {
        return false
      }
      const die = task.die as Record<string, unknown> | undefined
      if (die && !die.confirmed) {
        return false
      }
      const foilingPlate = task.foiling_plate as Record<string, unknown> | undefined
      if (foilingPlate && !foilingPlate.confirmed) {
        return false
      }
      const embossingPlate = task.embossing_plate as Record<string, unknown> | undefined
      if (embossingPlate && !embossingPlate.confirmed) {
        return false
      }
    }

    return true
  }

  getCannotCompleteReason(task: Record<string, unknown>): string {
    const status = task.status as string
    if (status === TaskStatus.COMPLETED) {
      return '任务已完成'
    }

    if (status === TaskStatus.CANCELLED) {
      return '任务已取消'
    }

    const taskType = task.task_type as string
    if (taskType === TaskType.PLATE_MAKING) {
      const artwork = task.artwork as Record<string, unknown> | undefined
      if (artwork && !artwork.confirmed) {
        return '需要确认图稿'
      }
      const die = task.die as Record<string, unknown> | undefined
      if (die && !die.confirmed) {
        return '需要确认刀模'
      }
      const foilingPlate = task.foiling_plate as Record<string, unknown> | undefined
      if (foilingPlate && !foilingPlate.confirmed) {
        return '烫金版未确认'
      }
      const embossingPlate = task.embossing_plate as Record<string, unknown> | undefined
      if (embossingPlate && !embossingPlate.confirmed) {
        return '压凸版未确认'
      }
    }

    return ''
  }

  getTaskDeadline(task: Record<string, unknown> | null): string | null {
    if (!task) return null
    return (
      (task.deadline as string) ||
      ((task.work_order_process_info as any)?.work_order?.delivery_date as string) ||
      null
    )
  }

  isOverdue(task: Record<string, unknown>): boolean {
    const deadline = this.getTaskDeadline(task)
    const status = task.status as string
    if (!deadline || status === TaskStatus.COMPLETED || status === TaskStatus.CANCELLED) {
      return false
    }

    return new Date(deadline) < new Date()
  }

  getRemainingDays(task: Record<string, unknown>): number | null {
    const deadlineValue = this.getTaskDeadline(task)
    const status = task.status as string
    if (!deadlineValue || status === TaskStatus.COMPLETED || status === TaskStatus.CANCELLED) {
      return null
    }

    const deadline = new Date(deadlineValue)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      [TaskStatus.PENDING]: '待开始',
      [TaskStatus.IN_PROGRESS]: '进行中',
      [TaskStatus.COMPLETED]: '已完成',
      [TaskStatus.CANCELLED]: '已取消'
    }

    return statusMap[status] || status
  }

  getTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      [TaskType.GENERAL]: '通用任务',
      [TaskType.PLATE_MAKING]: '制版任务',
      [TaskType.CUTTING]: '开料任务',
      [TaskType.PRINTING]: '印刷任务',
      [TaskType.FOILING]: '烫金任务',
      [TaskType.EMBOSSING]: '压凸任务',
      [TaskType.DIE_CUTTING]: '模切任务',
      [TaskType.PACKAGING]: '包装任务'
    }

    return typeMap[type] || type
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      [TaskStatus.PENDING]: 'info',
      [TaskStatus.IN_PROGRESS]: 'warning',
      [TaskStatus.COMPLETED]: 'success',
      [TaskStatus.CANCELLED]: 'danger'
    }

    return colorMap[status] || 'default'
  }

  getStatusType(status: string): string {
    const typeMap: Record<string, string> = {
      [TaskStatus.PENDING]: 'info',
      [TaskStatus.IN_PROGRESS]: 'warning',
      [TaskStatus.COMPLETED]: 'success',
      [TaskStatus.CANCELLED]: 'danger'
    }

    return typeMap[status] || 'info'
  }

  formatDateTime(dateTime: string | null | undefined): string {
    if (!dateTime) {
      return ''
    }

    try {
      const date = new Date(dateTime)
      if (isNaN(date.getTime())) {
        return ''
      }

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } catch (_e: any) {
      return ''
    }
  }

  getStatusOptions(): StatusOption[] {
    return [
      { value: TaskStatus.PENDING, label: '待开始' },
      { value: TaskStatus.IN_PROGRESS, label: '进行中' },
      { value: TaskStatus.COMPLETED, label: '已完成' },
      { value: TaskStatus.CANCELLED, label: '已取消' }
    ]
  }

  getTaskTypeOptions(): StatusOption[] {
    return [
      { value: TaskType.GENERAL, label: '通用任务' },
      { value: TaskType.PLATE_MAKING, label: '制版任务' },
      { value: TaskType.CUTTING, label: '开料任务' },
      { value: TaskType.PRINTING, label: '印刷任务' },
      { value: TaskType.FOILING, label: '烫金任务' },
      { value: TaskType.EMBOSSING, label: '压凸任务' },
      { value: TaskType.DIE_CUTTING, label: '模切任务' },
      { value: TaskType.PACKAGING, label: '包装任务' }
    ]
  }

  validateSplit(task: Record<string, unknown>, splits: Array<Record<string, unknown>>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!splits || splits.length < 2) {
      errors.push('至少需要拆分为 2 个子任务')
    }

    const totalQuantity = splits.reduce((sum: any, split: any) => sum + ((split.production_quantity as number) || 0), 0)

    if (totalQuantity !== task.production_quantity) {
      errors.push(`拆分后的总数量(${totalQuantity})必须等于原任务数量(${task.production_quantity})`)
    }

    splits.forEach((split, index) => {
      if (!split.production_quantity || (split.production_quantity as number) <= 0) {
        errors.push(`第 ${index + 1} 个子任务的数量必须大于 0`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  async exportTasks(filters: Record<string, unknown> = {}): Promise<ReturnType<BaseService['execute']>> {
    return this.execute(
      () => (this.apiClient as Record<string, (...args: unknown[]) => Promise<{ data: unknown }>>).export(filters),
      { showLoading: true }
    )
  }
}

const taskService = new TaskService()

export default taskService
