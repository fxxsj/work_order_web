/**
 * Common component types
 */

export interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  className?: string
  class?: string
  formatter?: (value: any, row: any) => string
}

export type RowActionTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export interface RowAction {
  key: string
  label: string
  icon: string
  tone?: RowActionTone
  visible?: boolean
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
  title?: string
}
