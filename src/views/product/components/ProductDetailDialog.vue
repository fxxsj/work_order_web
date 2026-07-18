<template>
  <BaseDialog
    :show="isOpen"
    title="产品详情"
    width="wide"
    @close="handleClose"
  >
    <div
      v-if="product"
      class="space-y-6"
    >
      <!-- 基本信息 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          基本信息
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="产品编码">
            {{ product.code }}
          </DescriptionItem>
          <DescriptionItem label="产品名称">
            {{ product.name }}
          </DescriptionItem>
          <DescriptionItem label="产品类型">
            <Tag
              :type="product.product_type === 'single' ? '' : (product.product_type === 'group_main' ? 'warning' : 'info')"
              size="small"
            >
              {{ product.product_type_display || getTypeLabel(product.product_type) }}
            </Tag>
          </DescriptionItem>
          <DescriptionItem label="所属产品组">
            <template v-if="product.product_group_name">
              {{ product.product_group_name }}
              <span
                v-if="product.product_group_code"
                class="text-gray-400"
              >({{ product.product_group_code }})</span>
            </template>
            <template v-else>
              -
            </template>
          </DescriptionItem>
          <DescriptionItem label="规格">
            {{ product.specification || '-' }}
          </DescriptionItem>
          <DescriptionItem label="状态">
            <Tag
              :type="product.is_active ? 'success' : 'info'"
              size="small"
            >
              {{ product.is_active ? '启用' : '停用' }}
            </Tag>
          </DescriptionItem>
        </DescriptionGrid>
      </section>

      <!-- 库存与价格 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          库存与价格
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="单位">
            {{ product.unit || '-' }}
          </DescriptionItem>
          <DescriptionItem label="单价">
            ¥{{ product.unit_price ?? '-' }}
          </DescriptionItem>
          <DescriptionItem label="库存数量">
            <span :class="isLowStock ? 'font-bold text-danger-600 dark:text-danger-400' : ''">
              {{ product.stock_quantity ?? '-' }}
            </span>
          </DescriptionItem>
          <DescriptionItem label="最小库存">
            {{ product.min_stock_quantity ?? '-' }}
          </DescriptionItem>
        </DescriptionGrid>
      </section>

      <!-- 套装信息 -->
      <section v-if="product.product_type === 'group_main' && (product.available_group_stock != null || (product.group_items && product.group_items.length > 0))">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          套装信息
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem
            v-if="product.available_group_stock != null"
            label="可用库存"
          >
            {{ product.available_group_stock }}
          </DescriptionItem>
        </DescriptionGrid>
        <div
          v-if="product.group_items && product.group_items.length > 0"
          class="mt-3"
        >
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="text-left py-2 pr-4">
                  编码
                </th>
                <th class="text-left py-2 pr-4">
                  名称
                </th>
                <th class="text-right py-2">
                  库存
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in product.group_items"
                :key="item.id"
                class="border-b border-gray-100 dark:border-gray-800"
              >
                <td class="py-2 pr-4">
                  {{ item.code }}
                </td>
                <td class="py-2 pr-4">
                  {{ item.name }}
                </td>
                <td class="text-right py-2">
                  {{ item.stock_quantity }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 默认工序 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          默认工序
        </h3>
        <div
          v-if="product.default_processes && product.default_processes.length > 0"
          class="flex flex-wrap gap-2"
        >
          <Tag
            v-for="id in product.default_processes"
            :key="id"
            size="small"
          >
            {{ getProcessName(id) }}
          </Tag>
        </div>
        <p
          v-else
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          暂无默认工序
        </p>
      </section>

      <!-- 默认物料 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          默认物料
        </h3>
        <div
          v-if="product.default_materials && product.default_materials.length > 0"
          class="space-y-2"
        >
          <div
            v-for="m in product.default_materials"
            :key="m.id"
            class="flex items-center gap-3 text-sm"
          >
            <span class="font-medium">{{ m.material_name || `物料 #${m.material}` }}</span>
            <span
              v-if="m.material_code"
              class="text-gray-400"
            >({{ m.material_code }})</span>
            <span
              v-if="m.material_size"
              class="text-gray-500"
            >尺寸: {{ m.material_size }}</span>
            <span
              v-if="m.material_usage"
              class="text-gray-500"
            >用量: {{ m.material_usage }}</span>
            <Tag
              v-if="m.calculation_mode_display"
              size="small"
            >
              {{ m.calculation_mode_display }}
            </Tag>
            <Tag
              v-if="m.preparation_mode_display"
              size="small"
              type="warning"
            >
              {{ m.preparation_mode_display }}
            </Tag>
          </div>
        </div>
        <p
          v-else
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          暂无默认物料
        </p>
      </section>

      <!-- 产品图片 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          产品图片
        </h3>
        <div
          v-if="images.length > 0"
          class="flex flex-wrap gap-3"
        >
          <img
            v-for="img in images"
            :key="img.id"
            :src="resolveMediaUrl(img.image)"
            class="w-24 h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition"
            @click="previewImage(img.image)"
          >
        </div>
        <p
          v-else
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          暂无产品图片
        </p>
      </section>

      <!-- 描述 -->
      <section v-if="product.description">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          描述
        </h3>
        <p class="text-sm whitespace-pre-wrap">
          {{ product.description }}
        </p>
      </section>

      <!-- 系统信息 -->
      <section>
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          系统信息
        </h3>
        <DescriptionGrid :columns="2">
          <DescriptionItem label="创建时间">
            {{ formatDateTime(product.created_at) || '-' }}
          </DescriptionItem>
          <DescriptionItem label="更新时间">
            {{ formatDateTime(product.updated_at) || '-' }}
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
  product: { type: Object, default: null },
  processes: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['update:visible'])

const isOpen = ref(false)
const previewSrc = ref<string | undefined>(undefined)
const previewVisible = ref(false)

watch(() => props.visible, (val) => { isOpen.value = val }, { immediate: true })

const images = computed(() => {
  if (!props.product?.images) return []
  return Array.isArray(props.product.images) ? props.product.images : []
})

const isLowStock = computed(() => {
  const p = props.product
  return p && p.stock_quantity != null && p.min_stock_quantity != null && p.stock_quantity < p.min_stock_quantity
})

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = { single: '单品', group_main: '套装主产品', group_item: '套装子产品' }
  return labels[type] || '未知'
}

const getProcessName = (id: number) => {
  const found = props.processes.find((p: any) => p.id === id)
  return found ? found.name : `工序 #${id}`
}

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
