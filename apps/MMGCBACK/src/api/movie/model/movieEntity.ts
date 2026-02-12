import { ActivityVo } from '../../activity/model/activityEntity'
import { MemberVo } from '../../member/model/memberEntity'

export interface MovieParams {
  /**
   * 关联活动id 提供一个选择活动的组件
   */
  activityId?: number | null
  /**
   * 通过用户搜索接口获取id并填写
   */
  authorId?: number | null
  /**
   * 如果不存在 则使用该名字 表单应显示：原作者
   */
  authorName?: null | string
  /**
   * 关联了活动后 这里提供一个表单选择天数
   */
  day?: number | null
  /**
   * 期望播放时间 自行填写
   */
  expectPlayTime?: null | string
  /**
   * 0 非原创 1 原创
   */
  isOrigin?: number | null
  /**
   * cover 视频封面
   */
  movieCover: string
  /**
   * 影片介绍 分三语
   */
  movieDesc: I18N
  movieDownloadLink?: null | DownloadLink
  /**
   * 影片的播放链接 分各种平台
   */
  movieLink?: null | Sns

  /**
   * 影片名 分三语存放
   */
  movieName: I18N
  /**
   * 三语播放i18n列表 适用于有多个源的情况下
   */
  moviePlaylink: I18N
  /**
   * 自行填写的时间 表示原作者实际发布的时间
   */
  realPublishTime?: null | string
}

/**
 * MovieVo
 */
export interface MovieVo {
  /**
   * 关联活动id 如果不存在则为非活动作品
   */
  activityVo: ActivityVo | null
  /**
   * 作者id 可以关联本站拥有的用户 如果不存在可以输入作者名
   */
  author: MemberVo | null
  authorName: string | null
  /**
   * 评论次数
   */
  commentNums: number | null
  /**
   * 上传时间 自动生成
   */
  createTime: string
  /**
   * 假设关联了活动 那么这个movie就会有所属日
   */
  day: number | null

  sortIndex: number | null

  /**
   * 是否为活动作品
   */
  isActivityMovie: boolean | null
  /**
   * 是否公开
   */
  isPublic: boolean | null
  /**
   * 0 非原创 1 原创
   */
  isOrigin: number | null
  /**
   * 点赞数量
   */
  likeNums: number | null
  /**
   * 只有在 已登录的情况下会返回该数据 用于判断是否投票或点赞收藏过
   */
  loginVo: null | LoginVo
  /**
   * cover 视频封面
   */
  movieCover: string
  /**
   * 影片介绍 分三语
   */
  movieDesc: I18N
  movieDownloadLink: null | DownloadLink
  /**
   * 影片id
   */
  movieId: number
  /**
   * 影片的播放链接 分各种平台
   */
  movieLink: null | Sns
  /**
   * 影片名 分三语存放
   */
  movieName: I18N
  /**
   * 三语播放i18n列表 适用于有多个源的情况下
   */
  moviePlaylink: I18N
  /**
   * 票数 仅用于活动作品 统计投票次数 一个人单日只能投一个作品
   */
  pollNums: number | null
  /**
   * 实际发布时间 用户填写
   */
  realPublishTime: null | string
  /**
   * 上传者id
   */
  uploader: MemberVo
  /**
   * 播放次数
   */
  viewNums: number | null
}

/**
 * MoviePageParams
 */
export interface MoviePageParams {
  /**
   * 活动id
   */
  activityId?: number
  createTime?: string
  /**
   * 天数
   */
  day?: number
  id?: number
  /**
   * 0代表未公开 1代表公开
   */
  isPublic?: number
  keyword?: string
  orderRule?: string
  page?: number
  pageSize?: number
  sortRule?: string
  /**
   * 上传者id
   */
  uploader?: number
}

export interface MovieUpdateParams extends Partial<MovieParams> {
  movieId: number
}
