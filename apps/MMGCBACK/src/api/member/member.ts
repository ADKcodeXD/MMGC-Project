import { MemberVo } from '/@/api/member/model/memberEntity'
import { LoginParams, MemberParams } from './model/memberEntity'
import { ErrorMessageMode } from '/#/axios'
import { defHttp } from '/@/utils/http/axios'

enum Api {
  REGISTER = '/user/register',
  LOGIN = '/user/login',
  GET_MY_INFO = '/user/getMyInfo',
  GET_USER_LIST_ALL = '/user/getUserListAll',
  GET_USER_LIST = '/user/getUserList',
  BATCH_DELETE_USER = '/user/batchDelete',
  UPDATE_USER = '/user/updateMember',
  ADD_MEMBER = '/user/addMember',
  MEMBER_DETAIL = '/user/getUserDetail',
}

export function register(params: MemberParams) {
  return defHttp.post<ResResult<string>>({ url: Api.REGISTER, params })
}

export function login(params: LoginParams, mode: ErrorMessageMode) {
  return defHttp.post<ResResult<string>>({ url: Api.LOGIN, params }, { errorMessageMode: mode })
}

export function getUserInfo() {
  return defHttp.get<ResResult<MemberVo>>({ url: Api.GET_MY_INFO }, { errorMessageMode: 'none' })
}

export function getUserListAll(pageParams: PageParams) {
  return defHttp.get<ResResult<PageResult<MemberVo>>>(
    { url: Api.GET_USER_LIST_ALL, params: pageParams },
    { errorMessageMode: 'none' },
  )
}

export function getUserList(pageParams: PageParams) {
  return defHttp.get<ResResult<PageResult<MemberVo>>>(
    { url: Api.GET_USER_LIST, params: pageParams },
    { errorMessageMode: 'none' },
  )
}

export function batchDeleteUser(params: Array<number>) {
  return defHttp.delete<ResResult<null>>(
    { url: Api.BATCH_DELETE_USER, params: params },
    { errorMessageMode: 'message' },
  )
}

export function updateMember(params: MemberVo) {
  return defHttp.put<ResResult<null>>(
    { url: Api.UPDATE_USER, params },
    { errorMessageMode: 'message' },
  )
}

export function addMember(params: MemberVo) {
  return defHttp.post<ResResult<null>>(
    { url: Api.ADD_MEMBER, params },
    { errorMessageMode: 'message' },
  )
}

export function getMemberDetail(params: number) {
  return defHttp.get<ResResult<MemberVo>>(
    { url: `${Api.MEMBER_DETAIL}/${params}` },
    { errorMessageMode: 'message' },
  )
}
