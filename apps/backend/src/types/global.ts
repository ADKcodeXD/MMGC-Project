declare global {
  type NormalObject = {
    [key: string]: any
  }

  type ControllerRouter = {
    url: string
    method: string
    handler: Function
    name?: string
    middleware?: any
    constructor?: Function | any
    instance?: any
  }

  type ParamsMeta = {
    name: string
    index: number
    fn: Function
  }

  type I18N = {
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

  type StaffItem = {
    name: string
    avatar?: string | null
    link?: string | null
    role: 'organizer' | 'judge' | 'translator' | 'others'
  }

  type Staff = StaffItem[]
  type StaffVo = StaffItem[]

  type Sns = {
    bilibili?: string
    niconico?: string
    personalWebsite?: string
    twitter?: string
    youtube?: string
  }

  type DownloadLink = {
    baidu?: string
    google?: string
    onedrive?: string
    other?: string
  }

  type LoginVo = {
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

  type ResResult<T> = {
    code: number
    msg: string
    data: T
  }

  type PageResult<T> = {
    result: T[]
    total: number
    page: number
  }
  /**
   * CMVO
   */
  interface Cmvo {
    cmEditor: string | null
    desc: null | string
    link: null | string
    title: null | string
  }

  interface PageParams {
    page?: number | null
    pageSize?: number | null
    id?: number | null // 搜索id
    /** 搜索关键词 */
    keyword?: string | null
    createTime?: Date | number | string | null
    /** 相关字段 */
    sortRule?: string | null
    /** 不填默认正序 */
    orderRule?: '' | 'reverse' | null
  }

  interface IncrementType {
    coll: string
    currentValue: number
  }

  interface MoviePageParams extends PageParams {
    /** 活动id */
    activityId?: number
    /** 活动天数 */
    day?: number
    /** 0代表未公开 1代表公开 */
    isPublic?: number
    /** 上传者id */
    uploader?: number
  }

  interface MMGCSysConfig {
    currentActivityId?: number
    skin?: string
    isVideoPlay?: boolean
    otherSettings?: string
    configType?: number
  }

  const enum ROLE {
    ADMIN = 'ADMIN', // 全局管理员
    SUBADMIN = 'SUBADMIN', // 子管理员
    GUEST = 'GUEST', // 访客
    GROUPMEMBER = 'GROUPMEMBER', // 组内成员
    COMMITTER = 'COMMITTER', // 贡献者
    ALL = 'ALL' // 贡献者
  }

  type SortParams = Array<{ sortIndex: number; id?: number; activityId?: number }>
}
export {}
