<template>
  <header class="glass sticky top-0 z-30 border-b border-gray-200/50 dark:border-dark-700/50">
    <div class="flex h-16 items-center justify-between px-4 md:px-6">
      <!-- Left: Mobile Menu Toggle + Page Title -->
      <div class="flex items-center gap-4">
        <button
          class="btn-ghost btn-icon lg:hidden"
          aria-label="Toggle Menu"
          @click="$emit('toggle-mobile-sidebar')"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        <div class="hidden lg:block">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ pageTitle }}
          </h1>
        </div>
      </div>

      <!-- Right: Actions + User -->
      <div class="flex items-center gap-3">
        <!-- Notification Center -->
        <NotificationCenter
          :notifications="notifications"
          :loading="notificationLoading"
          :connection-error="connectionError"
          @mark-all-read="markAllAsRead"
          @click="handleNotificationClick"
        />

        <!-- Quick Actions -->
        <select
          class="select btn-ghost btn-icon hidden sm:inline-flex"
          @change="handleQuickAction"
        >
          <option value="">
            新建
          </option>
          <option value="workorder">
            施工单
          </option>
          <option value="sales">
            客户订单
          </option>
          <option value="purchase">
            采购订单
          </option>
        </select>

        <!-- User Dropdown -->
        <div
          ref="dropdownRef"
          class="relative"
        >
          <button
            class="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-dark-800"
            aria-label="User Menu"
            @click="dropdownOpen = !dropdownOpen"
          >
            <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-medium text-white shadow-sm">
              {{ userInitials }}
            </div>
            <div class="hidden text-left md:block">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ displayName }}
              </div>
              <div class="text-xs text-gray-500 dark:text-dark-400">
                {{ userStore.currentUser?.is_staff ? '管理员' : '员工' }}
              </div>
            </div>
            <svg
              class="hidden h-4 w-4 text-gray-400 md:block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <transition name="dropdown">
            <div
              v-if="dropdownOpen"
              class="dropdown right-0 mt-2 w-56"
            >
              <!-- User Info -->
              <div class="border-b border-gray-100 px-4 py-3 dark:border-dark-700">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ displayName }}
                </div>
              </div>

              <div class="py-1">
                <router-link
                  to="/profile"
                  class="dropdown-item"
                  @click="closeDropdown"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  个人信息
                </router-link>

                <a
                  v-if="userStore.currentUser?.is_staff"
                  href="javascript:void(0)"
                  class="dropdown-item"
                  @click="openAdmin"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  管理后台
                </a>
              </div>

              <div class="border-t border-gray-100 py-1 dark:border-dark-700">
                <button
                  class="dropdown-item w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  @click="handleLogout"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  退出登录
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>

  <ConfirmDialog
    :show="logoutDialogVisible"
    title="退出登录"
    message="确定要退出登录吗？"
    confirm-text="确定"
    cancel-text="取消"
    :loading="logoutLoading"
    loading-text="退出中..."
    @confirm="handleLogoutConfirm"
    @cancel="handleLogoutCancel"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { Icon, ConfirmDialog } from '@/components/common'
import { authAPI, notificationAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { clearRefreshTimer } from '@/api'
import ErrorHandler from '@/utils/errorHandler'
import NotificationCenter from '@/components/NotificationCenter.vue'

defineEmits(['toggle-mobile-sidebar'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const dropdownOpen = ref(false)
const dropdownRef = ref<any>(null)
const logoutDialogVisible = ref(false)
const logoutLoading = ref(false)

// Page title from route meta
const pageTitle = computed(() => route.meta.title || '')

// User info
const userInitials = computed(() => {
  const name = userStore.currentUser?.username
  return name ? name.substring(0, 2).toUpperCase() : 'U'
})

const displayName = computed(() => {
  return userStore.currentUser?.username || '用户'
})

// Notification state
const notifications = ref<any[]>([])
const notificationLoading = ref(false)
const connectionError = ref(false)
let notificationPolling: any = null
let retryCount = 0
const MAX_RETRY_COUNT = 3
const BASE_RETRY_DELAY = 5000

const fetchNotifications = async () => {
  try {
    const response: any = await notificationAPI.list({ page: 1, page_size: 10 })
    notifications.value = response?.data?.results || response?.data || response?.results || []
    connectionError.value = false
    retryCount = 0
  } catch (error: any) {
    connectionError.value = true
    retryCount++
    if (retryCount <= MAX_RETRY_COUNT) {
      const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount - 1)
      setTimeout(fetchNotifications, delay)
    } else {
      retryCount = 0
    }
  }
}

const markAllAsRead = async () => {
  try {
    await notificationAPI.markAllRead()
    notifications.value = notifications.value.map((n: any) => ({ ...n, is_read: true }))
    useUIStore().showSuccess('已全部标记为已读')
  } catch (error: any) {
    ErrorHandler.handle(error, '标记已读')
  }
}

const handleNotificationClick = (notification: any) => {
  if (!notification.is_read) {
    notificationAPI.markAsRead(notification.id).then(() => {
      notification.is_read = true
    }).catch(console.warn)
  }
  if (notification.action_url) {
    router.push(notification.action_url)
  }
}

const handleQuickAction = (e: any) => {
  const command = e.target.value
  if (!command) return
  switch (command) {
    case 'workorder': router.push('/workorders/create'); break
    case 'sales': router.push('/sales-orders/create'); break
    case 'purchase': router.push('/purchase-orders/create'); break
  }
  e.target.value = '' // reset select
}

const openAdmin = () => {
  closeDropdown()
  const adminWindow = window.open('', '_blank', 'noopener')
  authAPI.createAdminSession().then((result: any) => {
    const adminUrl = result?.admin_url || result?.data?.admin_url || '/admin/'
    if (adminWindow) {
      adminWindow.location = adminUrl
    } else {
      window.open(adminUrl, '_blank', 'noopener')
    }
  }).catch(error => {
    if (adminWindow) adminWindow.close()
    ErrorHandler.handle(error, '打开管理后台')
  })
}

const handleLogout = () => {
  closeDropdown()
  logoutDialogVisible.value = true
}

const handleLogoutConfirm = async () => {
  logoutLoading.value = true
  try {
    await authAPI.logout()
  } catch (e: any) {
    console.warn('后端登出API调用失败，但继续清除本地状态', e)
  }
  userStore.clearUser()
  clearRefreshTimer() // 清除主动刷新定时器
  logoutLoading.value = false
  logoutDialogVisible.value = false
  useUIStore().showSuccess('已退出登录')
  setTimeout(() => { window.location.href = '/login' }, 500)
}

const handleLogoutCancel = () => {
  logoutDialogVisible.value = false
}

function closeDropdown() {
  dropdownOpen.value = false
}

function handleClickOutside(event: any) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchNotifications()
  notificationPolling = setInterval(fetchNotifications, 60000)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (notificationPolling) clearInterval(notificationPolling)
})
</script>

<style>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>
