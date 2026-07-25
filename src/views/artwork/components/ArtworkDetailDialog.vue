<template>
  <BaseDialog
    :show="isOpen"
    title="图稿详情"
    width="wide"
    @close="handleClose"
  >
    <div
      v-if="artwork"
      class="space-y-6"
    >
      <!-- 基本信息 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          基本信息
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="图稿编码">
            {{ fullCode || '-' }}
          </DescriptionItem>
          <DescriptionItem label="版本号">
            v{{ artwork.version ?? 1 }}
          </DescriptionItem>
          <DescriptionItem label="图稿名称">
            {{ artwork.name || '-' }}
          </DescriptionItem>
          <DescriptionItem label="拼版尺寸">
            {{ artwork.imposition_size || '-' }}
          </DescriptionItem>
          <DescriptionItem label="色数">
            <Tag v-if="artwork.color_display && artwork.color_display !== '-'">
              {{ artwork.color_display }}
            </Tag>
            <span
              v-else
              class="text-gray-400 dark:text-dark-400"
            >-</span>
          </DescriptionItem>
          <DescriptionItem label="确认状态">
            <Tag
              :type="artwork.confirmed ? 'success' : 'info'"
              size="small"
            >
              {{ artwork.confirmed ? '已确认' : '未确认' }}
            </Tag>
          </DescriptionItem>
        </DescriptionGrid>
        <div
          v-if="artwork.confirmed"
          class="mt-2 text-xs text-gray-400"
        >
          <span v-if="artwork.confirmed_by_name">确认人：{{ artwork.confirmed_by_name }}</span>
          <span
            v-if="artwork.confirmed_at"
            class="ml-3"
          >确认时间：{{ formatDateTime(artwork.confirmed_at) }}</span>
        </div>
      </section>

      <!-- 关联刀模 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          关联刀模
        </h3>
        <div
          v-if="hasCodes(artwork.die_codes)"
          class="flex flex-wrap gap-2"
        >
          <Tag
            v-for="(code, index) in artwork.die_codes"
            :key="`die-${index}`"
            size="small"
          >
            {{ code }}<span v-if="artwork.die_names && artwork.die_names[index]"> - {{ artwork.die_names[index] }}</span>
          </Tag>
        </div>
        <p
          v-else
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          暂无关联刀模
        </p>
      </section>

      <!-- 关联烫金版 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          关联烫金版
        </h3>
        <div
          v-if="hasCodes(artwork.foiling_plate_codes)"
          class="flex flex-wrap gap-2"
        >
          <Tag
            v-for="(code, index) in artwork.foiling_plate_codes"
            :key="`foil-${index}`"
            type="success"
            size="small"
          >
            {{ code }}<span v-if="artwork.foiling_plate_names && artwork.foiling_plate_names[index]"> - {{ artwork.foiling_plate_names[index] }}</span>
          </Tag>
        </div>
        <p
          v-else
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          暂无关联烫金版
        </p>
      </section>

      <!-- 关联压凸版 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          关联压凸版
        </h3>
        <div
          v-if="hasCodes(artwork.embossing_plate_codes)"
          class="flex flex-wrap gap-2"
        >
          <Tag
            v-for="(code, index) in artwork.embossing_plate_codes"
            :key="`emboss-${index}`"
            type="warning"
            size="small"
          >
            {{ code }}<span v-if="artwork.embossing_plate_names && artwork.embossing_plate_names[index]"> - {{ artwork.embossing_plate_names[index] }}</span>
          </Tag>
        </div>
        <p
          v-else
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          暂无关联压凸版
        </p>
      </section>

      <!-- 包含产品 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          包含产品
        </h3>
        <div
          v-if="artwork.products && artwork.products.length > 0"
          class="flex flex-wrap gap-2"
        >
          <Tag
            v-for="product in artwork.products"
            :key="product.id"
            size="small"
          >
            {{ product.product_name || `产品 #${product.product}` }}<span v-if="product.product_code"> ({{ product.product_code }})</span> - {{ product.imposition_quantity }}拼
          </Tag>
        </div>
        <p
          v-else
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          暂无包含产品
        </p>
      </section>

      <!-- 图稿图片 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          图稿图片
        </h3>
        <div
          v-if="images.length > 0"
          class="flex flex-wrap gap-3"
        >
          <img
            v-for="img in images"
            :key="img.id"
            :src="resolveMediaUrl(img.image as string)"
            class="w-24 h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition"
            @click="previewImage(img.image as string)"
          >
        </div>
        <p
          v-else
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          暂无图稿图片
        </p>
      </section>

      <!-- 备注 -->
      <section v-if="artwork.notes">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          备注
        </h3>
        <p class="text-sm whitespace-pre-wrap">
          {{ artwork.notes }}
        </p>
      </section>

      <!-- 系统信息 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          系统信息
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="创建时间">
            {{ formatDateTime(artwork.created_at) || '-' }}
          </DescriptionItem>
          <DescriptionItem label="更新时间">
            {{ formatDateTime(artwork.updated_at) || '-' }}
          </DescriptionItem>
        </DescriptionGrid>
      </section>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          class="btn btn-secondary"
          @click="handleClose"
        >
          关闭
        </button>
      </div>
    </template>
  </BaseDialog>

  <ImageViewer
    v-model:visible="previewVisible"
    :src="previewSrc || ''"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BaseDialog, DescriptionGrid, DescriptionItem, Tag } from '@/components/common'
import ImageViewer from '@/components/common/ImageViewer.vue'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { formatDateTime } from '@/utils/date'

const props = defineProps({
  visible: { type: Boolean, default: false },
  artwork: { type: Object as () => Record<string, any> | null, default: null }
})

const emit = defineEmits(['update:visible'])

const isOpen = ref(false)
const previewSrc = ref<string | undefined>(undefined)
const previewVisible = ref(false)
const images = ref<Record<string, any>[]>([])

watch(() => props.visible, (val) => { isOpen.value = val }, { immediate: true })

// 图片可能由父组件通过 artwork.images 提供（getDetail 返回），统一规范化
watch(() => props.artwork, (val) => {
  if (!val?.images) {
    images.value = []
    return
  }
  images.value = Array.isArray(val.images) ? val.images : []
}, { immediate: true, deep: true })

const fullCode = computed(() => {
  const a = props.artwork
  if (!a) return ''
  return a.code || (a.base_code + (a.version > 1 ? '-v' + a.version : ''))
})

const hasCodes = (codes: any) => Array.isArray(codes) && codes.length > 0

const previewImage = (src: string) => {
  previewSrc.value = resolveMediaUrl(src)
  previewVisible.value = true
}

const handleClose = () => {
  previewSrc.value = undefined
  previewVisible.value = false
  emit('update:visible', false)
}
</script>
