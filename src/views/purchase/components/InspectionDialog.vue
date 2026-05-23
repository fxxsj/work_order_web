<template>
  <BaseDialog :show="dialogVisible" title="质检确认" width="wide" @close="handleClose; dialogVisible = false;">
    <div class="relative" :class="{ 'opacity-50 pointer-events-none': loading }">
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
      <table class="data-table w-full">
        <thead>
          <tr>
            <th class="min-w-[150px] text-left">物料名称</th>
            <th class="w-[120px] text-left">物料编码</th>
            <th class="w-[100px] text-right">收货数量</th>
            <th class="w-[100px] text-left">质检状态</th>
            <th class="w-[150px] text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in records" :key="index">
            <td>{{ row.material_name }}</td>
            <td>{{ row.material_code }}</td>
            <td class="text-right">{{ row.received_quantity }}</td>
            <td><StatusTag :status="row.inspection_status" category="inspection" :label="row.inspection_status_display" size="small" /></td>
            <td>
              <button class="btn btn-ghost btn-sm" v-if="row.inspection_status === 'pending'" @click="showForm(row)">质检</button>
              <button class="btn btn-ghost btn-sm" v-if="canStockIn(row)" @click="handleStockIn(row)">入库</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer><button class="btn" @click="handleClose">取消</button><button class="btn btn-primary" @click="handleSubmit">确认</button></template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StatusTag } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, records: { type: Array as any, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible', 'inspect', 'stock-in'])

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const canStockIn = (r: any) => r.inspection_status === 'passed'
const showForm = (row: any) => emit('inspect', row)
const handleStockIn = (row: any) => emit('stock-in', row)
const handleSubmit = () => emit('submit')
const handleClose = () => emit('update:visible', false)
</script>
