import { expect } from 'chai'

import { getTenantConnection } from './spec-helper'

describe('tenant', () => {
  it('should return a knex object with the tenantId as an attribute', async () => {
    const tenantOneConnection = await getTenantConnection(1)

    expect(tenantOneConnection.tenantId).to.eql(1)
  })
})
