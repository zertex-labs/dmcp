import { clearTimeout } from 'node:timers'

export function promiseWithTimeout(promise: Promise<any>, timeoutMs: number) {
  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => resolve(false), timeoutMs)

    promise.then(
      () => {
        clearTimeout(timeout)
        resolve(true)
      },
      () => {
        clearTimeout(timeout)
        resolve(false)
      },
    )
  })
}
