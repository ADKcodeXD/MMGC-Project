import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Avatar, Button, Card, Col, Form, Input, Popconfirm, Radio, Row, Select, Space, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { memberApi } from '../api/modules'
import R2Upload from '../components/R2Upload'
import type { MemberVo } from '../types'

const roleOptions = [
  { label: 'ADMIN 超级管理员', value: 'ADMIN' },
  { label: 'SUBADMIN 子管理员', value: 'SUBADMIN' },
  { label: 'COMMITTER 贡献者', value: 'COMMITTER' },
  { label: 'GROUPMEMBER 组成员', value: 'GROUPMEMBER' },
  { label: 'GUEST 普通访客', value: 'GUEST' }
]

export default function MemberDetail() {
  const { id } = useParams()
  const memberId = Number(id)
  const [editing, setEditing] = useState(false)
  const [form] = Form.useForm<MemberVo>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const watchedAvatar = Form.useWatch('avatar', form)

  const member = useQuery({
    queryKey: ['member-detail', memberId],
    queryFn: () => memberApi.detail(memberId),
    enabled: Number.isFinite(memberId)
  })

  useEffect(() => {
    if (member.data) {
      form.setFieldsValue({ ...member.data, password: '' })
    }
  }, [form, member.data])

  const updateMutation = useMutation({
    mutationFn: (values: MemberVo) => {
      const payload = { ...values, memberId }
      if (!payload.password) delete payload.password
      return memberApi.update(payload)
    },
    onSuccess: () => {
      message.success('成员已更新')
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['member-detail', memberId] })
    },
    onError: error => message.error(error.message)
  })

  const removeMutation = useMutation({
    mutationFn: () => memberApi.batchDelete([memberId]),
    onSuccess: () => {
      message.success('成员已删除')
      queryClient.invalidateQueries({ queryKey: ['members'] })
      navigate('/members')
    },
    onError: error => message.error(error.message)
  })

  if (member.isLoading) {
    return <Spin />
  }

  const avatar = watchedAvatar || member.data?.avatar

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/members')} />
            {member.data?.memberName || member.data?.username || '成员详情'}
          </h1>
          <p style={{ marginLeft: 32 }}>查看并维护成员资料、权限角色、头像与社交链接。</p>
        </div>
        <Space>
          {editing ? (
            <>
              <Button onClick={() => {
                form.setFieldsValue({ ...(member.data || {}), password: '' })
                setEditing(false)
              }}>
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
          <Popconfirm title="确认删除此成员？" onConfirm={() => removeMutation.mutate()}>
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Form<MemberVo> form={form} layout="vertical" disabled={!editing} onFinish={updateMutation.mutate}>
        <Row gutter={24}>
          <Col span={24} lg={8}>
            <Card title="头像与身份">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <Avatar src={avatar} size={72} />
                <div>
                  <strong>{member.data?.username}</strong>
                  <div style={{ color: '#6b7280' }}>{member.data?.email || '未填写邮箱'}</div>
                </div>
              </div>
              <Form.Item name="avatar" label="头像 URL">
                <Input />
              </Form.Item>
              <Form.Item name="avatar" noStyle>
                <R2Upload kind="image" accept="image/png,image/jpeg,image/webp,image/gif" />
              </Form.Item>
              <Form.Item name="role" label="角色" rules={[{ required: true }]} style={{ marginTop: 16 }}>
                <Select options={roleOptions} />
              </Form.Item>
              <Form.Item name="gender" label="性别">
                <Radio.Group>
                  <Radio value={1}>男</Radio>
                  <Radio value={0}>女</Radio>
                  <Radio value={2}>其他</Radio>
                </Radio.Group>
              </Form.Item>
            </Card>
          </Col>

          <Col span={24} lg={16}>
            <Card title="基础资料" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={24} md={12}>
                  <Form.Item name="memberName" label="昵称" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item name="username" label="账号" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item name="email" label="邮箱">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item name="password" label="重置密码">
                    <Input.Password placeholder="留空则不修改密码" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="desc" label="签名">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Card>

            <Card title="社交链接">
              <Row gutter={16}>
                <Col span={24} md={12}><Form.Item name={['snsSite', 'bilibili']} label="bilibili"><Input /></Form.Item></Col>
                <Col span={24} md={12}><Form.Item name={['snsSite', 'youtube']} label="youtube"><Input /></Form.Item></Col>
                <Col span={24} md={12}><Form.Item name={['snsSite', 'twitter']} label="twitter"><Input /></Form.Item></Col>
                <Col span={24} md={12}><Form.Item name={['snsSite', 'niconico']} label="niconico"><Input /></Form.Item></Col>
                <Col span={24} md={12}><Form.Item name={['snsSite', 'personalWebsite']} label="个人网站 / 其他"><Input /></Form.Item></Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
