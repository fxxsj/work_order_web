<template>
  <div class="flex items-center gap-2">
    <template v-if="task.artwork_code">
      <span>{{ task.artwork_code }}</span><Tag
        v-if="task.artwork_confirmed !== null"
        :type="task.artwork_confirmed ? 'success' : 'info'"
        size="small"
      >
        {{ task.artwork_confirmed ? '已确认' : '未确认' }}
      </Tag>
    </template>
    <span v-else-if="task.die_code">{{ task.die_code }}</span>
    <div v-else-if="task.product_code">
      <span>{{ task.product_code }}</span><span
        v-if="task.product_name"
        class="ml-1 text-xs text-gray-400"
      >({{ task.product_name }})</span>
    </div>
    <div v-else-if="task.material_code">
      <span>{{ task.material_code }}</span><StatusTag
        v-if="task.material_purchase_status"
        :status="task.material_purchase_status"
        category="materialPurchase"
        size="small"
      />
    </div>
    <div v-else-if="task.foiling_plate_code">
      <span>{{ task.foiling_plate_code }}</span><span
        v-if="task.foiling_plate_name"
        class="ml-1 text-xs text-gray-400"
      >({{ task.foiling_plate_name }})</span>
    </div>
    <div v-else-if="task.embossing_plate_code">
      <span>{{ task.embossing_plate_code }}</span><span
        v-if="task.embossing_plate_name"
        class="ml-1 text-xs text-gray-400"
      >({{ task.embossing_plate_name }})</span>
    </div>
    <span v-else>-</span>
  </div>
</template>

<script setup lang="ts">
import { StatusTag } from '@/components/common'

defineProps({ task: { type: Object, required: true } })
</script>