import { ref, reactive } from 'vue'
import { useUIStore } from '@/stores/ui'
import ErrorHandler from '@/utils/errorHandler'

interface ExportJobFilters {
  status?: string
  user_id?: string
  start_date?: string
  end_date?: string
}

interface ExportJobOptions {
  /** API method to create an export job */
  createExport: (payload: Record<string, any>) => Promise<any>
  /** API method to list export jobs */
  getExportList: (params: Record<string, any>) => Promise<any>
  /** API method to download an export file */
  downloadExport: (id: number | string) => Promise<any>
  /** Context label for error messages */
  errorContext?: string
  /** Default page size */
  pageSize?: number
}

/**
 * Composable for managing export job lifecycle: create, list, paginate, download.
 * Reusable across any module that supports async export jobs.
 */
export function useExportJob(options: ExportJobOptions) {
  const {
    createExport,
    getExportList,
    downloadExport,
    errorContext = 'ExportJob',
    pageSize: defaultPageSize = 20
  } = options

  // Create export dialog state
  const dialogVisible = ref(false)
  const loading = ref(false)
  const startDate = ref('')
  const endDate = ref('')
  const filters = reactive<Record<string, string>>({})

  // Export list state
  const listVisible = ref(false)
  const listLoading = ref(false)
  const list = ref<any[]>([])
  const listPage = ref(1)
  const listPageSize = ref(defaultPageSize)
  const listTotal = ref(0)
  const listFilters = reactive<ExportJobFilters>({})

  // Open export creation dialog
  const openDialog = () => {
    dialogVisible.value = true
    startDate.value = ''
    endDate.value = ''
    Object.keys(filters).forEach(key => { filters[key] = '' })
  }

  // Submit export creation
  const submitExport = async (extraFilters?: Record<string, any>) => {
    loading.value = true
    try {
      const activeFilters: Record<string, any> = {}
      if (extraFilters) {
        Object.entries(extraFilters).forEach(([key, value]) => {
          if (value) activeFilters[key] = value
        })
      }

      const payload = {
        start_date: startDate.value,
        end_date: endDate.value,
        filters: activeFilters
      }

      const response: any = await createExport(payload)
      const exportInfo = response?.data || response?.results || response || {}
      useUIStore().showSuccess(`导出任务已创建: ${exportInfo?.export_id || '-'}`)
      dialogVisible.value = false
    } catch (error: any) {
      ErrorHandler.handle(error, `${errorContext}.submitExport`)
      useUIStore().showError('创建导出任务失败')
    } finally {
      loading.value = false
    }
  }

  // Open export list dialog
  const openList = async () => {
    listVisible.value = true
    listPage.value = 1
    await loadList()
  }

  // Load export list with pagination and filters
  const loadList = async () => {
    listLoading.value = true
    try {
      const params: Record<string, any> = {
        page: listPage.value,
        page_size: listPageSize.value
      }
      if (listFilters.status) params.status = listFilters.status
      if (listFilters.user_id) params.user_id = listFilters.user_id
      if (listFilters.start_date) params.start_date = listFilters.start_date
      if (listFilters.end_date) params.end_date = listFilters.end_date

      const response: any = await getExportList(params)
      const payload = response || {}
      list.value = Array.isArray(payload) ? payload : (payload?.results || payload?.data || payload?.items || [])
      listTotal.value = payload?.count || payload?.pagination?.total_items || 0
    } catch (error: any) {
      ErrorHandler.handle(error, `${errorContext}.loadList`)
      useUIStore().showError('加载导出记录失败')
    } finally {
      listLoading.value = false
    }
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    listPage.value = page
    loadList()
  }

  const handlePageSizeChange = (size: number) => {
    listPageSize.value = size
    listPage.value = 1
    loadList()
  }

  // Download a completed export file
  const download = async (row: any) => {
    try {
      const blob: any = await downloadExport(row.id)
      const filename = getFilename(row)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      ErrorHandler.handle(error, `${errorContext}.download`)
      useUIStore().showError('下载导出文件失败')
    }
  }

  const getFilename = (row: any) => {
    if (row.file_path) {
      const parts = String(row.file_path).split('/')
      return parts[parts.length - 1]
    }
    return `export_${row.id}.csv`
  }

  return {
    // Create dialog
    dialogVisible,
    loading,
    startDate,
    endDate,
    filters,
    openDialog,
    submitExport,

    // Export list
    listVisible,
    listLoading,
    list,
    listPage,
    listPageSize,
    listTotal,
    listFilters,
    openList,
    loadList,
    handlePageChange,
    handlePageSizeChange,

    // Download
    download
  }
}
