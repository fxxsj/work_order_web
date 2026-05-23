<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <div v-for="(item, index) in plateItems" :key="index" class="card">
      <div class="card-header flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.title }}</span>
        <button class="btn btn-primary btn-sm" @click="goTo(item.path)">全部</button>
      </div>
      <div class="card-body">
        <PendingPlateList :items="item.data" :confirming-item="confirmingItem" :type="item.type" @confirm="handleConfirm" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PendingPlateList from './PendingPlateList.vue'

const props = defineProps({
  pendingArtworks: { type: Array as any, default: () => [] },
  pendingDies: { type: Array as any, default: () => [] },
  pendingFoilingPlates: { type: Array as any, default: () => [] },
  pendingEmbossingPlates: { type: Array as any, default: () => [] },
  confirmingItem: { type: String, default: null }
})

const emit = defineEmits(['confirm'])
const router = useRouter()

const plateItems = computed(() => [
  { title: '待确认图稿', path: '/artworks', data: props.pendingArtworks, type: 'artwork' },
  { title: '待确认刀模', path: '/dies', data: props.pendingDies, type: 'die' },
  { title: '待确认烫金版', path: '/foiling-plates', data: props.pendingFoilingPlates, type: 'foiling_plate' },
  { title: '待确认击凸版', path: '/embossing-plates', data: props.pendingEmbossingPlates, type: 'embossing_plate' }
])

const goTo = (path: any) => router.push(path)
const handleConfirm = (payload: any) => emit('confirm', payload)
</script>
