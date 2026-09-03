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

const isChinaRequest = (ctx: Context) => {
	const country = String(ctx.headers['cf-ipcountry'] || ctx.headers['x-vercel-ip-country'] || '').toUpperCase()
	return country === 'CN'
}

const applyAssetConfig = (model: MMGCSysConfig, ctx: Context) => {
	const assetPrimaryBaseUrl = stripTrailingSlash(config.R2_PUBLIC_URL || 'https://assets.mirai-mad.com')
	const assetCnBaseUrl = stripTrailingSlash(config.R2_CN_PUBLIC_URL || 'https://assets-cn.mirai-mad.com')
	const useCnAsset = Boolean(model.enableCnAssetAcceleration && assetCnBaseUrl && isChinaRequest(ctx))

	model.assetPrimaryBaseUrl = assetPrimaryBaseUrl
	model.assetCnBaseUrl = assetCnBaseUrl
	model.assetBaseUrl = useCnAsset ? assetCnBaseUrl : assetPrimaryBaseUrl
	model.assetRegion = useCnAsset ? 'cn' : 'default'
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
