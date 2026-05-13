<template>
  <el-dialog v-model="dialogVisible" title="完成任务" width="600px" @close="handleClose">
    <el-form ref="formRef" :model="formData" label-width="120px">
      <el-form-item label="状态">
        <el-tag type="success">已完成</el-tag>
        <div style="color: #909399; font-size: 12px; margin-top: 4px;">强制完成任务，状态将标记为已完成</div>
      </el-form-item>
      <el-form-item v-if="task?.task_type === 'plate_making'" label="完成数量">
        <el-input-number v-model="formData.quantity_completed" :min="1" :max="1" :step="1" disabled style="width: 100%;" />
        <div style="color: #909399; font-size: 12px; margin-top: 4px;">制版任务完成数量固定为1</div>
      </el-form-item>
      <el-form-item v-if="task?.task_type !== 'plate_making'" label="当前完成数量">
        <el-input-number :value="task?.quantity_completed || 0" disabled style="width: 100%;" />
        <div v-if="task?.production_quantity" style="color: #909399; font-size: 12px; margin-top: 4px;">
          计划数量：{{ task.production_quantity }}
          <span v-if="(task.quantity_completed || 0) < task.production_quantity" style="color: #E6A23C; margin-left: 10px;">（当前完成数量小于计划数量，将强制标记为已完成）</span>
        </div>
      </el-form-item>
      <el-form-item label="完成理由"><el-input v-model="formData.completion_reason" type="textarea" :rows="3" placeholder="请输入完成理由（可选）" /></el-form-item>

      <el-form-item v-if="isDesignArtworkTask" label="选择图稿" prop="artwork_ids">
        <el-select v-model="formData.artwork_ids" multiple filterable placeholder="请选择图稿" style="width: 100%;" :loading="loadingArtworks" @focus="loadArtworkList">
          <el-option v-for="a in artworkList" :key="a.id" :label="`${a.code || a.base_code || ''} - ${a.name || ''}`" :value="a.id" />
        </el-select>
        <div style="color: #909399; font-size: 12px; margin-top: 5px;">选中的图稿将自动关联到施工单</div>
      </el-form-item>
      <el-form-item v-if="isDesignDieTask" label="选择刀模" prop="die_ids">
        <el-select v-model="formData.die_ids" multiple filterable placeholder="请选择刀模" style="width: 100%;" :loading="loadingDies" @focus="loadDieList">
          <el-option v-for="d in dieList" :key="d.id" :label="`${d.code} - ${d.name}`" :value="d.id" />
        </el-select>
        <div style="color: #909399; font-size: 12px; margin-top: 5px;">选中的刀模将自动关联到施工单</div>
      </el-form-item>
      <el-form-item label="任务备注"><el-input v-model="formData.notes" type="textarea" :rows="3" placeholder="请输入任务备注（可选）" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { artworkAPI, dieAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref(null)
const submitting = ref(false)
const artworkList = ref([])
const dieList = ref([])
const loadingArtworks = ref(false)
const loadingDies = ref(false)

const formData = reactive({
  quantity_completed: 0, quantity_defective: 0, artwork_ids: [], die_ids: [], notes: '', completion_reason: ''
})

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const isDesignArtworkTask = computed(() => props.task?.work_content?.includes('设计图稿') || props.task?.work_content?.includes('更新图稿'))
const isDesignDieTask = computed(() => props.task?.work_content?.includes('设计刀模') || props.task?.work_content?.includes('更新刀模'))

watch(() => props.visible, (val) => {
  if (val && props.task) {
    initFormData(props.task)
    if (isDesignArtworkTask.value) loadArtworkList()
    if (isDesignDieTask.value) loadDieList()
  }
})
watch(() => props.task, (newTask) => { if (newTask) initFormData(newTask) })

const initFormData = (task) => {
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
  try { artworkList.value = (await artworkAPI.getList({ page_size: 1000 }))?.results || [] } catch (error) { ErrorHandler.handle(error); ElMessage.error('加载图稿列表失败') } finally { loadingArtworks.value = false }
}

const loadDieList = async () => {
  if (dieList.value.length > 0) return
  loadingDies.value = true
  try { dieList.value = (await dieAPI.getList({ page_size: 1000 }))?.results || [] } catch (error) { ErrorHandler.handle(error); ElMessage.error('加载刀模列表失败') } finally { loadingDies.value = false }
}

const handleConfirm = () => {
  const data = { completion_reason: formData.completion_reason, quantity_defective: formData.quantity_defective || 0, notes: formData.notes }
  if (isDesignArtworkTask.value) data.artwork_ids = formData.artwork_ids
  if (isDesignDieTask.value) data.die_ids = formData.die_ids
  emit('confirm', data)
}

const handleClose = () => { emit('update:visible', false); resetForm() }
const resetForm = () => { Object.assign(formData, { quantity_completed: 0, quantity_defective: 0, artwork_ids: [], die_ids: [], notes: '', completion_reason: '' }) }
</script>
