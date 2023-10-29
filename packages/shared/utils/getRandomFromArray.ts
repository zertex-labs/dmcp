export function getRandomFromArray<T>(arr: T[] | Readonly<T[]>): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}
