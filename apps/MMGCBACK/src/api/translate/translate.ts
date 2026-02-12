import { defHttp } from '/@/utils/http/axios'

enum Api {
  TRANSLATE = '/translate/auto',
}

export function autoTranslate(text: string, isHtml?: boolean) {
  return defHttp.post<ResResult<I18N>>(
    { url: Api.TRANSLATE, params: { text, isHtml }, timeout: 60000 },
    { errorMessageMode: 'message' },
  )
}
