<template>
  <div class="pending-plate-list">
    <div v-if="items.length > 0">
      <el-table :data="items.slice(0, 5)" style="width: 100%" max-height="200" size="small">
        <el-table-column prop="code" label="编码" width="120" show-overflow-tooltip />
        <el-table-column prop="name" label="名称" min-width="100" show-overflow-tooltip />
        <el-table-column label="操作" width="80" fixed="right"><template #default="scope"><el-button type="text" size="small" :loading="confirmingItem === `${type}-${scope.row.id}`" @click="emit('confirm', { type, item: scope.row })">确认</el-button></template></el-table-column>
      </el-table>
      <div v-if="items.length > 5" class="more-items">还有 {{ items.length - 5 }} 项...</div>
    </div>
    <div v-else class="empty-state">暂无待确认{{ typeLabel }}</div>
  </div>
</template>

<script setup>
const props = defineProps({ items: { type: Array, default: () => [] }, type: { type: String, default: 'artwork' }, typeLabel: { type: String, default: '图稿' }, confirmingItem: { type: String, default: null } })
const emit = defineEmits(['confirm'])
</script>

<style scoped>
.more-items { text-align: center; color: #909399; font-size: 12px; margin-top: 5px; }
.empty-state { text-align: center; color: #909399; padding: 20px; }
</style>
