import { MemberVo } from 'Member'
import { StatisticsParams, StatisticsUpdateParams } from 'Statistics'
import { Auth } from '~/common/decorator/auth'
import { Controller, PostMapping, Body, User, Autowired, DeleteMapping, Param, GetMapping, Ctx, Query } from '~/common/decorator/decorator'
import Result from '~/common/result'
import { addNewAuthorParamsValidate, updateAuthorParamsValidate } from '~/common/validate/validate'
import { Validtor } from '~/middleware/ajv.middleware'
import StatisticsService from '~/service/statistics.service'
import { RESULT_CODE, RESULT_MSG } from '~/types/enum'
import { IpUtils } from '~/common/utils/ipUtils'
import { Context } from 'koa'

@Controller('/statistics')
export default class StatisticsController {
  @Autowired()
  statisticsService!: StatisticsService

  @Autowired()
  ipUtils!: IpUtils

  @PostMapping('/track')
  async track(@Body() trackParams: any, @Ctx() ctx: Context) {
    const ip = this.ipUtils.getIp(ctx)
    const userAgent = ctx.headers['user-agent'] || ''
    await this.statisticsService.saveTrack({
      ...trackParams,
      ip,
      userAgent
    })
    return Result.success(null)
  }

  @PostMapping('/getAuthorRank')
  async getAuthorRank(@Body() pageParams: PageParams) {
    const res = await this.statisticsService.findAuthorList(pageParams)
    if (res) return Result.success(res)
    return Result.paramsError()
  }

  @PostMapping('/addNewAuthor', [Validtor('body', addNewAuthorParamsValidate)])
  @Auth([ROLE.ADMIN, ROLE.SUBADMIN, ROLE.COMMITTER, ROLE.GROUPMEMBER], '/addNewAuthor')
  async addNewAuthor(@Body() authorParams: StatisticsParams, @User() userInfo: MemberVo) {
    if (!userInfo || !userInfo.memberId) {
      return Result.fail(RESULT_CODE.USER_NOTFOUND, RESULT_MSG.USER_NOTFOUND, null)
    }

    const res = await this.statisticsService.saveAuthor(authorParams)
    return Result.success(res)
  }

  @PostMapping('/updateAuthor', [Validtor('body', updateAuthorParamsValidate)])
  @Auth([ROLE.ADMIN, ROLE.SUBADMIN, ROLE.COMMITTER, ROLE.GROUPMEMBER], '/updateAuthor')
  async updateAuthor(@Body() authorParams: StatisticsUpdateParams, @User() userInfo: MemberVo) {
    if (!userInfo || !userInfo.memberId) {
      return Result.fail(RESULT_CODE.USER_NOTFOUND, RESULT_MSG.USER_NOTFOUND, null)
    }

    const res = await this.statisticsService.updateAuthorInfo(authorParams)
    return Result.success(res)
  }

  @DeleteMapping('/deleteAuthor/:id')
  @Auth([ROLE.ADMIN, ROLE.SUBADMIN, ROLE.COMMITTER, ROLE.GROUPMEMBER], '/updateAuthor')
  async deleteAuthorInfo(@Param('id') id: string) {
    const res = await this.statisticsService.deleteAuthor(id)
    return Result.success(res)
  }

  @GetMapping('/siteTraffic')
  async getSiteTraffic(@Query('days') days?: string) {
    const res = await this.statisticsService.getSiteTraffic(days ? parseInt(days) : 7)
    return Result.success(res)
  }

  @GetMapping('/dashboardOverview')
  async getDashboardOverview(@Query('days') days?: string) {
    const res = await this.statisticsService.getDashboardOverview(days ? parseInt(days) : 7)
    return Result.success(res)
  }

  @GetMapping('/trackOverview')
  async getTrackOverview(@Query('days') days?: string) {
    const res = await this.statisticsService.getTrackOverview(days ? parseInt(days) : 7)
    return Result.success(res)
  }

  @GetMapping('/sitemapOverview')
  @Auth([ROLE.ADMIN, ROLE.SUBADMIN, ROLE.COMMITTER, ROLE.GROUPMEMBER], '/sitemapOverview')
  async getSitemapOverview() {
    const res = await this.statisticsService.getSitemapOverview()
    return Result.success(res)
  }
}
