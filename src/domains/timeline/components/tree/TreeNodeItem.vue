<script setup lang="ts">
import { computed } from 'vue'
import type { TreeNode } from '../../types/tree.types'

interface Props {
  node: TreeNode
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
})

const emit = defineEmits<{
  toggle: [nodeId: string]
  select: [nodeId: string]
}>()

const indent = computed(() => `${(props.level - 1) * 20}px`)

const handleToggle = (e: Event) => {
  e.stopPropagation()
  emit('toggle', props.node.id)
}

const handleSelect = () => {
  // 리프 노드만 선택 가능
  if (!props.node.hasChildren || props.level === 4) {
    emit('select', props.node.id)
  } else {
    emit('toggle', props.node.id)
  }
}

const nodeIcon = computed(() => {
  if (props.node.isLoading) return '⟳'
  if (!props.node.hasChildren) return '📄'
  return props.node.isExpanded ? '📂' : '📁'
})
</script>

<template>
  <div class="tree-node">
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
    <div v-if="node.isExpanded && node.children" class="tree-node-children">
      <TreeNodeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
      />
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
