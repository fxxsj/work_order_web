<template>
  <router-view />
</template>

<script setup>
import { useUserStore } from '@/stores'

// 初始化用户状态
const userStore = useUserStore()
userStore.restoreSession()
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}
</style>

