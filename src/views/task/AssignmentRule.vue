<template>
  <div class="assignment-rule-list">
    <el-card>
      <div class="header-section">
        <div class="left-section">
          <el-input v-model="searchText" class="assignment-search-control" placeholder="搜索工序、部门" clearable @clear="handleSearch">
            <template #append><el-button :icon="Search" @click="handleSearch" /></template>
          </el-input>
          <el-button v-if="canCreate" type="primary" :icon="Plus" @click="showDialog">新建分派规则</el-button>
        </div>
        <div class="right-section">
          <span class="global-toggle-label">启用自动分派：</span>
          <el-switch v-model="globalDispatchEnabled" active-text="是" inactive-text="否" @change="handleGlobalToggle" />
        </div>
      </div>

      <el-row :gutter="20" class="assignment-content-row">
        <el-col :xs="24" :lg="8">
          <process-list :processes="processList" :selected-process="selectedProcess" :loading="processListLoading" @select="handleProcessSelect" />
        </el-col>
        <el-col :xs="24" :lg="16">
          <department-priority-panel :process="selectedProcess" :departments="departmentRules" :all-departments="departmentList" :loading="departmentRulesLoading" :can-edit="canEdit" :can-delete="canDelete" @update-priority="handlePriorityUpdate" @toggle-active="handleToggleActive" @add-department="handleAddDepartment" @edit-department="handleEditDepartment" @remove-department="handleRemoveDepartment" />
        </el-col>
      </el-row>

      <el-alert v-if="!globalDispatchEnabled" title="自动分派已禁用" type="warning" description="当前自动分派功能已禁用，仅显示预览信息。" :closable="false" show-icon class="dispatch-alert" />

      <div class="preview-section">
        <h4>分派预览</h4>
        <div class="table-scroll">
        <el-table v-loading="previewLoading" :data="previewData" border class="preview-table">
          <el-table-column prop="process_name" label="工序" width="150" />
          <el-table-column prop="target_department_name" label="分派部门" width="150" />
          <el-table-column prop="target_operator_name" label="分派操作员" width="150">
            <template #default="scope">{{ scope.row.target_operator_name || '-' }}</template>
          </el-table-column>
          <el-table-column label="预计等待时间" width="150">
            <template #default="scope">
              <span :class="getWaitTimeClass(scope.row.estimated_wait_time)">{{ scope.row.estimated_wait_time || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="当前负载" width="150">
            <template #default="scope">
              <el-progress :percentage="scope.row.current_load || 0" :color="getLoadColor(scope.row.current_load)" />
            </template>
          </el-table-column>
          <el-table-column prop="active_rules_count" label="激活规则" width="100" align="center" />
        </el-table>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="var(--ui-dialog-width-sm)">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="工序" prop="process">
          <el-select v-model="form.process" placeholder="请选择工序" filterable style="width: 100%;">
            <el-option v-for="p in processList" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="form.department" placeholder="请选择部门" filterable style="width: 100%;">
            <el-option v-for="d in departmentList" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="form.priority" :min="1" :max="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="条件">
          <el-input v-model="form.conditions" type="textarea" :rows="3" placeholder="JSON格式条件" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.is_active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { assignmentRuleAPI, processAPI, departmentAPI, dispatchConfigAPI } from '@/api/modules'
import { useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'

const { canCreate, canEdit, canDelete } = useCrudPermission('assignmentrule')

const processList = ref([])
const departmentList = ref([])
const departmentRules = ref([])
const selectedProcess = ref(null)
const processListLoading = ref(false)
const departmentRulesLoading = ref(false)
const previewLoading = ref(false)
const previewData = ref([])
const globalDispatchEnabled = ref(false)
const searchText = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('新建分派规则')
const formRef = ref(null)
const submitting = ref(false)
const isEdit = ref(false)
const currentRuleId = ref(null)

const form = reactive({ process: null, department: null, priority: 1, conditions: '', is_active: true })
const rules = { process: [{ required: true, message: '请选择工序', trigger: 'change' }], department: [{ required: true, message: '请选择部门', trigger: 'change' }], priority: [{ required: true, message: '请输入优先级', trigger: 'blur' }] }

const loadProcesses = async () => {
  processListLoading.value = true
  try { const res = await processAPI.getList({ is_active: true, page_size: 1000 }); processList.value = res?.results || [] } catch (error) { ErrorHandler.showMessage(error, '加载工序') } finally { processListLoading.value = false }
}

const loadDepartments = async () => {
  try { const res = await departmentAPI.getList({ page_size: 1000 }); departmentList.value = res?.results || [] } catch (error) {}
}

const loadDispatchConfig = async () => {
  try { const res = await dispatchConfigAPI.get(); globalDispatchEnabled.value = res?.is_enabled || false } catch (error) {}
}

const loadDepartmentRules = async (processId) => {
  if (!processId) { departmentRules.value = []; return }
  departmentRulesLoading.value = true
  try { const res = await assignmentRuleAPI.getByProcess(processId); departmentRules.value = res?.results || [] } catch (error) { ErrorHandler.showMessage(error, '加载规则') } finally { departmentRulesLoading.value = false }
}

const loadPreview = async () => {
  previewLoading.value = true
  try { const res = await assignmentRuleAPI.getPreview(); previewData.value = res?.results || [] } catch (error) {} finally { previewLoading.value = false }
}

const handleProcessSelect = (process) => { selectedProcess.value = process; if (process) loadDepartmentRules(process.id) }

const handleSearch = () => { /* TODO: 搜索过滤 */ }

const handleGlobalToggle = async (enabled) => {
  try { await dispatchConfigAPI.update({ is_enabled: enabled }); ElMessage.success(enabled ? '自动分派已启用' : '自动分派已禁用') } catch (error) { ErrorHandler.showMessage(error, '更新配置失败') }
}

const handlePriorityUpdate = async ({ id, priority }) => {
  try { await assignmentRuleAPI.updatePriority(id, { priority }); ElMessage.success('优先级已更新') } catch (error) { ErrorHandler.showMessage(error, '更新失败') }
}

const handleToggleActive = async ({ id, is_active }) => {
  try { await assignmentRuleAPI.toggleActive(id, { is_active }); ElMessage.success(is_active ? '规则已启用' : '规则已禁用') } catch (error) { ErrorHandler.showMessage(error, '更新失败') }
}

const handleAddDepartment = (data) => { showDialog(data) }
const handleEditDepartment = (data) => { showDialog(data, data.id) }
const handleRemoveDepartment = async (id) => {
  try {
    const confirmed = await ErrorHandler.confirm('确定要删除此规则？')
    if (!confirmed) return
    await assignmentRuleAPI.delete(id)
    ElMessage.success('删除成功')
    if (selectedProcess.value) loadDepartmentRules(selectedProcess.value.id)
  } catch (error) { if (error !== 'cancel') ErrorHandler.showMessage(error, '删除失败') }
}

const showDialog = (data = null, ruleId = null) => {
  if (data) { Object.assign(form, { process: data.process, department: data.department, priority: data.priority, conditions: data.conditions || '', is_active: data.is_active !== false }); dialogTitle.value = '编辑分派规则'; isEdit.value = true } else { Object.assign(form, { process: null, department: null, priority: 1, conditions: '', is_active: true }); dialogTitle.value = '新建分派规则'; isEdit.value = false }
  currentRuleId.value = ruleId
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEdit.value) { await assignmentRuleAPI.update(currentRuleId.value, form); ElMessage.success('更新成功') } else { await assignmentRuleAPI.create(form); ElMessage.success('创建成功') }
    dialogVisible.value = false
    if (selectedProcess.value) loadDepartmentRules(selectedProcess.value.id)
  } catch (error) { ErrorHandler.showMessage(error, isEdit.value ? '更新失败' : '创建失败') } finally { submitting.value = false }
}

const getWaitTimeClass = (time) => time && time.includes('小时') && parseInt(time) < 2 ? 'text-success' : time && time.includes('小时') && parseInt(time) > 8 ? 'text-danger' : ''
const getLoadColor = (load) => load < 50 ? '#67C23A' : load < 80 ? '#E6A23C' : '#F56C6C'

onMounted(() => { loadProcesses(); loadDepartments(); loadDispatchConfig(); loadPreview() })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.assignment-rule-list { padding: var(--ui-page-padding); }
.header-section { display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.left-section, .right-section { display: flex; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.assignment-search-control { width: min(100%, 320px); }
.assignment-content-row { margin-top: var(--ui-section-gap); row-gap: var(--ui-section-gap); }
.dispatch-alert { margin-top: var(--ui-section-gap); }
.global-toggle-label { color: #606266; }
.preview-section { margin-top: var(--ui-section-gap); padding-top: var(--ui-section-gap); border-top: 1px solid #eee; }
.preview-section h4 { margin-bottom: var(--ui-control-gap); color: #303133; }
.table-scroll { margin-top: var(--ui-control-gap); overflow-x: auto; }
.preview-table { width: 100%; }
.text-success { color: #67C23A; }
.text-danger { color: #F56C6C; }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .left-section,
  .right-section {
    align-items: stretch;
    flex-direction: column;
  }

  .assignment-search-control,
  .left-section .el-button {
    width: 100%;
  }
}
</style>
