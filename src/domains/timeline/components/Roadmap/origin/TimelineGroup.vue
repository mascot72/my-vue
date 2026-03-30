<script lang="ts">
export const TIMELINE_GROUP_DESIGN_SOURCE = `
<div class="vis-group-wrapper">
  <label class="vis-group-label">
    <input class="group-toggle-input mr-1" type="checkbox" />
    <span class="group-content">{{content}}</span>
  </label>
  <div class="group-history-wrap">
    <label class="mr-8 font-size-12">{{changeInfoText}}</label>
    <input class="group-history-switch" type="checkbox" />
  </div>
</div>
`
</script>

<script setup lang="ts">
defineProps<{
  content?: string
  isChecked?: boolean
  showHistory?: boolean
  changeInfoText?: string
}>()
</script>

<template>
  <div class="vis-group-wrapper">
    <label class="vis-group-label">
      <input class="group-toggle-input mr-1" type="checkbox" :checked="isChecked" />
      <span class="group-content">{{ content }}</span>
    </label>
    <div v-if="showHistory" class="group-history-wrap">
      <label class="mr-8 font-size-12">{{ changeInfoText }}</label>
      <input class="group-history-switch" type="checkbox" />
    </div>
  </div>
</template>

<style scoped>
.vis-group-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.vis-group-label {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.group-history-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mr-1 {
  margin-right: 4px;
}
</style>
