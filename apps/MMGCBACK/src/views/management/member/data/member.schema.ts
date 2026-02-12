import { FormSchema } from '/@/components/Form'
import { ROLE } from '/@/enums/roleEnum'
const colProps = {
  span: 12,
}

export const memberScheme: FormSchema[] = [
  {
    field: 'divider',
    component: 'Divider',
    label: '用户信息',
    required: true,
    colProps: {
      span: 24,
    },
  },
  {
    field: 'avatar',
    component: 'InputTextArea',
    label: '头像',
    colProps: {
      span: 24,
    },
    slot: 'avatar',
  },
  {
    field: 'memberName',
    component: 'Input',
    label: '用户昵称',
    colProps,
    required: true,
  },
  {
    field: 'username',
    component: 'Input',
    label: '用户名',
    colProps: {
      span: 11,
      offset: 1,
    },
    required: true,
  },
  {
    field: 'email',
    component: 'Input',
    label: '邮箱',
    colProps,
    rules: [
      {
        pattern: /^[a-zA-Z0-9_.]+@[a-zA-Z0-9-]+[.a-zA-Z]+$/,
        message: '请输入正确的邮箱',
      },
    ],
  },
  {
    field: 'role',
    component: 'Select',
    label: '角色',
    colProps: {
      span: 11,
      offset: 1,
    },
    componentProps: {
      options: [
        {
          label: '管理员',
          value: ROLE.ADMIN,
          disabled: true,
        },
        {
          label: '子级管理员',
          value: ROLE.SUBADMIN,
        },
        {
          label: '组内成员',
          value: ROLE.GROUPMEMBER,
        },
        {
          label: '贡献者',
          value: ROLE.COMMITTER,
        },
        {
          label: '来宾',
          value: ROLE.GUEST,
        },
      ],
    },
  },
  {
    field: 'gender',
    component: 'RadioGroup',
    label: '性别',
    colProps,
    componentProps: {
      options: [
        {
          label: '男',
          value: 1,
        },
        {
          label: '女',
          value: 0,
        },
      ],
    },
  },
  {
    field: 'desc',
    component: 'InputTextArea',
    label: '简介',
    colProps: {
      span: 24,
    },
  },
  {
    field: 'password',
    component: 'InputPassword',
    helpMessage: '请注意，密码只能单向修改，不能够直接查看',
    label: '密码修改',
    colProps: {
      span: 24,
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '用户社交媒体',
    colProps: {
      span: 24,
    },
  },
  {
    field: 'snsSite.bilibili',
    component: 'Input',
    label: 'bilibili',
    colProps: {
      span: 8,
    },
  },
  {
    field: 'snsSite.twitter',
    component: 'Input',
    label: 'twitter',
    colProps: {
      span: 7,
      offset: 1,
    },
  },
  {
    field: 'snsSite.niconico',
    component: 'Input',
    label: 'niconico',
    colProps: {
      span: 7,
      offset: 1,
    },
  },
  {
    field: 'snsSite.youtube',
    component: 'Input',
    label: 'youtube',
    colProps: {
      span: 8,
    },
  },
  {
    field: 'snsSite.personalWebsite',
    component: 'Input',
    label: '个人网站',
    colProps: {
      span: 7,
      offset: 1,
    },
  },
]
