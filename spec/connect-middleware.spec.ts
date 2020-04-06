import { expect } from 'chai'
import express from 'express'
import request from 'supertest'

import knextancy from '../src'
import { getTenantConnection, knexConnection } from './spec-helper'

describe('connect-middleware with default settings', () => {
  let app

  before(() => {
    app = express()

    app.use(knextancy.middleware(knexConnection))

    app.use((err, req, res, next) => (err ? res.status(500).send(err) : next()))

    app.get('/', async (req, res) => res.send(await req.knex('$_users')))
  })

  describe('given some data in tenant 01 and tenant 02', () => {
    beforeEach(async () => {
      const tenantOneConnection = await getTenantConnection(1)
      const tenantTwoConnection = await getTenantConnection(2)

      await tenantOneConnection('$_users').insert({ name: 'Paulo' })
      await tenantTwoConnection('$_users').insert({ name: 'Pedro' })
    })

    it("should be possible to access the request's knex and query a tenant data", async () => {
      const { body } = await request(app).get('/').set('x-client-id', '1').expect(200)

      expect(body).to.eql([{ id: 1, name: 'Paulo', role_id: null }])
    })

    it('should throw an error if the "x-client-id" header is not set', async () => {
      const { text } = await request(app).get('/').expect(500)

      expect(text).to.eql('Missing x-client-id header')
    })

    it('should create the migrations table for a tenant', async () => {
      const result = await knexConnection('1_knex_migrations')

      expect(result.map((migrationFiles) => migrationFiles.name)).to.eql(['01_create_users.ts', '02_create_roles.ts'])
    })
  })
})
