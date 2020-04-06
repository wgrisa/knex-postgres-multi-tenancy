import middleware from './connect-middleware'
import setupTenant from './tenant'

export default {
  tenant: setupTenant,
  middleware: middleware(setupTenant),
}
