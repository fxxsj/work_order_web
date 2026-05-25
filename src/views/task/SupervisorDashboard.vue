<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        主管看板
      </h1>
      <button
        class="btn btn-secondary"
        :disabled="loading"
        title="刷新数据"
        @click="loadData"
      >
        <Icon
          name="refresh"
          size="md"
          :class="loading ? 'animate-spin' : ''"
        />
      </button>
    </div>

    <!-- 总体进度卡片 -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
        <h3 class="text-blue-100 text-sm font-medium mb-4">
          本周新开工单
        </h3>
        <div class="text-4xl font-bold">
          {{ overview.newOrders || 0 }}
        </div>
        <div class="mt-4 text-sm text-blue-100 flex justify-between">
          <span>同比上周</span>
          <span class="flex items-center text-green-300"><Icon
            name="arrowUp"
            size="sm"
            class="mr-1"
          />12%</span>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md p-6 text-white">
        <h3 class="text-orange-100 text-sm font-medium mb-4">
          异常/延期任务
        </h3>
        <div class="text-4xl font-bold">
          {{ overview.delayedTasks || 0 }}
        </div>
        <div class="mt-4 text-sm text-orange-100 flex justify-between">
          <span>需重点关注</span>
          <span class="underline cursor-pointer">立即查看</span>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md p-6 text-white">
        <h3 class="text-green-100 text-sm font-medium mb-4">
          本月完工率
        </h3>
        <div class="text-4xl font-bold">
          {{ overview.completionRate || '0%' }}
        </div>
        <div class="mt-4 text-sm text-green-100 flex justify-between">
          <span>目标 95%</span>
          <div class="w-24 bg-green-800/50 rounded-full h-2 mt-1.5 overflow-hidden">
            <div
              class="bg-white h-full"
              :style="{width: overview.completionRate || '0%'}"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 部门/操作员负荷监控 -->
    <div class="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
      <div class="border-b border-gray-100 dark:border-dark-700 px-6 py-4">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">
          各工序负荷监控
        </h2>
      </div>
      <div class="p-6">
        <div class="space-y-6">
          <div
            v-for="dept in workload"
            :key="dept.name"
            class="flex items-center"
          >
            <div class="w-32 font-medium text-gray-700 dark:text-gray-300">
              {{ dept.name }}
            </div>
            <div class="flex-1 ml-4">
              <div class="flex justify-between text-sm text-gray-500 mb-1">
                <span>{{ dept.current }} / {{ dept.capacity }} 个任务</span>
                <span :class="dept.ratio > 90 ? 'text-danger-500' : 'text-primary-600'">{{ dept.ratio }}%</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-dark-600 rounded-full h-2.5">
                <div 
                  class="h-2.5 rounded-full" 
                  :class="dept.ratio > 90 ? 'bg-danger-500' : (dept.ratio > 75 ? 'bg-warning-500' : 'bg-primary-500')"
                  :style="{width: `${Math.min(dept.ratio, 100)}%`}"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supervisorAPI } from '@/api/modules'
import { Icon } from '@/components/common'
import { useUIStore } from '@/stores/ui'

const loading = ref(false)
const overview = ref<any>({})
const workload = ref<any[]>([])

const loadData = async () => {
  loading.value = true
  try {
    // 模拟数据源接入，通常通过 supervisorAPI.getDashboardStats 获取
    overview.value = {
      newOrders: 45,
      delayedTasks: 3,
      completionRate: '88%'
    }
    workload.value = [
      { name: '印刷组', current: 12, capacity: 15, ratio: 80 },
      { name: '模切组', current: 18, capacity: 18, ratio: 100 },
      { name: '糊盒组', current: 5, capacity: 20, ratio: 25 },
      { name: '质检组', current: 22, capacity: 20, ratio: 110 }
    ]
  } catch (error) {
    useUIStore().showError('加载看板数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
