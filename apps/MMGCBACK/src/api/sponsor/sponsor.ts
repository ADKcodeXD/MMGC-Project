import { SponsorModel, SponsorParams, SponsorUpdateParams } from './model/sponsorEntity'
import { ErrorMessageMode } from '/#/axios'
import { defHttp } from '/@/utils/http/axios'

enum Api {
  SAVE = '/sponsor/saveSponsor',
  GET_ALL_LIST = '/sponsor/getSponsorList',
  DELETE = '/sponsor/deleteSponsor',
  DETAIL = '/sponsor/getSponsorDetail',
  UPDATE = '/sponsor/updateSponsor',
}

export function saveSponsor(params: SponsorParams, mode?: ErrorMessageMode) {
  return defHttp.post<ResResult<string>>(
    { url: Api.SAVE, params },
    { errorMessageMode: mode || 'none' },
  )
}

export function getSponsorList(params: PageParams, mode?: ErrorMessageMode) {
  return defHttp.get<ResResult<PageResult<SponsorModel>>>(
    { url: Api.GET_ALL_LIST, params },
    { errorMessageMode: mode || 'none' },
  )
}

export function deleteSponsor(sponsorId: number, mode?: ErrorMessageMode) {
  return defHttp.delete<null>(
    { url: `${Api.DELETE}/${sponsorId}` },
    { errorMessageMode: mode || 'none' },
  )
}

export function getSponsorDetail(sponsorId: number, mode?: ErrorMessageMode) {
  return defHttp.get<ResResult<SponsorModel>>(
    { url: Api.DETAIL, params: { sponsorId } },
    { errorMessageMode: mode || 'none' },
  )
}

export function updateSponsor(sponsor: SponsorUpdateParams, mode?: ErrorMessageMode) {
  return defHttp.put<ResResult<SponsorModel>>(
    { url: Api.UPDATE, params: sponsor },
    { errorMessageMode: mode || 'none' },
  )
}
