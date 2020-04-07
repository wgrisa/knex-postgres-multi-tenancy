import knex, { Config, RawBinding, Sql } from 'knex'
import QueryBuilder from 'knex/lib/query/builder'
import Raw from 'knex/lib/raw'
import Runner from 'knex/lib/runner'
import SchemaBuilder from 'knex/lib/schema/builder'

import createDebug from './debug'
import { after, before, override } from './override'

const debug = createDebug('client-multi-tenant')

/**
 * Build knex tenant configuration changing details related to multi-tenant
 */
export const buildConfig = (config: Config, tenantId: number) => {
  const multiTenantConfig = {
    ...config,
    tenantId,
  }

  multiTenantConfig.migrations = { ...(multiTenantConfig.migrations || {}) }

  // custom migration with the table name prefix
  const tableName = multiTenantConfig.migrations.tableName || 'knex_migrations'
  multiTenantConfig.migrations.tableName = `${tenantId}_${tableName}`

  return multiTenantConfig
}

/**
 * Installs the tenant monkey patch on knex.
 *
 * It overrides some base knex functions changing the original behavior to
 * include multi-tenant configurations such as the tenant prefix in every table.
 */
export function install() {
  const hasDefinedTenantId = Object.getOwnPropertyDescriptor(knex.Client.prototype, 'tenantId')

  if (hasDefinedTenantId) {
    return
  }

  Object.defineProperty(knex.Client.prototype, 'tenantId', {
    get() {
      return this.config.tenantId
    },
  })

  override(
    QueryBuilder.prototype,
    'toSQL',
    after(function (toSQLFunction: Sql) {
      debug('knex.Client.prototype.QueryBuilder.prototype.toSQL', arguments)

      toSQLFunction.sql = applyTenant(toSQLFunction.sql, this.client.tenantId)

      return toSQLFunction
    }),
  )

  override(
    SchemaBuilder.prototype,
    'toSQL',
    after(function (toSQLSchemaQueries: Sql[]) {
      debug('knex.Client.prototype.SchemaBuilder.prototype.toSQL', arguments)

      return toSQLSchemaQueries.map((toSQLFunction: Sql) => {
        toSQLFunction.sql = applyTenant(toSQLFunction.sql, this.client.tenantId)

        return toSQLFunction
      })
    }),
  )

  override(
    Raw.prototype,
    'set',
    before(function (rawSQLQuery: string, bindings: readonly RawBinding[]) {
      debug('knex.Client.prototype.Raw.prototype.set', arguments)

      const tenantSQL = applyTenant(rawSQLQuery, this.client.tenantId)

      return [tenantSQL, bindings]
    }),
  )

  override(
    Runner.prototype,
    'query',
    after(async function (promise, originalArgs) {
      debug('knex.Client.prototype.Runner.prototype.query', arguments)

      const options = originalArgs[0].options

      const result = await promise

      if (!options || !options.nestTables) {
        return result
      }

      return result.map((row) =>
        Object.keys(row).reduce((processedRow, tableJoinName) => {
          processedRow[misapplyTenant(tableJoinName, this.client.tenantId)] = row[tableJoinName]

          return processedRow
        }, {}),
      )
    }),
  )
}

const misapplyTenant = (sql: string, tenant: number) => sql.replace(new RegExp(`^(${tenant}_)`), '$_')

const applyTenant = (sql: string, tenant: number) => sql.replace(/\$_/g, `${tenant}_`)
