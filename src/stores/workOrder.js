import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWorkOrderStore = defineStore('workOrder', () => {
  // State
  const selectedWorkOrders = ref([])
  const workOrderFilters = ref({})

  // Actions
  function selectWorkOrder(workOrderId) {
    if (!selectedWorkOrders.value.includes(workOrderId)) {
      selectedWorkOrders.value.push(workOrderId)
    }
  }

  function deselectWorkOrder(workOrderId) {
    const index = selectedWorkOrders.value.indexOf(workOrderId)
    if (index > -1) {
      selectedWorkOrders.value.splice(index, 1)
    }
  }

  function clearSelection() {
    selectedWorkOrders.value = []
  }

  function setWorkOrderFilters(filters) {
    workOrderFilters.value = { ...workOrderFilters.value, ...filters }
  }

  function clearFilters() {
    workOrderFilters.value = {}
  }

  return {
    selectedWorkOrders,
    workOrderFilters,
    selectWorkOrder,
    deselectWorkOrder,
    clearSelection,
    setWorkOrderFilters,
    clearFilters,
  }
})
