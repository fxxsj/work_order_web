import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SummaryTable from '@/components/common/SummaryTable.vue'

describe('SummaryTable', () => {
  const columns = [
    { key: 'name', label: '名称' },
    { key: 'status', label: '状态', align: 'center' as const },
  ]

  it('renders column headers and row values', () => {
    const wrapper = mount(SummaryTable, {
      props: {
        columns,
        data: [{ id: 1, name: '施工单 A', status: '进行中' }],
      },
    })

    expect(wrapper.text()).toContain('名称')
    expect(wrapper.text()).toContain('施工单 A')
    expect(wrapper.text()).toContain('进行中')
  })

  it('supports custom cell slots', () => {
    const wrapper = mount(SummaryTable, {
      props: {
        columns,
        data: [{ id: 1, name: '任务 A', status: 'pending' }],
      },
      slots: {
        'cell-status': '<span>待处理</span>',
      },
    })

    expect(wrapper.text()).toContain('待处理')
    expect(wrapper.text()).not.toContain('pending')
  })

  it('renders empty state when data is empty', () => {
    const wrapper = mount(SummaryTable, {
      props: {
        columns,
        data: [],
      },
      slots: {
        empty: '没有记录',
      },
    })

    expect(wrapper.text()).toContain('没有记录')
  })
})
