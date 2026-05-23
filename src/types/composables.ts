/**
 * Composables 类型定义
 */

import type { ComputedRef, Ref } from 'vue'

// ============ useCrudList ============

export interface CrudListOptions<T> {
  api: {
    getList: (params?: Record<string, unknown>) => Promise<{ results: T[]; count: number } | T[]>
    getDetail?: (id: number | string) => Promise<T>
    create?: (data: Partial<T>) => Promise<T>
    update?: (id: number | string, data: Partial<T>) => Promise<T>
    delete?: (id: number | string) => Promise<void>
  }
  initialParams?: Record<string, unknown>
  pagination?: boolean
  immediate?: boolean
}

export interface UseCrudListReturn<T> {
  data: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  params: Ref<Record<string, unknown>>
  total: Ref<number>
  page: Ref<number>
  pageSize: Ref<number>
  load: (overrideParams?: Record<string, unknown>) => Promise<void>
  reload: () => Promise<void>
  resetParams: () => void
  setPage: (p: number) => void
  setPageSize: (size: number) => void
}

// ============ useTableSelection ============

export interface UseTableSelectionReturn<T> {
  selected: Ref<T[]>
  isSelected: (item: T) => boolean
  isAllSelected: ComputedRef<boolean>
  isIndeterminate: ComputedRef<boolean>
  toggle: (item: T) => void
  toggleAll: (items: T[]) => void
  select: (item: T) => void
  deselect: (item: T) => void
  clear: () => void
}

// ============ useNavigationLoading ============

export interface UseNavigationLoadingReturn {
  isNavigating: Ref<boolean>
  startNavigation: () => void
  endNavigation: () => void
}

// ============ useTableLoader ============

export interface UseTableLoaderOptions {
  onLoad: (params: Record<string, unknown>) => Promise<unknown>
  immediate?: boolean
}

export interface UseTableLoaderReturn {
  data: Ref<unknown[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  total: Ref<number>
  params: Ref<Record<string, unknown>>
  load: (params?: Record<string, unknown>) => Promise<void>
  reload: () => Promise<void>
}
