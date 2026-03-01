<script setup lang="ts">
import { computed } from 'vue'
import { useTreeStore } from '../../store/tree.store'

interface Props {
  nodeId: string
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
})

const emit = defineEmits<{
  toggle: [nodeId: string]
  select: [nodeId: string]
}>()

const treeStore = useTreeStore()

// Store에서 직접 node 가져오기 (computed로 반응성 보장)
const node = computed(() => {
  return treeStore.getNode(props.nodeId)
})

// 자식 노드들 가져오기 (항상 최신 상태)
const children = computed(() => {
  return treeStore.getChildren(props.nodeId)
})

const indent = computed(() => `${(props.level - 1) * 20}px`)

const handleToggle = (e: Event) => {
  e.stopPropagation()
  emit('toggle', props.nodeId)
}

const handleSelect = () => {
  if (!node.value) return
  
  // 리프 노드만 선택 가능
  if (!node.value.hasChildren || props.level === 4) {
    emit('select', props.nodeId)
  } else {
    emit('toggle', props.nodeId)
  }
}

const nodeIcon = computed(() => {
  if (!node.value) return '❓'
  if (node.value.isLoading) return '⟳'
  if (!node.value.hasChildren) return '📄'
  return node.value.isExpanded ? '📂' : '📁'
})

const shouldShowChildren = computed(() => {
  if (!node.value) return false
  return node.value.isExpanded && children.value.length > 0
})

</script>

<template>
  <div v-if="node" class="tree-node">
    <div
      class="tree-node-content"
      :class="{
        'has-children': node.hasChildren,
        'is-expanded': node.isExpanded,
        'is-loading': node.isLoading,
        'is-leaf': !node.hasChildren,
      }"
      :style="{ paddingLeft: indent }"
      @click="handleSelect"
    >
      <button
        v-if="node.hasChildren"
        class="expand-button"
        :class="{ rotated: node.isExpanded }"
        @click="handleToggle"
      >
        ▶
      </button>
      <span class="node-icon">{{ nodeIcon }}</span>
      <span class="node-name">{{ node.name }}</span>
    </div>

    <!-- 자식 노드들 -->
    <div v-if="shouldShowChildren" class="tree-node-children">
      <TreeNodeItem
        v-for="child in children"
        :key="child.id"
        :node-id="child.id"
        :level="level + 1"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
      />
    </div>
    
    <!-- 로딩 상태 -->
    <div 
      v-if="node.isExpanded && node.hasChildren && children.length === 0" 
      class="loading-state"
    >
      <span class="spinner-small"></span> Loading...
    </div>
  </div>
</template>

<style scoped>
.tree-node {
  user-select: none;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.tree-node-content:hover {
  background-color: #f3f4f6;
}

.tree-node-content.is-loading {
  opacity: 0.6;
  cursor: wait;
}

.tree-node-content.is-leaf {
  cursor: pointer;
}

.tree-node-content.is-leaf:hover {
  background-color: #e0f2fe;
}

.expand-button {
  all: unset;
  cursor: pointer;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.expand-button.rotated {
  transform: rotate(90deg);
}

.node-icon {
  font-size: 1.125rem;
  line-height: 1;
}

.node-name {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.tree-node-children {
  /* 자식 노드 컨테이너 */
}

.loading-state {
  padding: 0.5rem 0.75rem 0.5rem 3rem;
  color: #9ca3af;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner-small {
  display: inline-block;
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style scoped>
.tree-node {
  user-select: none;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
  position: relative;
}

.tree-node-content:hover {
  background-color: #f3f4f6;
}

.tree-node-content.is-loading {
  opacity: 0.6;
  cursor: wait;
}

.tree-node-content.is-leaf {
  cursor: pointer;
}

.tree-node-content.is-leaf:hover {
  background-color: #e0f2fe;
}

.expand-button {
  all: unset;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  font-size: 0.75rem;
  color: #6b7280;
}

.expand-button:hover {
  color: #374151;
}

.expand-button.rotated {
  transform: rotate(90deg);
}

.node-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.node-name {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
  flex: 1;
}

.tree-node-children {
  display: flex;
  flex-direction: column;
}
</style>
