import { defineEventHandler } from 'h3'

type ApiResult<T> = {
  code?: number
  data?: T
  result?: T
}

type PageResult<T> = {
  result?: T[]
}

type ActivityItem = {
  activityId?: number
}

type MovieItem = {
  movieId?: number
}

const locales = ['cn', 'en', 'jp']
const activityPages = ['about', 'main', 'support', 'history']

function getApiBase() {
  return process.env.NUXT_PUBLIC_API_BASE || 'https://mirai-mad.com'
}

function getApiPrefix() {
  return process.env.NUXT_PUBLIC_API_PREFIX || '/mmgcApi'
}

function buildApiUrl(path: string, query?: Record<string, string | number>) {
  const url = new URL(`${getApiPrefix()}${path}`, getApiBase())
  if (query) {
    Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, String(value)))
  }
  return url.toString()
}

async function fetchApi<T>(path: string, query?: Record<string, string | number>): Promise<T | null> {
  try {
    const response = await fetch(buildApiUrl(path, query))
    if (!response.ok) return null

    const json = (await response.json()) as ApiResult<T>
    return (json.result ?? json.data ?? null) as T | null
  } catch (error) {
    console.error('[sitemap] fetch failed:', path, error)
    return null
  }
}

function addLocalizedRoute(routes: Set<string>, path: string) {
  locales.forEach(locale => {
    routes.add(`/${locale}${path === '/' ? '' : path}`)
  })
}

export default defineEventHandler(async () => {
  const routes = new Set<string>()

  addLocalizedRoute(routes, '/')
  addLocalizedRoute(routes, '/welcome')
  addLocalizedRoute(routes, '/statistics')

  const activityPage = await fetchApi<PageResult<ActivityItem>>('/activity/getActivityList', {
    page: 1,
    pageSize: 200
  })

  const activities = activityPage?.result?.filter(item => item.activityId) ?? []
  for (const activity of activities) {
    const activityId = activity.activityId!
    activityPages.forEach(page => addLocalizedRoute(routes, `/activity/${activityId}/${page}`))

    const moviePage = await fetchApi<PageResult<MovieItem>>('/movie/getMovieByActivityId', {
      activityId
    })
    moviePage?.result
      ?.filter(item => item.movieId)
      .forEach(movie => addLocalizedRoute(routes, `/movie/${movie.movieId}`))
  }

  return Array.from(routes)
})
