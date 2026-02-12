import { FormSchema } from '/@/components/Form'
const colProps = {
  span: 24,
}
export const step1Schemas: FormSchema[] = [
  {
    field: 'divider',
    component: 'Divider',
    label: '基本信息录入',
    helpMessage: '投稿所必须的基本信息',
    required: true,
    colProps,
  },
  {
    field: 'movieCover',
    component: 'Upload',
    label: '封面',
    required: true,
    helpMessage: '请上传 jpg|png|webp|gif 格式 大小小于10MB',
    colProps,
    slot: 'movieCover',
  },
  {
    field: 'movieName.cn',
    component: 'Input',
    label: '作品名(CN)',
    required: true,
    colProps,
  },
  {
    field: 'movieNameTranslate',
    component: 'Input',
    label: ' ',
    slot: 'movieNameTranslate',
    colProps,
  },
  {
    field: 'movieName.jp',
    component: 'Input',
    label: '作品名(JP)',
    colProps: {
      span: 12,
    },
    componentProps: {
      placeholder: '填写作品的日文名',
    },
  },
  {
    field: 'movieName.en',
    component: 'Input',
    label: '作品名(EN)',
    colProps: {
      span: 12,
    },
    componentProps: {
      placeholder: '填写作品的英文名',
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '填写简介',
    helpMessage: '支持简介国际化',
    required: true,
    colProps,
  },
  {
    field: 'movieDesc.cn',
    component: 'InputTextArea',
    label: '作品简介(CN)',
    labelWidth: 150,
    helpMessage: '填写作品的简介，支持国际化',
    colProps,
    required: true,
    componentProps: {
      placeholder: '填写作品的中文简介信息',
    },
  },
  {
    field: 'movieDescTranslate',
    component: 'Input',
    label: ' ',
    slot: 'movieDescTranslate',
    colProps,
  },
  {
    field: 'movieDesc.jp',
    component: 'InputTextArea',
    label: '作品简介(JP)',
    labelWidth: 150,
    helpMessage: '请填写日文简介',
    colProps,
    componentProps: {
      placeholder: '请填写日文简介',
    },
  },
  {
    field: 'movieDesc.en',
    component: 'InputTextArea',
    label: '作品简介(EN)',
    labelWidth: 150,
    helpMessage: '请填写英文简介',
    colProps,
    componentProps: {
      placeholder: '请填写英文简介',
    },
  },
]

export const step2Schemas: FormSchema[] = [
  {
    field: 'divider',
    component: 'Divider',
    label: '视频上传',
    helpMessage: '上传视频以及视频的下载链接等',
    required: true,
    colProps,
  },
  {
    field: 'moviePlaylink',
    component: 'Upload',
    label: '视频上传',
    helpMessage:
      '请上传 mp4 格式 大小最大限制为150MB 支持多播放源(必须上传中文版本 该中文版本在有多版本的情况下会呈现为中文版本 如若没有其他版本 则该版本为默认版本 无其他版本)',
    colProps,
    slot: 'moviePlaylink',
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '视频播放链接',
    helpMessage: '视频在各大媒体网站的公开播放链接',
    colProps,
  },
  {
    field: 'movieLink.bilibili',
    component: 'Input',
    label: 'bilibili',
    helpMessage: 'bilibili频道发布的视频链接',
    colProps: {
      span: 8,
    },
  },
  {
    field: 'movieLink.youtube',
    component: 'Input',
    label: 'youtube',
    helpMessage: 'youtube播放链接',
    colProps: {
      span: 7,
      offset: 1,
    },
  },
  {
    field: 'movieLink.niconico',
    component: 'Input',
    label: 'niconico',
    helpMessage: 'niconico频道发布的视频链接',
    colProps: {
      flex: 1,
    },
  },
  {
    field: 'movieLink.twitter',
    component: 'Input',
    label: 'twitter',
    helpMessage: 'twitter频道发布的视频链接',
    colProps: {
      span: 8,
    },
  },
  {
    field: 'movieLink.personalWebsite',
    component: 'Input',
    label: '个人网站&其他',
    helpMessage: '在个人网站发布的视频链接',
    colProps: {
      span: 7,
      offset: 1,
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '视频下载链接',
    helpMessage: '提供的网盘或者直链下载链接',
    colProps,
  },
  {
    field: 'movieDownloadLink.baidu',
    component: 'Input',
    label: '百度网盘',
    helpMessage: '百度网盘下载链接',
    colProps: {
      span: 12,
    },
  },
  {
    field: 'movieDownloadLink.google',
    component: 'Input',
    label: '谷歌网盘',
    helpMessage: '谷歌网盘下载链接',
    colProps: {
      span: 11,
      offset: 1,
    },
  },
  {
    field: 'movieDownloadLink.onedrive',
    component: 'Input',
    label: 'OneDrive',
    helpMessage: 'OneDrive网盘下载链接',
    colProps: {
      span: 12,
    },
  },
  {
    field: 'movieDownloadLink.other',
    component: 'Input',
    label: '其他渠道',
    helpMessage: '例如诚通，天翼云，阿里云等，如有多个链接可用,分隔',
    colProps: {
      span: 11,
      offset: 1,
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '时间选择',
    helpMessage:
      '填写实际投稿时间以及期望公开时间（期望公开时间:假设您填写2023.3.31 那么在3.31前该视频都不会在网站中被搜索到）',
    colProps,
  },
  {
    field: 'realPublishTime',
    component: 'DatePicker',
    label: '实际发布时间',
    helpMessage: '原作者首次公开该作品的时间',
    colProps: {
      span: 12,
    },
    componentProps: {
      style: 'width:600px',
      'show-time': true,
    },
  },
  {
    field: 'expectPlayTime',
    component: 'DatePicker',
    label: '期望公开时间',
    helpMessage: '假设您填写2023.3.31 那么在3.31前该视频都不会在网站中被搜索到',
    colProps: {
      span: 11,
      offset: 1,
    },
    componentProps: {
      style: 'width:600px',
      'show-time': true,
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '其他',
    colProps,
  },
  {
    field: 'isOrigin',
    component: 'RadioGroup',
    label: '是否原创',
    helpMessage: '如果本作品属于本站，则勾选原创作品',
    colProps,
    componentProps: {
      options: [
        { label: '是', value: 1 },
        { label: '否', value: 0 },
      ],
    },
  },
]

export const step3Schemas: FormSchema[] = [
  {
    field: 'divider',
    component: 'Divider',
    label: '关联信息',
    helpMessage: '关联作者，活动',
    required: true,
    colProps,
  },
  {
    field: 'authorId',
    component: 'Select',
    label: '原作者',
    // required: true,
    helpMessage: '假设作者本人在本站拥有账号，那么请在此选择',
    colProps: {
      span: 12,
    },
    slot: 'authorId',
  },
  {
    field: 'authorName',
    component: 'Input',
    label: '作者名',
    helpMessage: '如果作者没有本站账号才填写该选项，如已选择前项，该项则不要填写',
    colProps: {
      span: 11,
      offset: 1,
    },
  },
  {
    field: 'activityId',
    component: 'Select',
    label: '所属活动',
    helpMessage: '如果是活动作品，则选择关联的活动',
    colProps: {
      span: 12,
    },
    slot: 'activityId',
  },
  {
    field: 'day',
    component: 'Input',
    label: '关联活动天数',
    helpMessage: '在选择了前项后再选择此项',
    colProps: {
      span: 11,
      offset: 1,
    },
    slot: 'day',
  },
]

export const updateSchemas: FormSchema[] = [
  {
    field: 'moviePlaylink',
    component: 'Upload',
    label: '视频上传',
    helpMessage:
      '请上传 mp4 格式 大小最大限制为150MB 支持多播放源(必须上传中文版本 该中文版本在有多版本的情况下会呈现为中文版本 如若没有其他版本 则该版本为默认版本 无其他版本)',
    colProps,
    slot: 'moviePlaylink',
  },
  {
    field: 'movieCover',
    component: 'Upload',
    label: '封面',
    required: true,
    helpMessage: '请上传 jpg|png|webp|gif 格式 大小小于10MB',
    colProps,
    slot: 'movieCover',
  },
  {
    field: 'movieName.cn',
    component: 'Input',
    label: '作品名(CN)',
    required: true,
    colProps,
  },
  {
    field: 'movieNameTranslate',
    component: 'Input',
    label: ' ',
    slot: 'movieNameTranslate',
    colProps,
  },
  {
    field: 'movieName.jp',
    component: 'Input',
    label: '作品名(JP)',
    colProps: {
      span: 12,
    },
    componentProps: {
      placeholder: '填写作品的日文名',
    },
  },
  {
    field: 'movieName.en',
    component: 'Input',
    label: '作品名(EN)',
    colProps: {
      offset: 1,
      span: 11,
    },
    componentProps: {
      placeholder: '填写作品的英文名',
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '填写简介',
    helpMessage: '支持简介国际化',
    required: true,
    colProps,
  },
  {
    field: 'movieDesc.cn',
    component: 'InputTextArea',
    label: '作品简介(CN)',
    labelWidth: 150,
    helpMessage: '填写作品的简介，支持国际化',
    colProps,
    required: true,
    componentProps: {
      placeholder: '填写作品的中文简介信息',
    },
  },
  {
    field: 'movieDescTranslate',
    component: 'Input',
    label: ' ',
    slot: 'movieDescTranslate',
    colProps,
  },
  {
    field: 'movieDesc.jp',
    component: 'InputTextArea',
    label: '作品简介(JP)',
    labelWidth: 150,
    helpMessage: '请填写日文简介',
    colProps,
    componentProps: {
      placeholder: '请填写日文简介',
    },
  },
  {
    field: 'movieDesc.en',
    component: 'InputTextArea',
    label: '作品简介(EN)',
    labelWidth: 150,
    helpMessage: '请填写英文简介',
    colProps,
    componentProps: {
      placeholder: '请填写英文简介',
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '视频下载链接',
    helpMessage: '提供的网盘或者直链下载链接',
    colProps,
  },
  {
    field: 'movieDownloadLink.baidu',
    component: 'Input',
    label: '百度网盘',
    helpMessage: '百度网盘下载链接',
    colProps: {
      span: 12,
    },
  },
  {
    field: 'movieDownloadLink.google',
    component: 'Input',
    label: '谷歌网盘',
    helpMessage: '谷歌网盘下载链接',
    colProps: {
      span: 11,
      offset: 1,
    },
  },
  {
    field: 'movieDownloadLink.onedrive',
    component: 'Input',
    label: 'OneDrive',
    helpMessage: 'OneDrive网盘下载链接',
    colProps: {
      span: 12,
    },
  },
  {
    field: 'movieDownloadLink.other',
    component: 'Input',
    label: '其他渠道',
    helpMessage: '例如诚通，天翼云，阿里云等，如有多个链接可用,分隔',
    colProps: {
      span: 11,
      offset: 1,
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '视频播放链接',
    helpMessage: '视频在各大媒体网站的公开播放链接',
    colProps,
  },
  {
    field: 'movieLink.bilibili',
    component: 'Input',
    label: 'bilibili',
    helpMessage: 'bilibili频道发布的视频链接',
    colProps: {
      span: 8,
    },
  },
  {
    field: 'movieLink.youtube',
    component: 'Input',
    label: 'youtube',
    helpMessage: 'youtube播放链接',
    colProps: {
      span: 7,
      offset: 1,
    },
  },
  {
    field: 'movieLink.niconico',
    component: 'Input',
    label: 'niconico',
    helpMessage: 'niconico频道发布的视频链接',
    colProps: {
      flex: 1,
    },
  },
  {
    field: 'movieLink.twitter',
    component: 'Input',
    label: 'twitter',
    helpMessage: 'twitter频道发布的视频链接',
    colProps: {
      span: 8,
    },
  },
  {
    field: 'movieLink.personalWebsite',
    component: 'Input',
    label: '个人网站&其他',
    helpMessage: '在个人网站发布的视频链接',
    colProps: {
      span: 7,
      offset: 1,
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '时间选择',
    helpMessage:
      '填写实际投稿时间以及期望公开时间（期望公开时间:假设您填写2023.3.31 那么在3.31前该视频都不会在网站中被搜索到）',
    colProps,
  },
  {
    field: 'realPublishTime',
    component: 'DatePicker',
    label: '实际发布时间',
    helpMessage: '原作者首次公开该作品的时间',
    colProps: {
      span: 12,
    },
    componentProps: {
      style: 'width:600px',
      'show-time': true,
    },
  },
  {
    field: 'expectPlayTime',
    component: 'DatePicker',
    label: '期望公开时间',
    helpMessage: '假设您填写2023.3.31 那么在3.31前该视频都不会在网站中被搜索到',
    colProps: {
      span: 11,
      offset: 1,
    },
    componentProps: {
      style: 'width:600px',
      'show-time': true,
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '其他',
    colProps,
  },
  {
    field: 'isOrigin',
    component: 'RadioGroup',
    label: '是否原创',
    helpMessage: '如果本作品属于本站，则勾选原创作品',
    colProps,
    componentProps: {
      options: [
        { label: '是', value: 1 },
        { label: '否', value: 0 },
      ],
    },
  },
  {
    field: 'divider',
    component: 'Divider',
    label: '关联信息',
    helpMessage: '关联作者，活动',
    required: true,
    colProps,
  },
  {
    field: 'authorId',
    component: 'Select',
    label: '原作者',
    // required: true,
    helpMessage: '假设作者本人在本站拥有账号，那么请在此选择',
    colProps: {
      span: 12,
    },
    slot: 'authorId',
  },
  {
    field: 'authorName',
    component: 'Input',
    label: '作者名',
    helpMessage: '如果作者没有本站账号才填写该选项，如已选择前项，该项则不要填写',
    colProps: {
      span: 11,
      offset: 1,
    },
  },
  {
    field: 'activityId',
    component: 'Select',
    label: '所属活动',
    helpMessage: '如果是活动作品，则选择关联的活动',
    colProps: {
      span: 12,
    },
    slot: 'activityId',
  },
  {
    field: 'day',
    component: 'Input',
    label: '关联活动天数',
    helpMessage: '在选择了前项后再选择此项',
    colProps: {
      span: 11,
      offset: 1,
    },
    slot: 'day',
  },
]
