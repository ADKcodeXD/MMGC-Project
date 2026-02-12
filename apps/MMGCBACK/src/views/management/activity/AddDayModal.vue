<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <template #themeCover="{ model, field }">
        <div style="width: 300px">
          <UploadImg @change-img="changeThemeCover" :online-img="model[field]" />
        </div>
      </template>
      <template #day="{ model, field }">
        <Input type="number" v-model:value="model[field]" :disabled="isUpdate" />
      </template>
      <template #themeNameTranslate="{ model }">
        <AutoTranslate
          :source-text="model['themeName.cn']"
          @done="(r) => setFieldsValue({ 'themeName.en': r.en, 'themeName.jp': r.jp })"
        />
      </template>
      <template #themeDescTranslate="{ model }">
        <AutoTranslate
          :source-text="model['themeDesc.cn']"
          @done="(r) => setFieldsValue({ 'themeDesc.en': r.en, 'themeDesc.jp': r.jp })"
        />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts">
  export default {
    name: 'DeptModal',
  }
</script>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { BasicModal, useModalInner } from '/@/components/Modal'
  import { BasicForm, useForm } from '/@/components/Form/index'
  import { dayScheme } from '/@/hooks/custom/useActivity'
  import { AutoTranslate } from '/@/components/AutoTranslate'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'
  import { saveDay, updateDay } from '/@/api/activity/activity'
  import { DayVo } from '/@/api/activity/model/activityEntity'
  import { Input } from 'ant-design-vue'

  const props = defineProps<{
    activityId: number
    isUpdate: boolean
    item?: DayVo
  }>()

  const emit = defineEmits(['success', 'register'])

  const getTitle = computed(() => '新增天数')

  const [registerForm, { resetFields, validate, setFieldsValue, getFieldsValue }] = useForm({
    labelWidth: 90,
    labelAlign: 'left',
    baseColProps: { span: 24 },
    schemas: dayScheme,
    showActionButtonGroup: false,
  })

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async () => {
    resetFields()
    setModalProps({ confirmLoading: false })
    if (props.item && props.isUpdate) {
      setFieldsValue(props.item)
    }
  })

  const changeThemeCover = (val) => {
    setFieldsValue({ themeCover: val })
  }

  async function handleSubmit() {
    try {
      await validate()
      const res: any = getFieldsValue()
      res.activityId = props.activityId
      res.day = parseInt(res.day)
      setModalProps({ confirmLoading: true })
      if (props.isUpdate) {
        await updateDay(res)
      } else {
        await saveDay(res)
      }
      closeModal()
      emit('success')
    } finally {
      setModalProps({ confirmLoading: false })
    }
  }
</script>

<style lang="less" scoped>
  :deep(.upload-square) {
    width: 370px !important;
    height: 200px;
  }
</style>
