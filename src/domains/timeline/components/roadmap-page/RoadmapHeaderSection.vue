<script setup lang="ts">
import type { SummaryCard } from '@/domains/timeline/composables/useRoadmapViewModel'

defineProps<{
  summaryCards: SummaryCard[]
}>()

const emit = defineEmits<{
  reset: []
}>()
</script>

<template>
  <header class="page-header">
    <div>
      <p class="eyebrow">Roadmap</p>
      <h1>Roadmap Timeline</h1>
      <p class="description">vis-timeline 기반 로드맵 화면을 현재 프로젝트 구조에 맞게 다시 연결했습니다.</p>
    </div>
    <div class="header-actions">
      <button type="button" class="ghost-button" @click="emit('reset')">필터 초기화</button>
    </div>
  </header>

  <section class="summary-grid">
    <article v-for="card in summaryCards" :key="card.label" class="summary-card" :data-tone="card.tone">
      <span class="summary-label">{{ card.label }}</span>
      <strong class="summary-value">{{ card.value }}</strong>
    </article>
  </section>
</template>

<style scoped>
.page-header,
.summary-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  border-radius: 24px;
  padding: 24px 28px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #0f172a;
}

.description {
  margin: 8px 0 0;
  color: #475569;
  max-width: 720px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.summary-card {
  border-radius: 20px;
  padding: 18px 20px;
}

.summary-card[data-tone='blue'] {
  border-color: rgba(59, 130, 246, 0.2);
}

.summary-card[data-tone='indigo'] {
  border-color: rgba(79, 70, 229, 0.2);
}

.summary-card[data-tone='green'] {
  border-color: rgba(16, 185, 129, 0.2);
}

.summary-label {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 28px;
  color: #0f172a;
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

.ghost-button:hover {
  background: #f8fafc;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
