import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Form, Image, Input, Popconfirm, Space, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { sponsorApi } from '../api/modules'
import I18nFormItem from '../components/I18nFormItem'
import QiniuUpload from '../components/QiniuUpload'
import RichTextPreview from '../components/RichTextPreview'
import type { SponsorVo } from '../types'
import { text } from '../utils/i18n'

export default function SponsorDetail() {
  const { id } = useParams()
  const sponsorId = Number(id)
  const [editing, setEditing] = useState(false)
  const [form] = Form.useForm<Partial<SponsorVo>>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const sponsor = useQuery({
    queryKey: ['sponsor-detail', sponsorId],
    queryFn: () => sponsorApi.detail(sponsorId),
    enabled: Number.isFinite(sponsorId)
  })

  useEffect(() => {
    if (sponsor.data) form.setFieldsValue(sponsor.data)
  }, [form, sponsor.data])

  const updateMutation = useMutation({
    mutationFn: (values: Partial<SponsorVo>) => sponsorApi.update({ ...values, sponsorId }),
    onSuccess: () => {
      message.success('赞助商已更新')
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
      queryClient.invalidateQueries({ queryKey: ['sponsor-detail', sponsorId] })
    },
    onError: error => message.error(error.message)
  })

  const removeMutation = useMutation({
    mutationFn: () => sponsorApi.remove(sponsorId),
    onSuccess: () => {
      message.success('赞助商已删除')
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
      navigate('/sponsors')
    },
    onError: error => message.error(error.message)
  })

  if (sponsor.isLoading) return <Spin />

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/sponsors')} />
            {text(sponsor.data?.sponsorName) || '赞助商详情'}
          </h1>
          <p style={{ marginLeft: 32 }}>查看并维护赞助商名称、富文本简介与 Logo。</p>
        </div>
        <Space>
          {editing ? (
            <>
              <Button
                onClick={() => {
                  form.setFieldsValue(sponsor.data || {})
                  setEditing(false)
                }}
              >
                取消
              </Button>
              <Button type="primary" icon={<SaveOutlined />} loading={updateMutation.isPending} onClick={() => form.submit()}>
                保存
              </Button>
            </>
          ) : (
            <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
              编辑
            </Button>
          )}
          <Popconfirm title="确认删除此赞助商？" onConfirm={() => removeMutation.mutate()}>
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card>
        <Form<Partial<SponsorVo>> form={form} layout="vertical" disabled={!editing} onFinish={updateMutation.mutate}>
          <div className="sponsor-detail-grid">
            <div>
              {editing && (
                <Form.Item name="sponsorLogo" label="Logo URL">
                  <Input placeholder="https://assets.mirai-mad.com/..." />
                </Form.Item>
              )}
              <Form.Item noStyle shouldUpdate={(prev, next) => prev.sponsorLogo !== next.sponsorLogo}>
                {() => (
                  <Image
                    src={form.getFieldValue('sponsorLogo') || ''}
                    width={160}
                    height={100}
                    preview={false}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                    style={{ objectFit: 'contain', borderRadius: 12, background: '#fff', border: '1px solid #edf0f5' }}
                  />
                )}
              </Form.Item>
              {editing && (
                <div style={{ marginTop: 12 }}>
                  <Form.Item name="sponsorLogo" noStyle>
                    <QiniuUpload kind="image" accept="image/png,image/jpeg,image/webp,image/gif" />
                  </Form.Item>
                </div>
              )}
            </div>

            <div>
              {editing ? (
                <>
                  <I18nFormItem name="sponsorName" label="赞助商名称" required />
                  <I18nFormItem name="sponsorDesc" label="赞助商简介" inputType="rich-text" />
                </>
              ) : (
                <div className="sponsor-readonly">
                  <div className="readonly-label">赞助商名称</div>
                  <h2>{text(sponsor.data?.sponsorName)}</h2>
                  <div className="readonly-label">赞助商简介</div>
                  <RichTextPreview value={text(sponsor.data?.sponsorDesc)} />
                </div>
              )}
            </div>
          </div>
        </Form>
      </Card>
    </div>
  )
}
