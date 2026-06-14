<template>
  <div class="relative w-full">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <Icon
        name="search"
        size="md"
        class="text-gray-400"
      />
    </div>
    <input
      :value="modelValue"
      type="text"
      class="input pl-10"
      :placeholder="placeholder"
      @input="handleInput"
    >
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/icons/Icon.vue'

withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: '搜索...'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
}>()

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  emit('search', value)
}
</script>
