<template>
  <div v-if="hasProducts" class="mt-6">
    <div class="mb-3 font-bold">产品列表</div>
    <div class="overflow-x-auto">
      <table class="data-table w-full">
        <thead>
          <tr>
            <th class="w-52">产品名称</th>
            <th class="min-w-40">规格</th>
            <th class="w-24 text-center">拼版</th>
            <th class="w-28 text-right">数量</th>
            <th class="w-36 text-right">小计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in products" :key="row.id || row.product_code">
            <td>{{ row.product_name }} ({{ row.product_code }})</td>
            <td>{{ row.specification || '-' }}</td>
            <td class="text-center">{{ row.imposition_quantity || 1 }}拼</td>
            <td class="text-right">{{ row.quantity }} {{ row.unit }}</td>
            <td class="text-right">{{ row.product_detail ? `¥${(row.product_detail.unit_price * row.quantity).toFixed(2)}` : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({ products: { type: Array as any, default: () => [] } })
const hasProducts = computed(() => props.products?.length > 0)
</script>
