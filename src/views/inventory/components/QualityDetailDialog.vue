<template>
  <BaseDialog :show="visible" title="质检详情" width="wide" @close="visible = false">
    <div v-if="data" class="descriptions-grid" style="--col: 2">
      <div class="description-item"><div class="description-label">产品名称</div><div class="description-value">{{ data.product_name }}</div></div>
      <div class="description-item"><div class="description-label">检验结果</div><div class="description-value"><StatusTag :status="data.status" category="inspection" :label="data.status_display" /></div></div>
      <div class="description-item"><div class="description-label">合格数量</div><div class="description-value">{{ data.passed_quantity || 0 }}</div></div>
      <div class="description-item"><div class="description-label">不合格数量</div><div class="description-value">{{ data.failed_quantity || 0 }}</div></div>
    </div>
    <template #footer><button class="btn" @click="visible = false">关闭</button></template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StatusTag } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['update:visible'])
const visible = computed({ get: () => props.visible, set: (v: any) => emit('update:visible', v) })
</script>
