<template>
  <div class="mt-6">
    <div class="overflow-x-auto">
      <table class="data-table w-full cursor-pointer">
        <thead>
          <tr>
            <th class="w-20 text-center">任务ID</th>
            <th class="w-40">施工单号</th>
            <th class="min-w-52">任务内容</th>
            <th class="w-32">任务类型</th>
            <th class="w-28 text-center">状态</th>
            <th class="w-32">操作员</th>
            <th class="w-40">进度</th>
            <th class="w-32">截止日期</th>
            <th class="w-64">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tasks" :key="row.id" class="cursor-pointer" @click="handleRowClick(row)">
            <td class="text-center">{{ row.id }}</td>
            <td>{{ row.work_order_process_info?.work_order?.order_number || '-' }}</td>
            <td>{{ row.work_content }}</td>
            <td><StatusTag :status="row.task_type" category="taskType" :label="row.task_type_display" size="small" /></td>
            <td class="text-center"><StatusTag :status="row.status" category="task" :label="row.status_display" size="small" /></td>
            <td>{{ row.assigned_operator_name || '未分配' }}</td>
            <td><ProgressBar :percentage="calculateProgress(row)" :color="getProgressColor(row)" /></td>
            <td><span :class="isOverdue(row) ? 'font-bold text-danger-600 dark:text-danger-400' : ''">{{ formatDate(getTaskDeadline(row)) }}</span></td>
            <td @click.stop>
              <button v-if="canUpdate(row)" class="btn btn-primary btn-sm" @click="handleUpdate(row)"><Icon name="edit" size="sm" /> 更新</button>
              <button v-if="canAssign(row)" class="btn btn-warning btn-sm" @click="handleAssign(row)"><Icon name="user" size="sm" /> 分派</button>
              <button v-if="canComplete(row)" class="btn btn-success btn-sm" @click="handleComplete(row)"><Icon name="checkCircle" size="sm" /> 完成</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-6 flex justify-end">
      <Pagination
        :page="currentPage"
        :page-size="pageSize"
        :page-size-options="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @update:page-size="v => emit('page-size-change', v)"
        @update:page="v => emit('page-change', v)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { StatusTag, Pagination, Icon } from '@/components/common'
import { formatDate } from '@/utils/filter'

const props = defineProps({ tasks: { type: Array as any, default: () => [] }, editable: { type: Boolean, default: false }, loading: { type: Boolean, default: false }, total: { type: Number, default: 0 }, currentPage: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 } })
const emit = defineEmits(['row-click', 'task-update', 'task-assign', 'task-complete', 'page-size-change', 'page-change'])

const getTaskDeadline = (task: any) => task.deadline || task.due_date || null;
const calculateProgress = (task: any) => task.production_quantity ? Math.round(((task.quantity_completed || 0) / task.production_quantity) * 100) : 0;
const getProgressColor = (task: any) => calculateProgress(task) === 100 ? '#67c23a' : '#14b8a6';
const isOverdue = (task: any) => { const dl = getTaskDeadline(task); return dl && new Date(dl) < new Date() };

const canUpdate = (task: any) => props.editable && task.status !== 'completed' && task.status !== 'cancelled';
const canAssign = (task: any) => props.editable && task.status !== 'completed';
const canComplete = (task: any) => props.editable && task.status !== 'completed';

const handleRowClick = (row: any) => emit('row-click', row);
const handleUpdate = (task: any) => emit('task-update', task);
const handleAssign = (task: any) => emit('task-assign', task);
const handleComplete = (task: any) => emit('task-complete', task);
</script>
