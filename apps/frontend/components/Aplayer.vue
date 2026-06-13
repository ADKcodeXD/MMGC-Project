<template>
  <ClientOnly>
    <div class="plyr-wrapper">
      <div ref="playerContainer" class="plyr-container"></div>
      
      <!-- 水印层 -->
      <div v-if="enableWatermark" class="watermark-overlay" @contextmenu.prevent>
        <img :src="miraiLogo" alt="watermark" />
      </div>

      <!-- 移动端横屏提示 -->
      <div v-if="showOrientationTip" class="orientation-tip">
        <div class="orientation-content">
          <div class="orientation-icon">📱</div>
          <div class="orientation-text">
            <div class="orientation-title">{{ orientationText.title }}</div>
            <div class="orientation-subtitle">{{ orientationText.subtitle }}</div>
          </div>
          <button class="orientation-close" @click="hideOrientationTip">×</button>
        </div>
      </div>

      <div v-if="sources.length > 1" class="source-selector">
        <div class="source-copy">
          <span class="source-label">
            <Icon name="ion:language-sharp" size="14" />
            {{ sourceText.label }}
          </span>
          <small>{{ sourceText.hint }}</small>
        </div>
        <div class="source-actions">
          <button
            v-for="item in sources"
            :key="item.label"
            :class="['source-btn', { active: item.label === currentLabel }]"
            @click="switchSource(item.label)"
          >
            {{ getLanguageText(item.label) }}
          </button>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { calcZip, resolveAssetUrl } from '~~/utils'
import { useGlobalStore } from '~~/stores/global'
import Hls from 'hls.js'
import miraiLogo from '~~/assets/img/mirai.png'

interface VideoSource {
  src: string
  type: string
  label: string
}

const HLS_TYPE = 'application/x-mpegURL'
const MP4_TYPE = 'video/mp4'

const props = defineProps<{
  videoUrl: string | any[] | any
  cover?: string
}>()

const emit = defineEmits(['onPlay', 'onAbort', 'onPause'])
const { locale } = useI18n()

const globalStore = useGlobalStore()
const enableWatermark = computed(() => globalStore.config.enableWatermark ?? true)

const playerContainer = ref<HTMLElement>()
let player: any = null
let hlsInstance: Hls | null = null
let isUnmounted = false
let isInitializing = false
const currentLabel = ref(locale.value)
const isVideoPlaying = ref(false)
const isMobile = ref(false)
const showOrientationTip = ref(false)

const languageTexts = {
  cn: {
    source: {
      label: '语言版本',
      hint: '该作品有多语言版本'
    },
    orientation: {
      title: '获得更好的观看体验',
      subtitle: '请将设备横向旋转'
    },
    languages: {
      zh: '中文',
      'zh-CN': '中文',
      'zh-TW': '繁体中文',
      en: 'English',
      'en-US': 'English',
      jp: '日本語',
      ja: '日本語',
      'ja-JP': '日本語',
      default: '默认'
    }
  },
  en: {
    source: {
      label: 'Language',
      hint: 'This work has multiple language versions'
    },
    orientation: {
      title: 'Better Viewing Experience',
      subtitle: 'Please rotate your device to landscape'
    },
    languages: {
      zh: '中文',
      'zh-CN': '中文',
      'zh-TW': '繁体中文',
      en: 'English',
      'en-US': 'English',
      jp: '日本語',
      ja: '日本語',
      'ja-JP': '日本語',
      default: 'Default'
    }
  },
  jp: {
    source: {
      label: '言語',
      hint: 'この作品には複数の言語版があります'
    },
    orientation: {
      title: 'より良い視聴体験',
      subtitle: 'デバイスを横向きに回転してください'
    },
    languages: {
      zh: '中文',
      'zh-CN': '中文',
      'zh-TW': '繁体中文',
      en: 'English',
      'en-US': 'English',
      jp: '日本語',
      ja: '日本語',
      'ja-JP': '日本語',
      default: 'デフォルト'
    }
  }
}

const currentLanguage = computed(() => {
  const lang = locale.value.split('-')[0]
  const normalizedLang = lang === 'zh' ? 'cn' : lang === 'ja' ? 'jp' : lang
  return languageTexts[normalizedLang as keyof typeof languageTexts] || languageTexts.en
})

const sourceText = computed(() => currentLanguage.value.source)
const orientationText = computed(() => currentLanguage.value.orientation)

const languageLabelMap: Record<string, string> = {
  cn: '中文',
  zh: '中文',
  'zh-CN': '中文',
  jp: '日本語',
  ja: '日本語',
  'ja-JP': '日本語',
  en: 'English',
  'en-US': 'English'
}

const coverzip = computed(() => {
  if (props.cover) {
    return calcZip(props.cover, '0.6x')
  }
  return ''
})

function isHlsSource(url: string) {
  return /\.m3u8(?:[?#].*)?$/i.test(url)
}

function getSourceType(url: string) {
  return isHlsSource(url) ? HLS_TYPE : MP4_TYPE
}

function createVideoSource(url: string, label: string): VideoSource {
  const src = resolveAssetUrl(url)
  return {
    src,
    type: getSourceType(src),
    label
  }
}

const sources = computed<VideoSource[]>(() => {
  if (isArray(props.videoUrl)) {
    return props.videoUrl.map((item: any) => createVideoSource(item.url, item.label))
  } else if (isObject(props.videoUrl)) {
    return Object.keys(props.videoUrl).map((key: string) => createVideoSource(props.videoUrl[key], key))
  } else {
    return [createVideoSource(props.videoUrl, 'default')]
  }
})

const currentSource = computed(() => {
  const found = sources.value.find(item => item.label === currentLabel.value)
  return found || sources.value[0]
})

const currentSrc = computed(() => {
  return currentSource.value?.src || ''
})

// 检测移动设备
function detectMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 获取语言文本
function getLanguageText(label: string): string {
  if (languageLabelMap[label]) return languageLabelMap[label]
  const languages = currentLanguage.value.languages as Record<string, string>
  return languages[label] || label
}

// 检查屏幕方向
function checkOrientation() {
  if (!isMobile.value) return

  const isPortrait = window.innerHeight > window.innerWidth
  if (isPortrait && player?.fullscreen?.active) {
    showOrientationTip.value = true
  } else {
    showOrientationTip.value = false
  }
}

function handleOrientationChange() {
  setTimeout(checkOrientation, 500)
}

// 隐藏横屏提示
function hideOrientationTip() {
  showOrientationTip.value = false
}

// 尝试锁定屏幕方向
function tryLockOrientation() {
  if (!isMobile.value || !player?.fullscreen?.active) return

  if (screen.orientation && (screen.orientation as any).lock) {
    ;(screen.orientation as any).lock('landscape').catch(() => {
      // 如果无法锁定方向，显示提示
      setTimeout(checkOrientation, 500)
    })
  } else {
    // 如果不支持锁定，显示提示
    setTimeout(checkOrientation, 500)
  }
}

// 解锁屏幕方向
function unlockOrientation() {
  if (screen.orientation && (screen.orientation as any).unlock) {
    ;(screen.orientation as any).unlock()
  }
  showOrientationTip.value = false
}

function createVideoElement() {
  const video = document.createElement('video')
  video.poster = coverzip.value || ''
  video.playsInline = true
  video.preload = 'metadata'
  video.crossOrigin = 'anonymous'
  video.setAttribute('playsinline', '')
  video.setAttribute('preload', 'metadata')

  playerContainer.value?.replaceChildren(video)
  return video
}

function updatePlayerSource(currentTime = 0, wasPlaying = false, volume = player?.volume ?? 0.6) {
  if (!player || !currentSrc.value) return

  player.poster = coverzip.value || ''
  const video = player.media as HTMLVideoElement | undefined
  const source = currentSource.value
  
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }

  if (!source) return

  if (source.type === HLS_TYPE && video?.canPlayType('application/vnd.apple.mpegurl')) {
    player.source = {
      type: 'video',
      sources: [source]
    }
    player.once('error', () => emit('onAbort'))
    player.once('loadedmetadata', () => {
      if (currentTime > 0 && currentTime < player.duration) {
        player.currentTime = currentTime
      }
      player.volume = volume
      if (wasPlaying) player.play().catch(console.error)
    })
    return
  }

  if (source.type === HLS_TYPE && Hls.isSupported() && video) {
    hlsInstance = new Hls({
      enableWorker: true
    })
    hlsInstance.attachMedia(video)
    hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
      hlsInstance?.loadSource(source.src)
    })
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      if (currentTime > 0) player.currentTime = currentTime
      player.volume = volume
      if (wasPlaying) player.play().catch(console.error)
    })
    hlsInstance.on(Hls.Events.ERROR, (_, data) => {
      console.error('HLS error:', data)
      if (!data.fatal || !hlsInstance) return
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hlsInstance.startLoad()
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hlsInstance.recoverMediaError()
      } else {
        hlsInstance.destroy()
        hlsInstance = null
        emit('onAbort')
      }
    })
  } else {
    player.source = {
      type: 'video',
      sources: [source]
    }
    player.once('loadedmetadata', () => {
      if (currentTime > 0 && currentTime < player.duration) {
        player.currentTime = currentTime
      }
      player.volume = volume

      if (wasPlaying) {
        player.play().catch(console.error)
      }
    })
  }
}

function bindPlayerEvents() {
  player.on('ready', () => {
    console.log('Plyr is ready')
  })

  player.on('play', () => {
    isVideoPlaying.value = true
    emit('onPlay')
  })

  player.on('pause', () => {
    isVideoPlaying.value = false
    emit('onPause')
  })

  player.on('ended', () => {
    isVideoPlaying.value = false
    emit('onPause')
  })

  player.on('error', (event: any) => {
    console.error('Plyr error:', event)
    emit('onAbort')
  })

  player.on('enterfullscreen', () => {
    if (isMobile.value) {
      tryLockOrientation()
    }
  })

  player.on('exitfullscreen', () => {
    if (isMobile.value) {
      unlockOrientation()
    }
  })
}

async function initPlayer() {
  if (player || isInitializing || !playerContainer.value || !currentSrc.value) return
  isInitializing = true

  const { default: Plyr } = (await import('plyr' as string)) as { default: any }
  if (isUnmounted || !playerContainer.value) {
    isInitializing = false
    return
  }

  const video = createVideoElement()
  const mobileControls = [
    'play-large',
    'play',
    'progress',
    'current-time',
    'duration',
    'mute',
    'settings',
    'fullscreen'
  ]
  const desktopControls = [
    'play-large',
    'restart',
    'rewind',
    'play',
    'fast-forward',
    'progress',
    'current-time',
    'duration',
    'mute',
    'volume',
    'captions',
    'settings',
    'pip',
    'airplay',
    'fullscreen'
  ]

  player = new Plyr(video, {
    controls: isMobile.value ? mobileControls : desktopControls,
    settings: ['quality', 'speed'],
    speed: {
      selected: 1,
      options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    },
    volume: 0.6,
    loop: { active: false },
    keyboard: { focused: true, global: false },
    tooltips: { controls: true, seek: true },
    fullscreen: {
      enabled: true,
      fallback: true,
      iosNative: isMobile.value
    },
    iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
    quality: {
      default: 720,
      options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
    }
  })

  // Prevent right click on video
  video.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })

  updatePlayerSource(0, false, 0.6)

  bindPlayerEvents()
  isInitializing = false
}

// 切换视频源
async function switchSource(label: string) {
  if (currentLabel.value === label) return
  currentLabel.value = label
  if (!player) {
    await initPlayer()
    return
  }

  const currentTime = player.currentTime
  const wasPlaying = !player.paused
  const volume = player.volume

  try {
    updatePlayerSource(currentTime, wasPlaying, volume)
  } catch (error) {
    console.error('Error switching source:', error)
    emit('onAbort')
  }
  return
}

onMounted(async () => {
  isMobile.value = detectMobile()
  await nextTick()
  await initPlayer()
  if (isMobile.value) {
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', checkOrientation)
  }
})

onBeforeUnmount(() => {
  isUnmounted = true
  // Hide player container before destroy to prevent poster flash during transition
  if (playerContainer.value) {
    playerContainer.value.style.opacity = '0'
  }
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
  if (player) {
    player.destroy()
    player = null
  }
  if (isMobile.value) {
    window.removeEventListener('orientationchange', handleOrientationChange)
    window.removeEventListener('orientationchange', checkOrientation)
    window.removeEventListener('resize', checkOrientation)
  }
})

// 监听语言变化，更新当前选中的源
watch(locale, newLocale => {
  const hasMatchingSource = sources.value.some(source => source.label === newLocale)
  if (hasMatchingSource) {
    switchSource(newLocale)
  }
})

watch(currentSrc, async (src, oldSrc) => {
  if (!src) return
  if (!player) {
    await initPlayer()
    return
  }
  if (oldSrc && src !== oldSrc) {
    updatePlayerSource()
  }
})

defineExpose({
  pause: () => player?.pause(),
  play: () => player?.play(),
  player: () => player,
  switchSource
})
</script>

<style lang="scss">
// 导入 Plyr 样式
@use 'plyr/dist/plyr.css';

.plyr-wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 8px;
  position: relative;
}

.plyr-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  video {
    width: 100%;
    height: 100%;
  }

  .plyr {
    width: 100%;
    height: 100%;

    &--video {
      background: #000;
    }
  }

  // 自定义 Plyr 样式，参考官网设计
  .plyr__control {
    &--overlaid {
      background: rgba(0, 123, 255, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 123, 255, 1);
        transform: scale(1.1);
      }
    }
  }

  .plyr__controls {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    border-radius: 0 0 8px 8px;
  }

  .plyr__control {
    color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.plyr__tab-focus {
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.8);
    }
  }

  .plyr__progress {
    &__input {
      &[type='range'] {
        color: #007bff;
      }
    }
  }

  .plyr__volume {
    &__input {
      &[type='range'] {
        color: #007bff;
      }
    }
  }

  // 设置弹出框样式优化
  .plyr__menu {
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px !important;
    backdrop-filter: blur(10px) !important;

    &__container {
      background: black !important;
    }

    &__value,
    &__item {
      color: #fff !important;
      background: transparent !important;
      border-radius: 4px !important;

      &:hover,
      &:focus {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #007bff !important;
      }

      &[aria-checked='true'] {
        background: rgba(0, 123, 255, 0.2) !important;
        color: #007bff !important;
      }
    }

    &__back {
      color: #fff !important;

      &:hover,
      &:focus {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #007bff !important;
      }
    }
  }
}

// 移动端横屏提示
.orientation-tip {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10px);

  .orientation-content {
    background: #fff;
    border-radius: 16px;
    padding: 32px 24px;
    text-align: center;
    max-width: 320px;
    margin: 20px;
    position: relative;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    animation: orientationFadeIn 0.3s ease-out;
  }

  .orientation-icon {
    font-size: 48px;
    margin-bottom: 16px;
    animation: orientationRotate 2s ease-in-out infinite;
  }

  .orientation-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .orientation-subtitle {
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }

  .orientation-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    font-size: 18px;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.2);
      color: #333;
    }
  }
}

@keyframes orientationFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes orientationRotate {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-15deg);
  }
  75% {
    transform: rotate(15deg);
  }
}

// 移动端进度条优化
@media (max-width: 768px) {
  .plyr-container .plyr__controls {
    // 移动端控制栏布局优化
    display: flex;
    flex-wrap: wrap;
    padding: 8px;
    gap: 4px;

    // 进度条单独一行
    .plyr__progress {
      order: -1;
      width: 100% !important;
      margin: 0 0 10px 0;
      height: 18px;
      transform: translateY(-2px);
      &__input {
        &[type='range'] {
          height: 18px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          &::-webkit-slider-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #007bff;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          &::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #007bff;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        }
      }

      &__buffer {
        display: none;
      }

      &__played {
        background: #007bff;
        border-radius: 3px;
      }
    }

    .plyr__control:not(.plyr__progress) {
      flex: 0 0 auto;
      margin: 0 2px;
    }

    .plyr__time {
      font-size: 12px;
      margin: 0 4px;
    }

    .plyr__volume {
      width: auto;
      min-width: 0;

      input[type='range'],
      .plyr__volume__input {
        display: none;
      }
    }
  }
}

.source-selector {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 42px;
  margin: 0 10px 8px;
  padding: 6px 8px 6px 10px;
  opacity: 1;
  overflow: hidden;
  border: 1px solid rgba(252, 197, 95, 0.28);
  border-radius: 14px;
  background: rgba(8, 5, 1, 0.52);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  transition: max-height 0.4s ease, opacity 0.3s ease, padding 0.4s ease;

  .source-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  .source-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.72);
    white-space: nowrap;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  small {
    color: rgba(255, 255, 255, 0.42);
    font-size: 10px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .source-actions {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
  }

  .source-btn {
    min-width: 52px;
    padding: 4px 10px;
    border: 1px solid rgba(252, 197, 95, 0.22);
    background: rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.76);
    cursor: pointer;
    transition: all 0.25s ease;
    white-space: nowrap;

    &:hover {
      color: #fff;
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background: var(--themeColor, #fcc55f);
      border-color: var(--themeColor, #fcc55f);
      color: #000;
      font-weight: 600;
    }

    &:focus {
      outline: none;
    }
  }
}

@media screen and (max-width: 768px), screen and (max-height: 760px) {
  .plyr-wrapper {
    gap: 6px;
  }

  .source-selector {
    min-height: 38px;
    margin: 0 8px 6px;
    padding: 5px 6px 5px 8px;
    gap: 6px;

    .source-label {
      padding: 0;
      overflow: hidden;
      font-size: 11px;
    }

    small {
      max-width: 9rem;
    }

    .source-btn {
      min-width: 40px;
      padding: 3px 8px;
      font-size: 11px;
    }
  }
}

// 暗色主题支持

// 暗色主题支持
@media (prefers-color-scheme: dark) {
  .orientation-tip .orientation-content {
    background: #2a2a2a;
    color: #e0e0e0;

    .orientation-title {
      color: #fff;
    }

    .orientation-subtitle {
      color: #ccc;
    }

    .orientation-close {
      background: rgba(255, 255, 255, 0.1);
      color: #ccc;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
    }
  }
}

.watermark-overlay {
  position: absolute;
  bottom: 8%;
  right: 5%;
  z-index: 10;
  pointer-events: none;
  opacity: 0.7;
  
  img {
    width: 100px;
    height: auto;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  }
}

@media (max-width: 768px) {
  .watermark-overlay {
    bottom: 12%;
    right: 3%;
    img {
      width: 60px;
    }
  }
}
</style>
