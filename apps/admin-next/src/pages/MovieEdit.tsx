import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Avatar, Button, Card, Col, DatePicker, Form, Input, InputNumber, Radio, Row, Select, Space, Tabs } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { activityApi, bilibiliApi, movieApi } from '../api/modules'
import I18nFormItem from '../components/I18nFormItem'
import QiniuUpload from '../components/QiniuUpload'
import type { BiliUserInfo, MovieVo } from '../types'
import { text } from '../utils/i18n'

type PlaySource = 'cn' | 'en' | 'jp'

function extractBiliUid(url: string): number | null {
  const m1 = url.match(/space\.bilibili\.com\/(\d+)/)
  if (m1) return Number(m1[1])
  const m2 = url.match(/bilibili\.com\/space\/(\d+)/)
  if (m2) return Number(m2[1])
  return null
}

async function fetchMovieDetailWithFallback(movieId: number) {
  try {
    const detail = await movieApi.detail(movieId)
    if (detail) return detail
  } catch {}

  try {
    const publicDetail = await movieApi.publicDetail(movieId)
    if (publicDetail) return publicDetail
  } catch {}

  const list = await movieApi.list({ page: 1, pageSize: 100, keyword: String(movieId) })
  const matched = list.result.find(item => item.movieId === movieId)
  if (matched) return matched
  throw new Error('无法获取视频详情，请确认视频 ID、登录状态和线上 API 权限')
}

export default function MovieEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const authorAvatar = Form.useWatch('authorAvatar', form)
  const [biliAuthor, setBiliAuthor] = useState<BiliUserInfo | null>(null)
  const [biliSpaceUrl, setBiliSpaceUrl] = useState('')
  const [biliLoading, setBiliLoading] = useState(false)
  const [activePlaySource, setActivePlaySource] = useState<PlaySource>('cn')
  const isCreate = !id

  const activities = useQuery({
    queryKey: ['activity-options'],
    queryFn: () => activityApi.list({ page: 1, pageSize: 100 })
  })

  const activityId = Form.useWatch('activityId', form)
  const days = useQuery({
    queryKey: ['movie-days', activityId],
    queryFn: () => activityApi.days(activityId!),
    enabled: Boolean(activityId)
  })

  const movie = useQuery({
    queryKey: ['movie-detail', id],
    queryFn: () => fetchMovieDetailWithFallback(Number(id)),
    enabled: !isCreate && Number.isFinite(Number(id)),
    retry: false
  })

  useEffect(() => {
    if (movie.data) {
      const d = movie.data
      form.setFieldsValue({
        movieId: d.movieId,
        movieName: d.movieName,
        movieDesc: d.movieDesc,
        movieCover: d.movieCover,
        moviePlaylink: d.moviePlaylink,
        movieLink: d.movieLink,
        movieDownloadLink: d.movieDownloadLink,
        realPublishTime: d.realPublishTime ? dayjs(d.realPublishTime) : undefined,
        expectPlayTime: d.expectPlayTime ? dayjs(d.expectPlayTime) : undefined,
        isOrigin: d.isOrigin,
        activityId: d.activityVo?.activityId || d.activityId,
        day: d.day,
        authorName: d.authorName || d.author?.memberName,
        authorAvatar: d.authorAvatar || d.author?.avatar,
        authorId: d.authorId
      })
    }
  }, [movie.data, form])

  const saveMutation = useMutation({
    mutationFn: (values: any) => {
      const payload: Partial<MovieVo> = {
        movieId: values.movieId,
        movieName: { cn: values.movieName?.cn || '', en: values.movieName?.en, jp: values.movieName?.jp },
        movieDesc: { cn: values.movieDesc?.cn || '', en: values.movieDesc?.en, jp: values.movieDesc?.jp },
        movieCover: values.movieCover,
        moviePlaylink: {
          cn: values.moviePlaylink?.cn || '',
          en: values.moviePlaylink?.en,
          jp: values.moviePlaylink?.jp
        },
        movieLink: values.movieLink,
        movieDownloadLink: values.movieDownloadLink,
        realPublishTime: values.realPublishTime?.format('YYYY-MM-DD HH:mm:ss'),
        expectPlayTime: values.expectPlayTime?.format('YYYY-MM-DD HH:mm:ss'),
        isOrigin: values.isOrigin,
        activityId: values.activityId || null,
        day: values.day || null,
        authorName: values.authorName || null,
        authorAvatar: values.authorAvatar || null,
        authorId: values.authorId || null
      }
      return isCreate ? movieApi.save(payload) : movieApi.update({ ...payload, movieId: values.movieId! })
    },
    onSuccess: () => {
      message.success(isCreate ? '视频已添加' : '视频已更新')
      queryClient.invalidateQueries({ queryKey: ['movies'] })
      navigate('/movies')
    },
    onError: error => message.error(error.message)
  })

  async function fetchBiliAuthor(rawUrl: string) {
    const url = rawUrl.trim()
    if (!url) return
    const uid = extractBiliUid(url)
    if (!uid) {
      message.warning('请输入 B 站空间链接，例如 https://space.bilibili.com/123456')
      return
    }

    setBiliLoading(true)
    try {
      const info = await bilibiliApi.userInfo(uid)
      setBiliAuthor(info)
      form.setFieldValue('authorName', info.name)
      form.setFieldValue('authorAvatar', info.face)
      form.setFieldValue(['movieLink', 'bilibili'], url)
      message.success('已抓取 B 站作者信息')
    } catch (error: any) {
      message.error(error.message || '获取 B 站作者信息失败')
    } finally {
      setBiliLoading(false)
    }
  }

  const playSourceItems = [
    { key: 'cn', label: 'CN 源', placeholder: '输入 CN 播放源地址，支持 mp4 / m3u8 / 外部源', required: true },
    { key: 'en', label: 'EN 源', placeholder: '输入 EN 播放源地址，不会自动翻译', required: false },
    { key: 'jp', label: 'JP 源', placeholder: '输入 JP 播放源地址，不会自动翻译', required: false }
  ] as const

  return (
    <div className="page" style={{ paddingBottom: 76 }}>
      <div className="page-heading">
        <div>
          <h1>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/movies')} />
            {isCreate ? '添加视频' : '编辑视频'}
          </h1>
          <p style={{ marginLeft: 32 }}>管理视频标题、简介、封面、播放源以及所属活动与天数。</p>
        </div>
      </div>

      {movie.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="视频详情获取失败"
          description={(movie.error as Error).message}
          action={<Button size="small" onClick={() => movie.refetch()}>重试</Button>}
        />
      )}

      <Form layout="vertical" form={form} onFinish={saveMutation.mutate} disabled={movie.isLoading}>
        <Form.Item name="movieId" hidden><InputNumber /></Form.Item>

        <Row gutter={24}>
          <Col span={24} lg={16}>
            <Card title="基础信息" style={{ marginBottom: 24 }}>
              <I18nFormItem name="movieName" label="视频标题" required placeholder="视频主要标题" />
              <I18nFormItem name="movieDesc" label="视频简介" inputType="textarea" placeholder="简要描述作品" />
              <Row gutter={16}>
                <Col span={24} md={12}>
                  <Form.Item name="authorId" label="原作者（系统账号）">
                    <InputNumber style={{ width: '100%' }} placeholder="暂不可选，后续接入成员选择" disabled />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item name="authorName" label="作者名">
                    <Input placeholder="没有本站账号时填写作者名" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="authorAvatar" label="作者头像 URL">
                    <Input placeholder="https://assets.mirai-mad.com/..." />
                  </Form.Item>
                  <Space style={{ marginTop: -12, marginBottom: 12 }}>
                    <Avatar src={authorAvatar || biliAuthor?.face} />
                    <span style={{ color: '#6b7280', fontSize: 13 }}>保存后会同步到前台作者信息展示</span>
                  </Space>
                </Col>
                <Col span={24}>
                  <Form.Item label="B 站空间快捷抓取">
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        placeholder="https://space.bilibili.com/..."
                        value={biliSpaceUrl}
                        onChange={event => setBiliSpaceUrl(event.target.value)}
                        onBlur={() => fetchBiliAuthor(biliSpaceUrl)}
                      />
                      <Button icon={<SearchOutlined />} loading={biliLoading} onClick={() => fetchBiliAuthor(biliSpaceUrl)}>抓取</Button>
                    </Space.Compact>
                  </Form.Item>
                  {biliAuthor && (
                    <Space style={{ marginTop: -12, marginBottom: 12 }}>
                      <Avatar src={biliAuthor.face} />
                      <span>{biliAuthor.name}</span>
                    </Space>
                  )}
                </Col>
              </Row>
              <Form.Item name="isOrigin" label="是否原创">
                <Radio.Group>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </Radio.Group>
              </Form.Item>
            </Card>

            <Card title="视频外部链接" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={24} md={8}><Form.Item name={['movieLink', 'bilibili']} label="bilibili"><Input /></Form.Item></Col>
                <Col span={24} md={8}><Form.Item name={['movieLink', 'youtube']} label="youtube"><Input /></Form.Item></Col>
                <Col span={24} md={8}><Form.Item name={['movieLink', 'niconico']} label="niconico"><Input /></Form.Item></Col>
                <Col span={24} md={8}><Form.Item name={['movieLink', 'twitter']} label="twitter"><Input /></Form.Item></Col>
                <Col span={24} md={8}><Form.Item name={['movieLink', 'personalWebsite']} label="个人网站 / 其他"><Input /></Form.Item></Col>
              </Row>
            </Card>

            <Card title="视频下载链接" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={24} md={12}><Form.Item name={['movieDownloadLink', 'baidu']} label="百度网盘"><Input /></Form.Item></Col>
                <Col span={24} md={12}><Form.Item name={['movieDownloadLink', 'google']} label="Google Drive"><Input /></Form.Item></Col>
                <Col span={24} md={12}><Form.Item name={['movieDownloadLink', 'onedrive']} label="OneDrive"><Input /></Form.Item></Col>
                <Col span={24} md={12}><Form.Item name={['movieDownloadLink', 'other']} label="其他渠道"><Input /></Form.Item></Col>
              </Row>
            </Card>

            <Card title="时间选择" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={24} md={12}>
                  <Form.Item name="realPublishTime" label="实际发布时间">
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item name="expectPlayTime" label="期望公开时间">
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="关联活动排片" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={24} md={12}>
                  <Form.Item name="activityId" label="所属活动">
                    <Select
                      allowClear
                      showSearch
                      placeholder="选择关联的活动"
                      optionFilterProp="label"
                      options={(activities.data?.result || []).map(item => ({ label: `${item.activityId} - ${text(item.activityName)}`, value: item.activityId }))}
                      onChange={() => form.setFieldValue('day', undefined)}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item name="day" label="排片天数（Day）">
                    <Select
                      allowClear
                      placeholder="选择所属 Day"
                      disabled={!activityId}
                      options={(days.data || []).map(item => ({ label: `Day ${item.day} - ${text(item.themeName)}`, value: item.day || undefined }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24} lg={8}>
            <Card title="视频与封面资源" style={{ marginBottom: 24 }}>
              <Form.Item name="movieCover" label="视频封面" rules={[{ required: true }]}>
                <Input placeholder="输入封面图片链接" style={{ marginBottom: 8 }} />
              </Form.Item>
              <Form.Item name="movieCover" noStyle>
                <QiniuUpload kind="image" accept="image/png,image/jpeg,image/webp,image/gif" />
              </Form.Item>

              <div style={{ marginTop: 24 }}>
                <Form.Item label="播放源" required>
                  <Tabs
                    activeKey={activePlaySource}
                    onChange={key => setActivePlaySource(key as PlaySource)}
                    items={playSourceItems.map(item => ({
                      key: item.key,
                      label: item.label,
                      children: (
                        <Form.Item
                          name={['moviePlaylink', item.key]}
                          rules={item.required ? [{ required: true, message: '请填写默认播放源' }] : undefined}
                          noStyle
                        >
                          <Input placeholder={item.placeholder} />
                        </Form.Item>
                      )
                    }))}
                  />
                </Form.Item>
                <Form.Item key={`play-source-upload-${activePlaySource}`} name={['moviePlaylink', activePlaySource]} noStyle>
                  <QiniuUpload kind="video" accept="video/mp4,application/vnd.apple.mpegurl,application/x-mpegURL" />
                </Form.Item>
                <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>
                  当前预览随 CN / EN / JP 源切换；这里是不同播放源，不使用 AI 翻译。
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', padding: '14px 24px', boxShadow: '0 -2px 8px rgba(0,0,0,0.08)', zIndex: 100, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <Button size="large" style={{ minWidth: 110 }} onClick={() => navigate('/movies')}>取消</Button>
          <Button size="large" type="primary" htmlType="submit" loading={saveMutation.isPending} style={{ minWidth: 150, height: 44 }}>
            保存视频
          </Button>
        </div>
      </Form>
    </div>
  )
}
