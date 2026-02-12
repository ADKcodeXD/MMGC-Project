<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
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
  import { formSchema } from './data/member.data'
  import { addMember } from '/@/api/member/member'

  const emit = defineEmits(['success', 'register'])

  const [registerForm, { resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
  })

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async () => {
    resetFields()
    setModalProps({ confirmLoading: false })
  })

  const getTitle = computed(() => '新增用户')

  async function handleSubmit() {
    try {
      const values = await validate()
      setModalProps({ confirmLoading: true })
      await addMember(values)
      closeModal()
      emit('success')
    } finally {
      setModalProps({ confirmLoading: false })
    }
  }
</script>
