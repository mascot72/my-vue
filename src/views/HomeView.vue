<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <div class="home-view">
    <TheWelcome />
  </div>
</template>

<style scoped>
.home-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .home-view {
    padding: 1rem;
  }
}
</style>
