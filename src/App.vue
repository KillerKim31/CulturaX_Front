<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
</script>

<template>
  <div id="app-wrapper">
    <Navbar />
    <main class="flex-grow-1">
      <RouterView />
    </main>
  </div>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
}

#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
