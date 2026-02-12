import { BasicColumn } from '/@/components/Table'
import { FormSchema } from '/@/components/Table'
import { ROLE } from '/@/enums/roleEnum'
export const columns: BasicColumn[] = [
  {
    title: '用户id',
    dataIndex: 'memberId',
    width: 60,
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    width: 50,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    width: 100,
  },
  {
    title: '昵称',
    dataIndex: 'memberName',
    width: 100,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: 120,
  },
  {
    title: '性别',
    dataIndex: 'gender',
    width: 50,
    slots: { title: 'gender', customRender: 'genderContent' },
  },
  {
    title: '角色',
    dataIndex: 'status',
    width: 55,
    slots: { title: 'role', customRender: 'roleContent' },
  },
  {
    title: '个人简介',
    dataIndex: 'desc',
    width: 120,
  },
  {
    title: '社交媒体',
    dataIndex: 'snsSite',
    width: 120,
    slots: { title: 'sns', customRender: 'snsContent' },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 120,
  },
]

export const searchFormSchema: FormSchema[] = [
  {
    field: 'keyword',
    label: '成员昵称',
    component: 'Input',
    colProps: { span: 8 },
  },
]

export const formSchema: FormSchema[] = [
  {
    field: 'memberName',
    label: '用户昵称',
    component: 'Input',
    required: true,
  },
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    required: true,
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    required: true,
  },
  {
    field: 'role',
    label: '角色',
    component: 'Select',
    componentProps: {
      options: [
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
]
