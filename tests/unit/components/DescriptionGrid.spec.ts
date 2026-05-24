import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DescriptionGrid from '@/components/common/DescriptionGrid.vue'
import DescriptionItem from '@/components/common/DescriptionItem.vue'

describe('DescriptionGrid', () => {
  it('renders description items', () => {
    const wrapper = mount(DescriptionGrid, {
      props: {
        columns: 2,
      },
      slots: {
        default: '<DescriptionItem label="采购单号">PO001</DescriptionItem>',
      },
      global: {
        components: {
          DescriptionItem,
        },
      },
    })

    expect(wrapper.text()).toContain('采购单号')
    expect(wrapper.text()).toContain('PO001')
    expect(wrapper.classes()).toContain('sm:grid-cols-2')
  })

  it('supports item spanning', () => {
    const wrapper = mount(DescriptionItem, {
      props: {
        label: '关联施工单',
        span: 2,
      },
      slots: {
        default: 'WO001',
      },
    })

    expect(wrapper.text()).toContain('关联施工单')
    expect(wrapper.text()).toContain('WO001')
    expect(wrapper.classes()).toContain('sm:col-span-2')
  })
})
