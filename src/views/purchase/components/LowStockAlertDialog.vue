<template>
  <el-dialog v-model="dialogVisible" title="库存不足预警" width="var(--ui-dialog-width-lg)">
    <el-alert v-if="materials.length > 0" type="warning" :closable="false" show-icon style="margin-bottom: 16px"><template #title>发现 {{ materials.length }} 种物料库存不足，建议及时采购补货</template></el-alert>
    <el-table v-if="materials.length > 0" v-loading="loading" :data="materials" border>
      <el-table-column prop="code" label="物料编码" width="120" />
      <el-table-column prop="name" label="物料名称" width="200" />
      <el-table-column label="当前库存" width="120" align="right"><template #default="scope"><span :class="{ 'low-stock': scope.row.stock_quantity < scope.row.min_stock_quantity }">{{ scope.row.stock_quantity }}</span></template></el-table-column>
      <el-table-column prop="min_stock_quantity" label="最小库存" width="120" align="right" />
      <el-table-column prop="needed_quantity" label="需要采购" width="120" align="right" />
    </el-table>
    <el-empty v-else description="暂无库存不足预警" />
    <template #footer>
      <el-button type="primary" @click="handlePurchase">创建采购单</el-button>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ visible: { type: Boolean, default: false }, materials: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['purchase', 'update:visible'])
const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const handlePurchase = () => emit('purchase')
</script>

<style scoped>
.low-stock { color: #F56C6C; font-weight: bold; }
</style>
