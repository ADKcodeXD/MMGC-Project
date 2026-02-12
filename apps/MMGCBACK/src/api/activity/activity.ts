import { defHttp } from '/@/utils/http/axios'
import { ActivityParams, ActivityVo, DayParams, DayVo } from './model/activityEntity'

enum Api {
  GET_ACTIVITY_LIST = '/activity/getActivityList',
  GET_ACTIVITY_DETAIL = '/activity/getActivityDetail',
  SAVE_ACTIVITY = '/activity/saveActivity',
  UPDATE_ACTIVITY = '/activity/updateActivity',
  DELETE_ACTIVITY = '/activity/deleteActivity',
  SAVE_DAY = '/activity/saveDay',
  DELETE_DAY = '/activity/deleteDay',
  UPDATE_DAY = '/activity/updateDay',
  GET_DAYS = '/activity/getDaysAll',
  SORT_DAYS = '/activity/sortDay',
}

export function getActivityList(params: PageParams) {
  return defHttp.get<ResResult<PageResult<ActivityVo>>>({ url: Api.GET_ACTIVITY_LIST, params })
}

export function saveActivity(params: ActivityParams) {
  return defHttp.post<ResResult<string>>({ url: Api.SAVE_ACTIVITY, params })
}

export function updateActivity(params: ActivityParams) {
  return defHttp.put<ResResult<string>>({ url: Api.UPDATE_ACTIVITY, params })
}

export function getActivityDetail(activityId: number) {
  return defHttp.get<ResResult<ActivityVo>>({ url: `${Api.GET_ACTIVITY_DETAIL}/${activityId}` })
}

export function deleteActivity(activityId: number) {
  return defHttp.delete<ResResult<ActivityVo>>({ url: `${Api.DELETE_ACTIVITY}/${activityId}` })
}

export function saveDay(params: DayParams) {
  return defHttp.post<ResResult<string>>({ url: Api.SAVE_DAY, params })
}

export function getDays(activityId: number) {
  return defHttp.get<ResResult<DayVo[]>>({
    url: Api.GET_DAYS,
    params: {
      activityId,
    },
  })
}

export function deleteDay(params: { activityId: number; day: number }) {
  return defHttp.delete<ResResult<null>>({ url: Api.DELETE_DAY, params })
}

export function updateDay(params: DayParams) {
  return defHttp.put<ResResult<string>>({ url: Api.UPDATE_DAY, params })
}

export function sortDay(params: Array<{ sortIndex: number; id: number }>) {
  return defHttp.put<ResResult<string>>({ url: Api.SORT_DAYS, params })
}
