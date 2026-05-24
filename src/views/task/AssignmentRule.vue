<template>
  <div>
    <div class="card">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <SearchInput v-model="searchText" placeholder="搜索工序、部门" @search="handleSearch" @clear="handleSearch" />
          <button v-if="canCreate" class="btn btn-primary btn-sm" @click="showDialog"><Icon name="plus" class="h-4 w-4" /> 新建分派规则</button>
        </div>
        <div class="flex items-center gap-2"><span class="text-sm text-gray-500">启用自动分派：</span><Toggle v-model="globalDispatchEnabled" @change="handleGlobalToggle" /></div>
      </div>
      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-1"><process-list :processes="processList" :selected-process="selectedProcess" :loading="processListLoading" @select="handleProcessSelect" /></div>
        <div class="lg:col-span-2"><department-priority-panel :process="selectedProcess" :departments="departmentRules" :all-departments="departmentList" :loading="departmentRulesLoading" :can-edit="canEdit" :can-delete="canDelete" @update-priority="handlePriorityUpdate" @toggle-active="handleToggleActive" @add-department="handleAddDepartment" @edit-department="handleEditDepartment" @remove-department="handleRemoveDepartment" /></div>
      </div>
      <Alert v-if="!globalDispatchEnabled" title="自动分派已禁用" type="warning" description="当前自动分派功能已禁用，仅显示预览信息。" :closable="false" show-icon class="mb-4" />
      <div><h4 class="mb-4 font-bold">分派预览</h4>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
                <th class="px-4 py-3 w-36">工序</th>
                <th class="px-4 py-3 w-36">分派部门</th>
                <th class="px-4 py-3 w-36">分派操作员</th>
                <th class="px-4 py-3 w-36">预计等待时间</th>
                <th class="px-4 py-3 w-36">当前负载</th>
                <th class="px-4 py-3 w-24 text-center">激活规则</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
              <tr v-for="row in previewData" :key="row.id">
                <td class="px-4 py-3">{{ row.process_name }}</td>
                <td class="px-4 py-3">{{ row.target_department_name }}</td>
                <td class="px-4 py-3">{{ row.target_operator_name || '-' }}</td>
                <td class="px-4 py-3"><span :class="getWaitTimeClass(row.estimated_wait_time)">{{ row.estimated_wait_time || '-' }}</span></td>
                <td class="px-4 py-3"><ProgressBar :percentage="row.current_load || 0" :color="getLoadColor(row.current_load)" /></td>
                <td class="px-4 py-3 text-center">{{ row.active_rules_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <BaseDialog :show="dialogVisible" :title="dialogTitle" width="narrow">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">工序</label>
          <Select v-model="form.process" :options="processOptions" placeholder="请选择工序" filterable class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">部门</label>
          <Select v-model="form.department" :options="departmentOptions" placeholder="请选择部门" filterable class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">优先级</label>
          <InputNumber v-model="form.priority" :min="1" :max="100" class="flex-1" />
        </div>
        <TextArea v-model="form.conditions" label="条件" :rows="3" placeholder="JSON格式条件" class="w-full" />
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">启用</label>
          <div class="pt-1"><Toggle v-model="form.is_active" /></div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="dialogVisible = false">取消</button>
        <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">确定</button>
      </template>
    </BaseDialog>
    <ConfirmDialog
      :show="showDeleteDialog"
      title="删除确认"
      message="确定要删除此规则？"
      confirm-text="删除"
      cancel-text="取消"
      danger
      :loading="deleting"
      loading-text="删除中..."
      @confirm="confirmRemoveDepartment"
      @cancel="cancelRemoveDepartment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Icon, SearchInput, TextArea, Select, InputNumber, Toggle, ConfirmDialog } from '@/components/common'
import { ElMessage } from '@/utils/message'
import { assignmentRuleAPI, processAPI, departmentAPI, dispatchConfigAPI } from '@/api/modules'
import { useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'

const { canCreate, canEdit, canDelete } = useCrudPermission('assignmentrule')

const processList = ref<any[]>([])
const departmentList = ref<any[]>([])
const departmentRules = ref<any[]>([])
const selectedProcess = ref<any>(null)
const processListLoading = ref(false)
const departmentRulesLoading = ref(false)
const previewLoading = ref(false)
const previewData = ref<any[]>([])
const globalDispatchEnabled = ref(false)
const searchText = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('新建分派规则')
const submitting = ref(false)
const isEdit = ref(false)
const currentRuleId = ref(null)
const showDeleteDialog = ref(false)
const deleting = ref(false)
const pendingDeleteRuleId = ref<any>(null)

const form = reactive({ process: null, department: null, priority: 1, conditions: '', is_active: true })

// Computed options for native Select
const processOptions = computed(() => processList.value.map((p: any) => ({ value: p.id, label: p.name })))
const departmentOptions = computed(() => departmentList.value.map((d: any) => ({ value: d.id, label: d.name })))

const loadProcesses = async () => {
  processListLoading.value = true
  try { const res: any = await processAPI.getList({ is_active: true, page_size: 1000 }); processList.value = res?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载工序') } finally { processListLoading.value = false }
}

const loadDepartments = async () => {
  try { const res: any = await departmentAPI.getList({ page_size: 1000 }); departmentList.value = res?.results || [] } catch (error: any) {}
}

const loadDispatchConfig = async () => {
  try { const res: any = await dispatchConfigAPI.get(); globalDispatchEnabled.value = res?.is_enabled || false } catch (error: any) {}
}

const loadDepartmentRules = async (processId: any) => {
  if (!processId) { departmentRules.value = []; return }
  departmentRulesLoading.value = true
  try { const res: any = await assignmentRuleAPI.getByProcess(processId); departmentRules.value = res?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载规则') } finally { departmentRulesLoading.value = false }
}

const loadPreview = async () => {
  previewLoading.value = true
  try { const res: any = await assignmentRuleAPI.getPreview(); previewData.value = res?.results || [] } catch (error: any) {} finally { previewLoading.value = false }
}

const handleProcessSelect = (process: any) => { selectedProcess.value = process; if (process) loadDepartmentRules(process.id) }

const handleSearch = () => { /* TODO: 搜索过滤 */ }

const handleGlobalToggle = async (enabled: any) => {
  try { await dispatchConfigAPI.update({ is_enabled: enabled }); ElMessage.success(enabled ? '自动分派已启用' : '自动分派已禁用') } catch (error: any) { ErrorHandler.showMessage(error, '更新配置失败') }
}

const handlePriorityUpdate = async (payload: any) => { const { id, priority } = payload;
  try { await assignmentRuleAPI.updatePriority(id, { priority }); ElMessage.success('优先级已更新') } catch (error: any) { ErrorHandler.showMessage(error, '更新失败') }
}

const handleToggleActive = async (payload: any) => { const { id, is_active } = payload;
  try { await assignmentRuleAPI.toggleActive(id, { is_active }); ElMessage.success(is_active ? '规则已启用' : '规则已禁用') } catch (error: any) { ErrorHandler.showMessage(error, '更新失败') }
}

const handleAddDepartment = (data: any) => { showDialog(data) }
const handleEditDepartment = (data: any) => { showDialog(data, data.id) }
const handleRemoveDepartment = (id: any) => {
  pendingDeleteRuleId.value = id
  showDeleteDialog.value = true
}

const cancelRemoveDepartment = () => {
  showDeleteDialog.value = false
  pendingDeleteRuleId.value = null
}

const confirmRemoveDepartment = async () => {
  if (!pendingDeleteRuleId.value) return
  deleting.value = true
  try {
    await assignmentRuleAPI.delete(pendingDeleteRuleId.value)
    ElMessage.success('删除成功')
    cancelRemoveDepartment()
    if (selectedProcess.value) loadDepartmentRules(selectedProcess.value.id)
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除失败')
  } finally {
    deleting.value = false
  }
}

const showDialog = (data: any = null, ruleId: any = null) => {
  if (data) { Object.assign(form, { process: (data as any).process, department: (data as any).department, priority: (data as any).priority, conditions: (data as any).conditions || '', is_active: (data as any).is_active !== false }); dialogTitle.value = '编辑分派规则'; isEdit.value = true } else { Object.assign(form, { process: null, department: null, priority: 1, conditions: '', is_active: true }); dialogTitle.value = '新建分派规则'; isEdit.value = false }
  currentRuleId.value = ruleId
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.process) { ElMessage.warning('请选择工序'); return }
  if (!form.department) { ElMessage.warning('请选择部门'); return }
  submitting.value = true
  try {
    if (isEdit.value) { await assignmentRuleAPI.update(currentRuleId.value!, form); ElMessage.success('更新成功') } else { await assignmentRuleAPI.create(form); ElMessage.success('创建成功') }
    dialogVisible.value = false
    if (selectedProcess.value) loadDepartmentRules(selectedProcess.value.id)
  } catch (error: any) { ErrorHandler.showMessage(error, isEdit.value ? '更新失败' : '创建失败') } finally { submitting.value = false }
}

const getWaitTimeClass = (time: any) => time && time.includes('小时') && parseInt(time) < 2 ? 'text-success' : time && time.includes('小时') && parseInt(time) > 8 ? 'text-danger' : ''
const getLoadColor = (load: any) => load < 50 ? '#67C23A' : load < 80 ? '#E6A23C' : '#F56C6C'

onMounted(() => { loadProcesses(); loadDepartments(); loadDispatchConfig(); loadPreview() })
</script>
