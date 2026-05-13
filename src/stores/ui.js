import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const sidebarCollapsed = ref(false)
  const theme = ref('light')
  const language = ref('zh-CN')

  // Actions
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed) {
    sidebarCollapsed.value = collapsed
  }

  function setTheme(newTheme) {
    theme.value = newTheme
  }

  function setLanguage(lang) {
    language.value = lang
  }

  return {
    sidebarCollapsed,
    theme,
    language,
    toggleSidebar,
    setSidebarCollapsed,
    setTheme,
    setLanguage,
  }
}, {
  persist: {
    key: 'ui',
    storage: sessionStorage,
    paths: ['sidebarCollapsed', 'theme', 'language'],
  },
})
