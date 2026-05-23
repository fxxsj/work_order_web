/**
 * 施工单 Store
 * 管理施工单选中状态、筛选条件
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WorkOrderFilter {
  status?: string
  customer?: number
  salesperson?: number
  search?: string
  date_from?: string
  date_to?: string
}

export const useWorkOrderStore = defineStore('workOrder', () => {
  // ==================== State ====================

  const selectedWorkOrders = ref<number[]>([])
  const workOrderFilters = ref<WorkOrderFilter>({})

  // ==================== Actions ====================

  function selectWorkOrder(workOrderId: number): void {
    if (!selectedWorkOrders.value.includes(workOrderId)) {
      selectedWorkOrders.value.push(workOrderId)
    }
  }

  function deselectWorkOrder(workOrderId: number): void {
    const index = selectedWorkOrders.value.indexOf(workOrderId)
    if (index > -1) {
      selectedWorkOrders.value.splice(index, 1)
    }
  }

  function clearSelection(): void {
    selectedWorkOrders.value = []
  }

  function setWorkOrderFilters(filters: WorkOrderFilter): void {
    workOrderFilters.value = { ...workOrderFilters.value, ...filters }
  }

  function clearFilters(): void {
    workOrderFilters.value = {}
  }

  return {
    selectedWorkOrders,
    workOrderFilters,
    selectWorkOrder,
    deselectWorkOrder,
    clearSelection,
    setWorkOrderFilters,
    clearFilters
  }
})
