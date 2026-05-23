/**
 * 表格行选择组合式函数
 * 基于 Set 的高性能行选择，支持全选、反选、批量操作
 */

import { computed, ref, type Ref, type ComputedRef } from 'vue'

export interface UseTableSelectionOptions<T> {
  rows: Ref<T[]>
  getId: (row: T) => number
}

export interface UseTableSelectionReturn<T> {
  /** 当前选中的 ID 集合 */
  selectedSet: Ref<Set<number>>
  /** 选中的 ID 数组 */
  selectedIds: ComputedRef<number[]>
  /** 选中数量 */
  selectedCount: ComputedRef<number>
  /** 当前页是否全选 */
  allVisibleSelected: ComputedRef<boolean>
  /** 指定 ID 是否选中 */
  isSelected: (id: number) => boolean
  /** 直接设置选中 ID 列表 */
  setSelectedIds: (ids: number[]) => void
  /** 选中单个 */
  select: (id: number) => void
  /** 取消选中单个 */
  deselect: (id: number) => void
  /** 切换单个选中状态 */
  toggle: (id: number) => void
  /** 清空所有选中 */
  clear: () => void
  /** 批量移除 */
  removeMany: (ids: number[]) => void
  /** 切换当前页全选 */
  toggleVisible: (checked: boolean) => void
  /** 选中当前页所有 */
  selectVisible: () => void
  /** 批量更新 */
  batchUpdate: (updater: (draft: Set<number>) => void) => void
}

export function useTableSelection<T>({ rows, getId }: UseTableSelectionOptions<T>): UseTableSelectionReturn<T> {
  const selectedSet = ref<Set<number>>(new Set())

  const selectedIds = computed(() => Array.from(selectedSet.value))
  const selectedCount = computed(() => selectedSet.value.size)

  const isSelected = (id: number) => selectedSet.value.has(id)

  const replaceSelectedSet = (next: Set<number>) => {
    selectedSet.value = next
  }

  const setSelectedIds = (ids: number[]) => {
    selectedSet.value = new Set(ids)
  }

  const select = (id: number) => {
    if (selectedSet.value.has(id)) return
    const next = new Set(selectedSet.value)
    next.add(id)
    replaceSelectedSet(next)
  }

  const deselect = (id: number) => {
    if (!selectedSet.value.has(id)) return
    const next = new Set(selectedSet.value)
    next.delete(id)
    replaceSelectedSet(next)
  }

  const toggle = (id: number) => {
    if (selectedSet.value.has(id)) {
      deselect(id)
      return
    }
    select(id)
  }

  const clear = () => {
    if (selectedSet.value.size === 0) return
    replaceSelectedSet(new Set())
  }

  const removeMany = (ids: number[]) => {
    if (ids.length === 0 || selectedSet.value.size === 0) return
    const next = new Set(selectedSet.value)
    let changed = false
    ids.forEach((id: any) => {
      if (next.delete(id)) changed = true
    })
    if (changed) replaceSelectedSet(next)
  }

  const allVisibleSelected = computed(() => {
    if (rows.value.length === 0) return false
    return rows.value.every((row: any) => selectedSet.value.has(getId(row)))
  })

  const toggleVisible = (checked: boolean) => {
    const next = new Set(selectedSet.value)
    rows.value.forEach((row: any) => {
      const id = getId(row)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
    })
    replaceSelectedSet(next)
  }

  const selectVisible = () => {
    toggleVisible(true)
  }

  const batchUpdate = (updater: (draft: Set<number>) => void) => {
    const draft = new Set(selectedSet.value)
    updater(draft)
    replaceSelectedSet(draft)
  }

  return {
    selectedSet,
    selectedIds,
    selectedCount,
    allVisibleSelected,
    isSelected,
    setSelectedIds,
    select,
    deselect,
    toggle,
    clear,
    removeMany,
    toggleVisible,
    selectVisible,
    batchUpdate
  }
}
