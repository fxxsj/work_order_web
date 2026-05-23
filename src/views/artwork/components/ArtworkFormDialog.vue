<template>
  <BaseDialog :show="dialogVisible" :title="dialogTitle" width="wide" @close="handleClose; dialogVisible = false;">
    <div class="space-y-4">
      <Input v-model="form.base_code" label="图稿主编码" placeholder="留空则系统自动生成（格式：ART + yyyymm + 序号）" :disabled="isEditMode" />
      <div class="-mt-2 text-xs text-gray-400">{{ isEditMode ? '主编码不可修改' : '留空则自动生成，格式：ART202412001' }}</div>
      <div v-if="isEditMode" class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">版本号</label>
        <div class="flex-1">
          <InputNumber v-model="form.version" :min="1" disabled class="w-full" />
          <div class="mt-1 text-xs text-gray-400">完整编码：{{ form.base_code }}{{ form.version > 1 ? '-v' + form.version : '' }}</div>
        </div>
      </div>
      <Input v-model="form.name" label="图稿名称" placeholder="请输入图稿名称" />
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">CMYK颜色</label>
        <CheckboxGroup v-model="form.cmyk_colors" :options="cmykOptions" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="input-label block">其他颜色</label>
        <div v-for="(color, index) in form.other_colors" :key="index" class="mb-2 flex items-center gap-2">
          <input v-model="form.other_colors[index]" placeholder="请输入颜色名称，如：528C、金色" class="input flex-1" />
          <button class="btn btn-danger btn-sm btn-circle" @click="removeOtherColor(index)"><Icon name="trash" class="h-3 w-3" /></button>
        </div>
        <button class="btn btn-primary btn-sm w-fit" @click="addOtherColor"><Icon name="plus" class="mr-1 inline h-3 w-3" />添加颜色</button>
      </div>
      <Input v-model="form.imposition_size" label="拼版尺寸" placeholder="如：420x594mm" />
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">关联刀模</label>
        <Select v-model="form.dies" :options="dieOptions" multiple filterable placeholder="请选择刀模（可多选）" class="flex-1" />
      </div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">关联烫金版</label>
        <Select v-model="form.foiling_plates" :options="foilingPlateOptions" multiple filterable placeholder="请选择烫金版（可多选）" class="flex-1" />
      </div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">关联压凸版</label>
        <Select v-model="form.embossing_plates" :options="embossingPlateOptions" multiple filterable placeholder="请选择压凸版（可多选）" class="flex-1" />
      </div>

      <div class="flex items-center my-4"><span class="pr-3 text-sm text-gray-500 dark:text-gray-400">包含产品及拼版数量</span><hr class="flex-1 border-t border-gray-200 dark:border-dark-700" /></div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">产品列表</label>
        <div class="flex-1">
          <button class="btn btn-primary btn-sm mb-3" @click="addProductItem"><Icon name="plus" class="mr-1 inline h-3 w-3" />添加产品</button>
          <div class="table-scroll overflow-x-auto">
            <table class="dialog-table w-full">
              <thead>
                <tr>
                  <th class="text-left">产品名称</th>
                  <th class="text-left w-36">拼版数量</th>
                  <th class="text-center w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in productItems" :key="index">
                  <td class="py-1">
                    <Select v-model="item.product" :options="productOptions" placeholder="请选择产品" filterable class="w-full" />
                  </td>
                  <td class="py-1">
                    <InputNumber v-model="item.imposition_quantity" :min="1" class="w-full" />
                  </td>
                  <td class="py-1 text-center">
                    <button class="btn btn-danger btn-sm" @click="removeProductItem(index)"><Icon name="trash" class="h-3 w-3" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <TextArea v-model="form.notes" label="备注" :rows="3" placeholder="请输入备注信息" class="w-full" />
    </div>
    <template #footer>
      <button class="btn" @click="handleClose">取消</button>
      <button class="btn btn-primary" :disabled="loading" @click="handleConfirm">确定</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Icon, Input, InputNumber, TextArea, CheckboxGroup, Select } from '@/components/common'
import { ElMessage } from '@/utils/message'

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

const FORM_INITIAL = { base_code: '', version: 1, name: '', cmyk_colors: [] as any[], other_colors: [] as any[], imposition_size: '', dies: [] as any[], foiling_plates: [] as any[], embossing_plates: [] as any[], notes: '' }
const form = reactive({ ...FORM_INITIAL })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const isEditMode = computed(() => !!props.artwork)
const dialogTitle = computed(() => isEditMode.value ? '编辑图稿' : '新建图稿')
const cmykOptions = [
  { value: 'C', label: 'C' },
  { value: 'M', label: 'M' },
  { value: 'Y', label: 'Y' },
  { value: 'K', label: 'K' }
]
const dieOptions = computed(() => props.dieList.map((d: any) => ({ value: d.id, label: `${d.name} (${d.code})` })))
const foilingPlateOptions = computed(() => props.foilingPlateList.map((p: any) => ({ value: p.id, label: `${p.name} (${p.code})` })))
const embossingPlateOptions = computed(() => props.embossingPlateList.map((p: any) => ({ value: p.id, label: `${p.name} (${p.code})` })))
const productOptions = computed(() => props.productList.map((p: any) => ({ value: p.id, label: `${p.name} (${p.code})` })))

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
const addOtherColor = () => { form.other_colors.push('') }
const removeOtherColor = (index: any) => { form.other_colors.splice(index, 1) }

const handleConfirm = () => {
  if (!form.name) { ElMessage.warning('请输入图稿名称'); return }
  const data: any = { ...form }
  if (!isEditMode.value && !data.base_code) delete (data as any).base_code
  if (!isEditMode.value) delete (data as any).version
  if (data.other_colors) data.other_colors = data.other_colors.filter((c: any) => c && c.trim())
  data.products_data = productItems.value.filter((item: any) => item.product).map((item: any) => ({ product: item.product, imposition_quantity: item.imposition_quantity || 1 }))
  emit('confirm', data)
}

const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>
