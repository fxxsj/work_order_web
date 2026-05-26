<template>
  <BaseDialog
    :show="dialogVisible"
    :title="dialogTitle"
    width="wide"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <Input
        v-model="form.base_code"
        label="图稿主编码"
        placeholder="留空则系统自动生成（格式：ART + yyyymm + 序号）"
        :disabled="isEditMode"
      />
      <div class="-mt-2 text-xs text-gray-400">
        {{ isEditMode ? '主编码不可修改' : '留空则自动生成，格式：ART202412001' }}
      </div>
      <div v-if="isEditMode">
        <label class="input-label mb-1.5 block">版本号</label>
        <InputNumber
          v-model="form.version"
          :min="1"
          disabled
          class="w-full"
        />
        <div class="mt-1 text-xs text-gray-400">
          完整编码：{{ form.base_code }}{{ form.version > 1 ? '-v' + form.version : '' }}
        </div>
      </div>
      <Input
        v-model="form.name"
        label="图稿名称"
        placeholder="请输入图稿名称"
      />
      <div>
        <label class="input-label mb-1.5 block">CMYK颜色</label>
        <CheckboxGroup
          v-model="form.cmyk_colors"
          :options="cmykOptions"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="input-label mb-1.5 block">其他颜色</label>
        <div
          v-for="(color, index) in form.other_colors"
          :key="index"
          class="mb-2 flex items-center gap-2"
        >
          <Input
            v-model="form.other_colors[index]"
            placeholder="请输入颜色名称，如：528C、金色"
            class="flex-1"
          />
          <button
            class="btn btn-danger btn-sm btn-circle"
            @click="removeOtherColor(index)"
          >
            <Icon
              name="trash"
              class="h-3 w-3"
            />
          </button>
        </div>
        <button
          class="btn btn-primary btn-sm w-fit"
          @click="addOtherColor"
        >
          <Icon
            name="plus"
            class="mr-1 inline h-3 w-3"
          />添加颜色
        </button>
      </div>
      <Input
        v-model="form.imposition_size"
        label="拼版尺寸"
        placeholder="如：420x594mm"
      />
      <div>
        <label class="input-label mb-1.5 block">关联刀模</label>
        <Select
          v-model="form.dies"
          :options="dieOptions"
          multiple
          filterable
          placeholder="请选择刀模（可多选）"
          class="w-full"
        />
      </div>
      <div>
        <label class="input-label mb-1.5 block">关联烫金版</label>
        <Select
          v-model="form.foiling_plates"
          :options="foilingPlateOptions"
          multiple
          filterable
          placeholder="请选择烫金版（可多选）"
          class="w-full"
        />
      </div>
      <div>
        <label class="input-label mb-1.5 block">关联压凸版</label>
        <Select
          v-model="form.embossing_plates"
          :options="embossingPlateOptions"
          multiple
          filterable
          placeholder="请选择压凸版（可多选）"
          class="w-full"
        />
      </div>

      <SectionDivider title="包含产品及拼版数量" />
      <div class="space-y-2">
        <button
          class="btn btn-primary btn-sm"
          @click="addProductItem"
        >
          <Icon
            name="plus"
            class="mr-1 inline h-3 w-3"
          />添加产品
        </button>
        <LineItemsTable
          :columns="productColumns"
          :items="productItems"
          class="mt-3"
          @delete="removeProductItem"
        >
            <template #cell-product="{ row, index }">
              <ProductSelector
                :model-value="row.product"
                :products="localProductList"
                @update:model-value="value => row.product = value"
                @create="openQuickProductCreate(index)"
              />
            </template>
            <template #cell-imposition_quantity="{ row }">
              <InputNumber
                v-model="row.imposition_quantity"
                :min="1"
                class="w-full"
              />
            </template>
          </LineItemsTable>
      </div>
      <TextArea
        v-model="form.notes"
        label="备注"
        :rows="3"
        placeholder="请输入备注信息"
        class="w-full"
      />
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
          @click="handleConfirm"
        >
          确定
        </button>
      </div>
    </template>
  </BaseDialog>
  <QuickProductCreateDialog
    v-model:visible="showQuickProductCreate"
    @created="handleProductCreated"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Icon, Input, InputNumber, TextArea, CheckboxGroup, Select, SectionDivider, LineItemsTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'
import ProductSelector from '@/views/product/components/ProductSelector.vue'
import QuickProductCreateDialog from '@/views/product/components/QuickProductCreateDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  artwork: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  productList: { type: Array as any, default: () => [] },
  dieList: { type: Array as any, default: () => [] },
  foilingPlateList: { type: Array as any, default: () => [] },
  embossingPlateList: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const productItems = ref<any[]>([])
const localProductList = ref<any[]>([])
const showQuickProductCreate = ref(false)
const pendingProductCreateIndex = ref<number | null>(null)

const FORM_INITIAL = { base_code: '', version: 1, name: '', cmyk_colors: [] as any[], other_colors: [] as any[], imposition_size: '', dies: [] as any[], foiling_plates: [] as any[], embossing_plates: [] as any[], notes: '' }
const form = reactive({ ...FORM_INITIAL })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const isEditMode = computed(() => !!props.artwork)
const dialogTitle = computed(() => isEditMode.value ? '编辑图稿' : '新建图稿')
const cmykOptions = [
  { value: 'C', label: 'C', color: '#00A0E3' },
  { value: 'M', label: 'M', color: '#E4007F' },
  { value: 'Y', label: 'Y', color: '#FDB813' },
  { value: 'K', label: 'K', color: '#1C1C1C' }
]
const dieOptions = computed(() => props.dieList.map((d: any) => ({ value: d.id, label: `${d.name} (${d.code})` })))
const foilingPlateOptions = computed(() => props.foilingPlateList.map((p: any) => ({ value: p.id, label: `${p.name} (${p.code})` })))
const embossingPlateOptions = computed(() => props.embossingPlateList.map((p: any) => ({ value: p.id, label: `${p.name} (${p.code})` })))

watch(() => props.productList, (products) => {
  localProductList.value = [...(products as any[])]
}, { immediate: true, deep: true })

const productColumns: Column[] = [
  { key: 'product', label: '产品名称', width: 250 },
  { key: 'imposition_quantity', label: '拼版数量', width: 144 },
]

watch(() => props.visible, (val: any) => { if (val) initForm() })

const initForm = () => {
  if (props.artwork) {
    Object.assign(form, {
      base_code: props.artwork.base_code || '',
      version: props.artwork.version || 1,
      name: props.artwork.name || '',
      cmyk_colors: props.artwork.cmyk_colors || [],
      other_colors: Array.isArray(props.artwork.other_colors) ? props.artwork.other_colors : (props.artwork.other_colors ? [props.artwork.other_colors] : []),
      imposition_size: props.artwork.imposition_size || '',
      dies: props.artwork.dies || [],
      foiling_plates: props.artwork.foiling_plates || [],
      embossing_plates: props.artwork.embossing_plates || [],
      notes: props.artwork.notes || ''
    })
    productItems.value = (props.artwork.products || []).map((p: any) => ({ id: p.id, product: p.product, imposition_quantity: p.imposition_quantity, sort_order: p.sort_order || 0 }))
  } else {
    resetForm()
  }
}

const resetForm = () => {
  Object.assign(form, FORM_INITIAL)
  productItems.value = []
}

const addProductItem = () => { productItems.value.push({ product: null, imposition_quantity: 1, sort_order: productItems.value.length }) }
const removeProductItem = (index: any) => { productItems.value.splice(index, 1) }
const openQuickProductCreate = (index: number | null = null) => {
  pendingProductCreateIndex.value = typeof index === 'number' ? index : null
  showQuickProductCreate.value = true
}
const handleProductCreated = (product: any) => {
  localProductList.value.push(product)
  if (pendingProductCreateIndex.value !== null && productItems.value[pendingProductCreateIndex.value]) {
    productItems.value[pendingProductCreateIndex.value].product = product.id
  }
  pendingProductCreateIndex.value = null
}
const addOtherColor = () => { form.other_colors.push('') }
const removeOtherColor = (index: any) => { form.other_colors.splice(index, 1) }

const handleConfirm = () => {
  if (!form.name) { useUIStore().showWarning('请输入图稿名称'); return }
  const data: any = { ...form }
  if (!isEditMode.value && !data.base_code) delete (data as any).base_code
  if (!isEditMode.value) delete (data as any).version
  if (data.other_colors) data.other_colors = data.other_colors.filter((c: any) => c && c.trim())
  data.products_data = productItems.value.filter((item: any) => item.product).map((item: any) => ({ product: item.product, imposition_quantity: item.imposition_quantity || 1 }))
  emit('confirm', data)
}

const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>
