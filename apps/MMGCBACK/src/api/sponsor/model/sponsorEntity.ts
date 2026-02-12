export interface SponsorModel {
  /**
   * 赞助商简介
   */
  sponsorDesc: I18N | null
  /**
   * 赞助商id
   */
  sponsorId: number | null
  /**
   * 赞助商logo
   */
  sponsorLogo: null | string
  /**
   * 赞助商名字
   */
  sponsorName: I18N | null
  createTime: Number | null | string
}

export type SponsorParams = Omit<SponsorModel, 'sponsorId' | 'createTime'>
export type SponsorUpdateParams = Partial<Omit<SponsorModel, 'createTime' | 'sponsorId'>> & {
  sponsorId: number
}
