<template>
  <el-dialog v-model="visible" title="质检详情" width="var(--ui-dialog-width-lg)" @close="visible = false">
    <el-descriptions v-if="data" :column="2" border>
      <el-descriptions-item label="产品名称">{{ data.product_name }}</el-descriptions-item>
      <el-descriptions-item label="检验结果"><StatusTag :status="data.status" category="inspection" :label="data.status_display" /></el-descriptions-item>
      <el-descriptions-item label="合格数量">{{ data.passed_quantity || 0 }}</el-descriptions-item>
      <el-descriptions-item label="不合格数量">{{ data.failed_quantity || 0 }}</el-descriptions-item>
    </el-descriptions>
    <template #footer><el-button @click="visible = false">关闭</el-button></template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { StatusTag } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['update:visible'])
const visible = computed({ get: () => props.visible, set: (v) => emit('update:visible', v) })
</script>
