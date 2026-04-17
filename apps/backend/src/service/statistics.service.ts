import { pageQuery } from '~/common/utils'
import { Service } from '~/common/decorator/decorator'
import { copyProperties } from '~/common/utils'
import { Statistics } from '~/model'
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

  async getSiteTraffic(days: number = 7) {
    const accessKey = config.QINIU_ACCESS_KEY || ''
    const secretKey = config.QINIU_SECRET_KEY || ''
    if (!accessKey || !secretKey) {
      return { flux: [], uv: [] }
    }

    const cdnLink = config.QINIU_CDN_LINK || ''
    let cdnDomain = ''
    try {
      cdnDomain = new URL(cdnLink).hostname
    } catch (e) {}

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
        const fluxToken = qiniu.util.generateAccessToken(mac, fluxUrl, fluxPayload)

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
        const uvToken = qiniu.util.generateAccessToken(mac, uvUrl, uvPayload)

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

    const points = uvData?.data?.points || []
    const uvCount = uvData?.data?.uvCount || []

    const fluxTimes = (fluxData?.time || []).map((t: string) => t.substring(0, 10))
    const fluxDomainData = fluxData?.data?.[cdnDomain] || { china: [], oversea: [] }

    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')

      const uvIdx = points.indexOf(date)
      const dayUv = uvIdx >= 0 ? uvCount[uvIdx] : 0

      const fluxIdx = fluxTimes.indexOf(date)
      let dayFlux = 0 // bytes
      if (fluxIdx >= 0) {
        const chinaFlux = fluxDomainData.china?.[fluxIdx] || 0
        const overseaFlux = fluxDomainData.oversea?.[fluxIdx] || 0
        dayFlux = chinaFlux + overseaFlux
      }
      
      const fluxGB = Number((dayFlux / 1024 / 1024 / 1024).toFixed(4))

      result.push({ date, dayUv, fluxGB })
    }

    return result
  }
}
