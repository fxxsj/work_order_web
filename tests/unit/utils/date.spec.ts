/**
 * 日期工具函数单元测试
 */

import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, formatDateTimeShort, getRelativeTime, isOverdue, isApproaching } from '@/utils/date'

describe('日期工具函数', () => {
  describe('formatDate', () => {
    it('应该格式化日期字符串', () => {
      const result = formatDate('2026-05-22')
      expect(result).toBe('2026-05-22')
    })

    it('应该处理 Date 对象', () => {
      const date = new Date('2026-05-22T10:30:00')
      const result = formatDate(date)
      expect(result).toBe('2026-05-22')
    })

    it('应该处理 null 和 undefined', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
    })

    it('应该处理无效日期', () => {
      expect(formatDate('invalid-date')).toBe('')
    })
  })

  describe('formatDateTime', () => {
    it('应该格式化日期时间字符串', () => {
      const result = formatDateTime('2026-05-22T10:30:45')
      expect(result).toBe('2026-05-22 10:30:45')
    })

    it('应该处理 Date 对象', () => {
      const date = new Date('2026-05-22T10:30:45')
      const result = formatDateTime(date)
      expect(result).toBe('2026-05-22 10:30:45')
    })

    it('应该处理 null 和 undefined', () => {
      expect(formatDateTime(null)).toBe('')
      expect(formatDateTime(undefined)).toBe('')
    })
  })

  describe('formatDateTimeShort', () => {
    it('应该格式化日期时间（无秒）', () => {
      const result = formatDateTimeShort('2026-05-22T10:30:45')
      expect(result).toBe('2026-05-22 10:30')
    })
  })

  describe('getRelativeTime', () => {
    it('应该返回 "今天" 对于今天的日期', () => {
      const today = new Date()
      expect(getRelativeTime(today)).toBe('今天')
    })

    it('应该返回 "明天" 对于明天的日期', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(getRelativeTime(tomorrow)).toBe('明天')
    })

    it('应该返回 "X天后" 对于一周内的日期', () => {
      const fiveDaysLater = new Date()
      fiveDaysLater.setDate(fiveDaysLater.getDate() + 5)
      expect(getRelativeTime(fiveDaysLater)).toBe('5天后')
    })

    it('应该返回 "已逾期X天" 对于过去的日期', () => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      expect(getRelativeTime(twoDaysAgo)).toBe('已逾期2天')
    })
  })

  describe('isOverdue', () => {
    it('过去的日期应该返回 true', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isOverdue(yesterday)).toBe(true)
    })

    it('今天的日期应该返回 false', () => {
      expect(isOverdue(new Date())).toBe(false)
    })

    it('未来的日期应该返回 false', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(isOverdue(tomorrow)).toBe(false)
    })

    it('null 应该返回 false', () => {
      expect(isOverdue(null)).toBe(false)
    })
  })

  describe('isApproaching', () => {
    it('3天内的日期应该返回 true', () => {
      const twoDaysLater = new Date()
      twoDaysLater.setDate(twoDaysLater.getDate() + 2)
      expect(isApproaching(twoDaysLater)).toBe(true)
    })

    it('超过3天的日期应该返回 false', () => {
      const tenDaysLater = new Date()
      tenDaysLater.setDate(tenDaysLater.getDate() + 10)
      expect(isApproaching(tenDaysLater)).toBe(false)
    })

    it('过去的日期应该返回 false', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isApproaching(yesterday)).toBe(false)
    })

    it('应该支持自定义天数阈值', () => {
      const fiveDaysLater = new Date()
      fiveDaysLater.setDate(fiveDaysLater.getDate() + 5)
      expect(isApproaching(fiveDaysLater, 7)).toBe(true)
    })
  })
})
