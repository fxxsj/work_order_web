<template>
  <el-descriptions title="图稿和刀模" :column="1" border style="margin-top: 20px;">
    <el-descriptions-item label="图稿（CTP版）">
      <span v-if="artworkCodes?.length">
        <span v-for="(code, i) in artworkCodes" :key="i">{{ code }}<span v-if="artworkNames?.[i]"> - {{ artworkNames[i] }}</span><span v-if="i < artworkCodes.length - 1">、</span></span>
      </span><span v-else style="color: #909399;">-</span>
    </el-descriptions-item>
    <el-descriptions-item v-if="printingType && printingType !== 'none'" label="印刷要求">
      <span>{{ printingColorsDisplay || artworkColors }} {{ getPrintingTypeDisplay(printingType) }}</span>
    </el-descriptions-item>
    <el-descriptions-item label="刀模">
      <span v-if="dieCodes?.length">
        <span v-for="(code, i) in dieCodes" :key="i">{{ code }}<span v-if="dieNames?.[i]"> - {{ dieNames[i] }}</span><span v-if="i < dieCodes.length - 1">、</span></span>
      </span><span v-else style="color: #909399;">-</span>
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
const props = defineProps({
  artworkCodes: { type: Array, default: () => [] },
  artworkNames: { type: Array, default: () => [] },
  dieCodes: { type: Array, default: () => [] },
  dieNames: { type: Array, default: () => [] },
  printingType: { type: String, default: '' },
  printingColorsDisplay: { type: String, default: '' },
  artworkColors: { type: String, default: '' }
})

const getPrintingTypeDisplay = (t) => ({ none: '', single: '单面印刷', double: '双面印刷', multi: '多色印刷' })[t] || t
</script>
