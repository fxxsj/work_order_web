import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Store exports
export { useUserStore } from './user'
export { useUIStore } from './ui'
export { useTaskStore } from './task'
export { useWorkOrderStore } from './workOrder'
export { useCacheStore } from './cache'
export { useNotificationStore } from './notification'