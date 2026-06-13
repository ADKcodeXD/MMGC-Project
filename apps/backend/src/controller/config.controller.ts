import { Context } from 'koa'
import { Body, Controller, Ctx, GetMapping, PostMapping } from '~/common/decorator/decorator'
import Result from '~/common/result'
import { Config } from '~/model'
import config from '~/config/config.default'
import { MMGCSysConfigEntity } from '~/entity/global'
import { copyProperties } from '~/common/utils'
import { Validtor } from '~/middleware/ajv.middleware'
import { configUpdateParamsValidate } from '~/common/validate/validate'
import { Auth } from '~/common/decorator/auth'

const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '')

const getDefaultGlobalAssetBaseUrl = () => {
	const cdnLink = stripTrailingSlash(config.QINIU_CDN_LINK || '')
	return cdnLink.replace('://assets.', '://assets-global.')
}

const isOverseaRequest = (ctx: Context) => {
	const country = String(ctx.headers['cf-ipcountry'] || ctx.headers['x-vercel-ip-country'] || '').toUpperCase()
	if (!country || country === 'XX') return false
	return country !== 'CN'
}

const applyAssetConfig = (model: MMGCSysConfig, ctx: Context) => {
	const assetPrimaryBaseUrl = stripTrailingSlash(config.QINIU_CDN_LINK || '')
	const assetGlobalBaseUrl = stripTrailingSlash(config.QINIU_GLOBAL_CDN_LINK || getDefaultGlobalAssetBaseUrl())
	const useGlobalAsset = Boolean(assetGlobalBaseUrl && isOverseaRequest(ctx))

	model.assetPrimaryBaseUrl = assetPrimaryBaseUrl
	model.assetGlobalBaseUrl = assetGlobalBaseUrl
	model.assetBaseUrl = useGlobalAsset ? assetGlobalBaseUrl : assetPrimaryBaseUrl
	model.assetRegion = useGlobalAsset ? 'global' : 'cn'
}

@Controller('/config')
export default class ConfigController {
	@GetMapping('/getConfig')
	async getConfig(@Ctx() ctx: Context) {
		const res = await Config.findOne({ configType: config.SYS_CONFIG })
		if (!res) {
			const model = new MMGCSysConfigEntity()
			model.currentActivityId = 2022
			model.skin = ''
			model.isVideoPlay = true
			model.otherSettings = ''
			model.configType = 1
			await new Config(model).save()
			applyAssetConfig(model, ctx)
			return Result.success(model)
		} else {
			const model = new MMGCSysConfigEntity()
			copyProperties(res, model)
			applyAssetConfig(model, ctx)
			return Result.success(model)
		}
	}

	@PostMapping('/updateConfig', [Validtor('body', configUpdateParamsValidate)])
	@Auth([ROLE.ADMIN, ROLE.SUBADMIN, ROLE.COMMITTER, ROLE.GROUPMEMBER], '/updateConfig')
	async updateConfig(@Body() body: MMGCSysConfig) {
		if (!body.configType) {
			await Config.updateOne({ configType: config.SYS_CONFIG }, body)
		} else {
			await Config.updateOne({ configType: body.configType }, body)
		}
		return Result.success(null)
	}
}
