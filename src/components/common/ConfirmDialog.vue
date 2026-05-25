<template>
  <BaseDialog
    :show="show"
    :title="title"
    width="narrow"
    @close="handleCancel"
  >
    <div class="space-y-4">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ message }}
      </p>
      <slot />
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          :disabled="loading"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-200 dark:hover:bg-dark-600 dark:focus:ring-offset-dark-800"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          :disabled="loading"
          :class="[
            'rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-dark-800',
            danger
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
          ]"
          @click="handleConfirm"
        >
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseDialog from './BaseDialog.vue'

interface Props {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  loadingText?: string
  danger?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  danger: false,
  loading: false,
  confirmText: '确认',
  cancelText: '取消',
  loadingText: '处理中...'
})

const confirmText = computed(() => props.confirmText || '确认')
const cancelText = computed(() => props.cancelText || '取消')
const loadingText = computed(() => props.loadingText || '处理中...')

const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
