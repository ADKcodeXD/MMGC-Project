import type { AppRouteModule } from '/@/router/types'

import { LAYOUT } from '/@/router/constant'
import { RoleEnum } from '/@/enums/roleEnum'

const form: AppRouteModule = {
  path: '/form',
  name: 'Form',
  component: LAYOUT,
  redirect: '/form/activity',
  meta: {
    orderNo: 25,
    icon: 'ion:add-circle-outline',
    title: '录入数据',
  },
  children: [
    {
      path: 'activity',
      name: 'ActivityInput',
      component: () => import('/@/views/form/activity/index.vue'),
      meta: {
        title: '新增活动',
        icon: 'ant-design:appstore-add-outlined',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN],
      },
    },
    {
      path: 'movie',
      name: 'MovieInput',
      component: () => import('/@/views/form/movie/index.vue'),
      meta: {
        title: '视频投稿',
        icon: 'ant-design:video-camera-add-outlined',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN, RoleEnum.COMMITTER, RoleEnum.GROUPMEMBER],
      },
    },
    {
      path: 'sponsor',
      name: 'SponsorInput',
      component: () => import('/@/views/form/sponsor/index.vue'),
      meta: {
        title: '录入赞助商',
        icon: 'ant-design:bulb-outlined',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN, RoleEnum.COMMITTER, RoleEnum.GROUPMEMBER],
      },
    },
  ],
}

export default form
