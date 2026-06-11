import { ArrowLeftOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Col, DatePicker, Form, Input, InputNumber, Row } from 'antd'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { activityApi } from '../api/modules'
import I18nFormItem from '../components/I18nFormItem'
import QiniuUpload from '../components/QiniuUpload'
import SponsorList from '../components/SponsorList'
import StaffList from '../components/StaffList'
import type { ActivityVo } from '../types'

export default function ActivityEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const isCreate = !id

  const activity = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activityApi.detail(Number(id)),
    enabled: !isCreate
  })

  useEffect(() => {
    if (activity.data) {
      const d = activity.data
      form.setFieldsValue({
        activityId: d.activityId,
        activityName: d.activityName,
        activityCover: d.activityCover,
        activityLogo: d.activityLogo,
        activityBackgroundImg: d.activityBackgroundImg,
        welcomePageBackgroundVideo: d.welcomePageBackgroundVideo,
        desc: d.desc,
        timeRange: d.startTime && d.endTime ? [dayjs(d.startTime), dayjs(d.endTime)] : undefined,
        sponsorId: d.sponsorListVo?.map(sponsor => sponsor.sponsorId) || [],
        staff: d.staff || [],
        rules: d.rules,
        timesorother: d.timesorother,
        faq: d.faq
      })
    }
  }, [activity.data, form])

  const saveMutation = useMutation({
    mutationFn: (values: any) => {
      const payload: Partial<ActivityVo> = {
        activityId: values.activityId,
        activityName: { cn: values.activityName?.cn || '', en: values.activityName?.en, jp: values.activityName?.jp },
        desc: { cn: values.desc?.cn || '', en: values.desc?.en, jp: values.desc?.jp },
        activityCover: values.activityCover,
        activityLogo: values.activityLogo,
        activityBackgroundImg: values.activityBackgroundImg,
        welcomePageBackgroundVideo: values.welcomePageBackgroundVideo,
        startTime: values.timeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: values.timeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        staff: values.staff,
        sponsorId: values.sponsorId,
        rules: { cn: values.rules?.cn || '', en: values.rules?.en, jp: values.rules?.jp },
        timesorother: { cn: values.timesorother?.cn || '', en: values.timesorother?.en, jp: values.timesorother?.jp },
        faq: { cn: values.faq?.cn || '', en: values.faq?.en, jp: values.faq?.jp }
      } as any
      return isCreate ? activityApi.save(payload) : activityApi.update(payload)
    },
    onSuccess: () => {
      message.success(isCreate ? '活动已创建' : '活动已更新')
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      navigate('/activities')
    },
    onError: error => message.error(error.message)
  })

  return (
    <div className="page" style={{ paddingBottom: 76 }}>
      <div className="page-heading">
        <div>
          <h1>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/activities')} />
            {isCreate ? '新建活动' : '编辑活动'}
          </h1>
          <p style={{ marginLeft: 32 }}>配置活动基础信息、视觉资源、多语言描述、Staff 与赞助商。</p>
        </div>
      </div>

      <Form layout="vertical" form={form} onFinish={saveMutation.mutate} disabled={activity.isLoading}>
        <Row gutter={24}>
          <Col span={24} lg={16}>
            <Card title="基础信息" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={24} md={8}>
                  <Form.Item name="activityId" label="活动 ID" rules={[{ required: true }]}>
                    <InputNumber disabled={!isCreate} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={24} md={16}>
                  <Form.Item name="timeRange" label="活动时间">
                    <DatePicker.RangePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <I18nFormItem name="activityName" label="活动名称" required placeholder="例如：2026 黄金祭" />
            </Card>

            <Card title="多语言简介（富文本）" style={{ marginBottom: 24 }}>
              <I18nFormItem name="desc" label="活动介绍" inputType="rich-text" />
            </Card>
            <Card title="详细规则（富文本）" style={{ marginBottom: 24 }}>
              <I18nFormItem name="rules" label="活动规则" inputType="rich-text" />
            </Card>
            <Card title="时间与其他信息（富文本）" style={{ marginBottom: 24 }}>
              <I18nFormItem name="timesorother" label="时间与奖励等" inputType="rich-text" />
            </Card>
            <Card title="答疑 FAQ（富文本）" style={{ marginBottom: 24 }}>
              <I18nFormItem name="faq" label="FAQ" inputType="rich-text" />
            </Card>
            <Card title="Staff 录入" style={{ marginBottom: 24 }}>
              <Form.Item name="staff">
                <StaffList form={form} />
              </Form.Item>
            </Card>
          </Col>

          <Col span={24} lg={8}>
            <Card title="视觉资源" style={{ marginBottom: 24 }}>
              <Form.Item name="activityCover" label="活动封面" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="activityCover" noStyle>
                <QiniuUpload kind="image" accept="image/png,image/jpeg,image/webp,image/gif" />
              </Form.Item>

              <Form.Item name="activityLogo" label="活动专属 Logo" style={{ marginTop: 24 }}>
                <Input />
              </Form.Item>
              <Form.Item name="activityLogo" noStyle>
                <QiniuUpload kind="image" accept="image/png,image/jpeg,image/webp,image/gif" />
              </Form.Item>

              <Form.Item name="activityBackgroundImg" label="活动主页背景图" style={{ marginTop: 24 }}>
                <Input />
              </Form.Item>
              <Form.Item name="activityBackgroundImg" noStyle>
                <QiniuUpload kind="image" accept="image/png,image/jpeg,image/webp,image/gif" />
              </Form.Item>

              <Form.Item name="welcomePageBackgroundVideo" label="欢迎页背景视频" style={{ marginTop: 24 }}>
                <Input />
              </Form.Item>
              <Form.Item name="welcomePageBackgroundVideo" noStyle>
                <QiniuUpload kind="video" accept="video/mp4,video/webm" />
              </Form.Item>
            </Card>

            <Card title="赞助商" style={{ marginBottom: 24 }}>
              <Form.Item name="sponsorId">
                <SponsorList form={form} />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', padding: '14px 24px', boxShadow: '0 -2px 8px rgba(0,0,0,0.08)', zIndex: 100, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <Button size="large" style={{ minWidth: 110 }} onClick={() => navigate('/activities')}>取消</Button>
          <Button size="large" type="primary" htmlType="submit" loading={saveMutation.isPending} style={{ minWidth: 150, height: 44 }}>
            保存活动
          </Button>
        </div>
      </Form>
    </div>
  )
}
