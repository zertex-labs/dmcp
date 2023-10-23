import { clearTimeout } from 'node:timers'

export function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs: number, onTimedout: () => any) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      onTimedout()
      clearTimeout(timeout)
      reject(new Error(`Promise timed out after ${timeoutMs} ms`))
    }, timeoutMs)

    promise.then(resolve, reject).finally(() => {
      clearTimeout(timeout)
    })
  })
}
