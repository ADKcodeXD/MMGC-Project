import {
  AppstoreOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  PlaySquareOutlined,
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Avatar, Button, Drawer, Layout, Menu, Spin, Tag, theme } from 'antd'
import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'

const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Login = React.lazy(() => import('./pages/Login'))
const Activities = React.lazy(() => import('./pages/Activities'))
const Movies = React.lazy(() => import('./pages/Movies'))
const MovieEdit = React.lazy(() => import('./pages/MovieEdit'))
const CloudOps = React.lazy(() => import('./pages/CloudOps'))
const Sponsors = React.lazy(() => import('./pages/Sponsors'))
const SponsorDetail = React.lazy(() => import('./pages/SponsorDetail'))
const Members = React.lazy(() => import('./pages/Members'))
const MemberDetail = React.lazy(() => import('./pages/MemberDetail'))
const Statistics = React.lazy(() => import('./pages/Statistics'))
const Config = React.lazy(() => import('./pages/Config'))
const ActivityEdit = React.lazy(() => import('./pages/ActivityEdit'))
const Days = React.lazy(() => import('./pages/Days'))
const DayEdit = React.lazy(() => import('./pages/DayEdit'))

const { Header, Sider, Content } = Layout

const items = [
  { key: '/', icon: <DashboardOutlined />, label: '概览' },
  { key: '/activities', icon: <AppstoreOutlined />, label: '活动与天数' },
  { key: '/movies', icon: <PlaySquareOutlined />, label: '视频管理' },
  { key: '/sponsors', icon: <TrophyOutlined />, label: '赞助商' },
  { key: '/members', icon: <TeamOutlined />, label: '成员管理' },
  { key: '/statistics', icon: <TrophyOutlined />, label: '统计排行' },
  { key: '/cloud', icon: <CloudServerOutlined />, label: '云运维' },
  { key: '/config', icon: <SettingOutlined />, label: '全局配置' }
]

function Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const { token } = theme.useToken()
  const { user, clear } = useAuthStore()

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/activities')) return '/activities'
    if (location.pathname.startsWith('/movies')) return '/movies'
    if (location.pathname.startsWith('/sponsors')) return '/sponsors'
    if (location.pathname.startsWith('/members')) return '/members'
    if (location.pathname.startsWith('/statistics')) return '/statistics'
    if (location.pathname.startsWith('/cloud')) return '/cloud'
    if (location.pathname.startsWith('/config')) return '/config'
    return '/'
  }, [location.pathname])

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items}
      onClick={item => {
        navigate(item.key)
        setOpen(false)
      }}
    />
  )

  const roleColors: Record<string, string> = {
    ADMIN: 'red',
    SUBADMIN: 'orange',
    COMMITTER: 'blue',
    GROUPMEMBER: 'cyan',
    GUEST: 'default'
  }

  return (
    <Layout className="app-shell">
      <Sider className="desktop-sider" width={220} theme="light">
        <div className="brand">MMGC Ops</div>
        {menu}
      </Sider>
      <Layout className="main-panel">
        <Header className="topbar" style={{ background: token.colorBgContainer }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <Button className="mobile-menu" icon={<MenuOutlined />} onClick={() => setOpen(true)} />
            <div style={{ minWidth: 0 }}>
              <strong>MMGC Admin Next</strong>
              <span className="topbar-subtitle">活动、视频、云运维一体化管理</span>
            </div>
          </div>
          <div className="header-user">
            {user && (
              <>
                <Avatar src={user.avatar} icon={<UserOutlined />} />
                <span className="header-username">{user.memberName || user.username}</span>
                <Tag color={roleColors[user.role || 'GUEST']} style={{ margin: 0, marginRight: 8 }}>
                  {user.role || 'GUEST'}
                </Tag>
              </>
            )}
            <Button type="text" icon={<LogoutOutlined />} onClick={() => { clear(); navigate('/login') }}>退出</Button>
          </div>
        </Header>
        <Content className="content">
          <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}><Spin size="large" /></div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/activities/create" element={<ActivityEdit />} />
              <Route path="/activities/edit/:id" element={<ActivityEdit />} />
              <Route path="/activities/:id/days" element={<Days />} />
              <Route path="/activities/:id/days/create" element={<DayEdit />} />
              <Route path="/activities/:id/days/:day/edit" element={<DayEdit />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/create" element={<MovieEdit />} />
              <Route path="/movies/edit/:id" element={<MovieEdit />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/sponsors/:id" element={<SponsorDetail />} />
              <Route path="/members" element={<Members />} />
              <Route path="/members/:id" element={<MemberDetail />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/cloud" element={<CloudOps />} />
              <Route path="/config" element={<Config />} />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
      <Drawer title="MMGC Ops" placement="left" open={open} onClose={() => setOpen(false)} width={280}>
        {menu}
      </Drawer>
    </Layout>
  )
}

function RequireAuth() {
  const { token, fetchUser, user } = useAuthStore()

  useEffect(() => {
    if (token && !user) fetchUser()
  }, [token, user, fetchUser])

  return token ? <Shell /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Suspense fallback={<div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<RequireAuth />} />
      </Routes>
    </Suspense>
  )
}
