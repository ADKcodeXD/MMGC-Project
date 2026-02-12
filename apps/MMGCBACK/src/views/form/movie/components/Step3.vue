<template>
  <div>
    <BasicForm @register="register">
      <template #authorId="{ model, field }">
        <SelectRemoteData
          v-model:value="model[field]"
          :custom-key="customMemberKey"
          :custom-api="getUserList"
          placeholder="请选择原作者"
        />
      </template>
      <template #activityId="{ model, field }">
        <SelectRemoteData
          v-model:value="model[field]"
          :custom-key="customActivityKey"
          :custom-api="getActivityList"
        />
      </template>
      <template #day="{ model, field }">
        <SelectRemoteData
          v-model:value="model[field]"
          :custom-key="customDayKey"
          :custom-api="getDays"
          :disabled="!model['activityId']"
          :need-page="false"
          :custom-params="model['activityId']"
        />
      </template>
    </BasicForm>
  </div>
</template>
<script lang="ts" setup>
  import { BasicForm, useForm } from '/@/components/Form'
  import { step3Schemas } from '../useMovie'
  import { SelectRemoteData } from '/@/components/SelectRemoteData'
  import { useSelectRemote } from '/@/hooks/custom/useMovie'
  const emit = defineEmits(['end', 'prev'])

  const {
    customMemberKey,
    customActivityKey,
    customDayKey,
    getActivityList,
    getUserList,
    getDays,
  } = useSelectRemote()
  const [register, { validate }] = useForm({
    labelWidth: 120,
    labelAlign: 'left',
    schemas: step3Schemas,
    actionColOptions: {
      span: 24,
    },
    submitButtonOptions: {
      text: '投稿',
    },
    resetButtonOptions: {
      text: '上一步',
    },
    submitFunc: customSubmitFunc,
    resetFunc: customResetFunc,
  })

  async function customResetFunc() {
    emit('prev')
  }

  async function customSubmitFunc() {
    try {
      const values = await validate()
      emit('end', values)
    } catch (error: any) {}
  }
</script>
