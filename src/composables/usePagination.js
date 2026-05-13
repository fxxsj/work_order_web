import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export function usePagination(fetchFn, options = {}) {
  const {
    immediate = true,
    pageSize = 20,
    currentPageKey = 'page',
    pageSizeKey = 'page_size',
  } = options

  const loading = ref(false)
  const data = ref([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSizeValue = ref(pageSize)

  const params = ref({})

  const fetchData = async (overrideParams = {}) => {
    loading.value = true
    try {
      const queryParams = {
        [currentPageKey]: currentPage.value,
        [pageSizeKey]: pageSizeValue.value,
        ...params.value,
        ...overrideParams,
      }

      const response = await fetchFn(queryParams)

      if (response?.success !== false) {
        const result = response?.data || response
        data.value = result?.results || result?.data || []
        total.value = result?.count || result?.total || data.value.length
      } else {
        data.value = []
        total.value = 0
      }
    } catch (error) {
      console.error('Fetch data failed:', error)
      ElMessage.error('获取数据失败')
      data.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (val) => {
    pageSizeValue.value = val
    currentPage.value = 1
    fetchData()
  }

  const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchData()
  }

  const refresh = () => {
    fetchData()
  }

  const setParams = (newParams) => {
    params.value = { ...newParams }
    currentPage.value = 1
  }

  const updateParams = (newParams) => {
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
