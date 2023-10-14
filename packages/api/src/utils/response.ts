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
  predefined: {
    notAuthorized: baseResponse.error('Not Authorized', 401),
    notFound: baseResponse.error('Not Found', 404),
  },
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
export function serviceResponse<T>(res: ServiceResponse<T>, statusCode?: number) {
  if (res.status === 'error') return response.error(res.error, statusCode ?? res.statusCode)
  if (!res.data) return response.predefined.notFound

  return response.success(res.data)
}

/**
 * A collection of predefined {@link ServiceResponse}s
 */
export const predefinedServiceResponse = Object.freeze({
  internalError: { status: 'error', error: 'Internal error', statusCode: 500 } as const,
} satisfies Record<string, ServiceResponse<any>>)
