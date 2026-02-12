export interface ActivityVo {
  activityBackgroundImg: string | null
  welcomePageBackgroundVideo: string | null
  activityLogo: string | null
  activityCover: string
  activityId: number
  activityName: I18N
  createTime: string
  days: number | null
  desc: I18N | null
  endTime: string | null
  movieNums: number | null
  staff: StaffVo | null
  startTime: string | null
  sponsorListVo: Array<any> | null
}

export interface ActivityParams {
  /**
   * 活动官网页的背景图 不设置就是默认背景
   */
  activityBackgroundImg?: null | string
  /**
   * 欢迎页背景视频
   */
  welcomePageBackgroundVideo?: string | null
  /**
   * 活动封面图
   */
  activityCover: string
  /**
   * 自行输入活动标识或者id
   */
  activityId: number
  /**
   * 活动专属logo
   */
  activityLogo: string
  activityName: I18N
  days?: number | null
  /**
   * 富文本的多语言简介
   */
  desc: I18N
  endTime?: null | string
  /**
   * 搜索获取赞助商id
   */
  sponsorId?: null | number[]
  staff?: null | Staff
  startTime?: null | string
}

export interface DayModel {
  /**
   * 关联的活动id
   */
  activityId: number | null
  /**
   * 第几天
   */
  day: number | null
  /**
   * 主题封面
   */
  themeCover: null | string

  /**
   * 主题描述 支持国际化
   */
  themeDesc: null | I18N
  /**
   * 主题名字
   */
  themeName: I18N | null

  isPublic: boolean | null

  sortIndex: number | null

  dayPollLink: Sns | null
}

export type DayVo = DayModel

export type DayParams = DayModel
