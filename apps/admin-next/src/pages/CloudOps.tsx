import { Alert, Card, Col, Row, Select, Statistic, Table, Tag, Tabs, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { statisticsApi } from '../api/modules'
import type { BillingDetails, SiteTrafficItem } from '../types'

const defaultBilling: BillingDetails = {
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

function sum(list: SiteTrafficItem[], key: keyof Pick<SiteTrafficItem, 'dayUv' | 'fluxGB' | 'chinaFluxGB' | 'overseaFluxGB'>) {
  return list.reduce((total, item) => total + Number(item[key] || 0), 0)
}

function money(value?: number) {
  return `￥${Number(value || 0).toFixed(2)}`
}

function gb(value?: number) {
  return `${Number(value || 0).toFixed(4)} GB`
}

export default function CloudOps() {
  const [days, setDays] = useState(10)

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['cloud-ops-overview', days],
    queryFn: () => statisticsApi.dashboardOverview(days)
  })

  const { data: trafficStats = [], isLoading: trafficLoading } = useQuery({
    queryKey: ['cloud-ops-traffic', days],
    queryFn: () => statisticsApi.trafficStats(days)
  })

  const { data: trackOverview, isLoading: trackLoading } = useQuery({
    queryKey: ['cloud-ops-track', days],
    queryFn: () => statisticsApi.trackOverview(days)
  })

  const billing = overview?.billing || defaultBilling
  const totalUv = sum(trafficStats, 'dayUv')
  const periodText = `最近 ${days} 天`

  const billingRows = useMemo(() => [
    {
      key: 'standard-storage',
      category: '存储空间',
      item: '标准存储-华南-广东',
      usage: `${gb(billing.standardStorageGB)}，月度日均 ${gb(billing.avgStandardStorageGB)}`,
      freeQuota: '10.0000 GB',
      unitPrice: '￥0.115/GB/月',
      amount: billing.standardStorageCost
    },
    {
      key: 'lowfreq-storage',
      category: '存储空间',
      item: '低频存储-华南-广东',
      usage: `${gb(billing.lowFreqStorageGB)}，月度日均 ${gb(billing.avgLowFreqStorageGB)}`,
      freeQuota: '-',
      unitPrice: '￥0.075/GB/月',
      amount: billing.lowFreqStorageCost
    },
    {
      key: 'lowfreq-retrieval',
      category: '存储取回',
      item: '低频存储数据取回-华南-广东',
      usage: gb(billing.lowFreqRetrievalGB),
      freeQuota: '-',
      unitPrice: '￥0.03/GB',
      amount: billing.lowFreqRetrievalCost
    },
    {
      key: 'standard-origin',
      category: 'CDN 回源',
      item: '标准存储 CDN 回源流出流量-华南-广东',
      usage: gb(billing.standardCdnBackToOriginGB),
      freeQuota: '10.0000 GB',
      unitPrice: '￥0.15/GB',
      amount: billing.standardCdnBackToOriginCost
    },
    {
      key: 'lowfreq-origin',
      category: 'CDN 回源',
      item: '低频存储 CDN 回源流出流量-华南-广东',
      usage: gb(billing.lowFreqCdnBackToOriginGB),
      freeQuota: '-',
      unitPrice: '￥0.15/GB',
      amount: billing.lowFreqCdnBackToOriginCost
    },
    {
      key: 'china-https',
      category: 'CDN HTTPS 下行',
      item: 'CDN-HTTPS-中国大陆',
      usage: gb(billing.chinaTrafficGB),
      freeQuota: '-',
      unitPrice: '￥0.28/GB',
      amount: billing.chinaTrafficCost
    },
    {
      key: 'asia-https',
      category: 'CDN HTTPS 下行',
      item: 'CDN-HTTPS-亚洲（除中国/印度/东南亚）',
      usage: gb(billing.asiaTrafficGB),
      freeQuota: '-',
      unitPrice: '￥0.60/GB',
      amount: billing.asiaTrafficCost
    },
    {
      key: 'euna-https',
      category: 'CDN HTTPS 下行',
      item: 'CDN-HTTPS-欧洲/北美洲',
      usage: gb(billing.euNaTrafficGB),
      freeQuota: '-',
      unitPrice: '￥0.40/GB',
      amount: billing.euNaTrafficCost
    }
  ], [billing])

  const trafficChart = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['总流量 GB', '国内 GB', '海外 GB', '七牛 UV'] },
    grid: { left: 42, right: 42, top: 52, bottom: 36 },
    xAxis: { type: 'category', data: trafficStats.map(item => dayjs(item.date).format('MM-DD')) },
    yAxis: [{ type: 'value', name: 'GB' }, { type: 'value', name: 'UV' }],
    series: [
      { name: '总流量 GB', data: trafficStats.map(item => item.fluxGB), type: 'line', smooth: true },
      { name: '国内 GB', data: trafficStats.map(item => item.chinaFluxGB), type: 'line', smooth: true },
      { name: '海外 GB', data: trafficStats.map(item => item.overseaFluxGB), type: 'line', smooth: true },
      { name: '七牛 UV', data: trafficStats.map(item => item.dayUv), type: 'bar', yAxisIndex: 1 }
    ]
  }

  const costPie = {
    tooltip: { trigger: 'item', formatter: '{b}: ￥{c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      data: billingRows.map(item => ({ name: item.item.replace('-华南-广东', ''), value: item.amount }))
    }]
  }

  const usageBar = {
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 24, top: 32, bottom: 76 },
    xAxis: {
      type: 'category',
      axisLabel: { rotate: 28 },
      data: ['标准存储', '低频存储', '低频取回', '标准回源', '低频回源', '国内下行', '亚洲下行', '欧美下行']
    },
    yAxis: { type: 'value', name: 'GB' },
    series: [{
      type: 'bar',
      data: [
        billing.standardStorageGB,
        billing.lowFreqStorageGB,
        billing.lowFreqRetrievalGB,
        billing.standardCdnBackToOriginGB,
        billing.lowFreqCdnBackToOriginGB,
        billing.chinaTrafficGB,
        billing.asiaTrafficGB,
        billing.euNaTrafficGB
      ]
    }]
  }

  const pvChart = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['PV', 'UV', '点击事件'] },
    grid: { left: 42, right: 24, top: 48, bottom: 36 },
    xAxis: { type: 'category', data: trackOverview?.daily.map(item => dayjs(item.date).format('MM-DD')) || [] },
    yAxis: { type: 'value' },
    series: [
      { name: 'PV', data: trackOverview?.daily.map(item => item.pv) || [], type: 'line', smooth: true },
      { name: 'UV', data: trackOverview?.daily.map(item => item.uv) || [], type: 'line', smooth: true },
      { name: '点击事件', data: trackOverview?.daily.map(item => item.click) || [], type: 'bar' }
    ]
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>云运维与站点数据</h1>
          <p>七牛云 CDN、Kodo 存储、站内 PV/UV 和按量费用估算。</p>
        </div>
        <Select
          value={days}
          style={{ width: 150 }}
          onChange={setDays}
          options={[
            { label: '最近 7 天', value: 7 },
            { label: '最近 10 天', value: 10 },
            { label: '最近 15 天', value: 15 },
            { label: '最近 30 天', value: 30 },
            { label: '最近 60 天', value: 60 }
          ]}
        />
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="费用估算口径"
        description="存储按月度日均值折算；标准存储和标准回源各扣除 10GB 免费额度。海外 CDN 当前只能从七牛接口拿到海外总量，亚洲/欧美拆分按你提供的 2026-06-01 ~ 2026-06-10 账单比例估算。"
      />

      <Row gutter={[16, 16]} className="section-row" style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title={`${periodText} CDN 总流量`} value={overview?.totalTrafficGB || 0} precision={2} suffix="GB" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={trackLoading}><Statistic title={`${periodText} 站内 PV`} value={trackOverview?.totalPv || 0} /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={trackLoading}><Statistic title={`${periodText} 站内 UV`} value={trackOverview?.totalUv || 0} /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title="本期估算总费用" value={billing.totalCost} precision={2} prefix="￥" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title="标准存储当前量" value={overview?.currentStorageGB || 0} precision={2} suffix="GB" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title="边缘下行费用" value={billing.chinaTrafficCost + billing.asiaTrafficCost + billing.euNaTrafficCost} precision={2} prefix="￥" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title="回源费用" value={billing.standardCdnBackToOriginCost + billing.lowFreqCdnBackToOriginCost} precision={2} prefix="￥" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={trafficLoading}><Statistic title={`${periodText} 七牛 UV`} value={totalUv} /></Card>
        </Col>
      </Row>

      <Tabs
        items={[
          {
            key: 'traffic',
            label: '流量与 PV',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={14}>
                  <Card title="七牛 CDN 流量 / UV 趋势" loading={trafficLoading}>
                    <ReactECharts option={trafficChart} style={{ height: 360 }} />
                  </Card>
                </Col>
                <Col xs={24} xl={10}>
                  <Card title="站内 PV / UV 趋势" loading={trackLoading}>
                    <ReactECharts option={pvChart} style={{ height: 360 }} />
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card title="页面访问 Top 20" loading={trackLoading}>
                    <Table
                      rowKey="pageUrl"
                      size="small"
                      dataSource={trackOverview?.topPages || []}
                      columns={[
                        { title: '页面路径', dataIndex: 'pageUrl' },
                        { title: 'PV', dataIndex: 'pv', sorter: (a: any, b: any) => a.pv - b.pv },
                        { title: 'UV', dataIndex: 'uv', sorter: (a: any, b: any) => a.uv - b.uv }
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'billing',
            label: '七牛费用明细',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={12}>
                  <Card title="费用分项占比" loading={overviewLoading}>
                    <ReactECharts option={costPie} style={{ height: 360 }} />
                  </Card>
                </Col>
                <Col xs={24} xl={12}>
                  <Card title="资源用量分项" loading={overviewLoading}>
                    <ReactECharts option={usageBar} style={{ height: 360 }} />
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card
                    title="账单明细"
                    extra={<Typography.Text type="secondary">计费周期：{periodText}</Typography.Text>}
                    loading={overviewLoading}
                  >
                    <Table
                      rowKey="key"
                      dataSource={billingRows}
                      pagination={false}
                      columns={[
                        {
                          title: '费用描述',
                          dataIndex: 'item',
                          render: (value: string, row: any) => (
                            <div>
                              <strong>{value}</strong>
                              <div style={{ marginTop: 4 }}><Tag>{row.category}</Tag></div>
                            </div>
                          )
                        },
                        { title: '使用量', dataIndex: 'usage' },
                        { title: '免费额度', dataIndex: 'freeQuota' },
                        { title: '单价', dataIndex: 'unitPrice' },
                        { title: '金额', dataIndex: 'amount', render: (value: number) => <strong>{money(value)}</strong> }
                      ]}
                      summary={() => (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={4}><strong>合计</strong></Table.Summary.Cell>
                          <Table.Summary.Cell index={1}><strong>{money(billing.totalCost)}</strong></Table.Summary.Cell>
                        </Table.Summary.Row>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'ops',
            label: '运维提示',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={12}>
                  <Alert
                    type="warning"
                    showIcon
                    message="全站视频禁用与 CDN 白名单"
                    description="将 assets.mirai-mad.com 仅允许 localhost 访问会同时拦截图片、头像、封面、视频等所有 CDN 资源。当前仍建议通过后端专门的七牛 CDN 配置 API、二次确认、操作审计和回滚机制下发。"
                  />
                </Col>
                <Col xs={24} xl={12}>
                  <Card title="费用估算口径">
                    <p>当前估算只按实际用量计费，不计入 CDN 流量包、资源包购买成本或抵扣额度。</p>
                    <p>账单明细中的合计仅包含存储、取回、回源和 CDN 下行几类按量费用。</p>
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />
    </div>
  )
}
