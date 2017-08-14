const lorem = require('../lorem')

module.exports = (req, res, opts) => {
  const qty = opts.params.qty

  if (qty % 2) {
    throw Error('qty param must be even number')
  }

  return `{"lorem": "${lorem(qty)}"}`
}
