<template>
  <el-dialog v-model="dialogVisible" title="质检确认" width="var(--ui-dialog-width-lg)" :close-on-click-modal="false" @close="handleClose">
    <div v-loading="loading">
      <el-table :data="records" border stripe size="small">
        <el-table-column prop="material_name" label="物料名称" min-width="150" />
        <el-table-column prop="material_code" label="物料编码" width="120" />
        <el-table-column label="收货数量" width="100" align="right"><template #default="scope">{{ scope.row.received_quantity }}</template></el-table-column>
        <el-table-column label="质检状态" width="100"><template #default="scope"><StatusTag :status="scope.row.inspection_status" category="inspection" :label="scope.row.inspection_status_display" size="small" /></template></el-table-column>
        <el-table-column label="操作" width="150" fixed="right"><template #default="scope"><el-button v-if="scope.row.inspection_status === 'pending'" type="text" size="small" @click="showForm(scope.row)">质检</el-button><el-button v-if="canStockIn(scope.row)" type="text" size="small" @click="handleStockIn(scope.row)">入库</el-button></template></el-table-column>
      </el-table>
    </div>
    <template #footer><el-button @click="handleClose">取消</el-button><el-button type="primary" @click="handleSubmit">确认</el-button></template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { StatusTag } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, records: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible', 'inspect', 'stock-in'])

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const canStockIn = (r) => r.inspection_status === 'passed'
const showForm = (row) => emit('inspect', row)
const handleStockIn = (row) => emit('stock-in', row)
const handleSubmit = () => emit('submit')
const handleClose = () => emit('update:visible', false)
</script>
