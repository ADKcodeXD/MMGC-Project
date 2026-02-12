import { defHttp } from '/@/utils/http/axios'

enum Api {
  GET_CONFIG = '/config/getConfig',
  UPDATE_CONFIG = '/config/updateConfig',
}

export function getConfig() {
  return defHttp.get<ResResult<any>>({ url: Api.GET_CONFIG }, { errorMessageMode: 'none' })
}

export function saveConfig(body: any) {
  return defHttp.post<ResResult<any>>(
    { url: Api.UPDATE_CONFIG, data: body },
    { errorMessageMode: 'none' },
  )
}
