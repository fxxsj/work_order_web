<template>
  <div class="space-y-3">
    <div
      v-if="normalizedImages.length > 0"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
    >
      <div
        v-for="(image, index) in normalizedImages"
        :key="image.id || image.src || index"
        class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-800"
      >
        <button
          type="button"
          class="block h-full w-full"
          :title="`预览${image.description || '图片'}`"
          @click="openPreview(index)"
        >
          <img
            v-if="image.src"
            :src="image.src"
            :alt="image.description || image.name"
            class="h-full w-full object-cover transition duration-150 group-hover:scale-[1.03]"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-gray-400"
          >
            <Icon
              name="image"
              size="lg"
            />
          </div>
        </button>

        <div
          v-if="image.description"
          class="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-1 text-xs text-white"
        >
          {{ image.description }}
        </div>

        <button
          v-if="!readonly"
          type="button"
          class="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-sm transition hover:bg-red-700 focus:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="deletingId === image.id"
          title="删除图片"
          @click.stop="handleDelete(image)"
        >
          <LoadingSpinner
            v-if="deletingId === image.id"
            size="sm"
            color="white"
          />
          <Icon
            v-else
            name="x"
            size="sm"
          />
        </button>
      </div>
    </div>

    <div
      v-else
      class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-dark-600 dark:bg-dark-800 dark:text-dark-400"
    >
      <Icon
        name="image"
        class="mx-auto mb-2 text-gray-400"
        size="lg"
      />
      {{ emptyText }}
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        :disabled="uploadDisabled"
        :title="uploadDisabledReason"
        @click="triggerFilePicker"
      >
        <LoadingSpinner
          v-if="uploading"
          size="sm"
          class="mr-1 inline-block"
        />
        <Icon
          v-else
          name="upload"
          class="mr-1 inline h-3 w-3"
        />
        {{ uploading ? '上传中' : uploadButtonText }}
      </button>
      <span class="text-xs text-gray-500 dark:text-dark-400">
        {{ helperText }}
      </span>
    </div>

    <p
      v-if="uploadDisabledReason"
      class="text-xs text-gray-500 dark:text-dark-400"
    >
      {{ uploadDisabledReason }}
    </p>

    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="accept"
      @change="handleFileSelected"
    >

    <ImageViewer
      v-model:visible="previewVisible"
      :images="previewImages"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useUIStore } from '@/stores/ui'
import { requireImageUploadResponseData } from '@/utils/imageUploadResponse'
import { imageNameFromUrl, resolveMediaUrl } from '@/utils/mediaUrl'
import Icon from '@/components/icons/Icon.vue'
import ImageViewer from './ImageViewer.vue'
import LoadingSpinner from './LoadingSpinner.vue'

interface ImageApi {
  uploadImage: (id: number | string, formData: FormData) => Promise<unknown>
  deleteImage: (id: number | string, imageId: number | string) => Promise<unknown>
}

interface NormalizedImage {
  id?: number | string
  src: string
  description: string
  name: string
  raw: Record<string, unknown>
  pendingIndex?: number
}

const props = withDefaults(defineProps<{
  images?: Record<string, unknown>[]
  resourceId?: number | string | null
  api: ImageApi
  readonly?: boolean
  disabledReason?: string
  emptyText?: string
  uploadButtonText?: string
  maxCount?: number
  maxSizeBytes?: number
  allowedExtensions?: string[]
  allowPending?: boolean
  pendingResetKey?: number | string
}>(), {
  images: () => [],
  resourceId: null,
  readonly: false,
  disabledReason: '',
  emptyText: '暂无图片',
  uploadButtonText: '上传图片',
  maxCount: 12,
  maxSizeBytes: 10 * 1024 * 1024,
  allowedExtensions: () => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  allowPending: false,
  pendingResetKey: 0
})

const emit = defineEmits<{
  (e: 'changed'): void
  (e: 'pending-change', files: File[]): void
}>()

const uiStore = useUIStore()
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const deletingId = ref<number | string | null>(null)
const previewVisible = ref(false)
const previewStartIndex = ref(0)
const pendingFiles = ref<File[]>([])
const pendingUrls = ref<string[]>([])

const releasePendingUrls = () => {
  for (const url of pendingUrls.value) {
    URL.revokeObjectURL(url)
  }
  pendingUrls.value = []
}

const normalizedImages = computed<NormalizedImage[]>(() => {
  const savedImages = (props.images || []).map((image) => {
    const rawSrc = String(image.image || image.src || image.url || '')
    const description = String(image.description || '').trim()
    return {
      id: image.id as number | string | undefined,
      src: resolveMediaUrl(rawSrc),
      description,
      name: imageNameFromUrl(rawSrc),
      raw: image
    }
  })
  const localImages = pendingFiles.value.map((file, index) => ({
    id: `pending-${index}`,
    src: pendingUrls.value[index] || '',
    description: '待上传',
    name: file.name,
    raw: { file },
    pendingIndex: index
  }))
  return savedImages.concat(localImages)
})

const accept = computed(() => {
  return props.allowedExtensions
    .map((ext) => `.${ext.replace(/^\./, '').toLowerCase()}`)
    .join(',')
})

const maxSizeMb = computed(() => Math.max(1, Math.ceil(props.maxSizeBytes / (1024 * 1024))))

const helperText = computed(() => {
  return `支持 ${props.allowedExtensions.map((item) => item.toUpperCase()).join('、')}，单张不超过 ${maxSizeMb.value}MB，最多 ${props.maxCount} 张`
})

const uploadDisabledReason = computed(() => {
  if (props.readonly) return props.disabledReason || '当前状态不允许修改图片'
  if (!props.resourceId && !props.allowPending) return props.disabledReason || '请先保存后再上传图片'
  if (normalizedImages.value.length >= props.maxCount) return `最多上传 ${props.maxCount} 张图片`
  return ''
})

const uploadDisabled = computed(() => Boolean(uploadDisabledReason.value) || uploading.value)

const previewImages = computed(() => {
  const images = normalizedImages.value.map((image) => ({
    src: image.src,
    title: image.description || image.name
  }))
  if (previewStartIndex.value <= 0) return images
  return images.slice(previewStartIndex.value).concat(images.slice(0, previewStartIndex.value))
})

const triggerFilePicker = () => {
  if (uploadDisabled.value) {
    if (uploadDisabledReason.value) uiStore.showWarning(uploadDisabledReason.value)
    return
  }
  fileInput.value?.click()
}

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    await uploadFile(file)
  } finally {
    target.value = ''
  }
}

const uploadFile = async (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (!props.allowedExtensions.includes(extension)) {
    uiStore.showWarning(`仅支持 ${props.allowedExtensions.map((item) => item.toUpperCase()).join('、')} 图片`)
    return
  }

  if (file.size > props.maxSizeBytes) {
    uiStore.showWarning(`图片不能超过 ${maxSizeMb.value}MB`)
    return
  }

  if (normalizedImages.value.length >= props.maxCount) {
    uiStore.showWarning(`最多上传 ${props.maxCount} 张图片`)
    return
  }

  if (!props.resourceId) {
    if (!props.allowPending) {
      uiStore.showWarning('请先保存后再上传图片')
      return
    }
    pendingFiles.value = pendingFiles.value.concat(file)
    pendingUrls.value = pendingUrls.value.concat(URL.createObjectURL(file))
    emit('pending-change', [...pendingFiles.value])
    return
  }

  const formData = new FormData()
  formData.append('image', file)
  formData.append('sort_order', String(normalizedImages.value.length))

  uploading.value = true
  try {
    const response = await props.api.uploadImage(props.resourceId, formData)
    requireImageUploadResponseData(response)
    uiStore.showSuccess('图片上传成功')
    emit('changed')
  } catch (_) {
    uiStore.showError('图片上传失败')
  } finally {
    uploading.value = false
  }
}

const handleDelete = async (image: NormalizedImage) => {
  if (image.pendingIndex !== undefined) {
    const nextFiles = [...pendingFiles.value]
    const nextUrls = [...pendingUrls.value]
    const [removedUrl] = nextUrls.splice(image.pendingIndex, 1)
    if (removedUrl) URL.revokeObjectURL(removedUrl)
    nextFiles.splice(image.pendingIndex, 1)
    pendingFiles.value = nextFiles
    pendingUrls.value = nextUrls
    emit('pending-change', [...pendingFiles.value])
    return
  }
  if (!props.resourceId || image.id === undefined || image.id === null) return
  const confirmed = await uiStore.confirm({
    title: '删除图片',
    message: '确定要删除这张图片吗？',
    confirmText: '删除',
    cancelText: '取消',
    danger: true
  })
  if (!confirmed) return

  deletingId.value = image.id
  try {
    await props.api.deleteImage(props.resourceId, image.id)
    uiStore.showSuccess('图片已删除')
    emit('changed')
  } catch (_) {
    uiStore.showError('删除图片失败')
  } finally {
    deletingId.value = null
  }
}

const openPreview = (index: number) => {
  previewStartIndex.value = index
  previewVisible.value = true
}

defineExpose({
  clearPending() {
    pendingFiles.value = []
    releasePendingUrls()
    emit('pending-change', [])
  }
})

watch(() => props.pendingResetKey, () => {
  pendingFiles.value = []
  releasePendingUrls()
  emit('pending-change', [])
})

onBeforeUnmount(releasePendingUrls)
</script>
