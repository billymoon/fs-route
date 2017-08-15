const lorems = 'amet incididunt consectetur quis deserunt quis incididunt mollit pariatur ea in in consectetur incididunt cillum aliqua officia'

module.exports = qty => {
  return lorems.split(' ').sort(() => Math.random() < 0.5 ? -1 : 1).slice(0, qty || lorems.length).join(' ')
}
