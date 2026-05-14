<template>
  <div v-loading="pageLoading" class="workorder-form">
    <el-card>
      <template #header>
        <div class="form-header">
          <h2>{{ isEdit ? '编辑施工单' : '新建施工单' }}</h2>
          <p>{{ isEdit ? '编辑模式' : '新建模式' }} - 先确认客户与交期，再补充产品、工序和物料</p>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="客户" prop="customer"><CustomerSelector v-model="form.customer" /></el-form-item>
        <el-form-item label="下单日期" prop="order_date"><el-date-picker v-model="form.order_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" /></el-form-item>
        <el-form-item label="交货日期" prop="delivery_date"><el-date-picker v-model="form.delivery_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" /></el-form-item>
        <el-form-item label="生产数量"><el-input-number v-model="form.production_quantity" :min="1" style="width: 100%;" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.notes" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        <el-button type="success" :loading="submitting" @click="handleSubmit">提交</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { workOrderAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import ErrorHandler from '@/utils/errorHandler'
import CustomerSelector from './components/CustomerSelector.vue'

const router = useRouter()
const route = useRoute()
const id = computed(() => route.params.id)
const isEdit = computed(() => !!id.value)

const pageLoading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({ customer: null, order_date: '', delivery_date: '', production_quantity: 1, notes: '', priority: 'normal', products: [], materials: [], artworks: [], dies: [] })
const rules = { customer: [{ required: true, message: '请选择客户', trigger: 'change' }], order_date: [{ required: true, message: '请选择下单日期', trigger: 'change' }], delivery_date: [{ required: true, message: '请选择交货日期', trigger: 'change' }] }

onMounted(async () => {
  if (id.value) {
    pageLoading.value = true
    try { const res = await workOrderAPI.getDetail(id.value); Object.assign(form, res) } catch (e) { ElMessage.error('加载失败') } finally { pageLoading.value = false }
  }
})

const handleSave = async () => {
  saving.value = true
  try { id.value ? await workOrderAPI.update(id.value, form) : await workOrderAPI.create(form); ElMessage.success('保存成功') } catch (e) { ErrorHandler.showMessage(e, '保存失败') } finally { saving.value = false }
}

const handleSubmit = async () => {
  submitting.value = true
  try { await workOrderAPI.submit(id.value); ElMessage.success('提交成功'); router.push('/workorders') } catch (e) { ErrorHandler.showMessage(e, '提交失败') } finally { submitting.value = false }
}

const handleCancel = () => router.back()
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.workorder-form { padding: var(--ui-page-padding); }
.form-header h2 { margin: 0 0 10px; }
.form-header p { color: #909399; margin: 0; }
.form-actions { display: flex; justify-content: flex-end; gap: var(--ui-control-gap); margin-top: var(--ui-section-gap); }

@media (max-width: bp.$breakpoint-phone-max) {
  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>
