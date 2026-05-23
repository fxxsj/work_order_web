<template>
  <BaseDialog :show="dialogVisible" title="库存不足预警" width="wide">
    <Alert v-if="materials.length > 0" type="warning" :closable="false" title="" description="">
      <template #title>发现 {{ materials.length }} 种物料库存不足，建议及时采购补货</template>
    </Alert>
    <div v-if="materials.length > 0" class="overflow-x-auto">
      <table class="data-table w-full">
        <thead>
          <tr>
            <th class="w-[120px] text-left">物料编码</th>
            <th class="w-[200px] text-left">物料名称</th>
            <th class="w-[120px] text-right">当前库存</th>
            <th class="w-[120px] text-right">最小库存</th>
            <th class="w-[120px] text-right">需要采购</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in materials" :key="index">
            <td>{{ row.code }}</td>
            <td>{{ row.name }}</td>
            <td class="text-right"><span :class="row.stock_quantity < row.min_stock_quantity ? 'font-bold text-danger-600' : ''">{{ row.stock_quantity }}</span></td>
            <td class="text-right">{{ row.min_stock_quantity }}</td>
            <td class="text-right">{{ row.needed_quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <EmptyState v-else title="暂无库存不足预警" />
    <template #footer>
      <button class="btn btn-primary" @click="handlePurchase">创建采购单</button>
      <button class="btn" @click="emit('update:visible', false)">关闭</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Alert, EmptyState } from '@/components/common'
const props = defineProps({ visible: { type: Boolean, default: false }, materials: { type: Array as any, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['purchase', 'update:visible'])
const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const handlePurchase = () => emit('purchase')
</script>
