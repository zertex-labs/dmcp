import { response } from './response'

// designed to be used in Elysia's beforeHandle
// @ts-expect-error We just don't want to repeat this 100 times and I really can't be bothered to search for the proper type atm
export function requireApiSecret({ isApiSecretPresent }) {
  if (!isApiSecretPresent()) return response.predefined.notAuthorized
}
