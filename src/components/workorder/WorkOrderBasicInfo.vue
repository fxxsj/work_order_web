<template>
  <DescriptionGrid :columns="3">
    <DescriptionItem label="施工单号">
      {{ workOrder?.order_number }}
    </DescriptionItem>
    <DescriptionItem label="客户">
      {{ workOrder?.customer_name }}
    </DescriptionItem>
    <DescriptionItem label="业务员">
      {{ salespersonName }}
    </DescriptionItem>
    <DescriptionItem label="制表人">
      {{ workOrder?.manager_name || '-' }}
    </DescriptionItem>
    <DescriptionItem
      v-if="workOrder?.product_name"
      label="产品名称"
    >
      {{ workOrder.product_name }}
    </DescriptionItem>
    <DescriptionItem
      v-if="displayQuantity"
      label="生产数量"
    >
      {{ displayQuantity }} 车
    </DescriptionItem>
    <DescriptionItem label="总金额">
      ¥{{ workOrder?.total_amount }}
    </DescriptionItem>
    <DescriptionItem label="状态">
      <div
        v-if="canEdit"
        class="inline-block"
      >
        <button
          ref="statusTriggerRef"
          type="button"
          class="inline-flex items-center gap-1 rounded-full align-middle focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800"
          @click.stop="toggleStatusMenu"
        >
          <StatusTag
            :status="workOrder?.status"
            :label="workOrder?.status_display || currentStatusLabel"
            category="workOrder"
          />
          <Icon
            name="chevronDown"
            size="xs"
            class="text-gray-400"
          />
        </button>
        <Teleport to="body">
          <div
            v-if="statusMenuOpen"
            ref="statusMenuRef"
            class="fixed z-[100000030] min-w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-dark-600 dark:bg-dark-800"
            :style="statusMenuStyle"
            @click.stop
          >
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-dark-100 dark:hover:bg-dark-700"
              @click="handleStatusChange(option.value)"
            >
              <span>{{ option.label }}</span>
              <Icon
                v-if="option.value === workOrder?.status"
                name="check"
                size="sm"
                class="text-primary-500"
              />
            </button>
          </div>
        </Teleport>
      </div>
      <StatusTag
        v-else
        :status="workOrder?.status"
        :label="workOrder?.status_display || statusText"
        category="workOrder"
      />
    </DescriptionItem>
    <DescriptionItem label="审核状态">
      <StatusTag
        :status="workOrder?.approval_status"
        :label="workOrder?.approval_status_display || approvalStatusText"
        category="approval"
      />
    </DescriptionItem>
    <DescriptionItem label="优先级">
      <StatusTag
        :status="workOrder?.priority"
        :label="workOrder?.priority_display || priorityText"
        category="priority"
      />
    </DescriptionItem>
    <DescriptionItem label="进度">
      <ProgressBar
        :percentage="workOrder?.progress_percentage ?? progress"
        :status="workOrder?.progress_percentage === 100 ? 'success' : 'active'"
      />
    </DescriptionItem>
    <DescriptionItem label="下单日期">
      {{ formatDate(workOrder?.order_date) }}
    </DescriptionItem>
    <DescriptionItem label="交货日期">
      {{ formatDate(workOrder?.delivery_date) }}
    </DescriptionItem>
  </DescriptionGrid>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { StatusTag, DescriptionGrid, DescriptionItem, Icon } from '@/components/common'
import { formatDate } from '@/utils/filter'

const props = defineProps({
  workOrder: { type: Object, default: null },
  salespersonName: { type: String, default: '' },
  displayQuantity: { type: [Number, String], default: null },
  progress: { type: Number, default: 0 },
  statusText: { type: String, default: '' },
  approvalStatusText: { type: String, default: '' },
  priorityText: { type: String, default: '' },
  canEdit: { type: Boolean, default: false }
})
const emit = defineEmits(['status-change'])
const statusOptions = [
  { value: 'pending', label: '待开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'paused', label: '已暂停' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const statusMenuOpen = ref(false)
const statusTriggerRef = ref<HTMLElement | null>(null)
const statusMenuRef = ref<HTMLElement | null>(null)
const statusMenuPosition = ref({ top: 0, left: 0, width: 128 })
const currentStatusLabel = computed(() =>
  statusOptions.find(option => option.value === props.workOrder?.status)?.label || props.statusText || '-'
)
const statusMenuStyle = computed(() => ({
  top: `${statusMenuPosition.value.top}px`,
  left: `${statusMenuPosition.value.left}px`,
  minWidth: `${statusMenuPosition.value.width}px`
}))

const updateStatusMenuPosition = () => {
  const rect = statusTriggerRef.value?.getBoundingClientRect()
  if (!rect) return
  statusMenuPosition.value = {
    top: rect.bottom + 6,
    left: rect.left,
    width: Math.max(rect.width, 128)
  }
}

const toggleStatusMenu = async () => {
  statusMenuOpen.value = !statusMenuOpen.value
  if (statusMenuOpen.value) {
    await nextTick()
    updateStatusMenuPosition()
  }
}

const handleStatusChange = (value: any) => {
  statusMenuOpen.value = false
  if (!value || value === props.workOrder?.status) return
  emit('status-change', value)
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node
  if (statusTriggerRef.value?.contains(target) || statusMenuRef.value?.contains(target)) return
  statusMenuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('resize', updateStatusMenuPosition)
  window.addEventListener('scroll', updateStatusMenuPosition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('resize', updateStatusMenuPosition)
  window.removeEventListener('scroll', updateStatusMenuPosition, true)
})
</script>
