const lorem = 'amet incididunt consectetur quis deserunt quis incididunt mollit pariatur ea in in consectetur incididunt cillum aliqua officia'

export default qty => {
  return lorem.split(' ').sort(() => Math.random() < 0.5 ? -1 : 1).slice(0, qty || lorem.length).join(' ')
}
