<template>
  <PageWrapper
    :title="`用户` + memberId + `的资料`"
    content="用户的详情页，你可以在这里对该用户做你想做的操作"
    contentBackground
    @back="goBack"
  >
    <template #extra>
      <a-button type="primary" @click="isEdit = true" v-if="!isEdit">修改信息</a-button>
      <a-button type="primary" color="success" @click="submitFunc" v-if="isEdit">完成</a-button>
      <a-button @click="isEdit = false" v-if="isEdit">取消</a-button>
      <a-button type="primary" danger @click="deleteMember">删除该用户</a-button>
    </template>
    <div class="m-4 desc-wrap">
      <BasicForm @register="register">
        <template #avatar>
          <UploadImg :online-img="formData.avatar" @change-img="changeAvatar" />
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
  import { CropperAvatar } from '/@/components/Cropper'
  import { BasicForm, useForm } from '/@/components/Form'
  import { memberScheme } from './data/member.schema'
  import { getMemberDetail, updateMember, batchDeleteUser } from '/@/api/member/member'
  import { MemberVo } from '/@/api/member/model/memberEntity'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'
  import { uploadImgApi } from '/@/api/upload/uploadApi'
  import { useMessage } from '/@/hooks/web/useMessage'
  import _ from 'lodash'
  const { createMessage, createConfirm } = useMessage()
  const route = useRoute()
  const go = useGo()
  const memberId = ref<number>(parseInt(route.params?.id.toString()))
  const formData = reactive<any>({
    memberId: memberId.value || NaN,
    memberName: '',
    email: '',
    gender: 0,
    desc: '',
    snsSite: null,
    avatar: '',
    role: null,
    username: '',
  })
  const originData = ref({})
  const isEdit = ref<Boolean>(false)
  // 此处可以得到用户ID
  // 页面左侧点击返回链接时的操作
  const goBack = () => {
    go('/management/member')
  }
  const getDetail = async (memberId: number) => {
    const res = await getMemberDetail(memberId)
    originData.value = res.data
    for (const key in formData) {
      formData[key] = res.data[key]
    }
    setFieldsValue(formData)
  }
  const changeAvatar = async (val: string) => {
    const data = { memberId: formData.memberId, avatar: val }
    await updateMember(data as MemberVo)
    createMessage.success('修改头像成功')
    setFieldsValue({ avatar: formData.avatar })
  }
  const [register, { validate, getFieldsValue, setFieldsValue, setProps }] = useForm({
    labelAlign: 'left',
    labelWidth: 100,
    wrapperCol: {
      flex: 1,
    },
    schemas: memberScheme,
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
    const data: MemberVo = getFieldsValue() as MemberVo
    Object.assign(formData, data)
    if (_.has(formData, 'password')) {
      // 如果密码为空，则不修改密码
      if (!formData.password) {
        delete formData.password
      }
    }
    await updateMember(formData)
    await getDetail(memberId.value)
    isEdit.value = false
    createMessage.success('修改成功')
  }
  const deleteMember = async () => {
    createConfirm({
      iconType: 'warning',
      title: '确认删除该用户吗',
      content: '删除该用户将会永久性删除所有数据',
      onOk: async () => {
        await batchDeleteUser([memberId.value])
        createMessage.success('删除成功')
        go('/management/member')
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
    await getDetail(memberId.value)
  })
</script>
