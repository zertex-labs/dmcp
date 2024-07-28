import { response } from './response'

/**
 * @example
 * .get(
 *  'example',
 *  ctx => { ... },
 *  { beforeHandle: requireApiSecret }
 * )
 * @returns If the API secret is not present, returns a 401 response and will not execute the endpoint.
 */
export function requireApiSecret({ isApiSecretPresent }: { isApiSecretPresent: () => boolean }) {
  if (!isApiSecretPresent()) return response.predefined.notAuthorized
}
