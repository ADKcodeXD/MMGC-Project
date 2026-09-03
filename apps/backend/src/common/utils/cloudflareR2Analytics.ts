import axios from 'axios'
import dayjs from 'dayjs'
import config from '~/config/config.default'

const CLOUDFLARE_GRAPHQL_URL = 'https://api.cloudflare.com/client/v4/graphql'
const BYTES_PER_GB = 1_000_000_000

const R2_STANDARD_PRICING = {
  storagePerGbMonth: 0.015,
  classAPerMillion: 4.5,
  classBPerMillion: 0.36,
  freeStorageGbMonth: 10,
  freeClassAOperations: 1_000_000,
  freeClassBOperations: 10_000_000
}

const CLASS_A_ACTIONS = new Set([
  'listbuckets', 'putbucket', 'listobjects', 'putobject', 'copyobject',
  'completemultipartupload', 'createmultipartupload', 'lifecyclestoragetiertransition',
  'listmultipartuploads', 'uploadpart', 'uploadpartcopy', 'listparts',
  'putbucketencryption', 'putbucketcors', 'putbucketlifecycleconfiguration'
])

const CLASS_B_ACTIONS = new Set([
  'headbucket', 'headobject', 'getobject', 'usagesummary', 'getbucketencryption',
  'getbucketlocation', 'getbucketcors', 'getbucketlifecycleconfiguration'
])

type OperationGroup = {
  sum?: { requests?: number }
  dimensions?: { actionType?: string; actionStatus?: string; datetime?: string }
}

type StorageGroup = {
  max?: { objectCount?: number; uploadCount?: number; payloadSize?: number; metadataSize?: number }
  dimensions?: { datetime?: string }
}

type GraphQLResponse = {
  data?: { viewer?: { accounts?: Array<{ operations?: OperationGroup[]; storage?: StorageGroup[] }> } }
  errors?: Array<{ message?: string }>
}

export type R2DailyStat = {
  date: string
  classAOperations: number
  classBOperations: number
  otherOperations: number
  totalOperations: number
  storageGB: number
  objectCount: number
}

export type R2DashboardOverview = {
  provider: 'cloudflare-r2'
  configured: boolean
  configurationError: string | null
  bucket: string
  periodDays: number
  currentStorageGB: number
  avgStorageGB: number
  objectCount: number
  classAOperations: number
  classBOperations: number
  otherOperations: number
  totalOperations: number
  estimatedStorageCostUSD: number
  estimatedOperationsCostUSD: number
  estimatedTotalCostUSD: number
  dailyStats: R2DailyStat[]
  billing: {
    storageGbMonths: number
    billableStorageGbMonths: number
    classAOperations: number
    billableClassAOperations: number
    classBOperations: number
    billableClassBOperations: number
    storageCostUSD: number
    classAOperationsCostUSD: number
    classBOperationsCostUSD: number
    egressCostUSD: number
    totalCostUSD: number
  }
}

const normalize = (value?: string) => (value || '').replace(/[^a-z0-9]/gi, '').toLowerCase()
const round4 = (value: number) => Number(value.toFixed(4))
const round6 = (value: number) => Number(value.toFixed(6))

const resolveAccountId = () => {
  if (config.CLOUDFLARE_ACCOUNT_ID) return config.CLOUDFLARE_ACCOUNT_ID
  return (config.R2_ENDPOINT || '').match(/^https?:\/\/([a-f0-9]{32})\.r2\.cloudflarestorage\.com/i)?.[1] || ''
}

const emptyOverview = (days: number, error: string | null): R2DashboardOverview => ({
  provider: 'cloudflare-r2',
  configured: !error,
  configurationError: error,
  bucket: config.R2_BUCKET || '',
  periodDays: days,
  currentStorageGB: 0,
  avgStorageGB: 0,
  objectCount: 0,
  classAOperations: 0,
  classBOperations: 0,
  otherOperations: 0,
  totalOperations: 0,
  estimatedStorageCostUSD: 0,
  estimatedOperationsCostUSD: 0,
  estimatedTotalCostUSD: 0,
  dailyStats: [],
  billing: {
    storageGbMonths: 0,
    billableStorageGbMonths: 0,
    classAOperations: 0,
    billableClassAOperations: 0,
    classBOperations: 0,
    billableClassBOperations: 0,
    storageCostUSD: 0,
    classAOperationsCostUSD: 0,
    classBOperationsCostUSD: 0,
    egressCostUSD: 0,
    totalCostUSD: 0
  }
})

const query = `
  query R2Dashboard($accountTag: string!, $startDate: Time!, $endDate: Time!, $bucketName: string!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        operations: r2OperationsAdaptiveGroups(
          limit: 10000
          filter: { datetime_geq: $startDate, datetime_leq: $endDate, bucketName: $bucketName }
        ) {
          sum { requests }
          dimensions { actionType actionStatus datetime }
        }
        storage: r2StorageAdaptiveGroups(
          limit: 10000
          filter: { datetime_geq: $startDate, datetime_leq: $endDate, bucketName: $bucketName }
          orderBy: [datetime_ASC]
        ) {
          max { objectCount uploadCount payloadSize metadataSize }
          dimensions { datetime }
        }
      }
    }
  }
`

export async function getCloudflareR2Dashboard(requestedDays: number): Promise<R2DashboardOverview> {
  const days = Math.max(1, Math.min(31, Number.isFinite(requestedDays) ? Math.floor(requestedDays) : 30))
  const accountId = resolveAccountId()
  const apiToken = config.CLOUDFLARE_API_TOKEN || ''
  const bucket = config.R2_BUCKET || ''

  if (!accountId || !apiToken || !bucket) {
    return emptyOverview(days, '请配置 CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID 和 R2_BUCKET 后查看 R2 Analytics。')
  }

  const end = dayjs().endOf('day')
  const start = end.subtract(days - 1, 'day').startOf('day')

  try {
    const response = await axios.post<GraphQLResponse>(CLOUDFLARE_GRAPHQL_URL, {
      query,
      variables: {
        accountTag: accountId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        bucketName: bucket
      }
    }, {
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      timeout: 15_000
    })

    if (response.data.errors?.length) {
      throw new Error(response.data.errors.map(item => item.message).filter(Boolean).join('; '))
    }
    const account = response.data.data?.viewer?.accounts?.[0]
    if (!account) throw new Error('Cloudflare Analytics 未返回账户数据')

    const dailyMap = new Map<string, R2DailyStat>()
    for (let index = 0; index < days; index += 1) {
      const date = start.add(index, 'day').format('YYYY-MM-DD')
      dailyMap.set(date, {
        date,
        classAOperations: 0,
        classBOperations: 0,
        otherOperations: 0,
        totalOperations: 0,
        storageGB: 0,
        objectCount: 0
      })
    }

    for (const group of account.operations || []) {
      const date = dayjs(group.dimensions?.datetime).format('YYYY-MM-DD')
      const daily = dailyMap.get(date)
      if (!daily || normalize(group.dimensions?.actionStatus) !== 'success') continue
      const requests = Math.max(0, Number(group.sum?.requests || 0))
      const action = normalize(group.dimensions?.actionType)
      if (CLASS_A_ACTIONS.has(action)) daily.classAOperations += requests
      else if (CLASS_B_ACTIONS.has(action)) daily.classBOperations += requests
      else daily.otherOperations += requests
      daily.totalOperations += requests
    }

    const storageByDate = new Map<string, { timestamp: number; storageGB: number; objectCount: number }>()
    for (const group of account.storage || []) {
      const timestamp = dayjs(group.dimensions?.datetime).valueOf()
      if (!Number.isFinite(timestamp)) continue
      const date = dayjs(timestamp).format('YYYY-MM-DD')
      const existing = storageByDate.get(date)
      if (existing && existing.timestamp > timestamp) continue
      storageByDate.set(date, {
        timestamp,
        storageGB: (Number(group.max?.payloadSize || 0) + Number(group.max?.metadataSize || 0)) / BYTES_PER_GB,
        objectCount: Math.max(0, Number(group.max?.objectCount || group.max?.uploadCount || 0))
      })
    }

    let lastStorageGB = 0
    let lastObjectCount = 0
    for (const daily of dailyMap.values()) {
      const storage = storageByDate.get(daily.date)
      if (storage) {
        lastStorageGB = storage.storageGB
        lastObjectCount = storage.objectCount
      }
      daily.storageGB = round4(lastStorageGB)
      daily.objectCount = lastObjectCount
    }

    const dailyStats = Array.from(dailyMap.values())
    const current = dailyStats[dailyStats.length - 1]
    const storageDays = dailyStats.filter(item => item.storageGB > 0)
    const avgStorageGB = storageDays.length
      ? storageDays.reduce((total, item) => total + item.storageGB, 0) / storageDays.length
      : 0
    const classAOperations = dailyStats.reduce((total, item) => total + item.classAOperations, 0)
    const classBOperations = dailyStats.reduce((total, item) => total + item.classBOperations, 0)
    const otherOperations = dailyStats.reduce((total, item) => total + item.otherOperations, 0)
    const periodRatio = days / 30
    const storageGbMonths = avgStorageGB * periodRatio
    const billableStorageGbMonths = Math.max(0, storageGbMonths - R2_STANDARD_PRICING.freeStorageGbMonth * periodRatio)
    const billableClassAOperations = Math.max(0, classAOperations - R2_STANDARD_PRICING.freeClassAOperations * periodRatio)
    const billableClassBOperations = Math.max(0, classBOperations - R2_STANDARD_PRICING.freeClassBOperations * periodRatio)
    const storageCostUSD = billableStorageGbMonths * R2_STANDARD_PRICING.storagePerGbMonth
    const classAOperationsCostUSD = (billableClassAOperations / 1_000_000) * R2_STANDARD_PRICING.classAPerMillion
    const classBOperationsCostUSD = (billableClassBOperations / 1_000_000) * R2_STANDARD_PRICING.classBPerMillion
    const operationsCostUSD = classAOperationsCostUSD + classBOperationsCostUSD
    const totalCostUSD = storageCostUSD + operationsCostUSD

    return {
      provider: 'cloudflare-r2',
      configured: true,
      configurationError: null,
      bucket,
      periodDays: days,
      currentStorageGB: current?.storageGB || 0,
      avgStorageGB: round4(avgStorageGB),
      objectCount: current?.objectCount || 0,
      classAOperations,
      classBOperations,
      otherOperations,
      totalOperations: classAOperations + classBOperations + otherOperations,
      estimatedStorageCostUSD: round6(storageCostUSD),
      estimatedOperationsCostUSD: round6(operationsCostUSD),
      estimatedTotalCostUSD: round6(totalCostUSD),
      dailyStats,
      billing: {
        storageGbMonths: round4(storageGbMonths),
        billableStorageGbMonths: round4(billableStorageGbMonths),
        classAOperations,
        billableClassAOperations: Math.round(billableClassAOperations),
        classBOperations,
        billableClassBOperations: Math.round(billableClassBOperations),
        storageCostUSD: round6(storageCostUSD),
        classAOperationsCostUSD: round6(classAOperationsCostUSD),
        classBOperationsCostUSD: round6(classBOperationsCostUSD),
        egressCostUSD: 0,
        totalCostUSD: round6(totalCostUSD)
      }
    }
  } catch (error) {
    console.error('Failed to fetch Cloudflare R2 Analytics:', error instanceof Error ? error.message : error)
    return emptyOverview(days, 'Cloudflare R2 Analytics 暂时不可用，请检查 API Token 权限或稍后重试。')
  }
}
