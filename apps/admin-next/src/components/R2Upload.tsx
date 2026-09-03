import { LoadingOutlined, PlusOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { App, Upload, Space, Button } from 'antd'
import ImgCrop from 'antd-img-crop'
import { useState } from 'react'
import { uploadToR2 } from '../api/upload'

type R2UploadProps = {
  kind: 'image' | 'video'
  accept?: string
  value?: string
  onChange?: (url: string) => void
}

export default function R2Upload({ kind, accept, value, onChange }: R2UploadProps) {
  const [uploading, setUploading] = useState(false)
  const { message } = App.useApp()

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options
    setUploading(true)
    try {
      const url = await uploadToR2(file as File, kind, (percent) => {
        onProgress?.({ percent })
      })
      onChange?.(url)
      onSuccess?.(url)
      message.success('上传完成')
    } catch (err: any) {
      onError?.(err)
      message.error(err?.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : kind === 'video' ? <VideoCameraOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{kind === 'video' ? '上传视频' : '上传图片'}</div>
    </div>
  )

  if (kind === 'image') {
    return (
      <ImgCrop rotationSlider aspect={16 / 9}>
        <Upload
          accept={accept || 'image/png,image/jpeg,image/webp,image/gif'}
          listType="picture-card"
          showUploadList={false}
          customRequest={customRequest}
          className="full-width-upload"
        >
          {value ? (
            <img src={value} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            uploadButton
          )}
        </Upload>
      </ImgCrop>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%'
      }}
    >
      {value ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            background: '#000',
            borderRadius: 8,
            overflow: 'hidden'
          }}
        >
          <video
            src={value}
            controls
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
        </div>
      ) : (
        <Upload
          accept={accept || 'video/mp4,video/webm'}
          listType="picture-card"
          showUploadList={false}
          customRequest={customRequest}
          style={{ width: '100%', height: 180 }}
        >
          {uploadButton}
        </Upload>
      )}

      {value && (
        <Space>
          <Upload accept={accept || 'video/mp4,video/webm'} showUploadList={false} customRequest={customRequest}>
            <Button size="small" type="primary" loading={uploading}>
              重新上传
            </Button>
          </Upload>
          <Button size="small" danger onClick={() => onChange?.('')}>
            移除视频
          </Button>
        </Space>
      )}
    </div>
  )
}
