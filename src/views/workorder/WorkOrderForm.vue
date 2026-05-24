<template>
  <div class="pb-20 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ isEdit ? '编辑施工单' : '新建施工单' }}</h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ isEdit ? '编辑模式：修改施工单详情。' : '新建模式：填写基本信息并添加产品。' }}
      </p>
    </div>

    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Section 1: Basic Info -->
      <section class="card shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-0 overflow-hidden">
        <div class="bg-gray-50 dark:bg-dark-800/50 border-b border-gray-200 dark:border-dark-700 px-6 py-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">1</span>
            基本信息
          </h3>
        </div>
        <div class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CustomerSelector v-model="form.customer" label="客户" required />
            <Select v-model="form.priority" label="优先级" :options="priorityOptions" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input v-model="form.order_date" type="date" label="下单日期" required />
            <Input v-model="form.delivery_date" type="date" label="交货日期" required />
          </div>
        </div>
      </section>

      <!-- Section 2: Products -->
      <section class="card shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-0 overflow-hidden">
        <div class="bg-gray-50 dark:bg-dark-800/50 border-b border-gray-200 dark:border-dark-700 px-6 py-4 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">2</span>
            产品明细
          </h3>
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-900 shadow-sm border border-gray-200 dark:border-dark-700 px-3 py-1 rounded-full">
            总生产数量: <span class="text-primary-600 font-bold text-base ml-1">{{ calculatedTotalQuantity }}</span>
          </div>
        </div>
        <div class="p-6">
          <ProductListEditor
            :items="form.products"
            @change="handleProductsChange"
            @add="handleAddProduct"
            @remove="handleRemoveProduct"
          />
        </div>
      </section>

      <!-- Section 3: Notes -->
      <section class="card shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-0 overflow-hidden">
        <div class="bg-gray-50 dark:bg-dark-800/50 border-b border-gray-200 dark:border-dark-700 px-6 py-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">3</span>
            附加信息
          </h3>
        </div>
        <div class="p-6">
          <TextArea v-model="form.notes" label="备注说明" :rows="4" placeholder="输入关于此施工单的特殊要求、工艺注意事项或包装要求..." />
        </div>
      </section>
    </div>

    <!-- Sticky Bottom Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-t border-gray-200 dark:border-dark-700 p-4 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div class="max-w-4xl mx-auto flex justify-end gap-3">
        <button class="btn btn-secondary px-6 shadow-sm" @click="handleCancel">取消</button>
        <button class="btn btn-primary px-8 shadow-sm" :disabled="saving" @click="handleSave">
          <span v-if="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle mr-2" />
          保存
        </button>
        <button v-if="isEdit" class="btn btn-success px-8 shadow-sm" :disabled="submitting" @click="handleSubmit">
          <span v-if="submitting" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle mr-2" />
          提交审核
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TextArea, Input, Select } from '@/components/common'
import { ElMessage } from '@/utils/message'
import { workOrderAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'
import CustomerSelector from './components/CustomerSelector.vue'
import ProductListEditor from './components/ProductListEditor.vue'

const router = useRouter()
const route = useRoute()
const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value && id.value !== 'create')

const saving = ref(false)
const submitting = ref(false)

const priorityOptions = [
  { value: 'low', label: '低' },
  { value: 'normal', label: '正常' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '加急' }
]

const form = reactive({
  customer: null as any,
  order_date: new Date().toISOString().split('T')[0],
  delivery_date: '',
  production_quantity: 0,
  notes: '',
  priority: 'normal',
  products: [] as any[]
})

// Automatically calculate total production quantity based on product list
const calculatedTotalQuantity = computed(() => {
  return form.products.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
})

watch(calculatedTotalQuantity, (newTotal) => {
  form.production_quantity = newTotal > 0 ? newTotal : 1
})

onMounted(async () => {
  if (isEdit.value && id.value) {
    try {
      const res: any = await workOrderAPI.getDetail(id.value)
      Object.assign(form, {
        ...res,
        // Ensure date fields are properly formatted for input[type="date"] (YYYY-MM-DD)
        order_date: res.order_date ? res.order_date.split('T')[0] : '',
        delivery_date: res.delivery_date ? res.delivery_date.split('T')[0] : '',
        customer: res.customer?.id || res.customer, // customer could be expanded object or ID
      })
      // API returns products as an array of objects
      if (res.products && Array.isArray(res.products)) {
         form.products = res.products.map((p: any) => ({
           product: p.product?.id || p.product,
           quantity: p.quantity || 1,
           unit: p.unit || '件'
         }))
      } else {
        handleAddProduct()
      }
    } catch (e: any) {
      ElMessage.error('加载详情失败')
    }
  } else {
    // For new work order, add one empty product row by default
    handleAddProduct()
  }
})

const handleProductsChange = (newItems: any[]) => {
  form.products = newItems
}

const handleAddProduct = () => {
  form.products.push({ product: null, quantity: 1, unit: '件' })
}

const handleRemoveProduct = (index: number) => {
  form.products.splice(index, 1)
}

const validateForm = () => {
  if (!form.customer) { ElMessage.warning('请选择客户'); return false }
  if (!form.order_date) { ElMessage.warning('请选择下单日期'); return false }
  if (!form.delivery_date) { ElMessage.warning('请选择交货日期'); return false }
  
  // 校验产品列表
  if (form.products.length === 0) {
    ElMessage.warning('请至少添加一个产品')
    return false
  }
  
  for (let i = 0; i < form.products.length; i++) {
    const p = form.products[i]
    if (!p.product) {
      ElMessage.warning(`请在第 ${i + 1} 行选择产品`)
      return false
    }
    if (!p.quantity || p.quantity < 1) {
      ElMessage.warning(`第 ${i + 1} 行的产品数量必须大于0`)
      return false
    }
  }
  
  return true
}

const formatPayload = () => {
  // Deep clone to avoid mutating form state during processing
  const payload = JSON.parse(JSON.stringify(form))
  
  // Format products_data for backend
  payload.products_data = form.products.map(p => ({
    product_id: typeof p.product === 'object' ? p.product.id : p.product,
    quantity: p.quantity,
    unit: p.unit
  }))
  
  // The backend might expect customer ID rather than object
  if (payload.customer && typeof payload.customer === 'object') {
    payload.customer = payload.customer.id
  }
  
  // Remove raw products array to avoid conflict with backend's expected structure
  delete payload.products
  
  return payload
}

const handleSave = async () => {
  if (!validateForm()) return
  
  saving.value = true
  try {
    const payload = formatPayload()
    if (isEdit.value) {
      await workOrderAPI.update(id.value!, payload)
      ElMessage.success('施工单更新成功')
      router.back()
    } else {
      const res: any = await workOrderAPI.create(payload)
      ElMessage.success('施工单创建成功')
      // Redirect to detail page to continue adding processes/materials or review
      router.push(`/workorders/${res.id || res.data?.id}`)
    }
  } catch (e: any) {
    ErrorHandler.showMessage(e, '保存失败')
  } finally {
    saving.value = false
  }
}

const handleSubmit = async () => {
  if (!isEdit.value) {
    ElMessage.warning('请先保存施工单')
    return
  }
  if (!validateForm()) return
  
  submitting.value = true
  try {
    // First save the latest changes
    const payload = formatPayload()
    await workOrderAPI.update(id.value!, payload)
    
    // Then submit
    await workOrderAPI.submit(id.value!)
    ElMessage.success('施工单已提交审核')
    router.push('/workorders')
  } catch (e: any) {
    ErrorHandler.showMessage(e, '提交失败')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
/* Ensure smooth backdrop blur in supported browsers */
@supports (backdrop-filter: blur(12px)) {
  .backdrop-blur-md {
    backdrop-filter: blur(12px);
  }
}
</style>
