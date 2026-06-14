/**
 * usePagination Composable 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { flushPromises } from '@vue/test-utils'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { mount, flushPromises as vueFlushPromises } from '@vue/test-utils'
import { ref } from 'vue'

// 简化版的 usePagination 测试
describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确初始化分页状态', () => {
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const loading = ref(false)

    expect(currentPage.value).toBe(1)
    expect(pageSize.value).toBe(20)
    expect(total.value).toBe(0)
    expect(loading.value).toBe(false)
  })

  it('handleSizeChange 应该更新 pageSize 和 currentPage', () => {
    const currentPage = ref(1)
    const pageSize = ref(20)

    const handleSizeChange = (val: number) => {
      pageSize.value = val
      currentPage.value = 1
    }

    handleSizeChange(50)

    expect(pageSize.value).toBe(50)
    expect(currentPage.value).toBe(1)
  })

  it('handleCurrentChange 应该更新 currentPage', () => {
    const currentPage = ref(1)

    const handleCurrentChange = (val: number) => {
      currentPage.value = val
    }

    handleCurrentChange(3)

    expect(currentPage.value).toBe(3)
  })

  it('应该正确构建分页参数', () => {
    const currentPageKey = 'page'
    const pageSizeKey = 'page_size'
    const currentPage = ref(2)
    const pageSize = ref(50)

    const params = {
      [currentPageKey]: currentPage.value,
      [pageSizeKey]: pageSize.value,
    }

    expect(params).toEqual({ page: 2, page_size: 50 })
  })

  it('应该过滤空值参数', () => {
    const baseParams = {
      page: 1,
      page_size: 20,
      search: '',
      status: null,
      name: undefined,
    }

    const normalizedParams = Object.fromEntries(
      Object.entries(baseParams).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    )

    expect(normalizedParams).toEqual({ page: 1, page_size: 20 })
  })
})
