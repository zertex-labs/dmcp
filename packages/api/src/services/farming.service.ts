import { Value } from '@sinclair/typebox/value'
import { type Static, t } from 'elysia'

import type { AlwaysExist } from 'shared'

import { response } from '../utils/response'
import type { ServiceResponse } from './types'

export const farmingActions = ['farm'] as const

export type FarmingAction = typeof farmingActions[number]

export type FarmingResolvers = {
  [key in FarmingAction]: (body: Static<typeof resolverParametersTypes[key]>) => unknown | null | undefined
}

export const resolverParametersTypes = {
  farm: t.String(),
} as const

export function validateActionBody<Action extends FarmingAction>(action: Action, body: any): Static<typeof resolverParametersTypes[Action]> | null {
  return Value.Check(resolverParametersTypes[action], body) ? body : null
}

export async function handleAction<
  Action extends FarmingAction,
  Resolvers extends FarmingResolvers,
>(resolvers: Resolvers, action: Action, body: any):
Promise<ServiceResponse<AlwaysExist<ReturnType<Resolvers[Action]>>>> {
  if (!validateActionBody(action, body)) return response.predefined.service.badRequest

  const resolved: any = await resolvers[action](body)
  if (!resolved) return response.predefined.service.badRequest

  return { status: 'success', data: resolved }
}
