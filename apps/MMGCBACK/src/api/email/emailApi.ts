import { defHttp } from '/@/utils/http/axios'

enum Api {
  GET_CODE = '/email/getCode',
  VERIFY_CODE = '/email/verify',
}

export function getCode(params: { email: string }) {
  return defHttp.get<ResResult<null>>({ url: Api.GET_CODE, params })
}

export function verifyCode(params: { email: string; code: number }) {
  return defHttp.post<ResResult<null>>({ url: Api.VERIFY_CODE, params })
}
