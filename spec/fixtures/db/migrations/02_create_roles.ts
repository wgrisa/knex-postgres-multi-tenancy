import Knex from 'knex'

export const up = (knex: Knex) =>
  knex.schema
    .createTable('$_roles', (table) => {
      table.increments('id').primary()
      table.string('name')
    })
    .then(() => {
      return knex.schema.table('$_users', (table) => {
        table.integer('role_id').unsigned().references('id').inTable('$_roles')
      })
    })

export const down = (knex: Knex) => knex.schema.dropTable('$_roles')
