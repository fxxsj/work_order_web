import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTaskStore = defineStore('task', () => {
  // State
  const viewMode = ref('list') // 'list' | 'board' | 'calendar'
  const selectedTasks = ref([])
  const taskFilters = ref({})

  // Actions
  function setViewMode(mode) {
    viewMode.value = mode
  }

  function selectTask(taskId) {
    if (!selectedTasks.value.includes(taskId)) {
      selectedTasks.value.push(taskId)
    }
  }

  function deselectTask(taskId) {
    const index = selectedTasks.value.indexOf(taskId)
    if (index > -1) {
      selectedTasks.value.splice(index, 1)
    }
  }

  function clearSelection() {
    selectedTasks.value = []
  }

  function setTaskFilters(filters) {
    taskFilters.value = { ...taskFilters.value, ...filters }
  }

  function clearFilters() {
    taskFilters.value = {}
  }

  return {
    viewMode,
    selectedTasks,
    taskFilters,
    setViewMode,
    selectTask,
    deselectTask,
    clearSelection,
    setTaskFilters,
    clearFilters,
  }
}, {
  persist: {
    key: 'task',
    storage: sessionStorage,
    paths: ['viewMode'],
  },
})
