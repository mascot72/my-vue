//기록하기 useTimeline.ts
import { reactive, toRaw, nextTick } from "vue";
// import { useTimelineEvents } from "./useTimelineEvents";
import TimelineArrows from "../visTimelineArrows.js";

export function useTimeline(props: any, emit: any, store: any, getDdName: any, getTechNameFn: any) {
  const itemsDS = store.itemsDS;
  const groupsDS = store.itemsDS;
  const timelineState = reactive({
    activeArrowItemIds: [] as string[],
  });

  let timelineInstance: any = null;
  let timelineArrows: any = null;

  // Lazy Load를 위한 캐시 상태
  const loadedItems = new Set();
  const pendingRequests = new Set();

  // 화살표 ID 안전하게 생성 (특수문자 제거)
  const makeSafeArrowId = (id: string) => String(id).replace(/[^a-zA-Z0-9_-]/g, "_");

  // 화살표 그리기 로직
  const drawArrows = (parentId: string) => {
    if (!timelineArrows || !parentId) return;

    const parentItem = itemsDS.get(parentId);
    if (!parentItem) return;

    // itemLink가 parentId와 일치하는 자식들 찾기
    const children = itemsDS.get({
      filter: (item: any) => item.itemLink === parentId,
    });

    children.forEach((child: any, index) => {
      timelineArrows.addArrow({
        id: `arrow_${makeSafeArrowId(parentId)}_${makeSafeArrowId(child.id)}_${index}`,
        id_item_1: parentId,
        id_item_2: child.id,
        type: 2, // 곡선 혹은 직선 타입 (오픈소스 설정에 따름)
        color: "#039E00",
      });
    });
  };

  /** Refactory ver에서 사용 할 예정 */
  // const { handleGlobalClick, handleItemOver } = useTimelineEvents(
  //   itemsDS,
  //   timelineState,
  //   emit,
  // );

  // // 컴포넌트에서 @click="onContainerClick" 으로 사용 가능하도록 래핑
  // const onContainerClick = (e: MouseEvent) => {
  //   handleGlobalClick(e, props.allItems, store);
  // };

  /** Item hover 시 Lazy Load 실행 */
  const handleItemOver = async (itemId: string) => {
    if (!itemId || pendingRequests.has(itemId)) return;

    // 이미 로드된 아이템인지 확인 (Set 활용)
    if (loadedItems.has(itemId)) return;

    // 현재 itemsDS에 이미 자식 tech들이 다 들어가 있는지 개수 체크
    const existingChildren = itemsDS.get({
      filter: (item: any) => item.itemLink === itemId && item.ptrmType !== "PRM",
    });

    const parentItem: any = itemsDS.get(itemId);

    // 부모가 가진 trmCount(API에서 준 전체 개수)와 현재 화면의 자식 개수가 같으면 호출 중단
    if (existingChildren.length >= (parentItem.trmCount || 0)) {
      loadedItems.add(itemId); // 이미 다 있다면 로드 완료 상태로 업데이트

      // 데이터는 있는데 화살표만 없는 경우를 대비해 화살표만 다시 그려줌
      await nextTick();
      drawArrows(itemId);
      return;
    }

    // PRM 타입이고 하위 기술(trmCount)이 있는 경우만 실행
    if (parentItem?.ptrmType === "PRM" && parentItem.trmCount > 0) {
      pendingRequests.add(itemId);
      try {
        // API 호출 (Store 경유)
        const trms = await store.getTrms({
          roadmapType: store.roadmapType === "PRM" ? "TRM" : "CMM",
          productItemIds: [itemId],
        });

        if (!trms || trms.length === 0) {
          loadedItems.add(itemId);
          return;
        }

        // Duplecate filter 처리, 이미 itemsDS에 있는 ID는 제외하고 새 데이터 only
        const newItems = trms.filter((t: any) => itemsDS.get(t.id) === null);

        if (newItems.length > 0) {
          const processed = newItems.map((t: any) => ({
            ...t,
            itemLink: itemId,
            group: parentItem.group,
            className: 'child-trm-card', // CSS로 카드 스타일 적용
            start: parentItem.start, // 시작일 통일해서 겹치기 (임시. 같은 행인 옆으로 줄을 서지 않도록 조치 목적)
            itemStatusName: getDdName("TES.ROAD_STATUS", t.itemStatusCode),
            technologyClassLv1Name: getTechNameFn ? getTechNameFn(t.technologyClassLv1Id) : "",
            technologyClassLv2Name: getTechNameFn ? getTechNameFn(t.technologyClassLv2Id) : "",
            technologyClassLv3Name: getTechNameFn ? getTechNameFn(t.technologyClassLv3Id) : "",
          }));
          console.log(`${parentItem.title} new Require Techs : `, processed);
          itemsDS.add(processed);
          loadedItems.add(itemId);

          // 데이터가 DOM에 그려진 후 화살표 연결
          await nextTick();
          drawArrows(itemId);
        }
      } catch (error) {
        console.error("Lazy Load Error:", error);
      } finally {
        pendingRequests.delete(itemId); // Unlock
      }
    }
  };

  /** 데이터 가공 및 주입 */
  const reloadData = (items: any[]) => {
    if (!items) return;
    const processed = items.map((item) => {
      const raw = toRaw(item);
      return {
        ...raw,
        id: String(raw.id),
        group: String(raw.groupId || raw.group),
        start: new Date(raw.start || raw.planStartDt),
        end: (raw.end || raw.planEndDt) ? new Date(raw.end || raw.planEndDt) : null,
        content: "", // 템플릿 사용을 위해 비움
      };
    });
    itemsDS.clear();
    itemsDS.add(processed);
  };

  /** 화살표 제어 */
  const viewTimelineArrows = (selectedId: string) => {
    if (!timelineArrows && timelineInstance) {
      timelineArrows = new TimelineArrows(timelineInstance, [], {
        color: "#039E00",
        strokeWidth: 2,
        followRelationships: true,
      });
    }
    if (selectedId && timelineArrows) {
      // 기존 화살표 그리기 로직 수행
      console.log(`Arrow drawing for: ${selectedId}`);
    }
  };

  const removeTimeLineArrows = (selectedId?: string) => {
    if (timelineArrows) {
      selectedId ? timelineArrows.removeArrows(selectedId) : timelineArrows.removeArrowAll();
    }
  };

  /** 하위 트리 토글 진입점 */
  const visibleSubTechTree = (visible: boolean, itemId: string) => {
    const idStr = String(itemId);
    if (visible) {
      if (!timelineState.activeArrowItemIds.includes(idStr)) {
        timelineState.activeArrowItemIds.push(idStr);
      }
      viewTimelineArrows(idStr);
    } else {
      timelineState.activeArrowItemIds = timelineState.activeArrowItemIds.filter(id => id !== idStr);
      removeTimeLineArrows(idStr);
    }
    // 데이터 재로드하여 템플릿 갱신 유도
    reloadData(props.allItems);
  };

  /** 통합 클릭 핸들러 */
  const handleTimelineClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    // 1. +/- 버튼 클릭 시
    if (target.classList.contains('vis-item-add')) {
      event.stopPropagation();
      const itemId = target.dataset.id;
      if (!itemId) return;

      const isVisible = !timelineState.activeArrowItemIds.includes(String(itemId));
      visibleSubTechTree(isVisible, itemId);
      return;
    }

    // 2. 아이템 카드 클릭 시 (상세 슬라이드)
    const itemContainer = target.closest('.vis-item-contents') as HTMLElement;
    if (itemContainer) {
      const itemId = itemContainer.dataset.id;
      const item = itemsDS.get(itemId);
      if (item) emit('open-detail-slide', item);
    }
  };

  const setInstance = (instance: any) => {
    timelineInstance = instance;
  };

  /** 원본 필터링 및 활성 상태를 유지하는 그룹 토글 로직 */
  const toggleAllGroups = (show: boolean) => {
    if (!groupsDS || groupsDS.length === 0) return;

    const allGroups = groupsDS.get();
    const groupMap = new Map(allGroups.map((g: any) => [String(g.id), g]));

    // 최상위 그룹 추출 (isSubGroup이 false인 것들)
    const targetGroups = allGroups.filter((g: any) => g.isSubGroup === false);

    // 1. 현재 화살표가 활성화된 아이템들의 소속 그룹 ID 수집
    const activeGroupIds = new Set<string>();
    if (show && timelineState.activeArrowItemIds && timelineState.activeArrowItemIds.length > 0) {
      timelineState.activeArrowItemIds.forEach((itemId) => {
        // props.allItems에서 해당 아이템을 찾아 소속 그룹 ID를 가져옴
        const item = props.allItems.find((i: any) => String(i.id) === String(itemId));
        if (item && item.group) {
          activeGroupIds.add(String(item.group));
        }
      });
    }

    const updatesMap = new Map<string, any>();
    const addUpdate = (id: string, data: any) => {
      const idStr = String(id);
      const existing = updatesMap.get(idStr) || { id: idStr };
      updatesMap.set(idStr, { ...existing, ...data });
    };

    /** 그룹 상태 수집 */
    const collectUpdates = (parentId: string, isShow: boolean) => {
      const parent = groupMap.get(String(parentId));
      if (!parent || !parent.nestedGroups) return;

      // 원본 로직: isSubGroup이 true인 그룹은 제외하되,
      // 펼치기(show=true) 모드에서 현재 활성 그룹(activeGroupIds)에 포함되면 허용
      if (parent.isSubGroup && !(isShow && activeGroupIds.has(String(parentId)))) {
        return;
      }

      // 부모의 중첩 그룹 표시 여부 설정
      addUpdate(parentId, { showNested: isShow });

      // 자식 노드 순회
      parent.nestedGroups.forEach((childId: string) => {
        const childIdStr = String(childId);
        // 자식의 가시성 설정
        addUpdate(childIdStr, { visible: isShow });

        if (isShow === false) {
          // 접을 때는 하위 모든 자식들도 재귀적으로 접음
          collectUpdates(childIdStr, false);
        } else {
          // 펼칠 때는 activeGroupIds에 포함된 그룹인 경우에만 재귀적으로 하위 탐색
          if (activeGroupIds.has(childIdStr)) {
            collectUpdates(childIdStr, true);
          }
        }
      });
    };

    // 2. 모든 최상위 그룹으로부터 업데이트 데이터 수집 시작
    targetGroups.forEach((g: any) => collectUpdates(String(g.id), show));

    // 3. 수집된 업데이트 내역이 있다면 DataSet 일괄 업데이트
    if (updatesMap.size > 0) {
      groupsDS.update(Array.from(updatesMap.values()));

      // 레이아웃 갱신
      if (timelineInstance) {
        setTimeout(() => {
          timelineInstance.redraw();
        }, 0);
      }
    }
  };

  return {
    itemsDS,
    groupsDS,
    timelineState,
    setInstance,
    reloadData,
    handleTimelineClick,
    removeTimeLineArrows,
    // onContainerClick,
    // handleItemOver: (id: string) => handleItemOver(id, store, getDdName),
    handleItemOver,
    toggleAllGroups,
  };
}
