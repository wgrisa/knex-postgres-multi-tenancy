import knex from 'knex'

import knexConfig from '../spec/fixtures/knexfile'

console.log('Migration started')

export const knexConnection = knex(knexConfig.test)

console.log('knexConfig.test', JSON.stringify(knexConfig.test, null, 2))

knexConnection.migrate
  .latest()
  .then((result) => {
    console.log('result', JSON.stringify(result, null, 2))
    console.log('Migration successful')
    process.exit()
  })
  .catch((error) => {
    console.log('Migration error', JSON.stringify(error, null, 2))
  })
