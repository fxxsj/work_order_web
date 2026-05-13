<template>
  <div class="designer-pending-plates">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card>
          <template #header><div class="card-header"><span>待确认图稿</span><el-button type="primary" size="small" @click="goTo('/artworks')">全部</el-button></div></template>
          <PendingPlateList :items="pendingArtworks" :confirming-item="confirmingItem" type="artwork" @confirm="handleConfirm" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card>
          <template #header><div class="card-header"><span>待确认刀模</span><el-button type="primary" size="small" @click="goTo('/dies')">全部</el-button></div></template>
          <PendingPlateList :items="pendingDies" :confirming-item="confirmingItem" type="die" @confirm="handleConfirm" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card>
          <template #header><div class="card-header"><span>待确认烫金版</span><el-button type="primary" size="small" @click="goTo('/foiling-plates')">全部</el-button></div></template>
          <PendingPlateList :items="pendingFoilingPlates" :confirming-item="confirmingItem" type="foiling_plate" @confirm="handleConfirm" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card>
          <template #header><div class="card-header"><span>待确认击凸版</span><el-button type="primary" size="small" @click="goTo('/embossing-plates')">全部</el-button></div></template>
          <PendingPlateList :items="pendingEmbossingPlates" :confirming-item="confirmingItem" type="embossing_plate" @confirm="handleConfirm" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import PendingPlateList from './PendingPlateList.vue'

const props = defineProps({
  pendingArtworks: { type: Array, default: () => [] },
  pendingDies: { type: Array, default: () => [] },
  pendingFoilingPlates: { type: Array, default: () => [] },
  pendingEmbossingPlates: { type: Array, default: () => [] },
  confirmingItem: { type: String, default: null }
})

const emit = defineEmits(['confirm'])
const router = useRouter()
const goTo = (path) => router.push(path)
const handleConfirm = (payload) => emit('confirm', payload)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
