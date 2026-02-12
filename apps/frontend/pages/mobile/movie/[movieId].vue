<template>
  <div class="body" ref="body">
    <var-app-bar round color="transparent" text-color="#fff" style="--app-bar-height: 64px">
      <template #default>
        <div class="flex flex-col justify-start items-start ml-2" v-if="movieDetail">
          <p class="desc-title mr-4 font-bold">
            {{ movieDetail?.movieName[locale] || movieDetail?.movieName['cn'] }}
          </p>
          <div class="flex items-center flex-wrap gap-1">
            <span class="tag-primary">
              {{ $t('activityMovies', [movieDetail?.activityVo?.activityId]) }}
            </span>
            <div class="tag-day">
              {{ $t('dayXmovie', [movieDetail?.day]) }}
            </div>
          </div>
        </div>
      </template>
      <template #left>
        <div class="flex items-center">
          <var-button
            color="transparent"
            text-color="#fff"
            round
            text
            @click="mobileMenuOpen = true"
          >
            <var-icon name="menu" :size="24" />
          </var-button>
          <div
            v-if="currentActivityLogo"
            class="ml-2 h-8 w-auto flex items-center"
            @click="goHome"
          >
            <MyCustomImage :img="currentActivityLogo" class="h-8 w-auto" />
          </div>
        </div>
      </template>

      <template #right>
        <ClientOnly>
          <var-menu-select
            :modelValue="locale"
            @update:model-value="handleLocale"
            size="large"
            placement="top"
          >
            <var-button round text color="transparent" text-color="#fff">
              <Icon name="ion:language-sharp" size="24"></Icon>
            </var-button>
            <template #options>
              <var-menu-option label="中文" value="cn" />
              <var-menu-option label="English" value="en" />
              <var-menu-option label="日本語" value="jp" />
            </template>
          </var-menu-select>

          <var-button
            round
            text
            color="transparent"
            text-color="#fff"
            @click="goLogin"
            v-if="!isUserInfo"
          >
            <Icon name="ant-design:user-outlined" size="24"></Icon>
          </var-button>
          <MemberPop v-else :member-vo="userInfo" />
        </ClientOnly>
      </template>
    </var-app-bar>
    <div class="my-2">
      <VarButton text type="primary" @click="() => backToMain(true)">{{
        $t('backToMain')
      }}</VarButton>
    </div>
    <div class="all-wrapper" v-if="movieDetail">
      <div class="flex flex-col w-full">
        <div class="movie-play" v-if="movieDetail">
          <Aplayer
            :video-url="playSource"
            v-if="movieDetail?.moviePlaylink"
            :cover="movieDetail.movieCover"
          ></Aplayer>
        </div>
        <div class="flex flex-col">
          <div class="movie-oper">
            <div class="flex">
              <div class="operitem">
                <Icon name="ant-design:eye-outlined" class="text-3xl" />
                <span class="operitem-font">{{ movieDetail.viewNums }}</span>
              </div>
              <div class="mx-2 operitem">
                <Icon name="ant-design:comment-outlined" class="text-3xl" />
                <span class="operitem-font">{{ movieDetail.commentNums }}</span>
              </div>
              <div class="flex items-center operitem" @click="likeOrUnLike(movieDetail)">
                <Icon
                  :name="
                    movieDetail.loginVo?.isLike
                      ? 'ant-design:like-filled'
                      : 'ant-design:like-outlined'
                  "
                  class="text-3xl"
                />
                <p class="operitem-font">{{ movieDetail.likeNums }}</p>
              </div>
              <div
                class="flex items-center mx-2 operitem"
                @click="pollByLink(movieDetail, currentDayItem?.dayPollLink)"
              >
                <Icon
                  :name="
                    movieDetail.loginVo?.isPoll
                      ? 'ant-design:profile-filled'
                      : 'ant-design:profile-outlined'
                  "
                  class="text-3xl"
                />
                <p class="operitem-font">{{ movieDetail.pollNums }}</p>
              </div>
            </div>
            <div class="download-or-other">
              <div
                class="flex items-center mr-4 justify-center"
                v-if="movieDetail.movieLink && snsSites.length > 0"
              >
                <p class="mr-2">{{ $t('otherView') }}</p>
                <div>
                  <div class="flex flex-wrap">
                    <div
                      v-for="item in snsSites"
                      :key="item.value"
                      class="cursor-pointer"
                      :title="`${$t('clickJump')} ${item.value}`"
                      @click="openlink(item.value)"
                    >
                      <Icon
                        :name="item.icon"
                        :style="{ color: item.color }"
                        size="24px"
                        class="mr-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="movieDetail.movieDownloadLink" @click="center = true">
                <p class="tag-day cursor-pointer" v-ripple>Download</p>
              </div>
              <ClientOnly>
                <var-popup v-model:show="center" overlay-class="custom-popclass">
                  <div class="p-4">
                    <p class="text-xl">下载地址</p>
                    <div class="flex flex-col">
                      <div
                        v-if="movieDetail?.movieDownloadLink?.google"
                        class="flex flex-col cursor-pointer my-2"
                        :title="$t('googleDownload', [movieDetail.movieDownloadLink.google])"
                        @click="openlink(movieDetail?.movieDownloadLink?.google || '')"
                      >
                        <div class="flex items-center">
                          <Icon name="logos:google-drive" size="36" />
                          <p class="ml-4">{{ $t('googleDownloadLink') }}</p>
                        </div>
                        <a
                          :href="movieDetail.movieDownloadLink.google"
                          target="_blank"
                          class="break-all text-blue-600 mt-2"
                          >{{ movieDetail.movieDownloadLink.google }}</a
                        >
                      </div>
                      <div
                        v-if="movieDetail?.movieDownloadLink?.baidu"
                        class="flex flex-col cursor-pointer my-2"
                        :title="$t('baiduDownload', [movieDetail.movieDownloadLink.baidu])"
                        @click="openlink(movieDetail?.movieDownloadLink?.baidu || '')"
                      >
                        <div class="flex items-center">
                          <Icon name="simple-icons:baidu" size="36" class="text-blue-600" />
                          <p class="ml-4">{{ $t('baiduDownloadLnk') }}</p>
                        </div>
                        <a
                          :href="movieDetail.movieDownloadLink.baidu"
                          target="_blank"
                          class="break-all text-blue-600 mt-2"
                          >{{ movieDetail.movieDownloadLink.baidu }}</a
                        >
                      </div>
                      <div
                        v-if="movieDetail?.movieDownloadLink?.onedrive"
                        class="flex flex-col cursor-pointer my-2"
                        :title="$t('microsoftDownload', [movieDetail.movieDownloadLink.onedrive])"
                        @click="openlink(movieDetail?.movieDownloadLink?.onedrive || '')"
                      >
                        <div class="flex items-center">
                          <Icon name="logos:microsoft-onedrive" size="36" class="text-blue-600" />
                          <p class="ml-4">{{ $t('weiruandownload') }}</p>
                        </div>
                        <a
                          :href="movieDetail.movieDownloadLink.onedrive"
                          target="_blank"
                          class="break-all text-blue-600 mt-2"
                          >{{ movieDetail.movieDownloadLink.onedrive }}</a
                        >
                      </div>
                      <div
                        v-if="movieDetail?.movieDownloadLink?.other"
                        class="flex flex-col cursor-pointer my-2"
                        :title="$t('otherDownload', [movieDetail.movieDownloadLink.other])"
                        @click="openlink(movieDetail?.movieDownloadLink?.other || '')"
                      >
                        <div class="flex items-center">
                          <Icon
                            name="material-symbols:link-rounded"
                            size="36"
                            class="text-green-600"
                          />
                          <p class="ml-4">{{ $t('otherDownloadlink') }}</p>
                        </div>
                        <a
                          :href="movieDetail.movieDownloadLink.other"
                          target="_blank"
                          class="break-all text-blue-600 mt-2"
                          >{{ movieDetail.movieDownloadLink.other }}</a
                        >
                      </div>
                    </div>
                  </div>
                </var-popup>
              </ClientOnly>
            </div>
          </div>
          <div class="infomation flex mt-2 ml-2">
            <p class="sub-title">{{ $t('uploadAt') }}:{{ movieDetail.createTime }}</p>
            <p class="sub-title mx-2" v-if="movieDetail.realPublishTime">
              {{ $t('firstViewTime') }}:{{ movieDetail.realPublishTime }}
            </p>
          </div>
          <div class="flex my-4 items-center">
            <MemberPop :member-vo="movieDetail?.author" v-if="movieDetail?.author" :size="36" />
            <p class="sub-title mr-4">
              {{ $t('author') }}:{{ movieDetail?.authorName || movieDetail?.author?.memberName }}
            </p>
          </div>
          <p
            class="ml-2 text-light-50 break-all overflow-auto"
            :title="movieDetail.movieDesc[locale] || movieDetail.movieDesc['cn']"
          >
            {{ t('descriable') }}：{{
              movieDetail.movieDesc[locale] || movieDetail.movieDesc['cn']
            }}
          </p>
        </div>
        <p class="comment-area-title text-light-50 flex items-center mt-4">
          <span class="mark block"></span>{{ $t('comment-area') }} ({{ total }})
        </p>
        <div class="movie-comment-area">
          <div class="flex-1 overflow-auto review-area">
            <ElEmpty
              :image="Image404"
              :description="$t('noComment')"
              v-if="comments.length === 0"
            />
            <template v-else>
              <ReviewItem
                v-for="comment in comments"
                :key="comment.commentId"
                :movie-detail="movieDetail"
                :comment="comment"
                :topPrarentId="comment.commentId"
                :level="1"
                @refresh="getCommentList"
              >
              </ReviewItem>
            </template>
          </div>
          <ElPagination
            layout="prev, pager, next"
            :total="total"
            v-model:page-size="pageParam.pageSize"
            v-model:current-page="pageParam.page"
          />
          <div class="relative">
            <var-input :placeholder="$t('enterreview')" textarea v-model="content" :rows="3" />
            <VarButton type="danger" @click="sentComment" size="small" class="button">{{
              $t('ping')
            }}</VarButton>
          </div>
        </div>
      </div>
    </div>
    <p class="title" v-else>{{ $t('noOpen') }}</p>
  </div>
  <!-- 移动端侧边栏导航 -->
  <transition name="fade">
    <div v-if="mobileMenuOpen" class="mobile-nav-overlay" @click="mobileMenuOpen = false">
      <div class="mobile-nav-drawer" @click.stop>
        <p class="mobile-nav-title">{{ $t('menu') }}</p>
        <nav class="mobile-nav-list">
          <a
            class="mobile-nav-item"
            :class="{ active: isCurrent(`/mobile/activity/${currentActivityId}/about`) }"
            @click.prevent="goSection('about')"
          >
            <Icon name="tabler:file-description" size="1rem" class="mr-2" />
            <span>{{ $t('desc') }}</span>
          </a>
          <a
            class="mobile-nav-item"
            :class="{ active: isCurrent(`/mobile/activity/${currentActivityId}/main`) }"
            @click.prevent="goSection('main')"
          >
            <Icon name="ic:round-ondemand-video" size="1rem" class="mr-2" />
            <span>{{ $t('mainStage') }}</span>
          </a>
          <a
            class="mobile-nav-item"
            :class="{ active: isCurrent(`/mobile/activity/${currentActivityId}/support`) }"
            @click.prevent="goSection('support')"
          >
            <Icon name="simple-icons:githubsponsors" size="1rem" class="mr-2" />
            <span>{{ $t('organSponsor') }}</span>
          </a>
          <a
            class="mobile-nav-item"
            :class="{ active: isCurrent(`/mobile/activity/${currentActivityId}/history`) }"
            @click.prevent="goSection('history')"
          >
            <Icon name="ic:baseline-history" size="1rem" class="mr-2" />
            <span>{{ $t('history') }}</span>
          </a>
          <a
            class="mobile-nav-item"
            :class="{ active: isCurrent(`/mobile/activity/${currentActivityId}/statistics`) }"
            @click.prevent="goSection('statistics')"
          >
            <Icon name="mdi:chart-bar" size="1rem" class="mr-2" />
            <span>{{ $t('matchStatistics') }}</span>
          </a>
        </nav>
      </div>
    </div>
  </transition>
  <el-dialog v-model="pollDialogShow" :title="$t('PollLink')" width="400" draggable>
    <div class="p-4">
      <div>
        <p v-if="currentDayItem?.dayPollLink?.bilibili">
          <Icon name="ri:bilibili-line" size="20" class="mr-2" />{{ $t('bilibiliPoll') }}
          <a :href="currentDayItem?.dayPollLink?.bilibili" target="_blank" style="color: #abf7ff">{{
            $t('clickJump')
          }}</a>
        </p>
        <p v-if="currentDayItem?.dayPollLink?.twitter" class="my-4">
          <Icon name="ri:twitter-x-line" size="20" class="mr-2" />{{ $t('pollTwitter') }}
          <a :href="currentDayItem?.dayPollLink?.twitter" target="_blank" style="color: #abf7ff">{{
            $t('clickJump')
          }}</a>
        </p>
        <p v-if="currentDayItem?.dayPollLink?.personalWebsite" class="my-4">
          <Icon name="ri:twitter-x-line" size="20" class="mr-2" />{{ $t('pollByCustom') }}
          <a
            :href="currentDayItem?.dayPollLink?.personalWebsite"
            target="_blank"
            style="color: #abf7ff"
            >{{ $t('clickJump') }}</a
          >
        </p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { getCommentList } from '~~/composables/apis/comment'
import { useGlobalStore } from '~~/stores/global'
import Image404 from '@/assets/img/NotFound.png'
import type { MovieVo } from '~~/types/movie.type'

const {
  total,
  playSource,
  pageParam,
  comments,
  movieDetail,
  movieId,
  openlink,
  snsSites,
  body,
  content,
  isFocus,
  getComment,
  sentComment,
  getVideoByDay,
  backToMain,
  getMovieDetail,
  currentDayItem,
  pollDialogShow
} = useMovieDetail()
const center = ref(false)
const { locale } = useCurrentLocale()
const { t } = useI18n()
const globalStore = useGlobalStore()
const { unloading } = useGlobalStore()
const { pollMovie, likeOrUnLike } = useMovieOperate()
const { goHome, goLogin, handleLocale } = useGoMobile()
const { logout, userInfo, isUserInfo } = useMyInfo()

const mobileMenuOpen = ref(false)
const currentActivityId = computed(
  () => movieDetail.value?.activityVo?.activityId || globalStore.config?.currentActivityId
)
const currentActivityLogo = computed(
  () => movieDetail.value?.activityVo?.activityLogo || globalStore.currentActivityData?.activityLogo
)

const pollByLink = (movie: MovieVo, dayPollLink?: Sns | null) => {
  if (dayPollLink && (dayPollLink.bilibili || dayPollLink.twitter || dayPollLink.personalWebsite)) {
    pollDialogShow.value = true
  } else {
    pollMovie(movie)
  }
}

const localeRoute = useLocaleRoute()

watchEffect(() => {
  getMovieDetail(movieId.value).then(async () => {
    await getVideoByDay()
    await getComment(pageParam)
    unloading()
  })
})

const goSection = (key: string) => {
  if (!currentActivityId.value) return
  mobileMenuOpen.value = false
  const route = localeRoute(`/mobile/activity/${currentActivityId.value}/${key}`)
  navigateTo(route?.fullPath || '/')
}

const isCurrent = (path: string) => {
  const r = localeRoute(path)
  return r?.path === useRoute().path
}

onMounted(async () => {
  const bg = new Image()
  const { currentActivityData } = useGlobalStore()
  bg.src = currentActivityData?.activityBackgroundImg || ''
  bg.onload = () => {
    if (body.value && currentActivityData)
      body.value.style.backgroundImage = `url(${currentActivityData.activityBackgroundImg})`
  }
})
</script>

<style lang="scss" scoped>
.body {
  width: 100%;
  min-height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url(@/assets/img/bg.png);
  background-color: black;
  background-size: cover;
  background-attachment: fixed;
  filter: brightness(0.8);
  .all-wrapper {
    height: calc(100% - 64px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    overflow: auto;
    padding: 12px;
    .movie-play {
      border-radius: 20px;
      overflow: hidden;
      width: 100%;
      height: 600px;
    }
    .mark {
      background-color: #ffacac;
      border-radius: 20px;
      width: 15px;
      height: 10px;
      margin-right: 4px;
    }
    .movie-comment-area {
      height: 100%;
      border-radius: 20px;
      background-color: #131313;
      padding: 16px;
      display: flex;
      flex-direction: column;
      margin-top: 8px;
      .review-area {
        max-height: calc(100% - 120px);
        flex: 1;
        overflow: auto;
      }
      .button {
        position: absolute;
        right: 8px;
        bottom: 5px;
      }
    }

    .movie-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      .movie-title {
        font-size: $bigFontSize;
        color: white;
        font-weight: 600;
      }
      .left-arrow {
        border-radius: 9px;
        background-color: $hintColor;
        &:hover {
          transition: all ease 0.2s;
          background-color: #ff5454;
        }
      }
    }

    .movie-info {
      display: flex;
      align-items: center;
      flex-direction: column;
      .info-center {
        display: inline-flex;
        align-items: center;
      }
    }

    .popover {
      padding: 0;
    }
    .movie-oper {
      margin-top: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: $midFontSize;
      color: $themeColor;
      .download-or-other {
        display: flex;
        align-items: center;
        .download {
          font-size: $bigFontSize;
          color: $themeColor;
          font-weight: 600;
          cursor: pointer;
        }
      }
      .operitem {
        border-radius: 35px;
        font-size: $smallFontSize;
        padding: 4px 8px;
        cursor: pointer;
        position: relative;
        transition: all ease 0.3s;
        display: flex;
        flex-direction: column;
        align-items: center;
        &:hover {
          background-color: $themeColor;
          color: white;
        }
        &-font {
          margin-left: 4px;
        }
      }
    }
    .movie-list {
      overflow-x: auto;
      display: flex;
    }
    .movie-desc {
      margin-top: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 2rem;
      .desc {
        color: $tipColor;
        font-size: $smallFontSize;
      }
    }
  }
}

.mobile-nav-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
}

.mobile-nav-drawer {
  width: 70%;
  max-width: 260px;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
}

.mobile-nav-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
}

.mobile-nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.25rem;
  color: #ddd;
  text-decoration: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.mobile-nav-item.active {
  color: $themeColor;
  background: rgba(255, 185, 97, 0.12);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-textarea__inner) {
  border-radius: 14px;
}
</style>

<style>
.var-popup__content {
  border-radius: 12px;
  padding: 4px;
  width: 80%;
  background-color: rgb(157 78 3);
  color: #fff;
}
</style>
