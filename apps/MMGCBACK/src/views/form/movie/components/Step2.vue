<template>
  <div>
    <BasicForm @register="register">
      <template #moviePlaylink>
        <MovieUpload
          :video-params="videoParams"
          :source="source"
          @change-video-params="changeVideo"
        />
      </template>
    </BasicForm>
  </div>
</template>
<script lang="ts" setup>
  import { BasicForm, useForm } from '/@/components/Form'
  import { step2Schemas } from '../useMovie'
  import { useVideoI18n } from '/@/hooks/custom/useMovie'
  import { useMessage } from '/@/hooks/web/useMessage'
  import MovieUpload from '/@/components/MovieUpload/MovieUpload.vue'
  import 'video.js/dist/video-js.css'
  const { createMessage } = useMessage()
  const emit = defineEmits(['next', 'prev'])
  const [register, { setFieldsValue, getFieldsValue }] = useForm({
    labelWidth: 120,
    labelAlign: 'left',
    schemas: step2Schemas,
    actionColOptions: {
      span: 24,
    },
    submitButtonOptions: {
      text: '下一步',
    },
    resetButtonOptions: {
      text: '上一步',
    },
    submitFunc: customSubmitFunc,
    resetFunc: customResetFunc,
  })

  const { videoParams, source, changeVideo } = useVideoI18n(setFieldsValue)

  async function customResetFunc() {
    emit('prev')
  }

  async function customSubmitFunc() {
    try {
      if (!videoParams.cn) {
        createMessage.error('请上传中文(默认)版视频')
        return
      }
      const values = getFieldsValue()
      emit('next', values)
    } catch (error: any) {}
  }
</script>
