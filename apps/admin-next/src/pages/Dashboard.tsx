import {
  CloudOutlined,
  DatabaseOutlined,
  FileOutlined,
  PayCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Alert, Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { statisticsApi } from '../api/modules'

const usd = (value?: number) => `$${Number(value || 0).toFixed(4)}`
const operations = (value?: number) => Number(value || 0).toLocaleString()

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview', 30],
    queryFn: () => statisticsApi.dashboardOverview(30)
  })

  const dailyStats = data?.dailyStats || []
  const billing = data?.billing
  const dates = dailyStats.map(item => dayjs(item.date).format('MM-DD'))

  const operationsChart = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Class A', 'Class B', '其他成功请求'] },
    grid: { left: 56, right: 24, top: 48, bottom: 28 },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: '请求数' },
    series: [
      { name: 'Class A', data: dailyStats.map(item => item.classAOperations), type: 'bar', stack: 'operations' },
      { name: 'Class B', data: dailyStats.map(item => item.classBOperations), type: 'bar', stack: 'operations' },
      { name: '其他成功请求', data: dailyStats.map(item => item.otherOperations), type: 'bar', stack: 'operations' }
    ]
  }

  const storageChart = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['存储量 GB', '对象数'] },
    grid: { left: 56, right: 56, top: 48, bottom: 28 },
    xAxis: { type: 'category', data: dates },
    yAxis: [
      { type: 'value', name: 'GB' },
      { type: 'value', name: '对象数' }
    ],
    series: [
      {
        name: '存储量 GB',
        data: dailyStats.map(item => item.storageGB),
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.12 }
      },
      {
        name: '对象数',
        data: dailyStats.map(item => item.objectCount),
        type: 'line',
        smooth: true,
        yAxisIndex: 1
      }
    ]
  }

  const costChart = {
    tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['42%', '70%'],
      data: [
        { name: 'Standard 存储', value: billing?.storageCostUSD || 0 },
        { name: 'Class A 请求', value: billing?.classAOperationsCostUSD || 0 },
        { name: 'Class B 请求', value: billing?.classBOperationsCostUSD || 0 },
        { name: '公网流量', value: billing?.egressCostUSD || 0 }
      ]
    }]
  }

  const billingRows = [
    {
      key: 'storage',
      category: '存储',
      item: 'R2 Standard Storage',
      usage: `${Number(billing?.storageGbMonths || 0).toFixed(4)} GB-month`,
      billable: `${Number(billing?.billableStorageGbMonths || 0).toFixed(4)} GB-month`,
      freeQuota: '10 GB-month/月',
      unitPrice: '$0.015 / GB-month',
      amount: billing?.storageCostUSD || 0
    },
    {
      key: 'class-a',
      category: '操作',
      item: 'Class A 操作（写入、列举等）',
      usage: operations(billing?.classAOperations),
      billable: operations(billing?.billableClassAOperations),
      freeQuota: '1,000,000 次/月',
      unitPrice: '$4.50 / 百万次',
      amount: billing?.classAOperationsCostUSD || 0
    },
    {
      key: 'class-b',
      category: '操作',
      item: 'Class B 操作（读取、Head 等）',
      usage: operations(billing?.classBOperations),
      billable: operations(billing?.billableClassBOperations),
      freeQuota: '10,000,000 次/月',
      unitPrice: '$0.36 / 百万次',
      amount: billing?.classBOperationsCostUSD || 0
    },
    {
      key: 'egress',
      category: '网络',
      item: '公网出口流量',
      usage: 'Cloudflare R2 不收取出口流量费',
      billable: '-',
      freeQuota: '不限',
      unitPrice: '$0',
      amount: billing?.egressCostUSD || 0
    }
  ]

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Cloudflare R2 费用与用量</h1>
          <p>Bucket：{data?.bucket || 'miraimad'}，基于最近 30 天 R2 Analytics 估算 Standard Storage 费用。</p>
        </div>
      </div>

      {data?.configured === false && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Cloudflare R2 Analytics 尚未接通"
          description={data.configurationError}
        />
      )}

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="费用为估算值"
        description="使用 Standard Storage 当前公开单价并按统计周期折算免费额度；Cloudflare 最终月度账单、折扣和跨月免费额度重置可能产生差异。统计接口最多保留最近 31 天数据。"
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={4} style={{ flex: '1 1 200px' }}>
          <Card loading={isLoading}>
            <Statistic title="当前存储量" value={data?.currentStorageGB || 0} precision={4} suffix="GB" prefix={<DatabaseOutlined />} />
            <Typography.Text type="secondary">30 天日均 {Number(data?.avgStorageGB || 0).toFixed(4)} GB</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4} style={{ flex: '1 1 200px' }}>
          <Card loading={isLoading}>
            <Statistic title="当前对象数" value={data?.objectCount || 0} prefix={<FileOutlined />} />
            <Typography.Text type="secondary">R2 存储对象</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4} style={{ flex: '1 1 200px' }}>
          <Card loading={isLoading}>
            <Statistic title="Class A 操作" value={data?.classAOperations || 0} prefix={<CloudOutlined />} />
            <Typography.Text type="secondary">写入、列举等收费操作</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4} style={{ flex: '1 1 200px' }}>
          <Card loading={isLoading}>
            <Statistic title="Class B 操作" value={data?.classBOperations || 0} prefix={<ThunderboltOutlined />} />
            <Typography.Text type="secondary">读取、Head 等收费操作</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4} style={{ flex: '1 1 200px' }}>
          <Card loading={isLoading}>
            <Statistic
              title="30 天预估费用"
              value={data?.estimatedTotalCostUSD || 0}
              precision={4}
              prefix={<PayCircleOutlined />}
              suffix="USD"
              valueStyle={{ color: '#cf1322' }}
            />
            <Typography.Text type="secondary">公网出口流量费 $0</Typography.Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} xl={16}>
          <Card title="R2 操作请求走势" loading={isLoading}>
            <ReactECharts option={operationsChart} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="预估费用构成" loading={isLoading}>
            <ReactECharts option={costChart} style={{ height: 320 }} />
          </Card>
        </Col>
      </Row>

      <Card title="存储量与对象数走势" loading={isLoading} style={{ marginBottom: 16 }}>
        <ReactECharts option={storageChart} style={{ height: 320 }} />
      </Card>

      <Card title="Cloudflare R2 费用明细" loading={isLoading}>
        <Table
          rowKey="key"
          dataSource={billingRows}
          pagination={false}
          scroll={{ x: 960 }}
          columns={[
            {
              title: '费用项目',
              dataIndex: 'item',
              render: (value: string, row) => <><strong>{value}</strong><div><Tag>{row.category}</Tag></div></>
            },
            { title: '统计用量', dataIndex: 'usage' },
            { title: '计费用量', dataIndex: 'billable' },
            { title: '月度免费额度', dataIndex: 'freeQuota' },
            { title: 'Standard 单价', dataIndex: 'unitPrice' },
            { title: '预估金额', dataIndex: 'amount', render: (value: number) => <strong>{usd(value)}</strong> }
          ]}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5}><strong>最近 30 天预估合计（USD）</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={1}><strong>{usd(billing?.totalCostUSD)}</strong></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  )
}
