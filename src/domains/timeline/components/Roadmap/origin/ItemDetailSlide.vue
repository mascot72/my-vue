<!--ItemDetailSlide.vue//-->
<template>
  <dxplm-drawer v-model:show="active" :width="720" :placement="placement" title="SP-EPS"  closable>
    <div :wrap="false" class="dxplm-drawer-items gap0">
      <div class="dxplm-drawer-items-side">

        <!-- ITEM1을 표시하는 버튼 -->
        <label class="side-item" @click="setCurrentItem('ITEM1')">
          <div class="side-item-title">
            <span class="item-select"><input type="radio" name="drawerchk" checked></span>
            <span class="text"><dxplm-label message="rfq.basic-info-subtitle" text="기본 정보"/></span>
            <span :class="['status', statusClass('ITEM1')]">{{ statuslabel('ITEM1') }}</span>
          </div>
        </label>

        <!-- ITEM2를 표시하는 버튼 -->
        <label class="side-item" @click="setCurrentItem('ITEM2')">
          <div class="side-item-title">
            <span class="item-select"><input type="radio" name="drawerchk"></span>
            <span class="text"><dxplm-label message="tes.schedule-info-label" text="일정정보"/></span>
            <span :class="['status', statusClass('ITEM2')]">{{ statuslabel('ITEM2') }}</span>
          </div>
        </label>

        <!-- ITEM3를 표시하는 버튼 -->
        <label class="side-item" @click="setCurrentItem('ITEM3')">
          <div class="side-item-title">
            <span class="item-select"><input type="radio" name="drawerchk"></span>
            <span class="text"><dxplm-label message="tes.target-info-label" text="목표정보"/></span>
            <span :class="['status', statusClass('ITEM3')]">{{ statuslabel('ITEM3') }}</span>
          </div>
        </label>

        <!-- ITEM4를 표시하는 버튼 -->
        <label class="side-item" @click="setCurrentItem('ITEM4')">
          <div class="side-item-title">
            <span class="item-select"><input type="radio" name="drawerchk" /></span>
            <span class="text"><dxplm-label message="cmm.product-info-tab" text="제품정보"/></span>
            <span :class="['status', statusClass('ITEM4')]">{{ statuslabel('ITEM4') }}</span>
          </div>
        </label>

        <!-- ITEM5를 표시하는 버튼 -->
        <label class="side-item" @click="setCurrentItem('ITEM5')">
          <div class="side-item-title">
            <span class="item-select"><input type="radio" name="drawerchk" /></span>
            <span class="text">개발 site 정보</span>
            <span :class="['status', statusClass('ITEM5')]">{{ statuslabel('ITEM5') }}</span>
          </div>
        </label>

        <!-- ITEM6를 표시하는 버튼 -->
        <label class="side-item" @click="setCurrentItem('ITEM6')">
          <div class="side-item-title">
            <span class="item-select"><input type="radio" name="drawerchk" /></span>
            <span class="text"><dxplm-label message="tes.required-tech-tab" text="필요기술 정보"/></span>
            <span :class="['status', statusClass('ITEM6')]">{{ statuslabel('ITEM6') }}</span>
          </div>
        </label>

        <!-- ITEM7를 표시하는 버튼 -->
        <label class="side-item" @click="setCurrentItem('ITEM7')">
          <div class="side-item-title">
            <span class="item-select"><input type="radio" name="drawerchk" /></span>
            <span class="text"><dxplm-label message="cmm.history-tab" text="이력"/></span>
          </div>
        </label>

      </div>
      <div class="dxplm-drawer-items-container">
        <div v-if="currentItem === 'ITEM1'">
          <!-- 기본 정보 -->
          <dxplm-form-box
            label-size="160px"
          >
            <div v-if="!editMode" class="img-box"><img src="@image/tes/ermm/new_sp_eps_3.png" /></div>
            <!-- 1 row -->
            <dxplm-form-item v-else :label="$msg('tes.roadmap-item-image-label', '로드맵 Item 이미지 ')" required no-height>
              <dxplm-flex class="mt-8">
<!--                <ImageUploader :buttonValue="$msg('cmm.upload-image-button', '이미지 업로드 ')" />-->
              </dxplm-flex>
            </dxplm-form-item>
            <!-- 2 row -->
            <dxplm-form-item :label="$msg('tes.roadmap-item-name-label', '로드맵 Item 명 ')" required no-height >
              <dxplm-flex v-if="!editMode" vertical class="w-full">
                <div v-if="locale=='ko'" class="form-read single">
                  <span class="ellipsis">{{ form.text1_1_ko }}</span>
                </div>
                <div v-else-if="locale=='en'" class="form-read single ml-0">
                  <span class="ellipsis">{{ form.text1_1_en }}</span>
                </div>
                <div v-else class="form-read single ml-0">
                  <span class="ellipsis">{{ form.text1_1_zh }}</span>
                </div>
              </dxplm-flex>
              <dxplm-flex v-else vertical class="w-full">
                <dxplm-text-field v-model="form.text1_1_ko" placeholder="ko" />
                <dxplm-text-field v-model="form.text1_1_en" placeholder="en" />
                <dxplm-text-field v-model="form.text1_1_zh" placeholder="zh" />
              </dxplm-flex>
            </dxplm-form-item>
            <!-- 3 row -->
            <dxplm-form-item :label="$msg('cmm.product-group-label', '제품군')" required>
              <div v-if="!editMode" class="form-read single">
                <span class="ellipsis">{{ form.text1_2 }}</span>
              </div>
              <div v-else class="flex w-full gap8">
                <dxplm-text-field v-model="form.text1_2" :placeholder="$msg('cmm.select-button', '선택')" />
                <dxplm-button><dxplm-label message="tes.product-group-selection-screentitle" text="제품군 선택"/></dxplm-button>
              </div>
            </dxplm-form-item>
            <dxplm-form-item :label="$msg('tes.product-group-level4-alpha-label', '제품군 Level 4 +α')">
              <div v-if="!editMode" class="form-read single">
                <span class="ellipsis">{{ form.option1_1 }}</span>
              </div>
              <div v-else class="flex w-full gap8">
                <dxplm-select v-model="form.option1_1" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
                <dxplm-button><dxplm-label message="cmm.add-button" text="추가"/></dxplm-button>
              </div>
            </dxplm-form-item>
            <dxplm-form-item :label="$msg('tes.product-classification-label', '제품구분')">
              <div v-if="!editMode" class="form-read single">
                <span class="ellipsis">{{ form.option1_2 }}</span>
              </div>
              <dxplm-select v-else v-model="form.option1_2" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
            <dxplm-form-item :label="$msg('tes.pjt-planning-execution-exclusion-label', '과제 계획/실행 제외여부')">
              <div v-if="!editMode" class="form-read single">
                <span class="ellipsis">{{ form.option1_3 }}</span>
              </div>
              <dxplm-select v-else v-model="form.option1_3" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
            <dxplm-form-item :label="$msg('tes.execution-mass-production-pjt-label', '실행 양산 프로젝트여부')">
              <div v-if="!editMode" class="form-read single">
                <span class="ellipsis">{{ form.option1_4 }}</span>
              </div>
              <dxplm-select v-else v-model="form.option1_4" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
            <dxplm-form-item :label="$msg('tes.roadmap-item-status-label', '로드맵 Item 상태 ')">
              <div v-if="!editMode" class="form-read single">
                <span class="ellipsis">{{ form.option1_5 }}</span>
              </div>
              <dxplm-select v-else v-model="form.option1_5" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
          </dxplm-form-box>
        </div>

        <!-- <TESD0105PITEM02 v-if="currentItem === 'ITEM2'" /> -->
        <!-- 일정 정보 -->
        <div v-if="currentItem === 'ITEM2'" >
          <dxplm-form-box
            label-size="160px"
          >
            <dxplm-form-item :label="$msg('tes.mass-production-plan-month-sop-label', '양산계획월(SOP)')">
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.date2_1 }}</dxplm-label>
              </div>
              <dxplm-date-picker type="month" v-else v-model="form.date2_1" ></dxplm-date-picker>
            </dxplm-form-item>
            <dxplm-form-item :label="$msg('tes.plan-dev-start-month-label', '개발착수 계획월')" required>
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.date2_2 }}</dxplm-label>
              </div>
              <dxplm-date-picker type="month" v-else v-model="form.date2_2" ></dxplm-date-picker>
            </dxplm-form-item>
            <dxplm-form-item :label="$msg('tes.plan-dev-completion-month-label', '개발완료 계획월')" required>
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.date2_3 }}</dxplm-label>
              </div>
              <dxplm-date-picker type="month" v-else v-model="form.date2_3" ></dxplm-date-picker>
            </dxplm-form-item>
          </dxplm-form-box>
        </div>

        <!-- <TESD0105PITEM03 v-if="currentItem === 'ITEM3'" /> -->
        <div v-if="currentItem === 'ITEM3'">
          <!-- 목표 정보 -->
          <dxplm-form-box
            label-size="160px"
          >
            <dxplm-form-item :label="$msg('tes.target-core-concept-item-label', '목표(핵심컨셉) 항목')" required>
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.option3_1 }}</dxplm-label>
              </div>
              <dxplm-select v-else v-model="form.option3_1" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
            <dxplm-form-item :label="$msg('tes.target-core-concept-value-label', '목표(핵심컨셉) 값')" required>
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.option3_2 }}</dxplm-label>
              </div>
              <dxplm-select v-else v-model="form.option3_2" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
            <dxplm-form-item :label="$msg('tes.target-function-performance-item-label', '목표(기능/성능) 항목')" required>
              <div v-if="!editMode" class="form-read single gap20">
                <span class="ellipsis">{{ form.option3_3_1 }}</span><span class="ellipsis">{{ form.option3_3_2 }}</span>
              </div>
              <div v-else class="flex w-full gap8">
                <dxplm-select v-model="form.option3_3_1" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
                <dxplm-select v-model="form.option3_3_2" :options="options" :placeholder="$msg('cmm.select-button', '선택')"  />
              </div>
            </dxplm-form-item>
            <dxplm-form-item :label="$msg('tes.target-function-performance-value-label', '목표(기능/성능) 값')" required>
              <div v-if="!editMode" class="form-read single gap20">
                <span class="ellipsis">{{ form.text3_4_1 }}</span><span class="ellipsis">{{ form.text3_4_2 }}</span>
              </div>
              <div v-else class="flex w-full gap8">
                <dxplm-text-field v-model="form.text3_4_1" :placeholder="$msg('cmm.input-label', '입력')" />
                <dxplm-text-field v-model="form.text3_4_2" :placeholder="$msg('cmm.input-label', '입력')" />
              </div>
            </dxplm-form-item>
          </dxplm-form-box>
        </div>

        <!-- <TESD0105PITEM04 v-if="currentItem === 'ITEM4'" /> -->
        <div v-if="currentItem === 'ITEM4'">
          <!-- 제품 정보 -->
          <dxplm-form-box
            label-size="160px"
          >
            <dxplm-form-item label="세대정보">
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.text4_1 }}</dxplm-label>
              </div>
              <dxplm-text-field v-else v-model="form.text4_1" :placeholder="$msg('cmm.input-label', '입력')" />
            </dxplm-form-item>
            <dxplm-form-item label="전세대 대비 변화">
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.text4_2 }}</dxplm-label>
              </div>
              <dxplm-text-field v-else v-model="form.text4_2" :placeholder="$msg('cmm.input-label', '입력')" />
            </dxplm-form-item>
            <dxplm-form-item label="신사업 여부">
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.option4_1 }}</dxplm-label>
              </div>
              <dxplm-select v-else v-model="form.option4_1" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
            <dxplm-form-item label="로드맵 전용 제품군 여부(신규 제품군)">
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.option4_2 }}</dxplm-label>
              </div>
              <dxplm-select v-else v-model="form.option4_2" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
            <dxplm-form-item label="기존 제품의 신제품/차세대 제품">
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.option4_3 }}</dxplm-label>
              </div>
              <dxplm-select v-else v-model="form.option4_3" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
          </dxplm-form-box>

          <dxplm-form-box
            label-size="160px" vertical
          >
            <dxplm-form-item label="M-Gate 0 산출물" no-height>
              <!-- 첨부파일 -->
              <!-- <FileDropzone /> -->
            </dxplm-form-item>
            <dxplm-form-item label="M-Gate 1 산출물">
              <!-- 첨부파일 -->
              <!-- <FileDropzone /> -->
            </dxplm-form-item>
          </dxplm-form-box>

          <dxplm-form-box
            label-size="160px"
          >
            <dxplm-form-item label="합작사 제품여부">
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.option4_4 }}</dxplm-label>
              </div>
              <dxplm-select v-else v-model="form.option4_4" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
            <dxplm-form-item label="합작사 정보">
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.option4_5 }}</dxplm-label>
              </div>
              <dxplm-select v-else v-model="form.option4_5" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
          </dxplm-form-box>
        </div>

        <!-- <TESD0105PITEM05 v-if="currentItem === 'ITEM5'" /> -->
        <div v-if="currentItem === 'ITEM5'">
          <!-- 개발 Site 정보 -->
          <dxplm-form-box
            label-size="160px"
          >
            <dxplm-form-item :label="$msg('tes.dev-site-label', '개발 Site')" required>
              <div v-if="!editMode"  class="form-read single">
                <dxplm-label>{{ form.option5_1 }}</dxplm-label>
              </div>
              <dxplm-select v-else v-model="form.option5_1" :options="options" :placeholder="$msg('cmm.select-button', '선택')" />
            </dxplm-form-item>
          </dxplm-form-box>

          <dxplm-form-box
            label-size="160px" vertical
          >
            <dxplm-form-item :label="$msg('tes.optimal-dev-site-consultation-result-label', '최적 개발 Site 협의결과')" no-height>
              <!-- 첨부파일 -->
<!--              <FileDropzone />-->
            </dxplm-form-item>
          </dxplm-form-box>
        </div>

        <!-- 필요기술 정보 -->
        <TESD0105PITEM06 v-if="currentItem === 'ITEM6'" />

        <!-- 이력 -->
        <TESD0105PITEM07 v-if="currentItem === 'ITEM7'" />

      </div>
    </div>

    <template #footer>
      <div class="drawer-extra-action">
        <dxplm-button small @click="" type="default">
          <dxplm-icon type="picto" icon="chat" class="icon-chat mr-2"/> 15
        </dxplm-button>
      </div>
      <div class="drawer-actions">
        <dxplm-button small @click="closePanel" type="default"><dxplm-label message="cmm.cancel-button"
                                                                            text="취소" /></dxplm-button>
        <dxplm-button v-if="!editMode" small solid main @click="handleEdit" type="primary"><dxplm-label
          message="cmm.edit-button" text="수정" /></dxplm-button>
        <dxplm-button v-else small solid main @click="handleSave" type="primary"><dxplm-label message="cmm.save-button" text="저장"/></dxplm-button>
      </div>
    </template>
  </dxplm-drawer>
</template>
<script setup>
import { ref, onMounted, inject, computed } from 'vue';
// import FileDropzone from '../../_component/_FileDropzone.vue';
// import ImageUploader from '../../_component/_ImageUploader.vue'
import TESD0105PITEM06 from './sub/_formItem06.vue'
import TESD0105PITEM07 from './sub/_formItem07.vue'
import { useStore } from 'vuex'
const store = useStore()
const locale = computed(() => store.state.userLanguage)
const $msg = inject('$msg')
const editMode = ref(false)
const handleEdit = () => {
  editMode.value = true
}
const handleSave = () => {
  editMode.value = false
}
const title = ref('로드맵 조회');
const test = ref(null)
const form = ref({
  //기본 정보
  text1_1_ko: 'IDB2 Plus_KO',
  text1_1_en: 'IDB2 Plus_EN',
  text1_1_zh: 'IDB2 Plus_ZH',
  text1_2: 'BRAKE > EBS > IDB > IDB2',
  option1_1: 'BU 제품',
  option1_2: 'N',
  option1_3: 'N',
  option1_4: 'N',
  option1_5: '작성중',
  //일정 정보
  date2_1: '2025-05',
  date2_2: '2025-05',
  date2_3: '2025-05',
  //목표 정보
  option3_1: '',
  option3_2: '',
  option3_3_1: '',
  option3_3_2: '',
  option3_3_3: '',
  text3_4_1: '',
  text3_4_2: '',
  //제품 정보
  text4_1: '',
  text4_2: '',
  option4_1: '',
  option4_2: '',
  option4_3: '',
  option4_4: '',
  option4_5: '',
  //개발 Site 정보
  option5_1: '',
})
const formStatus = ref({
  ITEM1: true,
  ITEM2: true,
  ITEM3: false,
  ITEM4: false,
  ITEM5: false,
  ITEM6: true,
})
const statuslabel = computed(() => {
  return (itemName) => {
    return formStatus.value[itemName] ? $msg('cmm.register-button', '등록') : $msg('cmm.no-registration-button', '미등록')
  }
})
const statusClass = computed(() => (itemName) => {
  return formStatus.value[itemName] ? 'documented' : 'undocumented'
})
const active = ref(false);
const placement = ref("right");
function activate(place) {
  active.value = true;
  placement.value = place;
}
const closePanel = () => {
  active.value = false
}
// 현재 어떤 항목을 표시할지 결정하는 반응형(reactive) 상태 변수 선언
// 초기값은 null 또는 빈 문자열 등으로 설정할 수 있습니다.
const currentItem = ref(null);
// 버튼 클릭 시 호출될 이벤트 핸들러 함수
const setCurrentItem = (item) => {
  currentItem.value = item;
};
onMounted(() => {
  setCurrentItem('ITEM1')
});
defineExpose({
  activate
})
</script>
<style scoped>
</style>
