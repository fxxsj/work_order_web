<template>
  <div class="component-error">
    <el-icon class="error-icon">
      <Warning />
    </el-icon>
    <p class="error-text">
      {{ text }}
    </p>
    <el-button
      v-if="showRetry"
      type="primary"
      size="small"
      @click="handleRetry"
    >
      重试
    </el-button>
  </div>
</template>

<script setup>
import { Warning } from '@element-plus/icons-vue'

const props = defineProps({
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

<style scoped>
.component-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 20px;
}

.error-icon {
  font-size: 48px;
  color: #f56c6c;
  margin-bottom: 16px;
}

.error-text {
  margin: 0 0 16px;
  font-size: 14px;
  color: #606266;
}
</style>
