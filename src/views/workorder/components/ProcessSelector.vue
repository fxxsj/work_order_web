<template>
  <el-form-item label="工序" prop="processes">
    <el-select
      :value="value"
      placeholder="请选择工序"
      multiple
      filterable
      :loading="loading"
      :disabled="disabled"
      style="width: 100%;"
      :clearable="clearable"
      @input="handleInput"
    >
      <el-option
        v-for="process in processList"
        :key="process.id"
        :label="process.name"
        :value="process.id"
      >
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>{{ process.name }}</span>
          <el-tag
            v-if="process.code"
            size="mini"
            type="info"
            style="margin-left: 10px;"
          >
            {{ process.code }}
          </el-tag>
        </div>
      </el-option>
    </el-select>
    <div v-if="showHint" style="color: #909399; font-size: 12px; margin-top: 5px;">
      已选择 {{ selectedCount }} 个工序
    </div>
  </el-form-item>
</template>

<script>
import { processAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

// 工序列表缓存
let cachedProcessList = []
let cacheTimestamp = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10分钟缓存（工序变更较少）

export default {
  name: 'ProcessSelector',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showHint: {
      type: Boolean,
      default: true
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      processList: []
    }
  },
  computed: {
    selectedCount() {
      return Array.isArray(this.value) ? this.value.length : 0
    }
  },
  async created() {
    // 优先使用缓存
    if (cachedProcessList.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION) {
      this.processList = cachedProcessList
    } else {
      await this.loadProcessList()
    }
  },
  methods: {
    async loadProcessList() {
      this.loading = true
      try {
        // 一次性获取所有活跃工序
        const response = await processAPI.getList({
          is_active: true,
          page_size: 1000,
          ordering: 'sort_order,code'
        })
        const list = response.results || []

        // 更新缓存
        cachedProcessList = list
        cacheTimestamp = Date.now()
        this.processList = list
      } catch (error) {
        ErrorHandler.showMessage(error, '加载工序列表失败')
      } finally {
        this.loading = false
      }
    },
    handleInput(value) {
      this.$emit('input', value)
      this.$emit('change', value)
    },
    // 清除缓存（供父组件调用）
    clearCache() {
      cachedProcessList = []
      cacheTimestamp = 0
    }
  }
}
</script>
