'use strict'

const path = require('path')
const querystring = require('querystring')
const fs = require('fs')

function findRoutes (dir) {
  const files = fs.readdirSync(dir)
  const resolve = f => path.join(dir, f)
  const routes = files.filter(f => ['index', 'get', 'post', 'put', 'patch', 'delete', 'options'].indexOf(path.basename(f, '.js')) !== -1).map(resolve)
  const dirs = files.filter(f => fs.statSync(path.join(dir, f)).isDirectory()).map(resolve)
  return routes.concat(dirs.map(findRoutes).reduce((a, b) => a.concat(b), []))
}

const router = (routesDir, config) => {
  const importer = (config || {}).importer || (file => new Promise(resolve => resolve(require(file))))
  let routes = null
  ;((routesDir, config) => {
    Promise.all(findRoutes(routesDir).map((file) => {
      return importer(file).then(imported => {
        const routePath = path.dirname('/' + path.relative(routesDir, file))
        return {
          method: path.basename(file, '.js'),
          handler: imported,
          matcher: RegExp('^' + routePath.replace(/\/_.+?(\/|$)/g, '/([^/]+)$1') + '$'),
          params: (routePath.match(/\/_([^/]+)/g) || []).map(param => param.slice(2))
        }
      })
    })).then(scannedRoutes => {
      routes = scannedRoutes.sort((left, right) => {
        if (!left.params.length !== !right.params.length) {
          return left.params.length ? 1 : -1
        } else {
          return left.method !== 'index' ? -1 : 1
        }
      }).sort((config || {}).sort || (() => 0))
    })
  })(routesDir, config)

  return req => {
    if (routes === null) {
      throw Error('route initialisation not yet complete')
    }

    const split = req.url.split(/\?(.+)/)
    const url = split[0]
    const urlQuery = split[1]

    const query = querystring.parse(urlQuery)
    const route = routes
      .filter(route => (route.method === req.method.toLowerCase() || route.method === 'index') && route.matcher.test(url))
      .concat([{ handler: null }])[0]

    const params = url.match(route.matcher).slice(1).reduce((memo, param, index) => {
      memo[route.params[index]] = param
      return memo
    }, {})

    return { query, params, handler: route.handler }
  }
}

module.exports = router
