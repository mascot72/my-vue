import { useHttp } from "@/modules/core/composables/useHttp";
import { castArray } from "lodash";
import { CONST } from "dxplm-component";

export const DEFAULT_PAGE_SIZE = 10;

export function useRequiredTechs() {
  const axios = useHttp();

  // data-fetch
  const fetchData = async (payload: any) => {
    try {

      const searchParams = {
        page: 0,
        size: DEFAULT_PAGE_SIZE,
        sort: [],
        nameKo: null,
        roadTypeCode: payload.roadmapType,
      };
      const { page, size, sort } = searchParams;

      // Query String 생성 (Pageable 처리)
      const query = new URLSearchParams();
      query.set("page", page.toString());
      query.set("size", size.toString());
      castArray(sort).forEach((s) => query.append("sort", s));

      // API 호출
      const response = await axios.post(
        `${CONST.REST.TES_PERFIX}/required-techs/page-list?${query.toString()}`,
        payload, // 나머지 필드들은 Body로 전송
      );

      // searchResult.value = response.data;
      return response.data;
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      // isLoading.value = false;
    }
  };

  return {
    fetchData,
  };
}
