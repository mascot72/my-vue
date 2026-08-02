<script setup lang="ts">
interface PopupItem {
  id?: string | number
  title?: string
  titleEn?: string
  organizationNm?: string
  itemStatusName?: string
  itemStatusCode?: string
  technologyClassLv3Name?: string
  ptrmType?: string
  [key: string]: unknown
}

const props = defineProps<{
  show: boolean
  pinned: boolean
  top: number
  left: number
  itemData: PopupItem | null
}>()

const emit = defineEmits<{
  close: []
  openDetail: [item: PopupItem]
  enter: []
  leave: []
}>()

const onOpenDetail = () => {
  if (!props.itemData) return
  emit('openDetail', props.itemData)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && itemData"
      class="item-hover-popup"
      :style="{ top: `${top}px`, left: `${left}px` }"
      @mouseenter="emit('enter')"
      @mouseleave="emit('leave')"
    >
      <div class="popup-header">
        <strong class="popup-title">{{ itemData.title || '-' }}</strong>
        <div class="popup-actions">
          <span v-if="pinned" class="pin-state">고정</span>
          <button type="button" class="close-button" @click="emit('close')">✕</button>
        </div>
      </div>

      <div class="popup-body">
        <div class="row"><span class="label">상태</span><span class="value">{{ itemData.itemStatusName || itemData.itemStatusCode || '-' }}</span></div>
        <div class="row"><span class="label">조직</span><span class="value">{{ itemData.organizationNm || '-' }}</span></div>
        <div class="row"><span class="label">유형</span><span class="value">{{ itemData.ptrmType || '-' }}</span></div>
        <div class="row"><span class="label">기술분류</span><span class="value">{{ itemData.technologyClassLv3Name || '-' }}</span></div>
        <div class="row desc"><span class="label">설명</span><span class="value">{{ `${itemData.order}, ${itemData.subgroup}, ${itemData.subgroupOrder}` }}</span></div>
      </div>

      <button type="button" class="detail-button" @click="onOpenDetail">상세 보기</button>
    </div>
  </Teleport>
</template>

<style scoped>
.item-hover-popup {
  position: fixed;
  z-index: 1000;
  width: 320px;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.16);
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.popup-title {
  font-size: 13px;
  color: #0f172a;
  line-height: 1.3;
}

.popup-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pin-state {
  font-size: 11px;
  color: #166534;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 999px;
  padding: 2px 6px;
}

.close-button {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
  font-size: 14px;
}

.popup-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.row {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.label {
  min-width: 56px;
  color: #64748b;
}

.value {
  color: #334155;
  word-break: break-word;
}

.desc .value {
  line-height: 1.35;
}

.detail-button {
  width: 100%;
  border: none;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  background: #f8fafc;
  color: #0f172a;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 0 0 12px 12px;
}

.detail-button:hover {
  background: #f1f5f9;
}
</style>
