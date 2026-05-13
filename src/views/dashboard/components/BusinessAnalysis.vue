<template>
  <div class="business-analysis">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="12">
        <el-card>
          <template #header><span>客户统计（Top 10）</span></template>
          <el-table :data="businessAnalysis?.customer_statistics || []" style="width: 100%" max-height="300">
            <el-table-column prop="customer" label="客户" min-width="150" />
            <el-table-column prop="total" label="施工单数" width="100" align="right" />
            <el-table-column prop="completed" label="已完成" width="100" align="right" />
            <el-table-column label="完成率" width="120" align="right"><template #default="scope"><el-progress :percentage="scope.row.completion_rate || 0" :color="getProgressColor(scope.row.completion_rate)" :stroke-width="8" /></template></el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12">
        <el-card>
          <template #header><span>产品统计（Top 10）</span></template>
          <el-table :data="businessAnalysis?.product_statistics || []" style="width: 100%" max-height="300">
            <el-table-column prop="product" label="产品" min-width="150" />
            <el-table-column prop="total" label="施工单数" width="100" align="right" />
            <el-table-column prop="completed" label="已完成" width="100" align="right" />
            <el-table-column label="完成率" width="120" align="right"><template #default="scope"><el-progress :percentage="scope.row.completion_rate || 0" :color="getProgressColor(scope.row.completion_rate)" :stroke-width="8" /></template></el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
defineProps({ businessAnalysis: { type: Object, default: () => ({}) } })
const getProgressColor = (rate) => rate >= 80 ? '#67C23A' : rate >= 50 ? '#409EFF' : '#E6A23C'
</script>
