<template>
  <BaseDialog
    :show="isOpen"
    :title="dialogTitle"
    width="wide"
    @close="handleClose"
  >
    <div class="space-y-4">
      <Input
        v-model="form.code"
        label="产品编码"
        placeholder="请输入产品编码"
        :disabled="isEditMode"
      />
      <Input
        v-model="form.name"
        label="产品名称"
        placeholder="请输入产品名称"
      />
      <div>
        <label class="input-label mb-1.5 block">产品类型</label>
        <Select
          v-model="form.product_type"
          :options="productTypeOptions"
          placeholder="请选择产品类型"
          class="w-full"
          @change="handleProductTypeChange"
        />
      </div>
      <div v-if="form.product_type !== 'single'">
        <label class="input-label mb-1.5 block">所属产品组</label>
        <Select
          v-model="form.product_group"
          :options="productGroupOptions"
          placeholder="请选择产品组"
          filterable
          class="w-full"
        />
      </div>
      <Input
        v-model="form.specification"
        label="规格"
        placeholder="请输入产品规格"
      />
      <Input
        v-model="form.unit"
        label="单位"
        placeholder="如：件，张、本"
      />
      <div>
        <label class="input-label mb-1.5 block">单价</label><InputNumber
          v-model="form.unit_price"
          :min="0"
          :precision="2"
          class="w-full"
        />
      </div>
      <div>
        <label class="input-label mb-1.5 block">库存数量</label><InputNumber
          v-model="form.stock_quantity"
          :min="0"
          class="w-full"
        />
      </div>
      <div>
        <label class="input-label mb-1.5 block">最小库存</label><InputNumber
          v-model="form.min_stock_quantity"
          :min="0"
          class="w-full"
        />
      </div>
      <TextArea
        v-model="form.description"
        label="产品描述"
        :rows="2"
        placeholder="请输入产品描述"
      />

      <SectionDivider title="物料配置" />
      <div>
        <button
          class="btn btn-primary btn-sm mb-3"
          @click="addMaterialItem"
        >
          <Icon
            name="plus"
            class="mr-1 inline h-3 w-3"
          />添加物料
        </button>
        <LineItemsTable
          :columns="materialColumns"
          :items="materialItems"
          @delete="removeMaterialItem"
        >
          <template #cell-material="{ row, index }">
            <MaterialSelector
              :model-value="row.material"
              :materials="materialList"
              @update:model-value="value => row.material = value"
              @create="openQuickMaterialCreate(index)"
            />
          </template>
          <template #cell-material_size="{ row }">
            <Input
              v-model="row.material_size"
              placeholder="如：A4、210x297mm"
            />
          </template>
          <template #cell-material_usage="{ row }">
            <Input
              v-model="row.material_usage"
              placeholder="如：1000张"
            />
          </template>
          <template #cell-need_cutting="{ row }">
            <Toggle v-model="row.need_cutting" />
          </template>
        </LineItemsTable>
      </div>

      <SectionDivider title="工序配置" />
      <div>
        <CheckboxGroup
          v-model="form.default_processes"
          :options="processOptions"
          variant="chip"
        />
      </div>
      <Toggle
        v-model="form.is_active"
        label="是否启用"
      />

      <SectionDivider
        v-if="dialogType === 'edit'"
        title="图片管理"
      />
      <div v-if="dialogType === 'edit'">
        <div
          v-if="productImages.length > 0"
          class="flex flex-wrap gap-3 mb-3"
        >
          <div
            v-for="(img, idx) in productImages"
            :key="img.id"
            class="relative group"
          >
            <img
              :src="img.image"
              class="w-20 h-20 rounded-lg object-cover"
            >
            <button
              type="button"
              class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              @click="handleDeleteImage(img.id)"
            >
              &times;
            </button>
          </div>
        </div>
        <p
          v-else
          class="text-sm text-gray-400 mb-3"
        >
          暂无图片
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="handleUploadImage"
          >
            <Icon
              name="upload"
              class="mr-1 inline h-3 w-3"
            />上传图片
          </button>
          <input
            ref="imageInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleImageFileSelected"
          >
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          class="btn btn-secondary"
          @click="handleClose"
        >
          取消
        </button>
        <button
          class="btn btn-primary"
          :disabled="loading"
          @click="handleSubmit"
        >
          确定
        </button>
      </div>
    </template>
  </BaseDialog>
  <QuickMaterialCreateDialog
    v-model:visible="showQuickMaterialCreate"
    @created="handleMaterialCreated"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Icon, Input, InputNumber, Select, TextArea, Toggle, CheckboxGroup, SectionDivider, LineItemsTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'
import { productAPI } from '@/api/modules'
import MaterialSelector from '@/views/material/components/MaterialSelector.vue'
import QuickMaterialCreateDialog from '@/views/material/components/QuickMaterialCreateDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  product: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  materials: { type: Array as any, default: () => [] },
  processes: { type: Array as any, default: () => [] },
  productGroups: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const materialItems = ref<any[]>([])
const materialList = ref<any[]>([])
const showQuickMaterialCreate = ref(false)
const pendingMaterialCreateIndex = ref<number | null>(null)
const isOpen = ref(false)
const productImages = ref<any[]>([])
const imageInput = ref<HTMLInputElement | null>(null)

// Sync with parent visibility prop and init form when opening
watch(() => props.visible, (val) => {
  isOpen.value = val
  if (val) {
    if (props.dialogType === 'edit' && props.product) initFormFromProduct()
    else resetForm()
  }
}, { immediate: true })

const loadProductImages = async () => {
  if (props.dialogType !== 'edit' || !props.product?.id) return
  try {
    const response: any = await productAPI.getImages(props.product.id)
    const list = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
    productImages.value = list
  } catch (_) {
    productImages.value = []
  }
}

const handleUploadImage = () => { imageInput.value?.click() }

const handleImageFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !props.product?.id) return
  const formData = new FormData()
  formData.append('image', file)
  formData.append('sort_order', String(productImages.value.length))
  try {
    await productAPI.uploadImage(props.product.id, formData)
    useUIStore().showSuccess('图片上传成功')
    await loadProductImages()
  } catch (error: any) {
    useUIStore().showError('图片上传失败')
  } finally {
    target.value = ''
  }
}

const handleDeleteImage = async (imageId: number) => {
  if (!props.product?.id) return
  if (!confirm('确定要删除此图片吗？')) return
  try {
    await productAPI.deleteImage(props.product.id, imageId)
    useUIStore().showSuccess('图片已删除')
    productImages.value = productImages.value.filter((img) => img.id !== imageId)
  } catch (error: any) {
    useUIStore().showError('删除图片失败')
  }
}

const FORM_INITIAL = {
  code: '', name: '', product_type: 'single', product_group: null, specification: '', unit: '件',
  unit_price: 0, stock_quantity: 0, min_stock_quantity: 0, description: '', is_active: true, default_processes: []
}

const form = reactive({ ...FORM_INITIAL })

const productTypeOptions = [
  { value: 'single', label: '单品' },
  { value: 'group_main', label: '套装主产品' },
  { value: 'group_item', label: '套装子产品' }
]

const dialogTitle = computed(() => props.dialogType === 'edit' ? '编辑产品' : '新建产品')
const isEditMode = computed(() => props.dialogType === 'edit')
const processOptions = computed(() => props.processes.map((p: any) => ({ value: p.id, label: p.name, disabled: !p.is_active })))
const productGroupOptions = computed(() => props.productGroups.map((g: any) => ({ value: g.id, label: `${g.code} - ${g.name}` })))

watch(() => props.materials, (materials) => {
  materialList.value = [...(materials as any[])]
}, { immediate: true, deep: true })

const materialColumns: Column[] = [
  { key: 'material', label: '物料名称', width: 200 },
  { key: 'material_size', label: '尺寸', width: 144 },
  { key: 'material_usage', label: '用量', width: 144 },
  { key: 'need_cutting', label: '需要开料', width: 80, align: 'center' },
]

const initFormFromProduct = () => {
  if (!props.product) return
  Object.assign(form, {
    code: props.product.code || '',
    name: props.product.name || '',
    product_type: props.product.product_type || 'single',
    product_group: props.product.product_group || null,
    specification: props.product.specification || '',
    unit: props.product.unit || '件',
    unit_price: parseFloat(props.product.unit_price) || 0,
    stock_quantity: props.product.stock_quantity || 0,
    min_stock_quantity: props.product.min_stock_quantity || 0,
    description: props.product.description || '',
    is_active: props.product.is_active !== false,
    default_processes: props.product.default_processes || []
  })
  materialItems.value = (props.product.default_materials || []).map((m: any) => ({
    id: m.id, material: m.material, material_size: m.material_size || '', material_usage: m.material_usage || '', need_cutting: m.need_cutting || false, notes: m.notes || '', sort_order: m.sort_order || 0
  }))
  loadProductImages()
}

const resetForm = () => {
  Object.assign(form, FORM_INITIAL)
  materialItems.value = []
}

const handleProductTypeChange = (value: any) => { if (value === 'single') form.product_group = null }
const addMaterialItem = () => { materialItems.value.push({ material: null, material_size: '', material_usage: '', need_cutting: false, notes: '', sort_order: materialItems.value.length }) }
const removeMaterialItem = (index: any) => { materialItems.value.splice(index, 1) }
const openQuickMaterialCreate = (index: number | null = null) => {
  pendingMaterialCreateIndex.value = typeof index === 'number' ? index : null
  showQuickMaterialCreate.value = true
}
const handleMaterialCreated = (material: any) => {
  materialList.value.push(material)
  if (pendingMaterialCreateIndex.value !== null && materialItems.value[pendingMaterialCreateIndex.value]) {
    materialItems.value[pendingMaterialCreateIndex.value].material = material.id
  }
  pendingMaterialCreateIndex.value = null
}

const handleSubmit = () => {
  const code = (form.code || '').trim()
  const name = (form.name || '').trim()
  if (!code) { useUIStore().showWarning('请输入产品编码'); return }
  if (code.length < 2 || code.length > 50) { useUIStore().showWarning('产品编码长度需在2-50个字符之间'); return }
  if (!/^[A-Za-z0-9-]+$/.test(code)) { useUIStore().showWarning('产品编码只能包含字母、数字和连字符'); return }
  if (!name) { useUIStore().showWarning('请输入产品名称'); return }
  if (form.product_type !== 'single' && !form.product_group) { useUIStore().showWarning('请选择产品组'); return }
  if (form.unit_price !== null && form.unit_price !== undefined && (form.unit_price < 0 || form.unit_price > 99999999.99)) { useUIStore().showWarning('单价需在0-99,999,999.99之间'); return }
  if (form.stock_quantity !== null && form.stock_quantity !== undefined && form.stock_quantity < 0) { useUIStore().showWarning('库存数量不能为负数'); return }
  if (form.min_stock_quantity !== null && form.min_stock_quantity !== undefined && form.min_stock_quantity < 0) { useUIStore().showWarning('最小库存不能为负数'); return }
  if (props.dialogType === 'edit' && form.min_stock_quantity > form.stock_quantity) { useUIStore().showWarning('最小库存不能大于库存数量'); return }
  emit('confirm', { form: { ...form, code, name }, materialItems: [...materialItems.value] })
}

const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>
