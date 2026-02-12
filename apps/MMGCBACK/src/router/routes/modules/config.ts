import type { AppRouteModule } from '/@/router/types'

import { LAYOUT } from '/@/router/constant'

const management: AppRouteModule = {
  path: '/config',
  name: 'ConfigSetting',
  component: LAYOUT,
  redirect: '/config/index',
  meta: {
    orderNo: 30,
    icon: 'ion:settings',
    title: '配置管理',
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'ConfigIndex',
      component: () => import('/@/views/config/index.vue'),
      meta: {
        title: '配置',
        hideMenu: true,
      },
    },
  ],
}

export default management
