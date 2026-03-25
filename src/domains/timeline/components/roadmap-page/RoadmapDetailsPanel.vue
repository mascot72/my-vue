<script setup lang="ts">
defineProps<{
  selectedTaskDetail: unknown | null
  selectedTaskDetailHtml: string | null
}>()

const emit = defineEmits<{
  clear: []
}>()
</script>

<template>
  <aside class="details-panel">
    <div class="details-header">
      <div>
        <p class="eyebrow">Details</p>
        <h2>선택 항목 정보</h2>
      </div>
      <button
        v-if="selectedTaskDetail"
        type="button"
        class="ghost-button small"
        @click="emit('clear')"
      >
        선택 해제
      </button>
    </div>

    <div v-if="selectedTaskDetailHtml" class="details-body" v-html="selectedTaskDetailHtml"></div>
    <div v-else class="empty-state">
      <strong>항목을 선택해 주세요.</strong>
      <p>타임라인 카드 클릭 시 상세 정보를 오른쪽 패널에서 확인할 수 있습니다.</p>
    </div>
  </aside>
</template>

<style scoped>
.details-panel {
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
}

.details-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.eyebrow {
  margin: 0 0 8px;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #0f172a;
}

.details-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px;
}

.empty-state {
  display: grid;
  place-items: center;
  text-align: center;
  gap: 8px;
  color: #64748b;
  min-height: 240px;
  padding: 24px;
}

.ghost-button {
  height: 42px;
  padding: 0 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: white;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
}

.ghost-button.small {
  height: 36px;
  padding: 0 12px;
}

.ghost-button:hover {
  background: #f8fafc;
}
</style>
