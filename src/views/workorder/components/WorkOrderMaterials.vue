<template>
  <div class="work-order-materials">
    <div class="detail-section-title card-header"><span>物料信息</span><el-button size="small" type="primary" :icon="Plus" @click="emit('add-material')">添加物料</el-button></div>
    <div v-if="materials?.length" class="table-scroll">
    <el-table :data="materials" border class="materials-table">
      <el-table-column label="物料名称" width="200"><template #default="scope">{{ scope.row.material_name }} ({{ scope.row.material_code }})</template></el-table-column>
      <el-table-column prop="material_size" label="尺寸" width="150" />
      <el-table-column prop="material_usage" label="用量" width="150" />
      <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip><template #default="scope">{{ scope.row.notes || '-' }}</template></el-table-column>
      <el-table-column label="采购状态" width="120"><template #default="scope"><StatusTag :status="scope.row.purchase_status" :label="scope.row.purchase_status_display" category="materialPurchase" size="small" /></template></el-table-column>
      <el-table-column label="采购日期" width="120"><template #default="scope">{{ formatDate(scope.row.purchase_date) }}</template></el-table-column>
      <el-table-column label="操作" width="100"><template #default="scope"><el-button type="text" size="small" @click="emit('update-material', scope.row)">编辑</el-button></template></el-table-column>
    </el-table>
    </div>
    <el-empty v-else description="暂无物料" />
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { StatusTag } from '@/components/common'
import { formatDate } from '@/utils/filter'

const props = defineProps({ materials: { type: Array, default: () => [] } })
const emit = defineEmits(['add-material', 'update-material'])
</script>

<style scoped>
.work-order-materials { margin-top: var(--ui-section-gap); }
.card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.detail-section-title { font-weight: bold; margin-bottom: 10px; }
.table-scroll { overflow-x: auto; }
.materials-table { width: 100%; }
</style>
