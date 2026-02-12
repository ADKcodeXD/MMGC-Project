<template>
  <div class="step1">
    <div>
      <BasicForm @register="register">
        <template #movieCover="{ model, field }">
          <UploadImg @change-img="changeImg" :online-img="model[field]" />
        </template>
        <template #movieNameTranslate="{ model }">
          <AutoTranslate
            :source-text="model['movieName.cn']"
            @done="(r) => setFieldsValue({ 'movieName.en': r.en, 'movieName.jp': r.jp })"
          />
        </template>
        <template #movieDescTranslate="{ model }">
          <AutoTranslate
            :source-text="model['movieDesc.cn']"
            @done="(r) => setFieldsValue({ 'movieDesc.en': r.en, 'movieDesc.jp': r.jp })"
          />
        </template>
      </BasicForm>
    </div>
    <Divider />
  </div>
</template>
<script lang="ts" setup>
  import { BasicForm, useForm } from '/@/components/Form'
  import { step1Schemas } from '../useMovie'
  import { Divider } from 'ant-design-vue'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'
  import { AutoTranslate } from '/@/components/AutoTranslate'
  const emit = defineEmits(['next'])
  const [register, { validate, setFieldsValue, getFieldsValue }] = useForm({
    labelWidth: 100,
    labelAlign: 'left',
    schemas: step1Schemas,
    actionColOptions: {
      span: 24,
    },
    showResetButton: false,
    submitButtonOptions: {
      text: '下一步',
    },
    submitFunc: customSubmitFunc,
  })

  const changeImg = (val) => {
    setFieldsValue({ movieCover: val })
  }

  async function customSubmitFunc() {
    try {
      await validate()
      emit('next', getFieldsValue())
    } catch (error) {}
  }
</script>
