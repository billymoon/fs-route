// core node dependencies
import path from 'path'

// third party depencencies
import { send } from 'micro'

// fs route dependency
import route from '../..'

// initialise router
const matcher = route(path.join(__dirname, 'routes'))

// export default function to be handled by micro
export default (req, res) => {
  // try to get matched routes from fs route
  // catch errors sending 500 error
  try {
    const { handler, query, params } = matcher(req)
    // if there is a handler, use it to handle the response
    // else respond with 404
    if (handler) {
      // pass request, response, query and params to handler
      // return the result to micro to handle
      return handler({ req, res, query, params })
    } else {
      send(res, 404, { error: 'not found' })
    }
  } catch (err) {
    send(res, 500, { error: err.message })
  }
}
