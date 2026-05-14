<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="var(--ui-dialog-width-lg)" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="图稿主编码" prop="base_code">
        <el-input v-model="form.base_code" placeholder="留空则系统自动生成（格式：ART + yyyymm + 序号）" :disabled="isEditMode" />
        <div class="form-hint">{{ isEditMode ? '主编码不可修改' : '留空则自动生成，格式：ART202412001' }}</div>
      </el-form-item>
      <el-form-item v-if="isEditMode" label="版本号" prop="version">
        <el-input-number v-model="form.version" :min="1" disabled style="width: 100%;" />
        <div class="form-hint">完整编码：{{ form.base_code }}{{ form.version > 1 ? '-v' + form.version : '' }}</div>
      </el-form-item>
      <el-form-item label="图稿名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入图稿名称" />
      </el-form-item>
      <el-form-item label="CMYK颜色">
        <el-checkbox-group v-model="form.cmyk_colors">
          <el-checkbox label="C">C</el-checkbox>
          <el-checkbox label="M">M</el-checkbox>
          <el-checkbox label="Y">Y</el-checkbox>
          <el-checkbox label="K">K</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="其他颜色">
        <div v-for="(color, index) in form.other_colors" :key="index" class="other-color-row">
          <el-input v-model="form.other_colors[index]" placeholder="请输入颜色名称，如：528C、金色" class="other-color-input" />
          <el-button type="danger" size="small" :icon="Delete" circle @click="removeOtherColor(index)" />
        </div>
        <el-button type="primary" size="small" :icon="Plus" @click="addOtherColor">添加颜色</el-button>
      </el-form-item>
      <el-form-item label="拼版尺寸"><el-input v-model="form.imposition_size" placeholder="如：420x594mm" /></el-form-item>
      <el-form-item label="关联刀模">
        <el-select v-model="form.dies" placeholder="请选择刀模（可多选）" filterable clearable multiple style="width: 100%;">
          <el-option v-for="die in dieList" :key="die.id" :label="`${die.name} (${die.code})`" :value="die.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联烫金版">
        <el-select v-model="form.foiling_plates" placeholder="请选择烫金版（可多选）" filterable clearable multiple style="width: 100%;">
          <el-option v-for="plate in foilingPlateList" :key="plate.id" :label="`${plate.name} (${plate.code})`" :value="plate.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联压凸版">
        <el-select v-model="form.embossing_plates" placeholder="请选择压凸版（可多选）" filterable clearable multiple style="width: 100%;">
          <el-option v-for="plate in embossingPlateList" :key="plate.id" :label="`${plate.name} (${plate.code})`" :value="plate.id" />
        </el-select>
      </el-form-item>

      <el-divider content-position="left">包含产品及拼版数量</el-divider>
      <el-form-item label="产品列表">
        <el-button type="primary" size="small" :icon="Plus" @click="addProductItem">添加产品</el-button>
        <div class="table-scroll">
          <el-table :data="productItems" border class="dialog-table">
            <el-table-column label="产品名称" width="250">
              <template #default="scope">
                <el-select v-model="scope.row.product" placeholder="请选择产品" filterable style="width: 100%;">
                  <el-option v-for="p in productList" :key="p.id" :label="`${p.name} (${p.code})`" :value="p.id" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="拼版数量" width="150">
              <template #default="scope"><el-input-number v-model="scope.row.imposition_quantity" :min="1" style="width: 100%;" size="small" /></template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="scope"><el-button type="danger" size="small" :icon="Delete" @click="removeProductItem(scope.$index)" /></template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
      <el-form-item label="备注"><el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注信息" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  artwork: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  productList: { type: Array, default: () => [] },
  dieList: { type: Array, default: () => [] },
  foilingPlateList: { type: Array, default: () => [] },
  embossingPlateList: { type: Array, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref(null)
const productItems = ref([])

const FORM_INITIAL = { base_code: '', version: 1, name: '', cmyk_colors: [], other_colors: [], imposition_size: '', dies: [], foiling_plates: [], embossing_plates: [], notes: '' }
const form = reactive({ ...FORM_INITIAL })

const rules = { name: [{ required: true, message: '请输入图稿名称', trigger: 'blur' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const isEditMode = computed(() => !!props.artwork)
const dialogTitle = computed(() => isEditMode.value ? '编辑图稿' : '新建图稿')

watch(() => props.visible, (val) => { if (val) initForm() })

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
    productItems.value = (props.artwork.products || []).map(p => ({ id: p.id, product: p.product, imposition_quantity: p.imposition_quantity, sort_order: p.sort_order || 0 }))
  } else {
    resetForm()
  }
  nextTick(() => { formRef.value?.clearValidate() })
}

const resetForm = () => {
  Object.assign(form, FORM_INITIAL)
  productItems.value = []
  nextTick(() => { formRef.value?.clearValidate() })
}

const addProductItem = () => { productItems.value.push({ product: null, imposition_quantity: 1, sort_order: productItems.value.length }) }
const removeProductItem = (index) => { productItems.value.splice(index, 1) }
const addOtherColor = () => { form.other_colors.push('') }
const removeOtherColor = (index) => { form.other_colors.splice(index, 1) }

const handleConfirm = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return
    const data = { ...form }
    if (!isEditMode.value && !data.base_code) delete data.base_code
    if (!isEditMode.value) delete data.version
    if (data.other_colors) data.other_colors = data.other_colors.filter(c => c && c.trim())
    data.products_data = productItems.value.filter(item => item.product).map(item => ({ product: item.product, imposition_quantity: item.imposition_quantity || 1 }))
    emit('confirm', data)
  })
}

const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.form-hint {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.other-color-row {
  display: flex;
  align-items: center;
  gap: var(--ui-control-gap);
  margin-bottom: var(--ui-control-gap);
}

.other-color-input {
  flex: 1 1 auto;
  min-width: 0;
}

.table-scroll {
  margin-top: var(--ui-control-gap);
  overflow-x: auto;
}

.dialog-table {
  width: 100%;
}

@media (max-width: bp.$breakpoint-phone-max) {
  .other-color-row {
    align-items: stretch;
  }
}
</style>
