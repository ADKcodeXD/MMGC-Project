import { CheckCircleOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Col, Drawer, Input, Pagination, Popconfirm, Row, Select, Space, Spin, Switch, Tag } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { movieApi } from '../../api/modules'
import type { MovieVo, PageParams } from '../../types'
import { text } from '../../utils/i18n'

interface SearchMoviesModalProps {
  open: boolean
  onClose: () => void
  activityId: number
  targetDay: number
  onBound: () => void
}

type SortKey = 'createTime' | 'movieId' | 'sortIndex' | 'viewNums' | 'pollNums'

export default function SearchMoviesModal({ open, onClose, activityId, targetDay, onBound }: SearchMoviesModalProps) {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [unboundOnly, setUnboundOnly] = useState(true)
  const [sortRule, setSortRule] = useState<SortKey>('createTime')
  const [orderRule, setOrderRule] = useState<'' | 'reverse'>('')
  const { message } = App.useApp()
  const queryClient = useQueryClient()

  const dayMoviesQuery = useQuery({
    queryKey: ['day-movies', activityId, targetDay],
    queryFn: () => movieApi.list({
      page: 1,
      pageSize: 500,
      activityId,
      day: targetDay,
      sortRule: 'sortIndex movieId',
      orderRule: 'reverse'
    }),
    enabled: open
  })

  const boundMovies = dayMoviesQuery.data?.result || []

  const movies = useQuery({
    queryKey: ['movies-for-select', keyword, page, unboundOnly, sortRule, orderRule],
    queryFn: () => {
      const params: PageParams = {
        page,
        pageSize: 20,
        keyword: keyword || undefined,
        unboundOnly,
        sortRule,
        orderRule
      }
      return movieApi.list(params)
    },
    enabled: open
  })

  const availableList = movies.data?.result || []

  const bindMutation = useMutation({
    mutationFn: (movieId: number) => {
      const nextSortIndex = Math.max(0, ...boundMovies.map(item => item.sortIndex || 0)) + 1
      return movieApi.update({ movieId, activityId, day: targetDay, sortIndex: nextSortIndex } as any)
    },
    onSuccess: () => {
      message.success('绑定成功')
      queryClient.invalidateQueries({ queryKey: ['day-movies', activityId, targetDay] })
      queryClient.invalidateQueries({ queryKey: ['movies-for-select'] })
      onBound()
    },
    onError: error => message.error(error.message)
  })

  const unbindMutation = useMutation({
    mutationFn: (movieId: number) => movieApi.update({ movieId, activityId: null, day: null } as any),
    onSuccess: () => {
      message.success('解绑成功')
      queryClient.invalidateQueries({ queryKey: ['day-movies', activityId, targetDay] })
      queryClient.invalidateQueries({ queryKey: ['movies-for-select'] })
      onBound()
    },
    onError: error => message.error(error.message)
  })

  const renderAvailableCard = (item: MovieVo) => {
    const isBoundToCurrent = item.activityId === activityId && item.day === targetDay
    const isBoundToOther = !isBoundToCurrent && (item.activityId || item.day)

    const bindButton = isBoundToCurrent ? (
      <Button disabled icon={<CheckCircleOutlined />}>已在当前 Day</Button>
    ) : isBoundToOther ? (
      <Popconfirm
        title="确认解绑并重新绑定？"
        description={`该视频当前已绑定到 ${item.activityVo ? text(item.activityVo.activityName) : `活动 ${item.activityId}`} / Day ${item.day}。继续会移除原有绑定。`}
        onConfirm={() => bindMutation.mutate(item.movieId)}
      >
        <Button danger loading={bindMutation.isPending && bindMutation.variables === item.movieId}>移动至此 Day</Button>
      </Popconfirm>
    ) : (
      <Button type="primary" loading={bindMutation.isPending && bindMutation.variables === item.movieId} onClick={() => bindMutation.mutate(item.movieId)}>
        添加至此 Day
      </Button>
    )

    return (
      <Card key={item.movieId} hoverable className="movie-picker-card" bodyStyle={{ padding: 12 }} style={{ marginBottom: 12, opacity: isBoundToCurrent ? 0.6 : 1 }}>
        <div className="movie-picker-card-row" style={{ display: 'flex', gap: 16 }}>
          <div className="movie-picker-cover" style={{ width: 160, height: 90, background: '#000', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
            <img src={item.movieCover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text(item.movieName)}</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
              UP: {item.authorName || item.author?.memberName || '未指定'}
              <span style={{ marginLeft: 12, color: '#aaa', fontSize: 12 }}>添加日期 {item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm') : '-'}</span>
            </div>
            <div style={{ marginTop: 'auto' }}>
              {isBoundToCurrent ? (
                <Tag color="success">当前 Day</Tag>
              ) : isBoundToOther ? (
                <Tag color="warning" icon={<InfoCircleOutlined />}>已绑定 {item.activityVo ? text(item.activityVo.activityName) : `活动 ${item.activityId}`} - Day {item.day}</Tag>
              ) : (
                <Tag color="processing">未绑定</Tag>
              )}
            </div>
          </div>
          <div className="movie-picker-action" style={{ width: 140, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{bindButton}</div>
        </div>
      </Card>
    )
  }

  const renderBoundCard = (item: MovieVo) => (
    <Card key={item.movieId} hoverable className="movie-picker-card" bodyStyle={{ padding: 12 }} style={{ marginBottom: 12, borderLeft: '4px solid #1677ff' }}>
      <div className="movie-picker-card-row" style={{ display: 'flex', gap: 12 }}>
        <div className="movie-picker-cover small" style={{ width: 120, height: 68, background: '#000', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <img src={item.movieCover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text(item.movieName)}</div>
          <div style={{ fontSize: 12, color: '#666' }}>UP: {item.authorName || item.author?.memberName || '未指定'}</div>
          <div style={{ marginTop: 'auto', textAlign: 'right' }}>
            <Button size="small" danger onClick={() => unbindMutation.mutate(item.movieId)} loading={unbindMutation.isPending && unbindMutation.variables === item.movieId}>移除</Button>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <Drawer
      title={`配置 Day ${targetDay} 的参赛视频`}
      open={open}
      onClose={onClose}
      width="100vw"
      className="movie-picker-drawer"
      bodyStyle={{ padding: 0, overflow: 'hidden', background: '#f5f7fb' }}
      destroyOnClose
    >
      <Row className="movie-picker-layout" style={{ height: '100%' }}>
        <Col xs={24} md={8} style={{ height: '100%', background: '#fff', borderRight: '1px solid #eef0f4', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #eef0f4', background: '#fafafa' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>已添加的视频 <Tag color="blue">{boundMovies.length}</Tag></h3>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>这些视频已绑定至当前 Day {targetDay}</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {dayMoviesQuery.isLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : boundMovies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>当前 Day 还没有绑定视频</div>
            ) : boundMovies.map(renderBoundCard)}
          </div>
        </Col>

        <Col xs={24} md={16} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #eef0f4' }}>
            <div className="movie-picker-toolbar" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>从片库选择候选视频</h3>
                <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>默认只看未绑定视频，必要时可切换查看全部。</div>
              </div>
              <Input.Search
                className="movie-picker-search"
                placeholder="搜索视频名称、作者、简介"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                style={{ width: 360 }}
                onSearch={val => {
                  setKeyword(val)
                  setPage(1)
                }}
              />
            </div>
            <Space wrap style={{ marginTop: 16 }}>
              <Space>
                <Switch checked={unboundOnly} onChange={checked => { setUnboundOnly(checked); setPage(1) }} />
                <span>只看未绑定视频</span>
              </Space>
              <Select
                value={sortRule}
                style={{ width: 150 }}
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
                style={{ width: 120 }}
                onChange={value => { setOrderRule(value); setPage(1) }}
                options={[
                  { label: '降序', value: '' },
                  { label: '升序', value: 'reverse' }
                ]}
              />
            </Space>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {movies.isLoading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : availableList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80, color: '#999', fontSize: 16 }}>没有找到匹配的视频</div>
            ) : (
              <div style={{ maxWidth: 940, margin: '0 auto' }}>{availableList.map(renderAvailableCard)}</div>
            )}
          </div>

          <div className="movie-picker-footer" style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #eef0f4', display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              current={page}
              pageSize={20}
              total={movies.data?.total || 0}
              showSizeChanger={false}
              showTotal={total => `共 ${total} 个视频`}
              onChange={p => setPage(p)}
            />
          </div>
        </Col>
      </Row>
    </Drawer>
  )
}
