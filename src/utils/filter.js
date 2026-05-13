import dayjs from 'dayjs'

export function formatDate(value) {
  if (!value) return '-'
  const date = dayjs(value)
  if (!date.isValid()) return value
  return date.format('YYYY-MM-DD')
}

export function formatDateTime(value) {
  if (!value) return '-'
  const date = dayjs(value)
  if (!date.isValid()) return value
  return date.format('YYYY-MM-DD HH:mm:ss')
}

export function formatTime(value) {
  if (!value) return '-'
  const date = dayjs(value)
  if (!date.isValid()) return value
  return date.format('HH:mm:ss')
}

export function formatRelativeTime(value) {
  if (!value) return '-'
  const date = dayjs(value)
  if (!date.isValid()) return value

  const now = dayjs()
  const diff = now.diff(date, 'minute')

  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  if (diff < 10080) return `${Math.floor(diff / 1440)}天前`
  return date.format('YYYY-MM-DD')
}
