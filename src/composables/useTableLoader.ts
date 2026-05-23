/**
 * 通用表格数据加载 Composable
 * 统一处理分页、筛选、搜索防抖和请求取消
 */

import { ref, reactive, onUnmounted, toRaw } from 'vue'

interface PaginationState {
  page: number
  page_size: number
  total: number
  pages: number
}

interface TableLoaderOptions<T, P extends Record<string, unknown>> {
  fetchFn: (page: number, pageSize: number, params: P) => Promise<{ items: T[]; total: number; pages?: number }>
  initialParams?: P
  pageSize?: number
  debounceMs?: number
}

export function useTableLoader<T, P extends Record<string, unknown>>(options: TableLoaderOptions<T, P>) {
  const { fetchFn, initialParams, pageSize, debounceMs = 300 } = options

  const items = ref<T[]>([])
  const loading = ref(false)
  const params = reactive<P>({ ...(initialParams || {}) } as P)
  const pagination = reactive<PaginationState>({
    page: 1,
    page_size: pageSize ?? 20,
    total: 0,
    pages: 0
  })

  let abortController: AbortController | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const isAbortError = (error: any) => {
    return error?.name === 'AbortError' || error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError'
  }

  const clearTimer = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  const load = async () => {
    if (abortController) {
      abortController.abort()
    }
    const currentController = new AbortController()
    abortController = currentController
    loading.value = true

    try {
      const response = await fetchFn(
        pagination.page,
        pagination.page_size,
        toRaw(params) as P
      )

      items.value = response.items || []
      pagination.total = response.total || 0
      pagination.pages = response.pages || 0
    } catch (error: any) {
      if (!isAbortError(error)) {
        console.error('Table load error:', error)
        throw error
      }
    } finally {
      if (abortController === currentController) {
        loading.value = false
      }
    }
  }

  const reload = () => {
    pagination.page = 1
    return load()
  }

  const debouncedReload = () => {
    clearTimer()
    debounceTimer = setTimeout(() => {
      reload()
    }, debounceMs)
  }

  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, pagination.pages || 1))
    pagination.page = validPage
    load()
  }

  const handlePageSizeChange = (size: number) => {
    pagination.page_size = size
    pagination.page = 1
    load()
  }

  onUnmounted(() => {
    abortController?.abort()
    clearTimer()
  })

  return {
    items,
    loading,
    params,
    pagination,
    load,
    reload,
    debouncedReload,
    handlePageChange,
    handlePageSizeChange
  }
}
