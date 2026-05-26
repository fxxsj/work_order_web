<template>
  <section class="card p-6">
    <div class="mb-4 text-lg font-bold">
      备注
    </div>
    <DescriptionGrid :columns="1">
      <DescriptionItem label="备注">
        {{ notes || '-' }}
      </DescriptionItem>
    </DescriptionGrid>
  </section>
</template>

<script setup lang="ts">
import { DescriptionGrid, DescriptionItem } from '@/components/common'

defineProps({ notes: { type: String, default: '' } })
</script>
