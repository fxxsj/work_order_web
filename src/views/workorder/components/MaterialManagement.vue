<template>
  <el-card>
    <template #header><div class="card-header"><span>物料信息</span><el-button v-if="editable" type="primary" size="small" :icon="Plus" @click="emit('add-material')">添加物料</el-button></div></template>
    <el-table :data="materials" border style="width: 100%">
      <el-table-column prop="material_name" label="物料名称" width="200" />
      <el-table-column prop="material_size" label="尺寸" width="150" />
      <el-table-column prop="material_usage" label="用量" width="150" />
      <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column label="采购状态" width="120" align="center"><template #default="scope"><StatusTag :status="scope.row.purchase_status" category="materialPurchase" size="small" /></template></el-table-column>
      <el-table-column label="采购日期" width="120"><template #default="scope">{{ formatDate(scope.row.purchase_date) }}</template></el-table-column>
      <el-table-column label="操作" width="150" fixed="right"><template #default="scope"><el-button type="primary" size="small" :disabled="!editable" @click="emit('update-status', scope.row)">更新状态</el-button></template></el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { StatusTag } from '@/components/common'

const props = defineProps({ materials: { type: Array, default: () => [] }, editable: { type: Boolean, default: false } })
const emit = defineEmits(['add-material', 'update-status'])

const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '-'
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
