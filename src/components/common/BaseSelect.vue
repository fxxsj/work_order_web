<template>
  <el-select
    :value="value"
    :placeholder="placeholder"
    :filterable="filterable"
    :remote="remote"
    :remote-method="handleRemoteSearch"
    :loading="loading"
    :disabled="disabled"
    :clearable="clearable"
    :multiple="multiple"
    :collapse-tags="collapseTags"
    :style="selectStyle"
    :reserve-keyword="reserveKeyword"
    :default-first-option="defaultFirstOption"
    :filter-method="customFilterMethod"
    @input="handleInput"
    @change="handleChange"
    @focus="handleFocus"
  >
    <el-option
      v-for="option in displayOptions"
      :key="getOptionValue(option)"
      :label="getOptionLabel(option)"
      :value="getOptionValue(option)"
      :disabled="option.disabled"
    >
      <slot name="option" :option="option">
        <span>{{ getOptionLabel(option) }}</span>
      </slot>
    </el-option>

    <!-- 无选项时显示 -->
    <template v-if="showEmptyOption" #empty>
      <slot name="empty">
        <span style="color: #909399; font-size: 13px;">暂无数据</span>
      </slot>
    </template>
  </el-select>
</template>

<script>
export default {
  name: 'BaseSelect',
  props: {
    // v-model 绑定值
    value: {
      type: [String, Number, Array, Boolean],
      required: true
    },
    // 选项列表（静态）
    options: {
      type: Array,
      default: () => []
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请选择'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否可搜索
    filterable: {
      type: Boolean,
      default: false
    },
    // 是否远程搜索
    remote: {
      type: Boolean,
      default: false
    },
    // 是否可清空
    clearable: {
      type: Boolean,
      default: true
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 多选时是否折叠标签
    collapseTags: {
      type: Boolean,
      default: false
    },
    // 远程搜索时是否保留搜索关键词
    reserveKeyword: {
      type: Boolean,
      default: true
    },
    // 是否在搜索时高亮第一个匹配项
    defaultFirstOption: {
      type: Boolean,
      default: true
    },
    // 选项标签字段名
    labelKey: {
      type: String,
      default: 'label'
    },
    // 选项值字段名
    valueKey: {
      type: String,
      default: 'value'
    },
    // 宽度样式
    width: {
      type: String,
      default: '100%'
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 显示空选项提示
    showEmptyOption: {
      type: Boolean,
      default: true
    },
    // 自定义过滤方法
    customFilterMethod: {
      type: Function,
      default: null
    },
    // 远程搜索方法（可选，如果不提供则使用默认）
    remoteMethod: {
      type: Function,
      default: null
    },
    // 初始加载方法
    loadMethod: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      searchQuery: '',
      localOptions: []
    }
  },
  computed: {
    // 合并静态选项和动态选项
    displayOptions() {
      if (this.localOptions.length > 0) {
        return this.localOptions
      }
      return this.options
    },
    selectStyle() {
      return {
        width: this.width
      }
    },
    // 是否需要使用远程搜索
    shouldUseRemote() {
      return this.remote && this.remoteMethod
    }
  },
  watch: {
    options: {
      immediate: true,
      handler(val) {
        if (val && val.length > 0) {
          this.localOptions = []
        }
      }
    }
  },
  created() {
    // 如果有加载方法且没有远程搜索，在 created 时加载
    if (this.loadMethod && !this.remote) {
      this.loadOptions()
    }
  },
  methods: {
    // 获取选项标签
    getOptionLabel(option) {
      if (typeof option === 'object') {
        return option[this.labelKey] || option.label || String(option)
      }
      return String(option)
    },
    // 获取选项值
    getOptionValue(option) {
      if (typeof option === 'object') {
        return option[this.valueKey] || option.value
      }
      return option
    },
    // 处理输入
    handleInput(value) {
      this.$emit('input', value)
    },
    // 处理变化
    handleChange(value) {
      this.$emit('change', value)
    },
    // 处理聚焦
    handleFocus() {
      this.$emit('focus')
      // 如果有加载方法且选项为空，加载数据
      if (this.loadMethod && this.localOptions.length === 0 && !this.loading) {
        this.loadOptions()
      }
    },
    // 处理远程搜索
    handleRemoteSearch(query) {
      this.searchQuery = query
      if (this.remoteMethod) {
        this.remoteMethod(query)
      }
    },
    // 加载选项（内部方法）
    async loadOptions() {
      if (!this.loadMethod) return

      try {
        const result = await this.loadMethod()
        this.localOptions = result || []
      } catch (error) {
        console.error('加载选项失败:', error)
      }
    },
    // 设置选项（供父组件调用）
    setOptions(options) {
      this.localOptions = options || []
    },
    // 清空选项
    clearOptions() {
      this.localOptions = []
    }
  }
}
</script>
