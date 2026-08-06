/**
 * @file useTimeline.ts
 * @description workspaceNew Timeline의 주요 동작 로직을 담당하는 Composable.
 *
 * ⚠️ Vue Proxy vs vis-data DataSet 충돌 방지 원칙:
 * - store.itemsDS / store.groupsDS는 `markRaw()`로 선언되어 Proxy 래핑이 없습니다.
 * - DataSet.get() 사용 시: vis-data는 저장된 순수 객체를 반환하지만,
 *   props 등에서 로드된 울러서 data는 Vue Proxy일 수 있습니다.
 * - DataSet.update() / add() 에 없는 객체를 전달하기 전 항상 `toRaw()`를 적용합니다.
 *   vis-data는 내부적으로 id 문자열 타입 검사, instanceof 검사 등을 수행하는데
 *   Proxy을 전달하면 예상치 못한 실패가 발생합니다.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { nextTick, reactive, toRaw } from 'vue'
// @ts-expect-error legacy JS module without type declarations
import VisTimelineArrows from '../visTimelineArrow.js'
import moment from 'moment'

/**
 * workspaceNew Timeline Composable.
 *
 * @param props - Timeline.vue의 props
 * @param emit - Timeline.vue의 emit
 * @param store - useWorkspaceNewTimelineStore 인스턴스
 * @param getDdName - 공통 코드 명칭 반환 함수 (store.getDdName 래퍼)
 */
export function useTimeline(props: any, emit: any, store: any, getDdName: any) {
  /**
   * store의 DataSet 인스턴스를 직접 참조합니다.
   * ⚠️ store.itemsDS / groupsDS는 markRaw()로 선언되어 Proxy에서 안전합니다.
   *    Vue가 이 객체를 구독하지 않으므로 getter 에서 직접 가져와 쓰세요.
   */
  const itemsDS = store.itemsDS
  const groupsDS = store.groupsDS
  /**
   * 현재 활성화된 화살표 연결의 부모 아이템 ID 목록.
   * 이 목록에 등록된 아이템은 연결선이 표시되고, '+' 버튼이 '-'로 토글됩니다.
   */
  const timelineState = reactive({
    activeArrowItemIds: [] as string[],
  })

  /** lazy-load 완료된 parentId Set. 중복 로드 방지에 사용합니다. */
  const loadedItems = new Set<string>()

  /** 현재 API 요청 중인 parentId Set. 동시에 같은 항목이 2번 이상 로드되는 것을 방지합니다. */
  const pendingRequests = new Set<string>()

  /** vis-timeline Timeline 인스턴스. mount 이후 setInstance()로 주입됩니다. */
  let timelineInstance: any = null

  /** 화살표 연결선을 관리하는 VisTimelineArrows 인스턴스. */
  let timelineArrows: any = null

  /** 화살표 연결선의 고유 ID를 생성합니다. parentId-childId 조합으로 중복 제거됩니다. */
  const getArrowId = (parentId: string, childId: string) => `arrow-${parentId}-${childId}`

  /**
   * VisTimelineArrows 인스턴스를 요청시 생성합니다 (lazy init).
   * 화살표가 필요할 때만 생성하여 초기 렌더링 성능을 향상시킵니다.
   */
  const ensureArrows = () => {
    if (!timelineInstance || timelineArrows) return
    timelineArrows = new VisTimelineArrows(timelineInstance, [], {
      color: '#16a34a',
      strokeWidth: 2,
      followRelationships: true,
    })
  }

  /**
   * 특정 부모 아이템의 화살표를 DataSet에서 화살표 라이브러리 연결선으로 마운트합니다.
   * 1. 기존 화살표 제거
   * 2. itemsDS에서 parentId를 itemLink로 가지는 자식 아이템 조회
   * 3. 각 자식마다 addArrow()
   * 4. nextTick 후 redraw()로 DOM 로드 후 화살표 렌더링
   *
   * @param parentId - 부모 PRM 아이템의 ID
   */
  const syncArrowForParent = async (parentId: string) => {
    ensureArrows()
    if (!timelineArrows) return

    timelineArrows.removeArrows(parentId)
    const children = itemsDS.get({ filter: (item: any) => item.itemLink === parentId && item.ptrmType !== 'PRM' })
    children.forEach((child: any) => {
      timelineArrows.addArrow({
        id: getArrowId(parentId, String(child.id)),
        id_item_1: parentId,
        id_item_2: String(child.id),
        type: 2,
        align: 'left',
        color: '#16a34a',
      })
    })

    await nextTick()
    timelineInstance?.redraw()
  }

  /**
   * 특정 부모 아이템의 화살표를 제거하고 redraw 합니다.
   * 하위기술이 접혀 서넉 사라질 때 사용합니다.
   *
   * @param parentId - 화살표를 제거할 부모 ID
   */
  const removeArrowForParent = (parentId: string) => {
    timelineArrows?.removeArrows(parentId)
    timelineInstance?.redraw()
  }

  /**
   * 특정 그룹의 모든 하위 그룹 ID를 BFS로 수집합니다.
   * groupsDS의 nestedGroups를 타고 내려가며, 순환참조를 Set으로 방지합니다.
   * grp.visible 토글(키보드/체크박스)에서 사용됩니다.
   *
   * @param groupId - 시작 그룹 ID
   * @returns 해당 그룹 + 모든 자손 그룹 ID 배열
   */
  const getDescendantGroupIds = (groupId: string) => {
    const result = new Set<string>()
    const queue: string[] = [String(groupId)]

    while (queue.length) {
      const currentId = queue.shift()
      if (!currentId || result.has(currentId)) continue
      result.add(currentId)

      const group: any = groupsDS.get(currentId)
      const nested = Array.isArray(group?.nestedGroups) ? group.nestedGroups : []
      nested.forEach((childId: unknown) => {
        const normalized = String(childId)
        if (!result.has(normalized)) {
          queue.push(normalized)
        }
      })
    }

    return Array.from(result)
  }

  /**
   * 주어진 groupId 목록에 속한 모든 아이템의 CSS 표시/숨김을 제어합니다.
   *
   * vis-timeline는 group.visible 속성은 그룹 행 자체를 숨기지만,
   * 해당 그룹에 속한 아이템들은 다른 그룹 행에 노이진 쳌 남는 문제가 있습니다.
   * 이를 학지하기 위해 `style: 'display:none'` 를 직접 주입/제거합니다.
   *
   * ⚠️ toRaw() 적용: DataSet.get() 로 얻은 객체를 spread하면
   *   Vue Proxy가 슬립할 수 있습니다. itemsDS는 markRaw되어
   *   있지만, 외부에서 주입된 data가 proxy일 가능성을 위해 toRaw() 를 합니다.
   *
   * @param groupIds - 표시/숨김을 적용할 그룹 ID 목록
   * @param visible - true: 표시, false: 숨김
   */
  const setItemsVisibleByGroupIds = (groupIds: string[], visible: boolean) => {
    const targetGroupIds = new Set(groupIds.map((id) => String(id)))
    if (!targetGroupIds.size) return

    const targetItems = itemsDS.get({
      filter: (item: any) => targetGroupIds.has(String(item.group)),
    })

    if (!targetItems.length) return

    const updates = targetItems.map((item: any) => {
      // ⚠️ toRaw(): DataSet.get()에서 반환된 객체가 Vue Proxy일 수 있습니다.
      // spread(...) 전에 항상 toRaw()를 적용합니다.
      const raw = toRaw(item)
      const existingStyle = String(raw.style ?? '')
      const normalizedStyle = existingStyle.replace(/display\s*:\s*none;?/gi, '').trim()

      return {
        ...raw,
        style: visible
          ? normalizedStyle
          : `${normalizedStyle}${normalizedStyle ? '; ' : ''}display:none;`,
      }
    })

    itemsDS.update(updates)
    timelineInstance?.redraw()
  }

  /**
   * 특정 그룹의 `checked` 상태를 업데이트하여 groupTemplate에 체크박스 상태를 반영합니다.
   *
   * ⚠️ toRaw() 적용: groupsDS.get()이 반환하는 객체를 spread 전에 toRaw()를 합니다.
   *   vis-data는 DataSet에 저장된 객체하고도, 외부 데이터가 Vue 반응형 문맥에서 전달되면
   *   Proxy가 포함된 객체가 주입될 수 있습니다.
   *   DataSet은 내부적으로 id 콘시시스턴시를 유지하기 위해 실제 값을 비교하는데,
   *   Proxy가 있으면 동등 비교가 실패할 수 있습니다.
   *
   * @param groupId - 체크 상태를 변경할 그룹 ID
   * @param checked - true: 체크됨, false: 체크 해제
   */
  const setGroupChecked = (groupId: string, checked: boolean) => {
    const current: any = groupsDS.get(groupId)
    if (!current) return
    groupsDS.update({
      ...toRaw(current), // ⚠️ Proxy 래퍼 제거 후 DataSet에 정달
      checked,
    })
  }

  /**
   * 체크박스 토글 시 자신 + 모든 하위 그룹의 아이템 표시/숨김을 제어합니다.
   * 1. getDescendantGroupIds()로 BFS 하위 그룹 ID 수집
   * 2. setGroupChecked()로 groupTemplate의 체크박스 UI 업데이트
   * 3. setItemsVisibleByGroupIds()로 해당 그룹들의 아이템 visibility 조정
   *
   * @param groupId - 토글할 그룹 ID
   * @param visible - true: 표시, false: 숨김
   */
  const toggleGroupVisibility = (groupId: string, visible: boolean) => {
    const targetGroupIds = getDescendantGroupIds(groupId)
    setGroupChecked(groupId, visible)
    setItemsVisibleByGroupIds(targetGroupIds, visible)
  }

  /**
   * 외부에서 전달된 아이템 배열로 DataSet을 새로 고칩니다.
   * props.allItems 쏼 데이터나 API 로드 시에 호출됩니다.
   *
   * ⚠️ toRaw() 필수: props를 통해 전달된 item들은 Vue Proxy입니다.
   *   `toRaw(item)` 로 Proxy를 벗겨내고 순수 객체만 DataSet에 주입합니다.
   *   이를 생략하면 vis-data의 id 매핑, 이벤트 트리거링 등에 문제가 생길 수 있습니다.
   *
   * @param items - 렌더링할 아이템 배열 (Vue 반응형 Proxy 포함 가능)
   */
  const reloadData = (items: any[]) => {
    if (!items) return

    const processed = items.map((item, index) => {
      // ⚠️ toRaw(): Vue Proxy 래퍼에서 순수 객체 추출
      const raw = toRaw(item)
      const baseOrder = Number(raw.subgroupOrder ?? raw.order ?? index)
      const normalizedOrder = Number.isFinite(baseOrder) ? baseOrder : (index)
      return {
        ...raw,
        id: String(raw.id),
        group: String(raw.groupId || raw.group),
        // Date 객체로 변환: vis-timeline은 string보다 Date 객체를
        // 관리하면 내부에서 valueOf() 호출 비교가 더 빠릅니다.
        start: raw.start ? new Date(raw.start as string) : null,
        end: raw.end ? new Date(raw.end as string) : null,
        subgroup: raw.subgroup ?? `sg-${String(raw.id)}`,
        subgroupOrder: normalizedOrder,
        content: '', // 실제 콘텐츠는 template 함수가 렌더링함
      }
    })

    itemsDS.clear()
    itemsDS.add(processed)

  }

  itemsDS.on("*", function (event: any, properties: unknown) {
    console.log("DataSet Event:", event, properties)
  })
  /**
   * 특정 부모 아이템의 하위기술 아이템들을 DataSet에서 제거합니다.
   * 화살표 연결선도 함께 제거합니다.
   * 캐시가 비활성화(공간 절약)된 경우 loadedItems Set에서도 제거합니다.
   *
   * @param parentId - 제거할 하위기술의 부모(PRM) 아이템 ID
   */
  const removeSubItems = (parentId: string) => {
    const children = itemsDS.get({ filter: (item: any) => item.itemLink === parentId && item.ptrmType !== 'PRM' })
    const removeIds = children.map((item: any) => item.id)
    if (removeIds.length) {
      itemsDS.remove(removeIds)
    }

    if (!store.useSubTechCache) {
      loadedItems.delete(parentId)
      store.clearSubTechCache(parentId)
    }

    removeArrowForParent(parentId)
  }

  /**
   * 캐시된 하위기술 아이템을 DataSet에 복원합니다 (API 호출 없이).
   * 이미 DataSet에 존재하는 아이템은 중복 주입하지 않는다.
   *
   * @param parentId - 부모 PRM 아이템의 ID
   * @returns true: 캐시에서 복원됨, false: 캐시 없음
   */
  const restoreCachedSubTechItems = async (parentId: string) => {
    if (!store.useSubTechCache) return false
    const cachedItems = store.getCachedSubTechItems(parentId)
    if (!cachedItems.length) return false

    const existingChildren = itemsDS.get({
      filter: (item: any) => item.itemLink === parentId && item.ptrmType !== 'PRM',
    })

    if (existingChildren.length === 0) {
      itemsDS.add(cachedItems)
    }

    loadedItems.add(parentId)
    await syncArrowForParent(parentId)
    return true
  }

  /**
   * 특정 PRM 아이템에 연결된 TRM/CMM 하위기술을 지연로드(lazy load)합니다.
   *
   * 로딩시 무한로드 무효화 로직:
   * 1. pendingRequests에 등록된 경우 → 이미 요청 중. skip
   * 2. loadedItems에 등록된 경우 → 캐시 복원 시도. 성공하면 skip
   * 3. 구성요소에 이미 자식이 치루 별수를 조회한 수 있는 경우도 skip
   * 4. 그 외에만 실제 API 호출
   *
   * ⚠️ 이 함수에서 DataSet에 주입되는 데이터는
   *   getTrms() 통해 서버에서 받은 순수 JSON이므로 Vue Proxy 없음.
   *   단, mappedItems를 cachedSubTechItems에 저장할 때 Proxy가 슬립되지 않도록
   *   store.cacheSubTechItems()는 shallow copy를 사용합니다.
   *
   * @param itemId - lazy load할 부모 PRM 아이템의 ID
   */
  const loadSubTechItems = async (itemId: string) => {
    if (!itemId || pendingRequests.has(itemId)) return

    if (loadedItems.has(itemId)) {
      const restored = await restoreCachedSubTechItems(itemId)
      if (restored) return
      if (store.useSubTechCache) return
    }

    const parentItem: any = itemsDS.get(itemId)
    if (!parentItem || parentItem.ptrmType !== 'PRM' || Number(parentItem.trmCount || 0) <= 0) return

    const existingChildren = itemsDS.get({
      filter: (item: any) => item.itemLink === itemId && item.ptrmType !== 'PRM',
    })
    if (existingChildren.length >= Number(parentItem.trmCount || 0)) {
      loadedItems.add(itemId)
      return
    }

    pendingRequests.add(itemId)
    try {
      const trms = await store.getTrms({
        roadmapType: store.roadmapType === 'PRM' ? 'TRM' : 'CMM',
        productItemIds: [itemId],
      })

      const newItems = (trms || []).filter((item: any) => itemsDS.get(item.id) === null)
      if (newItems.length) {
        const parentOrder = Number(parentItem.subgroupOrder ?? parentItem.order ?? 0)
        const sameGroupParentRows = itemsDS
          .get({
            filter: (item: any) =>
              item.ptrmType === 'PRM' &&
              String(item.group) === String(parentItem.group) &&
              Number(item.subgroupOrder ?? item.order ?? 0) > parentOrder,
          })
          .sort(
            (a: any, b: any) =>
              Number(a.subgroupOrder ?? a.order ?? 0) - Number(b.subgroupOrder ?? b.order ?? 0),
          )

        const nextParentOrder = sameGroupParentRows.length
          ? Number(sameGroupParentRows[0].subgroupOrder ?? sameGroupParentRows[0].order ?? parentOrder + 1000)
          : parentOrder + 1000

        const availableRange = Math.max(nextParentOrder - parentOrder, newItems.length + 1)
        const step = Math.max(1, Math.floor(availableRange / (newItems.length + 1)))

        const mappedItems = newItems.map((item: any, index: number) => {
          const insertionOrder = parentOrder + step * (index + 1)
          const start = item.start
          const end = item.end ?? start
          const nextOrder = parentOrder + index + 1

          return {
            ...item,
            itemLink: itemId,
            group: parentItem.group,
            className: 'child-trm-card',
            start,
            end,
            order: nextOrder,
            priority: nextOrder,
            subgroup: `sg-${itemId}-child`,
            subgroupOrder: nextOrder,
            itemStatusName: getDdName('TES.ROAD_STATUS', item.itemStatusCode),
          }
        })

        itemsDS.add(mappedItems) // DataSet에 추가 (Vue Proxy 아님)
        console.log(`Loaded ${mappedItems.length} sub-tech items for parentId ${itemId}`)
        console.log('Mapped Items:', mappedItems)

        if (store.useSubTechCache) {  // 캐시 사용 시, 새로 로드한 아이템을 캐시에 저장
          store.cacheSubTechItems(itemId, mappedItems) // 캐시에 저장 (shallow copy로 Proxy 방지)
        }

        await syncArrowForParent(itemId) // 화살표 연결선 동기화 (새 아이템이 추가되었으므로)
      }

      loadedItems.add(itemId)
    } catch (error) {
      console.error('Lazy Load Error:', error)
    } finally {
      pendingRequests.delete(itemId)
    }
  }

  /**
   * 하위기술 트리를 표시/숨김합니다.
   * - visible=true: timelineState.activeArrowItemIds에 등록 후 lazy load 시도
   * - visible=false: activeArrowItemIds에서 제거 후 하위 아이템 제거
   *
   * @param visible - true: 열기, false: 접기
   * @param itemId - 제어할 부모 PRM 아이템의 ID
   */
  const visibleSubTechTree = async (visible: boolean, itemId: string) => {
    const id = String(itemId)
    if (visible) {
      timelineInstance?.setOptions({
        stack: true,
        // stackSubgroups: true,
        margin: {
          item: 16, // 인접 카드 및 화살표 간섭 방지 여유 공간
          axis: 20,
        },
      })

      if (!timelineState.activeArrowItemIds.includes(id)) {
        timelineState.activeArrowItemIds.push(id)
      }
      await loadSubTechItems(id)  // 하위기술 트리 로드 및 화살표 동기화
      await nextTick()
      timelineInstance?.redraw()

      return
    }

    timelineState.activeArrowItemIds = timelineState.activeArrowItemIds.filter((value) => value !== id)
    removeSubItems(id)
    timelineInstance?.setOptions({
      stack: true,
      stackSubgroups: false,
      margin: {
        item: 0,
        axis: 0,
      },
    })

    await nextTick()
    timelineInstance?.redraw()
    console.log(`Sub-tech tree for parentId ${id} is now hidden.`, timelineInstance?.options)
  }

  /**
   * hasTrm이 true인 모든 PRM 아이템의 하위기술을 한 번에 폼칩니다.
   *
   * ⚠️ 성능 개선: 기존 serial await 늘코드를 Promise.all()로 변경합니다.
   *   - 기존: for (const parent of parents) { await loadSubTechItems(id) }
   *     → N개 아이템이 있으면 N번의 연속 API 호출 발생
   *   - 개선: Promise.all()로 병렬 요청 → 전체 대기시간이 max(single) 수준으로 감소
   *   - pendingRequests Set으로 중복 요청은 자동으로 제어됨
   */
  const expandAllSubItems = async () => {
    const parents = itemsDS.get({ filter: (item: any) => item.ptrmType === 'PRM' && item.hasTrm })
    // 병렬 로드: 모든 PRM 아이템의 TRM을 동시 요청
    await Promise.all(
      parents.map(async (parent: any) => {
        const id = String(parent.id)
        if (!timelineState.activeArrowItemIds.includes(id)) {
          timelineState.activeArrowItemIds.push(id)
        }
        await loadSubTechItems(id)
      }),
    )
  }

  /**
   * 화면에 펼쳐진 모든 TRM 하위기술을 접고 DataSet에서 제거합니다.
   * activeArrowItemIds 목록을 북사하여 순회함으로, 제거 도중 리스트 변경을 방지합니다.
   */
  const collapseAllSubItems = () => {
    const activeIds = [...timelineState.activeArrowItemIds]
    activeIds.forEach((id) => removeSubItems(id))
    timelineState.activeArrowItemIds = []
  }

  /**
   * 특정 ID의 아이템으로 포커스를 이동합니다 (애니메이션 포함).
   * nextTick 후 실행하여 DOM 업데이트를 보장합니다.
   *
   * @param itemId - 포커스할 아이템의 ID
   */
  const focusItemById = async (itemId: string) => {
    await nextTick()
    if (!timelineInstance) return
    timelineInstance.setSelection([itemId])
    timelineInstance.focus(itemId, { animation: true })
  }

  /**
   * Timeline 컨테이너에서 발생하는 클릭 이벤트를 처리합니다.
   *
   * 세 가지 영역을 구분합니다:
   * 1. `.vis-group-check` 체크박스 클릭 → 그룹 표시/숨김 토글
   * 2. `.vis-item-add` 버튼 클릭 → TRM 하위기술 폼침/접기 토글
   * 3. `.vis-item-contents` 클릭 → 상세 슬라이드 오픈 emit
   *
   * 하나의 클릭 이벤트 리스너로 체크박스/버튼/컨테이너를
   * 하나의 체인으로 처리하여 복수 이벤트리스너 등록을 피합니다.
   */
  const onContainerClick = async (event: MouseEvent) => {
    const target = event.target as HTMLElement

    const groupCheck = target.closest('.vis-group-check') as HTMLInputElement | null
    if (groupCheck) {
      event.stopPropagation()
      const groupId = groupCheck.dataset.id
      if (!groupId) return
      toggleGroupVisibility(groupId, groupCheck.checked)
      return
    }

    const addButton = target.closest('.vis-item-add') as HTMLElement | null

    if (addButton) {
      event.stopPropagation()
      const itemId = addButton.dataset.id
      if (!itemId) return

      const isVisible = !timelineState.activeArrowItemIds.includes(String(itemId))
      await visibleSubTechTree(isVisible, itemId)
      return
    }

    const itemContainer = target.closest('.vis-item-contents') as HTMLElement | null
    if (itemContainer) {
      const itemId = itemContainer.dataset.id
      if (!itemId) return
      const item = itemsDS.get(itemId)
      if (item) emit('open-detail-slide', item)
    }
  }

  /**
   * 모든 비조직 그룹의 표시 상태를 일괄 토글합니다.
   * 상단 전체 체크/해제 버튼에서 사용합니다.
   *
   * @param show - true: 모두 표시, false: 모두 숨김
   */
  const toggleAllGroups = (show: boolean) => {
    const allGroups = groupsDS.get({
      filter: (group: any) => !group.isOrganization,
    })

    if (!allGroups.length) return

    allGroups.forEach((group: any) => {
      toggleGroupVisibility(String(group.id), show)
    })
  }

  /**
   * vis-timeline의 Timeline 인스턴스를 설정합니다.
   * onMounted 이후 Timeline 생성 시에 호출해야 동작합니다.
   * 화살표(VisTimelineArrows)도 이 시점에 lazy init됩니다.
   *
   * @param instance - `new Timeline(...)` 로 생성된 인스턴스
   */
  const setInstance = (instance: any) => {
    timelineInstance = instance
    ensureArrows()
  }

  /**
   * 화살표 연결선 전체를 삭제합니다.
   * onBeforeUnmount에서 호출해 메모리 누수를 방지합니다.
   */
  const destroyTimelineArrows = () => {
    timelineArrows?.removeArrowAll()
    timelineArrows = null
  }

  return {
    itemsDS,
    groupsDS,
    timelineState,
    reloadData,
    onContainerClick,
    toggleAllGroups,
    toggleGroupVisibility,
    handleItemOver: loadSubTechItems,
    setInstance,
    expandAllSubItems,
    collapseAllSubItems,
    focusItemById,
    destroyTimelineArrows,
  }
}

function convertFallbackDate() {
  return new Date()
}
