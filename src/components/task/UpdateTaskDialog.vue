<template>
  <BaseDialog
    :show="dialogVisible"
    title="更新任务"
    width="normal"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <Input
        :model-value="task?.work_content"
        label="任务内容"
        disabled
      />
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">生产数量</label>
        <InputNumber
          :model-value="task?.production_quantity"
          disabled
          class="flex-1"
        />
      </div>
      <div
        v-if="task"
        class="flex items-start gap-3"
      >
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">当前完成数量</label>
        <InputNumber
          :model-value="task.quantity_completed || 0"
          disabled
          class="flex-1"
        />
      </div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">本次完成数量</label>
        <div class="flex-1">
          <InputNumber
            v-model="formData.quantity_completed"
            :min="0"
            :max="task?.production_quantity ? (task.production_quantity - (task.quantity_completed || 0)) : 999999"
            class="w-full"
          />
          <div
            v-if="task?.production_quantity"
            class="text-xs text-gray-400 mt-1"
          >
            计划数量：{{ task.production_quantity }}，当前完成：{{ task.quantity_completed || 0 }}，更新后：{{ (task.quantity_completed || 0) + (formData.quantity_completed || 0) }}
            <span
              v-if="(task.quantity_completed || 0) + (formData.quantity_completed || 0) >= task.production_quantity"
              class="text-success-600"
            >（完成数量将达到计划数量）</span>
            <span
              v-else
              class="text-warning-600"
            >（完成数量未达到计划数量）</span>
          </div>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">本次不良品数量</label>
        <div class="flex-1">
          <InputNumber
            v-model="formData.quantity_defective"
            :min="0"
            class="w-full"
          />
          <div class="text-xs text-gray-400 mt-1">
            当前不良品：{{ task?.quantity_defective || 0 }}，更新后：{{ (task?.quantity_defective || 0) + (formData.quantity_defective || 0) }}
          </div>
        </div>
      </div>
      <div
        v-if="isDesignArtworkTask"
        class="flex items-start gap-3"
      >
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">选择图稿</label>
        <div class="flex-1">
          <Select
            v-model="formData.artwork_ids"
            :options="artworkOptions"
            multiple
            filterable
            placeholder="请选择图稿"
            class="w-full"
            :loading="loadingArtworks"
          />
          <div class="text-xs text-gray-400 mt-1">
            选中的图稿将自动关联到施工单
          </div>
        </div>
      </div>
      <div
        v-if="isDesignDieTask"
        class="flex items-start gap-3"
      >
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">选择刀模</label>
        <div class="flex-1">
          <Select
            v-model="formData.die_ids"
            :options="dieOptions"
            multiple
            filterable
            placeholder="请选择刀模"
            class="w-full"
            :loading="loadingDies"
          />
          <div class="text-xs text-gray-400 mt-1">
            选中的刀模将自动关联到施工单
          </div>
        </div>
      </div>
      <TextArea
        v-model="formData.notes"
        label="任务备注"
        :rows="3"
        placeholder="请输入任务备注（可选）"
        class="w-full"
      />
    </div>
    <template #footer>
      <button
        class="btn"
        @click="handleClose"
      >
        取消
      </button>
      <button
        class="btn btn-primary"
        :disabled="submitting"
        @click="handleConfirm"
      >
        确定
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Input, TextArea, InputNumber, Select } from '@/components/common'
import { useUIStore } from '@/stores/ui'
import { artworkAPI, dieAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null }
})

const emit = defineEmits(['confirm', 'update:visible'])

const submitting = ref(false)
const artworkList = ref<any[]>([])
const dieList = ref<any[]>([])
const loadingArtworks = ref(false)
const loadingDies = ref(false)

const formData = reactive({ quantity_completed: 0, quantity_defective: 0, artwork_ids: [], die_ids: [], notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const isDesignArtworkTask = computed(() => props.task?.work_content?.includes('设计图稿') || props.task?.work_content?.includes('更新图稿'))
const isDesignDieTask = computed(() => props.task?.work_content?.includes('设计刀模') || props.task?.work_content?.includes('更新刀模'))

const artworkOptions = computed(() => artworkList.value.map((a: any) => ({ value: a.id, label: `${a.code || a.base_code || ''} - ${a.name || ''}` })))
const dieOptions = computed(() => dieList.value.map((d: any) => ({ value: d.id, label: `${d.code} - ${d.name}` })))

watch(() => props.visible, (val: any) => {
  if (val && props.task) {
    initFormData()
    if (isDesignArtworkTask.value) loadArtworkList()
    if (isDesignDieTask.value) loadDieList()
  }
})

const initFormData = () => { Object.assign(formData, { quantity_completed: 0, quantity_defective: 0, artwork_ids: [], die_ids: [], notes: '' }) }

const loadArtworkList = async () => {
  if (artworkList.value.length > 0) return
  loadingArtworks.value = true
  try { artworkList.value = ((await artworkAPI.getList({ page_size: 1000 })) as any)?.results || [] } catch (error: any) { ErrorHandler.handle(error); useUIStore().showError('加载图稿列表失败') } finally { loadingArtworks.value = false }
}

const loadDieList = async () => {
  if (dieList.value.length > 0) return
  loadingDies.value = true
  try { dieList.value = ((await dieAPI.getList({ page_size: 1000 })) as any)?.results || [] } catch (error: any) { ErrorHandler.handle(error); useUIStore().showError('加载刀模列表失败') } finally { loadingDies.value = false }
}

const handleConfirm = () => {
  const data: any = { quantity_increment: formData.quantity_completed || 0, quantity_defective: formData.quantity_defective || 0, notes: formData.notes }
  if (isDesignArtworkTask.value) data.artwork_ids = formData.artwork_ids
  if (isDesignDieTask.value) data.die_ids = formData.die_ids
  emit('confirm', data)
}

const handleClose = () => { emit('update:visible', false); resetForm() }
const resetForm = () => { Object.assign(formData, { quantity_completed: 0, quantity_defective: 0, artwork_ids: [], die_ids: [], notes: '' }) }
</script>
