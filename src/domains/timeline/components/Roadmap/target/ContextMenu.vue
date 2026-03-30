<!--
  ContextMenu.vue (target)
  출처: origin/VisContextMenu.vue

  vis-timeline 의 우클릭(contextmenu) 이벤트에서 표시되는 컨텍스트 메뉴입니다.
  Timeline.vue 에서 `contextmenu` 이벤트를 수신해 show/top/left/items 를 제어합니다.
-->
<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="context-menu"
      :style="{ top: top + 'px', left: left + 'px' }"
    >
      <ul>
        <li
          v-for="menuItem in items"
          :key="menuItem.label"
          @click="handleItemClick(menuItem)"
        >
          <span v-if="menuItem.icon" class="menu-icon">{{ menuItem.icon }}</span>
          {{ menuItem.label }}
        </li>
      </ul>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 컨텍스트 메뉴 항목 타입
 */
interface MenuItem {
  label: string
  icon?: string
  action?: () => void
  disabled?: boolean
}

defineProps<{
  /** 메뉴 표시 여부 */
  show: boolean
  /** 메뉴 상단 Y 좌표 (px) */
  top: number
  /** 메뉴 좌측 X 좌표 (px) */
  left: number
  /** 메뉴 항목 목록 */
  items: MenuItem[]
  /** 컨텍스트 메뉴가 열린 대상 데이터 (아이템 또는 그룹) */
  data?: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  close: []
}>()

const handleItemClick = (menuItem: MenuItem) => {
  if (menuItem.disabled) return
  menuItem.action?.()
  emit('close')
}
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  z-index: 1002;
  min-width: 160px;
  overflow: hidden;
}

.context-menu ul {
  list-style: none;
  padding: 4px 0;
  margin: 0;
}

.context-menu li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
  color: #1e293b;
  transition: background 0.15s;
}

.context-menu li:hover {
  background-color: #f1f5f9;
}

.menu-icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
}
</style>
