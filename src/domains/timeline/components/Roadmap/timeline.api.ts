import { useHttp } from "@/modules/core/composables/useHttp";
import { CONST } from "dxplm-component";
import { useRequiredTechs } from "../api/requireTech.api";

const ROADMAP = "roadmap";
export function useTimelineApi() {
  const axios = useHttp();
  const reqTechApi = useRequiredTechs();

  // 조직별 제품군 로드맵 Group 전체 조회
  const fetchGroups = async (payload: any) => {
    const res = await axios.post(`${CONST.REST.TES_PERFIX}/${ROADMAP}/search`, payload);
    const dataRes = res.data;
    return dataRes.content;
  };

  // 조직별 제품군 로드맵 Item 전체 조회
  const fetchItems = async (payload: any) => {
    const query = new URLSearchParams();
    query.set("page", "0");
    query.set("size", "10000");
    const res = await axios.post(`${CONST.REST.TES_PERFIX}/product-items/page-list?${query.toString()}`, payload);
    const dataRes = res.data;
    return dataRes.content;
  };

  // 조직별 그룹 마스터(orgGroupMaster) 전체 조회
  const fetchOrgGroups = async (payload: any) => {
    const query = new URLSearchParams();
    query.set("page", "0");
    query.set("size", "10000");
    const res = await axios.post(`${CONST.REST.TES_PERFIX}/masterdata/org-group-masters?${query.toString()}`, payload);
    const dataRes = res.data;
    return dataRes.content;
  };

  return {
    fetchGroups,
    fetchItems,
    fetchOrgGroups,
    fetchData: reqTechApi.fetchData,
  };
}
