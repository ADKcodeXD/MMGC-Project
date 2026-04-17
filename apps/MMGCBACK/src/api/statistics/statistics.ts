import { StatisticsModel, StatisticsParams, StatisticsUpdateParams } from './model/statisticsEntity'
import { ErrorMessageMode } from '/#/axios'
import { defHttp } from '/@/utils/http/axios'

enum Api {
  SAVE = '/statistics/addNewAuthor',
  GET_ALL_LIST = '/statistics/getAuthorRank',
  DELETE = '/statistics/deleteAuthor',
  UPDATE = '/statistics/updateAuthor',
  GET_SITE_TRAFFIC = '/statistics/siteTraffic',
}

export function saveAuthor(params: StatisticsParams, mode?: ErrorMessageMode) {
  return defHttp.post<null>(
    { url: Api.SAVE, params },
    { errorMessageMode: mode || 'none' },
  )
}

export function getAuthorList(params: PageParams, mode?: ErrorMessageMode) {
  return defHttp.post<ResResult<PageResult<StatisticsModel>>>(
    { url: Api.GET_ALL_LIST, params },
    { errorMessageMode: mode || 'none' },
  )
}

export function deleteAuthor(id: any, mode?: ErrorMessageMode) {
  return defHttp.delete<null>(
    { url: `${Api.DELETE}/${id}` },
    { errorMessageMode: mode || 'none' },
  )
}

export function updateAuthor(sponsor: StatisticsUpdateParams, mode?: ErrorMessageMode) {
  return defHttp.post<null>(
    { url: Api.UPDATE, params: sponsor },
    { errorMessageMode: mode || 'none' },
  )
}

export interface SiteTrafficData {
  date: string;
  dayUv: number;
  fluxGB: number;
}

export function getSiteTrafficStats(days?: number, mode?: ErrorMessageMode) {
  return defHttp.get<SiteTrafficData[]>(
    { url: Api.GET_SITE_TRAFFIC, params: { days } },
    { errorMessageMode: mode || 'none' },
  )
}
