<!-- Timeline.vue
onMounted의 timeline.value.on("itemover", async (eventProps) => { 부분에 처리에서
선택한 item의 하위가 존재하면 (trmCount > 0) axios이용 data-fetch를 수행하여 itemsDS에 추가하고 click event등으로 동작하도록 하고 싶은데,
현재 문제점은 마우스 hover시 계속 이 구문이 실행 되면서 data-fetch가 무한으로 실행되는 문제가 있어!, 해결책을 알려줘 -->
<template>
  <div class="roadmap-wrapper">
    <div class="dxplm-vis-timeline-wrapper">
      <div ref="timelineRef" class="dxplm-vis-timeline roadmap"></div>
      <!-- Context Menu Component -->
      <VisContextMenu
        ref="contextMenuRef"
        :show="contextMenu.show"
        :top="contextMenu.top"
        :left="contextMenu.left"
        :items="contextMenu.items"
        :data="contextMenu.data"
      />
      <!-- 팝업 -->
      <ItemInfoPopup
        v-if="isShowInfoModal"
        ref="infoPopupRef"
        :show="isShowInfoModal"
        :item-data="selectedItemData"
        :top="popupPosition.top"
        :left="popupPosition.left"
        :view-status="viewStatus"
        @open-detail="onOpenDetailPopup"
        @update:show="isShowInfoModal = $event"
      />
    </div>
  </div>
</template>
<script setup>
import {
  defineExpose,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  render,
  shallowRef,
  toRaw,
  markRaw,
  watch,
  inject,
} from "vue";
import { useI18n } from "@/modules/core/composables/useI18n.js";
import { DataSet, Timeline } from "vis-timeline/standalone";
import moment from "moment";
import TimelineArrows from "./visTimelineArrows.js";
import ItemInfoPopup from "./ItemInfoPopup.vue";
import VisContextMenu from "./VisContextMenu.vue";
import TimelineGroup from "./TimelineGroup.vue";
import TimelineItem from "./TimelineItem.vue";
import { useDdStore } from "dxplm-component";
import { toPascal, perfLog } from "../utils/dataTransformaer";
import { useTimelineStore } from "@/modules/tes/ermm/store/timeline.store";
const ddStore = useDdStore();
const { locale } = useI18n();
const $msg = inject("$msg");
const store = useTimelineStore();
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
const events = [
  "contextmenu",
  "click",
  "select",
  "rangechange",
  "rangechanged",
  "changed",
  "itemover",
  "itemout",
  "open-detail-slide",
  "zoom-state-change",
];
const emit = defineEmits([
  "contextmenu",
  "click",
  "select",
  "rangechange",
  "rangechanged",
  "changed",
  "itemover",
  "itemout",
  "open-detail-slide",
  "zoom-state-change",
  "roadmap-create",
]);
const internalViewStatus = reactive({
  statusPlan: false,
  statusExec: false,
  statusNBiz: false,
});
watch(
  () => props.viewStatus,
  (newVal) => {
    Object.assign(internalViewStatus, newVal);
  },
  { deep: true, immediate: true },
);
const changeInfoText = $msg('cmm.change-info-button', '변경정보');
const itemMargin = 3;
const visibleGroups = ref(new Set());
const getSubGroupIds = (groupId) => {
  const allSubGroupIds = new Set();
  const queue = [groupId];
  const groupMap = new Map(props.groups.map((g) => [g.id, g]));
  console.log("groupMap:", groupMap);
  while (queue.length > 0) {
    const currentGroupId = queue.shift();
    allSubGroupIds.add(currentGroupId);
    const currentGroup = groupMap.get(currentGroupId);
    if (currentGroup && currentGroup.nestedGroups) {
      currentGroup.nestedGroups.forEach((childId) => queue.push(childId));
    }
  }
  return allSubGroupIds;
};
const toggleGroupVisibility = (groupId, isChecked) => {
  const groupIdsToToggle = getSubGroupIds(groupId);
  groupIdsToToggle.forEach((itemId) => {
    if (isChecked) {
      visibleGroups.value.add(itemId);
    } else {
      visibleGroups.value.delete(itemId);
    }
  });
  //다시 렌더링
  reloadGroups(props.groups, false);
};
const historyVisibility = (groupId, onHistory) => {
  console.log("historyVisibility ::", onHistory);
};
const initializeVisibleGroups = (targetGroups) => {
  const g = targetGroups || props.groups;
  if (g && g.length > 0) {
    visibleGroups.value.clear();
    g.forEach((item) => visibleGroups.value.add(item.id));
  }
};
// 1일 = 24시간 * 60분 * 60초 * 1000밀리초
const oneDay = 1000 * 60 * 60 * 24;
const oneYear = oneDay * 365;
const monthFormat = new Map([
  ["ko", "M월"],
  ["en", "MMM"],
  ["zh", "M月"],
]);
const yearFormat = new Map([
  ["ko", "YYYY년"],
  ["en", "YYYY"],
  ["zh", "YYYY年"],
]);
const monthOption = {
  // zoomMin / zoomMax 는 화면에 한번에 보여지는 양 조절
  // 1. zoomMin (최소 줌 구간 = 가장 크게 확대했을 때)
  zoomMin: oneYear * 1,
  // 2. zoomMax (최대 줌 구간 = 가장 작게 축소했을 때)
  zoomMax: oneYear * 4,
  // (선택사항) 줌할 때 마우스 휠 감도 조절 (기본값: 1)
  // zoomSpeed: 1,// 2. Axis(축) 눈금 설정 (시각적인 눈금 제한)
  timeAxis: {
    scale: "month", // 줌을 당겨도 '일(day)' 단위가 나오지 않고 '월'만 유지됨
    step: 1, // 1. 1개월 단위로만 선을 그음, 3. 3개원 단위(분기)로 처리
  },
};
const quarterOption = {
  // zoomMin / zoomMax 는 화면에 한번에 보여지는 양 조절
  // 1. zoomMin (최소 줌 구간 = 가장 크게 확대했을 때)
  zoomMin: oneYear * 2,
  // 2. zoomMax (최대 줌 구간 = 가장 작게 축소했을 때)
  zoomMax: oneYear * 6,
  // (선택사항) 줌할 때 마우스 휠 감도 조절 (기본값: 1)
  // zoomSpeed: 1,// 2. Axis(축) 눈금 설정 (시각적인 눈금 제한)
  timeAxis: {
    scale: "month", // 줌을 당겨도 '일(day)' 단위가 나오지 않고 '월'만 유지됨
    step: 3, // 1. 1개월 단위로만 선을 그음, 3. 3개원 단위(분기)로 처리
  },
};
// vis-timeline 옵션 설정
const defaultOptions = {
  editable: true,
  start: "2024-01-01", // viewMode에 맞춰 설정
  end: "2027-12-31", // viewMode에 맞춰 설정
  // groupHeightMode: 'fixed',
  orientation: "top",
  horizontalScroll: true,
  verticalScroll: true,
  stack: true, // 아이템이 겹치지 않도록 설정 --> 기간이 우선
  stackSubgroups: true, // 서브그룹끼리도 쌓기 (기본값 true) --> 기간이 우선
  zoomKey: "ctrlKey",
  margin: { item: itemMargin }, // item 사이의 간격
  // showCurrentTime: false, // 현재시간 표시 - default: true
  locale: "en",
  // 그룹 내 아이템 정렬 로직 정의
  order: function (a, b) {
    return a.priority - b.priority; // ASC
  },
  groupOrder: "order", // 그룹 정렬
  format: {
    // format 내 function 사용은 minorLabels, majorLabels 단위로 처리
    minorLabels: function (date, scale, step) {
      if (scale === "year") {
        return moment(date).format("YYYY년");
      } else if (scale === "month") {
        // step이 1이면(1개월 단위) '월'로 표시 (확대 시)
        if (step === 1) {
          return moment(date).format(monthFormat.get(locale.value) || "MMM");
        }
        // 그 외(주로 3개월 단위)는 '분기'로 표시 (축소 시)
        else {
          return "Q" + moment(date).quarter();
        }
      } else {
        return moment(date).format("DD일");
      }
    },
    majorLabels: function (date, scale, step) {
      return moment(date).format(yearFormat.get(locale.value) || "YYYY");
    },
  },
  // editable: true, // 편집 기능 사용
  showTooltips: false, // 마우스오버 시 레이어팝업을 띄우기 위해 툴팁 사용 해제
  groupTemplate: (group) => {
    // console.count("🎨 GROUP_RENDER_COUNT");
    if (!group) {
      // vis-timeline이 내부적으로 높이 계산 등을 위해 빈 그룹으로 호출하는 경우가 있으므로 빈 div 반환
      return document.createElement("div");
    }
    const container = document.createElement("div");
    // 그룹의 높이를 강제로 52px로 설정 (vis-timeline은 컨텐츠 높이를 기준으로 row 높이를 계산함) <- class로 주니 적용 안됨;;;;
    container.style.minHeight = "52px"; // 수정 시 퍼블도 수정 필요
    container.style.display = "flex";
    container.style.alignItems = "center";
    render(
      h(TimelineGroup, {
        group,
        isChecked: visibleGroups.value.has(group.id),
        msg: changeInfoText,
        onToggle: (groupId, checked) => toggleGroupVisibility(groupId, checked),
        onHistorySwitchChange: (groupId, onHistory) =>
          historyVisibility(groupId, onHistory),
      }),
      container,
    );
    return container;
  },
  template: function (item, element, data) {
    // console.count("🎨 ITEM_RENDER_COUNT");
    const container = document.createElement("div");
    container.classList.add("vis-item-wrapper");
    //상태별 class 추가
    const itemStatusClass = getItemStatusClass(data.validityStatus);
    if (itemStatusClass) {
      container.classList.add(itemStatusClass);
    }
    // 비교용 class
    if (data.compareState) {
      const itemCompareStatusClass = getItemStatusClass(data.compareState);
      if (itemCompareStatusClass) {
        container.classList.add(itemCompareStatusClass);
      }
    }
    // Vue 컴포넌트 렌더링
    render(
      h(TimelineItem, {
        data,
        timelineState,
        viewStatus: internalViewStatus,
        onAddClick: (itemId) => {
          // TimelineItem의 addClick 이벤트로 연결
          visibleSubTechTree(
            !timelineState.activeArrowItemIds.includes(itemId),
            itemId,
          );
        },
      }),
      container,
    );
    return container;
  },
  onAdd: function (item, callback) {
    console.log("called onAdd :", item, callback);
  },
};
const timelineRef = ref(null);
const timeline = shallowRef(null);
const groups = null;
let timelineArrows = null;
const itemsDS = new DataSet([]);
let groupsDS = new DataSet([]);
const lazyLoadedProductIds = new Set();
const inFlightProductFetchMap = new Map();
// ref는 반응이 뭔가 느림...
// 반응형 상태 설정 : 이 객체의 내용이 바뀌면, Vue가 그걸 감지해서 화면(UI)도 자동으로 변경하도록 처리 (객체 타입만 사용 가능)
const timelineState = reactive({
  activeArrowItemIds: [],
});
//상세팝업
let hoverItem = null; // vis-hover class 추가 대상
const popupPosition = ref({ top: 0, left: 0 });
const isShowInfoModal = ref(false);
const infoPopupRef = ref(null);
const selectedItemData = ref(null);
//우클릭 메뉴
const contextMenuRef = ref(null);
const contextMenu = ref({
  show: false,
  top: 0,
  left: 0,
  items: [],
  data: null, // 클릭된 아이템 또는 그룹 데이터
});

const getCurrentTrmCount = (productItemId) => {
  const currTrm = itemsDS.get({
    filter: (item) => item.ptrmType !== "PRM" && item.itemLink === productItemId,
  });
  return Array.isArray(currTrm) ? currTrm.length : 0;
};

const fetchAndAppendTrmItems = async (productItemId) => {
  if (!productItemId || lazyLoadedProductIds.has(productItemId)) {
    return;
  }

  if (inFlightProductFetchMap.has(productItemId)) {
    return inFlightProductFetchMap.get(productItemId);
  }

  const selectedItem = itemsDS.get(productItemId);
  if (!selectedItem || selectedItem.ptrmType !== "PRM") {
    return;
  }

  const expectedTrmCount = Number(selectedItem.trmCount || 0);
  if (expectedTrmCount <= 0) {
    lazyLoadedProductIds.add(productItemId);
    return;
  }

  const currentTrmCount = getCurrentTrmCount(productItemId);
  if (currentTrmCount >= expectedTrmCount) {
    lazyLoadedProductIds.add(productItemId);
    return;
  }

  const fetchPromise = (async () => {
    const trmsOfItem = await store.getTrms({
      roadmapType: store.roadmapType === "PRM" ? "TRM" : "CMM",
      productItemIds: [productItemId],
    });

    const trmsResult = trmsOfItem.map((item) => ({
      ...item,
      itemLink: item.id,
    }));

    if (trmsResult.length > 0) {
      itemsDS.update(trmsResult);
      timeline.value?.setItems(itemsDS);
    }

    const updatedTrmCount = getCurrentTrmCount(productItemId);
    if (updatedTrmCount >= expectedTrmCount) {
      lazyLoadedProductIds.add(productItemId);
    }
  })()
    .catch((error) => {
      console.error("[Timeline] lazy TRM fetch failed", error);
    })
    .finally(() => {
      inFlightProductFetchMap.delete(productItemId);
    });

  inFlightProductFetchMap.set(productItemId, fetchPromise);
  return fetchPromise;
};


const resetRoadmapSelection = () => {
  store.selectedRoadId = null;
  emit("roadmap-create", null);
};

const handleTimelineItemClick = async (itemId) => {
  const clickedItem = itemsDS.get(itemId);
  if (!clickedItem) {
    resetRoadmapSelection();
    closeInfoPopup();
    return;
  }

  if (clickedItem.ptrmType === "PRM") {
    await fetchAndAppendTrmItems(clickedItem.id);
  }

  const roadId = clickedItem.roadId ?? selectedItemData.value?.roadId ?? null;
  store.selectedRoadId = roadId;
  emit("roadmap-create", roadId);
};

const handleTimelineClick = async (eventProps) => {
  if (eventProps.what !== "item") {
    resetRoadmapSelection();
    closeInfoPopup();
    return;
  }

  await handleTimelineItemClick(eventProps.item);
};
const getItemStatusClass = (itemStatus) => {
  let itemStausClass = null;
  //상태별 class 추가
  switch (itemStatus) {
    case "INWORK": // 작성중
    case "INPROGRESS": // 진행중
    case "WKDONE": // 작성완료
    case "APRVING": // 승인중
    case "RELEASED": // 완료됨
      itemStausClass = "status-valid-normal"; // 정상
      break;
    case "code004":
      itemStausClass = "status-valid-hold"; // Hold
      break;
    case "code005":
      itemStausClass = "status-valid-drop"; // Drop
      break;
    case "Change":
      itemStausClass = "status-compare-change"; // Change
      break;
    case "Add":
      itemStausClass = "status-compare-add"; // Add
      break;
    case "Delete":
      itemStausClass = "status-compare-delete"; // Delete
      break;
    default:
    // console.log("itemStatus :: ", itemStatus);
  }
  // switch (itemStatus) {
  //   case "sts01":
  //     itemStausClass = "status-progress"; // 작성중
  //     break;
  //   case "sts02":
  //     itemStausClass = "status-plan-pjt"; // 과제계획 수립
  //     break;
  //   case "sts03":
  //     itemStausClass = "status-not-plan-pjt"; // 과제계획 미수립
  //     break;
  //   case "sts04":
  //     itemStausClass = "status-new-project"; // 신사업
  //     break;
  //   default:
  //     itemStausClass = "status-progress"; // 작성중
  //     // console.log("itemStatus :: ", itemStatus);
  // }
  return itemStausClass;
};
const onItemHoverShowInfoPopup = async (eventProps) => {
  const { item, event } = eventProps;
  if (!item) return;
  const clicked = toRaw(props.allItems).find((i) => i.id === item);
  if (!clicked) {
    return;
  }
  // item에 vis-hover 추가
  const itemComponent = timeline.value.itemSet.items[item];
  if (itemComponent && itemComponent.dom) {
    const el = itemComponent.dom.box || itemComponent.dom.point;
    if (el) {
      el.classList.add("vis-hover");
      hoverItem = item;
    }
  }
  // 그룹 경로 계산
  const groupPath = [];
  const groupMap = new Map(toRaw(props.groups).map((g) => [g.id, g]));
  // group내 parent정보 사용
  let currentGroup = groupMap.get(clicked.group);
  while (currentGroup) {
    groupPath.unshift(currentGroup.content);
    currentGroup = groupMap.get(currentGroup.parent);
  }
  // // nestedGroups 정보를 이용하여 자식->부모 매핑 생성
  // const parentMap = new Map();
  // toRaw(props.groups).forEach((g) => {
  //   if (g.nestedGroups) {
  //     g.nestedGroups.forEach((childId) => parentMap.set(childId, g));
  //   }
  // });
  // let currentGroup = groupMap.get(clicked.group);
  // while (currentGroup && !currentGroup.isOrganization) {
  //   groupPath.unshift(currentGroup.content);
  //   currentGroup = parentMap.get(currentGroup.id);
  // }
  selectedItemData.value = {
    ...clicked,
    groupPath: groupPath,
  };
  // -----------------------------------------------
  // 팝업이 화면 밖으로 넘어가지 않도록 포인트 계산
  // -----------------------------------------------
  // 1. 팝업을 먼저 표시하여 DOM에 렌더링되도록 함
  isShowInfoModal.value = true;
  // 2. DOM 업데이트를 기다림
  await nextTick();
  // 3. 팝업과 아이템의 DOM 정보를 가져와 위치 계산
  const timelineItem = timeline.value.itemSet.items[item];
  if (timelineItem?.dom?.content && infoPopupRef.value?.$el) {
    // 아이템의 DOM 요소 위치를 기준으로 팝업 위치를 계산합니다.
    let itemRect = timelineItem.dom.content.getBoundingClientRect();
    // 아이템이 왼쪽 그룹 영역(vis-panel vis-left) 뒤로 숨겨진 경우, 보이는 영역(vis-panel vis-center) 기준으로 좌표 재계산
    const centerPanel = timelineRef.value?.querySelector(
      ".vis-panel.vis-center",
    );
    if (centerPanel) {
      const centerRect = centerPanel.getBoundingClientRect();
      if (itemRect.left < centerRect.left) {
        itemRect = {
          top: itemRect.top,
          bottom: itemRect.bottom,
          left: centerRect.left,
          right: itemRect.right,
          width: itemRect.width - (centerRect.left - itemRect.left),
          height: itemRect.height,
        };
      }
    }
    const popupRect = infoPopupRef.value?.$el.getBoundingClientRect(); // 대상의 실제 크기
    popupPosition.value = moveObjectPosition(itemRect, popupRect, itemMargin);
  } else {
    // DOM 요소를 찾지 못할 경우, 기존 방식대로 마우스 커서 위치를 기준으로 합니다.
    popupPosition.value = { top: event.pageY + 15, left: event.pageX + 15 };
  }
};
const onOpenDetailPopup = async (itemData) => {
  // 정보 팝업을 닫고, 상세 팝업 슬라이드 처리
  closeInfoPopup();
  emit("open-detail-slide", itemData);
};
// -----------------------------------------------
// 화면 밖으로 넘어가지 않도록 포인트 계산
// -----------------------------------------------
const moveObjectPosition = (basePoint, objectRect, verticalGapSize = 0) => {
  const windowWidth = window.innerWidth; // 뷰포트 넓이
  const windowHeight = window.innerHeight; // 뷰포트 높이
  let top = basePoint.bottom + window.scrollY + verticalGapSize;
  let left = basePoint.left + window.scrollX;
  // 팝업이 화면 하단을 벗어나는지 확인
  if (top + objectRect.height > window.scrollY + windowHeight) {
    // 벗어날 경우, 아이템 상단에 표시
    top = basePoint.top + window.scrollY - objectRect.height - verticalGapSize;
  }
  // 팝업이 화면 우측을 벗어나는지 확인
  if (left + objectRect.width > window.scrollX + windowWidth) {
    // 벗어날 경우, 좌측으로 이동
    left -= left + objectRect.width - (window.scrollX + windowWidth);
    if (left < 0) {
      left = 1;
    }
  }
  return {
    top: top,
    left: left,
  };
};
const handleContextMenu = async (eventProps) => {
  const { what, group, item, event } = eventProps;
  event.preventDefault(); // 기본 우클릭 메뉴 방지
  if (what === "group-label") {
    const clickedGroup = toRaw(props.groups).find((g) => g.id === group);
    contextMenu.value = {
      show: true,
      top: event.pageY,
      left: event.pageX,
      data: clickedGroup,
      items: [
        {
          label: `그룹 우클릭`,
          action: () => alert(`그룹 ID: ${clickedGroup.id}`),
        },
        { label: "그룹 우클릭2", action: () => alert("그룹 우클릭2") },
      ],
    };
  } else if (what === "item") {
    const clickedItem = toRaw(props.allItems).find((i) => i.id === item);
    contextMenu.value = {
      show: true,
      top: event.pageY,
      left: event.pageX,
      data: clickedItem,
      items: [
        {
          label: `아이템 우클릭`,
          action: () => alert(`아이템: ${clickedItem.id}`),
        },
        { label: "아이템 우클릭2", action: () => alert("아이템 우클릭2") },
      ],
    };
  }
  // else if (what === 'background') {
  // }
  else {
    contextMenu.value.show = false;
    return;
  }
  // 2. DOM 업데이트를 기다림
  await nextTick();
  const menuEl = contextMenuRef.value?.$el;
  if (menuEl) {
    const clickPoint = {
      top: event.pageY,
      bottom: event.pageY,
      left: event.pageX,
      right: event.pageX,
    };
    const menuRect = menuEl.getBoundingClientRect(); // 대상의 실제 크기
    const position = moveObjectPosition(clickPoint, menuRect);
    contextMenu.value = { ...contextMenu.value, ...position };
  }
};
const closeInfoPopup = () => {
  if (store.selectedRoadId) return;
  isShowInfoModal.value = false;
  contextMenu.value.show = false;
  // 호버 클래스 제거
  if (hoverItem) {
    const itemComponent = timeline.value.itemSet.items[hoverItem];
    if (itemComponent && itemComponent.dom) {
      const el = itemComponent.dom.box || itemComponent.dom.point;
      if (el) {
        el.classList.remove("vis-hover");
      }
    }
  }
  hoverItem = null;
  store.selectedRoadId = null;
};
const handleKeyDown = (event) => {
  if (event.key.toUpperCase() === "Escape".toUpperCase()) {
    store.selectedRoadId = null;
    emit("roadmap-create", null);
    closeInfoPopup();
  }
};
const handleClickOutside = (event) => {
  const infoPopupEl = infoPopupRef.value?.$el;
  if (infoPopupEl && !infoPopupEl.contains(event.target)) {
    closeInfoPopup();
  }
  const contextMenuEl = document.querySelector(".context-menu");
  if (
    contextMenu.value.show &&
    contextMenuEl &&
    !contextMenuEl.contains(event.target)
  ) {
    contextMenu.value.show = false;
  }
};
const visibleSubTechTree = (visible, itemId) => {
  //선택한 Item의 group의 showNested = true 로 변경
  const selectedItem = props.allItems.find((i) => i.id === itemId);
  if (selectedItem && groupsDS) {
    toggleNestedGroups(selectedItem.group, visible);
  }
  if (visible) {
    viewTimelineArrows(itemId);
  } else {
    removeTimeLineArrows(itemId);
  }
};
/**
 * 전체그룹 접기/펼치기
 * @param show
 */
const toggleAllGroups = (show) => {
  if (!groupsDS) return;
  const allGroups = groupsDS.get();
  const groupMap = new Map(allGroups.map((g) => [g.id, g]));
  const targetGroups = allGroups.filter((g) => g.isSubGroup === false);
  // show = true 일때 timelineState.activeArrowItemIds 에 있는 itemId로 item을 찾아서
  // 그 item의 group에 해당하는 그룹은 isSubGroup = true 인 것들도 펼쳐줌
  const activeGroupIds = new Set();
  if (
    show &&
    timelineState.activeArrowItemIds &&
    timelineState.activeArrowItemIds.length > 0
  ) {
    timelineState.activeArrowItemIds.forEach((itemId) => {
      const item = props.allItems.find((i) => i.id === itemId);
      if (item) {
        activeGroupIds.add(item.group);
      }
    });
  }
  const updatesMap = new Map();
  const addUpdate = (id, data) => {
    const existing = updatesMap.get(id) || { id };
    updatesMap.set(id, { ...existing, ...data });
  };
  const collectUpdates = (parentId, isShow) => {
    const parent = groupMap.get(parentId);
    if (!parent || !parent.nestedGroups) return;
    // isSubGroup이 true인 그룹은 하위 그룹 상태 변경 제외
    // 단, show=true이고 activeGroupIds에 포함된 경우는 예외
    if (parent.isSubGroup && !(isShow && activeGroupIds.has(parentId))) return;
    addUpdate(parentId, { showNested: isShow });
    parent.nestedGroups.forEach((childId) => {
      addUpdate(childId, { visible: isShow });
      if (isShow === false) {
        collectUpdates(childId, false);
      } else {
        // 펼칠 때 activeGroupIds에 포함된 그룹이면 재귀 호출
        if (activeGroupIds.has(childId)) {
          collectUpdates(childId, true);
        }
      }
    });
  };
  targetGroups.forEach((g) => collectUpdates(g.id, show));
  if (updatesMap.size > 0) {
    groupsDS.update(Array.from(updatesMap.values()));
  }
};
/**
 * 그룹 접기/펼치기 강제 처리 함수
 * {String|Number} parentId - 부모 그룹 ID
 * {Boolean} show - 보여줄지(true), 숨길지(false)
 */
const toggleNestedGroups = (parentId, show) => {
  // 1. 부모 그룹 데이터 가져오기
  const parent = groupsDS.get(parentId);
  if (!parent || !parent.nestedGroups) return;
  // 2. 부모의 showNested 상태 업데이트 (아이콘 변경용)
  groupsDS.update({ id: parentId, showNested: show });
  // 3. 자식 그룹들의 visible 속성을 강제로 변경
  const updates = parent.nestedGroups.map((childId) => {
    // 자식이 또 자식을 가질 수 있으므로 재귀적으로 처리
    // 만약 접는 거라면(show=false), 자식의 자식도 다 숨겨야 함
    if (show === false) {
      toggleNestedGroups(childId, show);
    }
    return { id: childId, visible: show };
  });
  // 4. 일괄 업데이트 (성능 최적화)
  groupsDS.update(updates);
};
const arrowPrefix = "arrow";
const makeSafeArrowId = (orgId) => {
  // ID에 공백이나 특수문자가 포함되어 있으면 CSS 선택자 오류가 발생할 수 있으므로 치환
  return String(orgId).replaceAll(/[^a-zA-Z0-9_-]/g, "_");
};
const viewTimelineArrows = (selectedId) => {
  if (!timelineArrows) {
    timelineArrows = new TimelineArrows(timeline.value, [], {
      color: "#039E00",
      strokeWidth: 2,
      followRelationships: true,
    });
  }
  if (selectedId) {
    const selectedItem = props.allItems.find((i) => i.id === selectedId);
    if (!timelineState.activeArrowItemIds.includes(selectedId)) {
      timelineState.activeArrowItemIds.push(selectedId);
    }
    if (selectedItem && selectedItem.itemLink) {
      const linkedItems = props.allItems.filter(
        (i) =>
          i.id !== selectedId &&
          i.itemLink &&
          i.itemLink === selectedItem.itemLink,
      );
      linkedItems.forEach((item, index) => {
        const safeSelectedId1 = makeSafeArrowId(selectedId);
        const safeSelectedId2 = makeSafeArrowId(item.id);
        timelineArrows.addArrow({
          id: `${arrowPrefix}_${safeSelectedId1}_${safeSelectedId2}_${index}`,
          id_item_1: selectedId,
          id_item_2: item.id,
          type: 2,
          direction: 0,
          align: "left",
        });
      });
    }
  }
};
const removeTimeLineArrows = (selectedId) => {
  if (timelineArrows) {
    if (selectedId) {
      timelineArrows.removeArrows(selectedId);
    } else {
      timelineArrows.removeArrowAll();
    }
  }
  if (selectedId) {
    const index = timelineState.activeArrowItemIds.indexOf(selectedId);
    if (index > -1) {
      timelineState.activeArrowItemIds.splice(index, 1);
    }
  } else {
    timelineState.activeArrowItemIds = [];
  }
};
const checkZoomLimits = () => {
  if (!timeline.value) return;
  const { start, end } = timeline.value.getWindow();
  const duration = end.valueOf() - start.valueOf();
  // 현재 뷰 모드에 따른 옵션(zoomMin, zoomMax) 가져오기
  const currentOpts = makeTimelineOptions(props.viewMode);
  const min = currentOpts.zoomMin;
  const max = currentOpts.zoomMax;
  // 부동소수점 오차 등을 고려하여 약간의 여유(buffer)를 둠 (예: 100ms)
  const isMaxZoomIn = duration <= min + 100;
  const isMaxZoomOut = duration >= max - 100;
  emit("zoom-state-change", {
    canZoomIn: !isMaxZoomIn,
    canZoomOut: !isMaxZoomOut,
  });
};
const makeTimelineOptions = (viewType) => {
  const targetOption = viewType === "MONTH" ? monthOption : quarterOption;
  const currentOptions = toRaw({
    ...defaultOptions,
    ...props.options,
    ...targetOption,
  });
  // 원본 함수 유지
  if (targetOption.groupTemplate) {
    currentOptions.groupTemplate = targetOption.groupTemplate;
  } else if (props.options.groupTemplate) {
    currentOptions.groupTemplate = props.options.groupTemplate;
  } else if (defaultOptions.groupTemplate) {
    currentOptions.groupTemplate = defaultOptions.groupTemplate;
  }
  if (targetOption.order) {
    currentOptions.order = targetOption.order;
  } else if (props.options.order) {
    currentOptions.order = props.options.order;
  } else if (defaultOptions.order) {
    currentOptions.order = defaultOptions.order;
  }
  //처음 시작일, 종료일 지정
  const centerDate = new Date();
  const range = props.viewMode === "MONTH" ? oneYear * 2 : oneYear * 3; // 3. 시작일과 종료일 계산 (기준일에서 앞뒤로 절반씩)
  const startDate = new Date(centerDate.getTime() - range);
  const endDate = new Date(centerDate.getTime() + range);
  currentOptions.start = startDate;
  currentOptions.end = endDate;
  return currentOptions;
};
const reloadGroups = (newGroups, initVisibleGroup = true) => {
  if (!newGroups) return;
  try {
    // 연결선 삭제
    removeTimeLineArrows();
    // [중요] 그룹 데이터 변경 시, 기존 아이템들이 없는 그룹을 참조하여 발생하는 무한 루프 방지
    // 그룹을 세팅하기 전에 아이템을 먼저 비워줍니다.
    timeline.value?.setItems(new DataSet([]));
    if (initVisibleGroup) {
      initializeVisibleGroups(newGroups);
      const rawGroups = toRaw(newGroups);
      const validIds = new Set(rawGroups.map((g) => String(g.id)));
      // 데이터 오염 방지: vis-timeline이 객체에 showNested 등을 설정하여 원본 데이터가 변경되었을 수 있음
      // 재진입 시 visibleGroups는 초기화되는데 데이터는 접힌 상태(showNested:false)로 남아있어 트리 깨짐 발생
      const sanitizedGroups = rawGroups.map((group) => {
        const g = { ...group };
        if (Array.isArray(g.nestedGroups)) {
          g.nestedGroups = g.nestedGroups
            .map((id) => String(id))
            .filter((id) => validIds.has(id));
          if (g.nestedGroups.length === 0) delete g.nestedGroups;
        }
        g.showNested = g.isTrm === undefined ? true : g.isTrm;
        return g;
      });
      const newGroupsDataSet = new DataSet(sanitizedGroups);
      if (timeline.value && typeof timeline.value.setGroups === "function") {
        timeline.value.setGroups(newGroupsDataSet);
      }
      groupsDS = newGroupsDataSet;
    }
  } catch (e) {
    console.error("[Timeline Error] setGroups failed", e);
  }
  // Groups가 설정된 후, 이 시점에서 아이템을 필터링하고 설정합니다.
  // reloadItems(props.allItems);
};
const reloadItems = (newAllItems) => {
  perfLog.start("DATA_RELOAD_AND_FILTER");
  if (!newAllItems || !newAllItems.length > 0) {
    if (timeline.value) {
      timeline.value.setItems(new DataSet([]));
    }
    perfLog.end("DATA_RELOAD_AND_FILTER");
    return;
  }
  const filtered = newAllItems.filter((i) => visibleGroups.value.has(i.group));
  const resFilterd = filtered.map((item) => ({
    ...item,
    itemStatusName: getDdName("TES.ROAD_STATUS", item.itemStatusCode),
  }));
  itemsDS.clear();
  itemsDS.add(toRaw(resFilterd));
  timeline.value?.setItems(itemsDS);
  perfLog.end("DATA_RELOAD_AND_FILTER");
};
/**
 * 데이터 갱신 및 전체 로딩 시간 측정
 */
const reloadData = async () => {
  if (!timeline.value) return;
  lazyLoadedProductIds.clear();
  inFlightProductFetchMap.clear();
  perfLog.start("TOTAL_LOAD");
  perfLog.start("DATA_PROCESS");
  const filteredGroups = getFilteredGroups(props.groups, props.allItems);
  const validGroupIds = new Set(filteredGroups.map((g) => String(g.id)));
  // 그룹 데이터 무결성 가공 (사라진 자식 ID 제거하여 무한 루프 차단)
  const sanitizedGroups = filteredGroups.map((g) => ({
    ...g,
    nestedGroups: g.nestedGroups?.filter((id) => validGroupIds.has(String(id))),
    showNested: g.isTrm ?? true,
  }));
  // 아이템 필터링 (현재 유효한 그룹에 속한 아이템만 추출)
  const rawItems = toRaw(props.allItems);
  const filteredItems = rawItems
    .filter((item) => validGroupIds.has(String(item.group)))
    .map((item) => ({
      ...item,
      itemStatusName: getDdName("TES.ROAD_STATUS", item.itemStatusCode),
    }));
  requestAnimationFrame(() => {
    groupsDS.clear();
    groupsDS.add(markRaw(sanitizedGroups));
    itemsDS.clear();
    itemsDS.add(markRaw(filteredItems));
    timeline.value?.setItems(itemsDS);
    // 연결선이 있다면 초기화
    removeTimeLineArrows();
    perfLog.end("DATA_PROCESS");
    // 브라우저 실제 렌더링 완료 시점 (TOTAL_LOAD 종료)
    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          perfLog.end("TOTAL_LOAD");
          console.log(
            `[TOTAL_LOAD] ${props.hideEmptyGroups ? "필터링 모드" : "전체 모드"} (${sanitizedGroups.length} groups) 렌더링 완료`,
          );
        });
      });
    });
  });
};
const onInitialDraw = () => {
  const visTimelineEl = timelineRef.value?.querySelector(".vis-timeline");
  if (visTimelineEl) {
    visTimelineEl.style.visibility = "visible";
  }
  const loadingScreen = document.querySelector(".vis-loading-screen");
  if (loadingScreen) {
    loadingScreen.remove();
  }
  // B. 중요: 리스너 제거 (계속 실행되지 않도록)
  timeline.value.off("redraw", onInitialDraw);
};
// 캡처링(true) 단계 처리 대상 이벤트
// 'click' 뿐만 아니라 'mousedown', 'mouseup'도 막아야 확실합니다.
const toggleHandlerEvents = [
  "click",
  "mousedown",
  "mouseup",
  "pointerdown",
  "pointerup",
];
// 이벤트 핸들러 함수를 변수로 분리 (나중에 removeEventListener 하기 위해)
const blockToggleHandler = (e) => {
  // 1. 클릭된 요소가 내가 막고 싶은 그룹(.vis-group-subgroup) 안에 있는지 확인
  const targetGroup = e.target.closest(".vis-group-subgroup");
  if (targetGroup) {
    // 2. 중요: 내부의 '체크박스'나 '스위치'를 클릭한 경우는 막지 않아야 한다면?
    // 혹시나 추가해둠
    const isInteractive =
      e.target.tagName === "INPUT" ||
      e.target.tagName === "BUTTON" ||
      e.target.closest(".n-switch"); // 사용중인 스위치 클래스
    if (!isInteractive) {
      // 빈 공간(배경)이라면: 모든 동작을 강력하게 차단합니다.
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }
};
// 공통코드 helper
const commCode = reactive(new Map());
const getDdName = (masterCode, code) => {
  const group = commCode.get(masterCode);
  if (!group) return "";
  const res = group?.find((item) => item.ddValue === code);
  if (!res) return "";
  const langCode = toPascal(locale.value) || "Ko";
  return res[`name${langCode}`];
};
/**
 * 아이템이 있는 그룹 + 자식이 있는 최상위 그룹 유지
 */
const getFilteredGroups = (allGroups, allItems) => {
  const rawGroups = toRaw(allGroups);
  const rawItems = toRaw(allItems);
  if (!props.hideEmptyGroups) return rawGroups;
  const groupMap = new Map(rawGroups.map(g => [String(g.id), g]));
  // 노출해야 할 그룹 ID를 담을 Set (중복 제거)
  const visibleIds = new Set();
  // 아이템이 속한 그룹부터 최상위까지 역추적
  const collectParentPath = (groupId) => {
    const idStr = String(groupId);
    if (visibleIds.has(idStr)) return; // 이미 추가된 경로면 중단
    const group = groupMap.get(idStr);
    if (!group) return;
    visibleIds.add(idStr); // 현재 그룹 추가
    // 부모가 있다면 부모도 추적 (상위 계층으로 재귀 호출)
    const parentId = group.parent || group.nestedInGroup;
    if (parentId) {
      collectParentPath(parentId);
    }
  };
  // 모든 아이템의 소속 그룹을 시작점으로 경로 수집
  rawItems.forEach((item) => {
    if (item.group) collectParentPath(item.group);
  });
  // 아이템은 없지만 자식이 있는 최상위 부모(Root) 유지 여부
  // 기둥 역할을 위해 level 1 그룹 중 자식이 있는 경우 강제 포함
  rawGroups.forEach((group) => {
    const isRoot = group.level === 1 || !group.parent;
    const hasChildren = group.nestedGroups && group.nestedGroups.length > 0;
    if (isRoot && hasChildren) {
      visibleIds.add(String(group.id));
    }
  });
  // 수집된 ID에 해당하는 그룹만 필터링하여 반환
  return rawGroups.filter(g => visibleIds.has(String(g.id)));
};
onMounted(async () => {
  perfLog.start("TOTAL_ON_MOUNTED"); // [LOG 시작: 전체 마운트]
  // 초기 visibleGroups 설정 (이미 props에 데이터가 있는 경우 대응)
  initializeVisibleGroups();
  // 공통코드 로드 시간 측정
  perfLog.start("FETCH_MASTER_DATA");
  // 공통코드 Map 등록
  const commData = await ddStore.fetchActiveDdList("TES.ROAD_STATUS");
  commCode.set("TES.ROAD_STATUS", commData);
  perfLog.end("FETCH_MASTER_DATA");
  const currentOptions = makeTimelineOptions(props.viewMode);
  // 그룹/아이템 DataSet 생성 부하 측정
  perfLog.start("CREATE_DATASETS");
  // groups = new DataSet(props.groups ? toRaw(props.groups) : []);
  // 데이터 오염 방지: vis-timeline이 객체에 showNested 등을 설정하여 원본 데이터가 변경되었을 수 있음
  const sanitizedGroups = (props.groups ? toRaw(props.groups) : []).map(
    (g) => ({
      ...g,
      showNested: g.isTrm === undefined ? true : g.isTrm,
    }),
  );
  groupsDS.add(sanitizedGroups);
  // 초기 아이템 설정
  const initialFilteredItems = props.allItems.filter((i) =>
    visibleGroups.value.has(i.group),
  );
  // const itemsDataSet = new DataSet(toRaw(initialFilteredItems));
  perfLog.end("CREATE_DATASETS");
  // [중요] 타임라인 인스턴스화 및 첫 그리기 부하
  perfLog.start("TIMELINE_INSTANCE_CREATION");
  timeline.value = new Timeline(
    timelineRef.value,
    itemsDS,
    groupsDS,
    currentOptions,
  );
  perfLog.end("TIMELINE_INSTANCE_CREATION");
  // Timeline 생성 후 DOM 요소에 이벤트 리스너 등록
  const leftPanel = timelineRef.value?.querySelector(".vis-panel.vis-left");
  if (leftPanel) {
    toggleHandlerEvents.forEach((evt) => {
      leftPanel.addEventListener(evt, blockToggleHandler, true);
    });
  }
  // event 처리하기
  events.forEach((name) => {
    timeline.value.on(name, (properties) => {
      emit(name, properties);
    });
  });
  // 컨텍스트 메뉴 이벤트 핸들링
  timeline.value.on("contextmenu", handleContextMenu);
  // 타임라인 클릭 시 팝업 닫기
  timeline.value.on("click", handleTimelineClick);
  // 타임라인 뷰가 변경(확대/축소/스크롤)될 때 팝업 닫기
  timeline.value.on("rangechange", () => {
    closeInfoPopup();
  });
  // 수평 스크롤 감지
  timeline.value.on("rangechanged", () => {
    closeInfoPopup();
    checkZoomLimits();
  });
  // 데이터가 변경(아이템 이동, 추가, 삭제 등)될 때 팝업 닫기
  timeline.value.on("changed", () => {
    closeInfoPopup();
  });
  // 툴팁 이벤트 핸들링
  timeline.value.on("itemover", async (eventProps) => {
    if (contextMenu.value.show) {
      return;
    }

    if (props.useItemTooltip) {
      closeInfoPopup();
      onItemHoverShowInfoPopup(eventProps);
    }
  });
  timeline.value.on("itemout", () => {
    closeInfoPopup();
  });
  // timeline.value.on("redraw", onInitialDraw);
  timeline.value.on("redraw", function onFirstRedraw() {
    const visTimelineEl = timelineRef.value?.querySelector(".vis-timeline");
    if (visTimelineEl) {
      visTimelineEl.style.visibility = "visible";
    }
    const loadingScreen = document.querySelector(".vis-loading-screen");
    if (loadingScreen) {
      loadingScreen.remove();
    }
    perfLog.end("TOTAL_ON_MOUNTED"); // [LOG 종료: 전체 마운트]
    timeline.value.off("redraw", onFirstRedraw); // 한 번만 측정
  });
  // 외부 클릭 감지를 위한 이벤트 리스너 추가
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("mousedown", handleClickOutside);
  // 타임라인 생성 후 화면 표시 처리 및 로딩 스크린 제거
  setTimeout(() => {
    // perfLog.start("LATE_REDRAW");
    // timeline.value?.redraw();
    // perfLog.end("LATE_REDRAW");
    // onInitialDraw();
    if (props.allItems.length > 0 || props.groups.length > 0) {
      reloadData();
    }
  }, 500);
});
onBeforeUnmount(() => {
  lazyLoadedProductIds.clear();
  inFlightProductFetchMap.clear();
  const leftPanel = timelineRef.value?.querySelector(".vis-panel.vis-left");
  if (leftPanel) {
    toggleHandlerEvents.forEach((evt) => {
      leftPanel?.removeEventListener(evt, blockToggleHandler, true);
    });
  }
  if (timeline.value) {
    timeline.value.destroy();
    timeline.value = null;
  }
  // 컴포넌트 파괴 시 이벤트 리스너 제거
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("mousedown", handleClickOutside);
});
/* watch **************************************/
watch(
  () => props.options,
  (newOptions) => {
    const currentOptions = makeTimelineOptions();
    const optionsToSet = toRaw({ ...currentOptions, ...newOptions });
    // groupTemplate 함수가 있다면 원본을 유지
    if (newOptions.groupTemplate) {
      optionsToSet.groupTemplate = newOptions.groupTemplate;
    }
    timeline.value?.setOptions(optionsToSet);
  },
  { deep: true },
);
// watch(
//   [() => props.allItems,() => props.hideEmptyGroups],
//   ([newItems, hideMode]) => {
//     perfLog.start("FILTER_GROUPS_BY_ITEMS");
//     const filteredGroups = getFilteredGroups(props.groups, newItems);
//     reloadGroups(filteredGroups);
//     reloadItems(newItems);
//     // reloadData();
//     perfLog.end("FILTER_GROUPS_BY_ITEMS");
//   },
//   { deep: true },
// );
watch(
  [() => props.allItems, () => props.groups, () => props.hideEmptyGroups],
  () => {
    reloadData();
  },
  { deep: true, immediate: false },
);
watch(
  () => props.groups,
  (newGroups) => {
    reloadGroups(newGroups);
  },
  { deep: true },
);
watch(
  () => props.viewMode,
  (newVal) => {
    timeline.value?.setOptions(makeTimelineOptions(newVal));
  },
);
watch(locale, () => {
  if (timeline.value) {
    const options = makeTimelineOptions(props.viewMode);
    // locale 변경 시에는 현재 보고 있는 시점을 유지하기 위해 start, end 제거
    delete options.start;
    delete options.end;
    timeline.value.setOptions(options);
  }
});
const setWindow = (start, end, options, callback) => {
  timeline.value?.setWindow(start, end, options, callback);
};
/* Expose **************************************/
defineExpose({
  get groups() {
    return groupsDS;
  },
  get timeline() {
    return timeline.value;
  },
  setWindow,
  toggleAllGroups,
});
</script>
<style scoped lang="scss">
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
  line-height: 52px; /* 텍스트 수직 정렬 */
}
</style>
