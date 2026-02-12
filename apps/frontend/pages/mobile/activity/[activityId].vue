<template>
  <div class="body">
    <var-app-bar round color="transparent" text-color="#fff" style="--app-bar-height: 64px">
      <template #left>
        <div class="flex items-center">
          <var-button
            round
            text
            color="transparent"
            text-color="#fff"
            @click="mobileMenuOpen = true"
          >
            <var-icon name="menu" :size="24" />
          </var-button>
          <div
            v-if="globalStore.currentActivityData?.activityLogo"
            class="ml-2 h-12 w-auto flex items-center"
            @click="goHome"
          >
            <MyCustomImage :img="globalStore.currentActivityData.activityLogo" class="h-8 w-auto" />
          </div>
        </div>
      </template>

      <template #right>
        <ClientOnly>
          <div class="flex items-center">
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
            <MobileAvatar v-else />
          </div>
        </ClientOnly>
      </template>

    </var-app-bar>
    <div class="flex items-center justify-center heightss">
      <NuxtPage :activityId="activityId" />
    </div>
    <div class="bg"></div>

    <!-- 移动端侧边栏导航 -->
    <transition name="fade">
      <div v-if="mobileMenuOpen" class="mobile-nav-overlay" @click="mobileMenuOpen = false">
        <div class="mobile-nav-drawer" @click.stop>
          <p class="mobile-nav-title">{{ $t('menu') }}</p>
          <nav class="mobile-nav-list">
            <a
              class="mobile-nav-item"
              :class="{ active: isCurrent(`/mobile/activity/${activityId}/about`) }"
              @click.prevent="goSection('about')"
            >
              <Icon name="tabler:file-description" size="1rem" class="mr-2" />
              <span>{{ $t('desc') }}</span>
            </a>
            <a
              class="mobile-nav-item"
              :class="{ active: isCurrent(`/mobile/activity/${activityId}/main`) }"
              @click.prevent="goSection('main')"
            >
              <Icon name="ic:round-ondemand-video" size="1rem" class="mr-2" />
              <span>{{ $t('mainStage') }}</span>
            </a>
            <a
              class="mobile-nav-item"
              :class="{ active: isCurrent(`/mobile/activity/${activityId}/support`) }"
              @click.prevent="goSection('support')"
            >
              <Icon name="simple-icons:githubsponsors" size="1rem" class="mr-2" />
              <span>{{ $t('organSponsor') }}</span>
            </a>
            <a
              class="mobile-nav-item"
              :class="{ active: isCurrent(`/mobile/activity/${activityId}/history`) }"
              @click.prevent="goSection('history')"
            >
              <Icon name="ic:baseline-history" size="1rem" class="mr-2" />
              <span>{{ $t('history') }}</span>
            </a>
            <a
              class="mobile-nav-item"
              :class="{ active: isCurrent(`/mobile/activity/${activityId}/statistics`) }"
              @click.prevent="goSection('statistics')"
            >
              <Icon name="mdi:chart-bar" size="1rem" class="mr-2" />
              <span>{{ $t('matchStatistics') }}</span>
            </a>
          </nav>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { StyleProvider } from '@varlet/ui'
import { onMounted } from 'vue'
import { useGlobalStore } from '~/stores/global'

const route = useRoute()
const localeRoute = useLocaleRoute()
const { locale } = useCurrentLocale()
const globalStore = useGlobalStore()
const { goHome, goLogin, handleLocale } = useGoMobile()

const activityId =
  parseInt(route.params.activityId?.toString()) || globalStore.config?.currentActivityId

const mobileMenuOpen = ref(false)

onMounted(() => {
  return StyleProvider({
    '--color-primary': '#ffb961',
    '--color-on-primary': '#472a00',
    '--color-primary-container': '#663e00',
    '--color-on-primary-container': '#ffddb9',
    '--color-info': '#dfc1a2',
    '--color-on-info': '#3f2d17',
    '--color-info-container': '#57432b',
    '--color-on-info-container': '#fdddbd',
    '--color-warning': '#bccd9e',
    '--color-on-warning': '#273513',
    '--color-warning-container': '#3d4b27',
    '--color-on-warning-container': '#d7e9b8',
    '--color-danger': '#ffb4ab',
    '--color-on-danger': '#690005',
    '--color-danger-container': '#93000a',
    '--color-on-danger-container': '#ffb4ab',
    '--color-body': '#1f1b16',
    '--color-text': '#ebe1d9',
    '--color-on-surface-variant': '#d4c4b5',
    '--color-outline': '#9d8e81',
    '--color-inverse-surface': '#ebe1d9',
    '--card-background': '#222',
    '--card-title-color': '#ffb961'
  })
})

const changeRoute = (routepath: any) => {
  if (routepath === 'more') return
  const route = localeRoute(`/mobile/activity/${activityId}/${routepath}`)
  navigateTo(route?.fullPath || '/')
}

const { isUserInfo } = useMyInfo()

const goSection = (key: string) => {
  mobileMenuOpen.value = false
  changeRoute(key)
}

const isCurrent = (path: string) => {
  const r = localeRoute(path)
  return r?.path === route.path
}
</script>

<style lang="scss" scoped>
.body {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.heightss {
  height: calc(100vh - 98px);
}

.bg {
  width: 100vw;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  background-image: url(@/assets/2024/bgmobile.png);
  background-size: cover;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  position: absolute;
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
</style>
