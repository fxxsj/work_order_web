/**
 * useExportJob Composable 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useExportJob } from '@/composables/useExportJob'

const mockUIStore = vi.hoisted(() => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showWarning: vi.fn(),
  showInfo: vi.fn(),
}))

// Mock ErrorHandler
vi.mock('@/utils/errorHandler', () => ({
  default: {
    handle: vi.fn(),
  },
}))

vi.mock('@/stores/ui', () => ({
  useUIStore: vi.fn(() => mockUIStore),
}))

import ErrorHandler from '@/utils/errorHandler'

describe('useExportJob', () => {
  const createMockOptions = () => ({
    createExport: vi.fn(),
    getExportList: vi.fn(),
    downloadExport: vi.fn(),
    errorContext: 'TestExport',
    pageSize: 10,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const options = createMockOptions()
      const {
        dialogVisible,
        loading,
        startDate,
        endDate,
        listVisible,
        listLoading,
        list,
        listPage,
        listPageSize,
        listTotal,
      } = useExportJob(options)

      expect(dialogVisible.value).toBe(false)
      expect(loading.value).toBe(false)
      expect(startDate.value).toBe('')
      expect(endDate.value).toBe('')
      expect(listVisible.value).toBe(false)
      expect(listLoading.value).toBe(false)
      expect(list.value).toEqual([])
      expect(listPage.value).toBe(1)
      expect(listPageSize.value).toBe(10)
      expect(listTotal.value).toBe(0)
    })

    it('should use default page size 20 when not specified', () => {
      const options = createMockOptions()
      delete (options as any).pageSize
      const { listPageSize } = useExportJob(options)
      expect(listPageSize.value).toBe(20)
    })

    it('should use default errorContext when not specified', () => {
      const options = createMockOptions()
      delete (options as any).errorContext
      const { submitExport } = useExportJob(options)
      // errorContext defaults to 'ExportJob' - verified via error call
      options.createExport.mockRejectedValue(new Error('fail'))
      return submitExport().then(() => {
        expect(ErrorHandler.handle).toHaveBeenCalledWith(
          expect.any(Error),
          'ExportJob.submitExport'
        )
      })
    })
  })

  describe('openDialog', () => {
    it('should open dialog and reset state', () => {
      const options = createMockOptions()
      const { dialogVisible, startDate, endDate, filters, openDialog } = useExportJob(options)

      startDate.value = '2024-01-01'
      endDate.value = '2024-12-31'
      filters['key'] = 'value'

      openDialog()

      expect(dialogVisible.value).toBe(true)
      expect(startDate.value).toBe('')
      expect(endDate.value).toBe('')
    })
  })

  describe('submitExport', () => {
    it('should call createExport with correct payload', async () => {
      const options = createMockOptions()
      options.createExport.mockResolvedValue({ data: { export_id: 'EXP-001' } })

      const { startDate, endDate, submitExport, dialogVisible, loading } = useExportJob(options)
      startDate.value = '2024-01-01'
      endDate.value = '2024-06-30'

      const promise = submitExport()
      expect(loading.value).toBe(true)

      await promise

      expect(options.createExport).toHaveBeenCalledWith({
        start_date: '2024-01-01',
        end_date: '2024-06-30',
        filters: {},
      })
      expect(dialogVisible.value).toBe(false)
      expect(loading.value).toBe(false)
      expect(mockUIStore.showSuccess).toHaveBeenCalledWith('导出任务已创建: EXP-001')
    })

    it('should pass extra filters and filter out falsy values', async () => {
      const options = createMockOptions()
      options.createExport.mockResolvedValue({})

      const { submitExport } = useExportJob(options)

      await submitExport({
        status: 'completed',
        category: '',
        type: null,
        tag: undefined,
      } as any)

      expect(options.createExport).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { status: 'completed' },
        })
      )
    })

    it('should handle API error', async () => {
      const options = createMockOptions()
      options.createExport.mockRejectedValue(new Error('Network error'))

      const { submitExport, loading, dialogVisible } = useExportJob(options)
      dialogVisible.value = true

      await submitExport()

      expect(ErrorHandler.handle).toHaveBeenCalledWith(
        expect.any(Error),
        'TestExport.submitExport'
      )
      expect(mockUIStore.showError).toHaveBeenCalledWith('创建导出任务失败')
      expect(loading.value).toBe(false)
      expect(dialogVisible.value).toBe(true) // dialog stays open on error
    })

    it('should extract export_id from nested response', async () => {
      const options = createMockOptions()
      options.createExport.mockResolvedValue({ results: { export_id: 'EXP-002' } })

      const { submitExport } = useExportJob(options)
      await submitExport()

      expect(mockUIStore.showSuccess).toHaveBeenCalledWith('导出任务已创建: EXP-002')
    })
  })

  describe('openList', () => {
    it('should open list dialog, reset page and load data', async () => {
      const options = createMockOptions()
      options.getExportList.mockResolvedValue({
        results: [{ id: 1 }],
        count: 1,
      })

      const { openList, listVisible, listPage, list } = useExportJob(options)
      listPage.value = 5

      await openList()

      expect(listVisible.value).toBe(true)
      expect(listPage.value).toBe(1)
      expect(options.getExportList).toHaveBeenCalledWith({
        page: 1,
        page_size: 10,
      })
      expect(list.value).toEqual([{ id: 1 }])
    })
  })

  describe('loadList', () => {
    it('should parse paginated response with results/count', async () => {
      const options = createMockOptions()
      options.getExportList.mockResolvedValue({
        results: [{ id: 1 }, { id: 2 }],
        count: 15,
      })

      const { loadList, list, listTotal } = useExportJob(options)
      await loadList()

      expect(list.value).toEqual([{ id: 1 }, { id: 2 }])
      expect(listTotal.value).toBe(15)
    })

    it('should parse array response directly', async () => {
      const options = createMockOptions()
      options.getExportList.mockResolvedValue([{ id: 1 }])

      const { loadList, list, listTotal } = useExportJob(options)
      await loadList()

      expect(list.value).toEqual([{ id: 1 }])
      expect(listTotal.value).toBe(0)
    })

    it('should parse response with data/items keys', async () => {
      const options = createMockOptions()
      options.getExportList.mockResolvedValue({
        data: [{ id: 1 }],
        pagination: { total_items: 5 },
      })

      const { loadList, list, listTotal } = useExportJob(options)
      await loadList()

      expect(list.value).toEqual([{ id: 1 }])
      expect(listTotal.value).toBe(5)
    })

    it('should include filter params when set', async () => {
      const options = createMockOptions()
      options.getExportList.mockResolvedValue({ results: [], count: 0 })

      const { loadList, listFilters } = useExportJob(options)
      listFilters.status = 'completed'
      listFilters.user_id = 'u1'
      listFilters.start_date = '2024-01-01'
      listFilters.end_date = '2024-12-31'

      await loadList()

      expect(options.getExportList).toHaveBeenCalledWith({
        page: 1,
        page_size: 10,
        status: 'completed',
        user_id: 'u1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      })
    })

    it('should not include empty filter params', async () => {
      const options = createMockOptions()
      options.getExportList.mockResolvedValue({ results: [], count: 0 })

      const { loadList, listFilters } = useExportJob(options)
      listFilters.status = ''
      listFilters.user_id = undefined as any

      await loadList()

      const callArgs = options.getExportList.mock.calls[0][0]
      expect(callArgs).not.toHaveProperty('status')
      expect(callArgs).not.toHaveProperty('user_id')
    })

    it('should handle API error', async () => {
      const options = createMockOptions()
      options.getExportList.mockRejectedValue(new Error('Server error'))

      const { loadList, listLoading } = useExportJob(options)
      await loadList()

      expect(ErrorHandler.handle).toHaveBeenCalledWith(
        expect.any(Error),
        'TestExport.loadList'
      )
      expect(mockUIStore.showError).toHaveBeenCalledWith('加载导出记录失败')
      expect(listLoading.value).toBe(false)
    })
  })

  describe('pagination handlers', () => {
    it('handlePageChange should update page and reload', async () => {
      const options = createMockOptions()
      options.getExportList.mockResolvedValue({ results: [], count: 0 })

      const { handlePageChange, listPage } = useExportJob(options)
      await handlePageChange(3)

      expect(listPage.value).toBe(3)
      expect(options.getExportList).toHaveBeenCalledWith(
        expect.objectContaining({ page: 3 })
      )
    })

    it('handlePageSizeChange should update size, reset page and reload', async () => {
      const options = createMockOptions()
      options.getExportList.mockResolvedValue({ results: [], count: 0 })

      const { handlePageSizeChange, listPageSize, listPage } = useExportJob(options)
      listPage.value = 5

      await handlePageSizeChange(50)

      expect(listPageSize.value).toBe(50)
      expect(listPage.value).toBe(1)
      expect(options.getExportList).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, page_size: 50 })
      )
    })
  })

  describe('download', () => {
    beforeEach(() => {
      // Mock DOM APIs
      const mockUrl = 'blob:mock-url'
      if (!window.URL.createObjectURL) {
        Object.defineProperty(window.URL, 'createObjectURL', {
          configurable: true,
          writable: true,
          value: vi.fn(),
        })
      }
      if (!window.URL.revokeObjectURL) {
        Object.defineProperty(window.URL, 'revokeObjectURL', {
          configurable: true,
          writable: true,
          value: vi.fn(),
        })
      }
      vi.spyOn(window.URL, 'createObjectURL').mockReturnValue(mockUrl)
      vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.createElement('a'))
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.createElement('a'))
    })

    it('should download file from blob with file_path name', async () => {
      const options = createMockOptions()
      const mockBlob = new Blob(['data'], { type: 'text/csv' })
      options.downloadExport.mockResolvedValue(mockBlob)

      const mockClick = vi.fn()
      const mockLink = {
        href: '',
        setAttribute: vi.fn(),
        click: mockClick,
        remove: vi.fn(),
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)

      const { download } = useExportJob(options)
      await download({ id: 42, file_path: '/exports/report_2024.csv' })

      expect(options.downloadExport).toHaveBeenCalledWith(42)
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'report_2024.csv')
      expect(mockClick).toHaveBeenCalled()
    })

    it('should fallback to export_{id}.csv when no file_path', async () => {
      const options = createMockOptions()
      options.downloadExport.mockResolvedValue(new Blob())

      const mockLink = {
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
        remove: vi.fn(),
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)

      const { download } = useExportJob(options)
      await download({ id: 99 })

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'export_99.csv')
    })

    it('should handle download error', async () => {
      const options = createMockOptions()
      options.downloadExport.mockRejectedValue(new Error('Download failed'))

      const { download } = useExportJob(options)
      await download({ id: 1 })

      expect(ErrorHandler.handle).toHaveBeenCalledWith(
        expect.any(Error),
        'TestExport.download'
      )
      expect(mockUIStore.showError).toHaveBeenCalledWith('下载导出文件失败')
    })
  })
})
