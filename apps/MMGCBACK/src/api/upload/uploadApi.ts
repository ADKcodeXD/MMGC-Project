import { defHttp } from '/@/utils/http/axios'
import { UploadFileParams } from '/#/axios'

/**
 * @description: Upload interface
 */
export function uploadImgApi(
  params: UploadFileParams,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
): any {
  return defHttp.uploadFile<ResResult<string>>(
    {
      url: '/upload/uploadImg',
      timeout: 1000 * 600,
      onUploadProgress,
    },
    params,
  )
}

export function uploadVideoApi(
  params: UploadFileParams,
  onUploadProgress: (progressEvent: ProgressEvent) => void,
) {
  return defHttp.uploadFile<ResResult<string>>(
    {
      url: '/upload/uploadVideo',
      timeout: 1000 * 600,
      onUploadProgress,
    },
    params,
  )
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
