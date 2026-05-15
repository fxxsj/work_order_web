<template>
  <div class="related-info">
    <template v-if="task.artwork_code"><span>{{ task.artwork_code }}</span><el-tag v-if="task.artwork_confirmed !== null" :type="task.artwork_confirmed ? 'success' : 'info'" size="small">{{ task.artwork_confirmed ? '已确认' : '未确认' }}</el-tag></template>
    <span v-else-if="task.die_code">{{ task.die_code }}</span>
    <div v-else-if="task.product_code" class="related-info"><span>{{ task.product_code }}</span><span v-if="task.product_name" class="related-subtext">({{ task.product_name }})</span></div>
    <div v-else-if="task.material_code" class="related-info"><span>{{ task.material_code }}</span><StatusTag v-if="task.material_purchase_status" :status="task.material_purchase_status" category="materialPurchase" size="small" /></div>
    <div v-else-if="task.foiling_plate_code" class="related-info"><span>{{ task.foiling_plate_code }}</span><span v-if="task.foiling_plate_name" class="related-subtext">({{ task.foiling_plate_name }})</span></div>
    <div v-else-if="task.embossing_plate_code" class="related-info"><span>{{ task.embossing_plate_code }}</span><span v-if="task.embossing_plate_name" class="related-subtext">({{ task.embossing_plate_name }})</span></div>
    <span v-else>-</span>
  </div>
</template>

<script setup>
import { StatusTag } from '@/components/common'

defineProps({ task: { type: Object, required: true } })
</script>

<style scoped>
.related-info {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.related-subtext {
  color: #909399;
  font-size: 12px;
}
</style>
