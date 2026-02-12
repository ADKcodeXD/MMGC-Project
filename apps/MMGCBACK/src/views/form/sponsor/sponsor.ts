import { FormSchema } from '/@/components/Form'
const colProps = {
  span: 24,
}
export const sponsorSchema: FormSchema[] = [
  {
    field: 'divider',
    component: 'Divider',
    label: '赞助商信息录入',
    required: true,
    colProps,
  },
  {
    field: 'sponsorLogo',
    component: 'Upload',
    label: '赞助商logo',
    labelWidth: 300,
    subLabel: '上传活动的logo',
    helpMessage: '上传一张当前活动的logo',
    slot: 'sponsorLogo',
    required: true,
    colProps,
  },
  {
    field: 'sponsorName.cn',
    component: 'Input',
    label: '赞助商中文名',
    labelWidth: 100,
    colProps: {
      span: 12,
    },
    required: true,
  },
  {
    field: 'sponsorNameTranslate',
    component: 'Input',
    label: ' ',
    slot: 'sponsorNameTranslate',
    colProps,
  },
  {
    field: 'sponsorName.jp',
    component: 'Input',
    label: '赞助商日文名',
    labelWidth: 100,
    colProps: {
      offset: 1,
      span: 11,
    },
  },
  {
    field: 'sponsorName.en',
    component: 'Input',
    label: '赞助商英文名',
    labelWidth: 100,
    colProps: {
      span: 12,
    },
  },
  {
    field: 'sponsorDesc',
    component: 'Input',
    label: '赞助商简介',
    labelWidth: 100,
    slot: 'sponsorDesc',
    required: true,
    colProps,
  },
]
