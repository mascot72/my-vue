<!--VisContextMenu.vue//-->
<template>
  <div
    v-if="show"
    class="context-menu"
    :style="{ top: top + 'px', left: left + 'px' }"
  >
    <ul>
      <li
        v-for="menuItem in items"
        :key="menuItem.label"
        @click="menuItem.action"
      >
        {{ menuItem.label }}
      </li>
    </ul>
  </div>
</template>
<script setup>
defineProps({
  show: { type: Boolean, default: false },
  top: { type: Number, default: 0 },
  left: { type: Number, default: 0 },
  items: { type: Array, default: () => [] },
  data: { type: Object, default: null },
});
</script>
<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1002; /* 팝업보다 위에 표시 */
  min-width: 150px;
}
.context-menu ul {
  list-style: none;
  padding: 5px 0;
  margin: 0;
}
.context-menu li {
  padding: 8px 12px;
  cursor: pointer;
}
.context-menu li:hover {
  background-color: #f0f0f0;
}
</style>
