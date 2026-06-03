<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <BaseButton
      variant="secondary"
      icon="arrowLeft"
      @click="emit('back')"
    >
      返回
    </BaseButton>
    <div class="flex flex-wrap items-center gap-3">
      <BaseButton
        variant="secondary"
        icon="printer"
        @click="emit('print')"
      >
        打印
      </BaseButton>
      <BaseButton
        v-if="canEdit"
        variant="primary"
        icon="edit"
        @click="emit('edit')"
      >
        编辑
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseButton } from '@/components/common'

const props = defineProps({
  canEdit: { type: Boolean, default: false }
})
const emit = defineEmits(['back', 'print', 'edit'])
</script>
