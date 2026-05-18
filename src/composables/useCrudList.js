import { onUnmounted, ref } from 'vue'
import ErrorHandler from '@/utils/errorHandler'

const defaultResolveList = (response) => ({
  rows: response?.results ?? response?.data ?? response?.items ?? [],
  total: response?.count ?? response?.total ?? response?.pagination?.total_items ?? 0
})

/**
 * CRUD 列表 composable
 * @param {Object} apiInstance - API 实例（如 workOrderTaskAPI）
 * @param {string} methodName - API 方法名（如 'getList'）
 * @param {Object} options - 配置选项
 */
export function useCrudList(apiInstance, methodName, options = {}) {
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
    errorContext = '加载数据失败'
  } = options

  const searchText = ref(initialSearch)
  const filters = ref({ ...initialFilters })
  const tableData = ref([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)

  let searchTimer = null

  // 获取 API 方法（带正确的 this 绑定）
  const getFetchMethod = () => apiInstance[methodName].bind(apiInstance)

  const getParams = (overrideParams = {}) => {
    const baseParams = {
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

  const loadData = async (overrideParams = {}) => {
    loading.value = true
    try {
      const fetchMethod = getFetchMethod()
      const response = await fetchMethod(getParams(overrideParams))
      const payload = resolveList(response)
      tableData.value = payload.rows
      total.value = payload.total
      return response
    } catch (error) {
      ErrorHandler.showMessage(error, errorContext)
      tableData.value = []
      total.value = 0
      return null
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    currentPage.value = initialPage
    return loadData()
  }

  const handleSearchDebounced = () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(handleSearch, debounceMs)
  }

  const handlePageChange = (page) => {
    currentPage.value = page
    return loadData()
  }

  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = initialPage
    return loadData()
  }

  const resetFilters = (nextFilters = {}) => {
    searchText.value = initialSearch
    filters.value = { ...initialFilters, ...nextFilters }
    currentPage.value = initialPage
    return loadData()
  }

  const updateFilters = (nextFilters = {}, shouldSearch = false) => {
    filters.value = { ...filters.value, ...nextFilters }
    if (shouldSearch) return handleSearch()
    return null
  }

  onUnmounted(() => {
    clearTimeout(searchTimer)
  })

  return {
    searchText,
    filters,
    tableData,
    loading,
    total,
    currentPage,
    pageSize,
    loadData,
    handleSearch,
    handleSearchDebounced,
    handlePageChange,
    handleSizeChange,
    resetFilters,
    updateFilters
  }
}
