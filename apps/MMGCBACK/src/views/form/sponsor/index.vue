<template>
  <PageWrapper
    title="新增赞助商"
    contentBackground
    content="新增赞助商，给钱的老板肯定要放在第一位"
    contentClass="p-4"
  >
    <BasicForm @register="register">
      <template #sponsorLogo="{ model, field }">
        <UploadImg @change-img="changeLogo" :online-img="model[field]" />
      </template>
      <template #sponsorNameTranslate="{ model }">
        <AutoTranslate
          :source-text="model['sponsorName.cn']"
          @done="(r) => setFieldsValue({ 'sponsorName.en': r.en, 'sponsorName.jp': r.jp })"
        />
      </template>
      <template #sponsorDesc="{ model, field }">
        <AutoTranslate
          :source-text="model[field]?.cn"
          :is-html="true"
          @done="(r) => changeI18n({ en: r.en || '', jp: r.jp || '' })"
        />
        <TinyMceInput :desc="model[field]" @cn="changeCn" @jp="changeJp" @en="changeEn" />
      </template>
    </BasicForm>
  </PageWrapper>
</template>
<script lang="ts">
  export default {
    name: 'ActivityInput',
    components: { TinyMceInput },
  }
</script>

<script lang="ts" setup>
  import { BasicForm, useForm } from '/@/components/Form'
  import { useMessage } from '/@/hooks/web/useMessage'
  import { PageWrapper } from '/@/components/Page'
  import TinyMceInput from '/@/views/form/activity/tinymceinput/TinyMceInput.vue'
  import { AutoTranslate } from '/@/components/AutoTranslate'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'
  import { router } from '/@/router'
  import { useChangeTinyI18n } from '/@/hooks/custom/useActivity'
  import { sponsorSchema } from './sponsor'
  import { SponsorParams } from '/@/api/sponsor/model/sponsorEntity'
  import { saveSponsor } from '/@/api/sponsor/sponsor'

  const customSubmitFunc = async () => {
    try {
      const formData: SponsorParams = getFieldsValue() as SponsorParams
      await validate()
      setProps({
        submitButtonOptions: {
          loading: true,
        },
      })
      await saveSponsor(formData)
      setProps({
        submitButtonOptions: {
          loading: false,
        },
      })
      createMessage.success('新增成功')
      router.push('/')
    } catch (error) {}
  }

  const { createMessage } = useMessage()
  const [register, { validate, getFieldsValue, setFieldsValue, setProps }] = useForm({
    labelAlign: 'left',
    labelWidth: 150,
    wrapperCol: {
      flex: 1,
    },
    actionColOptions: {
      span: 24,
    },
    schemas: sponsorSchema,
    submitButtonOptions: {
      text: '提交',
    },
    autoFocusFirstItem: true,
    submitFunc: customSubmitFunc,
  })
  const { changeCn, changeEn, changeJp, changeI18n } = useChangeTinyI18n(
    getFieldsValue,
    setFieldsValue,
    'sponsorDesc',
  )
  const changeLogo = (val) => {
    setFieldsValue({ sponsorLogo: val })
  }
</script>
<style lang="less" scoped>
  .form-wrap {
    padding: 24px;
    background-color: @component-background;
  }
</style>
