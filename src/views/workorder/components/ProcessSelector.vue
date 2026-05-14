<template>
  <el-form-item label="工序" prop="processes">
    <el-select :model-value="modelValue" placeholder="请选择工序" multiple filterable :loading="loading" :disabled="disabled" style="width: 100%;" :clearable="clearable" @update:model-value="v => emit('update:modelValue', v)">
      <el-option v-for="p in processList" :key="p.id" :label="p.name" :value="p.id"><div class="process-option"><span>{{ p.name }}</span><el-tag v-if="p.code" size="small" type="info">{{ p.code }}</el-tag></div></el-option>
    </el-select>
    <div v-if="showHint" style="color: #909399; font-size: 12px; margin-top: 5px;">已选择 {{ selectedCount }} 个工序</div>
  </el-form-item>
</template>

<script setup>
import { ref, computed } from 'vue'
import { processAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({ modelValue: { type: Array, default: () => [] }, disabled: { type: Boolean, default: false }, showHint: { type: Boolean, default: false }, clearable: { type: Boolean, default: true } })
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const processList = ref([])
const selectedCount = computed(() => props.modelValue?.length || 0)

let cacheTimestamp = 0
const CACHE_DURATION = 10 * 60 * 1000

const loadProcesses = async () => {
  const now = Date.now()
  if (processList.value.length === 0 || now - cacheTimestamp > CACHE_DURATION) {
    loading.value = true
    try { const res = await processAPI.getList({ is_active: true, page_size: 1000 }); processList.value = res?.results || res || []; cacheTimestamp = now } catch (error) { ErrorHandler.handle(error) } finally { loading.value = false }
  }
}

loadProcesses()
</script>

<style scoped>
.process-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-control-gap);
}
</style>
