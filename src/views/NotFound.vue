<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950 px-4">
    <div class="text-center">
      <div class="text-8xl font-bold text-primary-500 mb-4">
        404
      </div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        页面未找到
      </h1>
      <p class="text-gray-500 dark:text-dark-400 mb-8">
        您访问的页面不存在或已被移除
      </p>
      <button
        class="btn btn-primary"
        @click="router.push('/')"
      >
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
