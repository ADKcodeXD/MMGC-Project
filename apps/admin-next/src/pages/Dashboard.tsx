import { useState } from 'react'
import {
  CloudOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  PayCircleOutlined,
  TableOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LineChartOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Card, Col, Row, Statistic, Tabs, Table, Tag, Progress, Divider, Alert, Space } from 'antd'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { statisticsApi } from '../api/modules'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => statisticsApi.dashboardOverview(30)
  })

  const dailyStats = data?.dailyStats || []
  const dates = dailyStats.map(item => dayjs(item.date).format('MM-DD'))

  const trafficChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['总流量 GB', '国内流量 GB', '海外流量 GB', '独立访客 (UV)'] },
    grid: { left: 48, right: 48, top: 48, bottom: 24 },
    xAxis: { type: 'category', data: dates },
    yAxis: [
      { type: 'value', name: '流量 (GB)' },
      { type: 'value', name: '访客 (UV)' }
    ],
    series: [
      {
        name: '总流量 GB',
        data: dailyStats.map(item => item.fluxGB),
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.1 },
        itemStyle: { color: '#1677ff' }
      },
      {
        name: '国内流量 GB',
        data: dailyStats.map(item => item.chinaFluxGB),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '海外流量 GB',
        data: dailyStats.map(item => item.overseaFluxGB),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#faad14' }
      },
      {
        name: '独立访客 (UV)',
        data: dailyStats.map(item => item.dayUv),
        type: 'bar',
        yAxisIndex: 1,
        itemStyle: { color: '#722ed1', opacity: 0.8 }
      }
    ]
  }

  const bandwidthChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['总带宽 Mbps', '国内带宽 Mbps', '海外带宽 Mbps'] },
    grid: { left: 48, right: 24, top: 48, bottom: 24 },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: '带宽 (Mbps)' },
    series: [
      {
        name: '总带宽 Mbps',
        data: dailyStats.map(item =>
          Number(((item.chinaBandwidthMbps || 0) + (item.overseaBandwidthMbps || 0)).toFixed(4))
        ),
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.1 },
        itemStyle: { color: '#13c2c2' }
      },
      {
        name: '国内带宽 Mbps',
        data: dailyStats.map(item => item.chinaBandwidthMbps),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '海外带宽 Mbps',
        data: dailyStats.map(item => item.overseaBandwidthMbps),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#faad14' }
      }
    ]
  }

  const costDistributionOption = {
    tooltip: { trigger: 'item', formatter: '{b}: ￥{c} ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
        name: '服务费用占比',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: { show: false },
        data: [
          { value: data?.estimatedTrafficCost || 0, name: '流量费用', itemStyle: { color: '#1677ff' } },
          { value: data?.estimatedStorageCost || 0, name: '存储费用', itemStyle: { color: '#722ed1' } }
        ]
      }
    ]
  }

  const billingPeriod = `最近 ${dates.length} 天账单统计`

  const billing = data?.billing || {
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

  const billingDetails = [
    {
      key: '1',
      item: '标准存储-华南-广东',
      category: '存储空间',
      usage: `${billing.standardStorageGB.toFixed(4)} GB (日均: ${billing.avgStandardStorageGB.toFixed(4)} GB)`,
      freeQuota: '10.0000 GB',
      unitPrice: '￥0.115/GB/月',
      period: billingPeriod,
      amount: billing.standardStorageCost
    },
    {
      key: '2',
      item: '低频存储-华南-广东',
      category: '存储空间',
      usage: `${billing.lowFreqStorageGB.toFixed(4)} GB (日均: ${billing.avgLowFreqStorageGB.toFixed(4)} GB)`,
      freeQuota: '0.0000 GB',
      unitPrice: '￥0.075/GB/月',
      period: billingPeriod,
      amount: billing.lowFreqStorageCost
    },
    {
      key: '3',
      item: '低频存储数据取回-华南-广东',
      category: '存储空间',
      usage: `${billing.lowFreqRetrievalGB.toFixed(4)} GB`,
      freeQuota: '0.0000 GB',
      unitPrice: '￥0.030/GB',
      period: billingPeriod,
      amount: billing.lowFreqRetrievalCost
    },
    {
      key: '4',
      item: '标准存储CDN回源流出流量-华南-广东',
      category: 'CDN回源流量',
      usage: `${billing.standardCdnBackToOriginGB.toFixed(4)} GB`,
      freeQuota: '10.0000 GB',
      unitPrice: '￥0.150/GB',
      period: billingPeriod,
      amount: billing.standardCdnBackToOriginCost
    },
    {
      key: '5',
      item: '低频存储CDN回源流出流量-华南-广东',
      category: 'CDN回源流量',
      usage: `${billing.lowFreqCdnBackToOriginGB.toFixed(4)} GB`,
      freeQuota: '0.0000 GB',
      unitPrice: '￥0.150/GB',
      period: billingPeriod,
      amount: billing.lowFreqCdnBackToOriginCost
    },
    {
      key: '6',
      item: 'CDN-HTTPS-中国大陆',
      category: 'CDN边缘下行流量',
      usage: `${billing.chinaTrafficGB.toFixed(4)} GB`,
      freeQuota: '0.0000 GB',
      unitPrice: '￥0.280/GB',
      period: billingPeriod,
      amount: billing.chinaTrafficCost
    },
    {
      key: '7',
      item: 'CDN-HTTPS-亚洲（除中国/印度/东南亚）',
      category: 'CDN边缘下行流量',
      usage: `${billing.asiaTrafficGB.toFixed(4)} GB`,
      freeQuota: '0.0000 GB',
      unitPrice: '￥0.600/GB (阶梯 0-10TB)',
      period: billingPeriod,
      amount: billing.asiaTrafficCost
    },
    {
      key: '8',
      item: 'CDN-HTTPS-欧洲/北美洲',
      category: 'CDN边缘下行流量',
      usage: `${billing.euNaTrafficGB.toFixed(4)} GB`,
      freeQuota: '0.0000 GB',
      unitPrice: '￥0.400/GB (阶梯 0-10TB)',
      period: billingPeriod,
      amount: billing.euNaTrafficCost
    }
  ]

  const tableColumns = [
    {
      title: '费用分项名称',
      dataIndex: 'item',
      key: 'item',
      render: (text: string) => <strong style={{ color: '#262626' }}>{text}</strong>
    },
    {
      title: '费用大类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        let color = 'blue'
        if (category === '存储空间') color = 'purple'
        if (category === 'CDN回源流量') color = 'orange'
        return <Tag color={color}>{category}</Tag>
      }
    },
    {
      title: '计费周期',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: '实际用量',
      dataIndex: 'usage',
      key: 'usage',
    },
    {
      title: '免费额度',
      dataIndex: 'freeQuota',
      key: 'freeQuota',
      render: (quota: string) => quota !== '0.0000 GB' ? <Tag color="success">{quota}</Tag> : '-'
    },
    {
      title: '计费单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
    },
    {
      title: '账单金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>￥{amount.toFixed(2)}</span>
    }
  ]

  const costBreakdownPieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: ￥{c} ({d}%)' },
    legend: { bottom: '5%', left: 'center', itemGap: 8 },
    series: [
      {
        name: '账单费用明细',
        type: 'pie',
        radius: ['35%', '65%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}: ￥{c}' },
        data: [
          { value: billing.standardStorageCost, name: '标准存储', itemStyle: { color: '#1890ff' } },
          { value: Number((billing.lowFreqStorageCost + billing.lowFreqRetrievalCost).toFixed(2)), name: '低频存储与取回', itemStyle: { color: '#2fc25b' } },
          { value: Number((billing.standardCdnBackToOriginCost + billing.lowFreqCdnBackToOriginCost).toFixed(2)), name: 'CDN回源流量', itemStyle: { color: '#facc14' } },
          { value: billing.chinaTrafficCost, name: '大陆HTTPS下行', itemStyle: { color: '#722ed1' } },
          { value: billing.asiaTrafficCost, name: '亚洲HTTPS下行', itemStyle: { color: '#f04864' } },
          { value: billing.euNaTrafficCost, name: '欧美HTTPS下行', itemStyle: { color: '#8543e0' } }
        ]
      }
    ]
  }

  const usageVolumeBarOption = {
    tooltip: { trigger: 'axis', formatter: '{b}: {c} GB' },
    grid: { left: '10%', right: '10%', bottom: '20%', top: '15%' },
    xAxis: {
      type: 'category',
      data: ['标准存储', '低频存储', '低频取回', '标准回源', '低频回源', '大陆下行', '亚洲下行', '欧美下行'],
      axisLabel: { interval: 0, rotate: 25 }
    },
    yAxis: { type: 'value', name: '用量 (GB)' },
    series: [
      {
        name: '实际用量 (GB)',
        type: 'bar',
        barWidth: '40%',
        data: [
          billing.standardStorageGB,
          billing.lowFreqStorageGB,
          billing.lowFreqRetrievalGB,
          billing.standardCdnBackToOriginGB,
          billing.lowFreqCdnBackToOriginGB,
          billing.chinaTrafficGB,
          billing.asiaTrafficGB,
          billing.euNaTrafficGB
        ],
        itemStyle: {
          color: (params: any) => {
            const colors = ['#1890ff', '#2fc25b', '#2fefe8', '#facc14', '#fa8c16', '#722ed1', '#f04864', '#8543e0']
            return colors[params.dataIndex]
          }
        }
      }
    ]
  }

  const stdStoragePercent = billing.standardStorageGB > 0 
    ? Number(((Math.min(10, billing.standardStorageGB) / billing.standardStorageGB) * 100).toFixed(1)) 
    : 100

  const stdBackToOriginPercent = billing.standardCdnBackToOriginGB > 0 
    ? Number(((Math.min(10, billing.standardCdnBackToOriginGB) / billing.standardCdnBackToOriginGB) * 100).toFixed(1)) 
    : 100

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>运营与财务面板</h1>
          <p>整合流量监控、峰值带宽指标以及七牛云详尽的计费与账单明细。</p>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <LineChartOutlined />
                运营概览
              </span>
            ),
            children: (
              <>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={12} xl={4} style={{ flex: '1 1 200px' }}>
                    <Card loading={isLoading}>
                      <Statistic
                        title="30 天 CDN 流量"
                        value={data?.totalTrafficGB || 0}
                        suffix="GB"
                        prefix={<GlobalOutlined />}
                        precision={2}
                      />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        国内: {(data?.chinaTrafficGB || 0).toFixed(1)} / 海外: {(data?.overseaTrafficGB || 0).toFixed(1)} GB
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} xl={4} style={{ flex: '1 1 200px' }}>
                    <Card loading={isLoading}>
                      <Statistic
                        title="预估流量费用"
                        value={data?.estimatedTrafficCost || 0}
                        prefix="￥"
                        precision={2}
                        valueStyle={{ color: '#cf1322' }}
                      />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        国内: ￥{(data?.estimatedChinaTrafficCost || 0).toFixed(2)} / 海外: ￥{(data?.estimatedOverseaTrafficCost || 0).toFixed(2)}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} xl={4} style={{ flex: '1 1 200px' }}>
                    <Card loading={isLoading}>
                      <Statistic
                        title="七牛云存储"
                        value={data?.currentStorageGB || 0}
                        suffix="GB"
                        prefix={<DatabaseOutlined />}
                        precision={2}
                      />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        标准存储空间
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} xl={4} style={{ flex: '1 1 200px' }}>
                    <Card loading={isLoading}>
                      <Statistic
                        title="预估存储月费"
                        value={data?.estimatedStorageCost || 0}
                        prefix="￥"
                        precision={2}
                        valueStyle={{ color: '#3f8600' }}
                      />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        按 ￥0.115/GB/月 估算
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} xl={4} style={{ flex: '1 1 200px' }}>
                    <Card loading={isLoading}>
                      <Statistic
                        title="30 天峰值带宽"
                        value={data?.peakBandwidthMbps || 0}
                        suffix="Mbps"
                        prefix={<DashboardOutlined />}
                        precision={2}
                      />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        国内: {(data?.chinaPeakBandwidthMbps || 0).toFixed(2)} / 海外: {(data?.overseaPeakBandwidthMbps || 0).toFixed(2)} Mbps
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} xl={16}>
                    <Card title="流量与独立访客 (UV) 走势" loading={isLoading}>
                      <ReactECharts option={trafficChartOption} style={{ height: 320 }} />
                    </Card>
                  </Col>
                  <Col xs={24} xl={8}>
                    <Card title="云服务费用结构占比" loading={isLoading}>
                      <ReactECharts option={costDistributionOption} style={{ height: 320 }} />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} xl={16}>
                    <Card title="国内 / 海外 CDN 带宽走势" loading={isLoading}>
                      <ReactECharts option={bandwidthChartOption} style={{ height: 320 }} />
                    </Card>
                  </Col>
                  <Col xs={24} xl={8}>
                    <Card title="监控与运维增强">
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>七牛 CDN 缓存命中率</span>
                          <strong style={{ color: '#1677ff' }}>待接入</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>异常 Referer 防盗链</span>
                          <strong style={{ color: '#faad14' }}>推荐配置</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>大文件流量保护阈值</span>
                          <strong style={{ color: '#52c41a' }}>已启用</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>服务器时间同步误差</span>
                          <strong style={{ color: '#52c41a' }}>&lt; 1 秒 (正常)</strong>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </>
            )
          },
          {
            key: 'cost-details',
            label: (
              <span>
                <PayCircleOutlined />
                费用账单明细
              </span>
            ),
            children: (
              <>
                <Alert
                  message={
                    <span>
                      <strong>账单结算通知：</strong>本期计费周期 (<strong>{billingPeriod}</strong>) 已结算完成，累计应付账单金额 <strong>￥{billing.totalCost.toFixed(2)}</strong>。
                    </span>
                  }
                  description={
                    <div>
                      本页只按实际用量和阶梯单价估算费用，不计入已购资源包、余额抵扣、优惠券或账单折扣。
                    </div>
                  }
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  style={{ marginBottom: 16 }}
                />

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={12} xl={6}>
                    <Card>
                      <Statistic
                        title="本期总账单金额"
                        value={billing.totalCost}
                        prefix="￥"
                        precision={2}
                        valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                      />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        纯用量估算，不含资源包与抵扣
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} xl={6}>
                    <Card>
                      <Statistic
                        title="存储与取回空间费"
                        value={Number((billing.standardStorageCost + billing.lowFreqStorageCost + billing.lowFreqRetrievalCost).toFixed(2))}
                        prefix="￥"
                        precision={2}
                        valueStyle={{ color: '#722ed1' }}
                      />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        标准存储 ￥{billing.standardStorageCost.toFixed(2)} + 低频 ￥{billing.lowFreqStorageCost.toFixed(2)} + 取回 ￥{billing.lowFreqRetrievalCost.toFixed(2)}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} xl={6}>
                    <Card>
                      <Statistic
                        title="CDN 回源流量费"
                        value={Number((billing.standardCdnBackToOriginCost + billing.lowFreqCdnBackToOriginCost).toFixed(2))}
                        prefix="￥"
                        precision={2}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        标准回源 ￥{billing.standardCdnBackToOriginCost.toFixed(2)} + 低频回源 ￥{billing.lowFreqCdnBackToOriginCost.toFixed(2)}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} xl={6}>
                    <Card>
                      <Statistic
                        title="CDN 边缘下行流量费"
                        value={Number((billing.chinaTrafficCost + billing.asiaTrafficCost + billing.euNaTrafficCost).toFixed(2))}
                        prefix="￥"
                        precision={2}
                        valueStyle={{ color: '#1890ff' }}
                      />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        大陆下行 ￥{billing.chinaTrafficCost.toFixed(2)} + 亚洲下行 ￥{billing.asiaTrafficCost.toFixed(2)} + 欧美下行 ￥{billing.euNaTrafficCost.toFixed(2)}
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} xl={12}>
                    <Card title="账单费用结构分布 (分项占比)">
                      <ReactECharts option={costBreakdownPieOption} style={{ height: 320 }} />
                    </Card>
                  </Col>
                  <Col xs={24} xl={12}>
                    <Card title="各项资源实际消耗对比 (GB)">
                      <ReactECharts option={usageVolumeBarOption} style={{ height: 320 }} />
                    </Card>
                  </Col>
                </Row>

                <Card title="账单明细数据列表" style={{ marginBottom: 16 }}>
                  <Table
                    dataSource={billingDetails}
                    columns={tableColumns}
                    pagination={false}
                    summary={() => (
                      <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0} colSpan={6}>
                          本期应付合计 (CNY)
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <span style={{ color: '#cf1322', fontSize: 16 }}>￥{billing.totalCost.toFixed(2)}</span>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                  />
                </Card>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Card title="存储服务细分与额度消耗" style={{ height: '100%' }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>标准存储空间 (免费额度已扣除)</span>
                          <strong>{Math.max(0, billing.standardStorageGB - 10).toFixed(4)} / {billing.standardStorageGB.toFixed(4)} GB</strong>
                        </div>
                        <Progress percent={stdStoragePercent} strokeColor="#52c41a" format={() => '10GB 免费'} />
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                          标准存储包含每月 10 GB 免费额度，本月超出后参与计费 (日均值: {billing.avgStandardStorageGB.toFixed(4)} GB)。
                        </div>
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>低频存储空间</span>
                          <strong>{billing.lowFreqStorageGB.toFixed(4)} GB</strong>
                        </div>
                        <Progress percent={100} size="small" strokeColor="#722ed1" showInfo={false} />
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                          低频日均存储量: {billing.avgLowFreqStorageGB.toFixed(4)} GB，读取取回流转数据量: {billing.lowFreqRetrievalGB.toFixed(4)} GB。
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card title="回源与网络分发损耗" style={{ height: '100%' }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>标准回源流量 (免费额度已扣除)</span>
                          <strong>{Math.max(0, billing.standardCdnBackToOriginGB - 10).toFixed(4)} / {billing.standardCdnBackToOriginGB.toFixed(4)} GB</strong>
                        </div>
                        <Progress percent={stdBackToOriginPercent} strokeColor="#52c41a" format={() => '10GB 免费'} />
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                          回源流量包含每月 10 GB 免费额度，本期超出 {Math.max(0, billing.standardCdnBackToOriginGB - 10).toFixed(4)} GB 产生费用。
                        </div>
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>边缘下行 HTTPS - 中国大陆</span>
                          <strong>{billing.chinaTrafficGB.toFixed(4)} GB (￥0.28/GB)</strong>
                        </div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>边缘下行 HTTPS - 亚洲地区</span>
                          <strong>{billing.asiaTrafficGB.toFixed(4)} GB (￥0.60/GB)</strong>
                        </div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>边缘下行 HTTPS - 欧美地区</span>
                          <strong>{billing.euNaTrafficGB.toFixed(4)} GB (￥0.40/GB)</strong>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card title="按量估算口径" style={{ height: '100%' }}>
                      <Alert
                        type="info"
                        showIcon
                        message="资源包不参与估算"
                        description="当前统计只使用七牛云用量数据乘以按量单价，资源包购买费用、资源包抵扣、优惠券、余额抵扣和人工调账都不会计入本页合计。"
                      />
                      <Divider style={{ margin: '12px 0' }} />
                      <Space direction="vertical" size={8}>
                        <span>CDN HTTPS 中国大陆：￥0.28/GB</span>
                        <span>CDN HTTPS 亚洲：￥0.60/GB</span>
                        <span>CDN HTTPS 欧美：￥0.40/GB</span>
                        <span>CDN 回源流量：￥0.15/GB</span>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </>
            )
          }
        ]}
      />
    </div>
  )
}
