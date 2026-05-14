<template>
  <div class="crud-table-actions">
    <el-button
      v-if="showView"
      type="text"
      size="small"
      @click="emit('view')"
    >
      查看
    </el-button>
    <el-button
      v-if="showEdit"
      type="text"
      size="small"
      @click="emit('edit')"
    >
      编辑
    </el-button>
    <el-button
      v-if="showDelete"
      type="text"
      size="small"
      style="color: #F56C6C;"
      @click="emit('delete')"
    >
      删除
    </el-button>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  showView: { type: Boolean, default: true },
  showEdit: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true }
})

const emit = defineEmits(['view', 'edit', 'delete'])
</script>

<style scoped>
.crud-table-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>
