import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FilterRow from '@/components/common/FilterRow.vue'

describe('FilterRow', () => {
  it('renders filter controls in the default slot', () => {
    const wrapper = mount(FilterRow, {
      slots: {
        default: '<button>重置</button>',
      },
    })

    expect(wrapper.text()).toContain('重置')
    expect(wrapper.find('.flex-wrap').exists()).toBe(true)
  })

  it('renders optional extra content on a second row', () => {
    const wrapper = mount(FilterRow, {
      slots: {
        default: '<input aria-label="search" />',
        extra: '<span>高级筛选</span>',
      },
    })

    expect(wrapper.text()).toContain('高级筛选')
    expect(wrapper.findAll('.flex-wrap')).toHaveLength(2)
  })
})
