/**
 * 日期工具函数
 * 提供格式化、相对时间、逾期判断等功能
 */

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return ''
  const date = dayjs(value)
  if (!date.isValid()) return ''
  return date.format('YYYY-MM-DD')
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (!value) return ''
  const date = dayjs(value)
  if (!date.isValid()) return ''
  return date.format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm（无秒）
 */
export function formatDateTimeShort(value: string | number | Date | null | undefined): string {
  if (!value) return ''
  const date = dayjs(value)
  if (!date.isValid()) return ''
  return date.format('YYYY-MM-DD HH:mm')
}

/**
 * 获取相对时间描述
 * 今天、明天、X天后、已逾期X天
 */
export function getRelativeTime(value: string | number | Date | null | undefined): string {
  if (!value) return ''
  const date = dayjs(value)
  if (!date.isValid()) return ''

  const now = dayjs()
  const today = now.startOf('day')
  const targetDay = date.startOf('day')
  const diffDays = targetDay.diff(today, 'day')

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays === -1) return '昨天'
  if (diffDays > 0 && diffDays <= 7) return `${diffDays}天后`
  if (diffDays < 0) return `已逾期${Math.abs(diffDays)}天`
  if (diffDays > 7) return date.format('YYYY-MM-DD')

  return date.fromNow()
}

/**
 * 判断日期是否已逾期（早于今天）
 */
export function isOverdue(value: string | number | Date | null | undefined): boolean {
  if (!value) return false
  const date = dayjs(value)
  if (!date.isValid()) return false
  const today = dayjs().startOf('day')
  return date.isBefore(today)
}

/**
 * 判断日期是否即将到来（距离今天N天内）
 * @param value 日期值
 * @param days 天数阈值，默认3天
 */
export function isApproaching(value: string | number | Date | null | undefined, days: number = 3): boolean {
  if (!value) return false
  const date = dayjs(value)
  if (!date.isValid()) return false
  const today = dayjs().startOf('day')
  const targetDay = date.startOf('day')
  const diffDays = targetDay.diff(today, 'day')
  return diffDays >= 0 && diffDays <= days
}
