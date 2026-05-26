<template>
  <BaseDialog
    :show="dialogVisible"
    title="新建物料"
    width="narrow"
    @close="handleClose"
  >
    <div class="space-y-4">
      <Input
        v-model="form.name"
        label="物料名称"
        placeholder="请输入物料名称"
        required
      />
      <Input
        v-model="form.code"
        label="物料编码"
        placeholder="请输入物料编码"
      />
      <Input
        v-model="form.specification"
        label="规格"
        placeholder="请输入规格"
      />
      <Input
        v-model="form.unit"
        label="单位"
        placeholder="请输入单位"
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
import { computed, reactive, ref } from 'vue'
import { Input } from '@/components/common'
import { materialAPI } from '@/api/modules'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'created'])

const loading = ref(false)
const form = reactive({
  name: '',
  code: '',
  specification: '',
  unit: ''
})

const dialogVisible = computed({
  get: () => props.modelValue ?? props.visible,
  set: (val) => {
    emit('update:modelValue', val)
    emit('update:visible', val)
  }
})

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  form.name = ''
  form.code = ''
  form.specification = ''
  form.unit = ''
}

const handleSubmit = async () => {
  if (!form.name) {
    useUIStore().showWarning('请输入物料名称')
    return
  }

  loading.value = true
  try {
    const created: any = await materialAPI.create({
      name: form.name,
      code: form.code || undefined,
      specification: form.specification || undefined,
      unit: form.unit || undefined
    })
    useUIStore().showSuccess('物料创建成功')
    emit('created', created)
    handleClose()
  } catch (error: any) {
    useUIStore().showError(error?.message || '创建失败')
  } finally {
    loading.value = false
  }
}
</script>
