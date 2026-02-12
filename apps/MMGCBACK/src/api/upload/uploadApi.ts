import { defHttp } from '/@/utils/http/axios'
import { UploadFileParams } from '/#/axios'
import { useGlobSetting } from '/@/hooks/setting'
import axios from 'axios'
import { ContentTypeEnum } from '/@/enums/httpEnum'
import { v4 as uuidv4 } from 'uuid'

const { uploadUrl = '', uploadCdnLink, uploadLink, uploadPath } = useGlobSetting()

const formatTime = (time: number) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  if (month < 10) return `${year}-0${month}`
  return `${year}-${month}`
}

export const uploadAxios = (params: any, options) => {
  const formData = new window.FormData()
  const customFilename = params.name || 'file'

  if (params.filename) {
    formData.append(customFilename, params.file, params.filename)
  } else {
    formData.append(customFilename, params.file)
  }

  if (params.data) {
    Object.keys(params.data).forEach((key) => {
      const value = params.data![key]
      if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(`${key}[]`, item)
        })
        return
      }

      formData.append(key, params.data![key])
    })
  }

  if (params.token && params.key) {
    formData.append('token', params.token)
    formData.append('key', params.key)
  }

  return axios({
    method: 'POST',
    data: formData,
    headers: {
      'Content-type': ContentTypeEnum.FORM_DATA,
      ignoreCancelToken: true,
    },
    url: options.url,
    timeout: options.timeout,
    onUploadProgress: options.onUploadProgress,
  })
}

/**
 * @description: Upload interface
 */
export function uploadImgApi(
  params: UploadFileParams,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
): any {
  return new Promise((resolve, reject) => {
    getQiniuToken().then((res) => {
      if (res) {
        debugger
        const reg = /(jpg|png|jpeg|webp|gif|jijf)$/
        const split = ((params.file as any).name || 'cover.png').split('.') || []
        const ext = split[split.length - 1] || ''
        if (!reg.test(ext)) {
          reject('上传失败')
        }
        const nameArr: any = []
        const date = formatTime(new Date().getTime())
        nameArr.push(date)
        nameArr.push(`${uuidv4()}.${ext}`)
        const key = nameArr.join('/')
        params.key = key
        params.token = res.data
        uploadAxios(params, {
          url: uploadLink,
          onUploadProgress,
          timeout: 1000 * 600,
        })
          .then(() => {
            const data = {
              code: 200,
              data: `${uploadCdnLink}/${key}`,
              msg: '成功',
            }
            resolve(data)
          })
          .catch(() => {
            reject('上传失败')
          })
      }
    })
  })
}

export function getQiniuToken() {
  return defHttp.post<ResResult<any>>({
    url: '/upload/getQiniuToken',
    timeout: 1000 * 6, // 10分钟超时
  })
}

export function uploadVideoApi(
  params: UploadFileParams,
  onUploadProgress: (progressEvent: ProgressEvent) => void,
) {
  return new Promise((resolve, reject) => {
    getQiniuToken().then((res) => {
      if (res) {
        const reg = /(mp4)$/
        const split = (params.file as any).name?.split('.') || []
        const ext = split[split.length - 1] || ''
        if (!reg.test(ext)) {
          reject('上传失败')
        }
        const nameArr = [uploadPath]
        const date = formatTime(new Date().getTime())
        nameArr.push(date)
        nameArr.push(`${uuidv4()}.${ext}`)
        const key = nameArr.join('/')
        params.key = key
        params.token = res.data
        uploadAxios(params, {
          url: uploadLink,
          onUploadProgress,
          timeout: 1000 * 600,
        })
          .then(() => {
            const data = {
              code: 200,
              data: `${uploadCdnLink}/${key}`,
            }
            resolve(data)
          })
          .catch(() => {
            reject('上传失败')
          })
      }
    })
  })
}

export function getLoaded(fileName: string) {
  return defHttp.get<ResResult<any>>({
    url: '/upload/getLoaded',
    timeout: 1000 * 6, // 10分钟超时
    params: {
      fileName,
    },
  })
}
