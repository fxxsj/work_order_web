/**
 * filter 日期工具单元测试
 */

import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, formatTime, formatRelativeTime } from '@/utils/filter'

describe('filter 日期工具', () => {
  describe('formatDate', () => {
    it('应该格式化有效日期', () => {
      expect(formatDate('2026-05-22')).toBe('2026-05-22')
    })

    it('空值应该返回 -', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatDate(undefined)).toBe('-')
      expect(formatDate('')).toBe('-')
    })

    it('无效日期应该返回原始字符串', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date')
    })
  })

  describe('formatDateTime', () => {
    it('应该格式化有效日期时间', () => {
      expect(formatDateTime('2026-05-22T10:30:45')).toBe('2026-05-22 10:30:45')
    })

    it('空值应该返回 -', () => {
      expect(formatDateTime(null)).toBe('-')
      expect(formatDateTime(undefined)).toBe('-')
    })

    it('无效日期应该返回原始字符串', () => {
      expect(formatDateTime('invalid-date')).toBe('invalid-date')
    })
  })

  describe('formatTime', () => {
    it('应该格式化时间', () => {
      expect(formatTime('2026-05-22T10:30:45')).toBe('10:30:45')
    })

    it('空值应该返回 -', () => {
      expect(formatTime(null)).toBe('-')
    })

    it('无效时间应该返回原始字符串', () => {
      expect(formatTime('invalid-time')).toBe('invalid-time')
    })
  })

  describe('formatRelativeTime', () => {
    it('应该返回刚刚', () => {
      expect(formatRelativeTime(new Date())).toBe('刚刚')
    })

    it('空值应该返回 -', () => {
      expect(formatRelativeTime(null)).toBe('-')
    })

    it('无效日期应该返回原始字符串', () => {
      expect(formatRelativeTime('invalid-date')).toBe('invalid-date')
    })
  })
})
