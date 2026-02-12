import type { AppRouteModule } from '/@/router/types'
import { RoleEnum } from '/@/enums/roleEnum'
import { LAYOUT } from '/@/router/constant'

const management: AppRouteModule = {
  path: '/management',
  name: 'Management',
  component: LAYOUT,
  redirect: '/management/activity',
  meta: {
    orderNo: 20,
    icon: 'ion:md-radio-button-on',
    title: '管理面板',
  },
  children: [
    {
      path: 'activity',
      name: 'Activity',
      component: () => import('/@/views/management/activity/index.vue'),
      meta: {
        icon: 'ant-design:schedule-filled',
        title: '活动管理',
      },
    },
    {
      path: 'member',
      name: 'Member',
      component: () => import('/@/views/management/member/index.vue'),
      meta: {
        icon: 'ant-design:usergroup-add-outlined',
        title: '用户管理',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN],
      },
    },
    {
      path: 'movie',
      name: 'Movie',
      component: () => import('/@/views/management/movie/index.vue'),
      meta: {
        icon: 'ant-design:video-camera-filled',
        title: '视频管理',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN, RoleEnum.COMMITTER, RoleEnum.GROUPMEMBER],
      },
    },
    {
      path: 'sponsor',
      name: 'Sponsor',
      component: () => import('/@/views/management/sponsor/index.vue'),
      meta: {
        icon: 'ant-design:money-collect-outlined',
        title: '赞助商管理',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN, RoleEnum.COMMITTER, RoleEnum.GROUPMEMBER],
      },
    },
    {
      path: 'statistics',
      name: 'Statistics',
      component: () => import('/@/views/management/statistics/index.vue'),
      meta: {
        icon: 'ant-design:bar-chart-outlined',
        title: '历年数据统计',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN, RoleEnum.COMMITTER, RoleEnum.GROUPMEMBER],
      },
    },
    {
      path: 'member/:id',
      name: 'MemberDetail',
      meta: {
        hideMenu: true,
        title: '用户详情',
        ignoreKeepAlive: true,
        showMenu: false,
        currentActiveMenu: '/management/member',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN],
      },
      component: () => import('/@/views/management/member/MemberDetail.vue'),
    },
    {
      path: 'activity/:id',
      name: 'ActivityDetail',
      meta: {
        hideMenu: true,
        title: '活动详情',
        ignoreKeepAlive: true,
        showMenu: false,
        currentActiveMenu: '/management/activity',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN, RoleEnum.COMMITTER, RoleEnum.GROUPMEMBER],
      },
      component: () => import('/@/views/management/activity/ActivityDetail.vue'),
    },
    {
      path: 'activity/:id/:day',
      name: 'DayVideosDetail',
      meta: {
        hideMenu: true,
        title: '天数详情',
        ignoreKeepAlive: true,
        showMenu: false,
        currentActiveMenu: '/management/activity',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN, RoleEnum.COMMITTER, RoleEnum.GROUPMEMBER],
      },
      component: () => import('/@/views/management/activity/DayVideosDetail.vue'),
    },
    {
      path: 'movie/:id',
      name: 'MovieDetail',
      meta: {
        hideMenu: true,
        title: '视频详情',
        ignoreKeepAlive: true,
        showMenu: false,
        currentActiveMenu: '/management/movie',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN, RoleEnum.COMMITTER, RoleEnum.GROUPMEMBER],
      },
      component: () => import('/@/views/management/movie/MovieDetail.vue'),
    },
    {
      path: 'sponsor/:id',
      name: 'SponsorDetail',
      component: () => import('/@/views/management/sponsor/SponsorDetail.vue'),
      meta: {
        hideMenu: true,
        title: '赞助商详情',
        ignoreKeepAlive: true,
        showMenu: false,
        currentActiveMenu: '/management/sponsor',
        roles: [RoleEnum.ADMIN, RoleEnum.SUBADMIN, RoleEnum.COMMITTER, RoleEnum.GROUPMEMBER],
      },
    },
  ],
}

export default management
