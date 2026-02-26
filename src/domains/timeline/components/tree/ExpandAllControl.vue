<script setup lang="ts">
const model = defineModel<boolean>({ required: true })
</script>

<template>
  <label class="expand-all-checkbox">
    <input 
      v-model="model" 
      type="checkbox"
    />
    <span>모두 펼치기</span>
  </label>
</template>

<style scoped>
.expand-all-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.expand-all-checkbox input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: #10b981;
}

.expand-all-checkbox span {
  line-height: 1;
}
</style>
