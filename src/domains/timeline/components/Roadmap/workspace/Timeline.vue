<template>
  <div class="roadmap-wrapper">
    <div class="dxplm-vis-timeline-wrapper">
      <div ref="timelineRef" class="dxplm-vis-timeline roadmap" @click="onContainerClick"></div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, toRaw, nextTick } from "vue";
import { useDdStore } from "dxplm-component";
import { Timeline, DataSet } from "vis-timeline/standalone";
import { itemTemplate, groupTemplate } from "./templates.js";
// import { useTimelineEvents } from "./useTimelineEventsOld.js";
import { useTimelineStore } from "@/modules/tes/ermm/store/timeline.store";
import { toPascal, perfLog } from "@/modules/tes/ermm/utils/dataTransformaer";
import useTimelineOption from "./useTimelineOption.js";
import { useTimeline } from "./useTimeline";

const store = useTimelineStore();

const timelineRef = ref(null);
let timelineInstance = null;
// const itemsDS = new DataSet([]);
// const groupsDS = new DataSet([]);
// const timelineState = reactive({ activeArrowItemIds: [] });
const ddStore = useDdStore();
const itemMargin = 3;

const props = defineProps({
  allItems: { type: Array, default: () => [] },
  options: { type: Object, default: () => ({}) },
  groups: { type: Array, default: () => [] },
  currentTimeColor: { type: String, default: "#1E90FF" },
  viewMode: { type: String, default: "QUARTER" },
  hideEmptyGroups: { type: Boolean, default: false },
  viewStatus: {
    type: Object,
    default: () => ({
      statusPlan: false,
      statusExec: false,
      statusNBiz: false,
    }),
  },
  useItemTooltip: { type: Boolean, default: true },
});
// const emit = defineEmits(["add-click", "history-switch-change", "item-select"]);
const emit = defineEmits(['item-select', 'zoom-state-change', 'open-detail-slide']);

// 공통코드 Helper
const commCode = reactive(new Map());
const getDdName = (masterCode, code) => {
  const group = commCode.get(masterCode);
  if (!group) return "";
  const res = group?.find((item) => item.ddValue === code);
  if (!res) return "";
  const langCode = "Ko"; // 혹은 locale에 따른 가공
  return res[`name${langCode}`];
};

const { makeTimelineOptions } = useTimelineOption({ itemMargin, options: props.options, viewMode: props.viewMode });
const {
  itemsDS,
  groupsDS,
  timelineState,
  setInstance,
  reloadData,
  onContainerClick,
  toggleAllGroups,
  handleItemOver,
} = useTimeline(props, emit, store, getDdName);
// const { handleGlobalClick, handleItemOver } = useTimelineEvents(
//   itemsDS,
//   timelineState,
//   emit,
//   store,
// );

// const onTimelineClick = (e) => handleGlobalClick(e, props.allItems);

const notUsedReloadData = (items) => {
  if (!items || !timelineInstance) return;

  perfLog.start("TOTAL_LOAD");
  perfLog.start("DATA_PROCESS");

  const processed = items.map((item) => {
    const raw = toRaw(item);
    return {
      ...raw,
      id: String(raw.id),
      group: String(raw.groupId || raw.group), // 그룹 ID 매핑 확인
      start: new Date(raw.start || raw.planStartDt), // 날짜 객체화 필수
      end: raw.end || raw.planEndDt ? new Date(raw.end || raw.planEndDt) : null,
      content: "", // 템플릿 사용 시 비움 (template 함수에서 처리)
    };
  });

  itemsDS.clear();
  itemsDS.add(processed);

  perfLog.end("DATA_PROCESS");

  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        perfLog.end("TOTAL_LOAD");
        console.log(
          `[TOTAL_LOAD] ${props.hideEmptyGroups ? "필터링 모드" : "전체 모드"} 렌더링 완료`,
        );
      });
    });
  });
  // 데이터 로드 후 화면 범위 자동 조절
  // timelineInstance.fit();
};

/** [기존 기능 복원] 그룹 가공 및 로드 */
const reloadGroups = (groups) => {
  if (!groups || !timelineInstance) return;

  const processed = groups.map((group) => ({
    ...toRaw(group),
    id: String(group.id),
    content: group.content || group.name,
  }));

  groupsDS.clear();
  groupsDS.add(processed);
};

watch(() => props.groups, (newVal) => reloadGroups(newVal), { deep: true });
watch(() => props.allItems, (newVal) => reloadData(newVal), { deep: true });
//==========================

onMounted(async () => {
  if (!timelineRef.value) return;
  perfLog.start("TOTAL_ON_MOUNTED"); // [LOG 시작: 전체 마운트]
  perfLog.start("FETCH_MASTER_DATA"); // 공통코드 로드 시간 측정

  // 공통코드 Map 등록
  const commData = await ddStore.fetchActiveDdList("TES.ROAD_STATUS");
  commCode.set("TES.ROAD_STATUS", commData);
  perfLog.end("FETCH_MASTER_DATA");

  const currentOptions = makeTimelineOptions(props.viewMode);
  // 그룹/아이템 DataSet 생성 부하 측정
  perfLog.start("CREATE_DATASETS");

  const options = {
    ...currentOptions,
    template: (item, element, data) => {
      const div = document.createElement("div");
      div.innerHTML = itemTemplate(data, timelineState);
      return div;
    },
    groupTemplate: (group) => {
      const div = document.createElement("div");
      const isChecked = true; // 실제 상태 연동 필요
      div.classList.add('vis-group-custom');
      div.innerHTML = groupTemplate(group, isChecked, props.msg);
      return div;
    },
  };

  perfLog.start("TIMELINE_INSTANCE_CREATION");
  timelineInstance = new Timeline(
    timelineRef.value,
    itemsDS,
    groupsDS,
    options,
  );
  setInstance(timelineInstance);
  perfLog.end("TIMELINE_INSTANCE_CREATION");

  // 초기 데이터 로드
  if (props.allItems?.length) reloadData(props.allItems);
  if (props.groups?.length) reloadGroups(props.groups);

  // 이벤트 바인딩
  timelineInstance.on('select', (properties) => {
    const selectedId = properties.items[0];
    const item = itemsDS.get(selectedId);
    if (item) emit('open-detail-slide', item);
  });

  // 이벤트 연결
  timelineInstance.on("itemover", (eventProps) =>
    handleItemOver(eventProps.item, store, getDdName),
  );
});

// 데이터 변경 감지 시 redraw 효율화
// watch(
//   () => props.allItems,
//   (newVal) => {
//     itemsDS.clear();
//     const items = toRaw(newVal);
//     itemsDS.add(items);
//     timelineInstance?.setItems(itemsDS);
//     // if (timelineInstance && itemsDS.length > 0) {
//     //   console.log("items2:", rawItems);
//     //   timelineInstance.fit();
//     // }
//   },
//   { deep: true, immediate: true },
// );

onBeforeUnmount(() => timelineInstance?.destroy());

defineExpose({
  toggleAllGroups,
});
</script>

<style lang="scss">
/* custom-switch 및 기존 vis-item 스타일 통합 */
.custom-switch {
  /* 아까 알려드린 CSS 스위치 스타일 */
}

.vis-item-add.active {
  background: #039e00;
  color: white;
}

/* 기본적으로 생기는 중첩 그룹 스타일 초기화 */
:deep(.vis-group-level-unknown-but-gte1) {
  border: none;
}

/* vis-item-content의 위치 보정 기능을 강제로 끔 */
:deep(.vis-item-content) {
  transform: none !important;
}

/* 서브그룹인 경우 하위그룹 표시 숨김 */
:deep(.vis-label.vis-group-subgroup) {
  cursor: default !important;

  .vis-inner::before {
    display: none !important;
  }
}

/* Vue 2: ::v-deep, Vue 3: :deep() */
:deep(.vis-timeline .vis-label.vis-nested-group .vis-inner) {
  /* 하위 그룹이 있는 그룹의 높이가 62px라고 하셨으므로,
     최소 높이를 그에 맞춰줍니다. */
  min-height: 52px;

  /* 텍스트 수직 정렬을 위해 필요할 수 있습니다 */
  display: flex;
  align-items: center;
}

/* 혹은 그룹 전체 행의 높이를 고정하려면 아래 클래스를 타겟팅하세요 */
:deep(.vis-panel.vis-left .vis-label) {
  min-height: 52px !important;
  line-height: 52px;
  /* 텍스트 수직 정렬 */
}
</style>
