import Knex from 'knex'

export const up = (knex: Knex) =>
  knex.schema.createTable('$_users', function (table) {
    table.increments('id').primary()
    table.string('name')
  })

export const down = (knex: Knex) => knex.schema.dropTable('$_users')
