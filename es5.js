'use strict'

const path = require('path')
const querystring = require('querystring')
const fs = require('fs')

function findRoutes (startpath) {
  return fs.readdirSync(startpath).reduce((memo, currentpath) => {
    const fullpath = path.join(startpath, currentpath)
    if (['index', 'get', 'post', 'put', 'patch', 'delete', 'options'].indexOf(path.basename(currentpath, '.js')) !== -1) {
      memo.push(fullpath)
    } else if (fs.statSync(fullpath).isDirectory()) {
      memo = memo.concat(findRoutes(fullpath))
    }
    return memo
  }, [])
}

const router = (routesDir, config, importerOverride) => {
  const importer = importerOverride || (file => new Promise(resolve => resolve(require(file))))

  let routes = null

  Promise.all(findRoutes(routesDir).map(file => {
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
