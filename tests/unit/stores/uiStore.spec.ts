/**
 * UI Store 单元测试
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUIStore } from '@/stores/ui'

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Toast 通知', () => {
    it('showSuccess 应该显示成功 toast', () => {
      const store = useUIStore()
      const id = store.showSuccess('操作成功')

      expect(id).toBe('toast-1')
      expect(store.toasts.length).toBe(1)
      expect(store.toasts[0].type).toBe('success')
      expect(store.toasts[0].message).toBe('操作成功')
    })

    it('showError 应该显示错误 toast', () => {
      const store = useUIStore()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
      const id = store.showError('出错了', 5000)

      expect(store.toasts[0].type).toBe('error')
      expect(store.toasts[0].message).toBe('出错了')
    })

    it('showWarning 应该显示警告 toast', () => {
      const store = useUIStore()
      store.showWarning('注意')

      expect(store.toasts[0].type).toBe('warning')
    })

    it('showInfo 应该显示信息 toast', () => {
      const store = useUIStore()
      store.showInfo('提示信息')

      expect(store.toasts[0].type).toBe('info')
    })

    it('hideToast 应该隐藏指定的 toast', () => {
      const store = useUIStore()
      const id = store.showSuccess('测试')
      expect(store.toasts.length).toBe(1)

      store.hideToast(id)
      expect(store.toasts.length).toBe(0)
    })

    it('clearAllToasts 应该清除所有 toasts', () => {
      const store = useUIStore()
      store.showSuccess('消息1')
      store.showError('消息2')
      expect(store.toasts.length).toBe(2)

      store.clearAllToasts()
      expect(store.toasts.length).toBe(0)
    })

    it('hasActiveToasts 应该正确反映状态', () => {
      const store = useUIStore()
      expect(store.hasActiveToasts).toBe(false)

      store.showSuccess('消息')
      expect(store.hasActiveToasts).toBe(true)
    })
  })

  describe('Confirm 确认框', () => {
    it('confirm 应该打开确认状态并在确认时返回 true', async () => {
      const store = useUIStore()
      const promise = store.confirm({
        title: '删除',
        message: '确定删除吗？',
        confirmText: '删除',
        danger: true
      })

      expect(store.confirmState.show).toBe(true)
      expect(store.confirmState.title).toBe('删除')
      expect(store.confirmState.message).toBe('确定删除吗？')
      expect(store.confirmState.confirmText).toBe('删除')
      expect(store.confirmState.danger).toBe(true)

      store.closeConfirm(true)
      await expect(promise).resolves.toBe(true)
      expect(store.confirmState.show).toBe(false)
    })

    it('新 confirm 应该取消上一个未完成确认', async () => {
      const store = useUIStore()
      const first = store.confirm({ message: '第一个确认' })
      const second = store.confirm({ message: '第二个确认' })

      await expect(first).resolves.toBe(false)
      expect(store.confirmState.message).toBe('第二个确认')

      store.closeConfirm(false)
      await expect(second).resolves.toBe(false)
    })
  })

  describe('Loading 状态', () => {
    it('incLoading 应该增加引用计数', () => {
      const store = useUIStore()
      store.incLoading()
      expect(store.isLoading).toBe(true)
    })

    it('decLoading 应该减少引用计数', () => {
      const store = useUIStore()
      store.incLoading()
      store.incLoading()
      store.decLoading()
      expect(store.isLoading).toBe(true)
      store.decLoading()
      expect(store.isLoading).toBe(false)
    })

    it('decLoading 不应该小于 0', () => {
      const store = useUIStore()
      store.decLoading()
      expect(store.isLoading).toBe(false)
    })

    it('setLoading 应该直接设置状态', () => {
      const store = useUIStore()
      store.setLoading(true)
      expect(store.isLoading).toBe(true)
      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })

    it('withLoading 应该包装异步操作', async () => {
      const store = useUIStore()
      let operationStarted = false
      let operationCompleted = false

      await store.withLoading(async () => {
        operationStarted = store.isLoading
        await new Promise(resolve => setTimeout(resolve, 10))
        operationCompleted = true
        return 'result'
      })

      expect(operationStarted).toBe(true)
      expect(operationCompleted).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('withLoadingAndError 应该在错误时返回 null 并显示错误 toast', async () => {
      const store = useUIStore()

      const result = await store.withLoadingAndError(
        async () => {
          throw new Error('测试错误')
        },
        '自定义错误消息'
      )

      expect(result).toBe(null)
      // 检查是否有 error 类型的 toast
      const errorToast = store.toasts.find(t => t.type === 'error')
      expect(errorToast).toBeDefined()
    })

    it('withLoadingAndError 成功时应该返回结果', async () => {
      const store = useUIStore()
      const result = await store.withLoadingAndError(async () => '成功')

      expect(result).toBe('成功')
    })
  })

  describe('UI 状态', () => {
    it('toggleSidebar 应该切换侧边栏状态', () => {
      const store = useUIStore()
      const initial = store.sidebarCollapsed
      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(!initial)
    })

    it('setSidebarCollapsed 应该设置侧边栏状态', () => {
      const store = useUIStore()
      store.setSidebarCollapsed(true)
      expect(store.sidebarCollapsed).toBe(true)
      store.setSidebarCollapsed(false)
      expect(store.sidebarCollapsed).toBe(false)
    })

    it('setTheme 应该设置主题', () => {
      const store = useUIStore()
      store.setTheme('dark')
      expect(store.theme).toBe('dark')
      store.setTheme('light')
      expect(store.theme).toBe('light')
    })

    it('setLanguage 应该设置语言', () => {
      const store = useUIStore()
      store.setLanguage('en-US')
      expect(store.language).toBe('en-US')
    })
  })
})
