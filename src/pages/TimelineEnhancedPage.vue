<script setup lang="ts">
import GroupsTree from '@/domains/timeline/components/tree/GroupsTree.vue'
import ItemsGrid from '@/domains/timeline/components/items/ItemsGrid.vue'
</script>

<template>
  <div class="timeline-enhanced-page">
    <div class="page-header">
      <h1>Enhanced Timeline</h1>
      <p class="subtitle">Browse groups and explore items with interactive cards</p>
    </div>

    <div class="page-content">
      <!-- 왼쪽: Groups Tree -->
      <aside class="groups-section">
        <GroupsTree />
      </aside>

      <!-- 오른쪽: Items Grid -->
      <main class="items-section">
        <ItemsGrid />
      </main>
    </div>
  </div>
</template>

<style scoped>
.timeline-enhanced-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.page-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to right, #eff6ff, #f9fafb);
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.page-content {
  flex: 1;
  display: grid;
  grid-template-columns: 320px 1fr;
  overflow: hidden;
}

.groups-section {
  height: 100%;
  overflow: hidden;
}

.items-section {
  height: 100%;
  overflow: hidden;
}

/* 반응형 */
@media (max-width: 1024px) {
  .page-content {
    grid-template-columns: 280px 1fr;
  }
}

@media (max-width: 768px) {
  .page-content {
    grid-template-columns: 1fr;
  }

  .groups-section {
    display: none;
  }

  .page-header {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }
}
</style>
