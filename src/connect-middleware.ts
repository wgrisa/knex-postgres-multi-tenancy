import { NextFunction, Response } from 'express'
import knex from 'knex'

import { KnexRequest } from '../types'

/**
  Middleware that populates
 */
export const knextancyMiddleware = (setupTenant: (baseKnex: knex, tenantId: number) => Promise<knex>) => {
  return (baseKnex: knex, options?: { header: any }) => {
    const header = options?.header || 'x-client-id'

    return async (req: KnexRequest, _res: Response, next: NextFunction) => {
      const tenantId = req.header(header)

      if (!tenantId) {
        return next(`Missing "${header}" from request header.`)
      }

      req.knex = await setupTenant(baseKnex, +tenantId)

      next()
    }
  }
}
