<template>
  <div class="tabs-container">
    <div class="tabs-header flex border-b border-gray-200 dark:border-dark-700">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        type="button"
        class="tab-button px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none"
        :class="[
          activeTab === tab.name
            ? 'text-primary-600 border-b-2 border-primary-600 -mb-px'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        ]"
        @click="selectTab(tab.name)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tabs-content mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array as any, required: true }
})

const emit = defineEmits(['update:modelValue'])

const activeTab = computed(() => props.modelValue)

const selectTab = (tabName: any) => {
  emit('update:modelValue', tabName)
}
</script>
