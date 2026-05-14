<template>
  <div class="search-bar">
    <el-input
      v-model="searchText"
      :placeholder="placeholder"
      :clearable="clearable"
      @clear="handleClear"
      @input="handleInput"
    >
      <template #append>
        <el-button :icon="Search" @click="handleSearch" />
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  placeholder: { type: String, default: '请输入搜索内容' },
  clearable: { type: Boolean, default: true },
  debounceDelay: { type: Number, default: 300 }
})

const emit = defineEmits(['search'])

const searchText = ref('')
let debounceTimer = null

const handleInput = () => {
  if (props.debounceDelay > 0) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      emit('search', searchText.value)
    }, props.debounceDelay)
  } else {
    emit('search', searchText.value)
  }
}

const handleSearch = () => emit('search', searchText.value)
const handleClear = () => {
  searchText.value = ''
  emit('search', '')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.search-bar {
  display: inline-block;
  width: min(100%, 320px);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .search-bar {
    display: block;
    width: 100%;
  }
}
</style>
