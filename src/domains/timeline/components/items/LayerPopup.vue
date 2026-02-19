<script setup lang="ts">
import { computed } from 'vue'
import type { ItemCard } from '../../types/item.types'

interface Props {
  item: ItemCard
  position: { x: number; y: number }
  visible: boolean
}

const props = defineProps<Props>()

const popupStyle = computed(() => {
  const offset = 10 // 마우스 포인터로부터의 거리
  return {
    left: `${props.position.x + offset}px`,
    top: `${props.position.y + offset}px`,
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <Teleport to="body">
<div v-if="visible" class="layer-popup" :style="popupStyle">
      <div class="popup-header">
        <h4>{{ item.title }}</h4>
      </div>

      <div class="popup-content">
        <!-- 상태 및 우선순위 -->
        <div class="info-row">
          <div class="info-item">
            <span class="label">Status:</span>
            <span class="value status" :class="`status-${item.status}`">
              {{ item.status }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Priority:</span>
            <span class="value priority" :class="`priority-${item.priority}`">
              {{ item.priority }}
            </span>
          </div>
        </div>

        <!-- 메타데이터 -->
        <div v-if="item.metadata" class="metadata-section">
          <div v-if="item.metadata.author" class="metadata-row">
            <span class="icon">👤</span>
            <span class="label">Author:</span>
            <span class="value">{{ item.metadata.author }}</span>
          </div>
          <div v-if="item.metadata.version" class="metadata-row">
            <span class="icon">📦</span>
            <span class="label">Version:</span>
            <span class="value">{{ item.metadata.version }}</span>
          </div>
          <div v-if="item.metadata.downloads" class="metadata-row">
            <span class="icon">⬇️</span>
            <span class="label">Downloads:</span>
            <span class="value">{{ item.metadata.downloads.toLocaleString() }}</span>
          </div>
        </div>

        <!-- 날짜 정보 -->
        <div class="dates-section">
          <div class="date-item">
            <span class="label">Created:</span>
            <span class="value">{{ formatDate(item.createdAt) }}</span>
          </div>
          <div class="date-item">
            <span class="label">Updated:</span>
            <span class="value">{{ formatDate(item.updatedAt) }}</span>
          </div>
        </div>

        <!-- 설명 -->
        <div class="description-section">
          <p>{{ item.description }}</p>
        </div>

        <!-- 태그 -->
        <div v-if="item.tags.length > 0" class="tags-section">
          <span v-for="tag in item.tags" :key="tag" class="tag">
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.layer-popup {
  position: fixed;
  z-index: 10000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  min-width: 300px;
  max-width: 400px;
  pointer-events: none;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popup-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to right, #eff6ff, #dbeafe);
}

.popup-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e40af;
}

.popup-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.info-row {
  display: flex;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.value {
  font-size: 0.875rem;
  color: #1f2937;
}

.value.status,
.value.priority {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-pending {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-completed {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-archived {
  background-color: #f3f4f6;
  color: #1f2937;
}

.priority-low {
  background-color: #f3f4f6;
  color: #374151;
}

.priority-medium {
  background-color: #dbeafe;
  color: #1e40af;
}

.priority-high {
  background-color: #ffedd5;
  color: #c2410c;
}

.priority-critical {
  background-color: #fee2e2;
  color: #b91c1c;
}

.metadata-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.metadata-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.icon {
  font-size: 1rem;
}

.dates-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.description-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
}

.description-section p {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.tag {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

/* 스크롤바 스타일 */
.popup-content::-webkit-scrollbar {
  width: 6px;
}

.popup-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.popup-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.popup-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
