/**
 * LineItemsTable 组件单元测试
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import LineItemsTable from '@/components/common/LineItemsTable.vue'
import type { Column } from '@/components/common/types'

describe('LineItemsTable', () => {
  const columns: Column[] = [
    { key: 'name', label: '名称' },
    { key: 'quantity', label: '数量', align: 'right' },
    { key: 'price', label: '单价', align: 'right' },
  ]

  const items = [
    { name: '产品A', quantity: 10, price: 100 },
    { name: '产品B', quantity: 5, price: 200 },
  ]

  describe('column headers', () => {
    it('renders all column headers', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items },
      })

      expect(wrapper.text()).toContain('名称')
      expect(wrapper.text()).toContain('数量')
      expect(wrapper.text()).toContain('单价')
    })

    it('renders operation header when showDelete is true', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items, showDelete: true },
      })

      expect(wrapper.text()).toContain('操作')
    })

    it('hides operation column when showDelete is false', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items, showDelete: false },
      })

      expect(wrapper.text()).not.toContain('操作')
    })
  })

  describe('row rendering', () => {
    it('renders item values in cells', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items },
      })

      expect(wrapper.text()).toContain('产品A')
      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('100')
      expect(wrapper.text()).toContain('产品B')
      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('200')
    })

    it('renders correct number of rows', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items },
      })

      const rows = wrapper.findAll('tbody tr')
      expect(rows).toHaveLength(2)
    })
  })

  describe('empty state', () => {
    it('shows default empty text when items is empty', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items: [] },
      })

      expect(wrapper.text()).toContain('暂无明细数据')
    })

    it('shows custom empty text', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items: [], emptyText: '暂无采购明细' },
      })

      expect(wrapper.text()).toContain('暂无采购明细')
    })

    it('renders empty slot when provided', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items: [] },
        slots: {
          empty: '<div class="custom-empty">自定义空态</div>',
        },
      })

      expect(wrapper.find('.custom-empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('自定义空态')
    })

    it('empty row colspan accounts for delete column', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items: [], showDelete: true },
      })

      const td = wrapper.find('tbody td')
      expect(td.attributes('colspan')).toBe('4') // 3 columns + 1 delete
    })

    it('empty row colspan without delete column', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items: [], showDelete: false },
      })

      const td = wrapper.find('tbody td')
      expect(td.attributes('colspan')).toBe('3')
    })
  })

  describe('cell scoped slots', () => {
    it('renders cell slot with row, index, and value', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items },
        slots: {
          'cell-quantity': `<template #cell-quantity="{ row, index, value }">
            <span class="custom-cell">第{{ index }}行: {{ value }}件</span>
          </template>`,
        },
      })

      expect(wrapper.find('.custom-cell').exists()).toBe(true)
      expect(wrapper.text()).toContain('第0行: 10件')
    })

    it('falls back to item[key] when no slot provided', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items },
      })

      // no slot for name, should render item.name directly
      expect(wrapper.text()).toContain('产品A')
    })
  })

  describe('delete button', () => {
    it('emits delete event with correct index', async () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items },
      })

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')

      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')![0]).toEqual([0])
    })

    it('emits correct index for second row', async () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items },
      })

      const buttons = wrapper.findAll('button')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('delete')![0]).toEqual([1])
    })

    it('is disabled when deleteDisabled returns true', () => {
      const wrapper = mount(LineItemsTable, {
        props: {
          columns,
          items,
          deleteDisabled: (item: any, index: number) => index === 0,
        },
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[0].attributes('disabled')).toBeDefined()
      expect(buttons[1].attributes('disabled')).toBeUndefined()
    })

    it('renders custom delete-icon slot', () => {
      const wrapper = mount(LineItemsTable, {
        props: { columns, items },
        slots: {
          'delete-icon': '<span class="custom-del">移除</span>',
        },
      })

      expect(wrapper.find('.custom-del').exists()).toBe(true)
      expect(wrapper.text()).toContain('移除')
    })
  })

  describe('column styling', () => {
    it('applies width style when column has width', () => {
      const cols: Column[] = [
        { key: 'name', label: '名称', width: 200 },
      ]

      const wrapper = mount(LineItemsTable, {
        props: { columns: cols, items: [{ name: 'test' }] },
      })

      const th = wrapper.find('th')
      expect(th.attributes('style')).toContain('width: 200px')
    })

    it('applies minWidth style when column has minWidth', () => {
      const cols: Column[] = [
        { key: 'name', label: '名称', minWidth: 100 },
      ]

      const wrapper = mount(LineItemsTable, {
        props: { columns: cols, items: [{ name: 'test' }] },
      })

      const th = wrapper.find('th')
      expect(th.attributes('style')).toContain('min-width: 100px')
    })

    it('does not apply width/min-width style when not set', () => {
      const cols: Column[] = [
        { key: 'name', label: '名称' },
      ]

      const wrapper = mount(LineItemsTable, {
        props: { columns: cols, items: [{ name: 'test' }] },
      })

      const th = wrapper.find('th')
      const style = th.attributes('style')
      expect(style).toBeUndefined()
    })

    it('supports string width values', () => {
      const cols: Column[] = [
        { key: 'name', label: '名称', width: '20%' },
      ]

      const wrapper = mount(LineItemsTable, {
        props: { columns: cols, items: [{ name: 'test' }] },
      })

      const th = wrapper.find('th')
      expect(th.attributes('style')).toContain('width: 20%')
    })

    it('applies align class to headers and cells', () => {
      const cols: Column[] = [
        { key: 'name', label: '名称', align: 'center' },
      ]

      const wrapper = mount(LineItemsTable, {
        props: { columns: cols, items: [{ name: 'test' }] },
      })

      const th = wrapper.find('th')
      expect(th.classes()).toContain('text-center')

      const td = wrapper.find('tbody td')
      expect(td.classes()).toContain('text-center')
    })
  })
})
