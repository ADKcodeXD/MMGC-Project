import { FormSchema } from '/@/components/Form/src/types/form'

const colProps = {
  span: 24,
}

export const configSchema: FormSchema[] = [
  {
    field: 'divider',
    component: 'Divider',
    label: '配置修改',
    helpMessage: '一些全局的系统设置',
    required: true,
    colProps,
  },
  {
    field: 'currentActivityId',
    component: 'InputTextArea',
    label: '当前实时活动',
    labelWidth: 100,
    helpMessage: '该配置为默认活动',
    slot: 'currentActivityId',
    colProps: {
      span: 11,
    },
    required: true,
  },
  {
    field: 'otherSettings',
    component: 'Switch',
    label: '统计界面背景',
    labelWidth: 100,
    slot: 'bgStatistics',
    helpMessage: '统计界面单独设置背景',
    colProps: {
      span: 12,
    },
  },
]
