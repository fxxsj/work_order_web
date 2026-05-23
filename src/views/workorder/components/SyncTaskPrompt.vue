<template>
  <BaseDialog :show="dialogVisible" title="任务同步确认" width="normal" @close="handleClose; dialogVisible = false;">
    <div v-loading="loading">
      <Alert v-if="preview && preview.tasks_to_remove > 0" title="警告" :description="`将删除 ${preview.tasks_to_remove} 个草稿任务，此操作不可恢复`" type="warning" :closable="false" show-icon style="margin-bottom: 15px;" />
      <div v-if="preview" class="sync-preview">
        <div class="card">
          <template #header><span>同步预览</span></template>
          <div class="preview-content">
            <div class="preview-item"><Icon name="trash" class="h-4 w-4" /><span>将删除 <strong>{{ preview.tasks_to_remove }}</strong> 个草稿任务</span></div>
            <div class="preview-item"><Icon name="plus" class="h-4 w-4" /><span>将新增 <strong>{{ preview.tasks_to_add }}</strong> 个任务</span></div>
          </div>
        </div>
      </div>
      <Alert v-if="preview && preview.tasks_to_remove === 0 && preview.tasks_to_add === 0" title="无需同步" description="当前工序配置与任务一致，无需进行同步操作" type="success" :closable="false" show-icon />
    </div>
    <template #footer>
      <button class="btn" @click="handleClose">取消</button>
      <button class="btn" v-if="preview && (preview.tasks_to_remove "> 0 || preview.tasks_to_add > 0)" type="primary" :loading="loading" @click="handleConfirm">确认同步</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, preview: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['confirm', 'update:visible'])

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

const handleConfirm = () => emit('confirm')
const handleClose = () => emit('update:visible', false)
</script>
