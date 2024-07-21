export function greedyRound(num: number, nearestTo: number) {
  return Math.round(num / nearestTo) * nearestTo
}
