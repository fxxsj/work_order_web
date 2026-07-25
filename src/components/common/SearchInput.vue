<template>
  <div class="relative w-full">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <Icon
        name="search"
        size="md"
        class="text-gray-400"
      />
    </div>
    <input
      :value="modelValue"
      type="text"
      class="input pl-10"
      :placeholder="placeholder"
      @input="handleInput"
    >
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import Icon from '@/components/icons/Icon.vue'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  /** 输入触发 search 的防抖时间（ms），默认 300；传 0 表示无防抖 */
  debounceMs?: number
}>(), {
  placeholder: '搜索...',
  debounceMs: 300
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
}>()

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const clearTimer = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

// 输入时：v-model 立即同步（保持输入框响应），search 事件防抖后触发，
// 避免快速连续输入时产生大量被取消的请求（canceled toast 的源头之一）。
const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)

  // debounceMs === 0 时直接同步触发，保持兼容
  if (props.debounceMs <= 0) {
    emit('search', value)
    return
  }

  clearTimer()
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    emit('search', value)
  }, props.debounceMs)
}

onUnmounted(clearTimer)
</script>
