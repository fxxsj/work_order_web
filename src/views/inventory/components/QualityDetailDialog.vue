<template>
  <BaseDialog
    :show="visible"
    title="质检详情"
    width="wide"
    @close="visible = false"
  >
    <DescriptionGrid
      v-if="data"
      :columns="2"
    >
      <DescriptionItem label="产品名称">
        {{ data.product_name }}
      </DescriptionItem>
      <DescriptionItem label="检验结果">
        <StatusTag
          :status="data.status"
          category="inspection"
          :label="data.status_display"
        />
      </DescriptionItem>
      <DescriptionItem label="合格数量">
        {{ data.passed_quantity || 0 }}
      </DescriptionItem>
      <DescriptionItem label="不合格数量">
        {{ data.failed_quantity || 0 }}
      </DescriptionItem>
    </DescriptionGrid>
    <template #footer>
      <button
        class="btn"
        @click="visible = false"
      >
        关闭
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StatusTag, DescriptionGrid, DescriptionItem } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['update:visible'])
const visible = computed({ get: () => props.visible, set: (v: any) => emit('update:visible', v) })
</script>
