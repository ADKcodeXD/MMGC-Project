<template>
  <PageWrapper
    title="新增活动"
    contentBackground
    content="新增活动，每一个活动对应着相应年份的比赛"
    contentClass="p-4"
  >
    <BasicForm @register="register">
      <template #activityNameTranslate="{ model }">
        <AutoTranslate
          :source-text="model['activityName.cn']"
          @done="(r) => setFieldsValue({ 'activityName.en': r.en, 'activityName.jp': r.jp })"
        />
      </template>
      <template #desc="{ model, field }">
        <AutoTranslate
          :source-text="model[field]?.cn"
          :is-html="true"
          @done="(r) => changeI18n1({ en: r.en || '', jp: r.jp || '' })"
        />
        <TinyMceInput :desc="model[field]" @cn="changeCn" @jp="changeJp" @en="changeEn" />
      </template>
      <template #activityCover="{ model, field }">
        <UploadImg @change-img="changeCover" :online-img="model[field]" />
      </template>
      <template #activityBackgroundImg="{ model, field }">
        <UploadImg @change-img="changeBackgroundImg" :online-img="model[field]" />
      </template>
      <template #activityLogo="{ model, field }">
        <UploadImg @change-img="changeLogo" :online-img="model[field]" />
      </template>
      <template #staff="{ model, field }">
        <StaffManagement v-model:value="model[field]" />
      </template>
      <template #sponsorId="{ model, field }">
        <SelectRemoteData
          v-model:value="model[field]"
          mode="multiple"
          placeholder="选择赞助商"
          :custom-key="customSponsorKey"
          :custom-api="getSponsorList"
        />
      </template>
      <template #rules="{ model, field }">
        <AutoTranslate
          :source-text="model[field]?.cn"
          :is-html="true"
          @done="(r) => changeI18n2({ en: r.en || '', jp: r.jp || '' })"
        />
        <TinyMceInput :desc="model[field]" @cn="changeCn2" @jp="changeJp2" @en="changeEn2" />
      </template>
      <template #timesorother="{ model, field }">
        <AutoTranslate
          :source-text="model[field]?.cn"
          :is-html="true"
          @done="(r) => changeI18n3({ en: r.en || '', jp: r.jp || '' })"
        />
        <TinyMceInput :desc="model[field]" @cn="changeCn3" @jp="changeJp3" @en="changeEn3" />
      </template>
      <template #faq="{ model, field }">
        <AutoTranslate
          :source-text="model[field]?.cn"
          :is-html="true"
          @done="(r) => changeI18n4({ en: r.en || '', jp: r.jp || '' })"
        />
        <TinyMceInput :desc="model[field]" @cn="changeCn4" @jp="changeJp4" @en="changeEn4" />
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
  import TinyMceInput from './tinymceinput/TinyMceInput.vue'
  import { AutoTranslate } from '/@/components/AutoTranslate'
  import { saveActivity } from '/@/api/activity/activity'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'
  import { SelectRemoteData } from '/@/components/SelectRemoteData'
  import StaffManagement from '/@/views/management/activity/components/StaffManagement.vue'
  import { ActivityParams } from '/@/api/activity/model/activityEntity'
  import { router } from '/@/router'
  import { useChangeTinyI18n, activityScheme } from '/@/hooks/custom/useActivity'
  import { getSponsorList } from '/@/api/sponsor/sponsor'

  const customSubmitFunc = async () => {
    try {
      const formData: ActivityParams = getFieldsValue() as ActivityParams
      if (formData.activityBackgroundImg) {
        formData.activityBackgroundImg = formData.activityBackgroundImg[0]
      }
      await validate()
      setProps({
        submitButtonOptions: {
          loading: true,
        },
      })
      await saveActivity(formData)
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
    schemas: activityScheme,
    submitButtonOptions: {
      text: '提交',
    },
    autoFocusFirstItem: true,
    submitFunc: customSubmitFunc,
    fieldMapToTime: [['dateTime', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  })
  const { changeCn, changeEn, changeJp, changeI18n: changeI18n1 } = useChangeTinyI18n(getFieldsValue, setFieldsValue, 'desc')
  const {
    changeCn: changeCn2,
    changeEn: changeEn2,
    changeJp: changeJp2,
    changeI18n: changeI18n2,
  } = useChangeTinyI18n(getFieldsValue, setFieldsValue, 'rules')
  const {
    changeCn: changeCn3,
    changeEn: changeEn3,
    changeJp: changeJp3,
    changeI18n: changeI18n3,
  } = useChangeTinyI18n(getFieldsValue, setFieldsValue, 'timesorother')
  const {
    changeCn: changeCn4,
    changeEn: changeEn4,
    changeJp: changeJp4,
    changeI18n: changeI18n4,
  } = useChangeTinyI18n(getFieldsValue, setFieldsValue, 'faq')

  const customSponsorKey = {
    value: 'sponsorId',
    label: 'sponsorName.cn',
    image: 'sponsorLogo',
  }
  const changeCover = (val) => {
    setFieldsValue({ activityCover: val })
  }
  const changeLogo = (val) => {
    setFieldsValue({ activityLogo: val })
  }
  const changeBackgroundImg = (val) => {
    setFieldsValue({ activityBackgroundImg: val })
  }
</script>
<style lang="less" scoped>
  .form-wrap {
    padding: 24px;
    background-color: @component-background;
  }
</style>
