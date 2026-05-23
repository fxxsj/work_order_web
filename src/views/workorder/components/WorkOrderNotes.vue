<template>
  <div class="descriptions-grid mt-6" style="--col: 1">
    <div class="description-item"><div class="description-label">备注</div><div class="description-value">{{ notes || '-' }}</div></div>
  </div>
</template>

<script setup lang="ts">
defineProps({ notes: { type: String, default: '' } })
</script>