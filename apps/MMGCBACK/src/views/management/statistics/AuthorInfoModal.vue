<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    @ok="handleSubmit"
    @cancel="$emit('close')"
  >
    <BasicForm @register="registerForm">
      <template #avatar>
        <UploadImg
          @change-img="changeAvatar"
          :online-img="formData.authorAvatar"
          :custom-width="280"
        />
      </template>
      <template #matches>
        <div
          v-for="(item, index) in formData.participateMacthes"
          :key="item"
          class="flex items-center my-2"
        >
          <input :value="formData.participateMacthes[index]" @change="e=> changeInput(index, e)" class="w-3/5 p-1 border-light-100 border-solid border-1" />
          <a-button
            shape="circle"
            @click="add"
            preIcon="ant-design:plus-circle-outlined"
            class="mx-2"
          >
          </a-button>
          <a-button
            shape="circle"
            @click="minus(index)"
            preIcon="ant-design:minus-circle-outlined"
            v-if="index !== 0"
          >
          </a-button>
        </div>
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { BasicModal, useModalInner } from '/@/components/Modal'
  import { BasicForm, useForm } from '/@/components/Form/index'
  import { formSchema } from './data/author.data'
  import { saveAuthor, updateAuthor } from '/@/api/statistics/statistics'
  import { StatisticsModel } from '/@/api/statistics/model/statisticsEntity'
  import { useMessage } from '/@/hooks/web/useMessage'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'
  import { Input } from 'ant-design-vue'

  const emit = defineEmits(['success', 'register', 'close'])
  const props = defineProps<{
    record?: StatisticsModel
  }>()

  const { createMessage } = useMessage()

  const formData = ref<any>({
    authorAvatar: '',
    authorName: '',
    authorType: 'normal',
    participateMacthes: [],
    participateTimes: 0,
    consecutiveParticipateTimes: 0,
  })

  const [registerForm, { resetFields, validate, setFieldsValue }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
  })

  const [registerModal, { setModalProps, closeModal, getVisible }] = useModalInner(async () => {
    setModalProps({ confirmLoading: false })
  })

  const changeAvatar = async (val: string) => {
    setFieldsValue({ authorAvatar: val })
    formData.value.authorAvatar = val
    if (val) createMessage.success('上传成功')
  }

  const getTitle = computed(() => (props.record && props.record._id ? '修改信息' : '新增人员'))

  async function handleSubmit() {
    try {
      const values = await validate()
      if(values.consecutiveParticipateTimes)
        values.consecutiveParticipateTimes = parseInt(values.consecutiveParticipateTimes)
      else {
        delete values.consecutiveParticipateTimes
      }
      setModalProps({ confirmLoading: true })
      if (props.record && props.record._id) {
        const params = {
          _id: props.record._id,
          ...values,
          participateMacthes: formData.value.participateMacthes.map((item) => parseInt(item)),
        }
        await updateAuthor(params)
      } else {
        const params = {
          ...values,
          participateMacthes: formData.value.participateMacthes.map((item) => parseInt(item)),
        }
        await saveAuthor(params)
      }
      closeModal()
      clearAll()
      emit('success')
    } finally {
      setModalProps({ confirmLoading: false })
    }
  }

  const add = () => {
    let num = parseInt(
      formData.value.participateMacthes[formData.value.participateMacthes.length - 1],
    )
    formData.value.participateMacthes.push(num + 1)
  }

  const minus = (index) => {
    formData.value.participateMacthes.splice(index, 1)
  }

  const changeInput = (indexedDB, e) => {
    formData.value.participateMacthes[indexedDB] = e.target.value
  }

  const clearAll = () => {
    resetFields()
    formData.value = {
      authorAvatar: '',
      authorName: '',
      authorType: 'normal',
      participateMacthes: [],
      participateTimes: 0,
      consecutiveParticipateTimes: 0,
    }
  }

  watch(
    () => getVisible?.value,
    async () => {
      if (getVisible?.value) {
        clearAll()
        if (props.record && props.record._id) {
          Object.assign(formData.value, props.record)
          await setFieldsValue(props.record)
        }
        if (formData.value.participateMacthes.length === 0) {
          formData.value.participateMacthes = [2024]
          await setFieldsValue({
            participateMacthes: [2024],
          })
        }
      } else {
        clearAll()
      }
    },
    { immediate: true },
  )
</script>
