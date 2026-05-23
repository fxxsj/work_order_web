<template>
  <div class="timeline-view">
    <div class="timeline-container">
      <div
        v-for="(item, index) in timelineItems"
        :key="index"
        class="timeline-item"
      >
        <div class="timeline-tail"></div>
        <div class="timeline-node" :class="`timeline-node-${item.type}`" :style="item.color ? { backgroundColor: item.color } : {}">
          <Icon v-if="item.icon" :name="item.icon" class="h-3 w-3" />
        </div>
        <div class="timeline-content">
          <div class="card timeline-card" :class="`card-${item.type}`">
            <div class="card-header">
              <h4 class="card-title">{{ item.title }}</h4>
              <Tag :type="getTagType(item.type)" size="small">{{ item.typeLabel }}</Tag>
            </div>
            <div class="card-content">
              <p v-if="item.content">{{ item.content }}</p>
              <div v-if="item.details" class="card-details">
                <div v-for="(detail, key) in item.details" :key="key" class="detail-item">
                  <span class="detail-label">{{ getDetailLabel(key) }}:</span>
                  <span class="detail-value">{{ detail }}</span>
                </div>
              </div>
            </div>
            <div v-if="item.operator" class="card-footer">
              <Icon name="user" class="h-4 w-4" />
              <span>{{ item.operator }}</span>
            </div>
          </div>
          <div v-if="item.timestamp" class="timeline-timestamp">{{ item.timestamp }}</div>
        </div>
      </div>
    </div>
    <EmptyState v-if="timelineItems.length === 0" title="暂无时间线数据" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/components/common'

const props = defineProps({
  items: { type: Array as any, default: () => [] }
})

const timelineItems = computed(() => props.items)

const getTagType = (type: any) => {
  const typeMap = { create: 'success', update: 'warning', delete: 'danger', complete: 'success', assign: 'primary', status: 'info' }
  return (typeMap as any)[type] || 'info'
}

const getDetailLabel = (key: any) => {
  const labelMap = { operator: '操作人', department: '部门', status: '状态', remark: '备注' }
  return (labelMap as any)[key] || key
}
</script>

<style>
.timeline-view {
  padding: var(--ui-page-padding);
}

.timeline-container {
  padding-left: 20px;
}

.timeline-item {
  position: relative;
  padding-left: 28px;
  padding-bottom: 20px;
}

.timeline-item:last-child .timeline-tail {
  display: none;
}

.timeline-tail {
  position: absolute;
  left: 7px;
  top: 20px;
  bottom: 0;
  width: 2px;
  background-color: #e4e7ed;
}

.timeline-node {
  position: absolute;
  left: 0;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.timeline-node-create,
.timeline-node-complete { background-color: #67c23a; }
.timeline-node-update { background-color: #e6a23c; }
.timeline-node-delete { background-color: #f56c6c; }
.timeline-node-assign,
.timeline-node-primary { background-color: #409eff; }
.timeline-node-status,
.timeline-node-info { background-color: #909399; }

.timeline-content {
  position: relative;
}

.timeline-timestamp {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
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
  min-width: 6ch;
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
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
