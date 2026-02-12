<template>
  <a-button
    type="primary"
    ghost
    size="small"
    :loading="loading"
    :disabled="!sourceText"
    @click="handleTranslate"
  >
    <template #icon><TranslationOutlined /></template>
    AI 翻译
  </a-button>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue'
  import { TranslationOutlined } from '@ant-design/icons-vue'
  import { autoTranslate } from '/@/api/translate/translate'
  import { useMessage } from '/@/hooks/web/useMessage'

  const props = defineProps<{
    /** 原文内容（通常是中文） */
    sourceText?: string
    /** 是否为 HTML 富文本内容 */
    isHtml?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'done', result: I18N): void
  }>()

  const loading = ref(false)
  const { createMessage } = useMessage()

  const sourceText = computed(() => props.sourceText?.trim())

  async function handleTranslate() {
    if (!sourceText.value) return
    loading.value = true
    try {
      const { data } = await autoTranslate(sourceText.value, props.isHtml)
      if (data) {
        emit('done', data as unknown as I18N)
        createMessage.success('翻译完成')
      }
    } catch {
      createMessage.error('翻译失败，请重试')
    } finally {
      loading.value = false
    }
  }
</script>
