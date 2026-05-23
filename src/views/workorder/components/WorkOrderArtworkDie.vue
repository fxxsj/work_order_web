<template>
  <div class="descriptions-grid mt-6" style="--col: 1">
    <div class="description-item"><div class="description-label">图稿（CTP版）</div><div class="description-value"><span v-if="artworkCodes?.length"><span v-for="(code, i) in artworkCodes" :key="i">{{ code }}<span v-if="(artworkNames as any)?.[i]"> - {{ (artworkNames as any)[i] }}</span><span v-if="Number(i) < artworkCodes.length - 1">、</span></span></span><span v-else class="text-gray-400">-</span></div></div>
    <div v-if="printingType && printingType !== 'none'" class="description-item"><div class="description-label">印刷要求</div><div class="description-value"><span>{{ printingColorsDisplay || artworkColors }} {{ getPrintingTypeDisplay(printingType) }}</span></div></div>
    <div class="description-item"><div class="description-label">刀模</div><div class="description-value"><span v-if="dieCodes?.length"><span v-for="(code, i) in dieCodes" :key="i">{{ code }}<span v-if="(dieNames as any)?.[i]"> - {{ (dieNames as any)[i] }}</span><span v-if="Number(i) < dieCodes.length - 1">、</span></span></span><span v-else class="text-gray-400">-</span></div></div>
  </div>
</template>

<script setup lang="ts">
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