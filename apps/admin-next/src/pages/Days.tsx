import { App, Button, Card, Popconfirm, Space, Table, Tag } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { activityApi } from '../api/modules'
import type { DayVo } from '../types'
import { text } from '../utils/i18n'
import SortableList from '../components/SortableList'

export default function Days() {
  const { id } = useParams()
  const activityId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const activity = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => activityApi.detail(activityId)
  })

  const days = useQuery({
    queryKey: ['activity-days', activityId],
    queryFn: () => activityApi.days(activityId)
  })

  const sortedDays = useMemo(
    () => [...(days.data || [])].sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0) || (a.day || 0) - (b.day || 0)),
    [days.data]
  )

  const sortMutation = useMutation({
    mutationFn: (items: DayVo[]) =>
      activityApi.sortDay(
        items
          .filter(item => item.id)
          .map((item, index) => ({ id: item.id!, sortIndex: index + 1 }))
      ),
    onSuccess: () => {
      message.success('天数排序已保存')
      queryClient.invalidateQueries({ queryKey: ['activity-days', activityId] })
    },
    onError: error => message.error(error.message)
  })

  const deleteDayMutation = useMutation({
    mutationFn: (day: number) => activityApi.deleteDay({ activityId, day }),
    onSuccess: () => {
      message.success('天数已删除')
      queryClient.invalidateQueries({ queryKey: ['activity-days', activityId] })
    },
    onError: error => message.error(error.message)
  })

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/activities')} />
            {activity.data ? `${text(activity.data.activityName)} - 天数管理` : '天数管理'}
          </h1>
          <p style={{ marginLeft: 32 }}>拖拽排序天数，点击编辑进入详情页设置天数资源并绑定视频。</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/activities/${activityId}/days/create`)}>
          添加天数
        </Button>
      </div>

      <Card>
        <SortableList
          items={sortedDays}
          getKey={item => `${item.activityId}-${item.day}`}
          onSort={items => sortMutation.mutate(items)}
          render={item => (
            <div className="day-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1677ff', width: 60 }}>Day {item.day}</div>
                {item.themeCover && <img src={item.themeCover} alt="cover" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{text(item.themeName) || '未命名主题'}</span>
                  <span style={{ fontSize: 12, color: '#888' }}>{text(item.themeDesc) || '暂无简介'}</span>
                </div>
              </div>
              <Space size="large">
                <Tag color={item.isPublic ? 'green' : 'default'}>{item.isPublic ? '公开显示' : '隐藏状态'}</Tag>
                <Space>
                  <Button type="default" size="small" icon={<EditOutlined />} onClick={() => navigate(`/activities/${activityId}/days/${item.day}/edit`)}>
                    编辑详情与视频
                  </Button>
                  <Popconfirm title="确认删除这个天数？" onConfirm={() => item.day && deleteDayMutation.mutate(item.day as number)}>
                    <Button danger size="small" icon={<DeleteOutlined />}>删除</Button>
                  </Popconfirm>
                </Space>
              </Space>
            </div>
          )}
        />
      </Card>
    </div>
  )
}
