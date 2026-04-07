<template>
  <el-form-item label="客户" prop="customer" required>
    <el-select
      :value="value"
      placeholder="请选择客户"
      filterable
      remote
      :remote-method="searchCustomers"
      :loading="loading"
      :disabled="disabled"
      style="width: 100%;"
      reserve-keyword
      :clearable="clearable"
      @input="handleInput"
      @focus="onFocus"
      @clear="handleClear"
    >
      <el-option
        v-for="customer in customerList"
        :key="customer.id"
        :label="customer.name"
        :value="customer.id"
      >
        <span style="float: left">{{ customer.name }}</span>
        <span v-if="customer.contact_person" style="float: right; color: #8492a6; font-size: 13px">
          {{ customer.contact_person }}
        </span>
      </el-option>
    </el-select>
  </el-form-item>
</template>

<script>
import { customerAPI } from '@/api/modules/customer'
import ErrorHandler from '@/utils/errorHandler'
import unwrapApiResponse from '@/utils/apiResponse'

// 客户列表缓存
let cachedCustomerList = []
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

export default {
  name: 'CustomerSelector',
  props: {
    value: {
      type: Number,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      customerList: []
    }
  },
  async created() {
    // 优先使用缓存
    if (cachedCustomerList.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION) {
      this.customerList = cachedCustomerList
    } else {
      await this.loadCustomerList()
    }
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  },
  methods: {
    async loadCustomerList(search = '') {
      this.loading = true
      try {
        const params = {
          page_size: search ? 20 : 50 // 搜索时减少数量
        }
        if (search) {
          params.search = search
        }
        const response = await customerAPI.getList(params)
        const payload = unwrapApiResponse(response)
        const list = payload?.results || payload?.items || []

        // 如果不是搜索，更新缓存
        if (!search) {
          cachedCustomerList = list
          cacheTimestamp = Date.now()
        }
        this.customerList = list
      } catch (error) {
        ErrorHandler.showMessage(error, '加载客户列表失败')
      } finally {
        this.loading = false
      }
    },

    searchCustomers(query) {
      // 远程搜索：防抖处理
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.loadCustomerList(query)
      }, 300)
    },

    onFocus() {
      // 聚焦时如果缓存有效则使用缓存，否则加载
      if (cachedCustomerList.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION) {
        this.customerList = cachedCustomerList
      } else if (this.customerList.length === 0) {
        this.loadCustomerList()
      }
    },

    handleClear() {
      // 清空时恢复到缓存数据
      if (cachedCustomerList.length > 0) {
        this.customerList = cachedCustomerList
      }
      this.$emit('input', null)
      this.$emit('change', null)
      this.$emit('clear')
    },

    handleInput(value) {
      this.$emit('input', value)
      this.$emit('change', value)
    },

    // 清除缓存（供父组件调用）
    clearCache() {
      cachedCustomerList = []
      cacheTimestamp = 0
    }
  }
}
</script>
