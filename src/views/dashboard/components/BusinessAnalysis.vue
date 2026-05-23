<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div class="card">
      <div class="card-header flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-900 dark:text-white">客户统计（Top 10）</span>
      </div>
      <div class="card-body overflow-x-auto">
        <table class="data-table w-full">
          <thead>
            <tr>
              <th class="min-w-40">客户</th>
              <th class="w-28 text-right">施工单数</th>
              <th class="w-28 text-right">已完成</th>
              <th class="w-32 text-right">完成率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in (businessAnalysis?.customer_statistics || [])" :key="row.customer">
              <td>{{ row.customer }}</td>
              <td class="text-right">{{ row.total }}</td>
              <td class="text-right">{{ row.completed }}</td>
              <td class="text-right"><ProgressBar :percentage="row.completion_rate || 0" :color="getProgressColor(row.completion_rate)" :stroke-width="8" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-header flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-900 dark:text-white">产品统计（Top 10）</span>
      </div>
      <div class="card-body overflow-x-auto">
        <table class="data-table w-full">
          <thead>
            <tr>
              <th class="min-w-40">产品</th>
              <th class="w-28 text-right">施工单数</th>
              <th class="w-28 text-right">已完成</th>
              <th class="w-32 text-right">完成率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in (businessAnalysis?.product_statistics || [])" :key="row.product">
              <td>{{ row.product }}</td>
              <td class="text-right">{{ row.total }}</td>
              <td class="text-right">{{ row.completed }}</td>
              <td class="text-right"><ProgressBar :percentage="row.completion_rate || 0" :color="getProgressColor(row.completion_rate)" :stroke-width="8" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({ businessAnalysis: { type: Object, default: () => ({}) } })
const getProgressColor = (rate: any) => rate >= 80 ? '#67C23A' : rate >= 50 ? '#409EFF' : '#E6A23C'
</script>
