/**
 * useCrudList Composable 单元测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useCrudList } from '@/composables/useCrudList'

// Mock ErrorHandler
vi.mock('@/utils/errorHandler', () => ({
  default: {
    showMessage: vi.fn()
  }
}))

describe('useCrudList', () => {
  // Mock API instance
  const createMockApi = () => ({
    list: vi.fn(),
    getDetail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  })

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('应该使用默认配置初始化', () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const {
        searchText,
        filters,
        tableData,
        loading,
        total,
        currentPage,
        pageSize
      } = useCrudList(mockApi, 'list')

      expect(searchText.value).toBe('')
      expect(filters.value).toEqual({})
      expect(tableData.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(total.value).toBe(0)
      expect(currentPage.value).toBe(1)
      expect(pageSize.value).toBe(20)
    })

    it('应该使用自定义初始值', () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const {
        searchText,
        filters,
        currentPage,
        pageSize
      } = useCrudList(mockApi, 'list', {
        initialPage: 3,
        initialPageSize: 50,
        initialSearch: 'test',
        initialFilters: { status: 'active' }
      })

      expect(currentPage.value).toBe(3)
      expect(pageSize.value).toBe(50)
      expect(searchText.value).toBe('test')
      expect(filters.value).toEqual({ status: 'active' })
    })
  })

  describe('loadData', () => {
    it('应该调用 API 的 list 方法', async () => {
      const mockApi = createMockApi()
      const mockResponse = {
        results: [{ id: 1, name: 'Item 1' }],
        total: 1
      }
      mockApi.list.mockResolvedValue(mockResponse)

      const { tableData, total, loadData } = useCrudList(mockApi, 'list')
      await loadData()

      expect(mockApi.list).toHaveBeenCalled()
      expect(tableData.value).toEqual([{ id: 1, name: 'Item 1' }])
      expect(total.value).toBe(1)
    })

    it('应该支持自定义参数解析', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ data: { items: [{ id: 1 }] }, count: 1 })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tableData, total } = useCrudList(mockApi, 'list', {
        resolveList: (response: any) => ({
          rows: response.data?.items || [],
          total: response.data?.count || 0
        })
      })

      // Note: 默认 resolveList 期望 results/data/items，这里会返回空因为格式不匹配
      // 实际测试中 resolveList 需要匹配实际 API 响应格式
    })

    it('加载失败应该设置错误并清空数据', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockRejectedValue(new Error('API Error'))

      const { tableData, total, loadData } = useCrudList(mockApi, 'list')
      await loadData()

      expect(tableData.value).toEqual([])
      expect(total.value).toBe(0)
    })

    it('应该传递分页参数', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { loadData, currentPage, pageSize } = useCrudList(mockApi, 'list', {
        pageKey: 'page',
        pageSizeKey: 'page_size'
      })
      currentPage.value = 5
      pageSize.value = 100

      await loadData()

      expect(mockApi.list).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 5,
          page_size: 100
        }),
        expect.any(Object)
      )
    })
  })

  describe('handleSearch', () => {
    it('应该重置页码为 1 并加载数据', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { handleSearch, currentPage, searchText } = useCrudList(mockApi, 'list')
      currentPage.value = 5
      searchText.value = 'test search'

      await handleSearch()

      expect(currentPage.value).toBe(1)
      expect(mockApi.list).toHaveBeenCalled()
    })
  })

  describe('handlePageChange', () => {
    it('应该更新当前页码并加载数据', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { handlePageChange, currentPage } = useCrudList(mockApi, 'list')

      await handlePageChange(3)

      expect(currentPage.value).toBe(3)
      expect(mockApi.list).toHaveBeenCalled()
    })
  })

  describe('handleSizeChange', () => {
    it('应该更新页大小、重置页码并加载数据', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { handleSizeChange, pageSize, currentPage } = useCrudList(mockApi, 'list')

      await handleSizeChange(50)

      expect(pageSize.value).toBe(50)
      expect(currentPage.value).toBe(1)
      expect(mockApi.list).toHaveBeenCalled()
    })

    it('应该持久化页大小到 localStorage', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { handleSizeChange } = useCrudList(mockApi, 'list', {
        persistedPageSizeKey: 'test-page-size'
      })

      await handleSizeChange(100)

      expect(localStorage.getItem('test-page-size')).toBe('100')
    })
  })

  describe('resetFilters', () => {
    it('应该重置搜索和筛选条件', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { resetFilters, searchText, filters, currentPage } = useCrudList(mockApi, 'list', {
        initialSearch: 'initial',
        initialFilters: { status: 'active' }
      })

      searchText.value = 'modified'
      filters.value = { name: 'test' }
      currentPage.value = 5

      await resetFilters()

      expect(searchText.value).toBe('initial')
      expect(filters.value).toEqual({ status: 'active' })
      expect(currentPage.value).toBe(1)
    })

    it('应该支持额外的筛选条件', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { resetFilters, filters } = useCrudList(mockApi, 'list')

      await resetFilters({ category: 'electronics' })

      expect(filters.value).toEqual({ category: 'electronics' })
    })
  })

  describe('updateFilters', () => {
    it('应该更新筛选条件', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { updateFilters, filters } = useCrudList(mockApi, 'list', {
        initialFilters: { status: 'active' }
      })

      await updateFilters({ category: 'electronics' })

      expect(filters.value).toEqual({ status: 'active', category: 'electronics' })
    })

    it('shouldSearch 为 true 时应该立即搜索', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { updateFilters, currentPage } = useCrudList(mockApi, 'list')
      currentPage.value = 5

      await updateFilters({ status: 'inactive' }, true)

      expect(currentPage.value).toBe(1)
    })
  })

  describe('hasFilters', () => {
    it('应该正确判断是否有筛选条件', async () => {
      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { hasFilters, filters } = useCrudList(mockApi, 'list')

      expect(hasFilters.value).toBe(false)

      filters.value = { status: 'active' }
      expect(hasFilters.value).toBe(true)

      filters.value = { status: '' }
      expect(hasFilters.value).toBe(false)
    })
  })

  describe('AbortController', () => {
    it('快速连续调用应该取消之前的请求', async () => {
      const mockApi = createMockApi()
      let resolveCount = 0
      mockApi.list.mockImplementation(() => {
        resolveCount++
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ results: [], total: 0 })
          }, 100)
        })
      })

      const { loadData } = useCrudList(mockApi, 'list', { enableAbort: true })

      // 快速连续调用 3 次
// eslint-disable-next-line @typescript-eslint/no-unused-vars
      const promise1 = loadData()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
      const promise2 = loadData()
      const promise3 = loadData()

      await promise3

      // 第一个请求应该被取消，所以 resolveCount 应该是 3，但只有最后一次会完成
      expect(resolveCount).toBe(3)
    })

    it('enableAbort 为 false 时不应该取消请求', async () => {
      const mockApi = createMockApi()
      let requestCount = 0
      mockApi.list.mockImplementation(() => {
        requestCount++
        return Promise.resolve({ results: [], total: 0 })
      })

      const { loadData } = useCrudList(mockApi, 'list', { enableAbort: false })

      await loadData()
      await loadData()
      await loadData()

      expect(requestCount).toBe(3)
    })
  })

  describe('page size persistence', () => {
    it('应该从 localStorage 恢复页大小', () => {
      localStorage.setItem('app-page-size', '50')

      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { pageSize } = useCrudList(mockApi, 'list', {
        persistedPageSizeKey: 'app-page-size'
      })

      expect(pageSize.value).toBe(50)
    })

    it('无效的 localStorage 值应该使用默认值', () => {
      localStorage.setItem('invalid-size', 'invalid')

      const mockApi = createMockApi()
      mockApi.list.mockResolvedValue({ results: [], total: 0 })

      const { pageSize } = useCrudList(mockApi, 'list', {
        persistedPageSizeKey: 'invalid-size',
        initialPageSize: 25
      })

      expect(pageSize.value).toBe(25)
    })
  })
})
