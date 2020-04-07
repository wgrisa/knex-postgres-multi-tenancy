import Knex from 'knex'

import knextancy from '../src'
import { knexTestConfiguration } from './fixtures/knexfile'

export const knexConnection = Knex(knexTestConfiguration)

export const getTenantConnection = async (tenantId: number) => knextancy.tenant(knexConnection, tenantId)

beforeEach(async () => await truncateAllTables())

const baseTruncateSql = `
SELECT
  Concat('TRUNCATE TABLE "', table_schema, '"."', TABLE_NAME, '" RESTART IDENTITY CASCADE;') truncate_table_cmd
FROM
  INFORMATION_SCHEMA.TABLES
WHERE
  table_schema = (
    SELECT
      current_schema())
    AND TABLE_NAME NOT LIKE '%knex_migrations'
    AND table_type = 'BASE TABLE'`

const truncateAllTables = async () => {
  const tablesToTruncate = await knexConnection.raw(baseTruncateSql)
  const query = tablesToTruncate.rows
    .map((truncateSqlResult: { truncate_table_cmd: string }) => truncateSqlResult.truncate_table_cmd)
    .join('')

  return knexConnection.raw(query)
}
