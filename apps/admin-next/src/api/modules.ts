import type {
  ActivityVo,
  DashboardOverviewData,
  DayVo,
  LoginResult,
  MemberVo,
  MovieVo,
  PageParams,
  PageResult,
  SiteTrafficItem,
  SitemapOverviewData,
  SponsorVo,
  StatisticsAuthor,
  SysConfig,
  TrackOverviewData,
  I18N
} from '../types'
import { del, get, post, put } from './client'

export const authApi = {
  login: (params: { username: string; password: string }) => post<LoginResult>('/user/login', params),
  getMyInfo: () => get<MemberVo>('/user/getMyInfo')
}

export const statisticsApi = {
  dashboardOverview: (days = 30) =>
    get<DashboardOverviewData>('/statistics/dashboardOverview', { days }),
  trafficStats: (days = 7) =>
    get<SiteTrafficItem[]>('/statistics/siteTraffic', { days }),
  trackOverview: (days = 7) =>
    get<TrackOverviewData>('/statistics/trackOverview', { days }),
  sitemapOverview: () =>
    get<SitemapOverviewData>('/statistics/sitemapOverview')
}

export const activityApi = {
  list: (params: PageParams) => get<PageResult<ActivityVo>>('/activity/getActivityList', params),
  detail: (activityId: number) => get<ActivityVo>(`/activity/getActivityDetail/${activityId}`),
  save: (params: Partial<ActivityVo>) => post<null>('/activity/saveActivity', params),
  update: (params: Partial<ActivityVo>) => put<null>('/activity/updateActivity', params),
  remove: (activityId: number) => del<null>(`/activity/deleteActivity/${activityId}`),
  days: (activityId: number) => get<DayVo[]>('/activity/getDaysAll', { activityId }),
  saveDay: (params: Partial<DayVo>) => post<null>('/activity/saveDay', params),
  updateDay: (params: Partial<DayVo>) => put<null>('/activity/updateDay', params),
  deleteDay: (params: { activityId: number; day: number }) => del<null>('/activity/deleteDay', params),
  sortDay: (params: Array<{ id: number; sortIndex: number }>) => put<null>('/activity/sortDay', params)
}

export const movieApi = {
  list: (params: PageParams) => get<PageResult<MovieVo>>('/movie/getAllMovie', params),
  detail: (movieId: number) => get<MovieVo>('/movie/getMovieDetailAll', { movieId }),
  publicDetail: (movieId: number) => get<MovieVo>('/movie/getMovieDetail', { movieId }),
  save: (params: Partial<MovieVo>) => post<null>('/movie/save', params),
  update: (params: Partial<MovieVo> & { movieId: number }) => put<null>('/movie/updateMovie', params),
  remove: (movieId: number) => del<null>(`/movie/delete/${movieId}`),
  sort: (params: Array<{ movieId: number; sortIndex: number }>) => put<null>('/movie/sortMovie', params)
}

export const uploadApi = {
  qiniuToken: () => post<string>('/upload/getQiniuToken')
}

export const sponsorApi = {
  list: (params: PageParams) => get<PageResult<SponsorVo>>('/sponsor/getSponsorList', params),
  detail: (sponsorId: number) => get<SponsorVo>(`/sponsor/getSponsorDetail`, { sponsorId }),
  save: (params: Partial<SponsorVo>) => post<null>('/sponsor/saveSponsor', params),
  update: (params: Partial<SponsorVo>) => put<null>('/sponsor/updateSponsor', params),
  remove: (sponsorId: number) => del<null>(`/sponsor/deleteSponsor/${sponsorId}`)
}

export const memberApi = {
  list: (params: PageParams) => get<PageResult<MemberVo>>('/user/getUserListAll', params),
  detail: (memberId: number) => get<MemberVo>(`/user/getUserDetail/${memberId}`),
  update: (params: Partial<MemberVo>) => put<null>('/user/updateMember', params),
  addMember: (params: Partial<MemberVo>) => post<null>('/user/addMember', params),
  batchDelete: (ids: number[]) => del<null>('/user/batchDelete', ids)
}

export const authorApi = {
  rank: (params: PageParams) => post<PageResult<StatisticsAuthor>>('/statistics/getAuthorRank', params),
  add: (params: Partial<StatisticsAuthor>) => post<null>('/statistics/addNewAuthor', params),
  update: (params: Partial<StatisticsAuthor>) => post<null>('/statistics/updateAuthor', params),
  remove: (id: string) => del<null>(`/statistics/deleteAuthor/${id}`)
}

export const configApi = {
  get: () => get<SysConfig>('/config/getConfig'),
  update: (params: Partial<SysConfig>) => post<null>('/config/updateConfig', params)
}

export const bilibiliApi = {
  userInfo: (mid: number) => get<import('../types').BiliUserInfo>('/bilibili/userinfo', { mid })
}

export const translateApi = {
  autoTranslate: (text: string, isHtml = false) => post<I18N>('/translate/auto', { text, isHtml })
}
