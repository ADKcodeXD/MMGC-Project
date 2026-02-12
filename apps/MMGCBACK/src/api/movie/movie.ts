import { MoviePageParams, MovieParams, MovieUpdateParams, MovieVo } from './model/movieEntity'
import { ErrorMessageMode } from '/#/axios'
import { defHttp } from '/@/utils/http/axios'

enum Api {
  SAVE = '/movie/save',
  GET_ALL_LIST = '/movie/getAllMovie',
  DELETE = '/movie/delete',
  DETAIL = '/movie/getMovieDetailAll',
  UPDATE = '/movie/updateMovie',
  SORT = '/movie/sortMovie',
}

export function save(params: MovieParams, mode?: ErrorMessageMode) {
  return defHttp.post<ResResult<string>>(
    { url: Api.SAVE, params },
    { errorMessageMode: mode || 'none' },
  )
}

export function getMovieList(params: MoviePageParams, mode?: ErrorMessageMode) {
  return defHttp.get<ResResult<PageResult<MovieVo>>>(
    { url: Api.GET_ALL_LIST, params },
    { errorMessageMode: mode || 'none' },
  )
}

export function deleteMovie(movieId: number, mode?: ErrorMessageMode) {
  return defHttp.delete<null>(
    { url: `${Api.DELETE}/${movieId}` },
    { errorMessageMode: mode || 'none' },
  )
}

export function getMovieDetail(movieId: number, mode?: ErrorMessageMode) {
  return defHttp.get<ResResult<MovieVo>>(
    { url: Api.DETAIL, params: { movieId } },
    { errorMessageMode: mode || 'none' },
  )
}

export function updateMovie(movieParams: MovieUpdateParams, mode?: ErrorMessageMode) {
  return defHttp.put<ResResult<MovieVo>>(
    { url: Api.UPDATE, params: movieParams },
    { errorMessageMode: mode || 'none' },
  )
}

export function sortMovie(
  movieParams: Array<{ movieId: number; sortIndex: number }>,
  mode?: ErrorMessageMode,
) {
  return defHttp.put<ResResult<null>>(
    { url: Api.SORT, params: movieParams },
    { errorMessageMode: mode || 'none' },
  )
}
