const delayed = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random())
    }, 2000)
  })
}

export default async ({ query }) => {
  const random = await delayed()
  return { query, random }
}
