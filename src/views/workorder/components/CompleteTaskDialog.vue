<template>
  <el-dialog v-model="dialogVisible" title="完成任务" width="600px" @close="handleClose">
    <el-form ref="formRef" :model="form" label-width="120px">
      <el-form-item label="状态"><el-tag type="success">已完成</el-tag><div style="color: #909399; font-size: 12px; margin-top: 4px;">强制完成任务，状态将标记为已完成</div></el-form-item>
      <el-form-item v-if="isPlateMakingTask" label="完成数量"><el-input-number v-model="form.quantity_completed" :min="1" :max="1" :step="1" disabled style="width: 100%;" /><div style="color: #909399; font-size: 12px; margin-top: 4px;">制版任务完成数量固定为1</div></el-form-item>
      <el-form-item v-else label="当前完成数量"><el-input-number :value="task?.quantity_completed || 0" disabled style="width: 100%;" /><div v-if="task?.production_quantity" style="color: #909399; font-size: 12px; margin-top: 4px;">计划数量：{{ task.production_quantity }}<span v-if="(task.quantity_completed || 0) < task.production_quantity" style="color: #E6A23C; margin-left: 10px;">（将强制标记为已完成）</span></div></el-form-item>
      <el-form-item label="完成理由"><el-input v-model="form.completion_reason" type="textarea" :rows="3" placeholder="请输入完成理由（可选）" /></el-form-item>
      <el-form-item v-if="isDesignArtworkTask" label="选择图稿"><el-select v-model="form.artwork_ids" multiple filterable placeholder="请选择图稿" style="width: 100%;" @focus="$emit('load-artworks')"><el-option v-for="a in artworkList" :key="a.id" :label="`${a.code || a.base_code || ''} - ${a.name || ''}`" :value="a.id" /></el-select><div style="color: #909399; font-size: 12px; margin-top: 5px;">选中的图稿将自动关联到施工单</div></el-form-item>
      <el-form-item v-if="isDesignDieTask" label="选择刀模"><el-select v-model="form.die_ids" multiple filterable placeholder="请选择刀模" style="width: 100%;" @focus="$emit('load-dies')"><el-option v-for="d in dieList" :key="d.id" :label="`${d.code} - ${d.name}`" :value="d.id" /></el-select><div style="color: #909399; font-size: 12px; margin-top: 5px;">选中的刀模将自动关联到施工单</div></el-form-item>
      <el-form-item label="备注"><el-input v-model="form.notes" type="textarea" :rows="2" placeholder="请输入备注（可选）" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null },
  artworkList: { type: Array, default: () => [] },
  dieList: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:visible', 'load-artworks', 'load-dies'])

const formRef = ref(null)
const form = reactive({ quantity_completed: 0, completion_reason: '', artwork_ids: [], die_ids: [], notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const isPlateMakingTask = computed(() => props.task?.task_type === 'plate_making')
const isDesignArtworkTask = computed(() => props.task?.work_content?.includes('设计图稿') || props.task?.work_content?.includes('更新图稿'))
const isDesignDieTask = computed(() => props.task?.work_content?.includes('设计刀模') || props.task?.work_content?.includes('更新刀模'))

watch(() => props.task, (t) => {
  if (t) {
    form.quantity_completed = t.task_type === 'plate_making' ? 1 : (t.quantity_completed ?? t.production_quantity ?? 0)
    form.artwork_ids = []; form.die_ids = []
  }
})

const handleSubmit = () => emit('submit', { ...form })
const handleClose = () => { Object.assign(form, { quantity_completed: 0, completion_reason: '', artwork_ids: [], die_ids: [], notes: '' }) }
</script>
