const lorems = 'amet incididunt consectetur quis deserunt quis incididunt mollit pariatur ea in in consectetur incididunt cillum aliqua officia'

const lorem = qty => {
  return lorems.split(' ').sort(() => Math.random() < 0.5 ? -1 : 1).slice(0, qty || lorems.length).join(' ')
}

module.exports = conf => {
  const qty = conf.params.qty

  if (qty % 2) {
    throw Error('qty param must be even number')
  }

  return {'lorem': `${lorem(qty)}`}
}
