import { pageQuery } from '~/common/utils'
import { Service } from '~/common/decorator/decorator'
import { copyProperties } from '~/common/utils'
import { Statistics, Track } from '~/model'
import BaseService from './base.service'
import { formatTime } from '~/common/utils/moment'
import { AuthorModelEntity, AuthorParamsEntity } from '~/entity/statistics.entity'
import { StatisticsModel, StatisticsParams, StatisticsUpdateParams } from 'Statistics'
import qiniu from 'qiniu'
import axios from 'axios'
import config from '~/config/config.default'
import dayjs from 'dayjs'

const QINIU_BILLING = {
  standardStorageMonthly: 0.115,
  standardStorageFreeGB: 10,
  lowFreqStorageMonthly: 0.075,
  lowFreqRetrievalPerGB: 0.03,
  cdnBackToOriginPerGB: 0.15,
  standardBackToOriginFreeGB: 10,
  chinaHttpsPerGB: 0.28,
  overseaAsiaHttpsPerGB: 0.6,
  overseaEuNaHttpsPerGB: 0.4,
  overseaAsiaRatio: 38.5819 / (38.5819 + 41.7671)
}

const round2 = (value: number) => Number(value.toFixed(2))
const round4 = (value: number) => Number(value.toFixed(4))

const qiniuDateHeader = () => {
  const date = new Date()
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
}

const buildQiniuUrl = (host: string, path: string, params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, value.toString())
  })
  return `${host}${path}?${query.toString()}`
}

const qiniuV2Headers = (mac: qiniu.auth.digest.Mac, url: string) => {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Qiniu-Date': qiniuDateHeader()
  }
  return {
    ...headers,
    Authorization: qiniu.util.generateAccessTokenV2(mac, url, 'GET', headers['Content-Type'], undefined, headers)
  }
}

const qiniuLegacyHeaders = (mac: qiniu.auth.digest.Mac, url: string) => ({
  'Content-Type': 'application/x-www-form-urlencoded',
  Authorization: qiniu.util.generateAccessToken(mac, url, '')
})

const fetchQiniuStat = async (mac: qiniu.auth.digest.Mac, path: string, params: Record<string, string | number | undefined>) => {
  const hosts = ['https://api.qiniu.com', 'https://api.qiniuapi.com']
  const errors: string[] = []

  for (const host of hosts) {
    const url = buildQiniuUrl(host, path, params)
    for (const headers of [qiniuV2Headers(mac, url), qiniuLegacyHeaders(mac, url)]) {
      try {
        const res = await axios.get(url, { headers })
        return res.data
      } catch (err: any) {
        errors.push(`${url}: ${JSON.stringify(err?.response?.data || err?.message)}`)
      }
    }
  }

  throw new Error(errors.join('; '))
}

const readNumericSeries = (payload: any) => {
  const list = payload?.datas || payload?.data?.datas || payload?.result?.datas || payload?.values || payload
  if (!Array.isArray(list)) return []
  return list
    .map(item => {
      if (typeof item === 'number') return item
      if (typeof item?.value === 'number') return item.value
      if (typeof item?.values === 'number') return item.values
      if (typeof item?.values?.space === 'number') return item.values.space
      if (typeof item?.values?.storage === 'number') return item.values.storage
      return 0
    })
    .filter(value => value > 0)
}

const sumQiniuFlowBytes = (payload: any) => {
  const list = Array.isArray(payload)
    ? payload
    : payload?.data || payload?.datas || payload?.result || payload?.items || []
  if (!Array.isArray(list)) return 0

  return list.reduce((total: number, item: any) => {
    if (typeof item === 'number') return total + item
    if (typeof item?.flow === 'number') return total + item.flow
    if (typeof item?.value === 'number') return total + item.value
    if (typeof item?.values === 'number') return total + item.values
    if (typeof item?.values?.flow === 'number') return total + item.values.flow
    if (Array.isArray(item?.values)) {
      return total + item.values.reduce((sum: number, value: any) => sum + (Number(value?.flow ?? value) || 0), 0)
    }
    return total
  }, 0)
}

const getSiteUrl = () => {
  const siteUrl = config.SITE_URL || config.FRONTEND_URL || config.NUXT_PUBLIC_API_BASE || 'https://mirai-mad.com'
  return siteUrl.replace(/\/$/, '')
}

const parseXmlLocRows = (xmlText: string) => {
  const rows: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }> = []
  const urlBlocks = xmlText.match(/<url>[\s\S]*?<\/url>/g) || []
  for (const block of urlBlocks) {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim()
    if (!loc) continue
    rows.push({
      loc,
      lastmod: block.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1]?.trim(),
      changefreq: block.match(/<changefreq>([\s\S]*?)<\/changefreq>/)?.[1]?.trim(),
      priority: block.match(/<priority>([\s\S]*?)<\/priority>/)?.[1]?.trim()
    })
  }
  return rows
}

const fetchUrlCheck = async (url: string, responseType: 'text' | 'json' = 'text') => {
  try {
    const res = await axios.get(url, {
      responseType: responseType === 'json' ? 'json' : 'text',
      timeout: 15000,
      validateStatus: status => status >= 200 && status < 500
    })
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      data: res.data,
      error: res.status >= 200 && res.status < 300 ? null : `HTTP ${res.status}`
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: responseType === 'json' ? [] : '',
      error: err?.message || 'Request failed'
    }
  }
}

const calcLongestConsecutiveTimes = (nums: number[]) => {
  if (nums.length === 0) return 0
  let longestTimes = 1
  const set = new Set(nums.sort((a, b) => a - b))
  for (const item of set) {
    if (set.has(item - 1)) {
      continue
    }
    let currentNum = item
    let currentLongestNum = 1
    while (set.has(currentNum + 1)) {
      currentNum += 1
      currentLongestNum += 1
    }
    longestTimes = Math.max(longestTimes, currentLongestNum)
  }
  return longestTimes
}

@Service(true)
export default class StatisticsService extends BaseService {
  statisticsModel = Statistics

  async saveTrack(params: any) {
    const track = new Track({
      pageUrl: params.pageUrl || null,
      eventType: params.eventType || 'pv',
      eventKey: params.eventKey || null,
      eventData: params.eventData || null,
      visitorId: params.visitorId || null,
      ip: params.ip || null,
      userAgent: params.userAgent || null,
      createTime: Date.now()
    })
    await track.save()
    return null
  }

  async getTrackOverview(days = 7) {
    const start = dayjs().subtract(days - 1, 'day').startOf('day').valueOf()
    const match = { createTime: { $gte: start } }

    const [pvTotal, eventTotal, uvAgg, dailyAgg, pageAgg] = await Promise.all([
      Track.countDocuments({ ...match, eventType: 'pv' }),
      Track.countDocuments(match),
      Track.aggregate([
        { $match: { ...match, eventType: 'pv' } },
        { $group: { _id: { $ifNull: ['$visitorId', '$ip'] } } },
        { $match: { _id: { $ne: null } } },
        { $count: 'total' }
      ]),
      Track.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$createTime' }, timezone: 'Asia/Shanghai' } },
              eventType: '$eventType'
            },
            count: { $sum: 1 },
            visitors: { $addToSet: { $ifNull: ['$visitorId', '$ip'] } }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),
      Track.aggregate([
        { $match: { ...match, eventType: 'pv' } },
        {
          $group: {
            _id: '$pageUrl',
            pv: { $sum: 1 },
            visitors: { $addToSet: { $ifNull: ['$visitorId', '$ip'] } }
          }
        },
        { $sort: { pv: -1 } },
        { $limit: 20 }
      ])
    ])

    const dailyMap = new Map<string, { date: string; pv: number; click: number; uvSet: Set<string> }>()
    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
      dailyMap.set(date, { date, pv: 0, click: 0, uvSet: new Set() })
    }

    for (const item of dailyAgg) {
      const date = item?._id?.date
      if (!date) continue
      const row = dailyMap.get(date) || { date, pv: 0, click: 0, uvSet: new Set<string>() }
      if (item?._id?.eventType === 'pv') row.pv += item.count || 0
      if (item?._id?.eventType === 'click') row.click += item.count || 0
      if (item?._id?.eventType === 'pv') {
        for (const visitor of item.visitors || []) {
          if (visitor) row.uvSet.add(visitor)
        }
      }
      dailyMap.set(date, row)
    }

    const daily = Array.from(dailyMap.values()).map(item => ({
      date: item.date,
      pv: item.pv,
      click: item.click,
      uv: item.uvSet.size
    }))

    const topPages = pageAgg.map(item => ({
      pageUrl: item._id || '/',
      pv: item.pv || 0,
      uv: (item.visitors || []).filter(Boolean).length
    }))

    return {
      totalPv: pvTotal,
      totalUv: uvAgg?.[0]?.total || 0,
      totalEvents: eventTotal,
      daily,
      topPages
    }
  }

  async getTrackList(pageParams: PageParams & { eventType?: string; eventKey?: string; pageUrl?: string }) {
    const page = Number(pageParams.page || 1)
    const pageSize = Number(pageParams.pageSize || 20)
    const filter: Record<string, any> = {}

    if (pageParams.eventType) filter.eventType = pageParams.eventType
    if (pageParams.eventKey) filter.eventKey = { $regex: new RegExp(pageParams.eventKey, 'i') }
    if (pageParams.pageUrl) filter.pageUrl = { $regex: new RegExp(pageParams.pageUrl, 'i') }
    if (pageParams.keyword) {
      const reg = new RegExp(pageParams.keyword, 'i')
      filter.$or = [{ eventKey: { $regex: reg } }, { pageUrl: { $regex: reg } }, { visitorId: { $regex: reg } }]
    }

    const total = await Track.countDocuments(filter)
    const result = await Track.find(filter)
      .sort({ createTime: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean()

    return {
      result: result.map((item: any) => ({
        ...item,
        createTime: item.createTime ? formatTime(item.createTime) : null
      })),
      total,
      page
    }
  }

  async getSitemapOverview() {
    const siteUrl = getSiteUrl()
    const sitemapUrl = `${siteUrl}/sitemap.xml`
    const robotsUrl = `${siteUrl}/robots.txt`
    const sourceUrl = `${siteUrl}/__sitemap__/urls`

    const [sitemap, robots, source] = await Promise.all([
      fetchUrlCheck(sitemapUrl, 'text'),
      fetchUrlCheck(robotsUrl, 'text'),
      fetchUrlCheck(sourceUrl, 'json')
    ])

    const sitemapText = typeof sitemap.data === 'string' ? sitemap.data : ''
    const robotsText = typeof robots.data === 'string' ? robots.data : ''
    const sourceList = Array.isArray(source.data) ? source.data : []
    const rows = parseXmlLocRows(sitemapText)

    return {
      siteUrl,
      sitemapUrl,
      robotsUrl,
      sourceUrl,
      sitemap: {
        ok: sitemap.ok,
        status: sitemap.status,
        error: sitemap.error,
        urlCount: rows.length,
        rows
      },
      robots: {
        ok: robots.ok,
        status: robots.status,
        error: robots.error,
        hasSitemap: robotsText.includes(sitemapUrl),
        content: robotsText
      },
      source: {
        ok: source.ok,
        status: source.status,
        error: source.error,
        urlCount: sourceList.length,
        urls: sourceList
      }
    }
  }

  async findAuthorList(pageParams: PageParams) {
    if (!pageParams.sortRule) {
      pageParams.sortRule = '_id'
    } else if (pageParams.sortRule !== '_id') {
      // Ensure stable sorting with a tie-breaker
      if (typeof pageParams.sortRule === 'string') {
        pageParams.sortRule = `${pageParams.sortRule} _id`
      }
    }
    let filter
    if (pageParams.keyword) {
      filter = {
        authorName: { $regex: pageParams.keyword, $options: 'i' }
      }
    }
    const res = await pageQuery(pageParams, this.statisticsModel, filter)

    return {
      result: await this.copyToVoList(res.result),
      page: res.page,
      total: res.total
    }
  }

  async saveAuthor(params: StatisticsParams) {
    const model = new AuthorParamsEntity()
    copyProperties(params, model)
    model.createTime = Date.now()
    // 计算最长连续参赛次数和累计次数
    const matches = params.participateMacthes?.map(item => parseInt(item.toString())).filter(item => !isNaN(item)) || []
    const consecutiveParticipateTimes = calcLongestConsecutiveTimes(matches)

    if (!params.consecutiveParticipateTimes) {
      model.consecutiveParticipateTimes = consecutiveParticipateTimes
    } else {
      model.consecutiveParticipateTimes = params.consecutiveParticipateTimes
    }

    if (!params.participateTimes) {
      model.participateTimes = matches.length
    } else {
      model.participateTimes = params.participateTimes || 0
    }

    const res = await new Statistics(model).save()
    return res || null
  }

  async updateAuthorInfo(params: StatisticsUpdateParams) {
    const model = new AuthorModelEntity()
    copyProperties(params, model)
    // 计算最长连续参赛次数和累计次数
    const matches = params.participateMacthes?.map(item => parseInt(item.toString())).filter(item => !isNaN(item)) || []
    const consecutiveParticipateTimes = calcLongestConsecutiveTimes(matches)

    if (!params.consecutiveParticipateTimes) {
      model.consecutiveParticipateTimes = consecutiveParticipateTimes
    } else {
      model.consecutiveParticipateTimes = params.consecutiveParticipateTimes
    }

    if (!params.participateTimes) {
      model.participateTimes = matches.length
    } else {
      model.participateTimes = params.participateTimes
    }
    await this.statisticsModel.updateOne({ _id: params._id }, model)
    return null
  }

  async deleteAuthor(id: any) {
    if (!id) {
      return null
    }
    await this.statisticsModel.deleteOne({ _id: id })
    return null
  }

  copyToVo(model: StatisticsModel) {
    const vo: any = new AuthorModelEntity()
    copyProperties(model, vo)
    vo.createTime = formatTime(model.createTime)
    return vo as StatisticsModel
  }

  async getSiteTraffic(days = 7) {
    const accessKey = config.QINIU_ACCESS_KEY || ''
    const secretKey = config.QINIU_SECRET_KEY || ''
    if (!accessKey || !secretKey) {
      return []
    }

    const cdnLink = config.QINIU_CDN_LINK || ''
    let cdnDomain = ''
    try {
      cdnDomain = new URL(cdnLink).hostname
    } catch (e) { /* empty */ }

    const frontendDomain = config.QINIU_FRONTEND_DOMAIN || cdnDomain
    const endDate = dayjs().format('YYYY-MM-DD')
    const startDate = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD')
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

    // 1. Fetch Traffic
    let fluxData: any = {}
    if (cdnDomain) {
      try {
        const fluxPayload = JSON.stringify({
          domains: cdnDomain,
          startDate,
          endDate,
          granularity: 'day'
        })
        const fluxUrl = 'https://fusion.qiniuapi.com/v2/tune/flux'
        const fluxToken = qiniu.util.generateAccessToken(mac, fluxUrl, undefined)

        const res = await axios.post(fluxUrl, fluxPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: fluxToken
          }
        })
        fluxData = res.data
      } catch (err: any) {
        console.error('Failed to fetch Qiniu Flux:', err?.response?.data || err?.message)
      }
    }

    // 2. Fetch UV
    let uvData: any = {}
    if (frontendDomain) {
      try {
        const uvPayload = JSON.stringify({
          domains: [frontendDomain],
          startDate,
          endDate,
          freq: '1day'
        })
        const uvUrl = 'https://fusion.qiniuapi.com/v2/tune/loganalyze/uniquevisitor'
        const uvToken = qiniu.util.generateAccessToken(mac, uvUrl, undefined)

        const res = await axios.post(uvUrl, uvPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: uvToken
          }
        })
        uvData = res.data
      } catch (err: any) {
        console.error('Failed to fetch Qiniu UV:', err?.response?.data || err?.message)
      }
    }

    // 3. Fetch Bandwidth
    let bandwidthData: any = {}
    if (cdnDomain) {
      try {
        const bwPayload = JSON.stringify({
          domains: cdnDomain,
          startDate,
          endDate,
          granularity: 'day'
        })
        const bwUrl = 'https://fusion.qiniuapi.com/v2/tune/bandwidth'
        const bwToken = qiniu.util.generateAccessToken(mac, bwUrl, undefined)

        const res = await axios.post(bwUrl, bwPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: bwToken
          }
        })
        bandwidthData = res.data
      } catch (err: any) {
        console.error('Failed to fetch Qiniu Bandwidth:', err?.response?.data || err?.message)
      }
    }

    const points = uvData?.data?.points || []
    const uvCount = uvData?.data?.uvCount || []

    const fluxTimes = (fluxData?.time || []).map((t: string) => t.substring(0, 10))
    const fluxDomainData = fluxData?.data?.[cdnDomain] || { china: [], oversea: [] }

    const bwTimes = (bandwidthData?.time || []).map((t: string) => t.substring(0, 10))
    const bwDomainData = bandwidthData?.data?.[cdnDomain] || { china: [], oversea: [] }

    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')

      const uvIdx = points.indexOf(date)
      const dayUv = uvIdx >= 0 ? uvCount[uvIdx] : 0

      const fluxIdx = fluxTimes.indexOf(date)
      let chinaFlux = 0 // bytes
      let overseaFlux = 0 // bytes
      if (fluxIdx >= 0) {
        chinaFlux = fluxDomainData.china?.[fluxIdx] || 0
        overseaFlux = fluxDomainData.oversea?.[fluxIdx] || 0
      }

      const chinaFluxGB = Number((chinaFlux / 1024 / 1024 / 1024).toFixed(4))
      const overseaFluxGB = Number((overseaFlux / 1024 / 1024 / 1024).toFixed(4))
      const fluxGB = Number((chinaFluxGB + overseaFluxGB).toFixed(4))

      const bwIdx = bwTimes.indexOf(date)
      let chinaBps = 0
      let overseaBps = 0
      if (bwIdx >= 0) {
        chinaBps = bwDomainData.china?.[bwIdx] || 0
        overseaBps = bwDomainData.oversea?.[bwIdx] || 0
      }
      const chinaBandwidthMbps = Number((chinaBps / 1000 / 1000).toFixed(4))
      const overseaBandwidthMbps = Number((overseaBps / 1000 / 1000).toFixed(4))

      result.push({
        date,
        dayUv,
        fluxGB,
        chinaFluxGB,
        overseaFluxGB,
        chinaBandwidthMbps,
        overseaBandwidthMbps
      })
    }

    return result
  }

  async getDashboardOverview(days = 7) {
    const accessKey = config.QINIU_ACCESS_KEY || ''
    const secretKey = config.QINIU_SECRET_KEY || ''
    const defaultRes = {
      totalTrafficGB: 0,
      chinaTrafficGB: 0,
      overseaTrafficGB: 0,
      estimatedTrafficCost: 0,
      estimatedChinaTrafficCost: 0,
      estimatedOverseaTrafficCost: 0,
      currentStorageGB: 0,
      estimatedStorageCost: 0,
      peakBandwidthMbps: 0,
      chinaPeakBandwidthMbps: 0,
      overseaPeakBandwidthMbps: 0,
      dailyStats: [] as any[],
      billing: {
        standardStorageGB: 0,
        avgStandardStorageGB: 0,
        standardStorageCost: 0,
        lowFreqStorageGB: 0,
        avgLowFreqStorageGB: 0,
        lowFreqStorageCost: 0,
        lowFreqRetrievalGB: 0,
        lowFreqRetrievalCost: 0,
        standardCdnBackToOriginGB: 0,
        standardCdnBackToOriginCost: 0,
        lowFreqCdnBackToOriginGB: 0,
        lowFreqCdnBackToOriginCost: 0,
        chinaTrafficGB: 0,
        chinaTrafficCost: 0,
        asiaTrafficGB: 0,
        asiaTrafficCost: 0,
        euNaTrafficGB: 0,
        euNaTrafficCost: 0,
        trafficPackageCost: 0,
        totalCost: 0
      }
    }
    if (!accessKey || !secretKey) {
      return defaultRes
    }

    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

    // 1. Fetch daily stats
    const dailyStats = await this.getSiteTraffic(days)

    let totalChinaFluxGB = 0
    let totalOverseaFluxGB = 0
    let peakBandwidthMbps = 0
    let chinaPeakBandwidthMbps = 0
    let overseaPeakBandwidthMbps = 0

    for (const stat of dailyStats) {
      totalChinaFluxGB += stat.chinaFluxGB || 0
      totalOverseaFluxGB += stat.overseaFluxGB || 0

      const dailyTotalBw = (stat.chinaBandwidthMbps || 0) + (stat.overseaBandwidthMbps || 0)
      if (dailyTotalBw > peakBandwidthMbps) {
        peakBandwidthMbps = dailyTotalBw
      }
      if ((stat.chinaBandwidthMbps || 0) > chinaPeakBandwidthMbps) {
        chinaPeakBandwidthMbps = stat.chinaBandwidthMbps || 0
      }
      if ((stat.overseaBandwidthMbps || 0) > overseaPeakBandwidthMbps) {
        overseaPeakBandwidthMbps = stat.overseaBandwidthMbps || 0
      }
    }

    const chinaTrafficGB = Number(totalChinaFluxGB.toFixed(4))
    const overseaTrafficGB = Number(totalOverseaFluxGB.toFixed(4))
    const totalTrafficGB = Number((chinaTrafficGB + overseaTrafficGB).toFixed(4))

    // 2. Fetch Storage Size & Details from Kodo APIs
    const bucket = config.QINIU_BUCKET || ''
    const spaceBegin = dayjs().subtract(days - 1, 'day').format('YYYYMMDD000000')
    const spaceEnd = dayjs().format('YYYYMMDD235959')

    let standardStorageGB = 0
    let avgStandardStorageGB = 0
    let lowFreqStorageGB = 0
    let avgLowFreqStorageGB = 0
    let standardCdnBackToOriginGB = 0
    let lowFreqCdnBackToOriginGB = 0
    let lowFreqRetrievalGB = 0

    if (bucket) {
      // 2.1 Standard Storage
      try {
        const data = await fetchQiniuStat(mac, '/v6/space', { bucket, begin: spaceBegin, end: spaceEnd, g: 'day' })
        const datas = readNumericSeries(data)
        if (datas.length > 0) {
          const sum = datas.reduce((acc: number, val: number) => acc + val, 0)
          avgStandardStorageGB = (sum / datas.length) / 1024 / 1024 / 1024
          standardStorageGB = datas[datas.length - 1] / 1024 / 1024 / 1024
        }
      } catch (err: any) {
        console.error('Failed to fetch standard storage space:', err?.response?.data || err?.message)
      }

      // 2.2 Low-Frequency Storage
      try {
        const data = await fetchQiniuStat(mac, '/v6/space_line', { bucket, begin: spaceBegin, end: spaceEnd, g: 'day' })
        const datas = readNumericSeries(data)
        if (datas.length > 0) {
          const sum = datas.reduce((acc: number, val: number) => acc + val, 0)
          avgLowFreqStorageGB = (sum / datas.length) / 1024 / 1024 / 1024
          lowFreqStorageGB = datas[datas.length - 1] / 1024 / 1024 / 1024
        }
      } catch (err: any) {
        console.error('Failed to fetch low-frequency storage space:', err?.response?.data || err?.message)
      }

      // 2.3 Standard Storage CDN Back-to-Origin
      try {
        const data = await fetchQiniuStat(mac, '/v6/blob_io', {
          bucket,
          begin: spaceBegin,
          end: spaceEnd,
          g: 'day',
          select: 'flow',
          '$metric': 'cdn_flow_out',
          '$ftype': 0
        })
        const totalBytes = sumQiniuFlowBytes(data)
        standardCdnBackToOriginGB = totalBytes / 1024 / 1024 / 1024
      } catch (err: any) {
        console.error('Failed to fetch standard CDN back-to-origin:', err?.response?.data || err?.message)
      }

      // 2.4 Low-Frequency Storage CDN Back-to-Origin
      try {
        const data = await fetchQiniuStat(mac, '/v6/blob_io', {
          bucket,
          begin: spaceBegin,
          end: spaceEnd,
          g: 'day',
          select: 'flow',
          '$metric': 'cdn_flow_out',
          '$ftype': 1
        })
        const totalBytes = sumQiniuFlowBytes(data)
        lowFreqCdnBackToOriginGB = totalBytes / 1024 / 1024 / 1024
      } catch (err: any) {
        console.error('Failed to fetch low-frequency CDN back-to-origin:', err?.response?.data || err?.message)
      }

      // 2.5 Low-Frequency Data Retrieval
      try {
        const data = await fetchQiniuStat(mac, '/v6/blob_io', {
          bucket,
          begin: spaceBegin,
          end: spaceEnd,
          g: 'day',
          select: 'flow',
          '$metric': 'flow_out',
          '$ftype': 1
        })
        const totalBytes = sumQiniuFlowBytes(data)
        lowFreqRetrievalGB = totalBytes / 1024 / 1024 / 1024
      } catch (err: any) {
        console.error('Failed to fetch low-frequency data retrieval:', err?.response?.data || err?.message)
      }
    }

    // 3. Billing Recalculations
    // 3.1 Storage Costs (存储费用)
    // - Standard Storage Space: ￥0.115/GB/month. Free quota: 10 GB.
    const billingDaysRatio = days / 30
    const standardStorageBillableGB = Math.max(0, avgStandardStorageGB - QINIU_BILLING.standardStorageFreeGB)
    const standardStorageCost = round2(standardStorageBillableGB * QINIU_BILLING.standardStorageMonthly * billingDaysRatio)
    // - Low-frequency Storage Space: ￥0.075/GB/month.
    const lowFreqStorageCost = round2(avgLowFreqStorageGB * QINIU_BILLING.lowFreqStorageMonthly * billingDaysRatio)
    // - Low-frequency Data Retrieval: ￥0.03/GB.
    const lowFreqRetrievalCost = round2(lowFreqRetrievalGB * QINIU_BILLING.lowFreqRetrievalPerGB)

    // 3.2 CDN Back-to-Origin Costs (回源流量费)
    // - Standard Storage CDN Back-to-Origin Traffic: ￥0.15/GB. Free quota: 10 GB.
    const standardBackToOriginBillableGB = Math.max(0, standardCdnBackToOriginGB - QINIU_BILLING.standardBackToOriginFreeGB)
    const standardCdnBackToOriginCost = round2(standardBackToOriginBillableGB * QINIU_BILLING.cdnBackToOriginPerGB)
    // - Low-frequency Storage CDN Back-to-Origin Traffic: ￥0.15/GB.
    const lowFreqCdnBackToOriginCost = round2(lowFreqCdnBackToOriginGB * QINIU_BILLING.cdnBackToOriginPerGB)

    // 3.3 CDN HTTPS Outbound Traffic Costs (下行流量费)
    // - CDN HTTPS Domestic (China): ￥0.28 / GB.
    const chinaTrafficCost = round2(chinaTrafficGB * QINIU_BILLING.chinaHttpsPerGB)
    // - Oversea traffic is split into: Asia (48% at ￥0.60/GB) and EU/NA (52% at ￥0.40/GB)
    const asiaTrafficGB = overseaTrafficGB * QINIU_BILLING.overseaAsiaRatio
    const euNaTrafficGB = Math.max(0, overseaTrafficGB - asiaTrafficGB)
    const asiaTrafficCost = round2(asiaTrafficGB * QINIU_BILLING.overseaAsiaHttpsPerGB)
    const euNaTrafficCost = round2(euNaTrafficGB * QINIU_BILLING.overseaEuNaHttpsPerGB)
    const overseaTrafficCost = round2(asiaTrafficCost + euNaTrafficCost)

    const totalCost = Number((
      standardStorageCost +
      lowFreqStorageCost +
      lowFreqRetrievalCost +
      standardCdnBackToOriginCost +
      lowFreqCdnBackToOriginCost +
      chinaTrafficCost +
      asiaTrafficCost +
      euNaTrafficCost
    ).toFixed(2))

    return {
      totalTrafficGB,
      chinaTrafficGB,
      overseaTrafficGB,
      estimatedTrafficCost: Number((chinaTrafficCost + overseaTrafficCost).toFixed(2)),
      estimatedChinaTrafficCost: chinaTrafficCost,
      estimatedOverseaTrafficCost: overseaTrafficCost,
      currentStorageGB: Number(standardStorageGB.toFixed(4)),
      estimatedStorageCost: Number((standardStorageCost + lowFreqStorageCost).toFixed(2)),
      peakBandwidthMbps: Number(peakBandwidthMbps.toFixed(4)),
      chinaPeakBandwidthMbps: Number(chinaPeakBandwidthMbps.toFixed(4)),
      overseaPeakBandwidthMbps: Number(overseaPeakBandwidthMbps.toFixed(4)),
      dailyStats,
      billing: {
        standardStorageGB: Number(standardStorageGB.toFixed(4)),
        avgStandardStorageGB: Number(avgStandardStorageGB.toFixed(4)),
        standardStorageCost,
        lowFreqStorageGB: Number(lowFreqStorageGB.toFixed(4)),
        avgLowFreqStorageGB: Number(avgLowFreqStorageGB.toFixed(4)),
        lowFreqStorageCost,
        lowFreqRetrievalGB: Number(lowFreqRetrievalGB.toFixed(4)),
        lowFreqRetrievalCost,
        standardCdnBackToOriginGB: Number(standardCdnBackToOriginGB.toFixed(4)),
        standardCdnBackToOriginCost,
        lowFreqCdnBackToOriginGB: Number(lowFreqCdnBackToOriginGB.toFixed(4)),
        lowFreqCdnBackToOriginCost,
        chinaTrafficGB,
        chinaTrafficCost,
        asiaTrafficGB: Number(asiaTrafficGB.toFixed(4)),
        asiaTrafficCost,
        euNaTrafficGB: Number(euNaTrafficGB.toFixed(4)),
        euNaTrafficCost,
        trafficPackageCost: 0,
        totalCost
      }
    }
  }
}
