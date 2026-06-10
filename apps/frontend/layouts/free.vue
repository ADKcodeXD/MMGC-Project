<template>
  <div class="body" ref="body" id="freeBody">
    <MMGCHeader class="flex-shrink-0" />
    <div class="layout-content flex items-center justify-center flex-1">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '~~/stores/global'

const globalState = useGlobalStore()
const body = ref<HTMLElement>()

type LayoutSettings = {
  bgStatistics?: string
}

const bgStatistics = computed(() => {
  const settings = globalState.config?.otherSettings
  if (!settings || typeof settings !== 'object') return ''
  return (settings as LayoutSettings).bgStatistics || ''
})

const applyBackground = (src: string) => {
  if (!body.value || !src) return
  const backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.88)), url("${src}")`
  if (body.value.style.backgroundImage === backgroundImage) return
  body.value.style.backgroundImage = backgroundImage
  body.value.style.backgroundAttachment = 'fixed'
  body.value.style.backgroundSize = 'cover'
  body.value.style.backgroundPosition = 'center'
  body.value.style.width = '100%'
  body.value.style.overflowX = 'hidden'
}

onMounted(() => {
  watch(
    bgStatistics,
    src => {
      if (!src) return
      const bg = new window.Image()
      bg.src = src
      bg.onload = () => {
        applyBackground(bg.src)
      }
    },
    { immediate: true }
  )
})
</script>

<style lang="scss" scoped>
@media screen and (min-width: 320px) {
  .body {
    width: 100%;
    display: flex;
    flex-direction: column;
    min-width: 320px;
    overflow: auto;
  }

  .layout-content {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: 0 16px calc(5.25rem + env(safe-area-inset-bottom));
  }
}

@media screen and (min-width: 1024px) {
  .body {
    min-width: 1024px;
  }
}

@media screen and (min-width: 1440px) {
  .layout-content {
    padding: 0;
  }
}
</style>
