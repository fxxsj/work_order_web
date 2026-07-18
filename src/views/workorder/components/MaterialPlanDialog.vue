<template>
  <BaseDialog
    :show="show"
    :title="`拼版物料计划 · ${material?.material_name || ''}`"
    width="wide"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <div class="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
        产品材料要求为 {{ material?.material_name }}。请选择实际库存/采购规格，并录入拼版确认后的开料尺寸。
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          v-model="form.purchase_material"
          label="库存/采购规格"
          :options="stockMaterialOptions"
          placeholder="请选择如：150g双铜 大度 889×1194"
          searchable
          required
        />
        <Select
          v-model="form.artwork"
          label="拼版图稿"
          :options="artworkOptions"
          placeholder="可选，用于版本追溯"
          clearable
        />
        <Input
          v-model="form.cut_width_mm"
          type="number"
          label="开料宽度（mm）"
          required
          placeholder="443"
        />
        <Input
          v-model="form.cut_height_mm"
          type="number"
          label="开料高度（mm）"
          required
          placeholder="595"
        />
        <Input
          v-model="form.required_cut_quantity"
          type="number"
          label="所需开料数量"
          required
          placeholder="4000"
        />
        <Input
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
        <div>
          <span class="text-gray-500">每张原纸开出</span>
          <div class="font-semibold">
            {{ material.pieces_per_parent_sheet }} 张
          </div>
        </div>
        <div>
          <span class="text-gray-500">计划原纸</span>
          <div class="font-semibold">
            {{ material.planned_parent_quantity }}
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
            @click="calculate"
          >
            计算计划
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
  artworks: { type: Array as any, default: () => [] },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'calculate', 'confirm', 'invalidate'])

const form = reactive({
  purchase_material: null as number | null,
  artwork: null as number | null,
  cut_width_mm: '',
  cut_height_mm: '',
  required_cut_quantity: '',
  wastage_rate: '5'
})

const stockMaterialOptions = computed(() => props.stockMaterials
  .filter((item: any) => item.specification_level === 'stock'
    && item.base_material === props.material?.material
    && item.sheet_width_mm
    && item.sheet_height_mm)
  .map((item: any) => ({
    value: item.id,
    label: `${item.name} · ${item.sheet_width_mm}×${item.sheet_height_mm}mm · 可用${item.available_quantity ?? item.stock_quantity}${item.unit}`
  })))
const artworkOptions = computed(() => props.artworks.map((item: any) => ({
  value: item.id,
  label: `${item.code || item.base_code || ''} ${item.name || ''}`.trim()
})))

watch(() => props.material, (value: any) => {
  if (!value) return
  form.purchase_material = value.purchase_material || null
  form.artwork = value.artwork || null
  form.cut_width_mm = value.cut_width_mm || ''
  form.cut_height_mm = value.cut_height_mm || ''
  form.required_cut_quantity = value.required_cut_quantity || ''
  form.wastage_rate = value.wastage_rate ?? '5'
}, { immediate: true })

const calculate = () => {
  if (!form.purchase_material || !Number(form.cut_width_mm) || !Number(form.cut_height_mm) || !Number(form.required_cut_quantity)) {
    ErrorHandler.showWarning('请选择采购规格，并填写有效的开料尺寸和数量')
    return
  }
  emit('calculate', {
    purchase_material: form.purchase_material,
    artwork: form.artwork,
    cut_width_mm: form.cut_width_mm,
    cut_height_mm: form.cut_height_mm,
    required_cut_quantity: form.required_cut_quantity,
    wastage_rate: form.wastage_rate || 0
  })
}

const invalidate = () => {
  const reason = window.prompt('请输入作废原因（图稿版本或拼版尺寸变更等）')
  if (reason?.trim()) emit('invalidate', reason.trim())
}
</script>
