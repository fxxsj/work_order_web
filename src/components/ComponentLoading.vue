<template>
  <div class="component-loading">
    <Icon
      name="loading"
      class="h-8 w-8 animate-spin text-primary-500"
    />
    <p class="loading-text">
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

const props = defineProps({
  text: {
    type: String,
    default: '加载中...'
  }
})
</script>

<style>
.component-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 20px;
}

.loading-text {
  margin: 16px 0 0;
  font-size: 14px;
  color: #909399;
}
</style>
