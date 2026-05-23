<template>
  <BaseDialog :show="dialogVisible" title="完成任务" width="normal" @close="handleClose; dialogVisible = false;">
    <div class="space-y-4">
      <div><label class="input-label mb-1.5 block">状态</label>
        <StatusTag label="已完成" variant="success" />
        <div class="text-xs text-gray-400 mt-1">强制完成任务，状态将标记为已完成</div>
      </div>
      <div><label class="input-label mb-1.5 block">完成数量</label>
        <InputNumber v-model="formData.quantity_completed" :min="1" :max="1" :step="1" disabled class="w-full" />
        <div class="text-xs text-gray-400 mt-1">制版任务完成数量固定为1</div>
      </div>
      <div><label class="input-label mb-1.5 block">当前完成数量</label>
        <InputNumber :model-value="task?.quantity_completed || 0" disabled class="w-full" />
        <div v-if="task?.production_quantity" class="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          计划数量：{{ task.production_quantity }}
          <span v-if="(task.quantity_completed || 0) < task.production_quantity" class="font-medium text-warning-600">（当前完成数量小于计划数量，将强制标记为已完成）</span>
        </div>
      </div>
      <div><label class="input-label mb-1.5 block">完成理由</label><TextArea v-model="formData.completion_reason" :rows="3" placeholder="请输入完成理由（可选）" /></div>

      <div><label class="input-label mb-1.5 block">选择图稿</label>
        <Select v-model="artworkSelectedValue" :options="artworkOptions" placeholder="请选择图稿" searchable :disabled="loadingArtworks" @click="loadArtworkList" />
        <div v-if="formData.artwork_ids.length > 0" class="mt-2 flex flex-wrap gap-1">
          <Tag v-for="id in formData.artwork_ids" :key="id" type="info" size="small" class="cursor-pointer" @click="removeArtwork(id)">{{ getArtworkLabel(id) }} <span class="ml-1 text-gray-400">&times;</span></Tag>
        </div>
        <div class="text-xs text-gray-400 mt-1">选中的图稿将自动关联到施工单</div>
      </div>
      <div><label class="input-label mb-1.5 block">选择刀模</label>
        <Select v-model="dieSelectedValue" :options="dieOptions" placeholder="请选择刀模" searchable :disabled="loadingDies" @click="loadDieList" />
        <div v-if="formData.die_ids.length > 0" class="mt-2 flex flex-wrap gap-1">
          <Tag v-for="id in formData.die_ids" :key="id" type="info" size="small" class="cursor-pointer" @click="removeDie(id)">{{ getDieLabel(id) }} <span class="ml-1 text-gray-400">&times;</span></Tag>
        </div>
        <div class="text-xs text-gray-400 mt-1">选中的刀模将自动关联到施工单</div>
      </div>
      <div><label class="input-label mb-1.5 block">任务备注</label><TextArea v-model="formData.notes" :rows="3" placeholder="请输入任务备注（可选）" /></div>
    </div>
    <template #footer>
      <button class="btn" @click="handleClose">取消</button>
      <button class="btn btn-primary" :disabled="submitting" @click="handleConfirm">确定</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { artworkAPI, dieAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'
import { ElMessage } from '@/utils/message'
import { StatusTag, TextArea, InputNumber, Select, Tag } from '@/components/common'

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

const formData = reactive({
  quantity_completed: 0 as number,
  quantity_defective: 0 as number,
  artwork_ids: [] as any[],
  die_ids: [] as any[],
  notes: '',
  completion_reason: ''
})

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const isDesignArtworkTask = computed(() => props.task?.work_content?.includes('设计图稿') || props.task?.work_content?.includes('更新图稿'))
const isDesignDieTask = computed(() => props.task?.work_content?.includes('设计刀模') || props.task?.work_content?.includes('更新刀模'))

const artworkSelectedValue = computed({
  get: () => null,
  set: (val: any) => { if (val !== null && val !== undefined && !formData.artwork_ids.includes(val)) formData.artwork_ids.push(val) }
})
const artworkOptions = computed(() => artworkList.value.map((a: any) => ({ value: a.id, label: (a.code || a.base_code || '') + ' - ' + (a.name || '') })))
const getArtworkLabel = (id: any) => { const a = artworkList.value.find((x: any) => x.id === id); return a ? (a.code || a.base_code || '') + ' - ' + (a.name || '') : id }
const removeArtwork = (id: any) => { formData.artwork_ids = formData.artwork_ids.filter((x: any) => x !== id) }

const dieSelectedValue = computed({
  get: () => null,
  set: (val: any) => { if (val !== null && val !== undefined && !formData.die_ids.includes(val)) formData.die_ids.push(val) }
})
const dieOptions = computed(() => dieList.value.map((d: any) => ({ value: d.id, label: d.code + ' - ' + d.name })))
const getDieLabel = (id: any) => { const d = dieList.value.find((x: any) => x.id === id); return d ? d.code + ' - ' + d.name : id }
const removeDie = (id: any) => { formData.die_ids = formData.die_ids.filter((x: any) => x !== id) }

watch(() => props.visible, (val: any) => {
  if (val && props.task) {
    initFormData(props.task)
    if (isDesignArtworkTask.value) loadArtworkList()
    if (isDesignDieTask.value) loadDieList()
  }
})
watch(() => props.task, (newTask: any) => { if (newTask) initFormData(newTask) })

const initFormData = (task: any) => {
  if (task.task_type === 'plate_making') {
    Object.assign(formData, { quantity_completed: 1, quantity_defective: task.quantity_defective || 0, artwork_ids: [], die_ids: [], notes: '', completion_reason: '' })
  } else {
    const qty = task.quantity_completed != null ? task.quantity_completed : (task.production_quantity != null ? task.production_quantity : 0)
    Object.assign(formData, { quantity_completed: qty, quantity_defective: task.quantity_defective || 0, artwork_ids: [], die_ids: [], notes: '', completion_reason: '' })
  }
}

const loadArtworkList = async () => {
  if (artworkList.value.length > 0) return
  loadingArtworks.value = true
  try { artworkList.value = ((await artworkAPI.getList({ page_size: 1000 })) as any)?.results || [] } catch (error: any) { ErrorHandler.handle(error); ElMessage.error('加载图稿列表失败') } finally { loadingArtworks.value = false }
}

const loadDieList = async () => {
  if (dieList.value.length > 0) return
  loadingDies.value = true
  try { dieList.value = ((await dieAPI.getList({ page_size: 1000 })) as any)?.results || [] } catch (error: any) { ErrorHandler.handle(error); ElMessage.error('加载刀模列表失败') } finally { loadingDies.value = false }
}

const handleConfirm = () => {
  const data: any = { completion_reason: formData.completion_reason, quantity_defective: formData.quantity_defective || 0, notes: formData.notes }
  if (isDesignArtworkTask.value) data.artwork_ids = formData.artwork_ids
  if (isDesignDieTask.value) data.die_ids = formData.die_ids
  emit('confirm', data)
}

const handleClose = () => { emit('update:visible', false); resetForm() }
const resetForm = () => { Object.assign(formData, { quantity_completed: 0, quantity_defective: 0, artwork_ids: [], die_ids: [], notes: '', completion_reason: '' }) }
</script>


