import {
  CloudOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  DashboardOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Card, Col, Row, Statistic } from 'antd'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { statisticsApi } from '../api/modules'

export default function Dashboard() {
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

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>运营概览</h1>
          <p>流量、存储、云服务成本和峰值带宽数据的统一入口。</p>
        </div>
      </div>

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
              按 ￥0.10/GB/月 估算
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
    </div>
  )
}
