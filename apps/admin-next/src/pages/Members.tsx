import { EyeOutlined, ReloadOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Image, Input, Select, Space, Table, Tag } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { memberApi } from '../api/modules'
import type { MemberVo } from '../types'

const roleColors: Record<string, string> = {
  ADMIN: 'red',
  SUBADMIN: 'orange',
  COMMITTER: 'blue',
  GROUPMEMBER: 'cyan',
  GUEST: 'default'
}

export default function Members() {
  const [keyword, setKeyword] = useState('')
  const [sortRule, setSortRule] = useState<'createTime' | 'memberId'>('createTime')
  const [orderRule, setOrderRule] = useState<'' | 'reverse'>('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const members = useQuery({
    queryKey: ['members', keyword, sortRule, orderRule, page],
    queryFn: () => memberApi.list({ page, pageSize: 20, keyword: keyword || undefined, sortRule, orderRule })
  })

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>成员管理</h1>
          <p>管理用户基础资料、社交链接、头像和权限角色。编辑请进入详情页。</p>
        </div>
      </div>

      <Card className="filter-card">
        <Space wrap>
          <Input.Search
            placeholder="搜索用户名或昵称"
            allowClear
            enterButton
            onSearch={val => {
              setKeyword(val)
              setPage(1)
            }}
            className="filter-search"
          />
          <Button icon={<ReloadOutlined />} onClick={() => members.refetch()}>
            刷新
          </Button>
          <Select
            value={sortRule}
            style={{ width: 130 }}
            onChange={value => { setSortRule(value); setPage(1) }}
            options={[{ label: '添加日期', value: 'createTime' }, { label: '成员 ID', value: 'memberId' }]}
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
        <Table<MemberVo>
          rowKey="memberId"
          loading={members.isLoading}
          dataSource={members.data?.result || []}
          pagination={{
            current: page,
            pageSize: 20,
            total: members.data?.total || 0,
            onChange: p => setPage(p)
          }}
          scroll={{ x: 880 }}
          columns={[
            { title: 'ID', dataIndex: 'memberId', width: 80 },
            {
              title: '头像',
              width: 80,
              render: (_, row) => (
                <Image
                  src={row.avatar || ''}
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                  fallback="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
                  preview={false}
                />
              )
            },
            { title: '账号', dataIndex: 'username' },
            { title: '昵称', dataIndex: 'memberName' },
            { title: '邮箱', dataIndex: 'email' },
            {
              title: '角色',
              width: 140,
              render: (_, row) => {
                const role = row.role || 'GUEST'
                return <Tag color={roleColors[role] || 'default'}>{role}</Tag>
              }
            },
            {
              title: '操作',
              width: 100,
              fixed: 'right',
              render: (_, row) => (
                <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/members/${row.memberId}`)}>
                  详情
                </Button>
              )
            }
          ]}
        />
      </Card>
    </div>
  )
}
