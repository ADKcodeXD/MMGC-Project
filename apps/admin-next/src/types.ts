export type I18N = {
  cn: string
  en?: string | null
  jp?: string | null
}

export type ResResult<T> = {
  code: number
  msg: string
  data?: T
  result?: T
}

export type PageResult<T> = {
  result: T[]
  total: number
  page: number
}

export type PageParams = {
  page?: number
  pageSize?: number
  keyword?: string
  activityId?: number
  day?: number
  isPublic?: number
  unboundOnly?: boolean
  sortRule?: string | null
  orderRule?: '' | 'reverse' | null
  uploader?: number
  authorName?: string
  createTimeStart?: string
  createTimeEnd?: string
  updateTimeStart?: string
  updateTimeEnd?: string
}

export type StaffItem = {
  name: string
  avatar?: string | null
  link?: string | null
  role: 'organizer' | 'judge' | 'translator' | 'others'
}

export type ActivityVo = {
  activityId: number
  activityName: I18N
  activityCover?: string
  activityLogo?: string | null
  activityBackgroundImg?: string | null
  welcomePageBackgroundVideo?: string | null
  desc?: I18N | null
  startTime?: string | null
  endTime?: string | null
  days?: number | null
  movieNums?: number | null
  staff?: StaffItem[] | null
  sponsorListVo?: SponsorVo[] | null
  rules?: I18N | null
  timesorother?: I18N | null
  faq?: I18N | null
  createTime?: string
}

export type DayVo = {
  id?: number
  activityId: number | null
  day: number | null
  themeCover: string | null
  themeName: I18N | null
  themeDesc: I18N | null
  isPublic: boolean | null
  dayPollLink?: Sns | null
  sortIndex: number | null
}

export type MovieVo = {
  movieId: number
  movieName: I18N
  movieDesc: I18N
  movieCover: string
  moviePlaylink: I18N
  activityVo: ActivityVo | null
  activityId?: number | null
  day: number | null
  sortIndex: number | null
  authorName?: string | null
  authorAvatar?: string | null
  authorSpaceUrl?: string | null
  authorId?: number | null
  author?: MemberVo | null
  uploader?: number | MemberVo | null
  isPublic?: boolean | null
  viewNums?: number | null
  likeNums?: number | null
  pollNums?: number | null
  movieLink?: Sns | null
  movieDownloadLink?: {
    baidu?: string | null
    google?: string | null
    onedrive?: string | null
    other?: string | null
  } | null
  realPublishTime?: string | null
  expectPlayTime?: string | null
  isOrigin?: number | null
  createTime?: string
  updateTime?: string | null
}

export type R2BillingDetails = {
  storageGbMonths: number
  billableStorageGbMonths: number
  classAOperations: number
  billableClassAOperations: number
  classBOperations: number
  billableClassBOperations: number
  storageCostUSD: number
  classAOperationsCostUSD: number
  classBOperationsCostUSD: number
  egressCostUSD: number
  totalCostUSD: number
}

export type TrackDailyItem = {
  date: string
  pv: number
  uv: number
  click: number
}

export type TrackPageItem = {
  pageUrl: string
  pv: number
  uv: number
}

export type TrackOverviewData = {
  totalPv: number
  totalUv: number
  totalEvents: number
  daily: TrackDailyItem[]
  topPages: TrackPageItem[]
}

export type TrackRecord = {
  _id: string
  pageUrl?: string | null
  eventType: 'pv' | 'click' | string
  eventKey?: string | null
  eventData?: unknown
  visitorId?: string | null
  ip?: string | null
  userAgent?: string | null
  createTime?: string | null
}

export type SitemapRow = {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

export type SitemapOverviewData = {
  siteUrl: string
  sitemapUrl: string
  robotsUrl: string
  sourceUrl: string
  sitemap: {
    ok: boolean
    status: number
    error?: string | null
    urlCount: number
    rows: SitemapRow[]
  }
  robots: {
    ok: boolean
    status: number
    error?: string | null
    hasSitemap: boolean
    content: string
  }
  source: {
    ok: boolean
    status: number
    error?: string | null
    urlCount: number
    urls: string[]
  }
}

export type DashboardOverviewData = {
  provider: 'cloudflare-r2'
  configured: boolean
  configurationError: string | null
  bucket: string
  periodDays: number
  currentStorageGB: number
  avgStorageGB: number
  objectCount: number
  classAOperations: number
  classBOperations: number
  otherOperations: number
  totalOperations: number
  estimatedStorageCostUSD: number
  estimatedOperationsCostUSD: number
  estimatedTotalCostUSD: number
  dailyStats: R2DailyStat[]
  billing: R2BillingDetails
}

export type R2DailyStat = {
  date: string
  classAOperations: number
  classBOperations: number
  otherOperations: number
  totalOperations: number
  storageGB: number
  objectCount: number
}

export type SiteTrafficItem = {
  date: string
  dayUv: number
  fluxGB: number
  chinaFluxGB: number
  overseaFluxGB: number
  chinaBandwidthMbps?: number
  overseaBandwidthMbps?: number
}

export type LoginResult =
  | string
  | {
  token?: string
  accessToken?: string
  [key: string]: unknown
}

export type Sns = {
  bilibili?: string | null
  youtube?: string | null
  twitter?: string | null
  niconico?: string | null
  website?: string | null
  personalWebsite?: string | null
}

export type MemberVo = {
  memberId: number
  memberName: string
  username: string
  avatar?: string | null
  desc?: string | null
  gender?: number | null
  snsSite?: Sns | null
  role?: string | null
  email?: string | null
  password?: string | null
  createTime?: string
}

export type SponsorVo = {
  sponsorId: number
  sponsorName: I18N
  sponsorDesc?: I18N | null
  sponsorLogo?: string | null
  createTime?: string
}

export type StatisticsAuthor = {
  _id: string
  authorName: string
  authorAvatar?: string | null
  participateTimes: number
  consecutiveParticipateTimes?: number
  authorType?: 'gold' | 'silver' | 'bronze' | 'normal' | 'platinum'
  participateMacthes?: number[]
  createTime?: string
}

export type SysConfig = {
  currentActivityId?: number
  otherSettings?: string
  enableWatermark?: boolean
  enableCnAssetAcceleration?: boolean
  isVideoPlay?: boolean
  skin?: string
  configType?: number
}

export type BiliUserInfo = {
  mid: number
  name: string
  face: string
}
