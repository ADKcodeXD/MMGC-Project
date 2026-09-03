import '@wangeditor/editor/dist/css/style.css'
import React, { useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { uploadToR2 } from '../api/upload'

interface RichEditorProps {
  value?: string
  onChange?: (val: string) => void
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const [html, setHtml] = useState(value || '')

  useEffect(() => {
    setHtml(value || '')
  }, [value])

  const toolbarConfig: Partial<IToolbarConfig> = {}
  
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
    MENU_CONF: {
      uploadImage: {
        async customUpload(file: File, insertFn: (url: string, alt: string, href: string) => void) {
          try {
            const url = await uploadToR2(file, 'image')
            insertFn(url, file.name, url)
          } catch (e) {
            console.error('上传图片失败:', e)
          }
        }
      }
    }
  }

  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  return (
    <div className="rich-editor" style={{ border: '1px solid #ccc', zIndex: 100 }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #ccc' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={ed => {
          setHtml(ed.getHtml())
          onChange?.(ed.getHtml())
        }}
        mode="default"
        style={{ height: '400px', overflowY: 'hidden' }}
      />
    </div>
  )
}
