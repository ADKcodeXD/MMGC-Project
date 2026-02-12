<template>
  <Tabs v-model:active-key="activityVideoKey">
    <TabPane :tab="item.label" v-for="item in source" :key="item.key">
      <div class="my-2 w-4/5">
        <video-player
          :src="videoParams[item.key]"
          v-if="videoParams[item.key] && activityVideoKey === item.key"
          controls
          :fluid="true"
          :volume="0.6"
        />
      </div>
      <BasicUpload
        :maxSize="190"
        :maxNumber="1"
        :api="uploadVideoApi"
        :multiple="false"
        :emptyHidePreview="true"
        :accept="['mp4']"
        :disabled="disabled"
        :value="videoParams[item.key]"
        @update:value="(val) => emit('changeVideoParams', { [activityVideoKey]: Array.isArray(val) ? val[0] : val })"
        v-if="!disabled"
      />
      <div class="my-2">
        <a-input
          :disabled="disabled"
          :value="videoParams[item.key]"
          @input="changeValue"
          placeholder="请输入播放源，可以不使用上传功能，采用其他播放源作为播放链接"
        />
      </div>
    </TabPane>
  </Tabs>
</template>
<script setup lang="ts">
  import 'video.js/dist/video-js.css'
  import { VideoPlayer } from '@videojs-player/vue'
  import { Tabs, TabPane } from 'ant-design-vue'
  import { BasicUpload } from '/@/components/Upload'
  import { uploadVideoApi } from '/@/api/upload/uploadApi'
  import { ref } from 'vue'
  const props = withDefaults(
    defineProps<{
      videoParams: Record<string, any>
      source: Array<{ key: string; label: string; require?: boolean }>
      needInput?: boolean
      disabled?: boolean
    }>(),
    {
      needInput: true,
      disabled: false,
    },
  )
  const emit = defineEmits(['changeVideoParams'])
  defineExpose(['validate'])
  const activityVideoKey = ref(props.source[0].key)

  const changeValue = (e: any) => {
    let val = (e.target && e.target.value) || e || ''
    emit('changeVideoParams', { [activityVideoKey.value]: val })
  }
</script>
