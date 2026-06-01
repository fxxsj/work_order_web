/**
 * 表单验证服务
 *
 * 提供统一的表单验证逻辑，避免在各个组件中重复编写验证代码
 */

export interface ValidationResult {
  valid: boolean
  message?: string
}

export interface BatchValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export interface NumberRangeOptions {
  min?: number
  minInclusive?: boolean
  max?: number
  maxInclusive?: boolean
}

export interface StringLengthOptions {
  min?: number
  max?: number
}

export interface DateRangeOptions {
  minDate?: string | Date
  maxDate?: string | Date
  min?: string | Date
  max?: string | Date
}

export type ValidatorFn = (value: unknown, data?: Record<string, unknown>) => ValidationResult

class FormValidationService {
  private _errors: Record<string, string>

  constructor() {
    this._errors = {}
  }

  required(value: unknown, fieldName = '该字段'): ValidationResult {
    if (value === null || value === undefined || value === '') {
      const message = `${fieldName}不能为空`
      this._errors[fieldName] = message
      return { valid: false, message }
    }

    if (Array.isArray(value) && value.length === 0) {
      const message = `${fieldName}不能为空`
      this._errors[fieldName] = message
      return { valid: false, message }
    }

    return { valid: true }
  }

  numberRange(value: unknown, options: NumberRangeOptions = {}): ValidationResult {
    const {
      min,
      minInclusive = true,
      max,
      maxInclusive = true
    } = options

    if (typeof value !== 'number' || isNaN(value)) {
      const message = '请输入有效的数字'
      this._errors.value = message
      return { valid: false, message }
    }

    if (min !== undefined) {
      if (minInclusive && value < min) {
        const message = `不能小于 ${min}`
        this._errors.value = message
        return { valid: false, message }
      }
      if (!minInclusive && value <= min) {
        const message = `必须大于 ${min}`
        this._errors.value = message
        return { valid: false, message }
      }
    }

    if (max !== undefined) {
      if (maxInclusive && value > max) {
        const message = `不能大于 ${max}`
        this._errors.value = message
        return { valid: false, message }
      }
      if (!maxInclusive && value >= max) {
        const message = `必须小于 ${max}`
        this._errors.value = message
        return { valid: false, message }
      }
    }

    return { valid: true }
  }

  stringLength(value: unknown, options: StringLengthOptions = {}): ValidationResult {
    const { min, max } = options

    let strValue = value
    if (typeof value !== 'string') {
      strValue = String(value)
    }

    const length = (strValue as string).trim().length

    if (min !== undefined && length < min) {
      return { valid: false, message: `长度不能少于 ${min} 个字符` }
    }

    if (max !== undefined && length > max) {
      return { valid: false, message: `长度不能超过 ${max} 个字符` }
    }

    return { valid: true }
  }

  dateRange(value: unknown, options: DateRangeOptions = {}): ValidationResult {
    const minDate = options.minDate || options.min
    const maxDate = options.maxDate || options.max

    if (!value) {
      return { valid: false, message: '请输入日期' }
    }

    const date = new Date(value as string | Date)
    if (isNaN(date.getTime())) {
      return { valid: false, message: '请输入有效的日期' }
    }

    if (minDate) {
      const min = new Date(minDate)
      min.setHours(0, 0, 0, 0)
      const compareDate = new Date(date)
      compareDate.setHours(0, 0, 0, 0)

      if (compareDate < min) {
        return { valid: false, message: `日期不能早于 ${minDate}` }
      }
    }

    if (maxDate) {
      const max = new Date(maxDate)
      max.setHours(0, 0, 0, 0)
      const compareDate = new Date(date)
      compareDate.setHours(0, 0, 0, 0)

      if (compareDate > max) {
        return { valid: false, message: `日期不能晚于 ${maxDate}` }
      }
    }

    return { valid: true }
  }

  email(value: unknown): ValidationResult {
    if (!value || typeof value !== 'string') {
      return { valid: false, message: '请输入邮箱地址' }
    }

    const email = value.trim()
    if (email === '') {
      return { valid: false, message: '请输入邮箱地址' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { valid: false, message: '请输入有效的邮箱地址' }
    }

    return { valid: true }
  }

  phone(value: unknown): ValidationResult {
    if (!value || typeof value !== 'string') {
      return { valid: false, message: '请输入手机号码' }
    }

    const phone = value.trim()
    if (phone === '') {
      return { valid: false, message: '请输入手机号码' }
    }

    const cleanPhone = phone.replace(/\D/g, '')
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(cleanPhone)) {
      return { valid: false, message: '请输入有效的手机号码' }
    }

    return { valid: true }
  }

  validateWorkOrderForm(formData: Record<string, unknown>): BatchValidationResult {
    const errors: Record<string, string> = {}

    const customerResult = this.required(formData.customer, '客户')
    if (!customerResult.valid) {
      errors.customer = customerResult.message!
    }

    if (formData.production_quantity) {
      const quantityResult = this.numberRange(formData.production_quantity as number, {
        min: 1,
        max: 1000000
      })
      if (!quantityResult.valid) {
        errors.production_quantity = quantityResult.message!
      }
    } else {
      errors.production_quantity = '生产数量不能为空'
    }

    if (formData.delivery_date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const dateResult = this.dateRange(formData.delivery_date, { minDate: today })
      if (!dateResult.valid) {
        errors.delivery_date = dateResult.message!
      }
    } else {
      errors.delivery_date = '交货日期不能为空'
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }

  validateTaskCompleteForm(formData: Record<string, unknown>): BatchValidationResult {
    const errors: Record<string, string> = {}

    if (formData.task_type === 'plate_making' && formData.has_artwork) {
      const artworkIds = formData.artwork_ids as unknown[] | undefined
      if (!artworkIds || artworkIds.length === 0) {
        errors.artwork_ids = '请选择图稿'
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }

  validateTaskSplitForm(task: Record<string, unknown>, splits: Array<Record<string, unknown>>): BatchValidationResult {
    const errors: Record<string, string> = {}

    if (!splits || splits.length < 2) {
      errors.splits = '至少需要拆分为 2 个子任务'
      return { valid: false, errors }
    }

    const totalQuantity = splits.reduce((sum: any, split: any) => sum + ((split.production_quantity as number) || 0), 0)

    if (totalQuantity !== task.production_quantity) {
      errors.splits = `拆分后的总数量(${totalQuantity})必须等于原任务数量(${task.production_quantity})`
      return { valid: false, errors }
    }

    splits.forEach((split, index) => {
      if (!split.production_quantity || (split.production_quantity as number) <= 0) {
        errors[`splits.${index}.quantity`] = '数量必须大于 0'
      }
    })

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }

  validateCustomerForm(formData: Record<string, unknown>): BatchValidationResult {
    const errors: Record<string, string> = {}

    const nameResult = this.required(formData.name, '客户名称')
    if (!nameResult.valid) {
      errors.name = nameResult.message!
    } else {
      const nameLengthResult = this.stringLength(formData.name, { min: 2, max: 100 })
      if (!nameLengthResult.valid) {
        errors.name = nameLengthResult.message!
      }
    }

    if (formData.contact_person) {
      const contactResult = this.stringLength(formData.contact_person, { max: 50 })
      if (!contactResult.valid) {
        errors.contact_person = contactResult.message!
      }
    }

    if (formData.phone) {
      const phoneRegEx = /^1[3-9]\d{9}$/
      if (!phoneRegEx.test(formData.phone as string)) {
        errors.phone = '请输入有效的手机号码'
      }
    }

    return { valid: Object.keys(errors).length === 0, errors }
  }

  validateProductForm(formData: Record<string, unknown>): BatchValidationResult {
    const errors: Record<string, string> = {}

    const nameResult = this.required(formData.name, '产品名称')
    if (!nameResult.valid) {
      errors.name = nameResult.message!
    }

    const code = (formData.code as string)?.trim() ?? ''
    if (!code) {
      errors.code = '产品编号不能为空'
    } else if (code.length < 2 || code.length > 50) {
      errors.code = '产品编码长度需在2-50个字符之间'
    } else if (!/^[A-Za-z0-9-]+$/.test(code)) {
      errors.code = '产品编码只能包含字母、数字和连字符'
    }

    const priceValue = formData.unit_price !== undefined ? formData.unit_price : formData.price
    if (priceValue !== undefined) {
      const priceResult = this.numberRange(priceValue as number, {
        min: 0,
        minInclusive: true
      })
      if (!priceResult.valid) {
        errors.unit_price = priceResult.message!
      }
    }

    return { valid: Object.keys(errors).length === 0, errors }
  }

  validateBatch(rules: Record<string, ValidatorFn>, data: Record<string, unknown>): BatchValidationResult {
    const errors: Record<string, string> = {}

    Object.entries(rules).forEach(([fieldName, validator]: [string, any]) => {
      const result = validator(data[fieldName], data)
      if (!result.valid) {
        errors[fieldName] = result.message!
      }
    })

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }

  clearErrors(_errors: Record<string, string> = {}, fields?: string | string[]): Record<string, string> {
    if (!fields) {
      this._errors = {}
      return {}
    }

    const fieldsToClear = Array.isArray(fields) ? fields : [fields]
    fieldsToClear.forEach((field: any) => {
      delete this._errors[field]
    })

    return { ...this._errors }
  }

  hasErrors(errors: Record<string, string> = {}): boolean {
    const errorObj = Object.keys(errors).length > 0 ? errors : this._errors
    return Object.keys(errorObj).length > 0
  }

  getFirstError(errors: Record<string, string> = {}): string {
    const errorObj = Object.keys(errors).length > 0 ? errors : this._errors
    const firstField = Object.keys(errorObj)[0]
    return firstField ? errorObj[firstField] : ''
  }
}

const formValidationService = new FormValidationService()

export default formValidationService
