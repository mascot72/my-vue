 <!-- "완전한 HTML String 방식"으로 전환하도록 전체 코드에 대해 코드를 효율적으로 Refactory해주고 전체 결과를 알려줘  -->
<template>
  <div class="vis-group-wrapper">

    <label

      :class="[

        'vis-group-label',

        { 'roadmap-product': group.isRoadmapProduct },

      ]"

    >

      <input

        v-if="!group.isOrganization && !group.isSubgroup"

        type="checkbox"

        :checked="isChecked"

        class="mr-1"

        @change="onChange"

      />

      {{ group.content }}

    </label>



    <div

      v-if="group.isOrganization"

      @click.stop

      @mousedown.stop

      @mouseup.stop

      @dblclick.stop

      @pointerdown.stop

    >

      <label class="mr-8 font-size-12">

        {{ msg }}

      </label>

      <n-switch size="small" @update:value="onHistorySwitchChange" />

    </div>

  </div>

</template>



<script setup>

import { NSwitch } from "naive-ui";



const props = defineProps({

  group: {

    type: Object,

    default: () => ({}),

  },

  isChecked: {

    type: Boolean,

    default: true,

  },

  msg: {

    type: String,

    default: null,

  },

});



const emit = defineEmits(["toggle", "history-switch-change"]);



const onChange = (event) => {

  emit("toggle", props.group.id, event.target.checked);

};



const onHistorySwitchChange = (value) => {

  emit("history-switch-change", props.group.id, value);

};



const onLabelEvent = (e) => {

  if (!props.group.isOrganization) {

    e.stopPropagation();

  }

};

</script>



<style lang="scss" scoped>

.vis-group-wrapper {

  display: flex;

  align-items: center;

  justify-content: space-between;

  width: 100%;

  height: 100%;

}

.vis-group-label {

  cursor: pointer;

  display: flex;

  align-items: center;

}

.mr-1 {

  margin-right: 4px;

}

</style>
