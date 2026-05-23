<template>
  <div v-show="active">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  name: { type: String, required: true }
})

const activeTab = inject('activeTab')

const active = computed(() => activeTab === props.name)
</script>
