<script lang="ts">
export const TIMELINE_ITEM_DESIGN_SOURCE = `
<div class="vis-item-contents">
  <div class="vis-item-head">
    <div class="vis-item-tags {{writingStatusClass}}">
      <span class="vis-item-name">{{organizationNm}}</span>
      <span class="vis-item-status">{{itemStatusName}}</span>
    </div>
    <div class="vis-item-comment"></div>
  </div>
  <div class="vis-item-body">
    <div class="vis-item-text">
      <div class="vis-item-title">{{title}}</div>
      <div class="vis-item-tech">{{titleEn}}</div>
    </div>
    <div class="vis-item-imgwrap">
      <img class="vis-item-img" src="{{thumbnailUrl}}" />
      <div class="vis-item-add {{activeClass}}">{{toggleSign}}</div>
    </div>
  </div>
</div>
`
</script>

<script setup lang="ts">
defineProps<{
  organizationNm?: string
  itemStatusName?: string
  title?: string
  titleEn?: string
  thumbnailUrl?: string
  isActive?: boolean
}>()
</script>

<template>
  <div class="vis-item-contents">
    <div class="vis-item-head">
      <div class="vis-item-tags">
        <span class="vis-item-name">{{ organizationNm }}</span>
        <span class="vis-item-status">{{ itemStatusName }}</span>
      </div>
      <div class="vis-item-comment"></div>
    </div>
    <div class="vis-item-body">
      <div class="vis-item-text">
        <div class="vis-item-title">{{ title }}</div>
        <div class="vis-item-tech">{{ titleEn }}</div>
      </div>
      <div class="vis-item-imgwrap">
        <img class="vis-item-img" :src="thumbnailUrl" />
        <div class="vis-item-add" :class="{ active: isActive }">{{ isActive ? '-' : '+' }}</div>
      </div>
    </div>
  </div>
</template>
