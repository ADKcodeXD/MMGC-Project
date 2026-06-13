<template>
  <div class="video-container-inner">
    <div class="flex-1 topPannel">
      <Aplayer
        v-if="movieItem.moviePlaylink"
        :video-url="movieItem.moviePlaylink"
        :cover="movieItem.movieCover"
        @on-play="onPlayTrack"
        @on-pause="emit('onPause')"
      />
      <div v-else class="w-full h-full">
        <MyCustomImage :img="movieItem.movieCover"></MyCustomImage>
      </div>
    </div>

    <div class="desc-pannel" :class="{ 'desc-collapsed': isPlaying }">
      <p class="desc-title">{{ movieItem.movieName[locale] || movieItem.movieName['cn'] }}</p>
      <div class="desc-detail">
        <div
          class="flex items-end max-w-11/12 author-line"
          :class="{ 'cursor-pointer': authorBiliLink }"
          @click="authorBiliLink && openAuthorLink()"
        >
          <img v-if="authorAvatar" :src="authorAvatar" class="author-avatar mr-2" />
          <MemberPop v-else-if="movieItem.author" :member-vo="movieItem.author" :size="30" />
          <p class="text-light-50 text-xl whitespace-nowrap">
            {{ authorName }}
          </p>
          <ElTooltip
            placement="top"
            :enterable="true"
            popper-class="maxwidth"
            :content="movieItem.movieDesc[locale] || movieItem.movieDesc['cn']"
          >
            <p class="sub-title ml-4">
              {{ movieItem.movieDesc[locale] || movieItem.movieDesc['cn'] }}
            </p>
          </ElTooltip>
        </div>
        <div class="desc-actions" v-if="movieItem.moviePlaylink">
          <ElButton link type="primary" @click="goToMovieDetail(movieItem.movieId)">
            {{ $t('more') }}
          </ElButton>
          <el-popover
            placement="top-end"
            :width="posterDataUrl ? 360 : 280"
            trigger="click"
            popper-class="share-popper"
          >
            <template #reference>
              <button class="share-trigger" type="button" :aria-label="shareText.title">
                <Icon name="ri:share-forward-line" size="16" />
                <span class="share-trigger-label">{{ shareText.title }}</span>
              </button>
            </template>
            <div class="share-popover">
              <div class="share-popover-title">
                <Icon name="ri:share-forward-line" size="16" />
                <span>{{ shareText.title }}</span>
              </div>
              <p class="share-link">{{ shareUrl }}</p>
              <div class="share-actions">
                <ElButton size="small" @click="copyShareLink">
                  <Icon name="ri:file-copy-line" class="mr-1" />
                  {{ shareText.copy }}
                </ElButton>
                <ElButton size="small" type="primary" @click="generatePoster">
                  <Icon name="ri:image-line" class="mr-1" />
                  {{ shareText.poster }}
                </ElButton>
              </div>
              <div class="poster-preview" v-if="posterDataUrl">
                <img :src="posterDataUrl" :alt="shareText.poster" />
                <ElButton class="mt-2" size="small" type="warning" @click="downloadPoster">
                  <Icon name="ri:download-2-line" class="mr-1" />
                  {{ shareText.download }}
                </ElButton>
              </div>
            </div>
          </el-popover>
        </div>
      </div>
    </div>
    <div class="flex flex-col veta-oper" v-if="movieItem.isPublic && movieItem.moviePlaylink">
      <div class="flex items-center operitem flex-col" @click="likeOrUnLike(movieItem)">
        <template v-if="movieItem.loginVo?.isLike">
          <Icon name="ant-design:like-filled" class="text-xl" />
          <p class="operitem-font">{{ movieItem.likeNums }}</p>
        </template>
        <template v-else>
          <Icon name="ant-design:like-outlined" class="text-xl" />
          <p>{{ $t('like') }}</p>
        </template>
      </div>
      <div
        class="flex flex-col items-center my-4 operitem"
        @click="pollByLink(movieItem, dayPollLink)"
      >
        <template v-if="movieItem.loginVo?.isPoll">
          <Icon name="ant-design:profile-filled" class="text-xl" />
          <p class="operitem-font">{{ movieItem.pollNums }}</p>
        </template>
        <template v-else>
          <Icon name="ant-design:profile-outlined" class="text-xl" />
          <p>{{ $t('polls') }}</p>
        </template>
      </div>
      <el-popover
        v-if="movieItem.movieDownloadLink"
        placement="left"
        :width="200"
        trigger="click"
        popper-class="popover"
      >
        <template #reference>
          <div class="flex items-center operitem flex-col">
            <Icon name="ant-design:download-outlined" class="text-xl" />
            <p>DL</p>
          </div>
        </template>
        <div class="flex flex-wrap justify-center items-center gap-3 py-1">
          <div
            v-if="movieItem.movieDownloadLink?.google"
            class="text-4xl cursor-pointer"
            @click="openLink(movieItem.movieDownloadLink.google)"
          >
            <Icon name="logos:google-drive" />
          </div>
          <div
            v-if="movieItem.movieDownloadLink?.baidu"
            class="text-4xl cursor-pointer"
            @click="openLink(movieItem.movieDownloadLink.baidu)"
          >
            <Icon name="simple-icons:baidu" class="text-blue-600" />
          </div>
          <div
            v-if="movieItem.movieDownloadLink?.onedrive"
            class="text-4xl cursor-pointer"
            @click="openLink(movieItem.movieDownloadLink.onedrive)"
          >
            <Icon name="logos:microsoft-onedrive" />
          </div>
          <div
            v-if="movieItem.movieDownloadLink?.other"
            class="text-4xl cursor-pointer"
            @click="openLink(movieItem.movieDownloadLink.other)"
          >
            <Icon name="material-symbols:link-rounded" class="text-green-600" />
          </div>
        </div>
      </el-popover>
    </div>
  </div>
  <el-dialog v-model="pollDialogShow" :title="$t('PollLink')" width="400" draggable>
    <div class="p-4">
      <div>
        <p v-if="dayPollLink?.bilibili">
          <Icon name="ri:bilibili-line" size="20" class="mr-2" />{{ $t('bilibiliPoll') }}
          <a :href="dayPollLink?.bilibili" target="_blank" style="color: #abf7ff" @click="$track('click_external_poll', { platform: 'bilibili', url: dayPollLink?.bilibili, movieId: movieItem.movieId })">{{
            $t('clickJump')
          }}</a>
        </p>
        <p v-if="dayPollLink?.twitter" class="my-4">
          <Icon name="ri:twitter-x-line" size="20" class="mr-2" />{{ $t('pollTwitter') }}
          <a :href="dayPollLink?.twitter" target="_blank" style="color: #abf7ff" @click="$track('click_external_poll', { platform: 'twitter', url: dayPollLink?.twitter, movieId: movieItem.movieId })">{{
            $t('clickJump')
          }}</a>
        </p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import type { MovieVo } from '~~/types/movie.type'
import { useGlobalStore } from '~~/stores/global'
import { resolveAssetUrl } from '~~/utils'

const globalStore = useGlobalStore()
const { $track } = useNuxtApp()
const props = defineProps<{
  movieItem: MovieVo | any
  dayPollLink?: Sns | null
  isPlaying?: boolean
}>()
const emit = defineEmits(['onPlay', 'onPause'])
const pollDialogShow = ref(false)
const posterDataUrl = ref('')

const pollByLink = (movie: MovieVo, dayPollLink?: Sns | null) => {
  if (dayPollLink && (dayPollLink.bilibili || dayPollLink.twitter || dayPollLink.personalWebsite)) {
    pollDialogShow.value = true
  } else {
    pollMovie(movie)
  }
}

const onPlayTrack = () => {
  emit('onPlay')
  $track('play_video', { movieId: props.movieItem.movieId, movieName: props.movieItem.movieName })
}

const { locale } = useCurrentLocale()
const { pollMovie, likeOrUnLike, goToMovieDetail } = useMovieOperate()
const route = useRoute()

const localeText = {
  cn: {
    title: '分享作品',
    copy: '复制链接',
    poster: '生成海报',
    download: '下载海报',
    copied: '链接已复制',
    posterFailed: '海报生成失败，请复制链接分享',
    scan: '扫码观看',
    bannerSuffix: '作品'
  },
  en: {
    title: 'Share',
    copy: 'Copy Link',
    poster: 'Generate Poster',
    download: 'Download',
    copied: 'Link copied',
    posterFailed: 'Poster failed. Please share the link instead.',
    scan: 'Scan to watch',
    bannerSuffix: 'Work'
  },
  jp: {
    title: '共有',
    copy: 'リンクをコピー',
    poster: 'ポスター生成',
    download: '保存',
    copied: 'リンクをコピーしました',
    posterFailed: 'ポスター生成に失敗しました。リンクを共有してください。',
    scan: 'スキャンして視聴',
    bannerSuffix: '作品'
  }
}

const shareText = computed(() => {
  const key = locale.value === 'jp' ? 'jp' : locale.value === 'en' ? 'en' : 'cn'
  return localeText[key]
})

const movieTitle = computed(() => {
  return props.movieItem.movieName?.[locale.value] || props.movieItem.movieName?.cn || ''
})

const movieDesc = computed(() => {
  return props.movieItem.movieDesc?.[locale.value] || props.movieItem.movieDesc?.cn || ''
})

const authorName = computed(() => {
  return props.movieItem.author?.memberName || props.movieItem.authorName || ''
})

const authorAvatar = computed(() => {
  return resolveAssetUrl(props.movieItem.authorAvatar || props.movieItem.author?.avatar || '')
})

const authorBiliLink = computed(() => {
  return props.movieItem.authorSpaceUrl || props.movieItem.movieLink?.bilibili || ''
})

const openAuthorLink = () => {
  if (process.client && authorBiliLink.value) window.open(authorBiliLink.value, '_blank')
}

const activityYear = computed(() => {
  return route.params.activityId?.toString() || props.movieItem.day?.toString() || ''
})

const shareUrl = computed(() => {
  if (!process.client) return ''
  const url = new URL(window.location.href)
  const day = props.movieItem.day || route.query.day
  if (day) url.searchParams.set('day', day.toString())
  url.searchParams.set('movieId', props.movieItem.movieId.toString())
  return url.toString()
})

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const copyShareLink = async () => {
  if (!shareUrl.value) return
  await navigator.clipboard.writeText(shareUrl.value)
  ElMessage.success(shareText.value.copied)
  $track('copy_share_link', { movieId: props.movieItem.movieId, movieName: props.movieItem.movieName })
}

const loadCanvasImage = async (src: string): Promise<HTMLImageElement | null> => {
  if (!src) return null
  src = resolveAssetUrl(src)
  // 必须带 crossOrigin='anonymous' 加载，否则 canvas 会被污染导致 toDataURL 报安全错误
  // 先用原始 URL 尝试
  const tryLoad = (url: string): Promise<HTMLImageElement | null> =>
    new Promise(resolve => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = () => resolve(null)
      image.src = url
    })

  const img = await tryLoad(src)
  if (img) return img

  // 加时间戳破缓存再试一次（解决 CDN 缓存了无 CORS 头的响应）
  const bustUrl = src.includes('?') ? `${src}&_cb=${Date.now()}` : `${src}?_cb=${Date.now()}`
  return await tryLoad(bustUrl)
}

const drawCover = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, 28)
  ctx.clip()
  if (image) {
    const scale = Math.max(width / image.width, height / image.height)
    const drawWidth = image.width * scale
    const drawHeight = image.height * scale
    ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight)
  } else {
    const fallback = ctx.createLinearGradient(x, y, x + width, y + height)
    fallback.addColorStop(0, '#2d1b03')
    fallback.addColorStop(0.45, '#8d6422')
    fallback.addColorStop(1, '#080502')
    ctx.fillStyle = fallback
    ctx.fillRect(x, y, width, height)
  }
  ctx.restore()
}

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) => {
  let line = ''
  let lines = 0
  const characters = text.split('')
  for (let i = 0; i < characters.length; i += 1) {
    const testLine = line + characters[i]
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(lines === maxLines - 1 ? `${line.slice(0, Math.max(0, line.length - 1))}...` : line, x, y)
      y += lineHeight
      lines += 1
      line = characters[i]
      if (lines >= maxLines) return y
    } else {
      line = testLine
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y)
  return y + lineHeight
}

const drawQrFallback = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.fillStyle = '#fff7df'
  ctx.fillRect(x, y, size, size)
  ctx.fillStyle = '#211402'
  ctx.font = '22px sans-serif'
  ctx.textAlign = 'center'
  wrapText(ctx, shareUrl.value, x + 14, y + size / 2 - 20, size - 28, 28, 4)
  ctx.textAlign = 'left'
}

const generatePoster = async () => {
  if (!process.client) return
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 1400
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const cover = await loadCanvasImage(props.movieItem.movieCover)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(shareUrl.value)}`
  const qr = await loadCanvasImage(qrUrl)
  const logoUrl = props.movieItem.activityVo?.activityLogo || globalStore.currentActivityData?.activityLogo
  const logoImg = logoUrl ? await loadCanvasImage(logoUrl) : null

  // ── Background ──
  const bg = ctx.createLinearGradient(0, 0, 0, 1400)
  bg.addColorStop(0, '#050300')
  bg.addColorStop(0.42, '#211302')
  bg.addColorStop(1, '#000000')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 900, 1400)

  // ── Outer borders ──
  ctx.strokeStyle = '#f4c560'
  ctx.lineWidth = 5
  ctx.strokeRect(34, 34, 832, 1332)
  ctx.strokeStyle = 'rgba(244, 197, 96, 0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(54, 54, 792, 1292)

  // ── Cover image ──
  drawCover(ctx, cover, 80, 90, 740, 420)

  // ── Gold shine divider ──
  const shine = ctx.createLinearGradient(80, 0, 820, 0)
  shine.addColorStop(0, '#80520c')
  shine.addColorStop(0.5, '#fff1a8')
  shine.addColorStop(1, '#80520c')
  ctx.fillStyle = shine
  ctx.fillRect(80, 542, 740, 4)

  // ── Movie title ──
  ctx.fillStyle = '#f5c65f'
  ctx.font = 'bold 46px sans-serif'
  wrapText(ctx, movieTitle.value, 80, 610, 740, 58, 2)

  // ── Description ──
  ctx.fillStyle = 'rgba(255, 255, 255, 0.76)'
  ctx.font = '26px sans-serif'
  wrapText(ctx, movieDesc.value, 80, 718, 740, 36, 3)

  // ── Author name ── "Author · name" inline
  ctx.font = '18px sans-serif'
  ctx.fillStyle = 'rgba(244, 197, 96, 0.65)'
  const authorPrefix = 'Author · '
  ctx.fillText(authorPrefix, 80, 848)
  const prefixW = ctx.measureText(authorPrefix).width
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
  ctx.font = 'bold 26px sans-serif'
  ctx.fillText(authorName.value, 80 + prefixW, 848)

  // ── Award Banner ──
  const rbY = 882
  const rbH = 118
  const rbMid = rbY + rbH / 2

  // Dark background fill
  ctx.fillStyle = 'rgba(8, 5, 1, 0.88)'
  ctx.fillRect(80, rbY, 740, rbH)

  // Top gold line
  const lineGradTop = ctx.createLinearGradient(80, rbY, 820, rbY)
  lineGradTop.addColorStop(0, 'rgba(244, 197, 96, 0)')
  lineGradTop.addColorStop(0.2, '#f4c560')
  lineGradTop.addColorStop(0.8, '#f4c560')
  lineGradTop.addColorStop(1, 'rgba(244, 197, 96, 0)')
  ctx.fillStyle = lineGradTop
  ctx.fillRect(80, rbY, 740, 2)

  // Bottom gold line
  const lineGradBot = ctx.createLinearGradient(80, rbY + rbH - 2, 820, rbY + rbH - 2)
  lineGradBot.addColorStop(0, 'rgba(244, 197, 96, 0)')
  lineGradBot.addColorStop(0.2, '#f4c560')
  lineGradBot.addColorStop(0.8, '#f4c560')
  lineGradBot.addColorStop(1, 'rgba(244, 197, 96, 0)')
  ctx.fillStyle = lineGradBot
  ctx.fillRect(80, rbY + rbH - 2, 740, 2)

  // "MMGC YYYY" — large gradient text
  const titleTextGrad = ctx.createLinearGradient(200, rbY, 700, rbY + rbH)
  titleTextGrad.addColorStop(0, '#fff1a8')
  titleTextGrad.addColorStop(0.5, '#f4c560')
  titleTextGrad.addColorStop(1, '#c8851a')
  ctx.fillStyle = titleTextGrad
  ctx.font = 'bold 48px sans-serif'
  const titleText = `MMGC ${activityYear.value}`
  
  const subtitleText = `Day ${props.movieItem.day || route.query.day || ''} · ${shareText.value.bannerSuffix}`

  // Measure text widths to align them
  const titleW = ctx.measureText(titleText).width
  ctx.font = '400 22px sans-serif'
  ;(ctx as any).letterSpacing = '2px'
  const subtitleW = ctx.measureText(subtitleText).width
  ;(ctx as any).letterSpacing = '0px'

  const textBlockW = Math.max(titleW, subtitleW)
  let textBlockCenterX = 450

  if (logoImg) {
    // 增大 Logo 高度
    const logoH = 96
    const logoW = logoImg.width * (logoH / logoImg.height)
    const gap = 12
    const totalW = logoW + gap + textBlockW
    const startX = 450 - totalW / 2
    
    // Logo 垂直居中于 rbY 到 rbY + rbH
    const logoY = rbY + (rbH - logoH) / 2
    ctx.drawImage(logoImg, startX, logoY, logoW, logoH)
    textBlockCenterX = startX + logoW + gap + textBlockW / 2
  }

  // Draw Title Text
  ctx.textAlign = 'center'
  ctx.fillStyle = titleTextGrad
  ctx.font = 'bold 48px sans-serif'
  ctx.fillText(titleText, textBlockCenterX, rbY + 52)

  // Draw Subtitle Text (Day X · 作品)
  ctx.fillStyle = 'rgba(244, 220, 150, 0.75)'
  ctx.font = '400 22px sans-serif'
  ;(ctx as any).letterSpacing = '2px'
  ctx.fillText(subtitleText, textBlockCenterX, rbY + 84)
  ;(ctx as any).letterSpacing = '0px'
  ctx.textAlign = 'left'

  // ── Scan / QR Panel (fully inside poster border) ──
  const scanY = 1022
  const scanH = 268

  const panelGrad = ctx.createLinearGradient(80, scanY, 80, scanY + scanH)
  panelGrad.addColorStop(0, 'rgba(22, 13, 2, 0.9)')
  panelGrad.addColorStop(1, 'rgba(5, 3, 1, 0.97)')
  ctx.fillStyle = panelGrad
  ctx.beginPath()
  ctx.roundRect(80, scanY, 740, scanH, 18)
  ctx.fill()
  ctx.strokeStyle = 'rgba(244, 197, 96, 0.4)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // QR frame — right side of panel, themed dark with gold border
  const qrSize = 170
  const qrPad = 10
  const qrFrameSize = qrSize + qrPad * 2
  const qrFrameX = 820 - qrFrameSize - 16
  const qrFrameY = scanY + Math.round((scanH - qrFrameSize) / 2)

  ctx.fillStyle = '#0c0700'
  ctx.beginPath()
  ctx.roundRect(qrFrameX, qrFrameY, qrFrameSize, qrFrameSize, 10)
  ctx.fill()
  ctx.strokeStyle = '#f4c560'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.strokeStyle = 'rgba(244, 197, 96, 0.22)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(qrFrameX + 5, qrFrameY + 5, qrFrameSize - 10, qrFrameSize - 10, 7)
  ctx.stroke()

  if (qr) {
    ctx.drawImage(qr, qrFrameX + qrPad, qrFrameY + qrPad, qrSize, qrSize)
  } else {
    // Fallback: write URL inside the QR frame area
    ctx.fillStyle = 'rgba(244, 197, 96, 0.65)'
    ctx.font = '13px sans-serif'
    wrapText(ctx, shareUrl.value, qrFrameX + qrPad + 4, qrFrameY + qrPad + 18, qrSize - 8, 20, 7)
  }

  // "扫码观看" label (left side)
  ctx.fillStyle = '#f5c65f'
  ctx.font = 'bold 26px sans-serif'
  ctx.fillText(shareText.value.scan, 108, scanY + 52)

  // Decorative fade line under label
  const fadeGrad = ctx.createLinearGradient(108, 0, 300, 0)
  fadeGrad.addColorStop(0, 'rgba(244, 197, 96, 0.55)')
  fadeGrad.addColorStop(1, 'rgba(244, 197, 96, 0)')
  ctx.fillStyle = fadeGrad
  ctx.fillRect(108, scanY + 62, 180, 1)

  // URL text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '17px sans-serif'
  wrapText(ctx, shareUrl.value, 108, scanY + 92, qrFrameX - 128, 25, 6)

  try {
    posterDataUrl.value = canvas.toDataURL('image/png')
    $track('generate_poster', { movieId: props.movieItem.movieId, movieName: props.movieItem.movieName })
  } catch (error) {
    console.error('Poster toDataURL failed (tainted canvas):', error)
    ElMessage.error(shareText.value.posterFailed)
  }
}

const downloadPoster = () => {
  if (!posterDataUrl.value) return
  const link = document.createElement('a')
  link.href = posterDataUrl.value
  link.download = `MMGC-${activityYear.value}-Day-${props.movieItem.day || route.query.day || ''}-${props.movieItem.movieId}.png`
  link.click()
  $track('download_poster', { movieId: props.movieItem.movieId, movieName: props.movieItem.movieName })
}
</script>

<style lang="scss" scoped>
.video-container-inner {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: $shadowColor;
  box-shadow: 0 0 16px $themeColorBackShadow;
  backdrop-filter: blur(4px);
  .topPannel {
    flex: 1;
    min-height: 0;
    background-color: #3d1e0184;
    transition: flex 0.4s ease;
  }
  .desc-pannel {
    height: 6rem;
    padding: 1rem 0.6rem;
    padding-left: 2rem;
    display: flex;
    flex-direction: column;
    background-color: #3d1e0107;
    z-index: 2;
    transition: height 0.4s ease, padding 0.4s ease;
    overflow: hidden;

    .desc-title {
      font-size: $midFontSize;
      color: white;
      margin-bottom: 0.5rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .desc-detail {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      transition: opacity 0.3s ease, max-height 0.4s ease;
      max-height: 4rem;
      opacity: 1;
    }

    .author-line {
      border-radius: 999px;
      padding: 2px 6px;
    }

    .author-avatar {
      width: 30px;
      height: 30px;
      border-radius: 999px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.35);
    }

    .desc-actions {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      gap: 0.45rem;
    }

    .share-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.3rem 0.75rem;
      height: 2rem;
      color: $themeColor;
      border: 1px solid rgba($themeColor, 0.5);
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.35);
      cursor: pointer;
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
      transition:
        background-color 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;

      .share-trigger-label {
        line-height: 1;
      }

      &:hover {
        background: rgba($themeColor, 0.14);
        border-color: rgba($themeColor, 0.8);
        transform: translateY(-1px);
      }
    }

    &.desc-collapsed {
      height: 3.5rem;
      padding-top: 0.8rem;
      padding-bottom: 0.5rem;

      .desc-detail {
        opacity: 0;
        max-height: 0;
        overflow: hidden;
      }
    }
  }
  &:hover {
    .veta-oper {
      opacity: 1;
    }
  }
  .veta-oper {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4rem;
    height: 300px;
    display: flex;
    justify-items: center;
    align-items: center;
    opacity: 0;
    padding: 12px 0;
    z-index: 1;
    transition: opacity ease 0.4s;

    .operitem {
      color: $themeColor;
      border-radius: 50%;
      height: 3rem;
      width: 3rem;
      padding: 6px;
      font-size: x-small;
      cursor: pointer;
      transition: background-color 0.4s ease;
      &:hover {
        background-color: #3d1e01;
      }
    }
  }
}
</style>

<style lang="scss">
.share-popover {
  color: #f7edd2;

  .share-popover-title {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #f5c65f;
    font-weight: 700;
    margin-bottom: 0.55rem;
  }

  .share-link {
    max-height: 3.4rem;
    padding: 0.5rem;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(245, 198, 95, 0.2);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    line-height: 1.35;
    word-break: break-all;
  }

  .share-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.65rem;
  }

  .poster-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0.75rem;

    img {
      width: min(260px, 100%);
      max-height: 380px;
      object-fit: contain;
      border: 1px solid rgba(245, 198, 95, 0.45);
      border-radius: 8px;
      background: #050300;
    }
  }
}

.share-popper.el-popper {
  border: 1px solid rgba(245, 198, 95, 0.34) !important;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    rgba(11, 7, 1, 0.96) !important;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45) !important;

  .el-popper__arrow::before {
    border-color: rgba(245, 198, 95, 0.34) !important;
    background: rgba(11, 7, 1, 0.96) !important;
  }
}

.maxwidth {
  max-width: 500px;
  word-wrap: break-word;
}
</style>
