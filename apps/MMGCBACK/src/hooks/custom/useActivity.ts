import { ActivityParams } from './../../api/activity/model/activityEntity'
import { onMounted, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from '../web/useMessage'
import { useGo } from '../web/usePage'
import { deleteActivity, getActivityDetail } from '/@/api/activity/activity'
import { ActivityVo } from '/@/api/activity/model/activityEntity'
import { updateActivity } from '/@/api/activity/activity'
import { FormSchema } from '/@/components/Form'

const colProps = {
  span: 24,
}

export const activityScheme: FormSchema[] = [
  {
    field: 'divider',
    component: 'Divider',
    label: '基础信息录入',
    helpMessage: '活动所必须的基础信息录入',
    required: true,
    colProps,
  },
  {
    field: 'activityCover',
    component: 'InputTextArea',
    label: '活动封面',
    labelWidth: 100,
    helpMessage: '请上传jpg|png|webp|格式 大小小于10MB',
    slot: 'activityCover',
    colProps: {
      span: 11,
    },
    required: true,
  },
  {
    field: 'activityLogo',
    component: 'Upload',
    label: '活动logo',
    labelWidth: 200,
    subLabel: '上传活动的logo',
    helpMessage: '上传一张当前活动的logo',
    slot: 'activityLogo',
    required: true,
    colProps: {
      flex: 1,
    },
  },
  {
    field: 'activityName.cn',
    component: 'Input',
    label: '活动名',
    subLabel: '(cn 中文名)',
    colProps,
    helpMessage: '活动名可支持国际化，你可以填写中英日语的活动名',
    componentProps: {
      placeholder: '填写你的活动名称',
    },
    required: true,
  },
  {
    field: 'activityNameTranslate',
    component: 'Input',
    label: ' ',
    slot: 'activityNameTranslate',
    colProps,
  },
  {
    field: 'activityName.jp',
    component: 'Input',
    label: '活动名',
    subLabel: '(jp 日文名)',
    colProps: {
      span: 12,
    },
    componentProps: {
      placeholder: '填写你的活动名称',
    },
  },
  {
    field: 'activityName.en',
    component: 'Input',
    label: '活动名',
    subLabel: '(en 英文名)',
    colProps: {
      span: 11,
      offset: 1,
    },
    componentProps: {
      placeholder: '填写活动的英文名称',
    },
  },
  {
    field: 'activityId',
    component: 'InputNumber',
    label: '活动Id',
    labelWidth: 200,
    subLabel: '活动的唯一id',
    colProps: {
      span: 14,
    },
    helpMessage: '你可以填写以年份来填写活动id(如2022)',
    componentProps: {
      placeholder: '2022',
    },
    rules: [
      {
        min: 1900,
        max: 2099,
        type: 'number',
        message: '请输入1900-2099的活动id',
      },
      {
        required: true,
        message: '请输入活动id',
      },
    ],
  },
  {
    field: 'days',
    component: 'InputNumber',
    label: '活动天数',
    subLabel: '活动天数',
    colProps: {
      flex: 1,
      offset: 1,
    },
    helpMessage: '设定该活动的天数(建议不填写，创建天数后自动增加)',
    componentProps: {
      placeholder: '5',
    },
    rules: [
      {
        min: 0,
        max: 50,
        type: 'number',
        message: '请不要输入太大的天数',
      },
    ],
  },
  {
    field: 'dateTime',
    component: 'RangePicker',
    label: '活动起止日期',
    colProps,
  },
  {
    field: 'activityBackgroundImg',
    component: 'InputTextArea',
    label: '活动背景图',
    labelWidth: 300,
    subLabel: '上传一张活动背景图',
    helpMessage: '可以将前台的背景设置为该图 *注意是全局背景',
    slot: 'activityBackgroundImg',
    colProps,
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '简介填写',
    helpMessage: '填写三语简介',
    required: true,
    colProps,
  },
  {
    field: 'desc',
    component: 'Input',
    label: '',
    labelWidth: 1,
    helpMessage: '可以填写三语的介绍,其中中文必填',
    slot: 'desc',
    colProps,
    rules: [
      {
        required: true,
        // @ts-ignore
        validator: async (rule, value) => {
          if (!value) {
            /* eslint-disable-next-line */
            return Promise.reject('值不能为空')
          }
          if (!value.cn) {
            /* eslint-disable-next-line */
            return Promise.reject('请至少输入中文简介')
          }
          return Promise.resolve()
        },
        trigger: 'change',
      },
    ],
  },
  {
    field: 'divider',
    component: 'Divider',
    label: 'staff录入',
    helpMessage: '填写相应的Staff人员',
    required: true,
    colProps,
  },
  {
    field: 'staff',
    component: 'Input',
    label: '活动组织人员',
    helpMessage: '添加活动的组织人员信息',
    colProps,
    slot: 'staff',
  },
  {
    field: 'sponsorId',
    component: 'ApiSelect',
    label: '赞助商选择',
    labelWidth: 100,
    helpMessage: '选择相应的赞助商，多选',
    colProps,
    slot: 'sponsorId',
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '详细规则填写',
    helpMessage: '填写详细的比赛规则 支持国际化',
    required: true,
    colProps,
  },
  {
    field: 'rules',
    component: 'Input',
    label: '',
    labelWidth: 1,
    helpMessage: '可以填写三语的详细规则',
    slot: 'rules',
    colProps,
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '时间以及其他信息填写',
    helpMessage: '填写一些其他信息，例如比赛详细的截稿日,开始日期',
    required: true,
    colProps,
  },
  {
    field: 'timesorother',
    component: 'Input',
    label: '',
    labelWidth: 1,
    helpMessage: '可以填写其他信息',
    slot: 'timesorother',
    colProps,
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '答疑FAQ',
    helpMessage: '填写答疑FAQ',
    required: true,
    colProps,
  },
  {
    field: 'faq',
    component: 'Input',
    label: '',
    labelWidth: 1,
    helpMessage: '可以填写答疑信息',
    slot: 'faq',
    colProps,
  },
]

export const dayScheme: FormSchema[] = [
  {
    field: 'themeCover',
    component: 'InputTextArea',
    label: '天数封面',
    helpMessage: '请上传jpg|png|webp|格式 大小小于5MB',
    slot: 'themeCover',
    colProps,
  },
  {
    field: 'day',
    component: 'InputNumber',
    label: '天数',
    colProps,
    required: true,
    slot: 'day',
  },
  {
    field: 'themeName.cn',
    component: 'Input',
    label: '主题名中文',
    colProps,
    required: true,
  },
  {
    field: 'themeNameTranslate',
    component: 'Input',
    label: ' ',
    slot: 'themeNameTranslate',
    colProps,
  },
  {
    field: 'themeName.en',
    component: 'Input',
    label: '主题名英文',
    colProps,
  },
  {
    field: 'themeName.jp',
    component: 'Input',
    label: '主题名日文',
    colProps,
  },
  {
    field: 'dayPollLink.bilibili',
    component: 'Input',
    label: '投票地址(Bilibili)',
    colProps,
    labelWidth: 150,
  },
  {
    field: 'dayPollLink.twitter',
    component: 'Input',
    label: '投票地址(Twitter)',
    colProps,
    labelWidth: 150,
  },
  {
    field: 'dayPollLink.personalWebsite',
    component: 'Input',
    label: '投票地址(自定义)',
    colProps,
    labelWidth: 150,
  },
  {
    field: 'themeDesc.cn',
    component: 'InputTextArea',
    label: '活动描述',
    colProps,
  },
  {
    field: 'themeDescTranslate',
    component: 'Input',
    label: ' ',
    slot: 'themeDescTranslate',
    colProps,
  },
  {
    field: 'themeDesc.en',
    component: 'InputTextArea',
    label: '描述英文',
    colProps,
  },
  {
    field: 'themeDesc.jp',
    component: 'InputTextArea',
    label: '描述日文',
    colProps,
  },
  {
    field: 'isPublic',
    component: 'Checkbox',
    label: '是否公开',
    colProps,
  },
]

export const activityUpdateScheme: FormSchema[] = [
  {
    field: 'activityCover',
    component: 'InputTextArea',
    label: '活动封面',
    labelWidth: 100,
    helpMessage: '请上传jpg|png|webp|格式 大小小于10MB',
    slot: 'activityCover',
    colProps: {
      span: 11,
    },
    required: true,
  },
  {
    field: 'activityLogo',
    component: 'Upload',
    label: '活动logo',
    labelWidth: 200,
    subLabel: '上传活动的logo',
    helpMessage: '上传一张当前活动的logo',
    slot: 'activityLogo',
    required: true,
    colProps: {
      flex: 1,
    },
  },
  {
    field: 'activityName.cn',
    component: 'Input',
    label: '活动名',
    subLabel: '(cn 中文名)',
    colProps,
    helpMessage: '活动名可支持国际化，你可以填写中英日语的活动名',
    componentProps: {
      placeholder: '填写你的活动名称',
    },
    required: true,
  },
  {
    field: 'activityNameTranslate',
    component: 'Input',
    label: ' ',
    slot: 'activityNameTranslate',
    colProps,
  },
  {
    field: 'activityName.jp',
    component: 'Input',
    label: '活动名',
    subLabel: '(jp 日文名)',
    colProps: {
      span: 12,
    },
    componentProps: {
      placeholder: '填写你的活动名称',
    },
  },
  {
    field: 'activityName.en',
    component: 'Input',
    label: '活动名',
    subLabel: '(en 英文名)',
    colProps: {
      span: 11,
      offset: 1,
    },
    componentProps: {
      placeholder: '填写活动的英文名称',
    },
  },
  {
    field: 'days',
    component: 'InputNumber',
    label: '活动天数',
    subLabel: '活动天数',
    colProps: {
      span: 4,
    },
    helpMessage: '设定该活动的天数(建议不填写，创建天数后自动增加)',
    componentProps: {
      placeholder: '5',
    },
    rules: [
      {
        min: 0,
        max: 50,
        type: 'number',
        message: '请不要输入太大的天数',
      },
    ],
  },
  {
    field: 'dateTime',
    component: 'RangePicker',
    label: '活动起止日期',
    colProps: {
      span: 8,
      offset: 1,
    },
  },
  {
    field: 'activityBackgroundImg',
    component: 'InputTextArea',
    label: '活动背景图',
    labelWidth: 300,
    subLabel: '上传一张活动背景图',
    helpMessage: '可以将前台的背景设置为该图 *注意是全局背景',
    slot: 'activityBackgroundImg',
    colProps,
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '简介填写',
    helpMessage: '填写三语简介',
    required: true,
    colProps,
  },
  {
    field: 'desc',
    component: 'Input',
    label: '',
    labelWidth: 1,
    helpMessage: '可以填写三语的介绍,其中中文必填',
    slot: 'desc',
    colProps,
    rules: [
      {
        required: true,
        // @ts-ignore
        validator: async (rule, value) => {
          if (!value) {
            /* eslint-disable-next-line */
            return Promise.reject('值不能为空')
          }
          if (!value.cn) {
            /* eslint-disable-next-line */
            return Promise.reject('请至少输入中文简介')
          }
          return Promise.resolve()
        },
        trigger: 'change',
      },
    ],
  },
  {
    field: 'divider',
    component: 'Divider',
    label: 'staff录入',
    helpMessage: '填写相应的Staff人员',
    required: true,
    colProps,
  },
  {
    field: 'staff',
    component: 'Input',
    label: '活动组织人员',
    helpMessage: '添加活动的组织人员信息',
    colProps,
    slot: 'staff',
  },
  {
    field: 'sponsorId',
    component: 'ApiSelect',
    label: '赞助商选择',
    labelWidth: 100,
    helpMessage: '选择相应的赞助商，多选',
    colProps,
    slot: 'sponsorId',
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '详细规则填写',
    helpMessage: '填写详细的比赛规则 支持国际化',
    required: true,
    colProps,
  },
  {
    field: 'rules',
    component: 'Input',
    label: '',
    labelWidth: 1,
    helpMessage: '可以填写三语的详细规则',
    slot: 'rules',
    colProps,
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '时间以及其他信息填写',
    helpMessage: '填写一些其他信息，例如比赛详细的截稿日,开始日期',
    required: true,
    colProps,
  },
  {
    field: 'timesorother',
    component: 'Input',
    label: '',
    labelWidth: 1,
    helpMessage: '可以填写其他信息',
    slot: 'timesorother',
    colProps,
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '答疑FAQ',
    helpMessage: '填写答疑FAQ',
    required: true,
    colProps,
  },
  {
    field: 'faq',
    component: 'Input',
    label: '',
    labelWidth: 1,
    helpMessage: '可以填写答疑信息',
    slot: 'faq',
    colProps,
  },
  {
    field: 'welcomePageBackgroundVideo',
    component: 'Input',
    label: '欢迎页背景视频',
    helpMessage: '输入视频的直链地址',
    colProps,
    slot: 'welcomePageBackgroundVideo',
  },
]

export const useChangeTinyI18n = (
  getFieldsValue: Function,
  setFieldsValue: Function,
  key: string,
) => {
  const changeCn = (val: string) => {
    const origin = getFieldsValue()[key]
    setFieldsValue({
      [key]: Object.assign({}, origin, { cn: val }),
    })
  }

  const changeJp = (val: string) => {
    const origin = getFieldsValue()[key]
    setFieldsValue({
      [key]: Object.assign({}, origin, { jp: val }),
    })
  }

  const changeEn = (val: string) => {
    const origin = getFieldsValue()[key]
    setFieldsValue({
      [key]: Object.assign({}, origin, { en: val }),
    })
  }

  /** 批量更新 en/jp，避免连续调用时的竞态问题 */
  const changeI18n = (val: Partial<I18N>) => {
    const origin = getFieldsValue()[key]
    setFieldsValue({
      [key]: Object.assign({}, origin, val),
    })
  }

  return {
    changeCn,
    changeEn,
    changeJp,
    changeI18n,
  }
}

export const useActivityDetail = (
  setFieldsValue: Function,
  validate: Function,
  getFieldsValue: Function,
  setProps: Function,
) => {
  const isEdit = ref(false)
  const route = useRoute()
  const activityId = parseInt(route.params?.id.toString())
  const go = useGo()
  const activityKey = ref('activity')
  const { createMessage } = useMessage()
  const activityData = ref<ActivityVo>()
  const goBack = () => {
    go('/management/activity')
  }
  const getDetail = async (activityId: number) => {
    const { data } = await getActivityDetail(activityId)
    activityData.value = data as ActivityVo
  }
  const updateActivityFn = async () => {
    await validate()
    const params = getFieldsValue()
    Object.assign(activityData.value || {}, params)
    await updateActivity(activityData.value as ActivityParams)
    createMessage.success('修改成功')
    isEdit.value = false
    await getDetail(activityId)
    setFieldsValue(activityData.value)
  }

  const deleteActivityFn = async () => {
    await deleteActivity(activityData.value!.activityId)
    createMessage.success('删除成功')
    go('/management/activity')
  }

  onMounted(async () => {
    await getDetail(activityId)
    setFieldsValue(activityData.value)
    await setFieldsValue({
      dateTime: [activityData.value?.startTime, activityData.value?.endTime],
    })
  })
  watchEffect(() => {
    if (!isEdit.value) {
      setFieldsValue(activityData.value)
    }
    setProps({ disabled: !isEdit.value })
  })
  return {
    getDetail,
    isEdit,
    goBack,
    activityData,
    activityKey,
    activityId,
    updateActivityFn,
    deleteActivityFn,
  }
}
