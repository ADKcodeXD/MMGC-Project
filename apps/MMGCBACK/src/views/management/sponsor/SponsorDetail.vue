<template>
  <PageWrapper
    :title="isEdit ? '修改信息' : '赞助商详情'"
    content="修改或者删除赞助商信息"
    contentBackground
    @back="goBack"
  >
    <template #extra>
      <a-button type="primary" @click="isEdit = true" v-if="!isEdit">修改信息</a-button>
      <a-button type="primary" color="success" @click="submitFunc" v-if="isEdit">完成</a-button>
      <a-button @click="isEdit = false" v-if="isEdit">取消</a-button>
      <a-button type="primary" danger @click="deleteSponsorFn">删除该赞助商</a-button>
    </template>
    <div class="m-4 desc-wrap">
      <BasicForm @register="register">
        <template #sponsorLogo="{ model, field }">
          <UploadImg @change-img="changeLogo" :online-img="model[field]" :disabled="!isEdit" />
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
    </div>
  </PageWrapper>
</template>

<script lang="ts">
  export default {
    name: 'AccountDetail',
    components: { BasicForm },
  }
</script>

<script setup lang="ts">
  import { onMounted, reactive, ref, watchEffect } from 'vue'
  import { useRoute } from 'vue-router'
  import { PageWrapper } from '/@/components/Page'
  import { useGo } from '/@/hooks/web/usePage'
  import { BasicForm, useForm } from '/@/components/Form'
  import { deleteSponsor, getSponsorDetail, updateSponsor } from '/@/api/sponsor/sponsor'
  import { useMessage } from '/@/hooks/web/useMessage'
  import { sponsorSchema } from '/@/views/form/sponsor/sponsor'
  import { SponsorUpdateParams } from '/@/api/sponsor/model/sponsorEntity'
  import { useChangeTinyI18n } from '/@/hooks/custom/useActivity'
  import TinyMceInput from '/@/views/form/activity/tinymceinput/TinyMceInput.vue'
  import { AutoTranslate } from '/@/components/AutoTranslate'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'
  const { createMessage, createConfirm } = useMessage()
  const route = useRoute()
  const go = useGo()
  const sponsorId = ref<number>(parseInt(route.params?.id.toString()))
  const formData = reactive<SponsorUpdateParams>({
    sponsorName: {
      cn: '',
      jp: '',
      en: '',
    },
    sponsorLogo: '',
    sponsorDesc: {
      cn: '',
      jp: '',
      en: '',
    },
    sponsorId: 0,
  })
  const originData = ref({})
  const isEdit = ref<Boolean>(false)
  const goBack = () => {
    go('/management/sponsor')
  }
  const getDetail = async (sponsorId: number) => {
    const res = await getSponsorDetail(sponsorId)
    originData.value = res.data
    for (const key in formData) {
      formData[key] = res.data[key]
    }
    setFieldsValue(formData)
  }
  const changeLogo = (val) => {
    setFieldsValue({ sponsorLogo: val })
  }
  const [register, { validate, getFieldsValue, setFieldsValue, setProps }] = useForm({
    labelAlign: 'left',
    labelWidth: 100,
    wrapperCol: {
      flex: 1,
    },
    schemas: sponsorSchema,
    submitButtonOptions: {
      text: '确认修改',
    },
    actionColOptions: {
      span: 24,
    },
    showResetButton: false,
    showSubmitButton: false,
    autoFocusFirstItem: true,
    compact: true,
    disabled: !isEdit.value,
  })
  const submitFunc = async () => {
    await validate()
    const data: SponsorUpdateParams = getFieldsValue() as SponsorUpdateParams
    Object.assign(formData, data)
    await updateSponsor(formData)
    await getDetail(sponsorId.value)
    isEdit.value = false
    createMessage.success('修改成功')
  }
  const { changeCn, changeEn, changeJp, changeI18n } = useChangeTinyI18n(
    getFieldsValue,
    setFieldsValue,
    'sponsorDesc',
  )
  const deleteSponsorFn = async () => {
    createConfirm({
      iconType: 'warning',
      title: '确认删除该赞助商吗',
      content: '删除该赞助商将会永久性删除所有数据',
      onOk: async () => {
        await deleteSponsor(sponsorId.value)
        createMessage.success('删除成功')
        go('/management/sponsor')
      },
    })
  }
  watchEffect(() => {
    if (!isEdit.value) {
      setFieldsValue(originData.value)
    }
    setProps({ disabled: !isEdit.value })
  })

  onMounted(async () => {
    await getDetail(sponsorId.value)
  })
</script>
