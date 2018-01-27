/* global expect,test,beforeAll */
const path = require('path')
const fsRoute = require('.')

let unconfiguredMatcher
let configuredMatcher
let restrictedMatcher

beforeAll(() => Promise.all([
  fsRoute(path.join(__dirname, 'demo', 'express', 'routes')).then(promisedMatcher => (unconfiguredMatcher = promisedMatcher)),
  fsRoute(path.join(__dirname, 'demo', 'express', 'routes'), { methods: ['index', 'get'] }).then(promisedMatcher => (configuredMatcher = promisedMatcher)),
  fsRoute(path.join(__dirname, 'demo', 'express', 'routes'), { restrict: '/lorem' }).then(promisedMatcher => (restrictedMatcher = promisedMatcher))
]))

test('loads module', () => {
  expect(unconfiguredMatcher).toBeInstanceOf(Function)
})

test('handles GET / with get.js', () => {
  const route = unconfiguredMatcher({ url: '/', method: 'GET' })
  expect(route.handler).toBeInstanceOf(Function)
  expect(typeof route.handler()).toEqual('string')
  expect(JSON.parse(route.handler()).whoami).toMatch('GET handler for root')
})

;['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].forEach(method => {
  test(`handles ${method} / with index.js`, () => {
    const route = unconfiguredMatcher({ url: '/', method: method })
    expect(route.handler).toBeInstanceOf(Function)
    expect(typeof route.handler({ req: { method: method } })).toEqual('string')
    expect(JSON.parse(route.handler({ req: { method: method } })).whoami).toMatch('root index handler')
  })

  test(`when configured for get requests, throws for ${method} requests to /`, () => {
    expect(() => configuredMatcher({ url: '/', method: method })).toThrow('unsupported http method')
  })
})

test('throws for OTHER http methods', () => {
  expect(() => unconfiguredMatcher({ url: '/', method: 'GET' })).not.toThrow()
  expect(() => unconfiguredMatcher({ url: '/', method: 'OTHER' })).toThrow('unsupported http method')
  expect(() => configuredMatcher({ url: '/', method: 'GET' })).not.toThrow()
  expect(() => configuredMatcher({ url: '/', method: 'OTHER' })).toThrow('unsupported http method')
})

test('handles subfolder /echo', () => {
  const route = unconfiguredMatcher({ url: '/echo', method: 'GET' })
  expect(route.handler).toBeInstanceOf(Function)
  expect(route.handler()).toBeInstanceOf(Promise)
})

test('handles restricted and unrestricted routes, returning null handler for unkown path', () => {
  expect(configuredMatcher({ url: '/unknown', method: 'GET' }).handler).toBe(null)
  expect(restrictedMatcher({ url: '/unknown', method: 'GET' }).handler).toBe(null)
})

test('handles restricted routes, restricting out of bounds paths', () => {
  expect(configuredMatcher({ url: '/echo', method: 'GET' }).handler).toBeInstanceOf(Function)
  expect(restrictedMatcher({ url: '/echo', method: 'GET' }).handler).toBe(null)
})

test('handles restricted routes, handling matched paths', () => {
  expect(restrictedMatcher({ url: '/lorem', method: 'GET' }).handler).toBeInstanceOf(Function)
})

test('handles restricted routes, handling paramaterized paths', () => {
  expect(restrictedMatcher({ url: '/lorem/4', method: 'GET' }).handler).toBeInstanceOf(Function)
})

test('handles no params or querystring correctly for /echo', () => {
  const route = unconfiguredMatcher({ url: '/echo', method: 'GET' })
  expect(route.query).toEqual({})
  expect(route.params).toEqual({})
  expect(route.handler).toBeInstanceOf(Function)
  expect(route.handler()).toBeInstanceOf(Promise)
})

test('handles params in /lorem/_qty', () => {
  const route = unconfiguredMatcher({ url: '/lorem/4', method: 'GET' })
  expect(route.query).toEqual({})
  expect(route.params).toEqual({ qty: '4' })
  expect(route.handler).toBeInstanceOf(Function)
})

test('handles querystring in /echo', () => {
  const route = unconfiguredMatcher({ url: '/echo?good&bad=ugly', method: 'GET' })
  expect(route.query).toEqual({ good: '', bad: 'ugly' })
  expect(route.params).toEqual({})
  expect(route.handler).toBeInstanceOf(Function)
})

test('handles params with querystring in /lorem/_qty', () => {
  const route = unconfiguredMatcher({ url: '/lorem/4?good&bad=ugly', method: 'GET' })
  expect(route.query).toEqual({ good: '', bad: 'ugly' })
  expect(route.params).toEqual({ qty: '4' })
  expect(route.handler).toBeInstanceOf(Function)
})
