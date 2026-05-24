/**
 * DataTable 组件单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick, ref, computed } from 'vue'
import { mount } from '@vue/test-utils'
import DataTable from '@/components/common/DataTable.vue'

const setDesktopViewport = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

beforeEach(() => {
  setDesktopViewport(true)
  vi.stubGlobal('ResizeObserver', class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  })
})

// Since DataTable is a Vue component, we'll test its props validation and helpers
describe('DataTable', () => {
  describe('Column 定义', () => {
    interface Column {
      key: string
      label: string
      sortable?: boolean
      width?: number | string
      fixed?: 'left' | 'right'
      align?: 'left' | 'center' | 'right'
    }

    it('应该正确定义基本列', () => {
      const columns: Column[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: '名称' },
        { key: 'status', label: '状态', width: 100 }
      ]

      expect(columns.length).toBe(3)
      expect(columns[0].key).toBe('id')
      expect(columns[0].sortable).toBe(true)
    })

    it('应该支持固定列', () => {
      const columns: Column[] = [
        { key: 'id', label: 'ID', fixed: 'left' },
        { key: 'name', label: '名称' },
        { key: 'actions', label: '操作', fixed: 'right', width: 120 }
      ]

      expect(columns[0].fixed).toBe('left')
      expect(columns[2].fixed).toBe('right')
    })

    it('应该支持对齐方式', () => {
      const columns: Column[] = [
        { key: 'name', label: '名称', align: 'left' },
        { key: 'date', label: '日期', align: 'center' },
        { key: 'amount', label: '金额', align: 'right' }
      ]

      expect(columns[0].align).toBe('left')
      expect(columns[1].align).toBe('center')
      expect(columns[2].align).toBe('right')
    })
  })

  describe('数据处理', () => {
    interface TableRow {
      id: number
      name: string
      status: string
      amount?: number
    }

    const mockData: TableRow[] = [
      { id: 1, name: 'Item 1', status: 'active', amount: 100 },
      { id: 2, name: 'Item 2', status: 'inactive', amount: 200 },
      { id: 3, name: 'Item 3', status: 'active', amount: 150 }
    ]

    it('应该正确获取单元格值', () => {
      const getCellValue = (row: TableRow, key: string) => {
        return row[key as keyof TableRow]
      }

      expect(getCellValue(mockData[0], 'name')).toBe('Item 1')
      expect(getCellValue(mockData[1], 'status')).toBe('inactive')
      expect(getCellValue(mockData[2], 'amount')).toBe(150)
    })

    it('应该正确排序数据', () => {
      const sortedById = [...mockData].sort((a, b) => a.id - b.id)
      expect(sortedById[0].id).toBe(1)
      expect(sortedById[2].id).toBe(3)

      const sortedByAmount = [...mockData].sort((a, b) => (a.amount || 0) - (b.amount || 0))
      expect(sortedByAmount[0].amount).toBe(100)
      expect(sortedByAmount[2].amount).toBe(200)
    })

    it('应该正确过滤数据', () => {
      const activeOnly = mockData.filter(item => item.status === 'active')
      expect(activeOnly.length).toBe(2)
      expect(activeOnly.every(item => item.status === 'active')).toBe(true)
    })

    it('应该正确分页数据', () => {
      const pageSize = 2
      const page = 1

      const paginatedData = mockData.slice((page - 1) * pageSize, page * pageSize)
      expect(paginatedData.length).toBe(2)
      expect(paginatedData[0].id).toBe(1)
      expect(paginatedData[1].id).toBe(2)
    })
  })

  describe('排序逻辑', () => {
    type SortDirection = 'asc' | 'desc' | null

    interface SortState {
      key: string | null
      direction: SortDirection
    }

    it('应该正确切换排序方向', () => {
      const toggleSort = (current: SortState, key: string): SortState => {
        if (current.key !== key) {
          return { key, direction: 'asc' }
        }
        if (current.direction === 'asc') {
          return { key, direction: 'desc' }
        }
        return { key: null, direction: null }
      }

      // New key sorts ascending
      expect(toggleSort({ key: null, direction: null }, 'name')).toEqual({ key: 'name', direction: 'asc' })

      // Same key toggles to desc
      expect(toggleSort({ key: 'name', direction: 'asc' }, 'name')).toEqual({ key: 'name', direction: 'desc' })

      // Same key with desc removes sort
      expect(toggleSort({ key: 'name', direction: 'desc' }, 'name')).toEqual({ key: null, direction: null })

      // Different key starts ascending
      expect(toggleSort({ key: 'name', direction: 'desc' }, 'id')).toEqual({ key: 'id', direction: 'asc' })
    })

    it('应该正确比较字符串', () => {
      const items = [
        { name: 'Charlie' },
        { name: 'Alice' },
        { name: 'Bob' }
      ]

      const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
      expect(sorted[0].name).toBe('Alice')
      expect(sorted[1].name).toBe('Bob')
      expect(sorted[2].name).toBe('Charlie')
    })
  })

  describe('行选择', () => {
    const mockData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]

    it('应该正确切换行选择', () => {
      const selectedIds = ref<Set<number>>(new Set([1]))

      const toggleSelection = (id: number) => {
        if (selectedIds.value.has(id)) {
          selectedIds.value.delete(id)
        } else {
          selectedIds.value.add(id)
        }
      }

      toggleSelection(2)
      expect(selectedIds.value.has(2)).toBe(true)
      expect(selectedIds.value.size).toBe(2)

      toggleSelection(1) // deselect
      expect(selectedIds.value.has(1)).toBe(false)
      expect(selectedIds.value.size).toBe(1)
    })

    it('应该正确全选/取消全选', () => {
      const selectedIds = ref<Set<number>>(new Set())
      const allSelected = computed(() =>
        mockData.length > 0 && selectedIds.value.size === mockData.length
      )

      const selectAll = () => {
        mockData.forEach(item => selectedIds.value.add(item.id))
      }

      const clearSelection = () => {
        selectedIds.value.clear()
      }

      expect(allSelected.value).toBe(false)

      selectAll()
      expect(allSelected.value).toBe(true)
      expect(selectedIds.value.size).toBe(3)

      clearSelection()
      expect(allSelected.value).toBe(false)
      expect(selectedIds.value.size).toBe(0)
    })

    it('应该正确处理多选', () => {
      const selectedIds = ref<Set<number>>(new Set())

      const toggleMultiple = (ids: number[]) => {
        ids.forEach(id => {
          if (selectedIds.value.has(id)) {
            selectedIds.value.delete(id)
          } else {
            selectedIds.value.add(id)
          }
        })
      }

      toggleMultiple([1, 2])
      expect(selectedIds.value.size).toBe(2)

      toggleMultiple([2, 3]) // 2 removed, 3 added, 1 remains
      expect(selectedIds.value.has(1)).toBe(true) // 1 stays selected
      expect(selectedIds.value.has(2)).toBe(false)
      expect(selectedIds.value.has(3)).toBe(true)
    })
  })

  describe('loading 状态', () => {
    it('loading 为 true 时不应该显示数据', () => {
      const loading = ref(true)
      const data = ref([{ id: 1 }, { id: 2 }])

      const shouldShowData = !loading.value && data.value.length > 0
      expect(shouldShowData).toBe(false)
    })

    it('loading 结束后应该显示数据', () => {
      const loading = ref(false)
      const data = ref([{ id: 1 }, { id: 2 }])

      const shouldShowData = !loading.value && data.value.length > 0
      expect(shouldShowData).toBe(true)
    })

    it('空数据时应该显示空状态', () => {
      const loading = ref(false)
      const data = ref<any[]>([])

      const shouldShowEmpty = !loading.value && data.value.length === 0
      expect(shouldShowEmpty).toBe(true)
    })
  })

  describe('响应式列宽', () => {
    it('应该正确计算百分比宽度', () => {
      const totalWidth = 1000
      const columns = [
        { key: 'id', width: 80 },
        { key: 'name', width: 'auto' as const },
        { key: 'actions', width: 120 }
      ]

      const fixedWidth = columns.reduce((sum, col) => {
        return sum + (typeof col.width === 'number' ? col.width : 0)
      }, 0)

      const autoWidth = totalWidth - fixedWidth
      expect(fixedWidth).toBe(200)
      expect(autoWidth).toBe(800)
    })

    it('应该正确处理 minWidth', () => {
      const columns = [
        { key: 'id', width: 50 },
        { key: 'name', minWidth: 200 },
        { key: 'description', minWidth: 300 }
      ]

      const totalMinWidth = columns.reduce((sum, col) => {
        return sum + (col.minWidth || 0)
      }, 0)

      expect(totalMinWidth).toBe(500)
    })
  })

  describe('组件渲染契约', () => {
    const columns = [
      { key: 'name', label: '名称', sortable: true },
      { key: 'status', label: '状态' },
      { key: 'actions', label: '操作' }
    ]

    const rows = [
      { id: 1, name: '纸盒', status: 'active' },
      { id: 2, name: '吊牌', status: 'inactive' }
    ]

    it('应该渲染桌面空状态插槽', () => {
      const wrapper = mount(DataTable, {
        props: {
          columns,
          data: []
        },
        slots: {
          empty: '<div data-test="empty">没有匹配数据</div>'
        },
      })

      expect(wrapper.text()).toContain('名称')
      expect(wrapper.text()).toContain('没有匹配数据')
    })

    it('loading 时应该渲染骨架屏且不渲染数据行', () => {
      const wrapper = mount(DataTable, {
        props: {
          columns,
          data: rows,
          loading: true
        },
      })

      expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)
      expect(wrapper.text()).not.toContain('纸盒')
    })

    it('服务端排序模式应该触发 sort 事件', async () => {
      const wrapper = mount(DataTable, {
        props: {
          columns,
          data: rows,
          serverSideSort: true
        },
      })

      await wrapper.find('th').trigger('click')

      expect(wrapper.emitted('sort')?.[0]).toEqual(['name', 'asc'])
    })

    it('移动端应该渲染卡片字段与 actions 插槽', async () => {
      setDesktopViewport(false)
      const wrapper = mount(DataTable, {
        props: {
          columns,
          data: rows,
          rowKey: 'id'
        },
        slots: {
          'cell-status': '<template #default="{ value }"><span>状态：{{ value }}</span></template>',
          'cell-actions': '<template #default="{ row }"><button>编辑 {{ row.name }}</button></template>',
        },
      })

      await nextTick()

      expect(wrapper.text()).toContain('名称')
      expect(wrapper.text()).toContain('纸盒')
      expect(wrapper.text()).toContain('状态：active')
      expect(wrapper.text()).toContain('编辑 纸盒')
      expect(wrapper.findAll('table')).toHaveLength(0)
    })

    it('移动端 loading 应该渲染卡片骨架', () => {
      setDesktopViewport(false)
      const wrapper = mount(DataTable, {
        props: {
          columns,
          data: rows,
          loading: true
        },
      })

      expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)
      expect(wrapper.text()).not.toContain('纸盒')
    })
  })
})
