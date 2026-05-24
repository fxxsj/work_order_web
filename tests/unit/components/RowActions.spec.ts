import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RowActions from '@/components/common/RowActions.vue'

describe('RowActions', () => {
  it('renders visible actions and hides actions with visible false', () => {
    const wrapper = mount(RowActions, {
      props: {
        actions: [
          { key: 'edit', label: '编辑', icon: 'edit' },
          { key: 'delete', label: '删除', icon: 'trash', visible: false },
        ],
      },
    })

    expect(wrapper.text()).toContain('编辑')
    expect(wrapper.text()).not.toContain('删除')
    expect(wrapper.findAll('button')).toHaveLength(1)
  })

  it('emits the clicked action payload', async () => {
    const action = { key: 'delete', label: '删除', icon: 'trash', tone: 'danger' as const }
    const wrapper = mount(RowActions, {
      props: {
        actions: [action],
      },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('action')).toEqual([[action]])
  })

  it('uses danger hover styles for destructive actions', () => {
    const wrapper = mount(RowActions, {
      props: {
        actions: [
          { key: 'delete', label: '删除', icon: 'trash', tone: 'danger' },
        ],
      },
    })

    expect(wrapper.get('button').classes()).toContain('hover:text-red-600')
  })

  it('does not emit disabled or loading actions', async () => {
    const wrapper = mount(RowActions, {
      props: {
        actions: [
          { key: 'disabled', label: '禁用', icon: 'edit', disabled: true },
          { key: 'loading', label: '保存', icon: 'refresh', loading: true, loadingLabel: '保存中' },
        ],
      },
    })

    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('保存中')
    expect(wrapper.emitted('action')).toBeUndefined()
  })
})
