const delayed = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random())
    }, 2000)
  })
}

module.exports = (req, res) => {
  return delayed().then(random => ({ query: req.query, random: random, __dirname: __dirname, env: process.env }))
}
