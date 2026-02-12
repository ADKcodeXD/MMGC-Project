import { defHttp } from '/@/utils/http/axios'

export interface BiliUserInfo {
  mid: number
  name: string
  face: string
}

export function getBiliUserInfo(mid: number) {
  return defHttp.get<ResResult<BiliUserInfo>>({
    url: '/bilibili/userinfo',
    params: { mid },
  })
}
