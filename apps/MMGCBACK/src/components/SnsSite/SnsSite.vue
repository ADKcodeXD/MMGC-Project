<template>
  <Tag :color="colorMap[site]?.color" class="flex items-center" :title="value" @click="goSite">
    <template #icon>
      <Icon :icon="colorMap[site]?.icon" v-if="site !== 'bilibili'" />
      <SvgIcon :name="site" v-else />
    </template>
    <span v-if="needText">{{ site === 'personalWebsite' ? '个人网站' : site }}</span>
  </Tag>
</template>
<script setup lang="ts">
  import { Tag } from 'ant-design-vue'
  import { Icon, SvgIcon } from '/@/components/Icon'
  const props = withDefaults(
    defineProps<{
      site: Site
      value: string
      needText?: boolean
    }>(),
    {
      needText: true,
    },
  )
  const colorMap: {
    [K in Site]?: { color: string; icon: string }
  } = {
    youtube: {
      color: '#EE1C25',
      icon: 'ant-design:youtube-outlined',
    },
    niconico: {
      color: '#333333',
      icon: 'ant-design:video-camera-outlined',
    },
    bilibili: {
      color: '#FF3295',
      icon: 'bilibili',
    },
    twitter: {
      color: '#3079FF',
      icon: 'ant-design:twitter-circle-filled',
    },
    personalWebsite: {
      color: '#88aaC8',
      icon: 'ant-design:smile-twotone',
    },
  }

  const goSite = () => {
    window.open(props.value, '_blank')
  }
</script>
