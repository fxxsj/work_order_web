<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <slot />
    </div>
    <div v-if="$slots.extra" class="flex flex-wrap items-center gap-3">
      <slot name="extra" />
    </div>
  </div>
</template>
