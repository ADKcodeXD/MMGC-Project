<template>
  <div class="welcome-container" @mousemove="onMouseMove">
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
      :style="parallaxStyle"
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

    <!-- 网点材质叠加 -->
    <div class="dot-overlay"></div>

    <!-- 中心径向遮罩 -->
    <div class="center-mask"></div>

    <!-- 左侧切换箭头 -->
    <div class="activity-arrow arrow-left" @click="prevActivity" v-if="activityIds.length > 1">
      <Icon name="ant-design:double-left-outlined" size="28" />
    </div>

    <div class="content flex-col" v-if="activityData">
      <div class="logo-wrapper mb-6">
        <MyCustomImage :img="activityData.activityLogo" class="full-logo" />
      </div>
      <button class="enter-btn" @click="enterActivity">
        {{ $t('enterDetail') }} {{ activityData.activityId }}
      </button>
    </div>

    <!-- 右侧切换箭头 -->
    <div class="activity-arrow arrow-right" @click="nextActivity" v-if="activityIds.length > 1">
      <Icon name="ant-design:double-right-outlined" size="28" />
    </div>

    <!-- 底部灯条 -->
    <div class="marquee-bar bottom" v-if="activityData">
      <div class="marquee-content reverse">
        <span v-for="i in 100" :key="i">MIRAI MAD {{ activityData.activityId }}</span>
      </div>
    </div>

    <MyCustomLoading v-if="isLoading" />
    <img src="@/assets/img/mirai.png" class="mirai-logo mb-8" alt="Mirai MAD" />
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '~~/stores/global'

const localeRoute = useLocaleRoute()
const globalState = useGlobalStore()
const { locale } = useI18n()

// Activity list & switching
const { activityList } = useActivityList()
const activityIds = computed(() => {
  const list = activityList.value?.result
  if (Array.isArray(list)) {
    return list.map((a: any) => a.activityId).sort((a: number, b: number) => b - a)
  }
  return []
})

const selectedActivityId = ref(globalState.config?.currentActivityId || 0)
const activityData = ref<any>(null)
const isLoading = ref(false)

// 视频与视差相关状态需要在 loadActivity 调用前完成初始化
const videoRef = ref<HTMLVideoElement>()
const isMuted = ref(true)
const videoReady = ref(false)
const parallaxX = ref(0)
const parallaxY = ref(0)

const loadActivity = async (id: number) => {
  isLoading.value = true
  videoReady.value = false
  try {
    const detail = useActivityDetail(id)
    const stop = watch(
      detail.activityData,
      val => {
        if (val) {
          activityData.value = val
          stop()
        }
      },
      { immediate: true }
    )
    const stopLoading = watch(
      detail.isLoading,
      val => {
        if (!val) {
          isLoading.value = false
          stopLoading()
        }
      },
      { immediate: true }
    )
  } catch {
    isLoading.value = false
  }
}

loadActivity(selectedActivityId.value)

watch(
  activityIds,
  ids => {
    if (ids.length && !selectedActivityId.value) {
      selectedActivityId.value = ids[0]
      loadActivity(ids[0])
    }
  },
  { immediate: true }
)

const currentIndex = computed(() => {
  const idx = activityIds.value.indexOf(selectedActivityId.value)
  return idx >= 0 ? idx : 0
})

const prevActivity = () => {
  const ids = activityIds.value
  if (ids.length <= 1) return
  const idx = (currentIndex.value - 1 + ids.length) % ids.length
  selectedActivityId.value = ids[idx]
  loadActivity(ids[idx])
}

const nextActivity = () => {
  const ids = activityIds.value
  if (ids.length <= 1) return
  const idx = (currentIndex.value + 1) % ids.length
  selectedActivityId.value = ids[idx]
  loadActivity(ids[idx])
}

const onMouseMove = (e: MouseEvent) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2
  const y = (e.clientY / window.innerHeight - 0.5) * 2
  parallaxX.value = x * -15
  parallaxY.value = y * -15
}

const parallaxStyle = computed(() => ({
  transform: `translate(calc(-50% + ${parallaxX.value}px), calc(-50% + ${parallaxY.value}px)) scale(1.05)`
}))

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
    transform: translate(-50%, -50%) scale(1.05);
    z-index: 1;
    filter: brightness(0.55);
    opacity: 0;
    transition: opacity 0.8s ease, transform 0.15s ease-out;

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
    border-bottom: 5px solid $themeColor;
  }
  &.bottom {
    bottom: 0;
    border-top: 5px solid $themeColor;
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

/* 网点材质正片叠底 */
.dot-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  background-image: url(@/assets/img/dot.png);
  background-size: 350px;
  background-repeat: repeat;
  mix-blend-mode: multiply;
  opacity: 0.2;
  pointer-events: none;
}

/* 中心径向遮罩 */
.center-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, transparent 70%);
  pointer-events: none;
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.logo-wrapper {
  max-width: 500px;
  width: 70vw;

  .full-logo {
    width: 100%;
    height: auto;
    filter: drop-shadow(0 0 20px $themeColorBackShadow) drop-shadow(0 0 60px $themeColorBackShadow);
  }
}

.mirai-logo {
  height: 32px;
  width: auto;
  opacity: 0.7;
  position: absolute;
  bottom: 48px;
  left: 0;
  right: 0;
  margin: 0 auto;
  z-index: 3;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.5));
}

.enter-btn {
  padding: 12px 48px;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 3px;
  color: $themeColor;
  background: transparent;
  border: 2px solid $themeColor;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.35s ease;

  &:hover {
    background: $themeColor;
    color: #000;
    transform: scale(1.05);
    box-shadow: 0 0 20px $themeColorBackShadow;
  }
}

/* 活动切换箭头 */
.activity-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 15;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 16px 8px;
  transition: all 0.3s ease;

  &:hover {
    color: $themeColor;
    transform: translateY(-50%) scale(1.15);
  }

  &.arrow-left {
    left: 24px;
  }
  &.arrow-right {
    right: 24px;
  }
}
</style>
