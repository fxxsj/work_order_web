<template>
  <el-dialog
    v-model="dialogVisible"
    title="图片预览"
    width="800px"
    :close-on-click-modal="true"
    class="image-viewer-dialog"
  >
    <div class="image-viewer-container">
      <div class="image-viewer-toolbar">
        <el-button-group>
          <el-button :icon="ZoomIn" title="放大" @click="zoomIn" />
          <el-button :icon="ZoomOut" title="缩小" @click="zoomOut" />
          <el-button :icon="RefreshLeft" title="左旋转" @click="rotateLeft" />
          <el-button :icon="RefreshRight" title="右旋转" @click="rotateRight" />
          <el-button :icon="FullScreen" title="全屏" @click="toggleFullscreen" />
        </el-button-group>
        <span class="scale-info">{{ Math.round(scale * 100) }}%</span>
      </div>

      <div class="image-wrapper" @wheel.prevent="handleWheel">
        <img
          ref="imageRef"
          :src="imageSrc"
          :style="imageStyle"
          class="preview-image"
          alt="preview"
          @load="handleLoad"
          @error="handleError"
        />
      </div>

      <div v-if="images && images.length > 1" class="thumbnail-list">
        <div
          v-for="(img, index) in images"
          :key="index"
          class="thumbnail-item"
          :class="{ active: currentIndex === index }"
          @click="handleSelectImage(index)"
        >
          <img :src="img.src || img" :alt="`图片 ${index + 1}`" />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ZoomIn, ZoomOut, RefreshLeft, RefreshRight, FullScreen } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  src: { type: String, default: '' },
  images: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const currentIndex = ref(0)
const scale = ref(1)
const rotation = ref(0)
const imageRef = ref(null)

const imageSrc = computed(() => {
  if (props.images.length > 0) {
    const img = props.images[currentIndex.value]
    return img.src || img
  }
  return props.src
})

const imageStyle = computed(() => ({
  transform: `scale(${scale.value}) rotate(${rotation.value}deg)`,
  transition: 'transform 0.3s'
}))

const zoomIn = () => { scale.value = Math.min(scale.value + 0.2, 3) }
const zoomOut = () => { scale.value = Math.max(scale.value - 0.2, 0.2) }
const rotateLeft = () => { rotation.value -= 90 }
const rotateRight = () => { rotation.value += 90 }
const toggleFullscreen = () => {
  if (imageRef.value) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      imageRef.value.requestFullscreen()
    }
  }
}
const handleWheel = (e) => {
  if (e.deltaY < 0) zoomIn()
  else zoomOut()
}
const handleSelectImage = (index) => {
  currentIndex.value = index
  scale.value = 1
  rotation.value = 0
}
const handleLoad = () => {}
const handleError = () => {}
</script>

<style scoped>
.image-viewer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-viewer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}
.scale-info {
  font-size: 14px;
  color: #909399;
}
.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  overflow: hidden;
}
.preview-image {
  max-width: 100%;
  max-height: 500px;
}
.thumbnail-list {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  overflow-x: auto;
}
.thumbnail-item {
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  cursor: pointer;
}
.thumbnail-item.active {
  border-color: #409EFF;
}
.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
