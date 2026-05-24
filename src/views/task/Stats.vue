<template>
  <div>
    <div class="card">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span class="text-base font-bold">任务统计</span>
        <div class="flex items-center gap-2">
          <input type="date" v-model="startDate" class="input w-36" placeholder="开始日期" @change="loadStats" />
          <span class="text-gray-400">至</span>
          <input type="date" v-model="endDate" class="input w-36" placeholder="结束日期" @change="loadStats" />
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div class="flex items-center gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20"><div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white"><Icon name="user" class="h-6 w-6" /></div><div><div class="text-2xl font-bold">{{ (summary as any).total_operators || 0 }}</div><div class="text-xs text-gray-500">操作员总数</div></div></div>
        <div class="flex items-center gap-3 rounded-xl bg-gray-100 p-4 dark:bg-dark-700"><div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-500 text-white"><Icon name="document" class="h-6 w-6" /></div><div><div class="text-2xl font-bold">{{ (summary as any).total_tasks || 0 }}</div><div class="text-xs text-gray-500">任务总数</div></div></div>
        <div class="flex items-center gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-900/20"><div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white"><Icon name="checkCircle" class="h-6 w-6" /></div><div><div class="text-2xl font-bold">{{ (summary as any).total_completed_tasks || 0 }}</div><div class="text-xs text-gray-500">已完成任务</div></div></div>
        <div class="flex items-center gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20"><div class="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-white"><Icon name="chartBar" class="h-6 w-6" /></div><div><div class="text-2xl font-bold">{{ (summary as any).total_completed_quantity || 0 }}</div><div class="text-xs text-gray-500">完成总数</div></div></div>
        <div class="flex items-center gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-900/20"><div class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white"><Icon name="exclamationTriangle" class="h-6 w-6" /></div><div><div class="text-2xl font-bold">{{ (summary as any).overdue_tasks || 0 }}</div><div class="text-xs text-gray-500">逾期任务</div></div></div>
        <div class="flex items-center gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20"><div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white"><Icon name="clock" class="h-6 w-6" /></div><div><div class="text-2xl font-bold">{{ (summary as any).pending_tasks || 0 }}</div><div class="text-xs text-gray-500">待处理任务</div></div></div>
      </div>
      <hr class="border-t border-gray-200 dark:border-dark-700 my-4" />
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div><h4 class="mb-4 font-bold">部门任务分布</h4><div ref="deptChartRef" class="h-60"></div></div>
        <div><h4 class="mb-4 font-bold">任务完成趋势</h4><div ref="trendChartRef" class="h-60"></div></div>
      </div>
      <hr class="border-t border-gray-200 dark:border-dark-700 my-4" />
      <div><h4 class="mb-4 font-bold">操作员任务统计</h4>
        <SummaryTable :columns="operatorColumns" :data="operatorStats" row-key="operator_name">
          <template #cell-avg_time="{ row }">
            {{ row.avg_time ? row.avg_time.toFixed(1) + 'h' : '-' }}
          </template>
        </SummaryTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { workOrderTaskAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'
import { Icon, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const startDate = ref('')
const endDate = ref('')
const summary = ref({})
const operatorStats = ref<any[]>([])
const deptChartRef = ref(null)
const trendChartRef = ref(null)
let deptChart: any = null
let trendChart: any = null

const operatorColumns: Column[] = [
  { key: 'operator_name', label: '操作员', class: 'w-36' },
  { key: 'total_tasks', label: '任务数', align: 'center', class: 'w-24' },
  { key: 'completed_tasks', label: '已完成', align: 'center', class: 'w-24' },
  { key: 'in_progress_tasks', label: '进行中', align: 'center', class: 'w-24' },
  { key: 'completed_quantity', label: '完成数量', align: 'center', class: 'w-28' },
  { key: 'avg_time', label: '平均耗时', align: 'center', class: 'w-28' },
]

const loadStats = async () => {
  try {
    const params = {}
    if (startDate.value) (params as any).start_date = startDate.value
    if (endDate.value) (params as any).end_date = endDate.value
    const response: any = await workOrderTaskAPI.getStats(params)
    summary.value = response?.summary || response || {}
    operatorStats.value = response?.by_operator || []
    initCharts()
  } catch (error: any) { ErrorHandler.showMessage(error, '加载统计数据失败') }
}

const initCharts = async () => {
  if (typeof window === 'undefined' || !(window as any).echarts) return
  const echarts = (window as any).echarts

  if (deptChartRef.value) {
    deptChart = echarts.init(deptChartRef.value)
    const deptData = operatorStats.value.map((o: any) => ({ name: o.operator_name, value: o.total_tasks }))
    deptChart.setOption({ tooltip: { trigger: 'item' }, series: [{ type: 'pie', radius: '60%', data: deptData, emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }] })
  }

  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    const dates = (summary.value as any).daily_completed?.map((d: any) => d.date) || []
    const values = (summary.value as any).daily_completed?.map((d: any) => d.count) || []
    trendChart.setOption({ tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: dates }, yAxis: { type: 'value' }, series: [{ data: values, type: 'line', smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#409EFF' } }] })
  }
}

const handleResize = () => { deptChart?.resize(); trendChart?.resize() }

onMounted(() => { loadStats(); window.addEventListener('resize', handleResize) })
onUnmounted(() => { window.removeEventListener('resize', handleResize); deptChart?.dispose(); trendChart?.dispose() })
</script>
