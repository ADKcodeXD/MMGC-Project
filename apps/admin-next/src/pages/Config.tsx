import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Card, Form, Input, Select, Switch } from 'antd'
import { useEffect } from 'react'
import { activityApi, configApi } from '../api/modules'
import QiniuUpload from '../components/QiniuUpload'
import type { SysConfig } from '../types'
import { text } from '../utils/i18n'

type ConfigForm = Omit<SysConfig, 'otherSettings'> & {
  bgStatistics?: string
  allSiteVideoDisabled?: boolean
  otherSettings?: string
}

function parseOtherSettings(value?: string) {
  if (!value) return {}
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

export default function Config() {
  const [form] = Form.useForm<ConfigForm>()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const activities = useQuery({
    queryKey: ['activity-options'],
    queryFn: () => activityApi.list({ page: 1, pageSize: 100, sortRule: 'createTime' })
  })

  const config = useQuery({
    queryKey: ['sys-config'],
    queryFn: () => configApi.get()
  })

  useEffect(() => {
    if (config.data) {
      const otherSettings = parseOtherSettings(config.data.otherSettings)
      form.setFieldsValue({
        currentActivityId: config.data.currentActivityId,
        enableWatermark: config.data.enableWatermark ?? false,
        isVideoPlay: config.data.isVideoPlay ?? true,
        skin: config.data.skin || '',
        bgStatistics: otherSettings.bgStatistics || '',
        allSiteVideoDisabled: Boolean(otherSettings.allSiteVideoDisabled),
        otherSettings: config.data.otherSettings || '{}'
      })
    }
  }, [config.data, form])

  const saveMutation = useMutation({
    mutationFn: (values: ConfigForm) => {
      const parsed = parseOtherSettings(values.otherSettings)
      const payload: SysConfig = {
        currentActivityId: values.currentActivityId ? Number(values.currentActivityId) : undefined,
        enableWatermark: values.enableWatermark,
        isVideoPlay: values.allSiteVideoDisabled ? false : values.isVideoPlay,
        skin: values.skin,
        otherSettings: JSON.stringify({
          ...parsed,
          bgStatistics: values.bgStatistics || '',
          allSiteVideoDisabled: Boolean(values.allSiteVideoDisabled),
          cdnBlockPlan: values.allSiteVideoDisabled
            ? {
                domain: 'assets.mirai-mad.com',
                allowOnly: ['localhost', '127.0.0.1', '::1'],
                status: 'pending-backend-qiniu-cdn-api'
              }
            : null
        })
      }
      return configApi.update(payload)
    },
    onSuccess: () => {
      message.success('全局配置已保存')
      queryClient.invalidateQueries({ queryKey: ['sys-config'] })
    },
    onError: error => message.error(error.message)
  })

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>系统配置修改</h1>
          <p>维护默认活动、播放开关、水印、历史统计背景和全站视频禁用策略。</p>
        </div>
      </div>

      <Card loading={config.isLoading} style={{ maxWidth: 820 }}>
        <Form<ConfigForm> form={form} layout="vertical" onFinish={saveMutation.mutate}>
          <Form.Item name="currentActivityId" label="当前实时活动" extra="前台默认展示的活动">
            <Select
              allowClear
              showSearch
              placeholder="选择活动"
              optionFilterProp="label"
              options={(activities.data?.result || []).map(item => ({ label: `${item.activityId} - ${text(item.activityName)}`, value: item.activityId }))}
            />
          </Form.Item>

          <Form.Item name="bgStatistics" label="历史数据统计背景" extra="旧后台字段：otherSettings.bgStatistics">
            <Input placeholder="https://assets.mirai-mad.com/..." />
          </Form.Item>
          <Form.Item name="bgStatistics" noStyle>
            <QiniuUpload kind="image" accept="image/png,image/jpeg,image/webp,image/gif" />
          </Form.Item>

          <Form.Item name="enableWatermark" label="前端视频水印" valuePropName="checked" style={{ marginTop: 24 }}>
            <Switch />
          </Form.Item>

          <Form.Item name="isVideoPlay" label="前端视频播放开关" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="allSiteVideoDisabled" label="全站视频禁用" valuePropName="checked" extra="保存后会同时关闭前端播放开关，并写入 CDN 拦截计划到 otherSettings。">
            <Switch />
          </Form.Item>

          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
            message="CDN 白名单拦截说明"
            description="将 assets.mirai-mad.com 仅允许 localhost 访问会拦截该域名下全部资源，不只是视频。当前配置只保存策略意图；真正下发七牛 CDN 白名单仍需要后端接入七牛 CDN 配置 API，并做二次确认、操作审计和回滚。"
          />

          <Form.Item name="skin" label="站点皮肤 / 主题标识">
            <Input placeholder="可选，保留旧后台 skin 字段" />
          </Form.Item>

          <Form.Item name="otherSettings" label="其他配置 JSON">
            <Input.TextArea rows={6} placeholder='{"bgStatistics": "..."}' />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={saveMutation.isPending} size="large" style={{ marginTop: 16, minWidth: 150 }}>
            提交配置
          </Button>
        </Form>
      </Card>
    </div>
  )
}
