import type { I18N } from '../types'

export function text(value?: I18N | null) {
  if (!value) return '-'
  return value.cn || value.en || value.jp || '-'
}

export function i18nFrom(value?: string): I18N {
  return { cn: value?.trim() || '', en: '', jp: '' }
}
