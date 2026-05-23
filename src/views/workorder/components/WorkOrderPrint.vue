<template>
  <div>
    <div class="mb-6 flex justify-end gap-3 no-print">
      <button class="btn btn-primary" @click="handlePrint"><Icon name="printer" class="h-4 w-4" /> 打印</button>
      <button class="btn btn-secondary" @click="handleExportPDF"><Icon name="download" class="h-4 w-4" /> 导出PDF</button>
    </div>
    <div id="print-area" class="rounded-xl bg-white p-6">
      <div class="mb-6 text-center"><h1 class="text-2xl font-bold">{{ companyName }}</h1><h2 class="mt-2 text-xl">施工单详情</h2><div class="mt-4 flex justify-center gap-6 text-sm text-gray-500"><span>打印时间：{{ printTime }}</span><span>施工单号：{{ workOrder?.order_number }}</span></div></div>
      <div class="mb-6"><h3 class="mb-3 font-bold">基本信息</h3><table class="w-full border-collapse border border-gray-300"><tr><th class="border border-gray-300 px-3 py-2 text-left">客户名称</th><td class="border border-gray-300 px-3 py-2">{{ workOrder?.customer_name }}</td><th class="border border-gray-300 px-3 py-2 text-left">业务员</th><td class="border border-gray-300 px-3 py-2">{{ salespersonName }}</td></tr><tr><th class="border border-gray-300 px-3 py-2 text-left">产品名称</th><td class="border border-gray-300 px-3 py-2">{{ workOrder?.product_name || '-' }}</td><th class="border border-gray-300 px-3 py-2 text-left">生产数量</th><td class="border border-gray-300 px-3 py-2">{{ displayQuantity }} 车</td></tr></table></div>
      <div v-if="products?.length"><h3 class="mb-3 font-bold">产品列表</h3><table class="w-full border-collapse border border-gray-300"><tr><th class="border border-gray-300 px-3 py-2 text-left">产品名称</th><th class="border border-gray-300 px-3 py-2 text-left">规格</th><th class="border border-gray-300 px-3 py-2 text-left">数量</th></tr><tr v-for="(p, i) in products" :key="i"><td class="border border-gray-300 px-3 py-2">{{ p.product_name }}</td><td class="border border-gray-300 px-3 py-2">{{ p.specification || '-' }}</td><td class="border border-gray-300 px-3 py-2">{{ p.quantity }} {{ p.unit }}</td></tr></table></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

const props = defineProps({
  workOrder: { type: Object, default: null },
  products: { type: Array as any, default: () => [] },
  salespersonName: { type: String, default: '' },
  displayQuantity: { type: [Number, String], default: 0 },
  companyName: { type: String, default: '印刷公司' }
})

const printTime = new Date().toLocaleString('zh-CN')
const handlePrint = () => window.print()
const handleExportPDF = () => console.log('Export PDF')
</script>

<style scoped>
@media print { .no-print { display: none; } }
</style>