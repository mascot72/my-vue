<script setup lang="ts">
import type {
  PriorityFilter,
  SelectOption,
  StatusFilter,
} from '@/domains/timeline/composables/useRoadmapViewModel'

defineProps<{
  searchText: string
  selectedGroupId: string
  statusFilter: StatusFilter
  priorityFilter: PriorityFilter
  hideCompleted: boolean
  bindAllOnMount: boolean
  groupOptions: SelectOption[]
}>()

const emit = defineEmits<{
  'update:searchText': [value: string]
  'update:selectedGroupId': [value: string]
  'update:statusFilter': [value: StatusFilter]
  'update:priorityFilter': [value: PriorityFilter]
  'update:hideCompleted': [value: boolean]
  'update:bindAllOnMount': [value: boolean]
}>()
</script>

<template>
  <section class="filter-panel">
    <label class="field">
      <span>검색</span>
      <input
        :value="searchText"
        type="text"
        placeholder="작업명 또는 설명 검색"
        @input="emit('update:searchText', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <label class="field">
      <span>그룹</span>
      <select
        :value="selectedGroupId"
        @change="emit('update:selectedGroupId', ($event.target as HTMLSelectElement).value)"
      >
        <option value="all">전체</option>
        <option v-for="group in groupOptions" :key="group.value" :value="group.value">
          {{ group.label }}
        </option>
      </select>
    </label>

    <label class="field">
      <span>상태</span>
      <select
        :value="statusFilter"
        @change="emit('update:statusFilter', ($event.target as HTMLSelectElement).value as StatusFilter)"
      >
        <option value="all">전체</option>
        <option value="planning">Planning</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="on-hold">On Hold</option>
      </select>
    </label>

    <label class="field">
      <span>우선순위</span>
      <select
        :value="priorityFilter"
        @change="emit('update:priorityFilter', ($event.target as HTMLSelectElement).value as PriorityFilter)"
      >
        <option value="all">전체</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
    </label>

    <label class="checkbox-field">
      <input
        :checked="hideCompleted"
        type="checkbox"
        @change="emit('update:hideCompleted', ($event.target as HTMLInputElement).checked)"
      />
      <span>완료 항목 숨기기</span>
    </label>

    <label class="checkbox-field bind-mode-field">
      <input
        :checked="bindAllOnMount"
        type="checkbox"
        @change="emit('update:bindAllOnMount', ($event.target as HTMLInputElement).checked)"
      />
      <span>전체 데이터 바인딩</span>
    </label>
  </section>
</template>

<style scoped>
.filter-panel {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) repeat(3, minmax(160px, 1fr)) auto auto;
  gap: 16px;
  margin-top: 20px;
  border-radius: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
}

.field,
.checkbox-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span,
.checkbox-field span {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.field input,
.field select {
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #0f172a;
}

.checkbox-field {
  justify-content: flex-end;
  flex-direction: row;
  align-items: center;
  padding-top: 28px;
}

.bind-mode-field {
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .filter-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .checkbox-field {
    justify-content: flex-start;
    padding-top: 0;
  }
}

@media (max-width: 768px) {
  .filter-panel {
    grid-template-columns: 1fr;
  }
}
</style>
