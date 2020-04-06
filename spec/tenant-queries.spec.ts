import { expect } from 'chai'

import { getTenantConnection } from './spec-helper'

describe('tenant queries', () => {
  let tenantOneConnection = null

  describe('given some data in tenant 1', () => {
    beforeEach(async () => {
      tenantOneConnection = await getTenantConnection(1)

      await tenantOneConnection('$_users').insert({ name: 'Paulo' })
    })

    it('should be readable via a raw query on its tenant', async () => {
      const users = await tenantOneConnection('$_users')

      expect(users.length).to.eql(1)
    })

    it('should not be readable via a raw query on other tenant', async () => {
      const tenantTwoConnection = await getTenantConnection(2)
      const users = await tenantTwoConnection('$_users')

      expect(users.length).to.eql(0)
    })
  })
})
