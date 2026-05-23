<template>
  <div class="search-bar">
    <div class="relative flex items-center">
      <input
        v-model="searchText"
        type="text"
        class="input w-full rounded-r-none"
        :placeholder="placeholder"
        @input="handleInput"
        @keydown.enter="handleSearch"
      />
      <button class="btn btn-primary rounded-l-none border-l-0 px-3" @click="handleSearch">
        <Icon name="search" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@/components/common'

const props = defineProps({
  placeholder: { type: String, default: '请输入搜索内容' },
  debounceDelay: { type: Number, default: 300 }
})

const emit = defineEmits(['search'])

const searchText = ref('')
let debounceTimer: any = null

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
</script>

<style>
.search-bar {
  display: inline-block;
  width: min(100%, 320px);
}

@media (max-width: 480px) {
  .search-bar {
    display: block;
    width: 100%;
  }
}
</style>
