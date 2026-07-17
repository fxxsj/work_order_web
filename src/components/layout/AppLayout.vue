<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <!-- Background Decoration -->
    <div class="pointer-events-none fixed inset-0 -z-10 bg-mesh-gradient" />

    <!-- Sidebar -->
    <AppSidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileSidebarOpen"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      @close-mobile="mobileSidebarOpen = false"
    />

    <!-- Main Content Area -->
    <div
      class="relative min-h-screen transition-all duration-300"
      :class="[sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64']"
    >
      <!-- Header -->
      <AppHeader
        @toggle-mobile-sidebar="mobileSidebarOpen = !mobileSidebarOpen"
      />

      <!-- Main Content -->
      <main class="p-4 md:p-6 lg:p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useApprovalConfigStore } from '@/stores/approvalConfig'

const route = useRoute()
const approvalConfigStore = useApprovalConfigStore()
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

onMounted(() => {
  approvalConfigStore.load()
})

// Close mobile sidebar on route change
watch(() => route.fullPath, () => {
  mobileSidebarOpen.value = false
})
</script>
