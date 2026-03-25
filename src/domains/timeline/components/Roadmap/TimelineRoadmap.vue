<!-- ErmmVimelineRoadmap.vue
전체 구조를 개선해서 전체 코드로 알려줘! -->

<template>
  <div class="roadmap-wrapper">

    <ErmmVisTimeline ref="timelineRef" :all-items="allItems" :options="options" :groups="groups"
      :view-status="{ statusPlan, statusExec, statusNBiz }" :view-mode="viewMode" :hide-empty-groups="hideEmptyGroups"
      @open-detail-slide="onDetailView" @zoom-state-change="onZoomStateChange" @roadmap-create="onRoadmapCreate" />

    <div class="roadmap-tree">
      <div class="roadmap-tree-row">
        <div class="flex align-items-center horizontal">
          <span class="roadmap-tree-title"><dxplm-label message="tes.roadmap-tree-label" text="로드맵 Tree" /></span>
          <dxplm-icon-button type="line" icon="collapse_menu" borderless @click="toggleAllGroups(false)" />
          <dxplm-icon-button type="line" icon="expand_menu" borderless @click="toggleAllGroups(true)" />
          <dxplm-icon-button type="line" icon="reset" borderless />
        </div>
        <dxplm-button v-if="flag % 3 === 0" small class="view-mode step-1" @click="changeItemMode(false)">
          <dxplm-label message="cmm.product-group-label" text="제품군" />
        </dxplm-button>
        <dxplm-button v-else-if="flag % 3 === 1" small class="view-mode step-2" @click="changeItemMode(false)">
          <dxplm-label message="tes.tech-class-system-label" text="기술분류체계" />
        </dxplm-button>
        <dxplm-button v-else small class="view-mode step-3" @click="changeItemMode(false)">
          <dxplm-label message="tes.common-tech-types-label" text="공통기술유형" />
        </dxplm-button>
      </div>
    </div>
    <div class="roadmap-toolbar">
      <!-- tool 그룹 -->
      <ul class="roadmap-toolbar-lists tool">
        <li v-for="(item, index) in toolItems" :key="index" :class="[
          'roadmap-toolbar-list',
          { active: activeIndexes.includes(index) },
        ]">
          <dxplm-icon-button type="line" :icon="item.icon" @click="handleClick(index, item.handler)" />
          <dxplm-tooltip hover left>{{ item.label }}</dxplm-tooltip>
        </li>
      </ul>
      <ul class="roadmap-toolbar-lists">
        <!-- today 버튼 -->
        <li class="roadmap-toolbar-list today">
          <dxplm-icon-button type="line" icon="target" @click="moveToToday" />
          <dxplm-tooltip hover left><dxplm-label message="cmm.en-today-button" text="Today" /></dxplm-tooltip>
        </li>

        <!-- 월/분기 버튼 -->
        <li :class="[
          'roadmap-toolbar-list',
          {
            month: viewMode === viewModes[0],
            quarter: viewMode === viewModes[1],
          },
        ]">
          <dxplm-icon-button type="line" icon="calendar" @click="changeViewMode()" />
          <dxplm-tooltip hover left>{{
            viewMode === viewModes[0] ? msg('tes.month-view-label', '월 보기') : msg('gpm.quarterly-view-label', '분기 보기')
            }}</dxplm-tooltip>
        </li>
      </ul>

      <!-- zoom 그룹 -->
      <ul class="roadmap-toolbar-lists zoom">
        <li v-for="(item, index) in zoomItems" :key="index" class="roadmap-toolbar-list">
          <dxplm-icon-button type="line" :icon="item.icon" @click="handleZoom(item.action)" />
          <dxplm-tooltip hover left>{{ item.label }}</dxplm-tooltip>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, toRaw, watch, onBeforeMount, inject } from "vue";
import ErmmVisTimeline from "./ErmmVisTimeline.vue";
import { useMasterdata } from "@/modules/tes/ermm/composables/useMasterdata.ts";
import { useTimelineStore } from "../store/timeline.store";

const viewModes = ["QUARTER", "MONTH"];
const props = defineProps({
  itemArr: { type: Array, default: () => [] },
  groupArr: { type: Array, default: () => [] },
  hideEmptyGroups: { type: Boolean, default: false },
  // allItems: { type: Array, default: () => [] },
  // groups: { type: Array, default: () => [] },
});

// vis-timeline 옵션 설정
const options = ref({
  orientation: "top",
  horizontalScroll: true,
  verticalScroll: true,
});

const allItems = ref([]);
const groups = ref([]);
const store = useTimelineStore();

const emit = defineEmits(["open-detail-slide", "changedLoadmapType", 'roadmap-create']);
const { loadedMasterdata, getMasterdatas, getTechClassificationName } = useMasterdata();

onBeforeMount(async () => {
  if (!loadedMasterdata.value) await getMasterdatas();
});

watch(
  () => props.groupArr,
  (newVal) => {
    groups.value = newVal;
  },
  { immediate: true },
);

watch(
  () => props.itemArr,
  (newVal) => {
    const newItems = newVal?.map((item) => ({
      ...item,
      technologyClassLv1Name: getTechClassificationName(item.technologyClassLv1Id),
      technologyClassLv2Name: getTechClassificationName(item.technologyClassLv2Id),
      technologyClassLv3Name: getTechClassificationName(item.technologyClassLv3Id),
    }));
    allItems.value = newItems ? structuredClone(toRaw(newItems)) : [];
  },
  { immediate: true },
);

const viewMode = ref(viewModes[0]);
const timelineRef = ref(null);
const msg = inject("$msg");
const flag = ref(0); //로드맵Tree 우측 3단버튼(?)
const statusPlan = ref(false); //과제계획 수립현황 선택여부
const statusExec = ref(false); //과제실행 현황조회 선택여부
const statusNBiz = ref(false); //최적개발 Site 선정협의 선택여부
const activeIndexes = ref([0]);
function toggleActive(index) {
  if (index === 0) return;
  if (activeIndexes.value.includes(index)) {
    activeIndexes.value = activeIndexes.value.filter((i) => i !== index);
  } else {
    activeIndexes.value.push(index);
  }
}

function showOrgTree() {
  console.log("view Ogrganization Tree");
}

function showStatusEstablishing() {
  statusPlan.value = !statusPlan.value;

  if (statusPlan.value) {
    statusNBiz.value = false;
    activeIndexes.value = activeIndexes.value.filter((i) => i !== 4);
  } else {
    statusExec.value = false;
    activeIndexes.value = activeIndexes.value.filter((i) => i !== 2);
  }

  console.log("Project Plan Establishing Status");
}

function viewPjt() {
  statusExec.value = !statusExec.value;
  if (statusExec.value) {
    if (!statusPlan.value) {
      statusPlan.value = true;
      if (!activeIndexes.value.includes(1)) {
        activeIndexes.value.push(1);
      }
    }
    statusNBiz.value = false;
    activeIndexes.value = activeIndexes.value.filter((i) => i !== 4);
  }

  console.log("Project Execution Status");
}

function reviewCross() {
  console.log("Cross BU Duplicate Technology Review");
}

function optimalDevSite() {
  statusNBiz.value = !statusNBiz.value;
  if (statusNBiz.value) {
    statusPlan.value = false;
    statusExec.value = false;
    activeIndexes.value = activeIndexes.value.filter((i) => i !== 1 && i !== 2);
  }

  console.log("Optimal Development Site Negotiation");
}

function saveSnapshot() {
  console.log("Snapshot");
}

function handleClick(index, handler) {
  toggleActive(index);
  if (handler) handler();
}

const toolItems = computed(() => [
  { icon: "organization_tree", label: msg('cmm.show-organization-button', '조직 보이기'), handler: showOrgTree },
  {
    icon: "monitor_screen",
    label: msg('tes.status-establishing-pjt-plan-button', '과제계획 수립현황'),
    handler: showStatusEstablishing,
  },
  { icon: "file_search", label: msg('tes.view-pjt-execution-status-button', '과제실행 현황조회'), handler: viewPjt },
  { icon: "tools", label: msg('tes.review-cross-bu-tech-button', 'Cross BU 중복기술 검토'), handler: reviewCross },
  {
    icon: "document_badge",
    label: msg('tes.optimal-dev-site-negotiation-screentitle', '최적 개발 Site 선정 협의'),
    handler: optimalDevSite,
  },
  { icon: "camera_snapshot", label: "Snapshot", handler: saveSnapshot },
  { icon: "arrow_expand", label: msg('tes.big-screen-mode-button', '대화면 모드') },
]);

const zoomItems = computed(() => [
  { icon: "roadmap_plus", label: msg('tes.en-zoom-in-button', 'Zoom in'), action: "zoomIn" },
  { icon: "roadmap_minus", label: msg('tes.en-zoom-out-button', 'Zoom out'), action: "zoomOut" },
]);

const zoomState = ref({ canZoomIn: true, canZoomOut: true });
const onZoomStateChange = (state) => {
  zoomState.value = state;
};

const onDetailView = (data) => {
  emit("open-detail-slide", data);
};

const onRoadmapCreate = (id) => {
  emit("roadmap-create", id);
};

const moveToToday = () => {
  const timeline = timelineRef.value?.timeline;

  if (timeline) {
    timeline.moveTo(new Date());
  }
};

// const moveToItem = (itemId) => {
//   const timeline = timelineRef.value?.timeline;
//   if (timeline) {
//     // 기본 이동 (애니메이션 포함)
//     timeline.focus(itemId);
//   }
// };

const zoomPercentage = 0.2;
const handleZoom = (action) => {
  const timeline = timelineRef.value?.timeline;
  if (!timeline) return;

  if (action === "zoomIn") {
    timeline.zoomIn(zoomPercentage);
  } else if (action === "zoomOut") {
    timeline.zoomOut(zoomPercentage);
  }
};

const changeViewMode = () => {
  const modeIdx = (viewModes.indexOf(viewMode.value) + 1) % 2;
  viewMode.value = viewModes[modeIdx | 0];
};

const changeItemMode = (isReload = false) => {
  if (!isReload) {
    flag.value = ++flag.value % 3;
    const roadmapType = ["PRM", "TRM", "CMM"][flag.value % 3];
    store.roadmapType = roadmapType;
    emit("changedLoadmapType", { isMounted: true });
    store.selectedRoadId = null; // 등록기능은 초기화
    emit("roadmap-create", null); // 등록기능은 초기화
  }
};

const toggleAllGroups = (show) => {
  timelineRef.value?.toggleAllGroups(show);
};

defineExpose({
  timelineRef,
  // moveToItem,
});
</script>
<style scoped lang="scss">
.roadmap-wrapper {
  height: 100%;
  width: 100%;
  /* vis-timeline 중첩 그룹(Nesting Group) 초기 높이 찌그러짐 방지 */
  :deep(.vis-label.vis-nesting-group) {
    display: flex;
    align-items: center;
    min-height: 52px;
  }
}
</style>
