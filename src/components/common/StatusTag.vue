<template>
  <el-tag :type="tagType" :size="size" :effect="effect" :hit="hit" :disable-transitions="disableTransitions" :color="color">
    <slot>{{ displayText }}</slot>
    <el-icon v-if="icon"><component :is="icon" /></el-icon>
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusMeta } from '@/constants/statusMeta'

const props = defineProps({
  status: { type: [String, Number], default: '' },
  category: { type: String, default: '' },
  statusMap: { type: Object, default: () => ({}) },
  label: { type: String, default: '' },
  size: { type: String, default: 'default' },
  effect: { type: String, default: 'light' },
  hit: { type: Boolean, default: false },
  disableTransitions: { type: Boolean, default: false },
  color: { type: String, default: '' }
})

const statusConfig = computed(() => {
  if (props.statusMap[props.status]) return props.statusMap[props.status]
  if (props.category) return getStatusMeta(props.category, props.status, { text: props.label })
  return {}
})
const tagType = computed(() => statusConfig.value.type || 'info')
const displayText = computed(() => props.label || statusConfig.value.text || props.status)
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
