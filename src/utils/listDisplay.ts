import { formatDate } from './filter'
import { useRouter } from 'vue-router'

export function getItemKey(item: any): string {
  return item?.id || item?.number || item?.order_number || item?.invoice_number || JSON.stringify(item)
}

export function getItemNumber(item: any): string {
  return item?.number || item?.order_number || item?.invoice_number || item?.code || item?.name || '-'
}

export function getItemStatus(item: any): string {
  return item?.status_display || item?.status || item?.payment_status_display || ''
}

export function getItemAmount(item: any): string {
  const value = item?.total_amount ?? item?.amount
  return value === undefined || value === null ? '' : formatAmount(value)
}

export function getItemDate(item: any): string {
  return formatDate(item?.date || item?.order_date || item?.created_at)
}

export function openItem(router: ReturnType<typeof useRouter>, group: any, item: any): void {
  if (group.detailPrefix && item?.id) {
    router.push(`${group.detailPrefix}/${item.id}`)
    return
  }
  if (group.route) router.push(group.route)
}

function formatAmount(value: any): string {
  if (value === undefined || value === null || value === '') return '¥0.00'
  return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
