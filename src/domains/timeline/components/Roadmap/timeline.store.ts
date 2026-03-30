// timeline.store.ts
import { toRaw, reactive } from "vue";
import { defineStore } from "pinia";
import { useTimelineApi } from "./workspaceNew/useTimelineApi";
import { DataSet } from "vis-data";

type RoadmapType = "PRM" | "TRM" | "CMM" | "COM";

type TimelineState = {
  groups: any[];
  items: any[];
  groupsDS: DataSet<any, "id">;
  itemsDS: DataSet<any, "id">;
  loading: boolean;
  roadmapType: RoadmapType | "";
  orgGroups: any[];
  selectedRoadId: string | null;
  getTechNameFn: ((code: string) => string) | null;
};

const langCode = "Ko";

const convertDate = (value: string, endOfMonth = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (!endOfMonth) return date;
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};
/**
 * [Bridge Storage]
 * 스토어 외부에 선언하여 여러 action이 공유하며,
 * 한 번 로드된 데이터를 메모리에 유지(Caching)
 */
const commCodeMap = reactive(new Map<string, Array<Record<string, unknown>>>());

// 조직별 제품군 제품목록 data-fetch + data transform
async function getProductItems(api: any, groups: any[], payload: any) {
  const res = await api.fetchItems(payload);
  return (res || [])
    .filter((item: any) => !!item["name" + langCode])
    .map((item: any) => {
      const currGroup = groups.find(g => g.id === item.roadOrgGroupProdLinkId);
      return {
        id: item.id,
        itemLink: item.id, // 필요기술과 set 목적(부모-자식 item)
        title: item["name" + langCode],
        titleEn: item["nameEn"],
        content: item["name" + langCode],
        start: convertDate(item.devStartPlanMonth),
        end: convertDate(item.devEndPlanMonth, true),
        group: item.roadOrgGroupProdLinkId, // 조직그룹 제품연계 Id
        order: item.seqIndex,
        className: "timeline-item-active priority-high",
        itemStatusCode: item.itemStatusCode,
        itemProgStatusCode: item.itemProgStatusCode,
        prevGenDiff: item.prevGenDiff,
        vehicle: item.vehicleTypeCode,
        user: item.updateUserId,
        organizationNm: currGroup?.organizationNm || "",
        statusPlan: "", // 과제계획수립상태
        customerCode: item.customerCode, // OEM
        carModel: item.vehicleTypeCode, // 차종
        roadId: item.roadId, // 로드맵ID
        sopPlanMonth: item.sopPlanMonth, // 양산계획월
        updateDate: item.updateDate, // 최종변경일
        lastApprovalDate: null, // 최종변경승인일 (공통 결재 컴포넌트를 활용하여 연계된 제품 Item 과 로드맵이 승인된 결재 승인일 정보)
        roadmapType: payload.roadmapType,
        validityStatusNm: item.itemStatusCode, // 유효성상태명
        validityStatus: item.itemStatusCode, // 유효성상태 Code
        trmCount: item.trmCount, // 필요기술 갯수
        hasTrm: item.trmCount > 0, // 자식에 필요기술 존재 여부(FE에서 lazy load processing)
        ptrmType: "PRM", // 제품|기술 분류 구분
        priority: item.seqIndex,
        // 이후 분류중
        projectPlanningStatus: item.itemStatusCode,
        // imgInfo: "", // 이미지 경로 (아직 없음)
        techGroup: item["name" + langCode], // 기술그룹명 (Lv1) (excel: item.techGroup)
        techGroupEn: "", // 기술그룹 영문명 (Lv1) (excel: item.EN_techGroup)
        techGroupZn: "", // 기술그룹 중문명 (Lv1) (excel: item.CH_techGroupCh)
        techItem: item["name" + langCode], // 기술ITEM명 (Lv2) (excel: item.techItem)
        techItemEn: "", // 기술ITEM 영문명 (Lv2) (excel: item.EN_techItem)
        techItemZh: "", // 기술ITEM 중문명 (Lv2) (excel: item.CH_techItem)
        writingStatusNm: "작성완료", // 작성상태명
        writingStatus: "code002", // 작성상태 Code
        projectPlanningStatusNm: "과제계획 미수립", // 과제계획수립상태명
        // projectPlanningStatus: "code007", // 과제계획수립상태 Code
        projectExecutionStatusNm: "실행 미연계", // 과제실행상태명
        projectExecutionStatus: "code011", // 과제실행상태 Code
        newBusinessTypeNm: "", // 신사업유형명
        newBusinessType: "", // 신사업유형 Code
      };
    });
}

/** [Helper] 기술분류|공통기술 Items 가공 로직 */
async function getRequireTechnologyItems(reqTechApi: any, payload: any) {
  // const { getTechClassificationName } = useMasterdata();
  const ids = Array.isArray(payload?.productItemIds) ? payload.productItemIds : [];
  if (ids.length === 0) return [];

  const roadmapType = payload?.roadmapType ?? "TRM";
  const fetcher = roadmapType === "TRM" ? reqTechApi.fetchTrm : reqTechApi.fetchTechs;
  const pages = await Promise.all(ids.map((itemId: string) => fetcher(itemId, payload)));
  const content = pages.flat();

  return content.map((item: any, index: number) => ({
    id: item.id,
    title: item["name" + langCode],
    titleEn: item["nameEn"],
    content: item["name" + langCode],
    start: convertDate(item.devStartPlanMonth),
    end: convertDate(item.devEndPlanMonth, true),
    /* 기술분류|공통기술 일 경우 GroupId */
    group: payload.roadmapType === "TRM" ? item.technologyClassLv3Id : item.comTechTypeCode,
    order: index,
    className: "timeline-item-active priority-high",
    comTechTypeId: item.comTechTypeId,
    itemStatusCode: item.techStatusCode,
    itemProgStatusCode: item.techProgStatusCode,
    technologyClassLv1Id: item.technologyClassLv1Id,
    technologyClassLv2Id: item.technologyClassLv2Id,
    technologyClassLv3Id: item.technologyClassLv3Id,
    // technologyClassLv1Name: getTechClassificationName(item.technologyClassLv1Id),
    // technologyClassLv2Name: getTechClassificationName(item.technologyClassLv2Id),
    // technologyClassLv3Name: getTechClassificationName(item.technologyClassLv3Id),
    techTypeCode: item.techTypeCode,
    vehicle: item.vehicleTypeCode,
    user: item.updateUserId,
    organizationNm: item["orgGroupName" + langCode], // 조직명
    roadId: item.roadId, // 로드맵ID
    updateDate: item.updateDate, // 최종변경일
    roadmapType: payload.roadmapType,
    validityStatus: item.techStatusCode, // 유효성상태 Code
    ptrmType: payload.roadmapType,
    hasTrm: false,
  }));
}

export const useTimelineStore = defineStore("tes:timeline", {
  state: (): TimelineState => ({
    groups: [],
    items: [],
    groupsDS: new DataSet([]),
    itemsDS: new DataSet([]),
    loading: false,
    roadmapType: "",
    orgGroups: [],
    selectedRoadId: null,
    getTechNameFn: null as ((code: string) => string) | null,
  }),

  getters: {
    // reqTechApi: () => useRequiredTechs(),
    api: () => useTimelineApi(),
  },

  actions: {
    setTechNameFn(fn: (code: string) => string) {
      this.getTechNameFn = fn;
    },
    /** * 브릿지 주입 Action: 외부 스토어 데이터를 내부 Map으로 복사 */
    async syncDdCode(masterCode: string) {
      try {
        const commData = await this.api.fetchDdCode?.(masterCode);
        if (Array.isArray(commData)) {
          const normalized = commData.map((item: Record<string, unknown>) => ({
            ddValue: String(item.ddValue ?? item.code ?? ""),
            nameKo: String(item.nameKo ?? item.codeNameKo ?? item.ddName ?? item.code ?? ""),
          }));
          // 브릿지 스토리지(Map)에 주입
          commCodeMap.set(masterCode, normalized);
        }
      } catch (error) {
        console.error(`DD Code Sync Error [${masterCode}]:`, error);
      }
    },
    /**
     * [Bridge Logic] Map을 참조하여 명칭을 반환
     */
    getDdName(masterCode: string, code: string) {
      const group = commCodeMap.get(masterCode);
      if (!group) return "";

      const res = group.find((item: any) => item.ddValue === code);
      if (!res) return "";

      return String(res.nameKo ?? res.ddName ?? "");
    },
    /** 조직그룹 마스터 조회 */
    async loadOrgGroups(payload: any) {
      const data = await this.api.fetchOrgGroups(payload);
      this.orgGroups = (data || []).map((item: any) => ({
        id: item.id,
        code: item.code,
        content: item[`name${langCode}`] ?? item.nameKo ?? item.nameEn ?? item.content,
        organizationNm: item[`name${langCode}`] ?? item.nameKo ?? item.nameEn ?? item.content,
        level: 1,
        order: item.seqIndex ?? item.seqOrder ?? 0,
        nestedGroups: [],
        isOrganization: true,
        className: `vis-group-level-1`,
        hasChildren: true,
        isSubGroup: false,
      }));
    },

    /** Groups 데이터 로드 및 계층 구조 빌드 */
    async loadGroups(payload: any) {
      this.loading = true;
      try {
        // 조직 그룹 마스터 정보가 미리 조회 안되었다면 조회하기
        if (this.orgGroups.length === 0) {
          await this.loadOrgGroups(payload);
        }

        // data-fetch (제품군, 기술분류, 공통기술) 종류에 맞게 switching 하여 Repository로 부터 가져오기
        const data = await this.api.fetchGroups(payload);

        // 1. 데이터 Transform & 중복 제거 (Map 활용 최적화)
        const rawMapped = (data || [])
          .filter((g: any) => g.id !== null)
          .map((g: any) => {
            const parentId = g.parentId ?? g.parent;
            const level = typeof g.classLvl === "number" ? g.classLvl + 1 : parentId ? 2 : 1;
            return {
              id: payload.roadmapType === "CMM" ? (g.groupCode ?? g.id) : g.id,
              parent: parentId,
              content: g["name" + langCode] ?? g.nameKo ?? g.nameEn ?? g.content,
              level,
              hasChildren: !!(g.childIds ?? g.hasChildren),
              organizationNm: g["orgName" + langCode] ?? g.organizationNm ?? "",
              nestedGroups: [] as (string | number)[],
              isOrganization: level === 1 || String(g.id).startsWith("ORG-"),
              className: `vis-group-level-${level}`,
              order: g.seq ?? g.seqIndex ?? 0,
              isRoadmapProduct: false,
              isSubGroup: !!parentId,
            };
          });

        const uniqueTreeData = Array.from(new Map(rawMapped.map((item: any) => [item.id, item])).values());

        // 2. 전체 병합
        const fullGroups = payload.roadmapType === "PRM"
          ? [...toRaw(this.orgGroups), ...uniqueTreeData]
          : uniqueTreeData;

        // 3. 관계 매핑 (O(n) 성능 최적화)
        const groupMap = new Map(fullGroups.map((g: any) => [g.id, g]));
        fullGroups.forEach((group: any) => {
          if (group.parent && groupMap.has(group.parent)) {
            const parent = groupMap.get(group.parent);
            if (!parent.nestedGroups.includes(group.id)) {
              parent.nestedGroups.push(group.id);
            }
          }
        });

        this.groups = fullGroups;
        this.groupsDS.clear();
        this.groupsDS.add(this.groups);
      } catch (e) {
        console.error("loadGroups error", e);
      } finally {
        this.loading = false;
      }
    },

    /** Items 데이터 로드 */
    async loadItems(payload: any) {
      this.loading = true;
      try {
        // 필요한 모든 기초 데이터(DD코드, 기술분류)를 병렬로 로드
        await this.syncDdCode("TES.ROAD_STATUS");

        if (payload.roadmapType === "PRM") {
          const rawItems = await getProductItems(this.api, this.groups, payload); // 제품 Items
          const resItems = rawItems.map((item: any) => ({
            ...item,
            itemStatusName: this.getDdName("TES.ROAD_STATUS", item.itemStatusCode),
            // technologyClassLv1Name: this.getTechNameFn ? this.getTechNameFn(item.technologyClassLv1Id) : "",
            // technologyClassLv2Name: this.getTechNameFn ? this.getTechNameFn(item.technologyClassLv12d) : "",
            // technologyClassLv3Name: this.getTechNameFn ? this.getTechNameFn(item.technologyClassLv13d) : "",
          }));
          /* 필요기술 가져와서 연결하기 */
          // const promises = resItems
          //   .filter((e: any, idx: number) => idx === 0)
          //   .map(async (ie: any) => {
          //     const res = await this.getTrms({
          //       roadmapType: this.roadmapType === "PRM" ? "TRM" : "CMM",
          //       productItemIds: [ie.id],
          //     });
          //     return res?.map((te: any) => ({ ...te, itemLink: ie.id, group: ie.group }));
          //   });
          // const subItems = await Promise.all(promises);
          // if (subItems) console.log("subItems:", subItems.flat());
          // this.items = resItems.concat(subItems.flat());
          this.items = resItems;
          this.itemsDS.clear();
          this.itemsDS.add(this.items);
        } else {
          // const reqTechApi = useRequiredTechs();
          this.items = await getRequireTechnologyItems(this.api, payload); // 기술분류|공통기술 Items
          this.itemsDS.clear();
          this.itemsDS.add(this.items);
        }
        console.log(`${payload.roadmapType} items data-fetch result: `, this.items);
      } catch (e) {
        console.error("loadItems error", e);
      } finally {
        this.loading = false;
      }
    },

    /** Item에 속한 필요기술 조회 */
    async getTrms(payload: any) {
      const trms = await getRequireTechnologyItems(this.api, payload);
      return trms;
    },

    reset() {
      this.groups = [];
      this.items = [];
      this.groupsDS.clear();
      this.itemsDS.clear();
      this.roadmapType = "";
      this.orgGroups = [];
    },
  },
});
