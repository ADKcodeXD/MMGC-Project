import axios from 'axios'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { v4 as uuidv4 } from 'uuid'

const UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

export interface BiliUserInfo {
	mid: number
	name: string
	face: string
}

/**
 * 通过 UID 获取 B 站用户公开信息（头像 + 昵称）
 * 使用 /x/web-interface/card 接口，无需 WBI 签名
 */
export async function getBiliUserInfo(mid: number): Promise<BiliUserInfo | null> {
	try {
		const { data } = await axios.get('https://api.bilibili.com/x/web-interface/card', {
			params: { mid },
			headers: { 'User-Agent': UA, Referer: 'https://www.bilibili.com' },
			timeout: 10000
		})
		if (data.code !== 0 || !data.data?.card) return null
		const card = data.data.card
		return {
			mid: card.mid,
			name: card.name,
			face: card.face
		}
	} catch (e: any) {
		console.error('[bilibili] error:', e?.message || e)
		return null
	}
}

/**
 * 下载 B 站头像图片到本地临时文件，返回 { filePath, fileName }
 */
export async function downloadBiliFace(faceUrl: string): Promise<{ filePath: string; fileName: string } | null> {
	try {
		const response = await axios.get(faceUrl, {
			responseType: 'arraybuffer',
			headers: { 'User-Agent': UA },
			timeout: 15000
		})
		const contentType: string = response.headers['content-type'] || ''
		let ext = 'jpg'
		if (contentType.includes('png')) ext = 'png'
		else if (contentType.includes('webp')) ext = 'webp'
		else if (contentType.includes('gif')) ext = 'gif'

		const fileName = `${uuidv4()}.${ext}`
		const filePath = path.join(os.tmpdir(), fileName)
		fs.writeFileSync(filePath, response.data)
		return { filePath, fileName }
	} catch (e: any) {
		console.error('[bilibili] download face error:', e?.message || e)
		return null
	}
}
