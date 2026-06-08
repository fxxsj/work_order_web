import { createApp } from 'vue'
import { pinia } from './stores'
import router from './router'

import App from './App.vue'
import './assets/styles/tailwindcss.css'
import './assets/styles/global.scss'

// 全局过滤器（Vue 3 使用全局函数替代）
import { formatDate, formatDateTime } from '@/utils/filter'
import { useUserStore, useUIStore } from '@/stores'

bootstrap()

async function bootstrap() {
  // 创建应用实例
  const app = createApp(App)

  // 注册 Pinia（必须在 useUIStore 之前）
  app.use(pinia)

  const userStore = useUserStore()
  try {
    await userStore.restoreSession()
  } catch (error: any) {
    console.error('Init app failed:', error)
  }

  // 注册 Vue Router。先恢复会话，避免首屏路由守卫用到未初始化的用户状态。
  app.use(router)

  // 全局属性和函数
  app.config.globalProperties.$formatDate = formatDate
  app.config.globalProperties.$formatDateTime = formatDateTime

  // 全局错误处理
  app.config.errorHandler = (err: unknown, instance, info: string) => {
    console.error('Global error:', err)
    console.error('Component:', instance)
    console.error('Info:', info)
  }

  // 主题初始化 - 在 mount 前执行，避免首屏闪烁
  const uiStore = useUIStore()
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    uiStore.setTheme(savedTheme as 'light' | 'dark')
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    uiStore.setTheme('dark')
  }

  await router.isReady()
  app.mount('#app')
}
