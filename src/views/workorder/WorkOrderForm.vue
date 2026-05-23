<template>
  <div>
    <div class="card">
      <div class="mb-6 border-b border-gray-200 pb-4 dark:border-dark-700">
        <h2 class="mb-2 text-2xl font-bold">{{ isEdit ? '编辑施工单' : '新建施工单' }}</h2>
        <p class="m-0 text-sm text-gray-500 dark:text-dark-400">{{ isEdit ? '编辑模式' : '新建模式' }} - 先确认客户与交期，再补充产品、工序和物料</p>
      </div>
      <div class="space-y-4">
        <CustomerSelector v-model="form.customer" label="客户" required />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input v-model="form.order_date" type="date" label="下单日期" required />
          <Input v-model="form.delivery_date" type="date" label="交货日期" required />
          <Input v-model="form.production_quantity" type="number" label="生产数量" :min="1" />
        </div>
        <TextArea v-model="form.notes" label="备注" :rows="3" />
      </div>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button class="btn btn-secondary" @click="handleCancel">取消</button>
        <button class="btn btn-primary" :disabled="saving" @click="handleSave">
          <span v-if="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle" />
          保存
        </button>
        <button class="btn btn-success" :disabled="submitting" @click="handleSubmit">
          <span v-if="submitting" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle" />
          提交
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TextArea, InputNumber, Input } from '@/components/common'
import { ElMessage } from '@/utils/message'
import { workOrderAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'
import CustomerSelector from './components/CustomerSelector.vue'

const router = useRouter()
const route = useRoute()
const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value && id.value !== 'create')

const saving = ref(false)
const submitting = ref(false)

const form = reactive({ customer: null as any, order_date: '', delivery_date: '', production_quantity: 1, notes: '', priority: 'normal', products: [] as any[], materials: [] as any[], artworks: [] as any[], dies: [] as any[] })

onMounted(async () => {
  if (isEdit.value && id.value) {
    try { const res: any = await workOrderAPI.getDetail(id.value); Object.assign(form, res) } catch (e: any) { ElMessage.error('加载失败') }
  }
})

const handleSave = async () => {
  if (!form.customer) { ElMessage.warning('请选择客户'); return }
  if (!form.order_date) { ElMessage.warning('请选择下单日期'); return }
  if (!form.delivery_date) { ElMessage.warning('请选择交货日期'); return }
  saving.value = true
  try { isEdit.value ? await workOrderAPI.update(id.value!, form) : await workOrderAPI.create(form); ElMessage.success('保存成功') } catch (e: any) { ErrorHandler.showMessage(e, '保存失败') } finally { saving.value = false }
}

const handleSubmit = async () => {
  if (!isEdit.value) { ElMessage.warning('请先保存施工单'); return }
  if (!form.customer) { ElMessage.warning('请选择客户'); return }
  if (!form.order_date) { ElMessage.warning('请选择下单日期'); return }
  if (!form.delivery_date) { ElMessage.warning('请选择交货日期'); return }
  submitting.value = true
  try { await workOrderAPI.submit(id.value!); ElMessage.success('提交成功'); router.push('/workorders') } catch (e: any) { ErrorHandler.showMessage(e, '提交失败') } finally { submitting.value = false }
}

const handleCancel = () => router.back()
</script>
