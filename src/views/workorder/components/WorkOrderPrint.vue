<template>
  <div class="work-order-print">
    <div class="print-actions no-print">
      <el-button type="primary" :icon="Printer" @click="handlePrint">打印</el-button>
      <el-button :icon="Download" @click="handleExportPDF">导出PDF</el-button>
    </div>
    <div id="print-area" class="print-area">
      <div class="print-header"><h1>{{ companyName }}</h1><h2>施工单详情</h2><div class="print-info"><span>打印时间：{{ printTime }}</span><span>施工单号：{{ workOrder?.order_number }}</span></div></div>
      <div class="print-section"><h3>基本信息</h3><table class="print-table"><tr><th>客户名称</th><td>{{ workOrder?.customer_name }}</td><th>业务员</th><td>{{ salespersonName }}</td></tr><tr><th>产品名称</th><td>{{ workOrder?.product_name || '-' }}</td><th>生产数量</th><td>{{ displayQuantity }} 车</td></tr></table></div>
      <div v-if="products?.length" class="print-section"><h3>产品列表</h3><table class="print-table"><tr><th>产品名称</th><th>规格</th><th>数量</th></tr><tr v-for="(p, i) in products" :key="i"><td>{{ p.product_name }}</td><td>{{ p.specification || '-' }}</td><td>{{ p.quantity }} {{ p.unit }}</td></tr></table></div>
    </div>
  </div>
</template>

<script setup>
import { Printer, Download } from '@element-plus/icons-vue'

const props = defineProps({
  workOrder: { type: Object, default: null },
  products: { type: Array, default: () => [] },
  salespersonName: { type: String, default: '' },
  displayQuantity: { type: [Number, String], default: 0 },
  companyName: { type: String, default: '印刷公司' }
})

const printTime = new Date().toLocaleString('zh-CN')
const handlePrint = () => window.print()
const handleExportPDF = () => console.log('Export PDF')
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.print-actions { display: flex; justify-content: flex-end; gap: var(--ui-control-gap); margin-bottom: var(--ui-section-gap); }
.print-area { background: #fff; padding: var(--ui-page-padding); }
.print-header { text-align: center; margin-bottom: var(--ui-section-gap); }
.print-section { margin: var(--ui-section-gap) 0; }
.print-table { width: 100%; border-collapse: collapse; }
.print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }

@media (max-width: bp.$breakpoint-phone-max) {
  .print-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .print-actions .el-button {
    width: 100%;
    margin-left: 0;
  }

  .print-area {
    overflow-x: auto;
  }
}

@media print { .no-print { display: none; } }
</style>
