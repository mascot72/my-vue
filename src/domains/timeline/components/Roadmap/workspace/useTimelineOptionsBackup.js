// useTimelineOptions.js
import moment from "moment";
import { toRaw } from "vue";
import { useI18n } from "@/modules/core/composables/useI18n.js";

export default function useTimelineOptions({ itemMargin, options, viewMode }) {
  const { locale } = useI18n();

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

  const defaultOptions = {
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
    onAdd: function (item, callback) {
      console.log("called onAdd :", item, callback);
    },
  };

  const makeTimelineOptions = (viewType) => {
    const targetOption = viewType === "MONTH" ? monthOption : quarterOption;
    const currentOptions = toRaw({
      ...defaultOptions,
      ...options,
      ...targetOption,
    });
    // 원본 함수 유지
    if (targetOption.groupTemplate) {
      currentOptions.groupTemplate = targetOption.groupTemplate;
    } else if (options?.groupTemplate) {
      currentOptions.groupTemplate = options?.groupTemplate;
    } else if (defaultOptions.groupTemplate) {
      currentOptions.groupTemplate = defaultOptions.groupTemplate;
    }
    if (targetOption.order) {
      currentOptions.order = targetOption.order;
    } else if (options?.order) {
      currentOptions.order = options?.order;
    } else if (defaultOptions.order) {
      currentOptions.order = defaultOptions.order;
    }

    //처음 시작일, 종료일 지정
    const centerDate = new Date();
    const range = viewMode === "MONTH" ? oneYear * 2 : oneYear * 3; // 3. 시작일과 종료일 계산 (기준일에서 앞뒤로 절반씩)
    const startDate = new Date(centerDate.getTime() - range);
    const endDate = new Date(centerDate.getTime() + range);
    currentOptions.start = startDate;
    currentOptions.end = endDate;
    return currentOptions;
  };

  return {
    makeTimelineOptions,
  };
}
