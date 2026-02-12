<template>
  <Tabs v-model:active-key="activityVideoKey" type="editable-card" @edit="onEdit">
    <TabPane :tab="item.title" v-for="item in panes" :key="item.key">
      <div class="my-2 w-4/5">
        <video-player
          :src="item.link"
          v-if="item.link && activityVideoKey === item.key"
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
        :value="item.link"
        @update:value="(val) => changeValue(val, item.key)"
        v-if="!disabled"
      />
      <div class="my-2 flex items-center">
        <p class="w-12 mb-0">播放源</p>
        <Input
          :disabled="disabled"
          :value="item.link"
          @update:value="(val) => changeValue(val, item.key)"
          placeholder="请输入播放源，可以不使用上传功能，采用其他播放源作为播放链接"
        />
      </div>
      <div class="my-2 flex items-center">
        <p class="w-12 mb-0">标题</p>
        <Input
          :disabled="disabled"
          v-model:value="item.title"
          placeholder="请输入CM标题"
          @change="change"
        />
      </div>
      <div class="my-2 flex items-center">
        <p class="w-12 mb-0">作者</p>
        <Input
          :disabled="disabled"
          v-model:value="item.cmEditor"
          placeholder="请输入作者名"
          @change="change"
        />
      </div>
      <div class="my-2 flex items-center">
        <p class="w-12 mb-0">简述</p>
        <Input.TextArea
          :disabled="disabled"
          v-model:value="item.desc"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          @change="change"
          placeholder="CM简要的描述"
        />
      </div>
    </TabPane>
  </Tabs>
</template>
<script setup lang="ts">
  import 'video.js/dist/video-js.css'
  import { VideoPlayer } from '@videojs-player/vue'
  import { Tabs, TabPane, Input } from 'ant-design-vue'
  import { BasicUpload } from '/@/components/Upload'
  import { uploadVideoApi } from '/@/api/upload/uploadApi'
  import { ref, watchEffect } from 'vue'
  import _ from 'lodash-es'
  const props = withDefaults(
    defineProps<{
      modelValue: Array<any>
      needInput?: boolean
      disabled?: boolean
    }>(),
    {
      needInput: true,
      disabled: false,
    },
  )
  const emit = defineEmits(['changeCm'])
  const activityVideoKey = ref(1)
  const newTabIndex = ref(1)
  const panes = ref<any>([])
  watchEffect(() => {
    if (props.modelValue && props.modelValue.length > 0) {
      panes.value = props.modelValue.map((item, index) => {
        return {
          ...item,
          key: index + 1,
        }
      })
    } else {
      panes.value = [{ title: 'CM1', key: 1, link: '', cmEditor: undefined, desc: undefined }]
    }
  })

  const add = () => {
    activityVideoKey.value = ++newTabIndex.value
    panes.value.push({
      title: `CM${newTabIndex.value}`,
      key: newTabIndex.value,
      link: '',
      cmEditor: undefined,
      desc: undefined,
    })
  }

  const remove = (targetKey: number) => {
    let lastIndex = 0
    panes.value.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1
      }
    })
    panes.value = panes.value.filter((pane) => pane.key !== targetKey)
    if (panes.value.length && activityVideoKey.value === targetKey) {
      if (lastIndex >= 0) {
        activityVideoKey.value = panes.value[lastIndex].key
      } else {
        activityVideoKey.value = panes.value[0].key
      }
    }
  }

  const changeValue = (val: string | string[], key: number) => {
    let values = val
    if (_.isArray(val)) {
      values = val[0]
    }
    const target = panes.value.find((item) => item.key === key)
    target.link = values
    change()
  }

  const change = () => {
    const newVal = panes.value
      .filter((item) => item.link)
      .map((item) => {
        const _item = _.cloneDeep(item)
        delete _item.key
        return _item
      })
    emit('changeCm', newVal)
  }

  const onEdit = (targetKey: number | MouseEvent, action: string) => {
    if (action === 'add') {
      add()
    } else {
      remove(targetKey as number)
    }
  }
</script>
