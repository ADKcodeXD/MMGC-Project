import { CheckCircleOutlined, CloseCircleOutlined, CopyOutlined, LinkOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Input, List, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { statisticsApi } from '../api/modules'
import type { SitemapRow } from '../types'

function copy(text: string) {
  navigator.clipboard?.writeText(text)
}

function StatusTag({ ok, error }: { ok?: boolean; error?: string | null }) {
  return (
    <Tag color={ok ? 'green' : 'red'} icon={ok ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
      {ok ? '可访问' : error || '读取失败'}
    </Tag>
  )
}

export default function Sitemap() {
  const [keyword, setKeyword] = useState('')

  const overview = useQuery({
    queryKey: ['sitemap-overview'],
    queryFn: statisticsApi.sitemapOverview
  })

  const data = overview.data
  const rows = data?.sitemap.rows || []
  const filteredRows = useMemo(() => {
    if (!keyword) return rows
    return rows.filter(item => item.loc.toLowerCase().includes(keyword.toLowerCase()))
  }, [keyword, rows])

  const submitUrls = [
    { name: 'Google Search Console', url: 'https://search.google.com/search-console/sitemaps' },
    { name: '百度搜索资源平台', url: 'https://ziyuan.baidu.com/linksubmit/index' }
  ]

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>站点地图管理</h1>
          <p>通过后端诊断 sitemap、robots 和动态 URL 来源，避免浏览器跨域导致误报。</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => overview.refetch()}>
            刷新检查
          </Button>
          <Button type="primary" icon={<LinkOutlined />} href={data?.sitemapUrl} target="_blank" disabled={!data?.sitemapUrl}>
            打开 sitemap
          </Button>
        </Space>
      </div>

      <Alert
        type={overview.isError ? 'error' : 'info'}
        showIcon
        style={{ marginBottom: 16 }}
        message={overview.isError ? '站点地图诊断接口读取失败' : '当前 sitemap 生成方式'}
        description={overview.isError ? (overview.error as Error).message : '前台 Nuxt 通过 @nuxtjs/sitemap 生成 /sitemap.xml，动态来源已改为 /__sitemap__/urls，避开 /api 代理鉴权。'}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card loading={overview.isLoading}>
            <Statistic title="Sitemap URL 数" value={data?.sitemap.urlCount || 0} />
            <div style={{ marginTop: 12 }}><StatusTag ok={data?.sitemap.ok} error={data?.sitemap.error} /></div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={overview.isLoading}>
            <Statistic title="动态来源 URL 数" value={data?.source.urlCount || 0} />
            <div style={{ marginTop: 12 }}><StatusTag ok={data?.source.ok} error={data?.source.error} /></div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={overview.isLoading}>
            <Statistic title="Robots Sitemap 声明" value={data?.robots.hasSitemap ? 1 : 0} suffix="/ 1" />
            <div style={{ marginTop: 12 }}>
              <Tag color={data?.robots.hasSitemap ? 'green' : 'orange'}>
                {data?.robots.hasSitemap ? '已声明' : '未检测到'}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <Card title="重要地址" loading={overview.isLoading}>
            <List
              dataSource={[
                { label: 'Sitemap', url: data?.sitemapUrl || '-' },
                { label: 'Robots', url: data?.robotsUrl || '-' },
                { label: '动态 URL 来源', url: data?.sourceUrl || '-' }
              ]}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button key="copy" size="small" icon={<CopyOutlined />} onClick={() => copy(item.url)} disabled={item.url === '-'}>复制</Button>,
                    <Button key="open" size="small" href={item.url} target="_blank" disabled={item.url === '-'}>打开</Button>
                  ]}
                >
                  <List.Item.Meta title={item.label} description={<Typography.Text copyable={item.url !== '-'}>{item.url}</Typography.Text>} />
                </List.Item>
              )}
            />
          </Card>

          <Card title="搜索引擎接入步骤" style={{ marginTop: 16 }}>
            <List
              dataSource={[
                '确认生产域名可访问 /sitemap.xml 和 /robots.txt。',
                '在 Google Search Console 或百度搜索资源平台添加并验证站点域名。',
                '进入对应平台的 Sitemap 提交页面，提交 sitemap.xml 完整地址。',
                '发布新活动或大量视频后，刷新本页确认 URL 数量，再回平台重新提交 sitemap。'
              ]}
              renderItem={(item, index) => (
                <List.Item>
                  <Space align="start">
                    <Tag color="blue">{index + 1}</Tag>
                    <span>{item}</span>
                  </Space>
                </List.Item>
              )}
            />
            <Space wrap style={{ marginTop: 12 }}>
              {submitUrls.map(item => (
                <Button key={item.name} icon={<LinkOutlined />} href={item.url} target="_blank">
                  {item.name}
                </Button>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card
            title="Sitemap URL 预览"
            loading={overview.isLoading}
            extra={<Input.Search placeholder="搜索 URL" allowClear onSearch={setKeyword} onChange={event => setKeyword(event.target.value)} style={{ width: 260 }} />}
          >
            <Table<SitemapRow>
              rowKey="loc"
              size="small"
              dataSource={filteredRows}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 760 }}
              columns={[
                {
                  title: 'URL',
                  dataIndex: 'loc',
                  render: value => <Typography.Text copyable ellipsis style={{ maxWidth: 520 }}>{value}</Typography.Text>
                },
                { title: 'Lastmod', dataIndex: 'lastmod', width: 140 },
                { title: '频率', dataIndex: 'changefreq', width: 90 },
                { title: '权重', dataIndex: 'priority', width: 80 }
              ]}
            />
          </Card>

          <Card title="故障定位" style={{ marginTop: 16 }}>
            <List
              size="small"
              dataSource={[
                '/api/__sitemap__/urls 已不再使用，因为会被前台 /api 代理转发到后端并触发 401。',
                '当前动态来源为 /__sitemap__/urls，不走 /api 代理。',
                '如果 source 仍失败，优先检查前台服务是否已部署最新构建。',
                '如果 sitemap 失败，先打开 /__sitemap__/urls 看是否有 URL，再打开 /sitemap.xml。'
              ]}
              renderItem={item => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
