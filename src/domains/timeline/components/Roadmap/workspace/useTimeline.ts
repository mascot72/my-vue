import TimelineArrows from "./visTimelineArrows.js";
import { nextTick, ref } from "vue";

export function useTimeline(props, emit, store, getDdName) {
  const timelineInstance = null;
  const timelineArrows = null;

  // Lazy Load를 위한 캐시 상태
  const loadedItems = new Set();
  const pendingRequests = new Set();

  // 화살표 ID 안전하게 생성 (특수문자 제거)
  const makeSafeArrowId = (id) => String(id).replace(/[^a-zA-Z0-9_-]/g, "_");

  // 화살표 그리기 로직
  const drawArrows = (parentId) => {
    if (!timelineArrows || !parentId) return;

    const parentItem = itemsDS.get(parentId);
    if (!parentItem) return;

    // itemLink가 parentId와 일치하는 자식들 찾기
    const children = itemsDS.get({
      filter: (item) => item.itemLink === parentId
    });

    children.forEach((child, index) => {
      timelineArrows.addArrow({
        id: `arrow_${makeSafeArrowId(parentId)}_${makeSafeArrowId(child.id)}_${index}`,
        id_item_1: parentId,
        id_item_2: child.id,
        type: 2, // 곡선 혹은 직선 타입 (오픈소스 설정에 따름)
        color: "#039E00"
      });
    });
  };

  // 아이템 마우스 오버 시 Lazy Load 실행
  const handleItemOver = async (itemId) => {
    if (!itemId || loadedItems.has(itemId) || pendingRequests.has(itemId)) return;

    const item = itemsDS.get(itemId);
    // PRM 타입이고 하위 기술(trmCount)이 있는 경우만 실행
    if (item?.ptrmType === "PRM" && item.trmCount > 0) {
      pendingRequests.add(itemId);
      try {
        // API 호출 (Store 경유)
        const trms = await store.getTrms({
          roadmapType: store.roadmapType === "PRM" ? "TRM" : "CMM",
          productItemIds: [itemId]
        });

        if (trms?.length) {
          const processed = trms.map(t => ({
            ...t,
            itemLink: itemId,
            group: item.group,
            className: 'child-trm-card' // CSS로 카드 스타일 적용
          }));

          itemsDS.add(processed);
          loadedItems.add(itemId);

          // 데이터가 DOM에 그려진 후 화살표 연결
          await nextTick();
          drawArrows(itemId);
        }
      } finally {
        setTimeout(() => pendingRequests.delete(itemId), 300);
      }
    }
  };

  const reloadData = (newItems) => {
    // 1. 기존 화살표 및 캐시 싹 비우기 (Side-effect 방지)
    if (timelineArrows) timelineArrows.removeArrowAll();
    loadedItems.clear();
    pendingRequests.clear();

    // 2. 데이터 가공 및 추가
    const processed = newItems.map(item => ({
      ...item,
      id: String(item.id),
      start: new Date(item.planStartDt),
      end: item.planEndDt ? new Date(item.planEndDt) : null,
    }));

    itemsDS.clear();
    itemsDS.add(processed);

    // 3. 만약 기존에 펼쳐져 있던 화살표가 있다면 재발생 로직 추가 가능
  };

  return { reloadData, handleItemOver, drawArrows };
}
