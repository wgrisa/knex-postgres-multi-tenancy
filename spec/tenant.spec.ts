import { expect } from 'chai'

import { getTenantConnection } from './spec-helper'

describe('tenant', () => {
  it('returns a knex object with the tenantId as an attribute', async () => {
    const tenantOneConnection = await getTenantConnection(1)

    expect(tenantOneConnection.tenantId).to.eql(1)
  })

  it('shows the tenant when using toString function', async () => {
    const tenantOneConnection = await getTenantConnection(1)

    const sqlQuery = tenantOneConnection('$_users')

    expect(sqlQuery.toSQL().sql).to.eql(`select * from "1_users"`)
  })
})
