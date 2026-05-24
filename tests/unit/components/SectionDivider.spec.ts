import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SectionDivider from '@/components/common/SectionDivider.vue'

describe('SectionDivider', () => {
  it('renders the section title', () => {
    const wrapper = mount(SectionDivider, {
      props: {
        title: '采购明细',
      },
    })

    expect(wrapper.text()).toContain('采购明细')
  })

  it('renders a visual divider line', () => {
    const wrapper = mount(SectionDivider, {
      props: {
        title: '默认工序配置',
      },
    })

    expect(wrapper.find('hr').exists()).toBe(true)
    expect(wrapper.find('hr').classes()).toContain('border-gray-200')
  })
})
