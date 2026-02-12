<template>
  <div class="bg-black body" :style="bgStyle">
    <Suspense>
      <NuxtLayout>
        <NuxtPage :activityId="activityId" />
      </NuxtLayout>
      <template #fallback>
        <LoadingPage2 />
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '~~/stores/global'

const route = useRoute()
const activityId = parseInt(route.params.activityId.toString())
const globalStore = useGlobalStore()

const defaultBg = new URL('@/assets/img/bg.png', import.meta.url).href
const bgStyle = computed(() => {
  const bgUrl = globalStore.currentActivityData?.activityBackgroundImg || defaultBg
  return { backgroundImage: `url(${bgUrl})` }
})
</script>

<style lang="scss" scoped>
@media screen and (min-width: 320px) {
  .body {
    width: 100%;
    height: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    background-size: cover;
    min-width: 320px;
    overflow: hidden;
  }
}

@media screen and (min-width: 1024px) {
  .bg {
    min-width: 1024px;
  }
}
</style>
