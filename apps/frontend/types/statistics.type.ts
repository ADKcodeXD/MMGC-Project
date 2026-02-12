export interface StatisticsModel {
  _id: string
  _v: number
  authorName: string | null
  authorAvatar: string | null
  participateTimes: number | string | null
  consecutiveParticipateTimes: number | string | null
  authorType: 'gold' | 'silver' | 'bronze' | 'normal' | 'platinum' | null
  participateMacthes: number[] | string[] | null
  createTime: Number | null | string
}

export type StatisticsParams = Omit<StatisticsModel, '_id' | 'createTime' | '_v'>
export type StatisticsUpdateParams = Omit<StatisticsModel, 'createTime' | '_v'>
