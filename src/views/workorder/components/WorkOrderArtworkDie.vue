<template>
  <section class="card p-6">
    <div class="mb-4 text-lg font-bold">
      印前资源
    </div>
    <DescriptionGrid :columns="1">
      <DescriptionItem
        v-for="group in resourceGroups"
        :key="group.label"
        :label="group.label"
      >
        <span v-if="group.text">
          {{ group.text }}
        </span>
        <span
          v-else
          class="text-gray-400"
        >-</span>
      </DescriptionItem>
      <DescriptionItem
        v-if="printingType && printingType !== 'none'"
        label="印刷要求"
      >
        <span>{{ printingRequirement }}</span>
      </DescriptionItem>
    </DescriptionGrid>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DescriptionGrid, DescriptionItem } from '@/components/common'

const props = defineProps({
  artworkCodes: { type: Array as any, default: () => [] },
  artworkNames: { type: Array as any, default: () => [] },
  dieCodes: { type: Array as any, default: () => [] },
  dieNames: { type: Array as any, default: () => [] },
  foilingPlateCodes: { type: Array as any, default: () => [] },
  foilingPlateNames: { type: Array as any, default: () => [] },
  embossingPlateCodes: { type: Array as any, default: () => [] },
  embossingPlateNames: { type: Array as any, default: () => [] },
  printingType: { type: String, default: '' },
  printingTypeDisplay: { type: String, default: '' },
  printingColorsDisplay: { type: String, default: '' },
  artworkColors: { type: String, default: '' }
})

const getPrintingTypeDisplay = (t: any) => ({ none: '', single: '单面印刷', double: '双面印刷', multi: '多色印刷' } as any)[t] || t

const joinResourceItems = (codes: any[], names: any[]) => {
  const safeCodes = Array.isArray(codes) ? codes.filter(Boolean) : []
  const safeNames = Array.isArray(names) ? names.filter(Boolean) : []
  if (!safeCodes.length && !safeNames.length) return ''
  if (!safeCodes.length) return safeNames.join('、')
  return safeCodes.map((code, index) => {
    const name = safeNames[index]
    return name ? `${code} - ${name}` : code
  }).join('、')
}

const resourceGroups = computed(() => [
  { label: '图稿（CTP版）', text: joinResourceItems(props.artworkCodes, props.artworkNames) },
  { label: '刀模', text: joinResourceItems(props.dieCodes, props.dieNames) },
  { label: '烫金版', text: joinResourceItems(props.foilingPlateCodes, props.foilingPlateNames) },
  { label: '压凸版', text: joinResourceItems(props.embossingPlateCodes, props.embossingPlateNames) },
])

const printingRequirement = computed(() => [
  props.printingColorsDisplay || props.artworkColors,
  props.printingTypeDisplay || getPrintingTypeDisplay(props.printingType)
].filter(Boolean).join(' ') || '-')
</script>
