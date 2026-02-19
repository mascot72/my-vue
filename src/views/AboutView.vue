<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCounterStore } from '@/stores/counter';
const counterStore = useCounterStore();
const { count } = storeToRefs(counterStore);

const dCount = computed(() => counterStore.doubleCount)

</script>

<template>
  <div class="about">
    <div class="about-content">
      <h1>This is an about page</h1>
      <p>Welcome to the Vue Timeline Application</p>
    </div>
    {{ count }} , double: {{ dCount }}
    <button @click="counterStore.increment">Increment Count</button>
  </div>
</template>

<style scoped>
.about {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-content {
  text-align: center;
}

.about-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.about-content p {
  font-size: 1.125rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .about {
    padding: 1rem;
  }

  .about-content h1 {
    font-size: 1.875rem;
  }
}
</style>
