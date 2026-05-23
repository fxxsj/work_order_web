<template>
  <BaseDialog :show="dialogVisible" title="完成任务" width="normal" @close="handleClose; dialogVisible = false;">
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">状态</label>
        <div class="flex-1">
          <Tag type="success">已完成</Tag>
          <div class="mt-1 text-xs text-gray-400">强制完成任务，状态将标记为已完成</div>
        </div>
      </div>
      <div v-if="isPlateMakingTask" class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">完成数量</label>
        <div class="flex-1">
          <InputNumber v-model="form.quantity_completed" :min="1" :max="1" :step="1" disabled class="w-full" />
          <div class="mt-1 text-xs text-gray-400">制版任务完成数量固定为1</div>
        </div>
      </div>
      <div v-else class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">当前完成数量</label>
        <div class="flex-1">
          <InputNumber :model-value="task?.quantity_completed || 0" disabled class="w-full" />
          <div v-if="task?.production_quantity" class="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            计划数量：{{ task.production_quantity }}
            <span v-if="(task.quantity_completed || 0) < task.production_quantity" class="font-medium text-warning-600">（将强制标记为已完成）</span>
          </div>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">完成理由</label>
        <TextArea v-model="form.completion_reason" :rows="3" placeholder="请输入完成理由（可选）" class="flex-1" />
      </div>
      <div v-if="isDesignArtworkTask" class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">选择图稿</label>
        <div class="flex-1">
          <Select v-model="form.artwork_ids" :options="artworkOptions" multiple filterable placeholder="请选择图稿" class="w-full" @focus="$emit('load-artworks')" />
          <div class="mt-1 text-xs text-gray-400">选中的图稿将自动关联到施工单</div>
        </div>
      </div>
      <div v-if="isDesignDieTask" class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">选择刀模</label>
        <div class="flex-1">
          <Select v-model="form.die_ids" :options="dieOptions" multiple filterable placeholder="请选择刀模" class="w-full" @focus="$emit('load-dies')" />
          <div class="mt-1 text-xs text-gray-400">选中的刀模将自动关联到施工单</div>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">备注</label>
        <TextArea v-model="form.notes" :rows="2" placeholder="请输入备注（可选）" class="flex-1" />
      </div>
    </div>
    <template #footer>
      <button class="btn" @click="handleClose">取消</button>
      <button class="btn btn-primary" :disabled="loading" @click="handleSubmit">确定</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { BaseDialog, Tag, InputNumber, TextArea, Select } from '@/components/common'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null },
  artworkList: { type: Array as any, default: () => [] },
  dieList: { type: Array as any, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:visible', 'load-artworks', 'load-dies'])

const form = reactive({ quantity_completed: 0, completion_reason: '', artwork_ids: [], die_ids: [], notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const isPlateMakingTask = computed(() => props.task?.task_type === 'plate_making')
const isDesignArtworkTask = computed(() => props.task?.work_content?.includes('设计图稿') || props.task?.work_content?.includes('更新图稿'))
const isDesignDieTask = computed(() => props.task?.work_content?.includes('设计刀模') || props.task?.work_content?.includes('更新刀模'))
const artworkOptions = computed(() => props.artworkList.map((a: any) => ({ value: a.id, label: `${a.code || a.base_code || ''} - ${a.name || ''}` })))
const dieOptions = computed(() => props.dieList.map((d: any) => ({ value: d.id, label: `${d.code} - ${d.name}` })))

watch(() => props.task, (t: any) => {
  if (t) {
    form.quantity_completed = t.task_type === 'plate_making' ? 1 : (t.quantity_completed ?? t.production_quantity ?? 0)
    form.artwork_ids = []; form.die_ids = []
  }
})

const handleSubmit = () => emit('submit', { ...form })
const handleClose = () => { Object.assign(form, { quantity_completed: 0, completion_reason: '', artwork_ids: [], die_ids: [], notes: '' }) }
</script>
