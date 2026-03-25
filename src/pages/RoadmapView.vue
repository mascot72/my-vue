<!--
Main Page - Roadmap 조회 화면
같은 방법으로 코드를 refactory해주고 전체 코드를 알려줘!

지금 알려준 템플릿 Item용과 ,Group용을 별도의 파일로 분리해서 import해서 변수 형태로 받아 처리하도록 기능을 나눠주고, 로직과 UI부분을 효율적인 best pratice 형태로 나눠서 전체 기능을 개선하고 HTML방식으로 전체 파일별 전체 코드로 알려줘
-->

<template>
  <dxplm-grid-page :title="$msg('tes.roadmap-view-screentitle', '로드맵 조회')">
    <!-- 화면 Action 버튼-->
    <template #title-action>
      <dxplm-button large>
        <dxplm-label message="cmm.submit-approval-button" text="결재상신"
      /></dxplm-button>
      <!-- <dxplm-button large @click="addTechItem">
        <dxplm-label message="tes.compare-roadmap-button" text="로드맵 비교"
      /></dxplm-button> -->
      <dxplm-button large
        ><dxplm-label message="tes.request-create-roadmap-button" text="로드맵 작성요청"
      /></dxplm-button>
      <div class="button-layer-wrap">
        <dxplm-button
          ref="toggleButtonAdmin"
          primary
          solid
          large
          @click="toggleAdmin"
          :disabled="!store.selectedRoadId"
        >
          <dxplm-label message="cmm.register-button" text="등록" />
          <!-- <span class="mr-4">register-button</span> -->
          <dxplm-icon
            v-dxplm-tooltip="
              !isVisibleAdmin
                ? $msg('cmm.expand-button', '펼치기')
                : $msg('cmm.collapse-button', '접기')
            "
            type="line"
            icon="arrow_down_sm"
            :class="{ deg180: isVisibleAdmin }"
          />
        </dxplm-button>
        <div v-if="isVisibleAdmin" ref="targetAdmin" class="button-layer">
          <dxplm-button
            primary
            solid
            large
            :disabled="!(store.selectedRoadId && store.roadmapType === 'PRM')"
            @click="handleClickCreateRoadmapItem"
            ><dxplm-label message="tes.product-item-registration-screentitle" text="제품 Item 등록"
          /></dxplm-button>
          <dxplm-button
            primary
            solid
            large
            @click="handleClickCreateRoadmapItem"
            :disabled="
              !(
                store.selectedRoadId &&
                (store.roadmapType === 'TRM' || store.roadmapType === 'CMM')
              )
            "
            ><dxplm-label message="tes.required-tech-registration-screentitle" text="필요기술 등록"
          /></dxplm-button>
          <dxplm-button primary solid large @click="closeLayerAdmin" disabled="true"
            ><dxplm-label
              message="tes.roadmap-pjt-plan-registration-screentitle"
              text="로드맵 과제 계획 등록"
          /></dxplm-button>
        </div>
      </div>
    </template>
    <!-- 검색 박스 -->
    <dxplm-search-box
      label-size="130px"
      column="4"
      @search="changedLoadmapType({ isMounted: false })"
      @reset="onReset"
    >
      <dxplm-search-row>
        <dxplm-search-item :label="msg('cmm.organization-label', '조직')" class="search-treearea">
          <dxplm-select
            v-model="search.organizations"
            :placeholder="msg('tes.entire-organization-label', '전체조직')"
            multiple
            max-tag-count="responsive"
            :options="roadmapOrganizationOptions"
          />
        </dxplm-search-item>
        <dxplm-search-item :label="msg('tes.roadmap-class-label', '로드맵 구분')">
          <dxplm-select
            v-model="store.roadmapType"
            dd-code="TES.ROADMAP_TYPE"
            :placeholder="msg('cmm.optional-domain', '선택')"
            :disabled="true"
          />
        </dxplm-search-item>
        <dxplm-search-item :label="msg('bom.progress-status-label', '진행상태')">
          <dxplm-select
            v-model="search.statusCode"
            dd-code="TES.ROAD_STATUS"
            :placeholder="msg('cmm.optional-domain', '선택')"
          />
        </dxplm-search-item>

        <dxplm-search-item>
          <dxplm-checkbox v-model="isHideMode"> 항목있는 레벨만 </dxplm-checkbox>
        </dxplm-search-item>
      </dxplm-search-row>
      <!-- 접고 펼쳐지는 영역 -->
      <template #expandable-zone>
        <dxplm-search-row v-if="store.roadmapType === 'PRM'">
          <dxplm-search-item :label="msg('cmm.en-oem-label', 'OEM')">
            <dxplm-master-customer
              v-model="search.oem"
              :placeholder="$msg('cmm.en-oem-label', 'OEM')"
              class="width-125"
            />
          </dxplm-search-item>

          <dxplm-search-item :label="msg('cmm.vehicle-type-label', '차종')">
            <dxplm-master-vehicle
              v-model="search.vehicle"
              :placeholder="$msg('cmm.vehicle-type-label', '차종')"
              class="width-125"
            />
          </dxplm-search-item>
        </dxplm-search-row>

        <dxplm-search-row v-else>
          <dxplm-search-item :label="$msg('tes.tech-class-large-label', '기술분류(대)')">
            <dxplm-master-product v-model="search.technologyClassLvl1Id" :level="1" />
          </dxplm-search-item>
          <dxplm-search-item :label="$msg('tes.tech-class-medium-label', '기술분류(중)')">
            <dxplm-master-product
              v-model="search.technologyClassLvl2Id"
              :level="2"
              :parentId="search.technologyClassLvl1Id"
            />
          </dxplm-search-item>
          <dxplm-search-item :label="$msg('tes.tech-class-small-label', '기술분류(소)')">
            <dxplm-master-product
              v-model="search.technologyClassLvl3Id"
              :level="3"
              :parentId="search.technologyClassLvl2Id"
            />
          </dxplm-search-item>
        </dxplm-search-row>
        <dxplm-search-row>
          <dxplm-search-item
            v-if="store.roadmapType === 'PRM'"
            :label="msg('tes.mp-plan-month-input-label', '양산계획월 입력')"
          >
            <dxplm-date-picker v-model="search.sopPlanMonth" type="month" is-string-value />
          </dxplm-search-item>

          <dxplm-search-item :label="msg('tes.plan-dev-start-month-label', '개발착수 계획월')">
            <dxplm-date-picker v-model="search.startMonth" type="month" is-string-value />
          </dxplm-search-item>

          <dxplm-search-item :label="msg('tes.plan-dev-completion-month-label', '개발완료 계획월')">
            <dxplm-date-picker v-model="search.endMonth" type="month" is-string-value />
          </dxplm-search-item>
        </dxplm-search-row>
      </template>
    </dxplm-search-box>

    <!-- 로드맵 -->
    <dxplm-box>
      <TimelineRoadmap
        ref="timelineCompRef"
        :item-arr="store.items"
        :group-arr="store.groups"
        :hide-empty-groups="isHideMode"
        @open-detail-slide="activateSlide"
        @changed-loadmap-type="changedLoadmapType"
        @roadmap-create="onRoadmapCreate"
      />
    </dxplm-box>

    <ErmmItemDetailSlide ref="detailSlideRef" />
    <ProductItemCreateModal ref="productItemCreateModal" />
    <ProductItemUpdateSlide
      ref="productItemUpdateSlide"
      v-model:product-item-data="productItemData"
    />
    <RequiredTechCreateModal ref="requiredTechCreateModal" />
    <RequiredTechUpdateSlide
      ref="requiredTechUpdateSlide"
      v-model:required-tech-data="requiredTechData"
    />
  </dxplm-grid-page>
</template>
<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTimelineStore } from '../store/timeline.store'
import { useI18n } from '@/modules/core/composables/useI18n'
import ProductItemCreateModal from '@/modules/tes/ermm/components/modal/productItem/ProductItemCreateModal.vue'
import RequiredTechCreateModal from '@/modules/tes/ermm/components/modal/requiredTech/RequiredTechCreateModal.vue'
import ErmmItemDetailSlide from '../components/ErmmItemDetailSlide.vue'
import TimelineRoadmap from '@/domains/timeline/components/TimelineRoadmap.vue'
import ProductItemUpdateSlide from '@/modules/tes/ermm/components/modal/productItem/ProductItemUpdateSlide.vue'
import RequiredTechUpdateSlide from '@/modules/tes/ermm/components/modal/requiredTech/RequiredTechUpdateSlide.vue'

const { msg } = useI18n()
const productItemData = ref(null)
const requiredTechData = ref(null)
const isHideMode = ref(false)
const timelineCompRef = ref(null) // TimelineRoadmap 컴포넌트 참조
const detailSlideRef = ref(null) // 상세조회 슬라이드 관련
const requiredTechCreateModal = ref(null)
const requiredTechUpdateSlide = ref(null)
const productItemCreateModal = ref(null)
const productItemUpdateSlide = ref(null)
const store = useTimelineStore()
const toggleButtonAdmin = ref(null)
const targetAdmin = ref(null)
const isVisibleAdmin = ref(false)

function toggleAdmin() {
  isVisible.value = false

  isVisibleAdmin.value = !isVisibleAdmin.value
}

function closeLayerAdmin() {
  isVisibleAdmin.value = false
}

const isVisible = ref(false)
const search = ref({
  organizations: [],
  roadmapType: '',
  statusCode: '',
  text: '',
  oem: null,
  vehicle: null,
  status: null,
  concept: null,
  function: null,
  sopPlanMonth: null,
  startMonth: null,
  endMonth: null,
  technologyClassLvl1Id: null,
  technologyClassLvl2Id: null,
  technologyClassLvl3Id: null,
  statusTech: null,
  functionTech: null,
  startDateTech: null,
  completeDateTech: null,
})

// 로드맵 조직 그룹 마스터
const roadmapOrganizationOptions = computed(() =>
  store.orgGroups.map((group) => ({
    label: group.content,
    value: group.id,
  })),
)

function onReset() {
  Object.keys(search.value).forEach((key) => {
    search.value[key] = Array.isArray(search.value[key]) ? [] : null
  })
}

function activateSlide(data) {
  if (store.roadmapType === 'PRM') {
    // 제품정보 상세
    productItemData.value = {
      id: data.id,
      name: data.title,
      roadId: data.roadId,
    }

    productItemUpdateSlide.value?.activate('right')
  } else {
    // 기술분류|공통기술 필요기술 상세
    requiredTechData.value = {
      id: data.id,
      name: data.title,
      roadId: data.roadId,
    }

    requiredTechUpdateSlide.value?.activate('right')
  }
}

function onSaveSuccessful(data) {
  console.log('등록완료', data)
}

// 제품Item 또는 필요기술 등록

function handleClickCreateRoadmapItem() {
  if (store.selectedRoadId) {
    if (store.roadmapType === 'PRM') {
      productItemCreateModal.value.openModal(
        store.selectedRoadId,

        onSaveSuccessful,
      )
    } else {
      requiredTechCreateModal.value.openModal(store.selectedRoadId)
    }

    store.selectedRoadId = null

    closeLayerAdmin()
  }
}

// Timeline에서 선택 취소
const onRoadmapCreate = () => {
  closeLayerAdmin() // 등록버튼 닫기
}

// search
async function changedLoadmapType({ isMounted }) {
  const payload = {
    statusCode: search.value.statusCode,
    customerCode: search.value.oem,
    vehicleTypeCode: search.value.vehicle,
    sopPlanMonth: search.value.sopPlanMonth,
    technologyClassLvl1Id: search.value.technologyClassLvl1Id,
    technologyClassLvl2Id: search.value.technologyClassLvl2Id,
    technologyClassLvl3Id: search.value.technologyClassLvl3Id,
    devStartPlanMonth: search.value.startMonth,
    devEndPlanMonth: search.value.endMonth,
    roadmapType: store.roadmapType,
    parentId: '',
    orgGroupIds: search.value.organizations,
  }

  await store.loadGroups(payload)

  if (!isMounted) {
    await store.loadItems({ ...payload, page: false })
  }
}

// [E] 초기 실행
onMounted(async () => {
  store.roadmapType = 'PRM'
  await changedLoadmapType({ isMounted: false })
})

onUnmounted(() => {
  store.reset()
})
</script>

<style lang="scss" scoped>
.width-125 {
  flex: 1 0 125px !important;

  ::v-deep(.n-select) {
    width: 125px;
  }
}

.dxplm-box {
  margin-top: 0 !important;
}
</style>
