<template>
  <PageWrapper
    :title="`${activityData?.activityName?.cn}活动详情`"
    contentBackground
    @back="goBack"
  >
    <template #extra>
      <a-button type="primary" @click="isEdit = true" v-if="!isEdit">修改信息</a-button>
      <a-button type="primary" color="success" @click="updateActivityFn" v-if="isEdit">
        完成
      </a-button>
      <a-button @click="isEdit = false" v-if="isEdit">取消</a-button>
      <a-button type="primary" danger @click="deleteActivityFn">删除活动</a-button>
    </template>
    <div class="desc-wrap m-4">
      <Tabs v-model:activeKey="activityKey">
        <TabPane key="activity" tab="活动详情">
          <BasicForm @register="register" ref="formRef">
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
              <UploadImg @change-img="changeCover" :online-img="model[field]" :disabled="!isEdit" />
            </template>
            <template #activityBackgroundImg="{ model, field }">
              <UploadImg
                @change-img="changeBackgroundImg"
                :online-img="model[field]"
                :disabled="!isEdit"
              />
            </template>
            <template #activityLogo="{ model, field }">
              <UploadImg @change-img="changeLogo" :online-img="model[field]" :disabled="!isEdit" />
            </template>
            <template #staff="{ model, field }">
              <StaffManagement v-model:value="model[field]" :disabled="!isEdit" />
            </template>
            <template #sponsorId="{ model, field }">
              <SelectRemoteData
                v-model:value="model[field]"
                mode="multiple"
                placeholder="选择赞助商"
                :custom-key="customSponsorKey"
                :custom-api="getSponsorList"
                :disabled="!isEdit"
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
            <template #welcomePageBackgroundVideo="{ model, field }">
              <MovieUpload
                :video-params="{ url: model[field] }"
                :source="welcomeVideoSource"
                :disabled="!isEdit"
                @change-video-params="changeWelcomeVideo"
              />
            </template>
          </BasicForm>
        </TabPane>
        <TabPane key="day" tab="活动天数">
          <DayDetail :activityId="activityData.activityId" v-if="activityData" />
        </TabPane>
        <TabPane key="welcome" tab="欢迎页管理">
          <div class="p-4">
            <p class="text-lg mb-4">欢迎页背景视频设置</p>
            <div class="mb-4">
              <MovieUpload
                :video-params="{ url: activityData?.welcomePageBackgroundVideo || '' }"
                :source="welcomeVideoSource"
                :disabled="!isEdit"
                @change-video-params="changeWelcomeVideo"
              />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
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
  import { Tabs, TabPane } from 'ant-design-vue'
  import { PageWrapper } from '/@/components/Page'
  import TinyMceInput from '/@/views/form/activity/tinymceinput/TinyMceInput.vue'
  import { AutoTranslate } from '/@/components/AutoTranslate'
  import { SelectRemoteData } from '/@/components/SelectRemoteData'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'
  import DayDetail from './DayDetail.vue'
  import { getSponsorList } from '/@/api/sponsor/sponsor'
  import {
    useActivityDetail,
    useChangeTinyI18n,
    activityUpdateScheme,
  } from '/@/hooks/custom/useActivity'
  import MovieUpload from '/@/components/MovieUpload/MovieUpload.vue'
  import StaffManagement from './components/StaffManagement.vue'

  const [register, { validate, getFieldsValue, setFieldsValue, setProps }] = useForm({
    labelAlign: 'left',
    labelWidth: 150,
    wrapperCol: {
      flex: 1,
    },
    schemas: activityUpdateScheme,
    showActionButtonGroup: false,
    showSubmitButton: false,
    showResetButton: false,
    autoFocusFirstItem: true,
    disabled: true,
    fieldMapToTime: [['dateTime', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  })
  const { goBack, activityData, activityKey, isEdit, updateActivityFn, deleteActivityFn } =
    useActivityDetail(setFieldsValue, validate, getFieldsValue, setProps)
  const {
    changeCn,
    changeEn,
    changeJp,
    changeI18n: changeI18n1,
  } = useChangeTinyI18n(getFieldsValue, setFieldsValue, 'desc')
  const changeCover = (val) => {
    setFieldsValue({ activityCover: val })
  }
  const changeLogo = (val) => {
    setFieldsValue({ activityLogo: val })
  }
  const changeBackgroundImg = (val) => {
    setFieldsValue({ activityBackgroundImg: val })
  }
  const customSponsorKey = {
    value: 'sponsorId',
    label: 'sponsorName.cn',
    image: 'sponsorLogo',
  }
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

  const welcomeVideoSource = [
    {
      key: 'url',
      label: '视频链接',
    },
  ]

  const changeWelcomeVideo = async (val) => {
    await setFieldsValue({
      welcomePageBackgroundVideo: val.url,
    })
    if (activityData.value) {
      activityData.value.welcomePageBackgroundVideo = val.url
    }
  }
</script>

<style lang="less" scoped>
  .form-wrap {
    padding: 24px;
    background-color: @component-background;
  }
</style>
