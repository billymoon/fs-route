const lorem = require('../lorem')

module.exports = conf => {
  const qty = conf.params.qty

  if (qty % 2) {
    throw Error('qty param must be even number')
  }

  return {'lorem': `${lorem(qty)}`}
}
