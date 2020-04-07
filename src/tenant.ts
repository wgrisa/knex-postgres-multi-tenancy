import knex from 'knex'
import PromiseAsyncCache from 'promise-async-cache'

import createDebug from './debug'
import * as knexTenantSupport from './knex-tenant-support'

const debug = createDebug('tenant')

/**
 * Defines whenever the tenant monkey patch on knex has been installed
 */
let isMultiTenantSupportInstalled = false

/**
 * Keep knex tenants in memory and handle race conditions
 */
const cache = new PromiseAsyncCache({
  /**
   * Build knex tenant and load it to the cache
   */
  async load(tenantId: number, baseKnex: knex) {
    if (!isMultiTenantSupportInstalled) {
      try {
        debug(`Installing knextancy for tenant ${tenantId}`)
        knexTenantSupport.install()
        isMultiTenantSupportInstalled = true
      } catch (err) {
        debug(`Error installing knex multi tenant for tenant ${tenantId}`, err.stack || err)
        throw err
      }
    }

    debug(`Building knex for tenant ${tenantId}`)
    const proxyKnex = knex(knexTenantSupport.buildConfig(baseKnex.client.config, tenantId))

    Object.defineProperty(proxyKnex, 'tenantId', {
      get() {
        return this.client.tenantId
      },
    })

    if (baseKnex.client.config.migrations) {
      debug(`running migration tasks for tenant ${tenantId}`)
      await proxyKnex.migrate.latest()
    }

    if (baseKnex.client.config.seeds) {
      debug(`running seed tasks for tenant ${tenantId}`)
      await proxyKnex.seed.run()
    }

    return proxyKnex
  },
})

export const setupTenant = async (baseKnex: knex, tenantId: number) => {
  try {
    return cache.get(tenantId, baseKnex)
  } catch (err) {
    debug(`Error initializing the multi tenant database for tenant ${tenantId}`, err.stack || err)
    throw err
  }
}
