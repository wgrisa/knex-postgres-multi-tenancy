import { Request } from 'express'
import Knex from 'knex'

export type KnexRequest = { knex: Knex } & Request
