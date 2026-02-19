<script setup lang="ts">
import { ref } from 'vue'
import type { ItemCard } from '../../types/item.types'

interface Props {
  item: ItemCard
}

const props = defineProps<Props>()

const emit = defineEmits<{
  mouseenter: [item: ItemCard, event: MouseEvent]
  mouseleave: []
}>()

const cardRef = ref<HTMLElement>()

const handleMouseEnter = (event: MouseEvent) => {
  emit('mouseenter', props.item, event)
}

const handleMouseLeave = () => {
  emit('mouseleave')
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-800',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div
    ref="cardRef"
    class="item-card"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 이미지 -->
    <div v-if="item.imageUrl" class="card-image">
      <img :src="item.imageUrl" :alt="item.title" />
    </div>

    <div class="card-content">
      <!-- 헤더 -->
      <div class="card-header">
        <h3 class="card-title">{{ item.title }}</h3>
        <div class="card-badges">
          <span class="badge" :class="statusColors[item.status]">
            {{ item.status }}
          </span>
          <span class="badge" :class="priorityColors[item.priority]">
            {{ item.priority }}
          </span>
        </div>
      </div>

      <!-- 설명 -->
      <p class="card-description">{{ item.description }}</p>

      <!-- 태그 -->
      <div v-if="item.tags.length > 0" class="card-tags">
        <span v-for="tag in item.tags" :key="tag" class="tag">
          #{{ tag }}
        </span>
      </div>

      <!-- 푸터 -->
      <div class="card-footer">
        <div class="metadata">
<div v-if="item.metadata.author" class="metadata-item">
            <span class="icon">👤</span>
            <span>{{ item.metadata.author }}</span>
          </div>
          <div v-if="item.metadata.version" class="metadata-item">
            <span class="icon">📦</span>
            <span>v{{ item.metadata.version }}</span>
          </div>
        </div>
        <div class="date">
          {{ formatDate(item.updatedAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
  border-color: #3b82f6;
}

.card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f3f4f6;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.item-card:hover .card-image img {
  transform: scale(1.05);
}

.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.card-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.bg-green-100 { background-color: #dcfce7; }
.text-green-800 { color: #166534; }
.bg-yellow-100 { background-color: #fef9c3; }
.text-yellow-800 { color: #854d0e; }
.bg-blue-100 { background-color: #dbeafe; }
.text-blue-800 { color: #1e40af; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-800 { color: #1f2937; }
.text-gray-700 { color: #374151; }
.bg-orange-100 { background-color: #ffedd5; }
.text-orange-700 { color: #c2410c; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-700 { color: #b91c1c; }

.card-description {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.metadata {
  display: flex;
  gap: 1rem;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.icon {
  font-size: 0.875rem;
}

.date {
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>
