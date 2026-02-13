import { Context } from 'koa'
import mongoose from 'mongoose'
import config from '../config/config.default'
import logger from '~/common/utils/log4j'

export default async (ctx: Context, next: any) => {
  const hasAuth = config.MONGO_USERNAME && config.MONGO_PASSWORD
  mongoose.connect(`${config.MONGO_PATH}/${config.MONGO_COLLECTION}`, {
    ...(hasAuth
      ? {
          auth: {
            username: config.MONGO_USERNAME,
            password: config.MONGO_PASSWORD
          },
          authSource: 'admin'
        }
      : {})
  })

  const db = mongoose.connection

  db.on('error', () => logger.error('Connected Error'))
  db.once('open', function () {
    logger.info('Connected to MongoDB')
  })
  await next()
}
