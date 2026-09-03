import { Context } from 'koa'
import { Autowired, Controller, Ctx, GetMapping, PostMapping, Query } from '~/common/decorator/decorator'
import { CosUtil } from '~/common/utils/cosutil'
import fs from 'fs'
import Result from '~/common/result'
import { R2Utils } from '~/common/utils/r2Utils'
@Controller('/upload')
export default class UploadController {
	cosUtil = new CosUtil()

	@Autowired()
	r2Utils!: R2Utils

	waitTingQueue = new Set()

	@PostMapping('/uploadImg')
	async uploadImg(@Ctx() ctx: Context) {
		const file = ctx.request.files?.file as any
		if (!file?.filepath || !file?.originalFilename) return Result.paramsError()
		const path = file.filepath as string
		try {
			const res = await this.r2Utils.uploadImg(path, file.originalFilename)
			if (res) return Result.success(res)
			return Result.paramsError()
		} finally {
			if (fs.existsSync(path) && fs.statSync(path).isFile()) {
				fs.unlinkSync(path)
			}
		}
	}

	@PostMapping('/uploadVideo')
	async uploadVideo(@Ctx() ctx: Context) {
		const file = ctx.request.files?.file as any
		if (!file?.filepath || !file?.originalFilename) return Result.paramsError()
		if (file.size > 200 * 1024 * 1024) {
			return Result.paramsError()
		}
		const path = file.filepath as string

		if (!fs.existsSync(path)) {
			return Result.paramsError()
		}
		if (fs.statSync(path).isFile()) {
			try {
				const res = await this.r2Utils.uploadVideo(path, file.originalFilename)
				if (res) {
					return Result.success(res)
				}
			} finally {
				if (fs.existsSync(path) && fs.statSync(path).isFile()) {
					fs.unlinkSync(path)
				}
			}
			return Result.paramsError()
		} else {
			return Result.paramsError()
		}
	}

	@GetMapping('/getLoaded')
	async getLoaded(@Query('fileName') fileName: string) {
		if (!fileName) {
			return Result.paramsError()
		}
		const newFileName = decodeURIComponent(fileName)
		const res = this.cosUtil.getBackUploadProgress(newFileName)
		if (res) {
			return Result.success(res)
		} else {
			return Result.dataNotFound()
		}
	}
}
