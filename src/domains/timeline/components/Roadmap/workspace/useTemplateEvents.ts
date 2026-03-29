// useTemplateEvents.ts
/**
 * useTimelineEvents.ts
 * 타임라인 내 발생하는 클릭 및 마우스 오버(Lazy Loading) 이벤트를 관리합니다.
 */
export function useTimelineEvents(
  itemsDS: any,
  timelineState: { activeArrowItemIds: string[] },
  emit: Function,
) {
  // 중복 요청 방지 및 로드된 데이터 관리 (TS 타입 추론)
  const loadedItems = new Set<string>();
  const pendingRequests = new Set<string>();

  /** * [1] 통합 클릭 핸들러 (이벤트 위임 방식)
   * 컴포넌트나 useTimeline에서 호출 시 e, allItems, store를 주입받습니다.
   */
  const handleGlobalClick = (e: MouseEvent, allItems: any[], store: any) => {
    const target = e.target as HTMLElement;

    // data-id 혹은 부모의 data-id 탐색 (Template.js의 구조에 맞춰 탐색)
    const id = target.dataset.id || target.closest("[data-id]")?.getAttribute('data-id');
    const action = target.dataset.action || target.closest("[data-action]")?.getAttribute('data-action');

    if (!id) return;

    // A. 하위 트리 확장 버튼 (+/-) 클릭 시
    if (action === "add-item") {
      const isVisible = !timelineState.activeArrowItemIds.includes(String(id));
      // 부모 컴포넌트에 알림
      emit("add-click", id, isVisible);
      return;
    }

    // B. 아이템 상세 선택 (카드 본체 클릭 시)
    const itemContainer = target.closest(".vis-item-contents");
    if (itemContainer) {
      const itemData = allItems.find((i) => String(i.id) === String(id));
      if (itemData && store) {
        // 기존 로직: 선택된 로드맵 ID 업데이트 및 상세 조회 알림
        store.selectedRoadId = itemData.roadId;
        emit("item-select", itemData);
      }
    }
  };

  /** * [2] Lazy Loading 로직 (마우스 오버 등 특정 시점 호출)
   * 데이터가 필요할 때 비동기로 서버에서 하위 데이터를 가져와 DataSet에 추가합니다.
   */
  const handleItemOver = async (
    itemId: string,
    store: any,
    getDdName: (codeGroup: string, code: string) => string
  ) => {
    // 1. 기초 검증 및 중복 방지
    if (!itemId || !store || !getDdName) return;
    const idStr = String(itemId);
    if (loadedItems.has(idStr) || pendingRequests.has(idStr)) return;

    const item = itemsDS.get(idStr);

    // 2. 조건부 데이터 로딩 (PRM 타입이고 하위 아이템이 있는 경우)
    if (item?.ptrmType === "PRM" && item.trmCount > 0) {
      try {
        pendingRequests.add(idStr);

        // 3. API 호출 (store의 메서드 활용)
        const trms = await store.getTrms({
          roadmapType: store.roadmapType === "PRM" ? "TRM" : "CMM",
          productItemIds: [idStr],
        });

        if (trms?.length > 0) {
          const result = trms.map((t: any) => ({
            ...t,
            id: String(t.id), // ID 타입 일관성 유지
            itemLink: idStr, // 부모-자식 연결 고리
            // 공통코드 명칭 매핑
            itemStatusName: getDdName("TES.ROAD_STATUS", t.itemStatusCode),
          }));

          // 4. DataSet에 실시간 반영 (자동 렌더링 유도)
          loadedItems.add(idStr);
          itemsDS.add(result);
        }
      } catch (err) {
        console.error("Lazy loading failed:", err);
      } finally {
        // 짧은 지연 후 요청 대기 해제
        setTimeout(() => pendingRequests.delete(idStr), 300);
      }
    }
  };

  return {
    handleGlobalClick,
    handleItemOver,
    loadedItems,
    pendingRequests,
  };
}
