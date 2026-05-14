<template>
  <el-descriptions title="其他信息" :column="1" border class="detail-section">
    <el-descriptions-item label="备注">{{ notes || '-' }}</el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
defineProps({ notes: { type: String, default: '' } })
</script>

<style scoped>
.detail-section { margin-top: var(--ui-section-gap); }
</style>
