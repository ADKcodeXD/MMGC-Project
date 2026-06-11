import { DeleteOutlined, EyeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Drawer, Form, Image, Input, Popconfirm, Select, Space } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sponsorApi } from '../api/modules'
import I18nFormItem from '../components/I18nFormItem'
import QiniuUpload from '../components/QiniuUpload'
import type { SponsorVo } from '../types'
import { stripHtml } from '../utils/html'
import { text } from '../utils/i18n'

export default function Sponsors() {
  const [keyword, setKeyword] = useState('')
  const [sortRule, setSortRule] = useState<'createTime' | 'sponsorId'>('createTime')
  const [orderRule, setOrderRule] = useState<'' | 'reverse'>('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form] = Form.useForm<Partial<SponsorVo>>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const sponsors = useQuery({
    queryKey: ['sponsors', keyword, sortRule, orderRule],
    queryFn: () => sponsorApi.list({ page: 1, pageSize: 50, keyword: keyword || undefined, sortRule, orderRule })
  })

  const saveMutation = useMutation({
    mutationFn: (values: Partial<SponsorVo>) => sponsorApi.save(values),
    onSuccess: () => {
      message.success('赞助商已添加')
      setDrawerOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
    },
    onError: error => message.error(error.message)
  })

  const removeMutation = useMutation({
    mutationFn: sponsorApi.remove,
    onSuccess: () => {
      message.success('赞助商已删除')
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
    },
    onError: error => message.error(error.message)
  })

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>赞助商管理</h1>
          <p>管理活动赞助商、Logo 和多语言简介。编辑请进入详情页。</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
          添加赞助商
        </Button>
      </div>

      <Card className="filter-card">
        <Space wrap>
          <Input.Search
            placeholder="搜索赞助商名称"
            allowClear
            enterButton
            onSearch={setKeyword}
            className="filter-search"
          />
          <Button icon={<ReloadOutlined />} onClick={() => sponsors.refetch()}>
            刷新
          </Button>
          <Select
            value={sortRule}
            style={{ width: 130 }}
            onChange={setSortRule}
            options={[{ label: '添加日期', value: 'createTime' }, { label: '赞助商 ID', value: 'sponsorId' }]}
          />
          <Select
            value={orderRule}
            style={{ width: 100 }}
            onChange={setOrderRule}
            options={[{ label: '降序', value: '' }, { label: '升序', value: 'reverse' }]}
          />
        </Space>
      </Card>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginTop: 16 }}>
        {(sponsors.data?.result || []).map(item => (
          <Card key={item.sponsorId} hoverable bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Image
                src={item.sponsorLogo || ''}
                width={64}
                height={64}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                preview={false}
                style={{ objectFit: 'contain', background: '#fff', border: '1px solid #edf0f5', borderRadius: 12 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 16, marginBottom: 4 }}>
                  {text(item.sponsorName)}
                </strong>
                <span
                  style={{
                    color: '#6b7280',
                    fontSize: 13,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word'
                  }}
                  title={stripHtml(text(item.sponsorDesc))}
                >
                  {stripHtml(text(item.sponsorDesc)) || '暂无简介'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
              <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/sponsors/${item.sponsorId}`)}>
                详情
              </Button>
              <Popconfirm title="确认删除？" onConfirm={() => removeMutation.mutate(item.sponsorId)}>
                <Button danger size="small" icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            </div>
          </Card>
        ))}
      </div>

      <Drawer
        title="添加赞助商"
        open={drawerOpen}
        width={560}
        onClose={() => {
          setDrawerOpen(false)
          form.resetFields()
        }}
      >
        <Form<Partial<SponsorVo>> form={form} layout="vertical" onFinish={saveMutation.mutate}>
          <I18nFormItem name="sponsorName" label="名称" required />
          <I18nFormItem name="sponsorDesc" label="简介" inputType="rich-text" />
          <Form.Item name="sponsorLogo" label="Logo URL">
            <Input placeholder="https://assets.mirai-mad.com/..." />
          </Form.Item>
          <Form.Item name="sponsorLogo" noStyle>
            <QiniuUpload kind="image" accept="image/png,image/jpeg,image/webp,image/gif" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saveMutation.isPending} block style={{ marginTop: 24 }}>
            保存
          </Button>
        </Form>
      </Drawer>
    </div>
  )
}
