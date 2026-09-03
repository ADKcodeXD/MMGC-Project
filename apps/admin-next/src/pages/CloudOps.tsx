import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Card, Col, Row, Select, Statistic, Table, Tabs, Tag, Typography } from 'antd'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { statisticsApi } from '../api/modules'

const usd = (value?: number) => `$${Number(value || 0).toFixed(4)}`
const count = (value?: number) => Number(value || 0).toLocaleString()

export default function CloudOps() {
  const [days, setDays] = useState(30)

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['cloud-ops-overview', days],
    queryFn: () => statisticsApi.dashboardOverview(days)
  })
  const { data: trackOverview, isLoading: trackLoading } = useQuery({
    queryKey: ['cloud-ops-track', days],
    queryFn: () => statisticsApi.trackOverview(days)
  })

  const billing = overview?.billing
  const periodText = `最近 ${days} 天`
  const billingRows = useMemo(() => [
    {
      key: 'storage',
      category: '存储',
      item: 'R2 Standard Storage',
      usage: `${Number(billing?.storageGbMonths || 0).toFixed(4)} GB-month`,
      billable: `${Number(billing?.billableStorageGbMonths || 0).toFixed(4)} GB-month`,
      price: '$0.015 / GB-month',
      amount: billing?.storageCostUSD || 0
    },
    {
      key: 'class-a',
      category: '操作',
      item: 'Class A 操作',
      usage: count(billing?.classAOperations),
      billable: count(billing?.billableClassAOperations),
      price: '$4.50 / 百万次',
      amount: billing?.classAOperationsCostUSD || 0
    },
    {
      key: 'class-b',
      category: '操作',
      item: 'Class B 操作',
      usage: count(billing?.classBOperations),
      billable: count(billing?.billableClassBOperations),
      price: '$0.36 / 百万次',
      amount: billing?.classBOperationsCostUSD || 0
    },
    {
      key: 'egress',
      category: '网络',
      item: '公网出口流量',
      usage: '不收取流量费',
      billable: '-',
      price: '$0',
      amount: billing?.egressCostUSD || 0
    }
  ], [billing])

  const r2Chart = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Class A', 'Class B', '其他成功请求'] },
    grid: { left: 56, right: 24, top: 48, bottom: 32 },
    xAxis: { type: 'category', data: overview?.dailyStats.map(item => dayjs(item.date).format('MM-DD')) || [] },
    yAxis: { type: 'value', name: '请求数' },
    series: [
      { name: 'Class A', data: overview?.dailyStats.map(item => item.classAOperations) || [], type: 'bar', stack: 'r2' },
      { name: 'Class B', data: overview?.dailyStats.map(item => item.classBOperations) || [], type: 'bar', stack: 'r2' },
      { name: '其他成功请求', data: overview?.dailyStats.map(item => item.otherOperations) || [], type: 'bar', stack: 'r2' }
    ]
  }

  const storageChart = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['存储量 GB', '对象数'] },
    grid: { left: 56, right: 56, top: 48, bottom: 32 },
    xAxis: { type: 'category', data: overview?.dailyStats.map(item => dayjs(item.date).format('MM-DD')) || [] },
    yAxis: [{ type: 'value', name: 'GB' }, { type: 'value', name: '对象数' }],
    series: [
      { name: '存储量 GB', data: overview?.dailyStats.map(item => item.storageGB) || [], type: 'line', smooth: true, areaStyle: { opacity: 0.1 } },
      { name: '对象数', data: overview?.dailyStats.map(item => item.objectCount) || [], type: 'line', smooth: true, yAxisIndex: 1 }
    ]
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
          <p>Cloudflare R2 存储与请求费用，以及站内 PV/UV 访问数据。</p>
        </div>
        <Select
          value={days}
          style={{ width: 150 }}
          onChange={setDays}
          options={[
            { label: '最近 7 天', value: 7 },
            { label: '最近 15 天', value: 15 },
            { label: '最近 30 天', value: 30 }
          ]}
        />
      </div>

      {overview?.configured === false && (
        <Alert type="warning" showIcon style={{ marginBottom: 16 }} message="R2 Analytics 未配置" description={overview.configurationError} />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={6}><Card loading={overviewLoading}><Statistic title="R2 当前存储" value={overview?.currentStorageGB || 0} precision={4} suffix="GB" /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card loading={overviewLoading}><Statistic title="R2 对象数" value={overview?.objectCount || 0} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card loading={overviewLoading}><Statistic title={`${periodText} R2 请求`} value={overview?.totalOperations || 0} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card loading={overviewLoading}><Statistic title="预估 R2 费用" value={overview?.estimatedTotalCostUSD || 0} precision={4} prefix="$" suffix="USD" /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card loading={trackLoading}><Statistic title={`${periodText} 站内 PV`} value={trackOverview?.totalPv || 0} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card loading={trackLoading}><Statistic title={`${periodText} 站内 UV`} value={trackOverview?.totalUv || 0} /></Card></Col>
      </Row>

      <Tabs
        items={[
          {
            key: 'r2',
            label: 'R2 用量',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={14}><Card title="R2 操作请求走势" loading={overviewLoading}><ReactECharts option={r2Chart} style={{ height: 360 }} /></Card></Col>
                <Col xs={24} xl={10}><Card title="存储量与对象数" loading={overviewLoading}><ReactECharts option={storageChart} style={{ height: 360 }} /></Card></Col>
              </Row>
            )
          },
          {
            key: 'billing',
            label: 'R2 费用明细',
            children: (
              <Card
                title="Cloudflare R2 Standard 预估账单"
                extra={<Typography.Text type="secondary">计费周期：{periodText}</Typography.Text>}
                loading={overviewLoading}
              >
                <Table
                  rowKey="key"
                  dataSource={billingRows}
                  pagination={false}
                  scroll={{ x: 800 }}
                  columns={[
                    { title: '费用项目', dataIndex: 'item', render: (value: string, row) => <><strong>{value}</strong><div><Tag>{row.category}</Tag></div></> },
                    { title: '统计用量', dataIndex: 'usage' },
                    { title: '计费用量', dataIndex: 'billable' },
                    { title: '单价', dataIndex: 'price' },
                    { title: '预估金额', dataIndex: 'amount', render: (value: number) => <strong>{usd(value)}</strong> }
                  ]}
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}><strong>预估合计（USD）</strong></Table.Summary.Cell>
                      <Table.Summary.Cell index={1}><strong>{usd(billing?.totalCostUSD)}</strong></Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              </Card>
            )
          },
          {
            key: 'site',
            label: '站点访问',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24}><Card title="站内 PV / UV 趋势" loading={trackLoading}><ReactECharts option={pvChart} style={{ height: 360 }} /></Card></Col>
                <Col xs={24}>
                  <Card title="页面访问 Top 20" loading={trackLoading}>
                    <Table
                      rowKey="pageUrl"
                      size="small"
                      dataSource={trackOverview?.topPages || []}
                      columns={[
                        { title: '页面路径', dataIndex: 'pageUrl' },
                        { title: 'PV', dataIndex: 'pv', sorter: (a, b) => a.pv - b.pv },
                        { title: 'UV', dataIndex: 'uv', sorter: (a, b) => a.uv - b.uv }
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'notes',
            label: '统计口径',
            children: (
              <Alert
                type="info"
                showIcon
                message="R2 Standard Storage 估算规则"
                description="存储按 $0.015/GB-month、Class A 按 $4.50/百万次、Class B 按 $0.36/百万次估算；月度免费额度按所选统计天数折算，公网出口流量费为 $0。最终费用以 Cloudflare 月度账单为准。"
              />
            )
          }
        ]}
      />
    </div>
  )
}
