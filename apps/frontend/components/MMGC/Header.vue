<template>
  <div class="show">
    <div class="MMGC-header">
      <section class="MMGC-logo" @click="goWelcome">
        <MyCustomImage :img="activityData?.activityLogo" />
      </section>
      <nav class="MMGC-nav desktop-nav">
        <div
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ 'nav-active': currentRoute(item.path) }"
        >
          <div class="active"></div>
          <NuxtLink :to="localizedPath(item.path)">
            {{ $t(item.labelKey) }}
          </NuxtLink>
        </div>
      </nav>
      <section class="MMGC-oper desktop-oper">
        <ElDropdown trigger="click" @command="handleLocale">
          <div class="oper-item">
            <Icon name="ion:language-sharp" size="1.5rem" class="mb-1" />
            <p>{{ $t('language') }}</p>
          </div>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem v-for="item in localeOptions" :key="item.value" :command="item.value">
                {{ item.label }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
        <div class="oper-item" @click="goLogin" v-if="!isUserInfo">
          <Icon name="ant-design:user-outlined" size="1.5rem" class="mb-1" />
          <p>{{ $t('login') }}</p>
        </div>
        <div class="oper-item" v-else>
          <MyInfo :member-vo="userInfo" @logout="logout" />
        </div>
      </section>
    </div>

    <div class="MMGC-dock">
      <button class="home-button" type="button" :aria-label="$t('enterDetail')" @click="goWelcome">
        <Icon name="ic:round-home-work" size="1.45rem" />
      </button>

      <nav class="MMGC-nav" aria-label="MMGC navigation">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ 'nav-active': currentRoute(item.path) }"
          :to="localizedPath(item.path)"
        >
          <Icon :name="item.icon" size="1.15rem" />
          <span>{{ $t(item.labelKey) }}</span>
        </NuxtLink>
      </nav>

      <section class="MMGC-oper">
        <ElDropdown trigger="click" @command="handleLocale">
          <button class="oper-item" type="button">
            <Icon name="ion:language-sharp" size="1.05rem" />
            <span>{{ $t('language') }}</span>
            <strong>{{ currentLocaleLabel }}</strong>
          </button>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem v-for="item in localeOptions" :key="item.value" :command="item.value">
                {{ item.label }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
        <button class="oper-item" type="button" @click="goLogin" v-if="!isUserInfo">
          <Icon name="ant-design:user-outlined" size="1.05rem" />
          <span>{{ $t('login') }}</span>
        </button>
        <div class="oper-item user-info" v-else>
          <MyInfo :member-vo="userInfo" @logout="logout" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '~~/stores/global'
import { useUserStore } from '~~/stores/user'

const route = useRoute()
const store = useGlobalStore()
const switchLocalePath = useSwitchLocalePath()
const globalStore = useGlobalStore()
const userStore = useUserStore()
const { logout, userInfo, isUserInfo } = useMyInfo()
const supportedLocales = ['cn', 'en', 'jp'] as const
type SupportedLocale = (typeof supportedLocales)[number]
type NavItem = {
  path: string
  labelKey: string
  icon: string
}
const activityId =
  parseInt(route.params.activityId?.toString()) || globalStore.config?.currentActivityId

let activityData = ref<any>()

if (activityId === globalStore.config?.currentActivityId) {
  activityData.value = globalStore.currentActivityData
} else {
  const { activityData: remoteData } = useActivityDetail(activityId || 0)
  activityData = remoteData
}

if (userStore.token) userStore.getUserInfo()

const localeOptions: Array<{ value: SupportedLocale; label: string; shortLabel: string }> = [
  { value: 'cn', label: '中文简体', shortLabel: '中' },
  { value: 'jp', label: '日本語', shortLabel: '日' },
  { value: 'en', label: 'English', shortLabel: 'EN' }
]

const navItems = computed<NavItem[]>(() => [
  {
    path: `/activity/${activityId}/about`,
    labelKey: 'desc',
    icon: 'tabler:file-description'
  },
  {
    path: `/activity/${activityId}/main`,
    labelKey: 'mainStage',
    icon: 'ic:round-ondemand-video'
  },
  {
    path: `/activity/${activityId}/support`,
    labelKey: 'organSponsor',
    icon: 'simple-icons:githubsponsors'
  },
  {
    path: `/activity/${activityId}/history`,
    labelKey: 'history',
    icon: 'ic:baseline-history'
  },
  {
    path: '/statistics',
    labelKey: 'matchStatistics',
    icon: 'material-symbols:query-stats-rounded'
  }
])

const handleLocale = (command: 'cn' | 'jp' | 'en') => {
  store.setLocale(command)
  const nextPath = switchLocalePath(command)
  if (nextPath) navigateTo(nextPath)
}

const currentLocale = computed<SupportedLocale>(() => {
  const pathLocale = route.path.split('/')[1] as SupportedLocale | undefined
  if (pathLocale && supportedLocales.includes(pathLocale)) return pathLocale
  return supportedLocales.includes(store.localeState as SupportedLocale)
    ? (store.localeState as SupportedLocale)
    : 'cn'
})

const currentLocaleLabel = computed(() => {
  return localeOptions.find(item => item.value === currentLocale.value)?.shortLabel || '中'
})

const localizedPath = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `/${currentLocale.value}${normalizedPath}`
}

const currentRoute = (link: string) => {
  return localizedPath(link) === route.path
}

const goWelcome = () => {
  navigateTo(localizedPath('/welcome'))
}

const goLogin = () => {
  navigateTo(localizedPath('/login'))
}
</script>

<style lang="scss" scoped>
@media screen and (min-width: 320px) {
  .show {
    position: fixed;
    left: 0;
    right: 0;
    bottom: max(0.75rem, env(safe-area-inset-bottom));
    z-index: 100;
    display: flex;
    justify-content: center;
    padding: 0 0.75rem;
    pointer-events: none;
  }

  .MMGC-header {
    display: none;
  }

  .MMGC-dock {
    width: min(1120px, 100%);
    min-height: 4.25rem;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem;
    color: $themeNotActiveColor;
    border: 1px solid rgba(252, 197, 95, 0.22);
    border-radius: 999px;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.035)),
      rgba(18, 12, 2, 0.72);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(20px) saturate(1.25);
    pointer-events: auto;
  }

  .home-button,
  .oper-item,
  .nav-item {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    color: inherit;
    background: transparent;
    cursor: pointer;
    transition: color 0.24s ease, background 0.24s ease, transform 0.24s ease;
  }

  .home-button {
    width: 3.05rem;
    height: 3.05rem;
    flex-shrink: 0;
    color: #251700;
    border-radius: 50%;
    background: linear-gradient(145deg, #ffd36b, #c89125);
    box-shadow: 0 10px 28px rgba(252, 197, 95, 0.28);
  }

  .MMGC-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    gap: 0.25rem;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .nav-item {
      min-width: 4.65rem;
      height: 3rem;
      flex: 0 0 auto;
      flex-direction: column;
      gap: 0.18rem;
      padding: 0 0.7rem;
      border-radius: 999px;
      font-size: 0.72rem;
      line-height: 1;

      span {
        max-width: 5.6rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.nav-active,
      &:hover {
        color: $themeColor;
        background: rgba(252, 197, 95, 0.12);
      }

      &.nav-active {
        box-shadow: inset 0 0 0 1px rgba(252, 197, 95, 0.2);
      }
    }
  }

  .MMGC-oper {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;

    .oper-item {
      min-width: 3rem;
      height: 3rem;
      gap: 0.22rem;
      padding: 0 0.72rem;
      border-radius: 999px;
      font-size: 0.7rem;
      line-height: 1;

      strong {
        color: $themeColor;
        font-size: 0.72rem;
        font-weight: 700;
      }

      &:hover {
        color: $themeColor;
        background: rgba(255, 255, 255, 0.08);
      }
    }

    .user-info {
      min-width: auto;
      padding: 0 0.45rem;
      cursor: default;
    }
  }
}

@media screen and (min-width: 1440px) {
  .show {
    position: static;
    display: block;
    padding: 0;
    pointer-events: auto;
  }

  .MMGC-dock {
    display: none;
  }

  .MMGC-header {
    width: 100%;
    height: 8rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    color: $themeNotActiveColor;
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.18) 80%, transparent 100%);
  }

  .MMGC-logo {
    width: 14rem;
    height: 5.4rem;
    cursor: pointer;
  }

  .desktop-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    gap: 0;
    color: $themeNotActiveColor;
    font-size: $bigFontSize;
    font-weight: 600;

    .nav-item {
      width: unset;
      min-width: unset;
      height: auto;
      flex: 0 0 auto;
      flex-direction: row;
      gap: 0;
      margin: 0 16px;
      padding: 0;
      border-radius: 0;
      font-size: $bigFontSize;
      line-height: $bigFontSize;
      transition: color 0.4s ease;

      .active {
        width: 8px;
        height: 16px;
        margin-right: 4px;
        border-radius: 6px;
        background-color: gray;
        transition: all ease 0.4s;
      }

      a {
        display: flex;
        align-items: center;
        color: inherit;
      }

      &.nav-active,
      &:hover {
        color: $themeColor;
        background: transparent;
        box-shadow: none;

        .active {
          background-color: $themeColor;
          transform: scaleY(1.2);
        }
      }
    }
  }

  .desktop-oper {
    width: 14rem;
    display: flex;
    flex-shrink: 0;
    justify-content: space-around;
    align-items: center;
    gap: 0;

    .oper-item {
      height: auto;
      min-width: unset;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      color: $themeNotActiveColor;
      border-radius: 0;
      font-size: 12px;
      line-height: normal;
      cursor: pointer;
      transition: color 0.4s ease;

      &:hover {
        color: $themeColor;
        background: transparent;
      }
    }
  }
}

@media screen and (max-width: 760px) {
  .show {
    bottom: max(0.5rem, env(safe-area-inset-bottom));
    padding: 0 0.45rem;
  }

  .MMGC-dock {
    min-height: 3.65rem;
    gap: 0.35rem;
    padding: 0.45rem;
  }

  .home-button {
    width: 2.75rem;
    height: 2.75rem;
  }

  .MMGC-nav {
    justify-content: flex-start;

    .nav-item {
      min-width: 3.15rem;
      height: 2.65rem;
      padding: 0 0.52rem;
      font-size: 0.62rem;

      span {
        max-width: 3.4rem;
      }
    }
  }

  .MMGC-oper {
    gap: 0.2rem;

    .oper-item {
      width: 2.65rem;
      min-width: 2.65rem;
      height: 2.65rem;
      padding: 0;

      span {
        display: none;
      }
    }
  }
}

@media screen and (max-width: 520px) {
  .MMGC-dock {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .MMGC-nav {
    .nav-item {
      min-width: 2.7rem;

      span {
        display: none;
      }
    }
  }
}
</style>
