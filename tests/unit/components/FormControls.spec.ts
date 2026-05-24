import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CheckboxGroup from '@/components/common/CheckboxGroup.vue'
import InputNumber from '@/components/common/InputNumber.vue'
import Select from '@/components/common/Select.vue'
import Toggle from '@/components/common/Toggle.vue'

describe('form control contracts', () => {
  describe('InputNumber', () => {
    it('renders label, hint and required marker', () => {
      const wrapper = mount(InputNumber, {
        props: {
          modelValue: 2,
          label: '数量',
          hint: '请输入生产数量',
          required: true,
        },
      })

      expect(wrapper.text()).toContain('数量')
      expect(wrapper.text()).toContain('*')
      expect(wrapper.text()).toContain('请输入生产数量')
    })

    it('renders error instead of hint and emits clamped value changes', async () => {
      const wrapper = mount(InputNumber, {
        props: {
          modelValue: 2,
          min: 0,
          max: 3,
          step: 2,
          hint: '正常提示',
          error: '数量不能超过 3',
        },
      })

      expect(wrapper.text()).toContain('数量不能超过 3')
      expect(wrapper.text()).not.toContain('正常提示')

      await wrapper.find('.input-number-btn-plus').trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
      expect(wrapper.emitted('change')?.[0]).toEqual([3])
    })

    it('does not emit while disabled', async () => {
      const wrapper = mount(InputNumber, {
        props: {
          modelValue: 2,
          disabled: true,
        },
      })

      await wrapper.find('.input-number-btn-plus').trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
  })

  describe('CheckboxGroup', () => {
    it('renders label, hint and options', () => {
      const wrapper = mount(CheckboxGroup, {
        props: {
          modelValue: ['a'],
          label: '权限',
          hint: '选择可用权限',
          options: [
            { value: 'a', label: '查看' },
            { value: 'b', label: '编辑' },
          ],
        },
      })

      expect(wrapper.text()).toContain('权限')
      expect(wrapper.text()).toContain('选择可用权限')
      expect(wrapper.text()).toContain('查看')
      expect(wrapper.text()).toContain('编辑')
    })

    it('passes group disabled state to all checkboxes', () => {
      const wrapper = mount(CheckboxGroup, {
        props: {
          modelValue: [],
          disabled: true,
          options: ['查看', '编辑'],
        },
      })

      const inputs = wrapper.findAll('input[type="checkbox"]')

      expect(inputs).toHaveLength(2)
      expect(inputs.every(input => (input.element as HTMLInputElement).disabled)).toBe(true)
    })

    it('emits selected values when an option changes', async () => {
      const wrapper = mount(CheckboxGroup, {
        props: {
          modelValue: ['a'],
          options: [
            { value: 'a', label: '查看' },
            { value: 'b', label: '编辑' },
          ],
        },
      })

      await wrapper.findAll('input[type="checkbox"]')[1].setValue(true)

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']])
      expect(wrapper.emitted('change')?.[0]).toEqual([['a', 'b']])
    })
  })

  describe('Toggle', () => {
    it('renders label and hint', () => {
      const wrapper = mount(Toggle, {
        props: {
          modelValue: false,
          label: '启用',
          hint: '启用后立即生效',
        },
      })

      expect(wrapper.text()).toContain('启用')
      expect(wrapper.text()).toContain('启用后立即生效')
    })

    it('emits update and change when toggled', async () => {
      const wrapper = mount(Toggle, {
        props: {
          modelValue: false,
        },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
      expect(wrapper.emitted('change')?.[0]).toEqual([true])
    })

    it('does not emit while disabled and shows error text', async () => {
      const wrapper = mount(Toggle, {
        props: {
          modelValue: true,
          disabled: true,
          error: '当前状态不可修改',
        },
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('当前状态不可修改')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect((wrapper.find('button').element as HTMLButtonElement).disabled).toBe(true)
    })
  })

  describe('Select', () => {
    it('renders label, hint and required marker', () => {
      const wrapper = mount(Select, {
        props: {
          modelValue: null,
          options: [{ value: 'a', label: '选项 A' }],
          label: '客户',
          hint: '请选择客户',
          required: true,
        },
      })

      expect(wrapper.text()).toContain('客户')
      expect(wrapper.text()).toContain('*')
      expect(wrapper.text()).toContain('请选择客户')
    })

    it('renders string error instead of hint and keeps boolean error compatible', () => {
      const wrapper = mount(Select, {
        props: {
          modelValue: null,
          options: [{ value: 'a', label: '选项 A' }],
          hint: '正常提示',
          error: '客户不能为空',
        },
      })

      expect(wrapper.text()).toContain('客户不能为空')
      expect(wrapper.text()).not.toContain('正常提示')
      expect(wrapper.find('button').attributes('aria-invalid')).toBe('true')

      const booleanErrorWrapper = mount(Select, {
        props: {
          modelValue: null,
          options: [{ value: 'a', label: '选项 A' }],
          error: true,
        },
      })

      expect(booleanErrorWrapper.text()).not.toContain('true')
      expect(booleanErrorWrapper.find('button').attributes('aria-invalid')).toBe('true')
    })

    it('opens teleported dropdown and emits selection without breaking positioning', async () => {
      const wrapper = mount(Select, {
        attachTo: document.body,
        props: {
          modelValue: null,
          options: [
            { value: 'a', label: '选项 A' },
            { value: 'b', label: '选项 B' },
          ],
          label: '客户',
        },
      })

      await wrapper.find('button').trigger('click')

      const dropdown = document.body.querySelector('.select-dropdown-portal') as HTMLElement
      expect(dropdown).toBeTruthy()
      expect(dropdown.style.position).toBe('fixed')

      const options = document.body.querySelectorAll('[role="option"]')
      expect(options).toHaveLength(2)

      ;(options[1] as HTMLElement).click()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
      expect(wrapper.emitted('change')?.[0][0]).toBe('b')

      wrapper.unmount()
      document.body.innerHTML = ''
    })

    it('does not open while disabled', async () => {
      const wrapper = mount(Select, {
        attachTo: document.body,
        props: {
          modelValue: null,
          disabled: true,
          options: [{ value: 'a', label: '选项 A' }],
        },
      })

      await wrapper.find('button').trigger('click')

      expect(document.body.querySelector('.select-dropdown-portal')).toBeNull()

      wrapper.unmount()
      document.body.innerHTML = ''
    })
  })
})
