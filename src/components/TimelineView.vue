<template>
  <div class="timeline-view">
    <el-timeline>
      <el-timeline-item
        v-for="(item, index) in timelineItems"
        :key="index"
        :timestamp="item.timestamp"
        :type="item.type"
        :icon="item.icon"
        :color="item.color"
        placement="top"
        size="large"
      >
        <el-card class="timeline-card" :class="`card-${item.type}`">
          <div class="card-header">
            <h4 class="card-title">
              {{ item.title }}
            </h4>
            <el-tag
              :type="getTagType(item.type)"
              size="small"
            >
              {{ item.typeLabel }}
            </el-tag>
          </div>
          <div class="card-content">
            <p v-if="item.content">
              {{ item.content }}
            </p>
            <div v-if="item.details" class="card-details">
              <div
                v-for="(detail, key) in item.details"
                :key="key"
                class="detail-item"
              >
                <span class="detail-label">{{ getDetailLabel(key) }}:</span>
                <span class="detail-value">{{ detail }}</span>
              </div>
            </div>
          </div>
          <div v-if="item.operator" class="card-footer">
            <el-icon><User /></el-icon>
            <span>{{ item.operator }}</span>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-if="timelineItems.length === 0" description="暂无时间线数据" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { User } from '@element-plus/icons-vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const timelineItems = computed(() => props.items)

const getTagType = (type) => {
  const typeMap = {
    create: 'success',
    update: 'warning',
    delete: 'danger',
    complete: 'success',
    assign: 'primary',
    status: 'info'
  }
  return typeMap[type] || 'info'
}

const getDetailLabel = (key) => {
  const labelMap = {
    operator: '操作人',
    department: '部门',
    status: '状态',
    remark: '备注'
  }
  return labelMap[key] || key
}
</script>

<style scoped>
.timeline-view {
  padding: 20px;
}

.timeline-card {
  margin-bottom: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.card-content {
  color: #606266;
}

.card-details {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.detail-item {
  display: flex;
  margin-bottom: 5px;
}

.detail-label {
  color: #909399;
  margin-right: 8px;
  min-width: 60px;
}

.detail-value {
  color: #303133;
}

.card-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 12px;
}

.card-footer .el-icon {
  margin-right: 5px;
}
</style>
