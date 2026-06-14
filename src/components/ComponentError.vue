<template>
  <div class="component-error">
    <Icon
      name="exclamationTriangle"
      class="h-12 w-12 text-danger-500"
    />
    <p class="error-text">
      {{ text }}
    </p>
    <button
      v-if="showRetry"
      class="btn btn-primary btn-sm"
      @click="handleRetry"
    >
      重试
    </button>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

defineProps({
  text: {
    type: String,
    default: '组件加载失败'
  },
  showRetry: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['retry'])

const handleRetry = () => {
  emit('retry')
  // 重新加载页面
  location.reload()
}
</script>

<style>
.component-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 20px;
}

.error-text {
  margin: 16px 0;
  font-size: 14px;
  color: #606266;
}
</style>
