# knex-postgres-multi-tenancy

Provides a way of implementing multi-tenancy using table prefixes for Postgres.

This library was based on [bravi-software/knextancy](https://github.com/bravi-software/knextancy). It was refactored to a more light-weight library using:

- Typescript
- Latest Knex version
- Prettier
- New tests
- Docker-compose
- Removed MySql support
- Removed the ability to fetch all tenants names
- Remove the ability to run all migrations
- Updated npm scripts

```ts
import knex from 'knex'
import knexMultiTenancy from 'knex-postgres-multi-tenancy'

const knexConnection = knex(YOUR_KNEX_CONFIGURATION)

const tenantKnex = await knexMultiTenancy.tenant(knexConnection, tenantId)

// the tenantKnex object contains the tenantId as an attribute
console.log(tenantKnex.tenantId)

const users = await tenantKnex('$_users')
  .where({
    first_name: 'Test',
    last_name: 'User',
  })
  .select('id')
```

Its `tenant` method expects a `knex` connection instance and a `tenantId` and returns **Promise** for a `tenantKnex` instance that scopes every queries to the particular tenant.

The only requirement is that every query is written using the special `$_` prefix for every table name.

## Migrations

**knex-postgres-multi-tenancy** assures that all migrations run for the tenant before returning its `knex` instance.

This special naming convention also applies while writing migrations, for example:

```ts
import Knex from 'knex'

export const up = (knex: Knex) =>
  knex.schema.createTable('$_users', (table) => {
    table.increments('id').primary()
    table.string('name')
  })

export const down = (knex: Knex) => knex.schema.dropTable('$_users')
```

## Connect Middleware

It also provides a handy [Connect](https://github.com/senchalabs/connect#readme) middleware that automatically creates a `knex` instance and attaches it to the `request` object for a given tenant based on a special HTTP header.

Bellow is a usage example:

```ts
const app = express()

app.use(knexMultiTenancy.middleware(knex, { header: 'x-client-id' }))

app.get('/', function (req, res, next) {
  req.knex
    .select()
    .from('$_users')
    .then(function (users) {
      res.send(users)
    }, next)
})
```

The `knexMultiTenancy.middleware` expects two parameters:

- `knex connection` instance;
- `options.header` the name of the HTTP header that will contain the tenant id.

## Tests

To run the tests using [Docker Compose](https://docs.docker.com/compose/):

```bash
npm run dnpm i
npm run dt
```
