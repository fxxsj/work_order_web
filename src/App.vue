<template>
  <div id="app" :class="{ dark: isDarkMode }">
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores'

// 初始化用户状态
const userStore = useUserStore()
userStore.restoreSession()

// Dark mode toggle - sync with AppHeader
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

const handleThemeToggle = (event) => {
  isDarkMode.value = event.detail.dark
}

onMounted(() => {
  // Check for saved preference or system preference
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
  }

  // Listen for theme toggle events from header
  window.addEventListener('theme-toggle', handleThemeToggle)
})

onUnmounted(() => {
  window.removeEventListener('theme-toggle', handleThemeToggle)
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>

