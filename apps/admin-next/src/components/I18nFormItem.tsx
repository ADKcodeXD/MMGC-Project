import { Form, Input, Button, message, Tabs, Tooltip } from 'antd'
import { TranslationOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { translateApi } from '../api/modules'
import type { I18N } from '../types'

import RichEditor from './RichEditor'

type I18nFormItemProps = {
  name: string | string[]
  label: string
  required?: boolean
  inputType?: 'input' | 'textarea' | 'rich-text'
  rows?: number
  placeholder?: string
}

export default function I18nFormItem({
  name,
  label,
  required,
  inputType = 'input',
  rows = 4,
  placeholder
}: I18nFormItemProps) {
  const [translating, setTranslating] = useState(false)
  const form = Form.useFormInstance()
  const namePath = Array.isArray(name) ? name : [name]

  const handleTranslate = async () => {
    try {
      const cnValue = form.getFieldValue([...namePath, 'cn'])
      if (!cnValue) {
        message.warning('请先填写中文内容')
        return
      }

      setTranslating(true)
      const res = await translateApi.autoTranslate(cnValue, inputType === 'rich-text')
      const payload = ((res as I18N & { data?: I18N })?.data ?? res) as I18N | null

      if (payload?.en || payload?.jp) {
        form.setFieldValue([...namePath, 'en'], payload.en || '')
        form.setFieldValue([...namePath, 'jp'], payload.jp || '')
        message.success('翻译完成')
      } else {
        message.error('翻译接口返回异常')
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '翻译失败')
    } finally {
      setTranslating(false)
    }
  }

  const renderInput = (placeholderStr: string) => {
    if (inputType === 'rich-text') {
      return <RichEditor />
    }
    if (inputType === 'textarea') {
      return <Input.TextArea rows={rows} placeholder={placeholderStr} />
    }
    return <Input placeholder={placeholderStr} />
  }

  return (
    <Form.Item label={label} required={required} className="i18n-form-item">
      <Tabs
        type="card"
        size="small"
        tabBarExtraContent={
          <Tooltip title="一键翻译成英文、日文">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<TranslationOutlined />}
              onClick={handleTranslate}
              loading={translating}
            >
              AI 翻译
            </Button>
          </Tooltip>
        }
        items={[
          {
            key: 'cn',
            label: '中文 (CN)',
            children: (
              <Form.Item name={[...namePath, 'cn']} rules={[{ required, message: '请输入中文内容' }]} noStyle>
                {renderInput(placeholder || '中文内容')}
              </Form.Item>
            )
          },
          {
            key: 'en',
            label: '英文 (EN)',
            children: (
              <Form.Item name={[...namePath, 'en']} noStyle>
                {renderInput('英文内容 (选填)')}
              </Form.Item>
            )
          },
          {
            key: 'jp',
            label: '日文 (JP)',
            children: (
              <Form.Item name={[...namePath, 'jp']} noStyle>
                {renderInput('日文内容 (选填)')}
              </Form.Item>
            )
          }
        ]}
      />
    </Form.Item>
  )
}
