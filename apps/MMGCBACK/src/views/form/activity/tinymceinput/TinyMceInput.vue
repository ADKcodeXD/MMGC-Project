<template>
  <div>
    <Tabs v-model:activeKey="activeTab">
      <TabPane :key="tabList[0]" tab="cn录入">
        <WandEditor :value="desc.cn" :showImageUpload="false" @change="changeCn" />
      </TabPane>
      <TabPane :key="tabList[1]" tab="jp录入">
        <WandEditor :value="desc.jp" :showImageUpload="false" @change="changeJp" />
      </TabPane>
      <TabPane :key="tabList[2]" tab="en录入">
        <WandEditor :value="desc.en" :showImageUpload="false" @change="changeEn" />
      </TabPane>
    </Tabs>
  </div>
</template>
<script setup lang="ts">
  import { useI18nMmgc } from '/@/hooks/custom/useI18n'
  import WandEditor from '/@/components/WandEditor/WandEditor.vue'
  import { Tabs, TabPane } from 'ant-design-vue'
  interface Desc {
    cn: string
    jp?: string
    en?: string
  }
  interface Props {
    desc: Desc
  }
  withDefaults(defineProps<Props>(), {
    desc: () => {
      return {
        cn: '',
        jp: '',
        en: '',
      }
    },
  })
  const emit = defineEmits(['cn', 'jp', 'en'])

  const changeEn = (val: string) => {
    emit('en', val)
  }

  const changeCn = (val: string) => {
    emit('cn', val)
  }

  const changeJp = (val: string) => {
    emit('jp', val)
  }

  const { tabList, activeTab } = useI18nMmgc()
</script>

<style lang="less" scoped>
  :deep(iframe) {
    background-color: rgb(66, 66, 66) !important;
  }
</style>
