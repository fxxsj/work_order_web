<template>
  <DescriptionGrid :columns="1" class="mt-6">
    <DescriptionItem label="图稿（CTP版）">
      <span v-if="artworkCodes?.length">
        <span v-for="(code, i) in artworkCodes" :key="i">
          {{ code }}<span v-if="(artworkNames as any)?.[i]"> - {{ (artworkNames as any)[i] }}</span><span v-if="Number(i) < artworkCodes.length - 1">、</span>
        </span>
      </span>
      <span v-else class="text-gray-400">-</span>
    </DescriptionItem>
    <DescriptionItem v-if="printingType && printingType !== 'none'" label="印刷要求">
      <span>{{ printingColorsDisplay || artworkColors }} {{ getPrintingTypeDisplay(printingType) }}</span>
    </DescriptionItem>
    <DescriptionItem label="刀模">
      <span v-if="dieCodes?.length">
        <span v-for="(code, i) in dieCodes" :key="i">
          {{ code }}<span v-if="(dieNames as any)?.[i]"> - {{ (dieNames as any)[i] }}</span><span v-if="Number(i) < dieCodes.length - 1">、</span>
        </span>
      </span>
      <span v-else class="text-gray-400">-</span>
    </DescriptionItem>
  </DescriptionGrid>
</template>

<script setup lang="ts">
import { DescriptionGrid, DescriptionItem } from '@/components/common'

const props = defineProps({
  artworkCodes: { type: Array as any, default: () => [] },
  artworkNames: { type: Array as any, default: () => [] },
  dieCodes: { type: Array as any, default: () => [] },
  dieNames: { type: Array as any, default: () => [] },
  printingType: { type: String, default: '' },
  printingColorsDisplay: { type: String, default: '' },
  artworkColors: { type: String, default: '' }
})

const getPrintingTypeDisplay = (t: any) => ({ none: '', single: '单面印刷', double: '双面印刷', multi: '多色印刷' } as any)[t] || t
</script>
