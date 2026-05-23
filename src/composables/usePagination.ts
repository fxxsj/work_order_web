import { ref } from 'vue'
import { ElMessage } from '@/utils/message'

interface UsePaginationOptions {
  immediate?: boolean
  pageSize?: number
  currentPageKey?: string
  pageSizeKey?: string
}

interface PaginatedResponse {
  results?: unknown[]
  data?: unknown[]
  count?: number
  total?: number
  success?: boolean
}

export function usePagination(
  fetchFn: (params: Record<string, unknown>) => Promise<PaginatedResponse | unknown>,
  options: UsePaginationOptions = {}
) {
  const {
    immediate = true,
    pageSize = 20,
    currentPageKey = 'page',
    pageSizeKey = 'page_size',
  } = options

  const loading = ref(false)
  const data = ref<any[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSizeValue = ref(pageSize)
  const params = ref<Record<string, unknown>>({})

  const fetchData = async (overrideParams?: unknown) => {
    loading.value = true
    try {
      const extra = (overrideParams && typeof overrideParams === 'object' ? overrideParams : {}) as Record<string, unknown>
      const queryParams = {
        [currentPageKey]: currentPage.value,
        [pageSizeKey]: pageSizeValue.value,
        ...params.value,
        ...extra,
      }

      const response = await fetchFn(queryParams) as any

      if (response?.success !== false) {
        const result = response?.data || response
        data.value = (result?.results || result?.data || []) as unknown[]
        total.value = result?.count || result?.total || data.value.length
      } else {
        data.value = []
        total.value = 0
      }
    } catch (error: any) {
      console.error('Fetch data failed:', error)
      ElMessage.error('获取数据失败')
      data.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (val: number) => {
    pageSizeValue.value = val
    currentPage.value = 1
    fetchData()
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    fetchData()
  }

  const refresh = () => {
    fetchData()
  }

  const setParams = (newParams: Record<string, unknown>) => {
    params.value = { ...newParams }
    currentPage.value = 1
  }

  const updateParams = (newParams: Record<string, unknown>) => {
    params.value = { ...params.value, ...newParams }
    currentPage.value = 1
  }

  if (immediate) {
    fetchData()
  }

  return {
    loading,
    data,
    total,
    currentPage,
    pageSize: pageSizeValue,
    params,
    fetchData,
    handleSizeChange,
    handleCurrentChange,
    refresh,
    setParams,
    updateParams,
  }
}
