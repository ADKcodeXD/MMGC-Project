<template>
  <div class="welcome-container">
    <!-- 顶部灯条 -->
    <div class="marquee-bar top" v-if="activityData">
      <div class="marquee-content">
        <span v-for="i in 100" :key="i">MIRAI MAD {{ activityData.activityId }}</span>
      </div>
    </div>

    <!-- 视频加载动画 -->
    <div v-if="currentVideo && !videoReady" class="video-loading">
      <MyCustomLoading />
    </div>

    <video
      v-if="currentVideo"
      ref="videoRef"
      class="background-video"
      :class="{ 'video-loaded': videoReady }"
      autoplay
      muted
      loop
      playsinline
      :src="currentVideo"
      @canplay="videoReady = true"
    ></video>

    <!-- 静音控制按钮 -->
    <div v-if="currentVideo" class="video-controls">
      <button class="mute-toggle" @click="toggleMute">
        <Icon :name="isMuted ? 'mdi:volume-off' : 'mdi:volume-high'" size="24" />
      </button>
    </div>

    <div class="content flex-col" v-if="activityData">
      <div class="logo-wrapper mb-12">
        <MyCustomImage :img="activityData.activityLogo" class="full-logo" />
      </div>
      <ElButton
        type="primary"
        round
        size="large"
        class="enter-btn px-12 py-6 text-xl"
        @click="enterActivity"
      >
        {{ $t('enterDetail') }}
      </ElButton>
    </div>

    <!-- 底部灯条 -->
    <div class="marquee-bar bottom" v-if="activityData">
      <div class="marquee-content reverse">
        <span v-for="i in 100" :key="i">MIRAI MAD {{ activityData.activityId }}</span>
      </div>
    </div>

    <MyCustomLoading v-if="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '~~/stores/global'

const localeRoute = useLocaleRoute()
const globalState = useGlobalStore()
const currentActivityId = computed(() => globalState.config?.currentActivityId || 0)
const { activityData, isLoading } = useActivityDetail(currentActivityId.value)
const { locale } = useI18n()

const videoRef = ref<HTMLVideoElement>()
const isMuted = ref(true)
const videoReady = ref(false)

const currentVideo = computed(() => {
  return activityData.value?.welcomePageBackgroundVideo || null
})

const toggleMute = () => {
  if (videoRef.value) {
    isMuted.value = !isMuted.value
    videoRef.value.muted = isMuted.value
  }
}

const enterActivity = () => {
  if (activityData.value?.activityId) {
    const route = localeRoute(`/activity/${activityData.value.activityId}/about`)
    if (route?.fullPath) {
      navigateTo(route.fullPath)
    }
  }
}
</script>

<style lang="scss" scoped>
.welcome-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(@/assets/2024/newbg.jpg);
  background-size: cover;
  background-position: center;
  overflow: hidden;
  position: relative;

  .background-video {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: translate(-50%, -50%);
    z-index: 1;
    filter: brightness(0.55);
    opacity: 0;
    transition: opacity 0.8s ease;

    &.video-loaded {
      opacity: 1;
    }
  }
}

/* 灯条样式 */
.marquee-bar {
  position: absolute;
  left: 0;
  width: 100%;
  height: 32px;
  background: #000;
  color: #fff;
  z-index: 20;
  display: flex;
  align-items: center;
  overflow: hidden;
  font-family: 'Arial Black', Gadget, sans-serif;
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 1px;

  &.top {
    top: 0;
  }
  &.bottom {
    bottom: 0;
  }
}

.marquee-content {
  display: flex;
  white-space: nowrap;
  animation: marquee 100s linear infinite;

  &.reverse {
    animation: marquee-reverse 100s linear infinite;
  }

  span {
    padding: 0 5px;
  }
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes marquee-reverse {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}

/* 视频加载动画 */
.video-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

/* 视频控制 */
.video-controls {
  position: absolute;
  top: 48px; /* 避开灯条 */
  right: 24px;
  z-index: 30;
}

.mute-toggle {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.logo-wrapper {
  max-width: 500px;
  width: 80vw;

  .full-logo {
    width: 100%;
    height: auto;
    filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.5));
  }
}

.enter-btn {
  font-weight: bold;
  letter-spacing: 2px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }
}
</style>
