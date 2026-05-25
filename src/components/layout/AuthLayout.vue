<template>
  <div class="auth-layout">
    <!-- Background -->
    <div class="auth-bg" />

    <!-- Decorative Elements -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl" />
      <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl" />
      <div class="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-300/10 blur-3xl" />
      <div class="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
    </div>

    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md py-8">
      <!-- Logo/Brand -->
      <div class="mb-8 text-center">
        <div class="mb-4 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-primary-500/30 bg-white/80 backdrop-blur-sm">
          <span class="text-3xl font-bold text-primary-600">印</span>
        </div>
        <h1 class="auth-title mb-2 text-3xl font-bold">
          印刷施工单跟踪系统
        </h1>
        <p class="text-sm text-gray-500 dark:text-dark-400">
          高效管理施工单，提升生产效率
        </p>
      </div>

      <!-- Card Container -->
      <div class="card-glass rounded-2xl p-8 shadow-glass">
        <slot />
      </div>

      <!-- Footer Links -->
      <div class="mt-6 text-center text-sm">
        <slot name="footer" />
      </div>

      <!-- Copyright -->
      <div class="mt-8 text-center text-xs text-gray-400 dark:text-dark-500">
        &copy; {{ currentYear }} 印刷施工单跟踪系统. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style>
.auth-layout {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  overflow-y: auto;
}

.auth-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, #f9fafb, rgba(204, 251, 241, 0.3), #f3f4f6);
}

:global(.dark) .auth-bg {
  background: linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a);
}

.auth-title {
  background: linear-gradient(to right, #0d9488, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>