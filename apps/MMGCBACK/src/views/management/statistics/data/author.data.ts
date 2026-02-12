import { FormSchema } from '/@/components/Table'

export const formSchema: FormSchema[] = [
  {
    field: 'authorName',
    label: '昵称',
    component: 'Input',
    required: true,
  },
  {
    field: 'authorAvatar',
    label: '头像',
    component: 'Input',
    slot: 'avatar',
  },
  {
    field: 'participateMacthes',
    label: '参加年份',
    component: 'Input',
    slot: 'matches',
  },
  {
    field: 'consecutiveParticipateTimes',
    label: '连续参加次数',
    component: 'Input',
  },
  {
    field: 'authorType',
    label: '级别',
    component: 'Select',
    componentProps: {
      options: [
        {
          label: '白金作者',
          value: 'platinum',
        },
        {
          label: '黄金作者',
          value: 'gold',
        },
        {
          label: '不指定',
          value: 'normal',
        },
      ],
    },
  },
]
