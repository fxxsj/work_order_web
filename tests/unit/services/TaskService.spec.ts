/**
 * TaskService 单元测试
 */

import { describe, it, expect } from 'vitest'
import taskService, { TaskStatus, TaskType } from '@/services/TaskService'

describe('TaskService', () => {
  describe('TaskStatus 常量', () => {
    it('应该定义正确的状态值', () => {
      expect(TaskStatus.PENDING).toBe('pending')
      expect(TaskStatus.IN_PROGRESS).toBe('in_progress')
      expect(TaskStatus.COMPLETED).toBe('completed')
      expect(TaskStatus.CANCELLED).toBe('cancelled')
    })
  })

  describe('TaskType 常量', () => {
    it('应该定义正确的类型值', () => {
      expect(TaskType.GENERAL).toBe('general')
      expect(TaskType.PLATE_MAKING).toBe('plate_making')
      expect(TaskType.CUTTING).toBe('cutting')
      expect(TaskType.PRINTING).toBe('printing')
      expect(TaskType.FOILING).toBe('foiling')
      expect(TaskType.EMBOSSING).toBe('embossing')
      expect(TaskType.DIE_CUTTING).toBe('die_cutting')
      expect(TaskType.PACKAGING).toBe('packaging')
    })
  })

  describe('calculateProgress', () => {
    it('应该正确计算进度', () => {
      const task = {
        production_quantity: 100,
        quantity_completed: 50
      }
      expect(taskService.calculateProgress(task)).toBe(50)
    })

    it('应该处理零产量', () => {
      const task = {
        production_quantity: 0,
        quantity_completed: 0
      }
      expect(taskService.calculateProgress(task)).toBe(0)
    })

    it('不应该超过100%', () => {
      const task = {
        production_quantity: 100,
        quantity_completed: 150
      }
      expect(taskService.calculateProgress(task)).toBe(100)
    })

    it('应该四舍五入到整数', () => {
      const task = {
        production_quantity: 3,
        quantity_completed: 1
      }
      expect(taskService.calculateProgress(task)).toBe(33)
    })
  })

  describe('canComplete', () => {
    it('已完成任务不能再次完成', () => {
      const task = { status: TaskStatus.COMPLETED }
      expect(taskService.canComplete(task)).toBe(false)
    })

    it('已取消任务不能再次完成', () => {
      const task = { status: TaskStatus.CANCELLED }
      expect(taskService.canComplete(task)).toBe(false)
    })

    it('待处理/进行中任务可以完成', () => {
      const task = { status: TaskStatus.PENDING }
      expect(taskService.canComplete(task)).toBe(true)

      const task2 = { status: TaskStatus.IN_PROGRESS }
      expect(taskService.canComplete(task2)).toBe(true)
    })

    it('制版任务需要确认图稿', () => {
      const taskWithUnconfirmedArtwork = {
        status: TaskStatus.IN_PROGRESS,
        task_type: TaskType.PLATE_MAKING,
        artwork: { confirmed: false }
      }
      expect(taskService.canComplete(taskWithUnconfirmedArtwork)).toBe(false)

      const taskWithConfirmedArtwork = {
        status: TaskStatus.IN_PROGRESS,
        task_type: TaskType.PLATE_MAKING,
        artwork: { confirmed: true }
      }
      expect(taskService.canComplete(taskWithConfirmedArtwork)).toBe(true)
    })
  })

  describe('getCannotCompleteReason', () => {
    it('应该返回已完成原因', () => {
      const task = { status: TaskStatus.COMPLETED }
      expect(taskService.getCannotCompleteReason(task)).toBe('任务已完成')
    })

    it('应该返回已取消原因', () => {
      const task = { status: TaskStatus.CANCELLED }
      expect(taskService.getCannotCompleteReason(task)).toBe('任务已取消')
    })

    it('应该返回图稿未确认原因', () => {
      const task = {
        status: TaskStatus.IN_PROGRESS,
        task_type: TaskType.PLATE_MAKING,
        artwork: { confirmed: false }
      }
      expect(taskService.getCannotCompleteReason(task)).toBe('需要确认图稿')
    })
  })

  describe('getTaskDeadline', () => {
    it('应该返回任务自己的截止日期', () => {
      const task = { deadline: '2024-12-31' }
      expect(taskService.getTaskDeadline(task)).toBe('2024-12-31')
    })

    it('应该从施工单获取截止日期', () => {
      const task = {
        deadline: null,
        work_order_process_info: {
          work_order: { delivery_date: '2024-12-31' }
        }
      }
      expect(taskService.getTaskDeadline(task)).toBe('2024-12-31')
    })

    it('null 任务应该返回 null', () => {
      expect(taskService.getTaskDeadline(null)).toBeNull()
    })
  })

  describe('isOverdue', () => {
    it('已过期应该返回 true', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const task = {
        status: TaskStatus.IN_PROGRESS,
        deadline: yesterday.toISOString()
      }
      expect(taskService.isOverdue(task)).toBe(true)
    })

    it('未过期应该返回 false', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const task = {
        status: TaskStatus.IN_PROGRESS,
        deadline: tomorrow.toISOString()
      }
      expect(taskService.isOverdue(task)).toBe(false)
    })

    it('已完成任务不应该显示为过期', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const task = {
        status: TaskStatus.COMPLETED,
        deadline: yesterday.toISOString()
      }
      expect(taskService.isOverdue(task)).toBe(false)
    })
  })

  describe('getRemainingDays', () => {
    it('应该返回剩余天数', () => {
      const threeDaysLater = new Date()
      threeDaysLater.setDate(threeDaysLater.getDate() + 3)

      const task = {
        status: TaskStatus.IN_PROGRESS,
        deadline: threeDaysLater.toISOString()
      }
      expect(taskService.getRemainingDays(task)).toBe(3)
    })

    it('过期应该返回负数', () => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      const task = {
        status: TaskStatus.IN_PROGRESS,
        deadline: twoDaysAgo.toISOString()
      }
      expect(taskService.getRemainingDays(task)).toBe(-2)
    })

    it('无截止日期应该返回 null', () => {
      const task = { status: TaskStatus.IN_PROGRESS }
      expect(taskService.getRemainingDays(task)).toBeNull()
    })

    it('已完成任务应该返回 null', () => {
      const threeDaysLater = new Date()
      threeDaysLater.setDate(threeDaysLater.getDate() + 3)

      const task = {
        status: TaskStatus.COMPLETED,
        deadline: threeDaysLater.toISOString()
      }
      expect(taskService.getRemainingDays(task)).toBeNull()
    })
  })

  describe('getStatusText', () => {
    it('应该返回正确的状态文本', () => {
      expect(taskService.getStatusText('pending')).toBe('待开始')
      expect(taskService.getStatusText('in_progress')).toBe('进行中')
      expect(taskService.getStatusText('completed')).toBe('已完成')
      expect(taskService.getStatusText('cancelled')).toBe('已取消')
    })

    it('未知状态应该原样返回', () => {
      expect(taskService.getStatusText('unknown')).toBe('unknown')
    })
  })

  describe('getTypeText', () => {
    it('应该返回正确的类型文本', () => {
      expect(taskService.getTypeText('general')).toBe('通用任务')
      expect(taskService.getTypeText('plate_making')).toBe('制版任务')
      expect(taskService.getTypeText('cutting')).toBe('开料任务')
      expect(taskService.getTypeText('printing')).toBe('印刷任务')
    })
  })

  describe('getStatusColor', () => {
    it('应该返回正确的颜色值', () => {
      expect(taskService.getStatusColor('pending')).toBe('info')
      expect(taskService.getStatusColor('in_progress')).toBe('warning')
      expect(taskService.getStatusColor('completed')).toBe('success')
      expect(taskService.getStatusColor('cancelled')).toBe('danger')
    })
  })

  describe('formatDateTime', () => {
    it('应该格式化日期时间字符串', () => {
      const result = taskService.formatDateTime('2024-06-15T10:30:45')
      expect(result).toBe('2024-06-15 10:30:45')
    })

    it('应该处理无效日期', () => {
      expect(taskService.formatDateTime('invalid')).toBe('')
    })

    it('应该处理 null/undefined', () => {
      expect(taskService.formatDateTime(null)).toBe('')
      expect(taskService.formatDateTime(undefined)).toBe('')
    })
  })

  describe('getStatusOptions', () => {
    it('应该返回所有状态选项', () => {
      const options = taskService.getStatusOptions()
      expect(options).toHaveLength(4)
      expect(options[0].value).toBe('pending')
      expect(options[1].value).toBe('in_progress')
    })
  })

  describe('getTaskTypeOptions', () => {
    it('应该返回所有任务类型选项', () => {
      const options = taskService.getTaskTypeOptions()
      expect(options).toHaveLength(8)
      expect(options[0].value).toBe('general')
    })
  })

  describe('validateSplit', () => {
    it('应该验证有效的拆分', () => {
      const task = { production_quantity: 100 }
      const splits = [
        { production_quantity: 60 },
        { production_quantity: 40 }
      ]

      const result = taskService.validateSplit(task, splits)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝数量不匹配', () => {
      const task = { production_quantity: 100 }
      const splits = [
        { production_quantity: 50 },
        { production_quantity: 30 }
      ]

      const result = taskService.validateSplit(task, splits)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('总数量')
    })

    it('应该拒绝无效的拆分数量', () => {
      const task = { production_quantity: 100 }
      const splits = [
        { production_quantity: 0 },
        { production_quantity: 100 }
      ]

      const result = taskService.validateSplit(task, splits)
      expect(result.valid).toBe(false)
    })
  })
})
