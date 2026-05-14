<template>
  <el-tag :type="tagType" :size="size" :effect="effect" :hit="hit" :disable-transitions="disableTransitions" :color="color">
    <slot>{{ displayText }}</slot>
    <el-icon v-if="icon"><component :is="icon" /></el-icon>
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: [String, Number], required: true },
  statusMap: { type: Object, default: () => ({}) },
  size: { type: String, default: 'default' },
  effect: { type: String, default: 'light' },
  hit: { type: Boolean, default: false },
  disableTransitions: { type: Boolean, default: false },
  color: { type: String, default: '' }
})

const statusConfig = computed(() => props.statusMap[props.status] || {})
const tagType = computed(() => statusConfig.value.type || 'info')
const displayText = computed(() => statusConfig.value.text || props.status)
const icon = computed(() => statusConfig.value.icon || '')
</script>

<style scoped>
.status-icon {
  margin-right: 4px;
}
.el-tag .status-icon + span {
  margin-left: 4px;
}
</style>
