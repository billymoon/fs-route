// core node dependencies
const path = require('path')

// third party depencencies
const express = require('express')

// fs route dependency
const route = require('../../es5')

// initialise router
const matcher = route(path.join(__dirname, '/routes'))

// initialise express app
const app = express()

// handle all routes
app.get('*', function (req, res) {
  // set json content type
  res.set('Content-Type', 'application/json')

  // get matched routes from fs route
  const matched = matcher(req)
  const handler = matched.handler
  const query = matched.query
  const params = matched.params

  // if there is a handler, use it to handle the response
  // else respond with 404
  if (handler) {
    // try to handle response, catching errors and sendong 500 error as response
    try {
      // pass request, response, query and params to handler
      const handled = handler(req, res, { query, params })
      // if handled result is a promise, resolve it and send as response
      // else send as response directly
      if (handled.then) {
        handled.then(data => res.send(data))
      } else {
        res.send(handled)
      }
    } catch (err) {
      res.status(500).send(`{"error": "${err.message}"}`)
    }
  } else {
    res.status(404).send('{"error": "handler not found"}')
  }
})

// listen on port 3000
app.listen(3000, function () {
  console.log('listening on port 3000!')
})
