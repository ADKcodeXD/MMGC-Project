import { CloudOutlined, DatabaseOutlined, GlobalOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Card, Col, Row, Statistic } from 'antd'
import { statisticsApi } from '../api/modules'

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => statisticsApi.dashboardOverview(30)
  })

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>运营概览</h1>
          <p>流量、存储、云服务成本和异常趋势的统一入口。</p>
        </div>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={isLoading}>
            <Statistic title="30 天 CDN 流量" value={data?.totalTrafficGB || 0} suffix="GB" prefix={<GlobalOutlined />} precision={2} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={isLoading}>
            <Statistic title="预估流量费用" value={data?.estimatedTrafficCost || 0} prefix={<ThunderboltOutlined />} precision={2} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={isLoading}>
            <Statistic title="七牛云存储" value={data?.currentStorageGB || 0} suffix="GB" prefix={<DatabaseOutlined />} precision={2} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card loading={isLoading}>
            <Statistic title="预估存储月费" value={data?.estimatedStorageCost || 0} prefix={<CloudOutlined />} precision={2} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="section-row">
        <Col xs={24} lg={12}>
          <Card title="流量结构">
            <div className="metric-line"><span>国内流量</span><strong>{(data?.chinaTrafficGB || 0).toFixed(2)} GB</strong></div>
            <div className="metric-line"><span>海外流量</span><strong>{(data?.overseaTrafficGB || 0).toFixed(2)} GB</strong></div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="下一步监控">
            <div className="todo-list">
              <span>七牛 CDN 命中率</span>
              <span>异常 Referer / IP TopN</span>
              <span>大文件与热门视频流量排行</span>
              <span>转码任务失败告警</span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
