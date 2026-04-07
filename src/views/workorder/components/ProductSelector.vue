<template>
  <el-select
    :value="value"
    placeholder="请选择产品"
    filterable
    remote
    :remote-method="searchProducts"
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
      v-for="product in productList"
      :key="product.id"
      :label="`${product.name} (${product.code})`"
      :value="product.id"
    >
      <span style="float: left">{{ product.name }}</span>
      <span style="float: right; color: #8492a6; font-size: 13px">
        ¥{{ product.unit_price }}
      </span>
    </el-option>
  </el-select>
</template>

<script>
import { productAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

// 产品列表缓存
let cachedProductList = []
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

export default {
  name: 'ProductSelector',
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
      productList: [],
      searchTimer: null
    }
  },
  async created() {
    // 优先使用缓存
    if (cachedProductList.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION) {
      this.productList = cachedProductList
    } else {
      await this.loadProductList()
    }
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  },
  methods: {
    async loadProductList(search = '') {
      this.loading = true
      try {
        const params = {
          is_active: true,
          page_size: search ? 20 : 100
        }
        if (search) {
          params.search = search
        }
        const response = await productAPI.getList(params)
        const list = response.results || []

        // 如果不是搜索，更新缓存
        if (!search) {
          cachedProductList = list
          cacheTimestamp = Date.now()
        }
        this.productList = list
      } catch (error) {
        ErrorHandler.showMessage(error, '加载产品列表失败')
      } finally {
        this.loading = false
      }
    },

    searchProducts(query) {
      // 远程搜索：防抖处理
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.loadProductList(query)
      }, 300)
    },

    onFocus() {
      // 聚焦时如果缓存有效则使用缓存，否则加载
      if (cachedProductList.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION) {
        this.productList = cachedProductList
      } else if (this.productList.length === 0) {
        this.loadProductList()
      }
    },

    handleClear() {
      // 清空时恢复到缓存数据
      if (cachedProductList.length > 0) {
        this.productList = cachedProductList
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
      cachedProductList = []
      cacheTimestamp = 0
    }
  }
}
</script>
