import { Body, Controller, PostMapping } from '~/common/decorator/decorator'
import { Autowired } from '~/common/decorator/decorator'
import Result from '~/common/result'
import { RESULT_CODE, RESULT_MSG } from '~/types/enum'
import TranslateService from '~/service/translate.service'
import { Auth } from '~/common/decorator/auth'

@Controller('/translate')
export default class TranslateController {
	@Autowired()
	translateService!: TranslateService

	@PostMapping('/auto')
	@Auth([ROLE.ADMIN, ROLE.SUBADMIN, ROLE.COMMITTER, ROLE.GROUPMEMBER], '/auto')
	async translate(@Body() body: { text: string; isHtml?: boolean }) {
		if (!body.text) {
			return Result.paramsError()
		}
		const result = await this.translateService.translate(body.text, body.isHtml)
		if (result) {
			return Result.success(result)
		}
		return Result.fail(RESULT_CODE.VERIFY_ERROR, '翻译失败，请重试', null)
	}
}
