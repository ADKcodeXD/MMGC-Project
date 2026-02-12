<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 500px; overflow-y: hidden"
      :model-value="value"
      @update:modelValue="changeValue"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script lang="ts" setup>
  import '@wangeditor/editor/dist/css/style.css' // 引入 css
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
  import { onBeforeUnmount, ref, shallowRef } from 'vue'
  import { useGlobSetting } from '/@/hooks/setting'
  import { useUserStore } from '/@/store/modules/user'
  withDefaults(
    defineProps<{
      value?: string
    }>(),
    {
      value: '',
    },
  )

  const editorRef = shallowRef()
  const mode = ref('default')

  const emit = defineEmits(['change'])

  const changeValue = (val: string) => {
    emit('change', val)
  }
  const { uploadUrl = '' } = useGlobSetting()
  const userstore = useUserStore()
  const toolbarConfig = {}
  const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {
      uploadImage: {
        server: `${uploadUrl}uploadImg`,
        customInsert(res: ResResult<string>, insertFn) {
          insertFn(res.data, '')
        },
        fieldName: 'file',
        maxFileSize: 2 * 1024 * 1024, // 1M
        headers: {
          authorization: `Bearer ${userstore.getToken}`,
        },
        timeout: 30 * 1000,
      },
    },
  }

  // 组件销毁时，也及时销毁编辑器
  onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
  })

  const handleCreated = (editor) => {
    editorRef.value = editor // 记录 editor 实例，重要！
  }
</script>

<style lang="less">
  :root {
    --w-e-textarea-bg-color: rgb(19, 1, 1);
    --w-e-textarea-color: rgb(255, 255, 255);
  }
</style>
