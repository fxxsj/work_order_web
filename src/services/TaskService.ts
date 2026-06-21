/**
 * 任务业务逻辑服务
 *
 * 处理任务相关的业务逻辑，将业务逻辑从 Vue 组件中分离（纯工具函数集合，不再承担 API 调用）。
 */

import { formatDateTime } from '@/utils/date'

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

class TaskService {
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
    return formatDateTime(dateTime)
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
}

const taskService = new TaskService()

export default taskService
export { TaskService }
