import { send } from 'micro'

const delayed = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random())
    }, 2000)
  })
}

export default async (req, res) => {
  const random = await delayed()

  send(res, 200, { query: req.query, random: random, __dirname: __dirname, env: process.env })
}
