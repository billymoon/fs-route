const routerProxy = require('.')

export default (routesDir, config) => {
  return routerProxy(routesDir, config, file => import(file).then(file => new Promise(resolve => resolve(file.default))))
}
