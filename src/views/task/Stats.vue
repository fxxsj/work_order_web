<template>
  <div class="task-stats">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">任务统计</span>
          <el-date-picker v-model="dateRange" class="stats-date-control" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" @change="loadStats" />
        </div>
      </template>

      <el-row :gutter="20" class="stats-grid">
        <el-col :xs="24" :sm="12" :md="8"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><User /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.total_operators || 0 }}</div><div class="stat-label">操作员总数</div></div></div></el-card></el-col>
        <el-col :xs="24" :sm="12" :md="8"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #909399;"><el-icon><Document /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.total_tasks || 0 }}</div><div class="stat-label">任务总数</div></div></div></el-card></el-col>
        <el-col :xs="24" :sm="12" :md="8"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><CircleCheck /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.total_completed_tasks || 0 }}</div><div class="stat-label">已完成任务</div></div></div></el-card></el-col>
      </el-row>

      <el-row :gutter="20" class="stats-grid">
        <el-col :xs="24" :sm="12" :md="8"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><DataAnalysis /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.total_completed_quantity || 0 }}</div><div class="stat-label">完成总数</div></div></div></el-card></el-col>
        <el-col :xs="24" :sm="12" :md="8"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #F56C6C;"><el-icon><Warning /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.overdue_tasks || 0 }}</div><div class="stat-label">逾期任务</div></div></div></el-card></el-col>
        <el-col :xs="24" :sm="12" :md="8"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><Clock /></el-icon></div><div class="stat-info"><div class="stat-value">{{ summary.pending_tasks || 0 }}</div><div class="stat-label">待处理任务</div></div></div></el-card></el-col>
      </el-row>

      <el-divider />

      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <div class="chart-section">
            <h4>部门任务分布</h4>
            <div ref="deptChartRef" class="chart-container"></div>
          </div>
        </el-col>
        <el-col :xs="24" :lg="12">
          <div class="chart-section">
            <h4>任务完成趋势</h4>
            <div ref="trendChartRef" class="chart-container"></div>
          </div>
        </el-col>
      </el-row>

      <el-divider />

      <el-row :gutter="20">
        <el-col :span="24">
          <div class="table-section">
            <h4>操作员任务统计</h4>
            <div class="table-scroll">
            <el-table :data="operatorStats" border class="operator-table">
              <el-table-column prop="operator_name" label="操作员" width="150" />
              <el-table-column prop="total_tasks" label="任务数" width="100" align="center" />
              <el-table-column prop="completed_tasks" label="已完成" width="100" align="center" />
              <el-table-column prop="in_progress_tasks" label="进行中" width="100" align="center" />
              <el-table-column prop="completed_quantity" label="完成数量" width="120" align="center" />
              <el-table-column prop="avg_time" label="平均耗时" width="120" align="center">
                <template #default="scope">{{ scope.row.avg_time ? scope.row.avg_time.toFixed(1) + 'h' : '-' }}</template>
              </el-table-column>
            </el-table>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { workOrderTaskAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const dateRange = ref([])
const summary = ref({})
const operatorStats = ref([])
const deptChartRef = ref(null)
const trendChartRef = ref(null)
let deptChart = null
let trendChart = null

const loadStats = async () => {
  try {
    const params = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    const response = await workOrderTaskAPI.getStats(params)
    summary.value = response?.summary || response || {}
    operatorStats.value = response?.by_operator || []
    initCharts()
  } catch (error) { ErrorHandler.showMessage(error, '加载统计数据失败') }
}

const initCharts = async () => {
  if (typeof window === 'undefined' || !window.echarts) return
  const echarts = window.echarts

  if (deptChartRef.value) {
    deptChart = echarts.init(deptChartRef.value)
    const deptData = operatorStats.value.map(o => ({ name: o.operator_name, value: o.total_tasks }))
    deptChart.setOption({
      tooltip: { trigger: 'item' },
      series: [{ type: 'pie', radius: '60%', data: deptData, emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }]
    })
  }

  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    const dates = summary.value.daily_completed?.map(d => d.date) || []
    const values = summary.value.daily_completed?.map(d => d.count) || []
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [{ data: values, type: 'line', smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#409EFF' } }]
    })
  }
}

const handleResize = () => { deptChart?.resize(); trendChart?.resize() }

onMounted(() => { loadStats(); window.addEventListener('resize', handleResize) })
onUnmounted(() => { window.removeEventListener('resize', handleResize); deptChart?.dispose(); trendChart?.dispose() })
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.task-stats { padding: var(--ui-page-padding); }
.card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); }
.stats-date-control { width: min(100%, 300px); }
.title { font-weight: bold; font-size: 16px; }
.stats-grid { row-gap: var(--ui-section-gap); margin-top: var(--ui-section-gap); }
.stat-card { border-radius: 10px; }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
.chart-section { padding: 10px; }
.chart-section h4 { margin-bottom: 15px; color: #303133; }
.table-section h4 { margin-bottom: 10px; color: #303133; }
.chart-container { height: clamp(240px, 32vh, 360px); }
.table-scroll { margin-top: var(--ui-control-gap); overflow-x: auto; }
.operator-table { width: 100%; }

@media (max-width: bp.$breakpoint-phone-max) {
  .card-header {
    align-items: stretch;
    flex-direction: column;
  }

  .stats-date-control {
    width: 100%;
  }
}
</style>
