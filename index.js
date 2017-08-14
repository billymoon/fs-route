const routerProxy = require('./es5')

export default (routesDir, config) => {
  return routerProxy(routesDir, config, file => import(file).then(file => new Promise(resolve => resolve(file.default))))
}
