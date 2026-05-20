import { createApp } from 'vue'
import { pinia } from './stores'
import router from './router'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import App from './App.vue'
import './assets/styles/tailwindcss.css'
import './assets/styles/global.scss'
import './assets/styles/element-plus-teal.css'

// 全局过滤器（Vue 3 使用全局函数替代）
import { formatDate, formatDateTime } from '@/utils/filter'
import { useUserStore } from '@/stores'

// 创建应用实例
const app = createApp(App)

// 注册 Pinia
app.use(pinia)

// 注册 Vue Router
app.use(router)

// 全局注册 Element Plus Icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局属性和函数
app.config.globalProperties.$formatDate = formatDate
app.config.globalProperties.$formatDateTime = formatDateTime
app.config.globalProperties.$message = ElMessage

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

// 挂载应用
app.mount('#app')

// 初始化应用
initApp()

async function initApp() {
  const userStore = useUserStore()
  try {
    await userStore.restoreSession()
  } catch (error) {
    console.error('Init app failed:', error)
  }
}
