import { api } from './client'

type UploadKind = 'image' | 'video'

export async function uploadToR2(file: File, kind: UploadKind, onProgress?: (percent: number) => void) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<unknown, string>(
    `/upload/${kind === 'video' ? 'uploadVideo' : 'uploadImg'}`,
    formData,
    {
      timeout: 1000 * 600,
      onUploadProgress: (event) => {
        if (!event.total) return
        onProgress?.(Math.round((event.loaded / event.total) * 100))
      }
    }
  )

  return response
}
