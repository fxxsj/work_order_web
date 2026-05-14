<template>
  <el-dialog v-model="dialogVisible" title="更新任务" width="var(--ui-dialog-width-md)" @close="handleClose">
    <el-form ref="formRef" :model="formData" label-width="120px">
      <el-form-item label="任务内容"><el-input :value="task?.work_content" disabled /></el-form-item>
      <el-form-item label="生产数量"><el-input-number :value="task?.production_quantity" disabled style="width: 100%;" /></el-form-item>
      <el-form-item v-if="task" label="当前完成数量"><el-input-number :value="task.quantity_completed || 0" disabled style="width: 100%;" /></el-form-item>
      <el-form-item label="本次完成数量" prop="quantity_completed" required>
        <el-input-number v-model="formData.quantity_completed" :min="0" :max="task?.production_quantity ? (task.production_quantity - (task.quantity_completed || 0)) : 999999" style="width: 100%;" />
        <div v-if="task?.production_quantity" style="color: #909399; font-size: 12px; margin-top: 4px;">
          计划数量：{{ task.production_quantity }}，当前完成：{{ task.quantity_completed || 0 }}，更新后：{{ (task.quantity_completed || 0) + (formData.quantity_completed || 0) }}
          <span v-if="(task.quantity_completed || 0) + (formData.quantity_completed || 0) >= task.production_quantity" style="color: #67C23A;">（完成数量将达到计划数量）</span>
          <span v-else style="color: #E6A23C;">（完成数量未达到计划数量）</span>
        </div>
      </el-form-item>
      <el-form-item label="本次不良品数量">
        <el-input-number v-model="formData.quantity_defective" :min="0" style="width: 100%;" />
        <div style="color: #909399; font-size: 12px; margin-top: 4px;">当前不良品：{{ task?.quantity_defective || 0 }}，更新后：{{ (task?.quantity_defective || 0) + (formData.quantity_defective || 0) }}</div>
      </el-form-item>
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
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
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

const formData = reactive({ quantity_completed: 0, quantity_defective: 0, artwork_ids: [], die_ids: [], notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const isDesignArtworkTask = computed(() => props.task?.work_content?.includes('设计图稿') || props.task?.work_content?.includes('更新图稿'))
const isDesignDieTask = computed(() => props.task?.work_content?.includes('设计刀模') || props.task?.work_content?.includes('更新刀模'))

watch(() => props.visible, (val) => {
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
  try { artworkList.value = (await artworkAPI.getList({ page_size: 1000 }))?.results || [] } catch (error) { ErrorHandler.handle(error); ElMessage.error('加载图稿列表失败') } finally { loadingArtworks.value = false }
}

const loadDieList = async () => {
  if (dieList.value.length > 0) return
  loadingDies.value = true
  try { dieList.value = (await dieAPI.getList({ page_size: 1000 }))?.results || [] } catch (error) { ErrorHandler.handle(error); ElMessage.error('加载刀模列表失败') } finally { loadingDies.value = false }
}

const handleConfirm = () => {
  const data = { quantity_increment: formData.quantity_completed || 0, quantity_defective: formData.quantity_defective || 0, notes: formData.notes }
  if (isDesignArtworkTask.value) data.artwork_ids = formData.artwork_ids
  if (isDesignDieTask.value) data.die_ids = formData.die_ids
  emit('confirm', data)
}

const handleClose = () => { emit('update:visible', false); resetForm() }
const resetForm = () => { Object.assign(formData, { quantity_completed: 0, quantity_defective: 0, artwork_ids: [], die_ids: [], notes: '' }); nextTick(() => { formRef.value?.clearValidate() }) }
</script>
