import debug from 'debug'

export default (namespace: string) => debug(`knextancy:${namespace || '*'}`)
