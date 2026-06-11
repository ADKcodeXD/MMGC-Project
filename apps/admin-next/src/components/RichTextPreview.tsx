import { Empty } from 'antd'
import { sanitizeHtml, stripHtml } from '../utils/html'

type RichTextPreviewProps = {
  value?: string | null
  className?: string
}

export default function RichTextPreview({ value, className }: RichTextPreviewProps) {
  const plainText = stripHtml(value)

  if (!plainText) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无简介" />
  }

  return (
    <div
      className={className ? `rich-text-preview ${className}` : 'rich-text-preview'}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
    />
  )
}
