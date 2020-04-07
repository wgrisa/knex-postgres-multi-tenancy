import { knextancyMiddleware } from './connect-middleware'
import setupTenant from './tenant'

export default {
  tenant: setupTenant,
  middleware: knextancyMiddleware(setupTenant),
}
