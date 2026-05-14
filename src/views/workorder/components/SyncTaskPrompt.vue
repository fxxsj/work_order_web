<template>
  <el-dialog v-model="dialogVisible" title="任务同步确认" width="var(--ui-dialog-width-md)" :before-close="handleClose">
    <div v-loading="loading">
      <el-alert v-if="preview && preview.tasks_to_remove > 0" title="警告" :description="`将删除 ${preview.tasks_to_remove} 个草稿任务，此操作不可恢复`" type="warning" :closable="false" show-icon style="margin-bottom: 15px;" />
      <div v-if="preview" class="sync-preview">
        <el-card shadow="never">
          <template #header><span>同步预览</span></template>
          <div class="preview-content">
            <div class="preview-item"><el-icon><Delete /></el-icon><span>将删除 <strong>{{ preview.tasks_to_remove }}</strong> 个草稿任务</span></div>
            <div class="preview-item"><el-icon><Plus /></el-icon><span>将新增 <strong>{{ preview.tasks_to_add }}</strong> 个任务</span></div>
          </div>
        </el-card>
      </div>
      <el-alert v-if="preview && preview.tasks_to_remove === 0 && preview.tasks_to_add === 0" title="无需同步" description="当前工序配置与任务一致，无需进行同步操作" type="success" :closable="false" show-icon />
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button v-if="preview && (preview.tasks_to_remove > 0 || preview.tasks_to_add > 0)" type="primary" :loading="loading" @click="handleConfirm">确认同步</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { Delete, Plus } from '@element-plus/icons-vue'

const props = defineProps({ visible: { type: Boolean, default: false }, preview: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['confirm', 'update:visible'])

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

const handleConfirm = () => emit('confirm')
const handleClose = () => emit('update:visible', false)
</script>
