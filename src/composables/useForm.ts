/**
 * useForm - 表单验证与状态管理 composable
 * 对齐 sub2api 的表单处理模式
 */
import { reactive, computed, ref, type Ref } from 'vue'

export interface FormRule {
  required?: boolean
  message?: string
  type?: 'number' | 'string' | 'email'
  min?: number
  max?: number
  minLen?: number
  maxLen?: number
  pattern?: RegExp | string
  validator?: (rule: FormRule, value: unknown, callback: (error?: string | Error) => void) => void
}

export type FormRules = Record<string, FormRule[]>

export interface FormRef {
  resetFields?: () => void
  value?: Record<string, unknown>
}

export function useForm(formRef?: Ref<FormRef | null | undefined>) {
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})
  const isValidating = ref(false)

  function validateField(prop: string, value: unknown, rules: FormRule[] | undefined): boolean | Promise<boolean> {
    if (!rules || !Array.isArray(rules)) {
      errors[prop] = ''
      return true
    }

    for (const rule of rules) {
      // 自定义验证器
      if (rule.validator) {
        return new Promise((resolve, reject) => {
          rule.validator!(rule, value, (err: any) => {
            if (err) {
              errors[prop] = typeof err === 'string' ? err : err.message || '验证失败'
              reject(errors[prop])
            } else {
              errors[prop] = ''
              resolve(true)
            }
          })
        })
      }

      // 必填验证
      if (rule.required) {
        const isEmpty =
          value === null ||
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)
        if (isEmpty) {
          errors[prop] = rule.message || '此字段为必填项'
          return false
        }
      }

      // 数字类型验证
      if (rule.type === 'number' && value !== null && value !== undefined && value !== '') {
        const num = Number(value)
        if (isNaN(num)) {
          errors[prop] = rule.message || '请输入有效的数字'
          return false
        }
        if (rule.min !== undefined && num < rule.min) {
          errors[prop] = rule.message || `值不能小于${rule.min}`
          return false
        }
        if (rule.max !== undefined && num > rule.max) {
          errors[prop] = rule.message || `值不能大于${rule.max}`
          return false
        }
      }

      // 正则验证
      if (rule.pattern && value) {
        const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern)
        if (!pattern.test(String(value))) {
          errors[prop] = rule.message || '格式不正确'
          return false
        }
      }

      // 字符串长度验证
      if (rule.minLen !== undefined && typeof value === 'string' && value.length < rule.minLen) {
        errors[prop] = rule.message || `长度不能少于${rule.minLen}个字符`
        return false
      }
      if (rule.maxLen !== undefined && typeof value === 'string' && value.length > rule.maxLen) {
        errors[prop] = rule.message || `长度不能超过${rule.maxLen}个字符`
        return false
      }
    }

    errors[prop] = ''
    return true
  }

  async function validate(formData: Record<string, unknown>, rules: FormRules): Promise<boolean> {
    if (!rules) return true

    isValidating.value = true
    const fields = Object.keys(rules)
    const results: boolean[] = []

    for (const prop of fields) {
      try {
        const result = validateField(prop, formData[prop], rules[prop])
        if (result instanceof Promise) {
          results.push(await result)
        } else {
          results.push(result)
        }
      } catch {
        results.push(false)
      }
    }

    isValidating.value = false
    return results.every(r => r)
  }

  function touchField(prop: string) {
    touched[prop] = true
  }

  function touchAll() {
    Object.keys(touched).forEach((k: any) => (touched[k] = true))
  }

  function clearErrors() {
    Object.keys(errors).forEach((k: any) => (errors[k] = ''))
  }

  function clearFieldError(prop: string) {
    if (errors[prop] !== undefined) {
      errors[prop] = ''
    }
  }

  function resetForm(initialValues?: Record<string, unknown>) {
    clearErrors()
    Object.keys(touched).forEach((k: any) => (touched[k] = false))
    if (formRef?.value?.resetFields) {
      formRef.value.resetFields()
    }
    if (initialValues && formRef?.value) {
      Object.assign(formRef.value, initialValues)
    }
  }

  function getError(prop: string): string {
    return errors[prop] || ''
  }

  function isTouched(prop: string): boolean {
    return touched[prop] === true
  }

  const hasErrors = computed(() => {
    return Object.values(errors).some((e: any) => e && e.length > 0)
  })

  return {
    errors,
    touched,
    isValidating,
    validate,
    validateField,
    touchField,
    touchAll,
    clearErrors,
    clearFieldError,
    resetForm,
    getError,
    isTouched,
    hasErrors
  }
}
