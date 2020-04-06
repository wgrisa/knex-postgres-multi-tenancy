import { knex } from './spec-helper'
import { expect } from 'chai'
import knextancy from '../src'

describe('tenant queries', function () {
  describe('given some data in tenant 01', function () {
    beforeEach(function () {
      return knextancy.tenant(knex, '01').then(function (tenantKnex) {
        return tenantKnex('$_users').insert({ name: 'Paulo' })
      })
    })

    it('should be readable via a raw query on its tenant', function () {
      return knextancy.tenant(knex, '01').then(function (tenantKnex) {
        return tenantKnex
          .select()
          .from('$_users')
          .then(function (users) {
            expect(users.length).to.eql(1)
          })
      })
    })

    it('should not be readable via a raw query on other tenant', function () {
      return knextancy.tenant(knex, '02').then(function (tenantKnex) {
        return tenantKnex
          .select()
          .from('$_users')
          .then(function (users) {
            expect(users.length).to.eql(0)
          })
      })
    })
  })

  describe('joins', function () {
    beforeEach(function () {
      return knextancy.tenant(knex, '01').then(function (tenantKnex) {
        return tenantKnex('$_roles')
          .insert({ name: 'Admin' })
          .then(function (result) {
            return tenantKnex('$_users').insert({
              name: 'Paulo',
              role_id: result[0],
            })
          })
      })
    })
  })
})
