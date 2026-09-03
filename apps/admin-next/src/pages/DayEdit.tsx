import { ArrowLeftOutlined, DownloadOutlined, HolderOutlined, VideoCameraAddOutlined } from '@ant-design/icons'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Progress, Row, Select, Space } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { activityApi, movieApi } from '../api/modules'
import I18nFormItem from '../components/I18nFormItem'
import R2Upload from '../components/R2Upload'
import type { DayVo, MovieVo } from '../types'
import { text } from '../utils/i18n'
import { exportVideos, previewExportFiles, type ExportProgress } from '../utils/exportVideos'
import SearchMoviesModal from './components/SearchMoviesModal'

function SortableMovieCard({ item, unbindMovieMutation }: { item: MovieVo; unbindMovieMutation: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.movieId })
  const style = { transform: CSS.Transform.toString(transform), transition, height: '100%' }

  return (
    <Col xs={24} sm={12} md={8} lg={6} xl={6} ref={setNodeRef} style={style}>
      <Card
        hoverable
        onClick={() => window.open(`/newAdmin/movies/edit/${item.movieId}`, '_blank')}
        bodyStyle={{ padding: 0 }}
        style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
      >
        <div
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 4, borderRadius: 4, cursor: 'grab' }}
          {...attributes}
          {...listeners}
          onClick={event => event.stopPropagation()}
        >
          <HolderOutlined />
        </div>
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
          <img
            src={item.movieCover}
            alt={text(item.movieName)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={text(item.movieName)}>
            {text(item.movieName)}
          </div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            UP: {item.authorName || item.author?.memberName || '未指定'}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f0f0f0' }} onClick={event => event.stopPropagation()}>
            <Popconfirm title="确认将此视频从当前天数移除？" onConfirm={() => unbindMovieMutation.mutate(item.movieId)}>
              <Button danger block size="small">移除绑定</Button>
            </Popconfirm>
          </div>
        </div>
      </Card>
    </Col>
  )
}

export default function DayEdit() {
  const { id, day } = useParams()
  const activityId = Number(id)
  const dayIndex = day ? Number(day) : undefined
  const isCreate = !dayIndex

  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const daysQuery = useQuery({
    queryKey: ['activity-days', activityId],
    queryFn: () => activityApi.days(activityId)
  })

  const moviesQuery = useQuery({
    queryKey: ['day-movies', activityId, dayIndex],
    queryFn: () => movieApi.list({
      page: 1,
      pageSize: 500,
      activityId,
      day: dayIndex,
      sortRule: 'sortIndex movieId',
      orderRule: 'reverse'
    }),
    enabled: !isCreate
  })

  const currentDay = daysQuery.data?.find(item => item.day === dayIndex)
  const sortedMovies = moviesQuery.data?.result || []

  useEffect(() => {
    if (currentDay) {
      form.setFieldsValue({
        day: currentDay.day,
        themeName: currentDay.themeName,
        themeDesc: currentDay.themeDesc,
        themeCover: currentDay.themeCover,
        isPublic: currentDay.isPublic ?? true,
        bilibiliLink: currentDay.dayPollLink?.bilibili,
        twitterLink: currentDay.dayPollLink?.twitter,
        personalWebsiteLink: currentDay.dayPollLink?.personalWebsite || currentDay.dayPollLink?.website
      })
    }
  }, [currentDay, form])

  const saveMutation = useMutation({
    mutationFn: (values: any) => {
      const payload: Partial<DayVo> = {
        activityId,
        day: values.day,
        themeName: { cn: values.themeName?.cn || '', en: values.themeName?.en, jp: values.themeName?.jp },
        themeDesc: { cn: values.themeDesc?.cn || '', en: values.themeDesc?.en, jp: values.themeDesc?.jp },
        themeCover: values.themeCover,
        isPublic: values.isPublic,
        dayPollLink: {
          bilibili: values.bilibiliLink || null,
          twitter: values.twitterLink || null,
          personalWebsite: values.personalWebsiteLink || null
        }
      }
      return isCreate ? activityApi.saveDay(payload) : activityApi.updateDay(payload)
    },
    onSuccess: () => {
      message.success(isCreate ? '天数已添加' : '天数已更新')
      queryClient.invalidateQueries({ queryKey: ['activity-days', activityId] })
      navigate(`/activities/${activityId}/days`)
    },
    onError: error => message.error(error.message)
  })

  const unbindMovieMutation = useMutation({
    mutationFn: (movieId: number) => movieApi.update({ movieId, day: null } as any),
    onSuccess: () => {
      message.success('已解绑该视频')
      queryClient.invalidateQueries({ queryKey: ['day-movies', activityId, dayIndex] })
    },
    onError: error => message.error(error.message)
  })

  const sortMutation = useMutation({
    mutationFn: (items: MovieVo[]) => movieApi.sort(items.map((item, index) => ({ movieId: item.movieId, sortIndex: index + 1 }))),
    onSuccess: () => {
      message.success('排序已更新')
      queryClient.invalidateQueries({ queryKey: ['day-movies', activityId, dayIndex] })
    },
    onError: error => message.error(error.message)
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedMovies.findIndex(item => item.movieId === active.id)
    const newIndex = sortedMovies.findIndex(item => item.movieId === over.id)
    const nextItems = arrayMove(sortedMovies, oldIndex, newIndex).map((item, index) => ({
      ...item,
      sortIndex: index + 1
    }))

    queryClient.setQueryData(['day-movies', activityId, dayIndex], (oldData: any) => ({ ...oldData, result: nextItems }))
    sortMutation.mutate(nextItems)
  }

  const hasExportableVideos = sortedMovies.some(m => {
    const pl = m.moviePlaylink
    return pl && (pl.cn || pl.en || pl.jp)
  })

  const handleExport = useCallback(async () => {
    if (!dayIndex || sortedMovies.length === 0) return

    const items = previewExportFiles(activityId, dayIndex, sortedMovies)
    if (items.length === 0) {
      message.warning('当前天数下没有可导出的视频播放链接')
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    setExportProgress({ current: 0, total: items.length, fileName: '准备中...', percent: 0, phase: 'downloading' })

    try {
      await exportVideos(activityId, dayIndex, sortedMovies, setExportProgress, controller.signal)
      message.success('视频导出完成，ZIP 文件已开始下载')
    } catch (err: any) {
      if (err.name === 'AbortError') {
        message.info('已取消导出')
      } else {
        message.error(`导出失败: ${err.message}`)
      }
    } finally {
      abortRef.current = null
      setTimeout(() => setExportProgress(null), 1500)
    }
  }, [activityId, dayIndex, sortedMovies, message])

  const handleCancelExport = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return (
    <div className="page" style={{ paddingBottom: 76 }}>
      <div className="page-heading">
        <div>
          <h1>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(`/activities/${activityId}/days`)} />
            {isCreate ? '新建天数' : `Day ${dayIndex} 详情管理`}
          </h1>
          <p style={{ marginLeft: 32 }}>设置该天数的视觉资源、多语言信息，并管理绑定的参赛视频。</p>
        </div>
      </div>

      <Form layout="vertical" form={form} onFinish={saveMutation.mutate} disabled={daysQuery.isLoading}>
        <Card title="基础属性与视觉配置" style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            <Col span={24} md={16}>
              <Row gutter={16}>
                <Col span={24} md={8}>
                  <Form.Item name="day" label="Day 序号" rules={[{ required: true }]}>
                    <InputNumber min={1} disabled={!isCreate} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={24} md={8}>
                  <Form.Item name="isPublic" label="展示状态" initialValue={true}>
                    <Select options={[{ label: '公开显示', value: true }, { label: '暂不公开', value: false }]} />
                  </Form.Item>
                </Col>
                <Col span={24} md={8}>
                  <Form.Item name="bilibiliLink" label="B站投票链接">
                    <Input placeholder="https://t.bilibili.com/..." />
                  </Form.Item>
                </Col>
                <Col span={24} md={8}>
                  <Form.Item name="twitterLink" label="Twitter / X 投票链接">
                    <Input placeholder="https://twitter.com/..." />
                  </Form.Item>
                </Col>
                <Col span={24} md={8}>
                  <Form.Item name="personalWebsiteLink" label="其他投票链接">
                    <Input placeholder="https://..." />
                  </Form.Item>
                </Col>
              </Row>
              <I18nFormItem name="themeName" label="主题名" placeholder="天数所属主题名" />
              <I18nFormItem name="themeDesc" label="主题简介" inputType="textarea" placeholder="填写简介描述" />
            </Col>
            <Col span={24} md={8}>
              <Form.Item name="themeCover" label="主题封面">
                <Input placeholder="图片链接" />
              </Form.Item>
              <Form.Item name="themeCover" noStyle>
                <R2Upload kind="image" accept="image/png,image/jpeg,image/webp" />
              </Form.Item>
              {!form.getFieldValue('themeCover') && (
                <div style={{ marginTop: 12, color: '#faad14', fontSize: 13, background: '#fffbe6', padding: '8px 12px', borderRadius: 6, border: '1px solid #ffe58f' }}>
                  提示：如果未单独设置封面，前台将默认使用该天数下第一个视频的封面作为背景。
                </div>
              )}
            </Col>
          </Row>
        </Card>

        {!isCreate && (
          <Card
            title="绑定的参赛视频"
            extra={
              <Space>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  disabled={!hasExportableVideos || moviesQuery.isLoading}
                  loading={exportProgress !== null && exportProgress.phase !== 'done'}
                >
                  导出本日视频
                </Button>
                <Button type="primary" icon={<VideoCameraAddOutlined />} onClick={() => setSearchModalOpen(true)}>
                  从片库添加视频至本天数
                </Button>
              </Space>
            }
          >
            {moviesQuery.isLoading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>加载中...</div>
            ) : sortedMovies.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>暂无绑定的视频</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortedMovies.map(item => item.movieId)} strategy={rectSortingStrategy}>
                  <Row gutter={[16, 16]}>
                    {sortedMovies.map(item => (
                      <SortableMovieCard key={item.movieId} item={item} unbindMovieMutation={unbindMovieMutation} />
                    ))}
                  </Row>
                </SortableContext>
              </DndContext>
            )}
          </Card>
        )}

        <div className="floating-actions">
          <Button size="large" style={{ minWidth: 110 }} onClick={() => navigate(`/activities/${activityId}/days`)}>取消</Button>
          <Button size="large" type="primary" htmlType="submit" loading={saveMutation.isPending} style={{ minWidth: 160, height: 44 }}>
            保存天数信息
          </Button>
        </div>
      </Form>

      {searchModalOpen && (
        <SearchMoviesModal
          open={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          activityId={activityId}
          targetDay={dayIndex!}
          onBound={() => queryClient.invalidateQueries({ queryKey: ['day-movies', activityId, dayIndex] })}
        />
      )}

      <Modal
        title="导出视频"
        open={exportProgress !== null}
        footer={
          exportProgress?.phase === 'done' ? (
            <Button type="primary" onClick={() => setExportProgress(null)}>完成</Button>
          ) : (
            <Button danger onClick={handleCancelExport}>取消导出</Button>
          )
        }
        closable={false}
        maskClosable={false}
        width={480}
      >
        {exportProgress && (
          <div style={{ padding: '12px 0' }}>
            <Progress
              percent={exportProgress.percent}
              status={exportProgress.phase === 'error' ? 'exception' : exportProgress.phase === 'done' ? 'success' : 'active'}
              strokeColor={{ from: '#1677ff', to: '#52c41a' }}
            />
            <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
              {exportProgress.phase === 'downloading' && (
                <span>正在下载 ({exportProgress.current}/{exportProgress.total}): {exportProgress.fileName}</span>
              )}
              {exportProgress.phase === 'zipping' && (
                <span>正在生成压缩包...</span>
              )}
              {exportProgress.phase === 'done' && (
                <span style={{ color: '#52c41a' }}>✓ 导出完成，共 {exportProgress.total} 个文件</span>
              )}
              {exportProgress.phase === 'error' && (
                <span style={{ color: '#ff4d4f' }}>导出失败: {exportProgress.error}</span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
