import lorem from '../lorem'

export default (req, res, opts) => {
  const { qty } = opts.params

  if (qty % 2) {
    throw Error('qty param must be even number')
  }

  return `{"lorem": "${lorem(qty)}"}`
}
