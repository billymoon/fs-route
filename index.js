'use strict'

const path = require('path')
const querystring = require('querystring')
const fs = require('fs')

function validMethod (method, methods) {
  return (methods || ['index', 'get', 'post', 'put', 'patch', 'delete', 'options']).indexOf(method) !== -1
}

function findRoutes (startpath, methods) {
  return fs.readdirSync(startpath).reduce((memo, currentpath) => {
    const fullpath = path.join(startpath, currentpath)
    if (validMethod(path.basename(currentpath, '.js'), methods)) {
      memo.push(fullpath)
    } else if (fs.statSync(fullpath).isDirectory()) {
      memo = memo.concat(findRoutes(fullpath, methods))
    }
    return memo
  }, [])
}

const router = (routesDir, config, importerOverride) => {
  const importer = importerOverride || (file => new Promise(resolve => resolve(require(file))))

  return Promise.all(findRoutes(routesDir, (config || {}).methods)
    .map(file => importer(file).then(imported => {
      const routePath = path.dirname('/' + path.relative(routesDir, file))
      return {
        method: path.basename(file, '.js'),
        handler: imported,
        matcher: RegExp('^' + routePath.replace(/\/_.+?(\/|$)/g, '/([^/]+)$1') + '$'),
        params: (routePath.match(/\/_([^/]+)/g) || []).map(param => param.slice(2))
      }
    })))
    .then(routes => routes.sort((left, right) => {
      if (!left.params.length !== !right.params.length) {
        return left.params.length ? 1 : -1
      } else {
        return left.method !== 'index' ? -1 : 1
      }
    }))
    .then(routes => req => {
      const split = req.url.split(/\?(.+)/)
      const url = split[0]
      const urlQuery = split[1]

      const query = querystring.parse(urlQuery)
      const route = routes.filter(route => {
        if (!validMethod(req.method.toLowerCase(), (config || {}).methods)) {
          throw Error('unsupported http method')
        }
        return (route.method === req.method.toLowerCase() || route.method === 'index') && route.matcher.test(url)
      })[0]

      const params = url.match(route.matcher).slice(1).reduce((memo, param, index) => {
        memo[route.params[index]] = param
        return memo
      }, {})

      return { query, params, handler: route.handler }
    })
}

module.exports = router
