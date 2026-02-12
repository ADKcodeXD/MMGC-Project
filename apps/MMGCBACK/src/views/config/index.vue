<template>
  <PageWrapper
    title="系统配置修改"
    contentBackground
    content="一些设置的改动和调整"
    contentClass="p-4"
  >
    <BasicForm @register="register">
      <template #currentActivityId="{ model, field }">
        <SelectRemoteData
          v-model:value="model[field]"
          placeholder="请选择活动"
          :custom-key="customKey"
          :custom-api="getActivityList"
        />
      </template>
      <template #bgStatistics="{ model, field }">
        <UploadImg :online-img="model[field]?.bgStatistics" @change-img="updateBg" />
      </template>
    </BasicForm>
  </PageWrapper>
</template>
<script lang="ts">
  export default {
    name: 'Config',
  }
</script>

<script lang="ts" setup>
  import { BasicForm, useForm } from '/@/components/Form'
  import { useMessage } from '/@/hooks/web/useMessage'
  import { PageWrapper } from '/@/components/Page'
  import { SelectRemoteData } from '/@/components/SelectRemoteData'
  import { router } from '/@/router'
  import { configSchema } from './config'
  import { getActivityList } from '/@/api/activity/activity'
  import { getConfig, saveConfig } from '/@/api/config'
  import { onMounted } from 'vue'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'

  const customSubmitFunc = async () => {
    try {
      const configValues = getFieldsValue()
      await validate()
      setProps({
        submitButtonOptions: {
          loading: true,
        },
      })
      configValues.otherSettings = JSON.stringify(configValues.otherSettings || '{}')
      configValues.currentActivityId = parseInt(configValues.currentActivityId)
      await saveConfig(configValues)
      getConfigFn()
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
    schemas: configSchema,
    submitButtonOptions: {
      text: '提交',
    },
    autoFocusFirstItem: true,
    submitFunc: customSubmitFunc,
    fieldMapToTime: [['dateTime', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  })

  const customKey = {
    value: 'activityId',
    label: 'activityName.cn',
    image: 'activityLogo',
  }

  const getConfigFn = async () => {
    const { data } = await getConfig()
    data.otherSettings = JSON.parse(data.otherSettings || '{}')
    setFieldsValue(data)
  }

  const updateBg = (val: string) => {
    setFieldsValue({
      otherSettings: {
        ...getFieldsValue().otherSettings,
        bgStatistics: val,
      },
    })
  }

  onMounted(() => {
    getConfigFn()
  })
</script>
<style lang="less" scoped>
  .form-wrap {
    padding: 24px;
    background-color: @component-background;
  }
</style>
