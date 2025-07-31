import { GrowthBook } from '@growthbook/growthbook'
import { RequestHandler } from 'express'

import config from '../../config/config'
import { growthbookConfig } from '../../config/features/growthbook.config'

const growthbookMiddleware: RequestHandler = async (req, res, next) => {
  req.growthbook = new GrowthBook({
    apiHost: 'https://cdn.growthbook.io',
    clientKey: growthbookConfig.growthbookClientKey,
    enableDevMode: config.isDev,
  })

  res.on('close', () => {
    if (req.growthbook) {
      req.growthbook.destroy()
    }
  })

  await req.growthbook.init({ timeout: 1000 }).then(() => next())
}

export default growthbookMiddleware
