<template>
  <div class="relative">
    <!-- 铃铛按钮 -->
    <button
      class="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-all hover:bg-gray-100 hover:scale-105 dark:text-gray-400 dark:hover:bg-dark-800"
      :class="{ 'text-blue-600 dark:text-blue-400': unreadCount > 0 }"
      :aria-label="'通知'"
      @click="openModal"
    >
      <Icon
        name="bell"
        size="md"
      />
      <!-- 未读红点 -->
      <span
        v-if="unreadCount > 0"
        class="absolute right-1 top-1 flex h-2 w-2"
      >
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span class="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
    </button>

    <!-- 通知列表 Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="isModalOpen"
          class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-gradient-to-br from-black/70 via-black/60 to-black/70 p-4 pt-[8vh] backdrop-blur-md"
          @click="closeModal"
        >
          <div
            class="w-full max-w-[620px] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-dark-800 dark:ring-white/10"
            @click.stop
          >
            <!-- Header with Gradient -->
            <div class="relative overflow-hidden border-b border-gray-100/80 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 px-6 py-5 dark:border-dark-700/50 dark:from-blue-900/10 dark:to-indigo-900/5">
              <div class="relative z-10 flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                      <Icon
                        name="bell"
                        size="sm"
                      />
                    </div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                      通知
                    </h2>
                  </div>
                  <p
                    v-if="unreadCount > 0"
                    class="mt-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span class="font-medium text-blue-600 dark:text-blue-400">{{ unreadCount }}</span>
                    条未读
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="hasUnread"
                    class="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:shadow-xl disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                    @click="markAllAsRead"
                  >
                    全部已读
                  </button>
                  <button
                    class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/50 text-gray-500 backdrop-blur-sm transition-all hover:bg-white hover:text-gray-700 dark:bg-dark-700/50 dark:text-gray-400 dark:hover:bg-dark-700 dark:hover:text-gray-300"
                    aria-label="关闭"
                    @click="closeModal"
                  >
                    <Icon
                      name="x"
                      size="sm"
                    />
                  </button>
                </div>
              </div>
              <!-- Decorative gradient -->
              <div class="absolute right-0 top-0 h-full w-48 bg-gradient-to-l from-indigo-100/20 to-transparent dark:from-indigo-900/10" />
            </div>

            <!-- Body -->
            <div class="max-h-[65vh] overflow-y-auto">
              <!-- Loading -->
              <div
                v-if="loading"
                class="flex items-center justify-center py-16"
              >
                <div class="relative">
                  <div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-dark-600 dark:border-t-blue-400" />
                  <div class="absolute inset-0 h-12 w-12 animate-pulse rounded-full border-4 border-blue-400/30" />
                </div>
              </div>

              <!-- 通知列表 -->
              <div v-else-if="notifications.length > 0">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="group relative flex items-center gap-4 border-b border-gray-100 px-6 py-4 transition-all hover:bg-gray-50 dark:border-dark-700 dark:hover:bg-dark-700/30"
                  :class="{ 'bg-blue-50/30 dark:bg-blue-900/5': !notification.is_read }"
                  style="min-height: 72px"
                  @click="handleClick(notification)"
                >
                  <!-- Status Indicator -->
                  <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                    <div
                      v-if="!notification.is_read"
                      class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    >
                      <!-- Pulse ring -->
                      <span class="absolute inline-flex h-full w-full animate-ping rounded-xl bg-blue-400 opacity-75" />
                      <!-- Icon -->
                      <Icon
                        :name="getNotificationIcon(notification.type)"
                        size="sm"
                        class="relative z-10"
                      />
                    </div>
                    <div
                      v-else
                      class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-dark-700 dark:text-gray-600"
                    >
                      <Icon
                        :name="getNotificationIcon(notification.type)"
                        size="sm"
                      />
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex min-w-0 flex-1 items-center justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {{ notification.title }}
                      </h3>
                      <div class="mt-1 flex items-center gap-2">
                        <time class="text-xs text-gray-500 dark:text-gray-400">
                          {{ formatTime(notification.created_at) }}
                        </time>
                        <span
                          v-if="!notification.is_read"
                          class="inline-flex items-center gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        >
                          <span class="relative flex h-1.5 w-1.5">
                            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
                          </span>
                          未读
                        </span>
                      </div>
                    </div>

                    <!-- Arrow -->
                    <div class="flex-shrink-0">
                      <svg
                        class="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <!-- Unread indicator bar -->
                  <div
                    v-if="!notification.is_read"
                    class="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600"
                  />
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-else
                class="flex flex-col items-center justify-center py-16"
              >
                <div class="relative mb-4">
                  <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600">
                    <Icon
                      name="inbox"
                      size="xl"
                      class="text-gray-400 dark:text-gray-500"
                    />
                  </div>
                  <div class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <svg
                      class="h-3.5 w-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  暂无通知
                </p>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  所有通知都已处理
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@/components/common'

const props = defineProps({
  notifications: {
    type: Array as () => Array<{
      id: number
      title: string
      message?: string
      type: 'info' | 'success' | 'warning' | 'error'
      is_read: boolean
      created_at: string
    }>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  connectionError: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['mark-all-read', 'click'])

const isModalOpen = ref(false)

const unreadCount = computed(() => {
  return props.notifications.filter((n) => !n.is_read).length
})

const hasUnread = computed(() => unreadCount.value > 0)

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function markAllAsRead() {
  emit('mark-all-read')
}

function handleClick(notification: any) {
  emit('click', notification)
  closeModal()
}

const getNotificationIcon = (type: string): 'infoCircle' | 'checkCircle' | 'exclamationTriangle' | 'xCircle' => {
  const iconMap: Record<string, 'infoCircle' | 'checkCircle' | 'exclamationTriangle' | 'xCircle'> = {
    info: 'infoCircle',
    success: 'checkCircle',
    warning: 'exclamationTriangle',
    error: 'xCircle'
  }
  return iconMap[type] || 'infoCircle'
}

const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && isModalOpen.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
/* Modal Animations */
.modal-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from > div:first-child {
  transform: scale(0.94) translateY(-12px);
  opacity: 0;
}

.modal-fade-leave-to > div:first-child {
  transform: scale(0.96) translateY(-8px);
  opacity: 0;
}

/* Scrollbar Styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
  border-radius: 4px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #4b5563, #374151);
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #94a3b8, #64748b);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #6b7280, #4b5563);
}
</style>
