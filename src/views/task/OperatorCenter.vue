<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">操作员任务中心</h1>
      <button class="btn btn-secondary" @click="loadStats" :disabled="loading" title="刷新数据">
        <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
      </button>
    </div>

    <!-- 核心指标卡片 -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-700 flex flex-col items-center justify-center">
        <span class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">待接收任务</span>
        <span class="text-3xl font-bold text-primary-600">{{ stats.pending_count || 0 }}</span>
      </div>
      <div class="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-700 flex flex-col items-center justify-center">
        <span class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">进行中任务</span>
        <span class="text-3xl font-bold text-amber-500">{{ stats.in_progress_count || 0 }}</span>
      </div>
      <div class="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-700 flex flex-col items-center justify-center">
        <span class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">待质检任务</span>
        <span class="text-3xl font-bold text-indigo-500">{{ stats.inspection_count || 0 }}</span>
      </div>
      <div class="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-700 flex flex-col items-center justify-center">
        <span class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">今日已完成</span>
        <span class="text-3xl font-bold text-green-500">{{ stats.completed_today || 0 }}</span>
      </div>
    </div>

    <!-- 任务列表区域 -->
    <div class="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
      <div class="border-b border-gray-100 dark:border-dark-700 px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">我的待办任务</h2>
      </div>
      
      <div class="p-6">
        <EmptyState
          v-if="!loading && !tasks.length"
          description="太棒了！您当前没有待处理的任务。"
          icon="checkCircle"
        />
        <div v-else-if="loading && !tasks.length" class="flex justify-center py-12">
          <Icon name="refresh" class="animate-spin text-gray-400" size="xl" />
        </div>
        <div v-else class="space-y-4">
          <!-- 简单列表展示 -->
          <div v-for="task in tasks" :key="task.id" class="p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:border-primary-300 transition-colors">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-gray-900 dark:text-white">{{ task.work_order_number }}</span>
                  <Tag type="primary" size="small">{{ task.process_name }}</Tag>
                </div>
                <p class="text-sm text-gray-500 mt-1">计划完成时间: {{ task.planned_end_time || '未指定' }}</p>
              </div>
              <button class="btn btn-primary btn-sm">开始任务</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { workOrderTaskAPI } from '@/api/modules'
import { EmptyState, Icon, Tag } from '@/components/common'
import { ElMessage } from '@/utils/message'

const loading = ref(false)
const stats = ref<any>({})
const tasks = ref<any[]>([])

const loadStats = async () => {
  loading.value = true
  try {
    // 假设通过 getList 或者某个专用 summary 接口获取我的任务概览
    // 这里做模拟展示逻辑
    stats.value = {
      pending_count: 3,
      in_progress_count: 1,
      inspection_count: 0,
      completed_today: 5
    }
    tasks.value = [
      { id: 1, work_order_number: 'WO-20231015-01', process_name: '覆膜', planned_end_time: '2023-10-15 18:00' },
      { id: 2, work_order_number: 'WO-20231015-02', process_name: '烫金', planned_end_time: '2023-10-16 12:00' }
    ]
  } catch (error) {
    ElMessage.error('加载任务数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>
