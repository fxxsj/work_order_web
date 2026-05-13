<template>
  <div class="notification-alerts">
    <el-alert v-if="unreadCount > 0" type="info" :closable="false" show-icon class="alert-item">
      <template #title><span>您有 <strong class="count-text">{{ unreadCount }}</strong> 条未读通知</span><el-link type="primary" :underline="false" class="action-link" @click="emit('view-notifications')">查看通知</el-link></template>
    </el-alert>
    <el-alert v-if="isSalesperson && pendingApprovalCount > 0" type="warning" :closable="false" show-icon class="alert-item">
      <template #title><span>您有 <strong class="count-text warning">{{ pendingApprovalCount }}</strong> 个待审核的施工单，请及时处理。</span><el-link type="primary" :underline="false" class="action-link" @click="emit('view-pending-approvals')">点击查看</el-link></template>
    </el-alert>
    <el-alert v-if="isAdmin && urgentPriorityCount > 0" type="error" :closable="false" show-icon class="alert-item">
      <template #title><span>发现 <strong class="count-text error">{{ urgentPriorityCount }}</strong> 个紧急优先级施工单，请关注。</span><el-link type="primary" :underline="false" class="action-link" @click="emit('view-urgent')">查看详情</el-link></template>
    </el-alert>
  </div>
</template>

<script setup>
defineProps({
  unreadCount: { type: Number, default: 0 },
  pendingApprovalCount: { type: Number, default: 0 },
  urgentPriorityCount: { type: Number, default: 0 },
  isSalesperson: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
})
const emit = defineEmits(['view-notifications', 'view-pending-approvals', 'view-urgent'])
</script>

<style scoped>
.alert-item { margin-bottom: 10px; }
.count-text { color: #409EFF; font-size: 16px; }
.count-text.warning { color: #E6A23C; }
.count-text.error { color: #F56C6C; }
.action-link { margin-left: 10px; }
</style>
