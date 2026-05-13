<template>
  <div style="margin-top: 20px;">
    <div class="detail-section-title card-header"><span>物料信息</span><el-button size="small" type="primary" :icon="Plus" @click="emit('add-material')">添加物料</el-button></div>
    <el-table v-if="materials?.length" :data="materials" border style="width: 100%">
      <el-table-column label="物料名称" width="200"><template #default="scope">{{ scope.row.material_name }} ({{ scope.row.material_code }})</template></el-table-column>
      <el-table-column prop="material_size" label="尺寸" width="150" />
      <el-table-column prop="material_usage" label="用量" width="150" />
      <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip><template #default="scope">{{ scope.row.notes || '-' }}</template></el-table-column>
      <el-table-column label="采购状态" width="120"><template #default="scope"><el-tag :type="getStatusType(scope.row.purchase_status)" size="small">{{ scope.row.purchase_status_display }}</el-tag></template></el-table-column>
      <el-table-column label="采购日期" width="120"><template #default="scope">{{ formatDate(scope.row.purchase_date) }}</template></el-table-column>
      <el-table-column label="操作" width="100"><template #default="scope"><el-button type="text" size="small" @click="emit('update-material', scope.row)">编辑</el-button></template></el-table-column>
    </el-table>
    <el-empty v-else description="暂无物料" />
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({ materials: { type: Array, default: () => [] } })
const emit = defineEmits(['add-material', 'update-material'])

const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '-'
const getStatusType = (s) => ({ pending: 'info', ordered: 'primary', received: 'success', cut: 'warning', completed: 'success' })[s] || 'info')
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.detail-section-title { font-weight: bold; margin-bottom: 10px; }
</style>
