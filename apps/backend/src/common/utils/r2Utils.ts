import fs from 'node:fs'
import path from 'node:path'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { Singleton } from '../decorator/decorator'
import config from '~/config/config.default'
import { formatTime } from './moment'

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'jfif'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'm3u8'])

const CONTENT_TYPES: Record<string, string> = {
	gif: 'image/gif',
	jpeg: 'image/jpeg',
	jfif: 'image/jpeg',
	jpg: 'image/jpeg',
	m3u8: 'application/vnd.apple.mpegurl',
	mp4: 'video/mp4',
	png: 'image/png',
	webm: 'video/webm',
	webp: 'image/webp'
}

const stripSlashes = (value = '') => value.replace(/^\/+|\/+$/g, '')
const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '')
const normalizeEndpoint = (value: string | undefined, bucket: string) => {
	if (!value) return undefined
	const endpoint = new URL(value)
	if (stripSlashes(endpoint.pathname) === bucket) endpoint.pathname = '/'
	return endpoint.toString()
}

@Singleton()
export class R2Utils {
	private readonly bucket = config.R2_BUCKET || ''
	private readonly publicUrl = stripTrailingSlash(config.R2_PUBLIC_URL || 'https://assets.mirai-mad.com')
	private readonly imagePath = stripSlashes(config.R2_IMAGE_PATH || config.COS_BASE_PATH || '')
	private readonly videoPath = stripSlashes(config.R2_VIDEO_PATH || config.COS_VIDEO_PATH || 'mmgc/video')
	private readonly client: S3Client

	uploadList = new Set<string>()

	constructor() {
		this.client = new S3Client({
			region: 'auto',
			endpoint: normalizeEndpoint(config.R2_ENDPOINT, this.bucket),
			forcePathStyle: true,
			credentials: {
				accessKeyId: config.R2_ACCESS_KEY_ID || '',
				secretAccessKey: config.R2_SECRET_ACCESS_KEY || ''
			}
		})
	}

	private assertConfigured() {
		if (!config.R2_ENDPOINT || !config.R2_ACCESS_KEY_ID || !config.R2_SECRET_ACCESS_KEY || !this.bucket) {
			throw new Error('R2 storage is not configured')
		}
	}

	private createKey(basePath: string, extension: string) {
		return [basePath, formatTime(new Date(), 'YYYY-MM'), `${uuidv4()}.${extension}`]
			.filter(Boolean)
			.join('/')
	}

	private async uploadFile(key: string, filePath: string, extension: string) {
		this.assertConfigured()
		const stat = await fs.promises.stat(filePath)
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: fs.createReadStream(filePath),
				ContentLength: stat.size,
				ContentType: CONTENT_TYPES[extension] || 'application/octet-stream'
			})
		)
		return `${this.publicUrl}/${key}`
	}

	async uploadImg(filePath: string, fileName: string) {
		const extension = path.extname(fileName).slice(1).toLowerCase()
		if (!IMAGE_EXTENSIONS.has(extension)) return null
		return this.uploadFile(this.createKey(this.imagePath, extension), filePath, extension)
	}

	async uploadVideo(filePath: string, fileName: string) {
		if (this.uploadList.size >= 5) {
			throw new Error('上传对象过多，请稍后重试')
		}

		const extension = path.extname(fileName).slice(1).toLowerCase()
		if (!VIDEO_EXTENSIONS.has(extension)) return null

		this.uploadList.add(fileName)
		try {
			return await this.uploadFile(this.createKey(this.videoPath, extension), filePath, extension)
		} finally {
			this.uploadList.delete(fileName)
		}
	}
}
