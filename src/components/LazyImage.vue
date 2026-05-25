<template>
  <div class="lazy-image-wrapper">
    <img
      v-lazy="imageUrl"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
    >
    <div
      v-if="showPlaceholder"
      class="lazy-placeholder"
      :style="placeholderStyle"
    >
      <slot name="placeholder">
        <Icon
          name="loading"
          class="h-6 w-6 animate-spin text-primary-500"
        />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@/components/common'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  imageClass: { type: [String, Array, Object], default: '' },
  imageStyle: { type: Object, default: () => ({}) },
  width: { type: [String, Number], default: '100%' },
  height: { type: [String, Number], default: 'auto' },
  fit: { type: String, default: 'cover' },
  placeholder: { type: String, default: '' },
  errorPlaceholder: { type: String, default: '' }
})

const emit = defineEmits(['load', 'error'])

const imageUrl = computed(() => props.src)
const showPlaceholder = ref(true)

const placeholderStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

const handleLoad = () => {
  showPlaceholder.value = false
  emit('load')
}

const handleError = () => {
  showPlaceholder.value = false
  emit('error')
}
</script>

<style>
.lazy-image-wrapper {
  position: relative;
  display: inline-block;
}
.lazy-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: v-bind(fit);
}
.lazy-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}
</style>
