<template>
  <div class="artwork-die-info">
    <el-empty v-if="!items || items.length === 0" :description="emptyText">
      <el-button v-if="!disabled" type="primary" size="small" :icon="Plus" @click="handleAdd">{{ addButtonText }}</el-button>
    </el-empty>
    <div v-else>
      <div class="list-header"><span class="list-title">{{ title }}（{{ items.length }}）</span><el-button v-if="!disabled" type="primary" size="small" :icon="Plus" @click="handleAdd">添加</el-button></div>
      <el-table :data="items" border size="small" style="width: 100%">
        <el-table-column prop="name" :label="nameLabel" min-width="150" />
        <el-table-column prop="version" label="版本" width="80" align="center" />
        <el-table-column label="确认状态" width="100" align="center"><template #default="scope"><el-tag :type="scope.row.confirmed ? 'success' : 'warning'" size="small">{{ scope.row.confirmed ? '已确认' : '待确认' }}</el-tag></template></el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column v-if="!disabled" label="操作" width="120"><template #default="scope"><el-button type="text" size="small" style="color: #F56C6C" @click="handleRemove(scope.$index)">删除</el-button></template></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  title: { type: String, default: '列表' },
  nameLabel: { type: String, default: '名称' },
  emptyText: { type: String, default: '暂无数据' },
  addButtonText: { type: String, default: '添加' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['add', 'remove'])

const handleAdd = () => emit('add')
const handleRemove = (index) => emit('remove', index)
</script>

<style scoped>
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.list-title { font-weight: bold; color: #303133; }
</style>
