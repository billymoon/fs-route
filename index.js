const routerProxy = require('./es5')

export default (routesDir, configIn) => {
  const config = configIn || {}
  const importer = file => import(file).then(file => new Promise(resolve => resolve(file.default)))
  config.importer = importer
  return routerProxy(routesDir, config)
}
