const delayed = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random())
    }, 2000)
  })
}

module.exports = (conf) => {
  return delayed().then(random => ({ query: conf.req.query, random: random }))
}
