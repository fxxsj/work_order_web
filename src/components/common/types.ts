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