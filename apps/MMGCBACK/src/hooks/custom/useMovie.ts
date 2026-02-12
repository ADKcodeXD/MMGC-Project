import { reactive } from 'vue'
import { getActivityList, getDays } from '/@/api/activity/activity'
import { getUserList } from '/@/api/member/member'
import { DescItem } from '/@/components/Description'
export const useVideoI18n = (setFieldsValue: Function, key = 'moviePlaylink') => {
  const source = [
    {
      key: 'cn',
      label: '中文版本(必须)',
      require: true,
    },
    {
      key: 'en',
      label: '英文版本',
    },
    {
      key: 'jp',
      label: '日文版本',
    },
  ]
  const changeVideo = async (val) => {
    Object.assign(videoParams, val)
    await setFieldsValue({
      [key]: videoParams,
    })
  }
  const videoParams = reactive<I18N>({
    cn: '',
    en: undefined,
    jp: undefined,
  })
  return {
    videoParams,
    changeVideo,
    source,
  }
}

export const useSelectRemote = () => {
  const customActivityKey = {
    value: 'activityId',
    label: 'activityName.cn',
    image: 'activityCover',
  }
  const customMemberKey = {
    value: 'memberId',
    label: 'memberName',
    image: 'avatar',
  }
  const customDayKey = {
    value: 'day',
    label: 'themeName.cn',
    image: 'themeCover',
  }
  return {
    customMemberKey,
    customActivityKey,
    customDayKey,
    getActivityList,
    getUserList,
    getDays,
  }
}

export const useMovieDetail = () => {
  const schema: DescItem[] = [
    {
      field: 'createTime',
      label: '创建时间',
    },
    {
      field: 'likeNums',
      label: '点赞数',
    },
    {
      field: 'viewNums',
      label: '观看次数',
    },
    {
      field: 'pollNums',
      label: '投票数',
    },
    {
      field: 'commentNums',
      label: '评论数',
    },
    {
      field: 'isActivityMovie',
      label: '是否活动作品',
      render(val) {
        if (val) {
          return '是'
        }
        return '否'
      },
    },
    {
      field: 'isPublic',
      label: '是否公开',
      render(val) {
        if (val) {
          return '是'
        }
        return '否'
      },
    },
  ]

  return {
    schema,
  }
}
