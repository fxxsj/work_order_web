/**
 * 统一错误处理器
 * 提供统一的错误处理和消息显示
 */
import { useUIStore } from '@/stores/ui'
import logger from '@/utils/logger'

export interface TaskErrorOptions {
  onConflict?: (data: ConflictData) => void
  onPermission?: (data: PermissionData) => void
  onOther?: (data: OtherErrorData) => void
}

export interface ConflictData {
  type: 'conflict'
  message: string
  currentOwner?: string
  taskId?: number
  retry?: { action_text: string }
}

export interface PermissionData {
  type: 'permission'
  message: string
}

export interface OtherErrorData {
  type: 'other'
  message: string
}

export interface ErrorInfo {
  message: string
  status?: number
  code?: string
}

export interface WithErrorHandlingOptions {
  loadingRef?: { value: boolean } | null
  successMessage?: string
  errorMessage?: string
  showSuccess?: boolean
  context?: string
}

export class ErrorHandler {
  static isConflictError(error: unknown): boolean {
    if (!error) return false
    const err = error as Record<string, unknown>
    if ((err.response as Record<string, unknown>)?.status === 409) return true
    if ((err.response as any)?.data?.code === 'task_conflict') return true
    return false
  }

  static isPermissionError(error: unknown): boolean {
    if (!error) return false
    const err = error as Record<string, unknown>
    return (err.response as Record<string, unknown>)?.status === 403
  }

  static handleTaskError(error: unknown, options: TaskErrorOptions = {}): ConflictData | PermissionData | OtherErrorData {
    const { onConflict = null, onPermission = null, onOther = null } = options

    if (this.isConflictError(error)) {
      const err = error as Record<string, unknown>
      const conflictData: ConflictData = {
        type: 'conflict',
        message: (err.response as any)?.data?.detail as string || '该任务正在被其他用户操作',
        currentOwner: (err.response as any)?.data?.current_owner as string | undefined,
        taskId: (err.response as any)?.data?.task_id as number | undefined,
        retry: (err.response as any)?.data?.retry as { action_text: string } | undefined
      }

      if (onConflict) {
        onConflict(conflictData)
      } else {
        this.showConflictMessage(conflictData)
      }
      return conflictData
    }

    if (this.isPermissionError(error)) {
      const err = error as Record<string, unknown>
      const permData: PermissionData = {
        type: 'permission',
        message: (err.response as any)?.data?.detail as string || '您没有权限执行此操作'
      }

      if (onPermission) {
        onPermission(permData)
      } else {
        this.showMessage(permData.message, 'error')
      }
      return permData
    }

    const err = error as any
    const otherData: OtherErrorData = {
      type: 'other',
      message: err?.response?.data?.detail as string || err?.message || '操作失败'
    }

    if (onOther) {
      onOther(otherData)
    } else {
      this.showMessage(otherData.message, 'error')
    }

    return otherData
  }

  static showConflictMessage(conflictData: ConflictData): void {
    const { currentOwner, retry } = conflictData
    let message = conflictData.message
    if (currentOwner) {
      message += `\n\n当前操作人：${currentOwner}`
    }

    useUIStore().confirm({
      title: '任务冲突',
      message,
      confirmText: retry?.action_text || '刷新页面',
      cancelText: '取消'
    }).then(confirmed => {
      if (confirmed) {
        location.reload()
      }
    })
  }

  static handle(error: unknown, context = ''): ErrorInfo {
    if (process.env.NODE_ENV === 'development') {
      logger.error(`[Error${context ? ` in ${context}` : ''}]`, error)
    }

    let message = '操作失败'
    if (error) {
      const err = error as Record<string, unknown>
      const responseData = (err.response as Record<string, unknown>)?.data as Record<string, unknown> | undefined

      // 优先从 errors 字段提取第一个字段错误（结构化错误格式）
      if (responseData?.errors && typeof responseData.errors === 'object') {
        const errors = responseData.errors as Record<string, unknown>
        for (const fieldName of Object.keys(errors)) {
          const fieldError = errors[fieldName]
          if (Array.isArray(fieldError) && fieldError.length > 0) {
            message = fieldError[0] as string
            break
          } else if (typeof fieldError === 'string') {
            message = fieldError
            break
          }
        }
      }

      // 其次检查其他字段
      if (message === '操作失败') {
        if (responseData?.error) {
          message = responseData.error as string
        } else if (responseData?.message) {
          message = responseData.message as string
        } else if (responseData?.detail) {
          message = responseData.detail as string
        } else if ((error as Error)?.message) {
          message = (error as Error).message
        }
      }
    }

    return {
      message,
      status: (error as any)?.response?.status as number | undefined,
      code: (error as any)?.code as string | undefined
    }
  }

  static showMessage(error: unknown, context = ''): void {
    const { message } = this.handle(error, context)
    useUIStore().showError(message)
  }

  static showError(message: string): void {
    useUIStore().showError(message)
  }

  static showSuccess(message: string): void {
    useUIStore().showSuccess(message)
  }

  static showWarning(message: string): void {
    useUIStore().showWarning(message)
  }

  static showInfo(message: string): void {
    useUIStore().showInfo(message)
  }

  static handleValidationError(error: unknown, formRef: { setFields: (fields: Record<string, unknown>) => void } | null = null): Record<string, string> {
    const errors: Record<string, string> = {}
    const err = error as any
    const data = err?.response?.data as Record<string, unknown> | undefined

    if (data && typeof data === 'object') {
      for (const [field, messages] of Object.entries(data)) {
        if (Array.isArray(messages)) {
          errors[field] = messages.join(', ')
        } else if (typeof messages === 'string') {
          errors[field] = messages
        }
      }

      if (formRef && typeof formRef.setFields === 'function') {
        const formErrors: Record<string, unknown> = {}
        for (const [field, msg] of Object.entries(errors)) {
          formErrors[field] = [{ message: msg, field }]
        }
        formRef.setFields(formErrors)
      }
    }

    return errors
  }

  static confirm(message: string, title = '确认操作', options: Record<string, unknown> = {}): Promise<boolean> {
    return useUIStore().confirm({
      title,
      message,
      confirmText: options.confirmText as string || options.confirmButtonText as string || '确定',
      cancelText: options.cancelText as string || options.cancelButtonText as string || '取消',
      danger: options.danger as boolean || options.type === 'error'
    })
  }

  static async withConfirm<T>(asyncFn: () => Promise<T>, message: string, title = '确认操作'): Promise<T> {
    const confirmed = await this.confirm(message, title)
    if (!confirmed) {
      throw new Error('cancel')
    }
    return asyncFn()
  }

  static async withErrorHandling<T>(asyncFn: () => Promise<T>, options: WithErrorHandlingOptions = {}): Promise<T> {
    const {
      loadingRef = null,
      successMessage = '操作成功',
      errorMessage = '操作失败',
      showSuccess = true,
      context = ''
    } = options

    try {
      if (loadingRef) {
        loadingRef.value = true
      }

      const result = await asyncFn()

      if (showSuccess) {
        this.showSuccess(successMessage)
      }

      return result
    } catch (error: any) {
      if ((error as Error)?.message === 'cancel') {
        throw error
      }

      this.showMessage(error, context || errorMessage)
      throw error
    } finally {
      if (loadingRef) {
        loadingRef.value = false
      }
    }
  }
}

export default ErrorHandler
