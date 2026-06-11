import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/modules'
import { useAuthStore } from '../store/auth'

type LoginForm = {
  username: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const setToken = useAuthStore().setToken
  const { message } = App.useApp()
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: data => {
      const token = typeof data === 'string' ? data : data?.token || data?.accessToken
      if (!token) {
        message.warning('登录成功但未返回 token，请检查接口字段')
        return
      }
      setToken(token)
      navigate('/', { replace: true })
    },
    onError: error => message.error(error.message)
  })

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-title">MMGC Ops</div>
        <Form<LoginForm> layout="vertical" onFinish={values => mutation.mutate(values)}>
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={mutation.isPending}>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  )
}
