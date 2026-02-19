<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTreeStore } from '../../store/tree.store'
import { useItemsStore } from '../../store/items.store'
import TreeNodeItem from './TreeNodeItem.vue'

const treeStore = useTreeStore()
const itemsStore = useItemsStore()

const { rootNodes, loading, error, selectedNodeId } = storeToRefs(treeStore)

onMounted(async () => {
  await treeStore.loadRootNodes()
})

const handleToggle = (nodeId: string) => {
  treeStore.toggleNode(nodeId)
}

const handleSelect = (nodeId: string) => {
  treeStore.selectNode(nodeId)
  // 리프 노드 선택 시 Items 로드
  itemsStore.loadItems(nodeId)
}

// 선택된 노드가 변경될 때 Items 로드
watch(selectedNodeId, (newNodeId) => {
  if (newNodeId) {
    itemsStore.loadItems(newNodeId)
  }
})
</script>

<template>
  <div class="groups-tree">
    <div class="tree-header">
      <h3>Groups</h3>
      <div v-if="loading" class="loading-indicator">
        <div class="spinner-small"></div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <span>⚠️ {{ error }}</span>
    </div>

    <div class="tree-content">
      <div v-if="loading && rootNodes.length === 0" class="loading-state">
        <div class="spinner"></div>
        <span>Loading groups...</span>
      </div>

      <div v-else-if="rootNodes.length === 0" class="empty-state">
        <span>No groups available</span>
      </div>

      <div v-else class="tree-nodes">
        <TreeNodeItem
          v-for="node in rootNodes"
          :key="node.id"
          :node="node"
          :level="1"
          @toggle="handleToggle"
          @select="handleSelect"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.groups-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e5e7eb;
}

.tree-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tree-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.loading-indicator {
  display: flex;
  align-items: center;
}

.spinner-small {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.error-message {
  padding: 0.75rem 1rem;
  background-color: #fee2e2;
  color: #dc2626;
  font-size: 0.875rem;
  border-bottom: 1px solid #fecaca;
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: #6b7280;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.tree-nodes {
  display: flex;
  flex-direction: column;
}

/* 스크롤바 스타일 */
.tree-content::-webkit-scrollbar {
  width: 6px;
}

.tree-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.tree-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.tree-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
