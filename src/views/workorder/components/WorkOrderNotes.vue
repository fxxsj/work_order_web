<template>
  <DescriptionGrid :columns="1" class="mt-6">
    <DescriptionItem label="备注">{{ notes || '-' }}</DescriptionItem>
  </DescriptionGrid>
</template>

<script setup lang="ts">
import { DescriptionGrid, DescriptionItem } from '@/components/common'

defineProps({ notes: { type: String, default: '' } })
</script>
