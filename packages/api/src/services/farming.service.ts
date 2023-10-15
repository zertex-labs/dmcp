import { Value } from '@sinclair/typebox/value'
import { type Static, t } from 'elysia'

import type { AlwaysExist } from 'shared'
import { predefinedServiceResponse, response } from '../utils/response'
import type { ServiceResponse } from './types'

export const farmingActions = ['farm'] as const

export type FarmingAction = typeof farmingActions[number]

export const resolverParametersTypes = {
  farm: t.String(),
} as const

/**
 * If a resolver returns undefined/null it will be treated as a 400 bad request
 *
 * If a resolver returns anything else it will be passed down as a {@link ServiceResponse}
 */
export const farmingResolvers = {
  farm: (userId) => {
    if (userId === '1') return null
    return `${userId} farming`
  },
} satisfies {
  [key in FarmingAction]: (body: Static<typeof resolverParametersTypes[key]>) => AlwaysExist<any> | undefined | null
}

export function validateActionBody<Action extends FarmingAction>(action: Action, body: any): Static<typeof resolverParametersTypes[Action]> | null {
  return Value.Check(resolverParametersTypes[action], body) ? body : null
}

type FarmingReturnType<Action extends FarmingAction> = ReturnType<typeof farmingResolvers[Action]>

export function handleAction<Action extends FarmingAction>(action: Action, body: any): ServiceResponse<AlwaysExist<FarmingReturnType<Action>>> {
  if (!validateActionBody(action, body)) return predefinedServiceResponse.badRequest

  const resolved: any = farmingResolvers[action](body)
  if (!resolved) return predefinedServiceResponse.badRequest

  return { status: 'success', data: resolved }
}
