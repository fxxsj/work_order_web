<template>
  <BaseDialog
    :show="dialogVisible"
    title="新建产品"
    width="narrow"
    @close="handleClose"
  >
    <div class="space-y-4">
      <Input
        v-model="form.name"
        label="产品名称"
        placeholder="请输入产品名称"
        required
      />
      <Input
        v-model="form.code"
        label="产品编码"
        placeholder="请输入产品编码"
      />
      <Input
        v-model="form.specification"
        label="规格"
        placeholder="请输入规格"
      />
      <Input
        v-model="form.unit"
        label="单位"
        placeholder="请输入单位，默认：件"
      />
      <Input
        v-model="form.unit_price"
        label="单价"
        type="number"
        placeholder="请输入单价"
      />
    </div>
    <template #footer>
      <button
        class="btn btn-secondary"
        @click="handleClose"
      >
        取消
      </button>
      <button
        class="btn btn-primary"
        :disabled="loading || !form.name"
        @click="handleSubmit"
      >
        <span
          v-if="loading"
          class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle mr-1"
        />
        创建
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Input } from '@/components/common'
import { productAPI } from '@/api/modules'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'created'])

const loading = ref(false)
const form = reactive({
  name: '',
  code: '',
  specification: '',
  unit: '',
  unit_price: null as number | null
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const resetForm = () => {
  form.name = ''
  form.code = ''
  form.specification = ''
  form.unit = ''
  form.unit_price = null
}

const handleSubmit = async () => {
  if (!form.name) {
    useUIStore().showWarning('请输入产品名称')
    return
  }

  loading.value = true
  try {
    const created: any = await productAPI.create({
      name: form.name,
      code: form.code || undefined,
      specification: form.specification || undefined,
      unit: form.unit || '件',
      unit_price: form.unit_price || undefined
    })
    useUIStore().showSuccess('产品创建成功')
    emit('created', created)
    handleClose()
  } catch (error: any) {
    useUIStore().showError(error?.message || '创建失败')
  } finally {
    loading.value = false
  }
}
</script>
