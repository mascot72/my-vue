<template>
  <div
    v-if="show"
    class="info-popup-container"
    :style="{ top: top + 'px', left: left + 'px' }"
  >
    <div class="info-popup-head">
      <div
        :class="[
          'info-popup-tags',
          {
            lock: itemData.writingStatus === 'code001',
            unlock: itemData.writingStatus === 'code002',
          },
        ]"
      >
        <span class="info-popup-name">{{ itemData.organizationNm }}</span>
        <span
          class="info-popup-status"
          v-if="itemData.validityStatus !== 'code003'"
        >
          {{ itemData.validityStatusNm || itemData.validityStatus }}
        </span>
        <template v-else>
          <span
            class="info-popup-status"
            v-if="itemData.writingStatus === 'code001'"
          >
            {{ itemData.writingStatusNm || itemData.writingStatus }}
          </span>
          <span
            class="info-popup-status"
            v-if="props.viewStatus.statusPlan && itemData.projectPlanningStatus"
          >
            {{
              itemData.projectPlanningStatusNm || itemData.projectPlanningStatus
            }}
          </span>
          <span
            class="info-popup-status"
            v-if="
              props.viewStatus.statusExec && itemData.projectExecutionStatus
            "
          >
            {{
              itemData.projectExecutionStatusNm ||
              itemData.projectExecutionStatus
            }}
          </span>
          <span
            class="info-popup-status"
            v-if="props.viewStatus.statusNBiz && itemData.newBusinessType"
          >
            {{ itemData.newBusinessTypeNm || itemData.newBusinessType }}
          </span>
        </template>
      </div>
      <div class="info-popup-comment"></div>
    </div>
    <!--    <div class="info-popup-title">{{ itemData.id }}</div>-->
    <div class="info-popup-title">
      {{ itemData.title }}
    </div>
    <div class="info-popup-body" v-if="itemData">
      <div class="info-popup-group-path">
        {{ levelPath }}
      </div>
      <div class="info-popup-content">
        <div class="info-popup-image" v-if="itemData.ptrmType === 'PRM'">
          <dxplm-flex class="img-box">
            <dxplm-file
              :image="true"
              view-mode
              biz-code="TES"
              :owner-delegate-class="DELEGATE_CLASS"
              :owner-id="itemData.id"
              section-type="-"
            />
          </dxplm-flex>
        </div>
        <ul class="info-popup-list">
          <template v-if="itemData.ptrmType === 'PRM'">
            <li>
              <span class="label"
                ><dxplm-label message="cmm.en-oem-label" text="OEM"
              /></span>
              <span class="ellipsis">{{ itemData.customerCode }}</span>
            </li>
            <li>
              <span class="label"
                ><dxplm-label message="cmm.vehicle-type-label" text="차종"
              /></span>
              <span class="value">{{ itemData.carModel }}</span>
            </li>
            <li>
              <span class="label"
                ><dxplm-label
                  message="tes.mass-production-plan-date-label"
                  text="양산계획일"
              /></span>
              <dxplm-field
                :field="{ type: 'date' }"
                :value="itemData.sopPlanMonth"
              />
            </li>
          </template>
          <template v-else>
            <li>
              <span class="label"
                ><dxplm-label
                  message="tes.plan-dev-start-month-label"
                  text="개발착수 계획월"
              /></span>
              <dxplm-field :field="{ type: 'date' }" :value="itemData.start" />
            </li>
            <li>
              <span class="label"
                ><dxplm-label
                  message="tes.plan-dev-completion-month-label"
                  text="개발종료 계획월"
              /></span>
              <dxplm-field :field="{ type: 'date' }" :value="itemData.end" />
            </li>
          </template>
          <li>
            <span class="label"
              ><dxplm-label
                message="tes.final-change-date-label"
                text="최종 변경일"
            /></span>
            <dxplm-field
              :field="{ type: 'date' }"
              :value="itemData.updateDate"
            />
          </li>
          <li>
            <span class="label"
              ><dxplm-label
                message="tes.final-change-approval-date-label"
                text="최종 변경 승인일"
            /></span>
            <dxplm-field
              :field="{ type: 'date' }"
              :value="itemData.lastApprovalDate"
            />
          </li>
        </ul>
      </div>
    </div>
    <div class="info-popup-actions">
      <div class="info-popup-buttons">
        <dxplm-button md @click="handleSearchProcStatus"
          ><dxplm-label
            message="cmm.view-progress-status-button"
            text="진척현황조회"
        /></dxplm-button>
        <dxplm-button md @click="handleSearchDetail"
          ><dxplm-label message="cmm.detail-view-button" text="상세조회"
        /></dxplm-button>
      </div>
      <div v-if="route.name === 'devSite'" class="info-popup-buttons">
        <dxplm-button md @click=""
          ><dxplm-label
            message="tes.exclude-consultation-button"
            text="선정협의 제외"
        /></dxplm-button>
        <dxplm-button md @click="openCompletePopup"
          ><dxplm-label
            message="tes.complete-consultation-button"
            text="선정협의 완료"
        /></dxplm-button>
      </div>
      <div v-if="props.viewStatus.statusPlan" class="info-popup-button">
        <dxplm-button md class="w-full" @click="handleRegistPjt"
          ><dxplm-label
            message="tes.register-roadmap-pjt-plan-button"
            text="로드맵 과제계획 등록"
        /></dxplm-button>
        <dxplm-button md class="w-full" @click="handleDetailPjt"
          ><dxplm-label
            message="tes.view-roadmap-pjt-detail-view-button"
            text="로드맵 과제계획 상세 조회"
        /></dxplm-button>
      </div>
    </div>
    <div class="info-popup-message" v-if="itemData.writingStatus === 'code001'">
      <dxplm-icon type="picto" icon="roadmap_lock" />
      <p v-if="locale === 'ko'">
        현재 {{ "김만도" }}님이 편집 중 입니다. 동시 수정은 불가능합니다.
      </p>
      <p v-else>
        {{ "Kim Man-do" }} is currently editing. Simultaneous editing is not
        possible.
      </p>
    </div>
  </div>
</template>
<script setup>
import { computed, Fragment } from "vue";
import { useMessage } from "naive-ui";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useMasterdata } from "@/modules/tes/ermm/composables/useMasterdata";
const store = useStore();
const locale = computed(() => store.state.userLanguage);
const route = useRoute();
const { DELEGATE_CLASS } = useMasterdata();
const props = defineProps({
  show: Boolean,
  top: { type: Number, default: 0 },
  left: { type: Number, default: 0 },
  itemData: {
    type: Object,
    default: () => null,
  },
  viewStatus: {
    type: Object,
    default: () => ({
      statusPlan: false,
      statusExec: false,
      statusNBiz: false,
    }),
  },
});
const emit = defineEmits(["update:show", "open-detail"]); // , "open-regist", "open-complete", "open-detailPjt"
const handleSearchDetail = () => {
  // 현재 팝업 닫기
  emit("update:show", false);
  // 상세조회 팝업을 열기 위한 이벤트 발생
  emit("open-detail", props.itemData);
};
const handleRegistPjt = () => {
  // emit("open-regist", props.itemData);
};
const handleDetailPjt = () => {
  // emit("open-detailPjt", props.itemData);
};
const openCompletePopup = () => {
  // emit("open-complete", props.itemData);
};
const message = useMessage();
const handleSearchProcStatus = () => {
  message.success("MVP 대상이 아닙니다.");
  // 진척현황조회 관련 로직 구현
};
const levelPath = computed(() => {
  const item = props.itemData;
  let res;
  if (item.roadmapType === "PRM") {
    res = item.groupPath?.splice(1).join(" > ");
  } else if (item.roadmapType === "TRM") {
    res = item.groupPath?.join(" > ");
  } else {
    res =
      [
        item.technologyClassLv1Name,
        item.technologyClassLv2Name,
        item.technologyClassLv3Name,
      ]
        .filter((e) => e)
        ?.join(" > ") || "";
  }
  return res;
});
</script>
