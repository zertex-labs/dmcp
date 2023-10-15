import type { ServiceResponse } from '../services/types'

/**
 * Create a {@link Response} object
 */
const baseResponse = {
  success: <Data = any>(data: Data) => new Response(JSON.stringify(data), { status: 200 }),
  error: <ErrorType = string>(error: ErrorType, status = 400) => new Response(JSON.stringify(typeof error == 'string' ? { error } : error), { status }),
}

/**
 * A collection of {@link Response} objects
 */
export const response = Object.freeze({
  ...baseResponse,
  predefined: Object.freeze({
    notAuthorized: baseResponse.error('Not Authorized', 401),
    notFound: baseResponse.error('Not Found', 404),
    badRequest: baseResponse.error('Bad Request', 400),
    internalError: baseResponse.error('Internal Error', 500),
    service: Object.freeze({
      internalError: { status: 'error', error: 'Internal Error', statusCode: 500 } as const,
      badRequest: { status: 'error', error: 'Bad Request', statusCode: 400 } as const,
      notFound: { status: 'error', error: 'Not Found', statusCode: 404 } as const,
      notAuthorized: { status: 'error', error: 'Not Authorized', statusCode: 401 } as const,
    }),
  }),
})

/**
 * Convert a {@link ServiceResponse} to a {@link Response} object
 * @param res The {@link ServiceResponse} to convert to a {@link Response}
 * @param statusCode The status code to use. Has higher priority than the {@link ServiceResponse}'s statusCode
 * @returns If the {@link ServiceResponse} is successful, returns a {@link Response} with the data.
 *
 * If the {@link ServiceResponse} is an error, returns a {@link Response} with the error(if the error has a statusCode set it will overwrite the default)
 *
 * If the {@link ServiceResponse} is successfull but the data is undefined, returns a {@link Response} with the status code 404 and the body 'Not Found'
 */
export function resolveServiceResponse<T>(res: ServiceResponse<T>, statusCode?: number) {
  if (res.status === 'error') return response.error(res.error, statusCode ?? res.statusCode)
  if (!res.data) return response.predefined.notFound

  return response.success(res.data)
}
