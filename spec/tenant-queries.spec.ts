import { expect } from 'chai'

import { getTenantConnection } from './spec-helper'

describe('tenant queries', () => {
  let tenantOneConnection = null

  describe('given some data in tenant 1', () => {
    beforeEach(async () => {
      tenantOneConnection = await getTenantConnection(1)

      const [roleId] = await tenantOneConnection('$_roles').insert({ name: 'PauloRole' }).returning('id')
      await tenantOneConnection('$_users').insert({ name: 'Paulo', role_id: roleId })
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

    it('returns the user related to a role', async () => {
      const user = await tenantOneConnection('$_users')
        .join('$_roles', '$_users.role_id', '$_roles.id')
        .select('$_roles.name as roleName', '$_users.name as userName')
        .first()

      expect(user).to.eql({
        roleName: 'PauloRole',
        userName: 'Paulo',
      })
    })

    it('returns nest tables result using rowMode as array', async () => {
      const user = await tenantOneConnection('$_users')
        .join('$_roles', '$_users.role_id', '$_roles.id')
        .select(['$_roles.name as roleName', '$_users.name as userName'])
        .options({ nestTables: true, rowMode: 'array' })

      expect(user).to.eql([
        {
          '0': 'PauloRole',
          '1': 'Paulo',
        },
      ])
    })
  })
})
