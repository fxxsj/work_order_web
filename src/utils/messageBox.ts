/**
 * Element Plus ElMessageBox compatible API
 * Uses native confirm/alert for now; can be upgraded to custom ConfirmDialog later
 */

interface MessageBoxOptions {
  confirmButtonText?: string
  cancelButtonText?: string
  inputValue?: string
  type?: string
}

export interface MessageBoxInstance {
  confirm: (message: string, title?: string, options?: MessageBoxOptions) => Promise<string>
  alert: (message: string, title?: string, options?: MessageBoxOptions) => Promise<void>
  prompt: (message: string, title?: string, options?: MessageBoxOptions) => Promise<{ value: string }>
}

export const ElMessageBox: MessageBoxInstance = {
  confirm(message: string, title = '确认', options: MessageBoxOptions = {}) {
    const ok = window.confirm(`${title}\n\n${message}`)
    if (ok) {
      return Promise.resolve('confirm')
    }
    return Promise.reject(new Error('cancel'))
  },

  alert(message: string, title = '提示', _options: MessageBoxOptions = {}) {
    window.alert(`${title}\n\n${message}`)
    return Promise.resolve()
  },

  prompt(message: string, title = '请输入', options: MessageBoxOptions = {}) {
    const value = window.prompt(`${title}\n\n${message}`, options?.inputValue || '')
    if (value === null) {
      return Promise.reject(new Error('cancel'))
    }
    return Promise.resolve({ value })
  }
}

export default ElMessageBox
