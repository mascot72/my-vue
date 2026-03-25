<!-- TimelineItem.vue -->
<template>
  <div class="vis-item-contents">
    <div class="vis-item-head">
      <div :class="['vis-item-tags',{
        'lock': data.writingStatus === 'code001',
        'unlock': data.writingStatus === 'code002'
      }]">
        <!-- 조직명 -->
        <span class="vis-item-name">{{ data.organizationNm }}</span>
        <!-- 상태 -->
        <span class="vis-item-status">{{ data.itemStatusName }}</span>
      </div>
      <div class="vis-item-comment"></div>
    </div>
    <div class="vis-item-body">
      <div class="vis-item-text">
        <!-- 제품명 -->
        <div class="vis-item-title" v-if="data.ptrmType === 'PRM'">{{ data.title }}</div>
        <div class="vis-item-title" v-else>{{ data.technologyClassLv3Name || 'Not found level3!' }} > {{ data.title }}</div>
        <div class="vis-item-tech">{{ data.titleEn }}</div>
      </div>
      <div class="vis-item-imgwrap" v-if="data.ptrmType === 'PRM'">
        <img
          class="vis-item-img"
          :src="`https://dev-dxplm-ext.hlmando.com/fms/rest/v1/file/thumbnail?ownerId=${data.id}&amp;sectionType=-&amp;ownerDelegateClass=${DELEGATE_CLASS}&amp;createDate=${data.updateDate}`"
        />
        <!-- 자식에 제품 존재 여부 -->
        <div
          v-if="data.hasTrm"
          @click.stop="onAddBtnClick"
          :class="['vis-item-add', { active: isActive }]"
        >
          {{ isActive ? "-" : "+" }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";

const DELEGATE_CLASS =
  "com.mando.dxplm.tes.roadmap.file.delegate.RoadmapFileAuthDelegate";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  timelineState: {
    type: Object,
    default: () => ({ activeArrowItemIds: [] }),
  },
  viewStatus: { type: Object, default: () => ({
      statusPlan: false,
      statusExec: false,
      statusNBiz: false,
    }),
  },
});

const emit = defineEmits(["add-click"]);

const onAddBtnClick = () => {
  emit("add-click", props.data.id);
};

const isActive = computed(() =>
  props.timelineState.activeArrowItemIds.includes(props.data.id),
);

</script>
