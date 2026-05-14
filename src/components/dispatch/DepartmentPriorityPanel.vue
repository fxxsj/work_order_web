<template>
  <div class="department-priority-panel">
    <el-card class="panel-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-content">
            <span class="card-title">{{ displayTitle }}</span>
            <el-button
              v-if="process && allDepartments.length > 0"
              type="primary"
              size="small"
              :icon="Plus"
              @click="handleAddDepartment"
            >
              添加部门
            </el-button>
          </div>
        </div>
      </template>

      <el-empty
        v-if="!loading && !process"
        description="请从左侧选择一个工序"
        :image-size="120"
      />

      <el-empty
        v-else-if="!loading && departmentList.length === 0"
        description="该工序暂未配置部门规则"
        :image-size="120"
      >
        <el-button
          v-if="process"
          type="primary"
          :icon="Plus"
          @click="handleAddDepartment"
        >
          配置第一个部门
        </el-button>
      </el-empty>

      <div v-else class="department-list">
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
              <el-tag
                :type="dept.is_active ? 'success' : 'info'"
                size="small"
              >
                {{ dept.is_active ? '启用' : '禁用' }}
              </el-tag>
            </div>
            <div class="department-actions">
              <el-button
                type="text"
                size="small"
                @click="handleToggleActive(dept)"
              >
                {{ dept.is_active ? '禁用' : '启用' }}
              </el-button>
              <el-button
                type="text"
                size="small"
                style="color: #f56c6c;"
                @click="handleDelete(dept)"
              >
                删除
              </el-button>
            </div>
          </div>
          <div class="department-body">
            <div class="priority-setting">
              <span class="setting-label">优先级:</span>
              <el-input-number
                v-model="dept.priority"
                :min="1"
                :max="100"
                size="small"
                @change="handlePriorityChange(dept)"
              />
            </div>
            <div class="capacity-setting">
              <span class="setting-label">产能:</span>
              <el-input-number
                v-model="dept.capacity"
                :min="1"
                size="small"
                @change="handleCapacityChange(dept)"
              />
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加部门对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加部门"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="部门">
          <el-select
            v-model="form.department_id"
            placeholder="请选择部门"
            style="width: 100%;"
          >
            <el-option
              v-for="dept in availableDepartments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number
            v-model="form.priority"
            :min="1"
            :max="100"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="产能">
          <el-input-number
            v-model="form.capacity"
            :min="1"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  process: {
    type: Object,
    default: null
  },
  departmentList: {
    type: Array,
    default: () => []
  },
  allDepartments: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'add-department',
  'delete-department',
  'toggle-active',
  'update-priority',
  'update-capacity',
  'reorder'
])

const dialogVisible = ref(false)
const form = ref({
  department_id: null,
  priority: 50,
  capacity: 100
})
const dragIndex = ref(-1)

const displayTitle = computed(() => {
  return props.process ? `${props.process.name} - 部门配置` : '部门配置'
})

const availableDepartments = computed(() => {
  const usedIds = props.departmentList.map(d => d.id)
  return props.allDepartments.filter(d => !usedIds.includes(d.id))
})

const handleAddDepartment = () => {
  form.value = {
    department_id: null,
    priority: 50,
    capacity: 100
  }
  dialogVisible.value = true
}

const handleConfirmAdd = () => {
  emit('add-department', {
    process_id: props.process?.id,
    ...form.value
  })
  dialogVisible.value = false
}

const handleDelete = (dept) => {
  emit('delete-department', dept.id)
}

const handleToggleActive = (dept) => {
  emit('toggle-active', {
    id: dept.id,
    is_active: !dept.is_active
  })
}

const handlePriorityChange = (dept) => {
  emit('update-priority', {
    id: dept.id,
    priority: dept.priority
  })
}

const handleCapacityChange = (dept) => {
  emit('update-capacity', {
    id: dept.id,
    capacity: dept.capacity
  })
}

const handleDragStart = (index, event) => {
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (index) => {
  if (dragIndex.value === index) return
}

const handleDrop = (index) => {
  if (dragIndex.value === -1 || dragIndex.value === index) return
  
  const newList = [...props.departmentList]
  const item = newList.splice(dragIndex.value, 1)[0]
  newList.splice(index, 0, item)
  
  emit('reorder', newList)
  dragIndex.value = -1
}

const handleDragEnd = () => {
  dragIndex.value = -1
}
</script>

<style scoped>
.department-priority-panel {
  padding: 20px;
}

.panel-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-title {
  font-weight: 500;
  font-size: 16px;
}

.department-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.department-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background-color: #fff;
  cursor: move;
  transition: all 0.3s;
}

.department-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.department-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.department-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.department-name {
  font-weight: 500;
}

.department-actions {
  display: flex;
  gap: 10px;
}

.department-body {
  display: flex;
  gap: 20px;
}

.priority-setting,
.capacity-setting {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-label {
  color: #606266;
  font-size: 14px;
}
</style>
