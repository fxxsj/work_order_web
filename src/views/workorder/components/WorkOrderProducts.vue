<template>
  <div v-if="hasProducts" style="margin-top: 20px;">
    <div class="detail-section-title">产品列表</div>
    <el-table :data="products" border style="width: 100%">
      <el-table-column label="产品名称" width="200"><template #default="scope">{{ scope.row.product_name }} ({{ scope.row.product_code }})</template></el-table-column>
      <el-table-column prop="specification" label="规格" show-overflow-tooltip><template #default="scope">{{ scope.row.specification || '-' }}</template></el-table-column>
      <el-table-column prop="imposition_quantity" label="拼版" width="100" align="center"><template #default="scope">{{ (scope.row.imposition_quantity || 1) }}拼</template></el-table-column>
      <el-table-column prop="quantity" label="数量" width="120" align="right"><template #default="scope">{{ scope.row.quantity }} {{ scope.row.unit }}</template></el-table-column>
      <el-table-column label="小计" width="150" align="right"><template #default="scope">{{ scope.row.product_detail ? `¥${(scope.row.product_detail.unit_price * scope.row.quantity).toFixed(2)}` : '-' }}</template></el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ products: { type: Array, default: () => [] } })
const hasProducts = computed(() => props.products?.length > 0)
</script>

<style scoped>
.detail-section-title { font-weight: bold; margin-bottom: 10px; }
</style>
