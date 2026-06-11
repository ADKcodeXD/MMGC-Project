import axios from 'axios'
import { uploadApi } from './modules'

type UploadKind = 'image' | 'video'

function monthPath() {
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  return `${now.getFullYear()}-${month}`
}

function extensionOf(file: File) {
  return file.name.split('.').pop()?.toLowerCase() || ''
}

function createKey(file: File, kind: UploadKind) {
  const ext = extensionOf(file)
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const basePath = kind === 'video' ? import.meta.env.VITE_UPLOAD_PATH || 'mmgc/video' : ''
  return [basePath, monthPath(), `${id}.${ext}`].filter(Boolean).join('/')
}

export async function uploadToQiniu(
  file: File,
  kind: UploadKind,
  onProgress?: (percent: number) => void
) {
  const token = await uploadApi.qiniuToken()
  const key = createKey(file, kind)
  const formData = new FormData()
  formData.append('file', file)
  formData.append('token', token)
  formData.append('key', key)

  await axios.post(import.meta.env.VITE_UPLOAD_LINK || 'https://up-z2.qiniup.com', formData, {
    timeout: 1000 * 600,
    onUploadProgress: event => {
      if (!event.total) return
      onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
  })

  return `${import.meta.env.VITE_UPLOAD_CDN}/${key}`
}
