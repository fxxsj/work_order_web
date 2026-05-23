<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// App.vue 不再负责主题初始化和用户恢复
// 主题初始化已前移到 main.ts（mount 前）
// 用户恢复由 main.ts 的 initApp 处理
</script>

<style>
#app {
  min-height: 100vh;
}
</style>

