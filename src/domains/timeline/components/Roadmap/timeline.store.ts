import { toRaw } from "vue";
import { defineStore } from "pinia";
import { useTimelineApi } from "../api/timeline.api";
import { convertDate } from "../utils/dataTransformaer";
import type { TimelineState } from "../types/timeline";
import { DataSet } from "vis-data";
import { userInfo } from "../composables/ermmUtility";

const userData = userInfo();
const langCode = userData.langCode;

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
  const res = await reqTechApi.fetchData(payload);
  if (!res?.content) return [];
  return res.content.map((item: any, index: number) => ({
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
  }),

  getters: {
    // reqTechApi: () => useRequiredTechs(),
    api: () => useTimelineApi(),
  },

  actions: {
    /** 조직그룹 마스터 조회 */
    async loadOrgGroups(payload: any) {
      const data = await this.api.fetchOrgGroups(payload);
      this.orgGroups = (data || []).map((item: any) => ({
        id: item.id,
        content: item[`name${langCode}`],
        organizationNm: item[`name${langCode}`],
        level: 1,
        order: item.seqIndex,
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
            const level = g.classLvl + 1;
            return {
              id: payload.roadmapType === "CMM" ? g.groupCode : g.id, // 공통그룹 일 경우는 groupCode를 id로 세팅하여 items연결하고, 그외에는 id그대로 사용한다.
              parent: g.parentId,
              content: g["name" + langCode],
              level,
              hasChildren: !!g.childIds,
              organizationNm: g["orgName" + langCode],
              nestedGroups: [] as (string | number)[],
              isOrganization: level === 1, // 조직 여부
              className: `vis-group-level-${level}`,
              order: g.seq,
              isRoadmapProduct: false,
              isSubGroup: false,
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
        if (payload.roadmapType === "PRM") {
          this.items = await getProductItems(this.api, this.groups, payload); // 제품 Items
          const promise = new Promise((resolve) => {
            const result: string | any[] = [];
            this.items?.map(async (e: any, idx: any) => {
              if (idx > 0) return;
              this.getTrms({
                roadmapType: this.roadmapType === "PRM" ? "TRM" : "CMM",
                productItemIds: [e.id],
              }).then((res: any) => result.concat(res));
            });
            resolve(result);
          });
          // this.items?.map(async (e: any, idx: any) => {
          // if (idx > 0) return;
          // const trmsOfItem = await this.getTrms({
          //   roadmapType: this.roadmapType === "PRM" ? "TRM" : "CMM",
          //   productItemIds: [e.id],
          // });
          // if (trmsOfItem.length > 0) console.log("trmsOfItem:", trmsOfItem);
          const subItems = await promise;
          if (subItems) console.log("subItems:", subItems);
          this.items.concat(subItems);
          // });
          console.log("this.items:", this.items);
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
