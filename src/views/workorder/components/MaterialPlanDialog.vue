<template>
  <BaseDialog
    :show="show"
    :title="`${isSpecificationSelection ? '确认物料规格' : '拼版物料计划'} · ${material?.material_name || ''}`"
    width="wide"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <div class="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
        <template v-if="isSpecificationSelection">
          产品只记录了“{{ material?.material_name }}”。请在这里选择本次实际使用的具体规格和数量。
        </template>
        <template v-else>
          产品只记录材料要求 {{ material?.material_name }}。请在拼版后确定原纸、开料尺寸和备料方式。
        </template>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          v-if="!isSpecificationSelection"
          v-model="form.specification_source"
          label="本次原纸来源"
          :options="specificationSourceOptions"
          required
        />
        <Select
          v-if="isSpecificationSelection || form.specification_source === 'stock'"
          v-model="form.purchase_material"
          label="库存/采购规格"
          :options="stockMaterialOptions"
          placeholder="请选择如：150g双铜 大度 889×1194"
          searchable
          required
        />
        <template v-else-if="!isSpecificationSelection">
          <Input
            v-model="form.custom_parent_width_mm"
            type="number"
            label="特规原纸宽度（mm）"
            required
            placeholder="920"
          />
          <Input
            v-model="form.custom_parent_height_mm"
            type="number"
            label="特规原纸高度（mm）"
            required
            placeholder="1250"
          />
          <Select
            v-model="form.custom_supplier"
            label="特规供应商"
            :options="supplierOptions"
            searchable
            required
          />
          <Input
            v-model="form.custom_unit_price"
            type="number"
            label="预计单价（可选）"
            placeholder="0"
          />
        </template>
        <Select
          v-if="!isSpecificationSelection"
          v-model="form.artwork"
          label="拼版图稿"
          :options="artworkOptions"
          placeholder="可选，用于版本追溯"
          clearable
        />
        <Input
          v-if="!isSpecificationSelection"
          v-model="form.cut_width_mm"
          type="number"
          label="开料宽度（mm）"
          required
          placeholder="443"
        />
        <Input
          v-if="!isSpecificationSelection"
          v-model="form.cut_height_mm"
          type="number"
          label="开料高度（mm）"
          required
          placeholder="595"
        />
        <Input
          v-if="!isSpecificationSelection"
          v-model="form.required_cut_quantity"
          type="number"
          label="所需开料数量"
          required
          placeholder="4000"
        />
        <Input
          v-if="isSpecificationSelection"
          v-model="form.required_quantity"
          type="number"
          label="计划需求数量"
          required
          placeholder="如：1000"
        />
        <Select
          v-if="!isSpecificationSelection"
          v-model="form.preparation_mode"
          label="备料方式"
          :options="paperPreparationOptions"
          required
        />
        <Input
          v-if="!isSpecificationSelection"
          v-model="form.wastage_rate"
          type="number"
          label="计划损耗率（%）"
          placeholder="5"
        />
      </div>

      <div
        v-if="material?.planning_status === 'calculated' || material?.planning_status === 'confirmed'"
        class="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 p-4 text-sm dark:border-dark-700 md:grid-cols-4"
      >
        <div v-if="!isSpecificationSelection">
          <span class="text-gray-500">每张原纸开出</span>
          <div class="font-semibold">
            {{ material.pieces_per_parent_sheet }} 张
          </div>
        </div>
        <div>
          <span class="text-gray-500">{{ isSpecificationSelection ? '计划数量' : '计划原纸' }}</span>
          <div class="font-semibold">
            {{ isSpecificationSelection ? material.planned_material_quantity : material.planned_parent_quantity }}
          </div>
        </div>
        <div>
          <span class="text-gray-500">库存预留</span>
          <div class="font-semibold">
            {{ material.reserved_quantity }}
          </div>
        </div>
        <div>
          <span class="text-gray-500">建议采购</span>
          <div class="font-semibold text-primary-600">
            {{ material.purchase_quantity }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full flex-wrap justify-between gap-3">
        <BaseButton
          v-if="material?.planning_status === 'confirmed'"
          variant="danger"
          :loading="loading"
          @click="invalidate"
        >
          作废计划
        </BaseButton>
        <span v-else />
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            @click="emit('close')"
          >
            关闭
          </BaseButton>
          <BaseButton
            v-if="material?.planning_status !== 'confirmed'"
            variant="secondary"
            :loading="loading"
            @click="submitPlan"
          >
            {{ isSpecificationSelection ? '生成计划' : '计算计划' }}
          </BaseButton>
          <BaseButton
            v-if="material?.planning_status === 'calculated'"
            variant="primary"
            :loading="loading"
            @click="emit('confirm')"
          >
            确认并预留库存
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { BaseButton, BaseDialog, Input, Select } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  show: { type: Boolean, default: false },
  material: { type: Object as any, default: null },
  stockMaterials: { type: Array as any, default: () => [] },
  suppliers: { type: Array as any, default: () => [] },
  artworks: { type: Array as any, default: () => [] },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'calculate', 'resolve', 'confirm', 'invalidate'])

const isSpecificationSelection = computed(() => props.material?.calculation_mode === 'specification_selection')

const form = reactive({
  specification_source: 'stock',
  purchase_material: null as number | null,
  custom_parent_width_mm: '',
  custom_parent_height_mm: '',
  custom_supplier: null as number | null,
  custom_unit_price: '',
  artwork: null as number | null,
  cut_width_mm: '',
  cut_height_mm: '',
  required_cut_quantity: '',
  required_quantity: '',
  preparation_mode: 'supplier_cutting',
  wastage_rate: '5'
})

const specificationSourceOptions = [
  { value: 'stock', label: '选择已有常用规格' },
  { value: 'custom', label: '本单一次性特规' }
]
const paperPreparationOptions = [
  { value: 'internal_cutting', label: '厂内开料' },
  { value: 'supplier_cutting', label: '供应商按尺寸供货' }
]

const stockMaterialOptions = computed(() => props.stockMaterials
  .filter((item: any) => item.specification_level === 'stock'
    && item.base_material === props.material?.material
    && (isSpecificationSelection.value || (item.sheet_width_mm && item.sheet_height_mm)))
  .map((item: any) => ({
    value: item.id,
    label: `${item.name}${item.sheet_width_mm && item.sheet_height_mm ? ` · ${item.sheet_width_mm}×${item.sheet_height_mm}mm` : ''} · 可用${item.available_quantity ?? item.stock_quantity}${item.unit}`
  })))
const artworkOptions = computed(() => props.artworks.map((item: any) => ({
  value: item.id,
  label: `${item.code || item.base_code || ''} ${item.name || ''}`.trim()
})))
const supplierOptions = computed(() => props.suppliers.map((item: any) => ({
  value: item.id,
  label: `${item.code ? `${item.code} · ` : ''}${item.name}`
})))

watch(() => props.material, (value: any) => {
  if (!value) return
  form.specification_source = value.purchase_material_is_temporary ? 'custom' : 'stock'
  form.purchase_material = value.purchase_material || null
  form.custom_parent_width_mm = value.purchase_material_is_temporary ? (value.parent_sheet_width_mm || '') : ''
  form.custom_parent_height_mm = value.purchase_material_is_temporary ? (value.parent_sheet_height_mm || '') : ''
  form.custom_supplier = value.purchase_material_is_temporary ? (value.purchase_material_supplier || null) : null
  form.custom_unit_price = value.purchase_material_is_temporary ? (value.purchase_material_unit_price || '') : ''
  form.artwork = value.artwork || null
  form.cut_width_mm = value.cut_width_mm || ''
  form.cut_height_mm = value.cut_height_mm || ''
  form.required_cut_quantity = value.required_cut_quantity || ''
  form.required_quantity = value.planned_material_quantity || value.material_usage?.replace(/[^0-9.]/g, '') || ''
  form.preparation_mode = value.preparation_mode === 'internal_cutting' ? 'internal_cutting' : 'supplier_cutting'
  form.wastage_rate = value.wastage_rate ?? '5'
}, { immediate: true })

const submitPlan = () => {
  if (isSpecificationSelection.value) {
    if (!form.purchase_material || !Number(form.required_quantity)) {
      ErrorHandler.showWarning('请选择具体规格并填写有效的计划需求数量')
      return
    }
    emit('resolve', {
      purchase_material: form.purchase_material,
      required_quantity: form.required_quantity
    })
    return
  }
  const isCustom = form.specification_source === 'custom'
  const sourceValid = isCustom
    ? Number(form.custom_parent_width_mm) > 0 && Number(form.custom_parent_height_mm) > 0 && Boolean(form.custom_supplier)
    : Boolean(form.purchase_material)
  if (!sourceValid || !Number(form.cut_width_mm) || !Number(form.cut_height_mm) || !Number(form.required_cut_quantity)) {
    ErrorHandler.showWarning('请完整填写原纸规格、供应商、开料尺寸和数量')
    return
  }
  emit('calculate', {
    ...(isCustom
      ? {
          custom_parent_width_mm: form.custom_parent_width_mm,
          custom_parent_height_mm: form.custom_parent_height_mm,
          custom_supplier: form.custom_supplier,
          custom_unit_price: form.custom_unit_price || 0
        }
      : { purchase_material: form.purchase_material }),
    artwork: form.artwork,
    cut_width_mm: form.cut_width_mm,
    cut_height_mm: form.cut_height_mm,
    required_cut_quantity: form.required_cut_quantity,
    preparation_mode: form.preparation_mode,
    wastage_rate: form.wastage_rate || 0
  })
}

const invalidate = () => {
  const reason = window.prompt('请输入作废原因（图稿版本或拼版尺寸变更等）')
  if (reason?.trim()) emit('invalidate', reason.trim())
}
</script>
