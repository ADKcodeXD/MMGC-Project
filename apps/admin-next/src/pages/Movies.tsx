import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  InputNumber,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag
} from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { activityApi, movieApi } from '../api/modules'
import type { MovieVo } from '../types'
import { text } from '../utils/i18n'

const sortOptions = ['createTime', 'updateTime', 'movieId', 'sortIndex', 'viewNums', 'pollNums'] as const
type SortRule = (typeof sortOptions)[number]

function isUnboundMovie(item: MovieVo) {
  return !item.activityVo && !item.activityId && !item.day
}

function parseNumber(value: string | null) {
  if (!value) return undefined
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

function parseSortRule(value: string | null): SortRule {
  return sortOptions.includes(value as SortRule) ? (value as SortRule) : 'createTime'
}

function memberName(uploader: MovieVo['uploader']) {
  if (!uploader) return '未记录'
  if (typeof uploader === 'number') return String(uploader)
  return uploader.memberName || uploader.username || String(uploader.memberId)
}

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()

  const keyword = searchParams.get('keyword') || ''
  const authorName = searchParams.get('authorName') || ''
  const activityId = parseNumber(searchParams.get('activityId'))
  const day = parseNumber(searchParams.get('day'))
  const uploader = parseNumber(searchParams.get('uploader'))
  const isPublic = parseNumber(searchParams.get('isPublic'))
  const unboundOnly = searchParams.get('unboundOnly') === 'true'
  const createTimeStart = searchParams.get('createTimeStart') || undefined
  const createTimeEnd = searchParams.get('createTimeEnd') || undefined
  const updateTimeStart = searchParams.get('updateTimeStart') || undefined
  const updateTimeEnd = searchParams.get('updateTimeEnd') || undefined
  const sortRule = parseSortRule(searchParams.get('sortRule'))
  const orderRule = (searchParams.get('orderRule') === 'reverse' ? 'reverse' : '') as '' | 'reverse'
  const page = parseNumber(searchParams.get('page')) || 1
  const pageSize = parseNumber(searchParams.get('pageSize')) || 20

  function patchQuery(patch: Record<string, string | number | boolean | null | undefined>, resetPage = true) {
    const next = new URLSearchParams(searchParams)
    if (resetPage) next.set('page', '1')
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') next.delete(key)
      else next.set(key, String(value))
    })
    setSearchParams(next, { replace: true })
  }

  function openEditor(movieId: number) {
    navigate(`/movies/edit/${movieId}`, {
      state: { returnTo: `${location.pathname}${location.search}` }
    })
  }

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
    queryKey: [
      'movies',
      keyword,
      authorName,
      activityId,
      day,
      uploader,
      isPublic,
      unboundOnly,
      createTimeStart,
      createTimeEnd,
      updateTimeStart,
      updateTimeEnd,
      sortRule,
      orderRule,
      page,
      pageSize
    ],
    queryFn: () =>
      movieApi.list({
        page,
        pageSize,
        keyword: keyword || undefined,
        authorName: authorName || undefined,
        activityId,
        day,
        uploader,
        isPublic,
        unboundOnly: unboundOnly || undefined,
        createTimeStart,
        createTimeEnd,
        updateTimeStart,
        updateTimeEnd,
        sortRule,
        orderRule
      })
  })

  const displayMovies = useMemo(() => movies.data?.result || [], [movies.data?.result])

  const removeMutation = useMutation({
    mutationFn: movieApi.remove,
    onSuccess: () => {
      message.success('视频已删除')
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
    onError: error => message.error(error.message)
  })

  const createRangeValue =
    createTimeStart && createTimeEnd ? ([dayjs(createTimeStart), dayjs(createTimeEnd)] as [Dayjs, Dayjs]) : null
  const updateRangeValue =
    updateTimeStart && updateTimeEnd ? ([dayjs(updateTimeStart), dayjs(updateTimeEnd)] as [Dayjs, Dayjs]) : null

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>视频管理</h1>
          <p>筛选、查看、编辑和删除全站视频。列表状态会保留在地址栏，编辑返回后不会丢失。</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/movies/create', { state: { returnTo: `${location.pathname}${location.search}` } })}>
          添加视频
        </Button>
      </div>

      <Card className="filter-card">
        <Space wrap>
          <Input.Search
            placeholder="搜索标题、作者、简介"
            allowClear
            enterButton
            defaultValue={keyword}
            onSearch={value => patchQuery({ keyword: value })}
            className="filter-search"
          />
          <Input.Search
            placeholder="作者名"
            allowClear
            enterButton="筛选"
            defaultValue={authorName}
            onSearch={value => patchQuery({ authorName: value })}
            style={{ width: 180 }}
          />
          <InputNumber
            placeholder="上传者 ID"
            value={uploader}
            min={1}
            style={{ width: 130 }}
            onChange={value => patchQuery({ uploader: value || undefined })}
          />
          <Select
            allowClear
            showSearch
            placeholder="筛选活动"
            value={activityId}
            className="filter-select"
            optionFilterProp="label"
            onChange={value => patchQuery({ activityId: value, day: undefined, unboundOnly: undefined })}
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
            onChange={value => patchQuery({ day: value })}
            options={(days.data || []).map(item => ({ label: `Day ${item.day}`, value: item.day || undefined }))}
          />
          <Select
            allowClear
            placeholder="公开状态"
            value={isPublic}
            style={{ width: 120 }}
            onChange={value => patchQuery({ isPublic: value })}
            options={[{ label: '已公开', value: 1 }, { label: '未公开', value: 0 }]}
          />
          <Select
            value={unboundOnly ? 'true' : ''}
            style={{ width: 130 }}
            onChange={value => patchQuery({ unboundOnly: value || undefined, activityId: undefined, day: undefined })}
            options={[{ label: '全部视频', value: '' }, { label: '仅未绑定', value: 'true' }]}
          />
          <DatePicker.RangePicker
            inputReadOnly
            value={createRangeValue}
            placeholder={['上传开始', '上传结束']}
            onChange={(_, values) => patchQuery({ createTimeStart: values[0], createTimeEnd: values[1] })}
          />
          <DatePicker.RangePicker
            inputReadOnly
            value={updateRangeValue}
            placeholder={['修改开始', '修改结束']}
            onChange={(_, values) => patchQuery({ updateTimeStart: values[0], updateTimeEnd: values[1] })}
          />
          <Select
            value={sortRule}
            className="filter-select"
            onChange={value => patchQuery({ sortRule: value })}
            options={[
              { label: '按添加日期', value: 'createTime' },
              { label: '按修改日期', value: 'updateTime' },
              { label: '按视频 ID', value: 'movieId' },
              { label: '按展示排序', value: 'sortIndex' },
              { label: '按播放数', value: 'viewNums' },
              { label: '按票数', value: 'pollNums' }
            ]}
          />
          <Select
            value={orderRule}
            style={{ width: 110 }}
            onChange={value => patchQuery({ orderRule: value })}
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
                  onClick={() => openEditor(item.movieId)}
                  bodyStyle={{ padding: 0 }}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
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
                      className="admin-movie-card-title"
                      style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={text(item.movieName)}
                    >
                      {text(item.movieName)}
                    </div>
                    <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
                      <div>作者: {item.authorName || item.author?.memberName || '未指定'}</div>
                      <div>上传者: {memberName(item.uploader)}</div>
                      <div>上传时间: {item.createTime || '未记录'}</div>
                      <div>修改时间: {item.updateTime || '未记录'}</div>
                      {item.realPublishTime && <div>发布时间: {item.realPublishTime}</div>}
                    </div>
                    <div className="admin-movie-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                      <span style={{ fontSize: 12, color: '#999' }}>{item.viewNums || 0} 播放 / {item.pollNums || 0} 票</span>
                      <Space onClick={event => event.stopPropagation()}>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditor(item.movieId)} />
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
            patchQuery({ page: nextPage, pageSize: nextPageSize }, false)
          }}
        />
      </div>
    </div>
  )
}
