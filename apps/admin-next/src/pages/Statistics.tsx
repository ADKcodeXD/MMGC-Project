import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Form, Image, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd'
import { useState } from 'react'
import { authorApi, statisticsApi } from '../api/modules'
import type { StatisticsAuthor, TrackRecord } from '../types'

type AuthorForm = {
  _id?: string
  authorName: string
  authorAvatar?: string
  participateTimes: number
  consecutiveParticipateTimes: number
  authorType: 'gold' | 'silver' | 'bronze' | 'normal' | 'platinum'
}

export default function Statistics() {
  const [keyword, setKeyword] = useState('')
  const [sortRule, setSortRule] = useState<'createTime' | 'participateTimes' | 'consecutiveParticipateTimes'>('participateTimes')
  const [orderRule, setOrderRule] = useState<'' | 'reverse'>('')
  const [editing, setEditing] = useState<StatisticsAuthor | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [trackPage, setTrackPage] = useState(1)
  const [trackEventType, setTrackEventType] = useState<string>()
  const [trackKeyword, setTrackKeyword] = useState('')
  const [form] = Form.useForm<AuthorForm>()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const authors = useQuery({
    queryKey: ['authorRank', keyword, sortRule, orderRule, page],
    queryFn: () => authorApi.rank({ page, pageSize: 20, keyword: keyword || undefined, sortRule, orderRule })
  })

  const trackRecords = useQuery({
    queryKey: ['trackRecords', trackPage, trackEventType, trackKeyword],
    queryFn: () => statisticsApi.trackList({
      page: trackPage,
      pageSize: 20,
      eventType: trackEventType,
      keyword: trackKeyword || undefined
    })
  })

  const saveMutation = useMutation({
    mutationFn: (values: AuthorForm) => values._id ? authorApi.update(values) : authorApi.add(values),
    onSuccess: () => {
      message.success('作者排行已保存')
      setModalOpen(false)
      setEditing(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['authorRank'] })
    },
    onError: error => message.error(error.message)
  })

  const removeMutation = useMutation({
    mutationFn: authorApi.remove,
    onSuccess: () => {
      message.success('作者已删除')
      queryClient.invalidateQueries({ queryKey: ['authorRank'] })
    },
    onError: error => message.error(error.message)
  })

  function openEditor(author?: StatisticsAuthor) {
    setEditing(author || null)
    form.setFieldsValue(author ? {
      _id: author._id,
      authorName: author.authorName,
      authorAvatar: author.authorAvatar || '',
      participateTimes: author.participateTimes || 1,
      consecutiveParticipateTimes: author.consecutiveParticipateTimes || 0,
      authorType: author.authorType || 'normal'
    } : { participateTimes: 1, consecutiveParticipateTimes: 0, authorType: 'normal' })
    setModalOpen(true)
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>统计数据与作者排行</h1>
          <p>管理活动作者的参与情况和获奖等级。</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>添加作者</Button>
      </div>

      <Card className="filter-card">
        <Space wrap>
          <Input.Search
            placeholder="搜索作者名称"
            allowClear
            enterButton
            onSearch={val => { setKeyword(val); setPage(1) }}
            className="filter-search"
          />
          <Button icon={<ReloadOutlined />} onClick={() => authors.refetch()}>刷新</Button>
          <Select
            value={sortRule}
            style={{ width: 150 }}
            onChange={value => { setSortRule(value); setPage(1) }}
            options={[
              { label: '参赛总次数', value: 'participateTimes' },
              { label: '连续参赛', value: 'consecutiveParticipateTimes' },
              { label: '添加日期', value: 'createTime' }
            ]}
          />
          <Select
            value={orderRule}
            style={{ width: 100 }}
            onChange={value => { setOrderRule(value); setPage(1) }}
            options={[{ label: '降序', value: '' }, { label: '升序', value: 'reverse' }]}
          />
        </Space>
      </Card>

      <Card>
        <Table<StatisticsAuthor>
          rowKey="_id"
          loading={authors.isLoading}
          dataSource={authors.data?.result || []}
          pagination={{ current: page, pageSize: 20, total: authors.data?.total || 0, onChange: p => setPage(p) }}
          scroll={{ x: 800 }}
          columns={[
            {
              title: '头像',
              width: 80,
              render: (_, row) => <Image src={row.authorAvatar || ''} width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} fallback="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" preview={false} />
            },
            { title: '作者名', dataIndex: 'authorName' },
            { title: '参赛总次数', dataIndex: 'participateTimes' },
            { title: '连续参赛次数', dataIndex: 'consecutiveParticipateTimes' },
            {
              title: '等级',
              width: 120,
              render: (_, row) => {
                const colors: Record<string, string> = { platinum: 'purple', gold: 'gold', silver: 'cyan', bronze: 'orange', normal: 'default' }
                const type = row.authorType || 'normal'
                return <Tag color={colors[type] || 'default'}>{type.toUpperCase()}</Tag>
              }
            },
            {
              title: '操作',
              width: 150,
              fixed: 'right',
              render: (_, row) => (
                <Space>
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditor(row)}>编辑</Button>
                  <Popconfirm title="确认删除？" onConfirm={() => removeMutation.mutate(row._id)}>
                    <Button type="link" danger size="small" icon={<DeleteOutlined />}>删除</Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Card>

      <Card
        title="埋点触发记录"
        style={{ marginTop: 24 }}
        extra={
          <Space wrap>
            <Input.Search
              placeholder="搜索页面、事件、访客"
              allowClear
              enterButton
              onSearch={value => {
                setTrackKeyword(value)
                setTrackPage(1)
              }}
              style={{ width: 240 }}
            />
            <Select
              allowClear
              placeholder="事件类型"
              value={trackEventType}
              onChange={value => {
                setTrackEventType(value)
                setTrackPage(1)
              }}
              style={{ width: 120 }}
              options={[{ label: 'PV', value: 'pv' }, { label: 'Click', value: 'click' }]}
            />
            <Button icon={<ReloadOutlined />} onClick={() => trackRecords.refetch()}>刷新</Button>
          </Space>
        }
      >
        <Table<TrackRecord>
          rowKey="_id"
          loading={trackRecords.isLoading}
          dataSource={trackRecords.data?.result || []}
          pagination={{
            current: trackPage,
            pageSize: 20,
            total: trackRecords.data?.total || 0,
            onChange: p => setTrackPage(p)
          }}
          scroll={{ x: 1100 }}
          columns={[
            { title: '触发时间', dataIndex: 'createTime', width: 170 },
            {
              title: '类型',
              dataIndex: 'eventType',
              width: 90,
              render: value => <Tag color={value === 'pv' ? 'blue' : 'green'}>{String(value).toUpperCase()}</Tag>
            },
            { title: '事件', dataIndex: 'eventKey', width: 180 },
            { title: '页面', dataIndex: 'pageUrl', ellipsis: true },
            { title: '访客', dataIndex: 'visitorId', width: 180, ellipsis: true },
            { title: 'IP', dataIndex: 'ip', width: 140 },
            {
              title: '数据',
              dataIndex: 'eventData',
              width: 220,
              ellipsis: true,
              render: value => value ? JSON.stringify(value) : '-'
            }
          ]}
        />
      </Card>

      <Modal
        title={editing ? '编辑作者数据' : '添加作者数据'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields() }}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
      >
        <Form<AuthorForm> form={form} layout="vertical" onFinish={saveMutation.mutate} style={{ marginTop: 24 }}>
          <Form.Item name="_id" hidden><Input /></Form.Item>
          <Form.Item name="authorName" label="作者名" rules={[{ required: true }]}><Input /></Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="participateTimes" label="参赛次数" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="consecutiveParticipateTimes" label="连续参赛次数"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          </div>
          <Form.Item name="authorType" label="等级" rules={[{ required: true }]}>
            <Select options={[
              { label: 'Normal', value: 'normal' },
              { label: 'Bronze', value: 'bronze' },
              { label: 'Silver', value: 'silver' },
              { label: 'Gold', value: 'gold' },
              { label: 'Platinum', value: 'platinum' }
            ]} />
          </Form.Item>
          <Form.Item name="authorAvatar" label="头像 URL"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
