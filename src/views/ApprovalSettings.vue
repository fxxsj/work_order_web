<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div class="card">
      <div class="border-b border-gray-100 px-6 py-4 dark:border-dark-700">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">
          审核设置
        </h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-dark-400">
          按模块控制是否开启审核流程。关闭后，该模块提交即由系统自动通过并留痕，无需审核人介入。
        </p>
      </div>

      <div class="px-6 py-6">
        <div
          v-if="loading"
          class="py-10 text-center text-sm text-gray-400"
        >
          加载中...
        </div>

        <form
          v-else
          class="space-y-5"
          @submit.prevent="handleSave"
        >
          <Toggle
            v-for="item in moduleItems"
            :key="item.key"
            v-model="form[item.key]"
            :label="item.label"
            :hint="item.hint"
            :disabled="saving"
          />

          <div class="flex items-center justify-between border-t border-gray-100 pt-5 dark:border-dark-700">
            <p class="text-xs text-gray-400">
              {{ updatedAtText }}
            </p>
            <button
              type="submit"
              :disabled="saving"
              class="btn btn-primary"
            >
              {{ saving ? '保存中...' : '保存设置' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="card border border-amber-100 bg-amber-50/60 px-6 py-4 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
      <p class="font-medium">
        注意
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5">
        <li>关闭审核仅影响开关变更后的<strong>新提交</strong>单据，已处于「待审核」的单据不会被自动通过。</li>
        <li>系统自动通过的动作会写入审计日志，可在「审计日志」中追溯。</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Toggle } from '@/components/common'
import approvalConfigAPI, { type ApprovalConfig } from '@/api/modules/approval-config'
import { useUIStore } from '@/stores/ui'
import ErrorHandler from '@/utils/errorHandler'

type ModuleKey = Exclude<keyof ApprovalConfig, 'updated_at'>

const loading = ref(true)
const saving = ref(false)
const updatedAt = ref<string>('')

const form = reactive<Record<ModuleKey, boolean>>({
  workorder_approval_enabled: true,
  salesorder_approval_enabled: true,
  purchaseorder_approval_enabled: true,
  invoice_approval_enabled: true,
  supplierpayment_approval_enabled: true,
  stockin_approval_enabled: true,
  stockout_approval_enabled: true
})

const moduleItems: { key: ModuleKey; label: string; hint: string }[] = [
  { key: 'workorder_approval_enabled', label: '施工单审核', hint: '关闭后施工单提交即自动通过并生成任务' },
  { key: 'purchaseorder_approval_enabled', label: '采购单审核', hint: '关闭后采购单提交即自动批准' },
  { key: 'invoice_approval_enabled', label: '发票审核', hint: '关闭后发票提交即自动通过' },
  { key: 'supplierpayment_approval_enabled', label: '供应商付款审核', hint: '关闭后付款提交即自动通过并回写采购单' },
  { key: 'stockin_approval_enabled', label: '入库单审核', hint: '关闭后入库单提交即自动确认入库' },
  { key: 'stockout_approval_enabled', label: '出库单审核', hint: '关闭后出库单提交即自动确认出库' }
]

const updatedAtText = computed(() =>
  updatedAt.value ? `最后更新：${new Date(updatedAt.value).toLocaleString()}` : ''
)

onMounted(loadConfig)

async function loadConfig() {
  loading.value = true
  try {
    const data = (await approvalConfigAPI.get()) as unknown as ApprovalConfig
    applyConfig(data)
  } catch (error: any) {
    ErrorHandler.handle(error, 'ApprovalSettings.loadConfig')
    useUIStore().showError('加载审核设置失败')
  } finally {
    loading.value = false
  }
}

function applyConfig(data: ApprovalConfig) {
  moduleItems.forEach(({ key }) => {
    if (typeof data[key] === 'boolean') form[key] = data[key] as boolean
  })
  updatedAt.value = data.updated_at || ''
}

async function handleSave() {
  saving.value = true
  try {
    const data = (await approvalConfigAPI.update({ ...form })) as unknown as ApprovalConfig
    applyConfig(data)
    useUIStore().showSuccess('审核设置已保存')
  } catch (error: any) {
    ErrorHandler.handle(error, 'ApprovalSettings.handleSave')
    useUIStore().showError(error.response?.data?.error || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>
