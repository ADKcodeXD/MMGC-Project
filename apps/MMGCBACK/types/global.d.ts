import type {
  ComponentRenderProxy,
  VNode,
  VNodeChild,
  ComponentPublicInstance,
  FunctionalComponent,
  PropType as VuePropType,
} from 'vue'
import { MemberVo } from '/@/api/member/model/memberEntity'

declare global {
  const __APP_INFO__: {
    pkg: {
      name: string
      version: string
      dependencies: Recordable<string>
      devDependencies: Recordable<string>
    }
    lastBuildTime: string
  }
  // declare interface Window {
  //   // Global vue app instance
  //   __APP__: App<Element>;
  // }

  // vue
  declare type PropType<T> = VuePropType<T>
  declare type VueNode = VNodeChild | JSX.Element

  export type Writable<T> = {
    -readonly [P in keyof T]: T[P]
  }

  declare type Nullable<T> = T | null
  declare type NonNullable<T> = T extends null | undefined ? never : T
  declare type Recordable<T = any> = Record<string, T>
  declare type ReadonlyRecordable<T = any> = {
    readonly [key: string]: T
  }
  declare type Indexable<T = any> = {
    [key: string]: T
  }
  declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>
  }
  declare type TimeoutHandle = ReturnType<typeof setTimeout>
  declare type IntervalHandle = ReturnType<typeof setInterval>

  declare interface ChangeEvent extends Event {
    target: HTMLInputElement
  }

  declare interface WheelEvent {
    path?: EventTarget[]
  }
  interface ImportMetaEnv extends ViteEnv {
    __: unknown
  }

  declare interface ViteEnv {
    VITE_PORT: number
    VITE_USE_MOCK: boolean
    VITE_USE_PWA: boolean
    VITE_PUBLIC_PATH: string
    VITE_PROXY: [string, string][]
    VITE_GLOB_APP_TITLE: string
    VITE_GLOB_APP_SHORT_NAME: string
    VITE_USE_CDN: boolean
    VITE_DROP_CONSOLE: boolean
    VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'none'
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean
    VITE_LEGACY: boolean
    VITE_USE_IMAGEMIN: boolean
    VITE_GENERATE_UI: string
  }

  declare function parseInt(s: string | number, radix?: number): number

  declare function parseFloat(string: string | number): number

  namespace JSX {
    // tslint:disable no-empty-interface
    type Element = VNode
    // tslint:disable no-empty-interface
    type ElementClass = ComponentRenderProxy
    interface ElementAttributesProperty {
      $props: any
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
    interface IntrinsicAttributes {
      [elem: string]: any
    }
  }
  declare type I18N = {
    /**
     * 中文名
     */
    cn: string
    /**
     * 英文名
     */
    en?: null | string
    /**
     * 日文名
     */
    jp?: null | string
  }

  declare type StaffItem = {
    name: string
    avatar?: string | null
    link?: string | null
    role: 'organizer' | 'judge' | 'translator' | 'others'
  }

  declare type Staff = StaffItem[]
  declare type StaffVo = StaffItem[]
  type Site = 'bilibili' | 'personalWebsite' | 'youtube' | 'niconico' | 'twitter'
  declare type Sns = {
    bilibili?: string
    /**
     * niconico网站
     */
    niconico?: string
    /**
     * 个人网站
     */
    personalWebsite?: string
    /**
     * 推特网站
     */
    twitter?: string
    /**
     * youtube频道
     */
    youtube?: string
  }

  declare type DownloadLink = {
    baidu?: string
    google?: string
    onedrive?: string
    other?: string
  }

  declare type LoginVo = {
    /**
     * 是否收藏
     */
    isCollect: boolean
    /**
     * 是否点赞
     */
    isLike: boolean
    /**
     * 是否已投票
     */
    isPoll: boolean
  }

  declare type ResResult<T = any> = {
    code: number
    msg: string
    data: T
    message?: string
    result?: any
  }

  declare type PageResult<T = any> = {
    result: T[]
    total: number
    page: number
  }

  declare interface PageParams {
    page?: number | null
    pageSize?: number | null
    id?: number | null // 搜索id
    keyword?: string | null // 搜索关键词
    createTime?: Date | number | string | null
    sortRule?: string | null // 相关字段
    orderRule?: '' | 'reverse' | null // 不填默认正序
  }

  declare interface IncrementType {
    coll: string
    currentValue: number
  }
}

declare module 'vue' {
  export type JSXComponent<Props = any> =
    | { new (): ComponentPublicInstance<Props> }
    | FunctionalComponent<Props>
}
