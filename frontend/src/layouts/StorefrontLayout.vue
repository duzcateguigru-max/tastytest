<template>
  <div class="storefront-layout">
    <TheNavbar />
    <main class="storefront-main">
      <RouterView />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheNavbar from '@/components/layout/TheNavbar.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
</script>

<style scoped>
.storefront-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.storefront-main {
  flex: 1;
  margin-top: var(--navbar-height);
}
</style>
