export const knexTestConfiguration = {
  client: 'pg',
  connection: {
    multipleStatements: true,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  migrations: {
    directory: './spec/fixtures/db/migrations',
  },
  pool: {
    min: 0,
    max: 10,
  },
}
