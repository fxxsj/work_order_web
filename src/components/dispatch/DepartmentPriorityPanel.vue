<template>
  <div class="department-priority-panel">
    <div class="card card-hover panel-card">
      <div class="card-header">
        <div class="header-content">
          <span class="card-title">{{ displayTitle }}</span>
          <button
            v-if="process && allDepartments.length > 0"
            class="btn btn-primary btn-sm"
            @click="handleAddDepartment"
          >
            <Icon
              name="plus"
              class="h-3 w-3"
            />
            添加部门
          </button>
        </div>
      </div>
      <div class="card-body">
        <EmptyState
          v-if="!loading && !process"
          title="请从左侧选择一个工序"
        />

        <EmptyState
          v-else-if="!loading && departmentList.length === 0"
          title="该工序暂未配置部门规则"
        >
          <template #action>
            <button
              v-if="process"
              class="btn btn-primary"
              @click="handleAddDepartment"
            >
              <Icon
                name="plus"
                class="h-4 w-4"
              />
              配置第一个部门
            </button>
          </template>
        </EmptyState>

        <div
          v-else
          class="department-list"
        >
          <div
            v-for="(dept, index) in departmentList"
            :key="dept.id"
            class="department-card"
            draggable="true"
            @dragstart="handleDragStart(index, $event)"
            @dragover.prevent="handleDragOver(index)"
            @drop="handleDrop(index)"
            @dragend="handleDragEnd"
          >
            <div class="department-header">
              <div class="department-info">
                <span class="department-name">{{ dept.name }}</span>
                <Tag
                  :type="dept.is_active ? 'success' : 'info'"
                  size="small"
                >
                  {{ dept.is_active ? '启用' : '禁用' }}
                </Tag>
              </div>
              <div class="department-actions">
                <button
                  class="btn btn-ghost btn-sm"
                  @click="handleToggleActive(dept)"
                >
                  {{ dept.is_active ? '禁用' : '启用' }}
                </button>
                <button
                  class="btn btn-ghost btn-sm"
                  style="color: #f56c6c;"
                  @click="handleDelete(dept)"
                >
                  删除
                </button>
              </div>
            </div>
            <div class="department-body">
              <div class="priority-setting">
                <span class="setting-label">优先级:</span>
                <InputNumber
                  v-model="dept.priority"
                  :min="1"
                  :max="100"
                  @change="handlePriorityChange(dept)"
                />
              </div>
              <div class="capacity-setting">
                <span class="setting-label">产能:</span>
                <InputNumber
                  v-model="dept.capacity"
                  :min="1"
                  @change="handleCapacityChange(dept)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加部门对话框 -->
    <BaseDialog
      :show="dialogVisible"
      title="添加部门"
      width="normal"
      @close="dialogVisible = false"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">部门</label>
          <Select
            v-model="form.department_id"
            :options="availableDepartmentOptions"
            placeholder="请选择部门"
            class="flex-1"
          />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">优先级</label>
          <InputNumber
            v-model="form.priority"
            :min="1"
            :max="100"
            class="flex-1"
          />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">产能</label>
          <InputNumber
            v-model="form.capacity"
            :min="1"
            class="flex-1"
          />
        </div>
      </div>
      <template #footer>
        <button
          class="btn"
          @click="dialogVisible = false"
        >
          取消
        </button>
        <button
          class="btn btn-primary"
          @click="handleConfirmAdd"
        >
          确定
        </button>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon, InputNumber, Select } from '@/components/common'

const props = defineProps({
  process: { type: Object, default: null },
  departmentList: { type: Array as any, default: () => [] },
  allDepartments: { type: Array as any, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['add-department', 'delete-department', 'toggle-active', 'update-priority', 'update-capacity', 'reorder'])

const dialogVisible = ref(false)
const form = ref({ department_id: null, priority: 50, capacity: 100 })
const dragIndex = ref(-1)

const displayTitle = computed(() => props.process ? `${props.process.name} - 部门配置` : '部门配置')
const availableDepartments = computed(() => {
  const usedIds = props.departmentList.map((d: any) => d.id)
  return props.allDepartments.filter((d: any) => !usedIds.includes(d.id))
})
const availableDepartmentOptions = computed(() => availableDepartments.value.map((d: any) => ({ value: d.id, label: d.name })))

const handleAddDepartment = () => {
  form.value = { department_id: null, priority: 50, capacity: 100 }
  dialogVisible.value = true
}

const handleConfirmAdd = () => {
  emit('add-department', { process_id: props.process?.id, ...form.value })
  dialogVisible.value = false
}

const handleDelete = (dept: any) => emit('delete-department', dept.id)

const handleToggleActive = (dept: any) => emit('toggle-active', { id: dept.id, is_active: !dept.is_active })

const handlePriorityChange = (dept: any) => emit('update-priority', { id: dept.id, priority: dept.priority })

const handleCapacityChange = (dept: any) => emit('update-capacity', { id: dept.id, capacity: dept.capacity })

const handleDragStart = (index: any, event: any) => {
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (index: any) => {
  if (dragIndex.value === index) return
}

const handleDrop = (index: any) => {
  if (dragIndex.value === -1 || dragIndex.value === index) return
  const newList = [...props.departmentList]
  const item = newList.splice(dragIndex.value, 1)[0]
  newList.splice(index, 0, item)
  emit('reorder', newList)
  dragIndex.value = -1
}

const handleDragEnd = () => { dragIndex.value = -1 }
</script>

<style>
.department-priority-panel { padding: 20px; }
.panel-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.card-title { font-weight: 500; font-size: 16px; }
.department-list { display: flex; flex-direction: column; gap: 10px; }
.department-card { border: 1px solid #e4e7ed; border-radius: 8px; padding: 15px; background-color: #fff; cursor: move; transition: all 0.3s; }
.department-card:hover { box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); }
.department-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.department-info { display: flex; align-items: center; gap: 10px; }
.department-name { font-weight: 500; }
.department-actions { display: flex; gap: 10px; }
.department-body { display: flex; gap: 20px; }
.priority-setting, .capacity-setting { display: flex; align-items: center; gap: 10px; }
.setting-label { color: #606266; font-size: 14px; }
</style>
