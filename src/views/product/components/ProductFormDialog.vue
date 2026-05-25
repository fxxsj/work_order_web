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

      <SectionDivider title="默认物料配置" />
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">物料列表</label>
        <div class="flex-1">
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
            <template #cell-material="{ row }">
              <Select
                v-model="row.material"
                :options="materialOptions"
                placeholder="请选择物料"
                filterable
                class="w-full"
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
      </div>

      <SectionDivider title="默认工序配置" />
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">默认工序</label>
        <CheckboxGroup
          v-model="form.default_processes"
          :options="processOptions"
          class="flex-1"
        />
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">是否启用</label>
        <Toggle v-model="form.is_active" />
      </div>
    </div>
    <template #footer>
      <button
        class="btn"
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
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Icon, Input, InputNumber, Select, TextArea, Toggle, CheckboxGroup, SectionDivider, LineItemsTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'

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
const isOpen = ref(false)

// Sync with parent visibility prop and init form when opening
watch(() => props.visible, (val) => {
  isOpen.value = val
  if (val) {
    if (props.dialogType === 'edit' && props.product) initFormFromProduct()
    else resetForm()
  }
}, { immediate: true })

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
const materialOptions = computed(() => props.materials.map((m: any) => ({ value: m.id, label: `${m.name} (${m.code})` })))

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
}

const resetForm = () => {
  Object.assign(form, FORM_INITIAL)
  materialItems.value = []
}

const handleProductTypeChange = (value: any) => { if (value === 'single') form.product_group = null }
const addMaterialItem = () => { materialItems.value.push({ material: null, material_size: '', material_usage: '', need_cutting: false, notes: '', sort_order: materialItems.value.length }) }
const removeMaterialItem = (index: any) => { materialItems.value.splice(index, 1) }

const handleSubmit = () => {
  if (!form.code) { useUIStore().showWarning('请输入产品编码'); return }
  if (!form.name) { useUIStore().showWarning('请输入产品名称'); return }
  if (!form.specification) { useUIStore().showWarning('请输入产品规格'); return }
  emit('confirm', { form: { ...form }, materialItems: [...materialItems.value] })
}

const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>
