export function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs: number, onTimedout: () => any) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      onTimedout()
      reject(new Error(`Promise timed out after ${timeoutMs} ms`))
    }, timeoutMs)

    promise.then(
      (res) => {
        clearTimeout(timeout)
        resolve(res)
      },
      (err) => {
        clearTimeout(timeout)
        reject(err)
      },
    )
  })
}
