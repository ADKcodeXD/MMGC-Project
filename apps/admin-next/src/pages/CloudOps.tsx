import { Alert, Card, Col, Row, Select, Statistic, Table, Tag, Timeline } from 'antd'
import { useQuery } from '@tanstack/react-query'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { useState } from 'react'
import { statisticsApi } from '../api/modules'
import type { SiteTrafficItem } from '../types'

const siteMapRows = [
  { key: '/', path: '/', label: '首页', source: '前台路由', status: 'manual' },
  { key: '/activities', path: '/activities', label: '活动列表', source: '前台路由', status: 'manual' },
  { key: '/activity/:id', path: '/activity/:id', label: '活动详情', source: '前台路由', status: 'manual' },
  { key: '/movie/:id', path: '/movie/:id', label: '视频详情', source: '前台路由', status: 'manual' },
  { key: '/statistics', path: '/statistics', label: '历史统计', source: '前台路由', status: 'manual' }
]

function sum(list: SiteTrafficItem[], key: keyof Pick<SiteTrafficItem, 'dayUv' | 'fluxGB' | 'chinaFluxGB' | 'overseaFluxGB'>) {
  return list.reduce((total, item) => total + Number(item[key] || 0), 0)
}

export default function CloudOps() {
  const [days, setDays] = useState(7)

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['cloud-ops-overview', days],
    queryFn: () => statisticsApi.dashboardOverview(days)
  })

  const { data: trafficStats = [], isLoading: trafficLoading } = useQuery({
    queryKey: ['cloud-ops-traffic', days],
    queryFn: () => statisticsApi.trafficStats(days)
  })

  const chartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['总流量 GB', '国内 GB', '海外 GB', 'UV'] },
    grid: { left: 42, right: 24, top: 56, bottom: 36 },
    xAxis: { type: 'category', data: trafficStats.map(item => dayjs(item.date).format('MM-DD')) },
    yAxis: [
      { type: 'value', name: '流量 GB' },
      { type: 'value', name: 'UV' }
    ],
    series: [
      { name: '总流量 GB', data: trafficStats.map(item => item.fluxGB), type: 'line', smooth: true, areaStyle: {}, itemStyle: { color: '#1677ff' } },
      { name: '国内 GB', data: trafficStats.map(item => item.chinaFluxGB), type: 'line', smooth: true, itemStyle: { color: '#52c41a' } },
      { name: '海外 GB', data: trafficStats.map(item => item.overseaFluxGB), type: 'line', smooth: true, itemStyle: { color: '#faad14' } },
      { name: 'UV', data: trafficStats.map(item => item.dayUv), type: 'bar', yAxisIndex: 1, itemStyle: { color: '#722ed1' } }
    ]
  }

  const regionOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['46%', '70%'],
      data: [
        { name: '国内流量', value: overview?.chinaTrafficGB || 0 },
        { name: '海外流量', value: overview?.overseaTrafficGB || 0 }
      ]
    }]
  }

  const totalUv = sum(trafficStats, 'dayUv')

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>云运维与站点数据</h1>
          <p>七牛云 CDN、存储、访问人数、站点地图和流量保护入口。</p>
        </div>
        <Select
          value={days}
          style={{ width: 150 }}
          onChange={setDays}
          options={[
            { label: '近 7 天', value: 7 },
            { label: '近 15 天', value: 15 },
            { label: '近 30 天', value: 30 },
            { label: '近 60 天', value: 60 }
          ]}
        />
      </div>

      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="全站视频禁用与 CDN 白名单"
        description="将 assets.mirai-mad.com 仅允许 localhost 访问会同时拦截图片、头像、封面、视频等所有 CDN 资源，属于高风险运维动作。当前先通过全局配置保存禁用意图；真正下发七牛 CDN Referer/IP 白名单需要后端接入七牛 CDN 配置 API，并加二次确认与回滚。"
      />

      <Row gutter={[16, 16]} className="section-row" style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title={`${days} 天 CDN 总流量`} value={overview?.totalTrafficGB || 0} precision={2} suffix="GB" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title="国内 / 海外流量" value={`${(overview?.chinaTrafficGB || 0).toFixed(2)} / ${(overview?.overseaTrafficGB || 0).toFixed(2)}`} suffix="GB" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={trafficLoading}><Statistic title={`${days} 天 UV 合计`} value={totalUv} /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title="当前标准存储" value={overview?.currentStorageGB || 0} precision={2} suffix="GB" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title="预估流量费用" value={overview?.estimatedTrafficCost || 0} precision={2} prefix="￥" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title="国内流量费用" value={overview?.estimatedChinaTrafficCost || 0} precision={2} prefix="￥" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title="海外流量费用" value={overview?.estimatedOverseaTrafficCost || 0} precision={2} prefix="￥" /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={overviewLoading}><Statistic title="预估存储月费" value={overview?.estimatedStorageCost || 0} precision={2} prefix="￥" /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title="流量 / UV 趋势" loading={trafficLoading}>
            <ReactECharts option={chartOption} style={{ height: 360 }} />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="国内 / 海外流量结构" loading={overviewLoading}>
            <ReactECharts option={regionOption} style={{ height: 360 }} />
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card title="站点地图与访问数据接入状态">
            <Table
              size="small"
              rowKey="key"
              pagination={false}
              dataSource={siteMapRows}
              columns={[
                { title: '页面', dataIndex: 'label' },
                { title: '路径', dataIndex: 'path' },
                { title: '来源', dataIndex: 'source' },
                { title: '状态', render: () => <Tag color="blue">待接入 PV</Tag> }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="运维增强路线">
            <Timeline
              items={[
                { color: 'green', children: '已接入七牛 CDN 流量、国内/海外流量、UV、存储和费用估算' },
                { color: 'blue', children: '待后端新增 PV、页面路径维度、Referer / IP TopN、热点视频流量排行' },
                { color: 'blue', children: '待接入七牛 CDN 配置 API：Referer/IP 白名单、回滚、操作审计' },
                { color: 'gray', children: '待接入告警：单日流量突增、海外流量异常、存储增长异常' }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
