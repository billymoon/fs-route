/* global expect,test,beforeAll */
const path = require('path')
const fsRoute = require('./es5')

let matcher

beforeAll(() => fsRoute(path.join(__dirname, 'demo', 'express', 'routes'), {methods: ['index', 'get']}).then(promisedMatcher => (matcher = promisedMatcher)))

test('loads module', () => {
  expect(matcher).toBeInstanceOf(Function)
})

test('handles GET / with get.js', () => {
  const route = matcher({ url: '/', method: 'GET' })
  expect(route.query).toEqual({})
  expect(route.params).toEqual({})
  expect(route.handler).toBeInstanceOf(Function)
  expect(typeof route.handler()).toEqual('string')
  expect(JSON.parse(route.handler()).whoami).toMatch('GET handler for root')
})

;['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].forEach(method => {
  test(`handles ${method} / with index.js`, () => {
    expect(() => matcher({ url: '/', method: method })).toThrow('unsupported http method')
  })
})

test('throws for OTHER http methods', () => {
  expect(() => matcher({ url: '/', method: 'GET' })).not.toThrow()
  expect(() => matcher({ url: '/', method: 'OTHER' })).toThrow('unsupported http method')
})

test('handles subfolder /echo', () => {
  const route = matcher({ url: '/echo', method: 'GET' })
  expect(route.query).toEqual({})
  expect(route.params).toEqual({})
  expect(route.handler).toBeInstanceOf(Function)
  expect(route.handler()).toBeInstanceOf(Promise)
})

test('handles params in /lorem/_qty', () => {
  const route = matcher({ url: '/lorem/4', method: 'GET' })
  expect(route.query).toEqual({})
  expect(route.params).toEqual({ qty: '4' })
  expect(route.handler).toBeInstanceOf(Function)
})

test('handles querystring in /echo', () => {
  const route = matcher({ url: '/echo?good&bad=ugly', method: 'GET' })
  expect(route.query).toEqual({ good: '', bad: 'ugly' })
  expect(route.params).toEqual({})
  expect(route.handler).toBeInstanceOf(Function)
})

test('handles params with querystring in /lorem/_qty', () => {
  const route = matcher({ url: '/lorem/4?good&bad=ugly', method: 'GET' })
  expect(route.query).toEqual({ good: '', bad: 'ugly' })
  expect(route.params).toEqual({ qty: '4' })
  expect(route.handler).toBeInstanceOf(Function)
})
