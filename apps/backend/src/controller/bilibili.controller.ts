import { Autowired, Controller, GetMapping, Query } from '~/common/decorator/decorator'
import Result from '~/common/result'
import { getBiliUserInfo, downloadBiliFace } from '~/common/utils/bilibili'
import { QiniuUtils } from '~/common/utils/qiniuUtils'
import fs from 'fs'

@Controller('/bilibili')
export default class BilibiliController {
	@Autowired()
	qiniuUtils!: QiniuUtils

	@GetMapping('/userinfo')
	async getUserInfo(@Query('mid') mid: number) {
		if (!mid) return Result.paramsError()
		const info = await getBiliUserInfo(Number(mid))
		if (!info) return Result.dataNotFound()

		// 下载头像并上传到 CDN
		if (info.face) {
			const downloaded = await downloadBiliFace(info.face)
			if (downloaded) {
				try {
					const cdnUrl = await this.qiniuUtils.uploadImg(downloaded.filePath, downloaded.fileName)
					if (cdnUrl) {
						info.face = cdnUrl
					}
				} finally {
					// 清理临时文件
					if (fs.existsSync(downloaded.filePath)) {
						fs.unlinkSync(downloaded.filePath)
					}
				}
			}
		}

		return Result.success(info)
	}
}
