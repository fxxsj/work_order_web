/**
 * 任务 Store
 * 管理任务视图模式、选中状态、筛选条件
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ViewMode = 'list' | 'board' | 'calendar'

export interface TaskFilter {
  status?: string
  assignee?: number
  department?: number
  priority?: string
  search?: string
}

export const useTaskStore = defineStore('task', () => {
  // ==================== State ====================

  const viewMode = ref<ViewMode>('list')
  const selectedTasks = ref<number[]>([])
  const taskFilters = ref<TaskFilter>({})

  // ==================== Actions ====================

  function setViewMode(mode: ViewMode): void {
    viewMode.value = mode
  }

  function selectTask(taskId: number): void {
    if (!selectedTasks.value.includes(taskId)) {
      selectedTasks.value.push(taskId)
    }
  }

  function deselectTask(taskId: number): void {
    const index = selectedTasks.value.indexOf(taskId)
    if (index > -1) {
      selectedTasks.value.splice(index, 1)
    }
  }

  function clearSelection(): void {
    selectedTasks.value = []
  }

  function setTaskFilters(filters: TaskFilter): void {
    taskFilters.value = { ...taskFilters.value, ...filters }
  }

  function clearFilters(): void {
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
    clearFilters
  }
}, {
  persist: {
    key: 'task',
    storage: sessionStorage,
    paths: ['viewMode']
  }
})
