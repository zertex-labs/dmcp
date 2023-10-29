export function shuffledArray<T>(array: T[]) {
  const newArray = [...array] as any
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = newArray[i]
    newArray[i] = newArray[j]
    newArray[j] = temp
  }
  return newArray
}
