import { defineNuxtConfig } from 'nuxt/config'
import eslintPlugin from 'vite-plugin-eslint'
import ElementPlus from 'unplugin-element-plus/vite'

export default defineNuxtConfig({
  app: {
    head: {
      title: 'MMGC - Mirai Mad Team',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content: 'Mirai Mad 官网'
        }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },

  site: {
    url: process.env.NUXT_PUBLIC_API_BASE || 'https://mirai-mad.com'
  },

  routeRules: {
    '/activity/**/about': { ssr: false },
    '/cn/activity/**/about': { ssr: false },
    '/en/activity/**/about': { ssr: false },
    '/jp/activity/**/about': { ssr: false },
    '/activity/**/main': { ssr: false },
    '/cn/activity/**/main': { ssr: false },
    '/en/activity/**/main': { ssr: false },
    '/jp/activity/**/main': { ssr: false }
  } as any,

  sitemap: {
    sources: [
      '/__sitemap__/urls'
    ]
  },

  css: ['@/assets/scss/index.scss', '@/assets/scss/export.scss', '@/assets/scss/iconfont.scss'],

  imports: {
    autoImport: true
  },

  dayjs: {
    locales: ['en', 'zh-cn', 'ja'],
    plugins: ['relativeTime', 'utc', 'timezone'],
    defaultLocale: 'zh-cn'
  },

  typescript: {
    strict: true,
    shim: false
  },

  vite: {
    plugins: [
      eslintPlugin({
        include: ['src/**/*.js', 'src/**/*.vue', 'src/*.js', 'src/*.vue']
      }) as any,
      ElementPlus() as any
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: "@use '@/assets/scss/globals' as *;"
        }
      }
    }
  },

  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@varlet/nuxt',
    [
      '@nuxtjs/i18n',
      {
        locales: ['cn', 'en', 'jp'],
        detectBrowserLanguage: {
          useCookie: true,
          cookieKey: 'i18n_redirected',
          redirectOn: 'root' // recommended
        },
        fallbackLocale: 'cn',
        vueI18n: './i18n/i18n.ts'
      }
    ],
    '@element-plus/nuxt',
    'nuxt-icon',
    'nuxt-lodash',
    'dayjs-nuxt',
    '@nuxtjs/sitemap'
  ],

  elementPlus: {
    themes: ['dark']
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://mirai-mad.com',
      siteUrl: process.env.NUXT_PUBLIC_API_BASE || 'https://mirai-mad.com',
      apiPrefix: process.env.NUXT_PUBLIC_API_PREFIX || '/mmgcApi',
      apiLocal: process.env.NUXT_PUBLIC_API_LOCAL || 'http://backend:8055'
    }
  },

  alias: {
    dayjs: 'dayjs'
  },

  plugins: ['~~/plugins/pinia-plugin-persist.client'],
  compatibilityDate: '2026-02-11'
})
