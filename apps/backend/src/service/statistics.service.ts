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
      ip: params.ip || null,
      userAgent: params.userAgent || null,
      createTime: Date.now()
    })
    await track.save()
    return null
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
        trafficPackageCost: 16.00,
        totalCost: 16.00
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

    const qiniuHeaders = (url: string) => {
      const token = qiniu.util.generateAccessToken(mac, url, undefined)
      const authHeader = token.replace('QBox ', 'Qiniu ')
      return { Authorization: authHeader }
    }

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
        const url = `https://api.qiniuapi.com/v6/space?bucket=${bucket}&begin=${spaceBegin}&end=${spaceEnd}&g=day`
        const res = await axios.get(url, { headers: qiniuHeaders(url) })
        const datas = res.data?.datas || []
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
        const url = `https://api.qiniuapi.com/v6/space_line?bucket=${bucket}&begin=${spaceBegin}&end=${spaceEnd}&g=day`
        const res = await axios.get(url, { headers: qiniuHeaders(url) })
        const datas = res.data?.datas || []
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
        const url = `https://api.qiniuapi.com/v6/blob_io?bucket=${bucket}&begin=${spaceBegin}&end=${spaceEnd}&g=day&select=flow&$metric=cdn_flow_out&$ftype=0`
        const res = await axios.get(url, { headers: qiniuHeaders(url) })
        const list = res.data || []
        const totalBytes = list.reduce((acc: number, item: any) => acc + (item?.values?.flow || 0), 0)
        standardCdnBackToOriginGB = totalBytes / 1024 / 1024 / 1024
      } catch (err: any) {
        console.error('Failed to fetch standard CDN back-to-origin:', err?.response?.data || err?.message)
      }

      // 2.4 Low-Frequency Storage CDN Back-to-Origin
      try {
        const url = `https://api.qiniuapi.com/v6/blob_io?bucket=${bucket}&begin=${spaceBegin}&end=${spaceEnd}&g=day&select=flow&$metric=cdn_flow_out&$ftype=1`
        const res = await axios.get(url, { headers: qiniuHeaders(url) })
        const list = res.data || []
        const totalBytes = list.reduce((acc: number, item: any) => acc + (item?.values?.flow || 0), 0)
        lowFreqCdnBackToOriginGB = totalBytes / 1024 / 1024 / 1024
      } catch (err: any) {
        console.error('Failed to fetch low-frequency CDN back-to-origin:', err?.response?.data || err?.message)
      }

      // 2.5 Low-Frequency Data Retrieval
      try {
        const url = `https://api.qiniuapi.com/v6/blob_io?bucket=${bucket}&begin=${spaceBegin}&end=${spaceEnd}&g=day&select=flow&$metric=flow_out&$ftype=1`
        const res = await axios.get(url, { headers: qiniuHeaders(url) })
        const list = res.data || []
        const totalBytes = list.reduce((acc: number, item: any) => acc + (item?.values?.flow || 0), 0)
        lowFreqRetrievalGB = totalBytes / 1024 / 1024 / 1024
      } catch (err: any) {
        console.error('Failed to fetch low-frequency data retrieval:', err?.response?.data || err?.message)
      }
    }

    // 3. Billing Recalculations
    // 3.1 Storage Costs (存储费用)
    // - Standard Storage Space: ￥0.115/GB/month. Free quota: 10 GB.
    const standardStorageCost = Number((Math.max(0, avgStandardStorageGB - 10) * 0.115 * (days / 30)).toFixed(2))
    // - Low-frequency Storage Space: ￥0.075/GB/month.
    const lowFreqStorageCost = Number((avgLowFreqStorageGB * 0.075 * (days / 30)).toFixed(2))
    // - Low-frequency Data Retrieval: ￥0.03/GB.
    const lowFreqRetrievalCost = Number((lowFreqRetrievalGB * 0.03).toFixed(2))

    // 3.2 CDN Back-to-Origin Costs (回源流量费)
    // - Standard Storage CDN Back-to-Origin Traffic: ￥0.15/GB. Free quota: 10 GB.
    const standardCdnBackToOriginCost = Number((Math.max(0, standardCdnBackToOriginGB - 10) * 0.15).toFixed(2))
    // - Low-frequency Storage CDN Back-to-Origin Traffic: ￥0.15/GB.
    const lowFreqCdnBackToOriginCost = Number((lowFreqCdnBackToOriginGB * 0.15).toFixed(2))

    // 3.3 CDN HTTPS Outbound Traffic Costs (下行流量费)
    // - CDN HTTPS Domestic (China): ￥0.28 / GB.
    const chinaTrafficCost = Number((chinaTrafficGB * 0.28).toFixed(2))
    // - Oversea traffic is split into: Asia (48% at ￥0.60/GB) and EU/NA (52% at ￥0.40/GB)
    const asiaTrafficGB = overseaTrafficGB * 0.48
    const euNaTrafficGB = overseaTrafficGB * 0.52
    const asiaTrafficCost = Number((asiaTrafficGB * 0.60).toFixed(2))
    const euNaTrafficCost = Number((euNaTrafficGB * 0.40).toFixed(2))
    const overseaTrafficCost = Number((asiaTrafficCost + euNaTrafficCost).toFixed(2))

    // 3.4 CDN universal traffic package (fixed purchased cost)
    const trafficPackageCost = 16.00

    const totalCost = Number((
      standardStorageCost +
      lowFreqStorageCost +
      lowFreqRetrievalCost +
      standardCdnBackToOriginCost +
      lowFreqCdnBackToOriginCost +
      chinaTrafficCost +
      asiaTrafficCost +
      euNaTrafficCost +
      trafficPackageCost
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
        trafficPackageCost,
        totalCost
      }
    }
  }
}
