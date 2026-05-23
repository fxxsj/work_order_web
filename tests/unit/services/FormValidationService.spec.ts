/**
 * FormValidationService 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import formValidationService from '@/services/FormValidationService'

describe('FormValidationService', () => {
  describe('required', () => {
    it('应该通过非空值', () => {
      expect(formValidationService.required('hello').valid).toBe(true)
      expect(formValidationService.required(123).valid).toBe(true)
      expect(formValidationService.required(true).valid).toBe(true)
      expect(formValidationService.required([1, 2, 3]).valid).toBe(true)
    })

    it('应该拒绝 null', () => {
      const result = formValidationService.required(null)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('不能为空')
    })

    it('应该拒绝 undefined', () => {
      const result = formValidationService.required(undefined)
      expect(result.valid).toBe(false)
    })

    it('应该拒绝空字符串', () => {
      const result = formValidationService.required('')
      expect(result.valid).toBe(false)
    })

    it('应该拒绝空数组', () => {
      const result = formValidationService.required([])
      expect(result.valid).toBe(false)
    })

    it('应该使用自定义字段名', () => {
      const result = formValidationService.required('', '用户名')
      expect(result.message).toContain('用户名')
    })
  })

  describe('numberRange', () => {
    it('应该通过有效范围内的数字', () => {
      expect(formValidationService.numberRange(5, { min: 1, max: 10 }).valid).toBe(true)
      expect(formValidationService.numberRange(1, { min: 1, max: 10 }).valid).toBe(true)
      expect(formValidationService.numberRange(10, { min: 1, max: 10 }).valid).toBe(true)
    })

    it('应该拒绝非数字', () => {
      const result = formValidationService.numberRange('abc', {})
      expect(result.valid).toBe(false)
      expect(result.message).toContain('请输入有效的数字')
    })

    it('应该拒绝 NaN', () => {
      const result = formValidationService.numberRange(NaN, {})
      expect(result.valid).toBe(false)
    })

    it('应该正确处理 minExclusive', () => {
      expect(formValidationService.numberRange(1, { min: 1, minInclusive: false }).valid).toBe(false)
      expect(formValidationService.numberRange(2, { min: 1, minInclusive: false }).valid).toBe(true)
    })

    it('应该正确处理 maxExclusive', () => {
      expect(formValidationService.numberRange(10, { max: 10, maxInclusive: false }).valid).toBe(false)
      expect(formValidationService.numberRange(9, { max: 10, maxInclusive: false }).valid).toBe(true)
    })
  })

  describe('stringLength', () => {
    it('应该通过有效长度的字符串', () => {
      expect(formValidationService.stringLength('hello', { min: 3, max: 10 }).valid).toBe(true)
      expect(formValidationService.stringLength('hi', { min: 2 }).valid).toBe(true)
      expect(formValidationService.stringLength('hello', { max: 10 }).valid).toBe(true)
    })

    it('应该拒绝过短的字符串', () => {
      const result = formValidationService.stringLength('hi', { min: 5 })
      expect(result.valid).toBe(false)
      expect(result.message).toContain('长度不能少于')
    })

    it('应该拒绝过长的字符串', () => {
      const result = formValidationService.stringLength('hello world', { max: 5 })
      expect(result.valid).toBe(false)
      expect(result.message).toContain('长度不能超过')
    })

    it('应该自动转换非字符串值', () => {
      expect(formValidationService.stringLength(12345, { min: 3, max: 10 }).valid).toBe(true)
    })

    it('应该忽略前后空白', () => {
      expect(formValidationService.stringLength('  hello  ', { min: 5 }).valid).toBe(true)
    })
  })

  describe('dateRange', () => {
    it('应该通过有效日期', () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      expect(formValidationService.dateRange(today.toISOString(), {}).valid).toBe(true)
    })

    it('应该拒绝空值', () => {
      const result = formValidationService.dateRange('', {})
      expect(result.valid).toBe(false)
      expect(result.message).toContain('请输入日期')
    })

    it('应该拒绝无效日期格式', () => {
      const result = formValidationService.dateRange('invalid-date', {})
      expect(result.valid).toBe(false)
      expect(result.message).toContain('请输入有效的日期')
    })

    it('应该正确处理 minDate', () => {
      const minDate = '2024-01-01'
      expect(formValidationService.dateRange('2024-06-01', { minDate }).valid).toBe(true)
      expect(formValidationService.dateRange('2023-06-01', { minDate }).valid).toBe(false)
    })

    it('应该正确处理 maxDate', () => {
      const maxDate = '2024-12-31'
      expect(formValidationService.dateRange('2024-06-01', { maxDate }).valid).toBe(true)
      expect(formValidationService.dateRange('2025-06-01', { maxDate }).valid).toBe(false)
    })
  })

  describe('email', () => {
    it('应该通过有效邮箱', () => {
      expect(formValidationService.email('test@example.com').valid).toBe(true)
      expect(formValidationService.email('user.name@domain.co.uk').valid).toBe(true)
    })

    it('应该拒绝无效邮箱', () => {
      expect(formValidationService.email('invalid').valid).toBe(false)
      expect(formValidationService.email('test@').valid).toBe(false)
      expect(formValidationService.email('@domain.com').valid).toBe(false)
    })

    it('应该拒绝空值', () => {
      expect(formValidationService.email('').valid).toBe(false)
      expect(formValidationService.email(null).valid).toBe(false)
    })
  })

  describe('phone', () => {
    it('应该通过有效手机号', () => {
      expect(formValidationService.phone('13812345678').valid).toBe(true)
      expect(formValidationService.phone('19912345678').valid).toBe(true)
    })

    it('应该拒绝无效手机号', () => {
      expect(formValidationService.phone('12345678901').valid).toBe(false)
      expect(formValidationService.phone('1381234567').valid).toBe(false)
      expect(formValidationService.phone('abc').valid).toBe(false)
    })
  })

  describe('validateWorkOrderForm', () => {
    it('应该通过完整的表单数据', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const formData = {
        customer: 1,
        production_quantity: 100,
        delivery_date: tomorrow.toISOString().split('T')[0]
      }

      const result = formValidationService.validateWorkOrderForm(formData)
      expect(result.valid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('应该捕获缺失的客户', () => {
      const result = formValidationService.validateWorkOrderForm({
        customer: null,
        production_quantity: 100,
        delivery_date: '2025-12-31'
      })

      expect(result.valid).toBe(false)
      expect(result.errors.customer).toBeDefined()
    })

    it('应该捕获缺失的生产数量', () => {
      const result = formValidationService.validateWorkOrderForm({
        customer: 1,
        delivery_date: '2025-12-31'
      })

      expect(result.valid).toBe(false)
      expect(result.errors.production_quantity).toBeDefined()
    })

    it('应该捕获无效的生产数量范围', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const result = formValidationService.validateWorkOrderForm({
        customer: 1,
        production_quantity: -1,
        delivery_date: tomorrow.toISOString().split('T')[0]
      })

      expect(result.valid).toBe(false)
    })
  })

  describe('validateTaskCompleteForm', () => {
    it('应该通过不需要图稿的任务', () => {
      const result = formValidationService.validateTaskCompleteForm({
        task_type: 'general'
      })
      expect(result.valid).toBe(true)
    })

    it('应该捕获制版任务缺失的图稿', () => {
      const result = formValidationService.validateTaskCompleteForm({
        task_type: 'plate_making',
        has_artwork: true,
        artwork_ids: []
      })

      expect(result.valid).toBe(false)
      expect(result.errors.artwork_ids).toBeDefined()
    })
  })

  describe('validateTaskSplitForm', () => {
    it('应该通过有效的拆分数据', () => {
      const task = { production_quantity: 100 }
      const splits = [
        { production_quantity: 60 },
        { production_quantity: 40 }
      ]

      const result = formValidationService.validateTaskSplitForm(task, splits)
      expect(result.valid).toBe(true)
    })

    it('应该拒绝少于2个拆分', () => {
      const task = { production_quantity: 100 }
      const splits = [{ production_quantity: 100 }]

      const result = formValidationService.validateTaskSplitForm(task, splits)
      expect(result.valid).toBe(false)
      expect(result.errors.splits).toContain('至少需要拆分为 2 个子任务')
    })

    it('应该拒绝数量不匹配的拆分', () => {
      const task = { production_quantity: 100 }
      const splits = [
        { production_quantity: 30 },
        { production_quantity: 30 }
      ]

      const result = formValidationService.validateTaskSplitForm(task, splits)
      expect(result.valid).toBe(false)
      expect(result.errors.splits).toContain('拆分后的总数量')
    })

    it('应该捕获无效的拆分数量', () => {
      const task = { production_quantity: 100 }
      const splits = [
        { production_quantity: 0 },
        { production_quantity: 100 }
      ]

      const result = formValidationService.validateTaskSplitForm(task, splits)
      expect(result.valid).toBe(false)
    })
  })

  describe('validateCustomerForm', () => {
    it('应该通过完整的客户表单', () => {
      const result = formValidationService.validateCustomerForm({
        name: '测试客户',
        phone: '13812345678'
      })
      expect(result.valid).toBe(true)
    })

    it('应该拒绝缺失的客户名称', () => {
      const result = formValidationService.validateCustomerForm({})
      expect(result.valid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    it('应该拒绝过长的客户名称', () => {
      const result = formValidationService.validateCustomerForm({
        name: 'a'.repeat(101)
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('validateProductForm', () => {
    it('应该通过完整的产品表单', () => {
      const result = formValidationService.validateProductForm({
        name: '测试产品',
        code: 'P001',
        unit_price: 99.99
      })
      expect(result.valid).toBe(true)
    })

    it('应该拒绝缺失的产品名称', () => {
      const result = formValidationService.validateProductForm({
        code: 'P001'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    it('应该拒绝缺失的产品编号', () => {
      const result = formValidationService.validateProductForm({
        name: '测试产品'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.code).toBeDefined()
    })

    it('应该拒绝负数价格', () => {
      const result = formValidationService.validateProductForm({
        name: '测试产品',
        code: 'P001',
        unit_price: -10
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('validateBatch', () => {
    it('应该批量验证字段', () => {
      const rules = {
        name: (value: unknown) => ({
          valid: value !== undefined && (value as string).length >= 2,
          message: '名称至少2个字符'
        }),
        email: formValidationService.email
      }

      const data = {
        name: '测试',
        email: 'test@example.com'
      }

      const result = formValidationService.validateBatch(rules, data)
      expect(result.valid).toBe(true)
    })

    it('应该收集所有批量验证错误', () => {
      const rules = {
        name: (value: unknown) => ({
          valid: false,
          message: '名称错误'
        }),
        email: () => ({
          valid: false,
          message: '邮箱错误'
        })
      }

      const result = formValidationService.validateBatch(rules, {})
      expect(result.valid).toBe(false)
      expect(result.errors.name).toBe('名称错误')
      expect(result.errors.email).toBe('邮箱错误')
    })
  })

  describe('clearErrors', () => {
    it('应该清除所有错误', () => {
      formValidationService._errors = { name: 'error1', email: 'error2' }
      const errors = formValidationService.clearErrors()
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('应该清除指定字段的错误', () => {
      formValidationService._errors = { name: 'error1', email: 'error2' }
      const errors = formValidationService.clearErrors({}, 'name')
      expect(errors.name).toBeUndefined()
      expect(errors.email).toBe('error2')
    })
  })

  describe('hasErrors', () => {
    it('应该正确判断是否有错误', () => {
      formValidationService.clearErrors() // 先清除之前的错误
      expect(formValidationService.hasErrors()).toBe(false)

      formValidationService._errors = { name: 'error' }
      expect(formValidationService.hasErrors()).toBe(true)
    })
  })

  describe('getFirstError', () => {
    it('应该返回第一个错误消息', () => {
      formValidationService._errors = { name: '名称错误', email: '邮箱错误' }
      const firstError = formValidationService.getFirstError()
      expect(firstError).toBe('名称错误')
    })

    it('空错误时返回空字符串', () => {
      formValidationService._errors = {}
      expect(formValidationService.getFirstError()).toBe('')
    })
  })
})
