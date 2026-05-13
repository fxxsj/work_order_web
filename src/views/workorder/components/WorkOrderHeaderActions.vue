<template>
  <div class="header-actions">
    <el-button :icon="Back" @click="emit('back')">返回</el-button>
    <div>
      <el-button :icon="Printer" @click="emit('print')">打印</el-button>
      <el-button v-if="canEdit" type="primary" :icon="Edit" style="margin-left: 10px;" @click="emit('edit')">编辑</el-button>
      <el-dropdown style="margin-left: 10px;" @command="handleStatusChange">
        <el-button type="success">更改状态<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="pending">待开始</el-dropdown-item>
            <el-dropdown-item command="in_progress">进行中</el-dropdown-item>
            <el-dropdown-item command="paused">已暂停</el-dropdown-item>
            <el-dropdown-item command="completed">已完成</el-dropdown-item>
            <el-dropdown-item command="cancelled">已取消</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { Back, Printer, Edit, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({ canEdit: { type: Boolean, default: false } })
const emit = defineEmits(['back', 'print', 'edit', 'status-change'])
const handleStatusChange = (command) => emit('status-change', command)
</script>
