import { expect } from 'chai'

import knextancy from '../src'
import { getTenantConnection, knexConnection } from './spec-helper'

describe('tenant raw queries', () => {
  describe('given some data in tenant 10', () => {
    let tenantTenConnection = null

    beforeEach(async () => {
      tenantTenConnection = await getTenantConnection(10)

      await tenantTenConnection('$_users').insert({ name: 'Paulo' })
    })

    it('should be readable via a raw query in its tenant', async () => {
      const { rows: users } = await tenantTenConnection.raw(`select * from "$_users"`)

      expect(users.length).to.eql(1)
    })

    it('should not be readable via a raw query on other tenant', async () => {
      const tenantTwentyConnection = await getTenantConnection(20)

      const { rows: users } = await tenantTwentyConnection.raw(`select * from "$_users"`)

      expect(users.length).to.eql(0)
    })
  })
})
