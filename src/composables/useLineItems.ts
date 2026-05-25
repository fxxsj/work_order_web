/**
 * Composable for managing line item arrays in forms.
 * Provides common operations: add, remove, validate, calculate subtotals.
 */

import { computed, type Ref } from 'vue'

export interface UseLineItemsOptions<T extends Record<string, any>> {
  /** Factory for creating a default empty row */
  createDefault: () => T
  /** Minimum rows to keep (default: 1) */
  minCount?: number
  /** Determine if a row is empty/invalid (for filtering and validation) */
  isEmptyRow?: (item: T) => boolean
  /** Calculate amount for a single row */
  getLineAmount?: (item: T) => number
}

export interface UseLineItemsReturn<T extends Record<string, any>> {
  /** Add a default row to the items array */
  addItem: (items: T[]) => void
  /** Remove a row at index, respecting minCount */
  removeItem: (items: T[], index: number) => void
  /** Update specific fields on a row */
  updateItem: (items: T[], index: number, updates: Partial<T>) => void
  /** Get non-empty rows */
  getValidItems: (items: T[]) => T[]
  /** Check if at least one valid row exists */
  hasValidItems: (items: T[]) => boolean
  /** Compute subtotal from valid rows */
  calculateSubtotal: (items: T[]) => number
  /** Create a fresh default row */
  createDefaultItem: () => T
}

/**
 * Provides line item manipulation utilities for form editors.
 * Does NOT hold state — pass your own items array (e.g. from reactive form).
 */
export function useLineItems<T extends Record<string, any>>(
  options: UseLineItemsOptions<T>
): UseLineItemsReturn<T> {
  const {
    createDefault,
    minCount = 1,
    isEmptyRow = () => false,
    getLineAmount = () => 0,
  } = options

  const addItem = (items: T[]) => {
    items.push(createDefault())
  }

  const removeItem = (items: T[], index: number) => {
    if (items.length > minCount) {
      items.splice(index, 1)
    }
  }

  const updateItem = (items: T[], index: number, updates: Partial<T>) => {
    items[index] = { ...items[index], ...updates }
  }

  const getValidItems = (items: T[]) => items.filter(item => !isEmptyRow(item))

  const hasValidItems = (items: T[]) => getValidItems(items).length > 0

  const calculateSubtotal = (items: T[]) =>
    getValidItems(items).reduce((sum, item) => sum + getLineAmount(item), 0)

  return {
    addItem,
    removeItem,
    updateItem,
    getValidItems,
    hasValidItems,
    calculateSubtotal,
    createDefaultItem: createDefault,
  }
}

/**
 * Convenience composable that holds line items in a ref.
 * Useful when items are not embedded in a larger reactive form object.
 */
export function useLineItemsState<T extends Record<string, any>>(
  options: UseLineItemsOptions<T> & { initialItems?: T[] }
) {
  const { initialItems, ...lineItemOptions } = options
  const items = ref<T[]>(initialItems ?? [options.createDefault()]) as Ref<T[]>

  const utils = useLineItems(lineItemOptions)

  const addItem = () => utils.addItem(items.value)
  const removeItem = (index: number) => utils.removeItem(items.value, index)
  const updateItem = (index: number, updates: Partial<T>) =>
    utils.updateItem(items.value, index, updates)

  const validItems = computed(() => utils.getValidItems(items.value))
  const hasValidItems = computed(() => utils.hasValidItems(items.value))
  const subtotal = computed(() => utils.calculateSubtotal(items.value))

  const setItems = (newItems: T[]) => {
    items.value = newItems.length > 0 ? newItems : [options.createDefault()]
  }

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    validItems,
    hasValidItems,
    subtotal,
    setItems,
    createDefaultItem: utils.createDefaultItem,
  }
}
