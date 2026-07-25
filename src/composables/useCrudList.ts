import { computed, getCurrentInstance, onUnmounted, ref, type Ref } from 'vue'
import ErrorHandler from '@/utils/errorHandler'

export interface ListResponse<T> {
  rows: T[]
  total: number
}

export interface UseCrudListOptions<T> {
  initialPage?: number
  initialPageSize?: number
  initialSearch?: string
  initialFilters?: Record<string, unknown>
  searchKey?: string
  pageKey?: string
  pageSizeKey?: string
  debounceMs?: number
  omitEmpty?: boolean
  buildParams?: (params: Record<string, unknown>) => Record<string, unknown>
  resolveList?: (response: unknown) => ListResponse<T>
  errorContext?: string
  /** LocalStorage key for persisting page size preference */
  persistedPageSizeKey?: string
  /** Enable request cancellation on rapid changes */
  enableAbort?: boolean
}

const DEFAULT_PAGE_SIZE_STORAGE_KEY = 'app-page-size'

function getPersistedPageSize(key: string): number | null {
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (!isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }
  } catch {
    // localStorage not available
  }
  return null
}

function setPersistedPageSize(key: string, size: number): void {
  try {
    localStorage.setItem(key, String(size))
  } catch {
    // localStorage not available
  }
}

const defaultResolveList = <T>(response: unknown): ListResponse<T> => {
  const r = response as Record<string, unknown>
  return {
    rows: (r?.results ?? r?.data ?? r?.items ?? []) as T[],
    total: (r?.count ?? r?.total ?? (r?.pagination as Record<string, unknown>)?.total_items ?? 0) as number
  }
}

export function useCrudList<T = any>(
  apiInstance: Record<string, (...args: any[]) => Promise<unknown>>,
  methodName: string,
  options: UseCrudListOptions<T> = {}
) {
  const {
    initialPage = 1,
    initialPageSize = 20,
    initialSearch = '',
    initialFilters = {},
    searchKey = 'search',
    pageKey = 'page',
    pageSizeKey = 'page_size',
    debounceMs = 300,
    omitEmpty = true,
    buildParams,
    resolveList = defaultResolveList,
    errorContext = '加载数据失败',
    persistedPageSizeKey = DEFAULT_PAGE_SIZE_STORAGE_KEY,
    enableAbort = true
  } = options

  // Resolve initial page size with persistence
  const getInitialPageSize = () => {
    if (persistedPageSizeKey) {
      const saved = getPersistedPageSize(persistedPageSizeKey)
      if (saved !== null) return saved
    }
    return initialPageSize
  }

  const searchText = ref(initialSearch)
  const filters = ref<Record<string, any>>({ ...initialFilters })
  const tableData: Ref<T[]> = ref<any[]>([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(initialPage)
  const pageSize = ref(getInitialPageSize())

  let searchTimer: ReturnType<typeof setTimeout> | null = null
  let abortController: AbortController | null = null

  // 获取 API 方法（带正确的 this 绑定）
  const getFetchMethod = () => apiInstance[methodName].bind(apiInstance)

  const getParams = (overrideParams: Record<string, unknown> = {}) => {
    const baseParams: Record<string, unknown> = {
      [pageKey]: currentPage.value,
      [pageSizeKey]: pageSize.value,
      ...filters.value
    }

    if (searchText.value) {
      baseParams[searchKey] = searchText.value
    }

    const normalizedParams = omitEmpty
      ? Object.fromEntries(
          Object.entries(baseParams).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        )
      : baseParams

    const params = buildParams ? buildParams(normalizedParams) : normalizedParams
    return { ...params, ...overrideParams }
  }

  const loadData = async (overrideParams?: unknown) => {
    // Cancel any in-flight request
    if (enableAbort && abortController) {
      abortController.abort()
    }

    // 用局部变量记录本次请求的 controller，catch / finally 中只判断它，
    // 避免下一次 loadData() 已把闭包 abortController 换成新实例后，旧请求的取消被漏判
    let currentController: AbortController | null = null

    loading.value = true
    try {
      if (enableAbort) {
        currentController = new AbortController()
        abortController = currentController
      }

      const fetchMethod = getFetchMethod()
      const extra = (overrideParams && typeof overrideParams === 'object' ? overrideParams : {}) as Record<string, unknown>

      // Build params
      const params = getParams(extra)

      // Build config with signal for abort
      const config: { signal?: AbortSignal } = {}
      if (enableAbort && currentController) {
        config.signal = currentController.signal
      }

      // Call fetchMethod with params and config (for signal support)
      const response = await fetchMethod(params, config) as unknown

      // Check if aborted
      if (enableAbort && currentController?.signal.aborted) {
        return null
      }

      const payload = resolveList(response)
      tableData.value = payload.rows
      total.value = payload.total
      return response
    } catch (error: any) {
      // Ignore abort errors：优先判断本次请求的 controller，再用 ErrorHandler.isCancelError 兜底
      if (currentController?.signal.aborted || ErrorHandler.isCancelError(error)) {
        return null
      }
      ErrorHandler.showMessage(error, errorContext)
      tableData.value = []
      total.value = 0
      return null
    } finally {
      // 只有当前请求仍是最新请求时才关闭 loading，避免被取消的旧请求把 loading 重置为 false
      if (!enableAbort || !currentController || abortController === currentController) {
        loading.value = false
      }
    }
  }

  const handleSearch = () => {
    currentPage.value = initialPage
    return loadData()
  }

  const handleSearchDebounced = () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(handleSearch, debounceMs)
  }

  const handlePageChange = (page: number) => {
    currentPage.value = page
    return loadData()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = initialPage
    // Persist page size preference
    if (persistedPageSizeKey) {
      setPersistedPageSize(persistedPageSizeKey, size)
    }
    return loadData()
  }

  const resetFilters = (nextFilters?: unknown) => {
    const extra = (nextFilters && typeof nextFilters === 'object' ? nextFilters : {}) as Record<string, unknown>
    searchText.value = initialSearch
    filters.value = { ...initialFilters, ...extra }
    currentPage.value = initialPage
    return loadData()
  }

  const updateFilters = (nextFilters?: unknown, shouldSearch = false) => {
    const extra = (nextFilters && typeof nextFilters === 'object' ? nextFilters : {}) as Record<string, unknown>
    filters.value = { ...filters.value, ...extra }
    if (shouldSearch) return handleSearch()
    return null
  }

  const hasFilters = computed(() =>
    Object.values(filters.value).some((v: any) => v !== '' && v !== null && v !== undefined)
  )

  // Only register onUnmounted when used within a component context
  // This prevents warnings when the composable is used outside of setup() (e.g., in tests)
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (searchTimer) clearTimeout(searchTimer)
      if (abortController) {
        abortController.abort()
      }
    })
  }

  return {
    searchText,
    filters,
    tableData,
    loading,
    total,
    currentPage,
    pageSize,
    hasFilters,
    loadData,
    handleSearch,
    handleSearchDebounced,
    handlePageChange,
    handleSizeChange,
    resetFilters,
    updateFilters
  }
}
