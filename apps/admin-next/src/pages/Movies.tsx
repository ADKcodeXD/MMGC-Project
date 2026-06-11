import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag
} from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { activityApi, movieApi } from '../api/modules'
import type { MovieVo } from '../types'
import { text } from '../utils/i18n'

function isUnboundMovie(item: MovieVo) {
  return !item.activityVo && !item.activityId && !item.day
}

export default function Movies() {
  const [keyword, setKeyword] = useState('')
  const [activityId, setActivityId] = useState<number>()
  const [day, setDay] = useState<number>()
  const [sortRule, setSortRule] = useState<'createTime' | 'movieId' | 'sortIndex' | 'viewNums' | 'pollNums'>('createTime')
  const [orderRule, setOrderRule] = useState<'' | 'reverse'>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const activities = useQuery({
    queryKey: ['activity-options'],
    queryFn: () => activityApi.list({ page: 1, pageSize: 100 })
  })

  const days = useQuery({
    queryKey: ['movie-days', activityId],
    queryFn: () => activityApi.days(activityId!),
    enabled: Boolean(activityId)
  })

  const movies = useQuery({
    queryKey: ['movies', keyword, activityId, day, sortRule, orderRule, page, pageSize],
    queryFn: () => movieApi.list({ page, pageSize, keyword: keyword || undefined, activityId, day, sortRule, orderRule })
  })

  const displayMovies = useMemo(() => {
    return movies.data?.result || []
  }, [movies.data?.result])

  const removeMutation = useMutation({
    mutationFn: movieApi.remove,
    onSuccess: () => {
      message.success('视频已删除')
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
    onError: error => message.error(error.message)
  })

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>视频管理</h1>
          <p>搜索、添加、删除全站视频。排片拖拽排序请在活动天数详情中操作。</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/movies/create')}>
          添加视频
        </Button>
      </div>

      <Card className="filter-card">
        <Space wrap>
          <Input.Search
            placeholder="搜索标题、作者、简介"
            allowClear
            enterButton
            onSearch={v => {
              setKeyword(v)
              setPage(1)
            }}
            className="filter-search"
          />
          <Select
            allowClear
            showSearch
            placeholder="筛选活动"
            value={activityId}
            className="filter-select"
            optionFilterProp="label"
            onChange={value => {
              setActivityId(value)
              setDay(undefined)
              setPage(1)
            }}
            options={(activities.data?.result || []).map(item => ({
              label: `${item.activityId} - ${text(item.activityName)}`,
              value: item.activityId
            }))}
          />
          <Select
            allowClear
            placeholder="筛选 Day"
            value={day}
            className="filter-select"
            disabled={!activityId}
            onChange={v => {
              setDay(v)
              setPage(1)
            }}
            options={(days.data || []).map(item => ({ label: `Day ${item.day}`, value: item.day || undefined }))}
          />
          <Select
            value={sortRule}
            className="filter-select"
            onChange={value => { setSortRule(value); setPage(1) }}
            options={[
              { label: '按添加日期', value: 'createTime' },
              { label: '按视频 ID', value: 'movieId' },
              { label: '按展示排序', value: 'sortIndex' },
              { label: '按播放数', value: 'viewNums' },
              { label: '按票数', value: 'pollNums' }
            ]}
          />
          <Select
            value={orderRule}
            style={{ width: 110 }}
            onChange={value => { setOrderRule(value); setPage(1) }}
            options={[{ label: '降序', value: '' }, { label: '升序', value: 'reverse' }]}
          />
          <Button icon={<ReloadOutlined />} onClick={() => movies.refetch()}>
            刷新
          </Button>
        </Space>
      </Card>

      <div style={{ marginBottom: 24, minHeight: 400 }}>
        {movies.isLoading ? (
          <Card loading />
        ) : displayMovies.length === 0 ? (
          <Card>
            <Empty description="暂无视频数据" />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {displayMovies.map(item => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={item.movieId}>
                <Card
                  hoverable
                  bodyStyle={{ padding: 0 }}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                    <img
                      src={item.movieCover}
                      alt={text(item.movieName)}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      {isUnboundMovie(item) ? <Tag color="gold">未绑定</Tag> : item.day ? <Tag color="blue">Day {item.day}</Tag> : <Tag>无 Day</Tag>}
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={text(item.movieName)}
                    >
                      {text(item.movieName)}
                    </div>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                      UP: {item.authorName || '未指定'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                      <span style={{ fontSize: 12, color: '#999' }}>{item.viewNums || 0} 播放</span>
                      <Space>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => navigate(`/movies/edit/${item.movieId}`)} />
                        <Popconfirm title="确认删除这个视频？" onConfirm={() => removeMutation.mutate(item.movieId)}>
                          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={movies.data?.total || 0}
          showSizeChanger
          showTotal={total => `共 ${total} 个视频`}
          onChange={(nextPage, nextPageSize) => {
            setPage(nextPage)
            setPageSize(nextPageSize)
          }}
        />
      </div>
    </div>
  )
}
