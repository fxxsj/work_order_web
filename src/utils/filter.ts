import dayjs from 'dayjs'
import { formatDate as formatDateBase, formatDateTime as formatDateTimeBase } from './date'

export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return '-'
  const formatted = formatDateBase(value, { fallback: '' })
  return formatted === '' ? String(value) : formatted
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (!value) return '-'
  const formatted = formatDateTimeBase(value, { fallback: '' })
  return formatted === '' ? String(value) : formatted
}

export function formatTime(value: string | number | Date | null | undefined): string {
  if (!value) return '-'
  const date = dayjs(value)
  if (!date.isValid()) return String(value)
  return date.format('HH:mm:ss')
}

export function formatRelativeTime(value: string | number | Date | null | undefined): string {
  if (!value) return '-'
  const date = dayjs(value)
  if (!date.isValid()) return String(value)

  const now = dayjs()
  const diff = now.diff(date, 'minute')

  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  if (diff < 10080) return `${Math.floor(diff / 1440)}天前`
  return date.format('YYYY-MM-DD')
}
