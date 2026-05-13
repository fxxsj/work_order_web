<template>
  <div v-if="showDraftTasks" class="draft-task-management">
    <el-card>
      <template #header><div class="card-header"><span>草稿任务管理</span><el-tag type="info" size="small" style="margin-left: 10px;">{{ draftTasks.length }} 个草稿任务</el-tag></div></template>
      <el-alert title="提示" type="info" description="草稿任务是系统自动生成的任务预览，您可以在审核前批量编辑或删除这些任务。" :closable="false" style="margin-bottom: 15px;" />
      <el-table :data="draftTasks" border size="small" style="width: 100%;">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="任务ID" width="80" align="center" />
        <el-table-column prop="work_content" label="任务内容" min-width="200" />
        <el-table-column prop="task_type_display" label="任务类型" width="120" />
        <el-table-column prop="production_quantity" label="数量" width="100" align="center" />
        <el-table-column prop="status_display" label="状态" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
const props = defineProps({ draftTasks: { type: Array, default: () => [] }, showDraftTasks: { type: Boolean, default: false } })
const emit = defineEmits(['selection-change'])
</script>

<style scoped>
.card-header { display: flex; align-items: center; }
</style>
