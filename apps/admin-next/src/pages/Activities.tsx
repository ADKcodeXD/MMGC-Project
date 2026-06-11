import { App, Button, Card, Image, Input, Popconfirm, Select, Space, Table, Tag } from 'antd'
import { AppstoreOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { activityApi } from '../api/modules'
import type { ActivityVo } from '../types'
import { text } from '../utils/i18n'

export default function Activities() {
  const [keyword, setKeyword] = useState('')
  const [sortRule, setSortRule] = useState<'createTime' | 'activityId' | 'days' | 'movieNums'>('createTime')
  const [orderRule, setOrderRule] = useState<'' | 'reverse'>('')
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const activities = useQuery({
    queryKey: ['activities', keyword, sortRule, orderRule],
    queryFn: () => activityApi.list({ page: 1, pageSize: 50, keyword: keyword || undefined, sortRule, orderRule })
  })

  const deleteActivityMutation = useMutation({
    mutationFn: activityApi.remove,
    onSuccess: () => {
      message.success('活动已删除')
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
    onError: error => message.error(error.message)
  })

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>活动与天数</h1>
          <p>活动、Day 配置和展示顺序管理。天数支持拖拽排序。</p>
        </div>
        <Space>
          <Space.Compact className="search-box">
            <Input.Search placeholder="搜索活动" allowClear enterButton onSearch={setKeyword} />
          </Space.Compact>
          <Select
            value={sortRule}
            style={{ width: 130 }}
            onChange={setSortRule}
            options={[
              { label: '添加日期', value: 'createTime' },
              { label: '活动 ID', value: 'activityId' },
              { label: '天数', value: 'days' },
              { label: '作品数', value: 'movieNums' }
            ]}
          />
          <Select
            value={orderRule}
            style={{ width: 100 }}
            onChange={setOrderRule}
            options={[{ label: '降序', value: '' }, { label: '升序', value: 'reverse' }]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/activities/create')}>
            新建活动
          </Button>
        </Space>
      </div>
      <Card>
        <Table<ActivityVo>
          rowKey="activityId"
          loading={activities.isLoading}
          dataSource={activities.data?.result || []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1100 }}
          columns={[
            { title: '活动 ID', dataIndex: 'activityId', width: 90 },
            {
              title: 'Logo',
              width: 88,
              render: (_, row) => (
                <Image
                  src={row.activityLogo || row.activityCover || ''}
                  width={48}
                  height={48}
                  preview={false}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                  style={{ objectFit: 'contain', borderRadius: 12, background: '#fff', border: '1px solid #edf0f5' }}
                />
              )
            },
            { title: '活动名称', render: (_, row) => text(row.activityName) },
            {
              title: '主办人员',
              width: 220,
              render: (_, row) => {
                const organizers = (row.staff || []).filter(item => item.role === 'organizer')
                if (!organizers.length) return <span style={{ color: '#9ca3af' }}>未配置</span>
                return (
                  <Space size={[4, 4]} wrap>
                    {organizers.slice(0, 4).map((item, index) => (
                      <Tag key={`${item.name}-${index}`} color="blue" style={{ marginRight: 0 }}>
                        {item.name}
                      </Tag>
                    ))}
                    {organizers.length > 4 && <Tag>+{organizers.length - 4}</Tag>}
                  </Space>
                )
              }
            },
            { title: '天数', dataIndex: 'days', width: 70 },
            { title: '作品数', dataIndex: 'movieNums', width: 80 },
            {
              title: '时间',
              width: 200,
              render: (_, row) => <span style={{ fontSize: '13px' }}>{`${row.startTime || '-'} / ${row.endTime || '-'}`}</span>
            },
            {
              title: '操作',
              width: 280,
              fixed: 'right',
              render: (_, row) => (
                <Space>
                  <Button type="primary" size="small" icon={<AppstoreOutlined />} onClick={() => navigate(`/activities/${row.activityId}/days`)}>
                    管理排片
                  </Button>
                  <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/activities/edit/${row.activityId}`)}>
                    编辑
                  </Button>
                  <Popconfirm title="确认删除此活动？" onConfirm={() => deleteActivityMutation.mutate(row.activityId)}>
                    <Button danger size="small" icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Card>
    </div>
  )
}
