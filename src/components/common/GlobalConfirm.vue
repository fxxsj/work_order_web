<template>
  <ConfirmDialog
    :show="confirmState.show"
    :title="confirmState.title"
    :message="confirmState.message"
    :confirm-text="confirmState.confirmText"
    :cancel-text="confirmState.cancelText"
    :danger="confirmState.danger"
    @confirm="uiStore.closeConfirm(true)"
    @cancel="uiStore.closeConfirm(false)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import ConfirmDialog from './ConfirmDialog.vue'

const uiStore = useUIStore()
const confirmState = computed(() => uiStore.confirmState)
</script>
