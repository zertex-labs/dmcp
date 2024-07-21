import { eq } from 'drizzle-orm'

import type { ServiceResponse, User } from 'shared'

import db from '../db'
import { users } from '../db/schema'
import { response } from '../utils/response'
import { createRedisKey, redis } from '../redis'
import { deleteAllItems } from '../redis/deleteAllItems'
import { error } from '../utils'
import { getPet } from './pets.service'

export const getUserWithParamateres = ['activePet', 'pets'] as const
export type GetUserWithParamateres = typeof getUserWithParamateres[number]

/**
 * Get a user by their id
 * @param userId The user's id
 * @returns a {@link ServiceResponse}<{@link User} | undefined>
 */
export async function getUser(userId: string, withParams?: Partial<Record<GetUserWithParamateres, boolean>>): Promise<ServiceResponse<User | undefined>> {
  try {
    const paramEntries = Object.entries(withParams ?? {}).filter(([, v]) => v)
    // respect params in cache. If there are no params/all params are used, use the default key
    const suffixFromParams = paramEntries.length > 0 ? `+${paramEntries.map(([k]) => k).join('&')}` : undefined
    const key = createRedisKey('dbUser', userId, suffixFromParams)

    const cachedUser = await redis.json.get(key, '$') as [User] | undefined
    if (cachedUser?.[0])
      return { status: 'success', data: cachedUser[0] }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      with: {
        activePet: withParams?.activePet ? true : undefined,
        pets: withParams?.pets ? true : undefined,
      },
    })

    console.log('no cache', user)

    if (user) redis.json.set(key, '$', user)

    return { status: 'success', data: user }
  }
  catch (e: any) {
    error(e, `Failed to get user ${userId}`)
    return response.predefined.service.internalError
  }
}

export async function getUserFromUserOrId(userOrId: User | string, withParams?: Partial<Record<GetUserWithParamateres, boolean>>): Promise<ServiceResponse<User | undefined>> {
  if (typeof userOrId === 'string') return getUser(userOrId, withParams)

  return response.service.success(userOrId)
}

export async function giveUserBalance(userOrId: User | string, amount: number): Promise<ServiceResponse<{ id: string }>> {
  const userRes = await getUserFromUserOrId(userOrId)
  if (userRes.status === 'error') return userRes

  const user = userRes.data
  if (!user) return response.service.error('User not found', 404)

  console.log(user.balance)

  if (Number.isNaN(user.balance)) user.balance = 0
  user.balance += amount

  console.log(user.balance)

  const updateRes = await updateUser(user, { balance: user.balance })
  console.log(updateRes, 'bal')
  if (updateRes.status === 'error') return updateRes

  return response.service.success(updateRes.data)
}

export async function updateUser(userOrId: string | User, data: Partial<User>): Promise<ServiceResponse<{ id: string }>> {
  const userRes = await getUserFromUserOrId(userOrId)
  if (userRes.status === 'error') return userRes

  const user = userRes.data
  if (!user) return response.service.error('User not found', 404)

  console.log('before update', user)
  Object.assign(user, data)
  console.log('after update', user)

  try {
    const updateRes = await db
      .update(users)
      .set(user)
      .where(eq(users.id, user.id))
      .returning()

    if (updateRes.length === 0 || !updateRes[0]?.id)
      return response.service.error('Failed to update user', 500)

    await deleteAllItems({
      key: 'dbUser',
      value: user.id,
    })

    await redis.json.set(createRedisKey('dbUser', user.id), '$', updateRes[0])

    return response.service.success({ id: updateRes[0].id })
  }
  catch (e: any) {
    error(e, `Error updating user; ${JSON.stringify({ userOrId, user: userRes, data })}`)
    return response.predefined.service.internalError
  }
}

export async function userExists(userId: string): Promise<ServiceResponse<boolean>> {
  const userRes = await getUser(userId)
  if (userRes.status === 'error') return userRes // will be an internal error so we should bleed it through

  return { status: 'success', data: !!userRes.data }
}

export async function createUser(data: typeof users.$inferInsert): Promise<ServiceResponse<User>> {
  try {
    const res = await db
      .insert(users)
      .values(data)
      .returning()

    if (res.length === 0 || !res[0]?.id)
      return response.service.error('Failed to create user', 500)

    const user = res[0]
    redis.json.set(createRedisKey('dbUser', user.id), '$', user)

    return { status: 'success', data: user }
  }
  catch (e: any) {
    //  TODO handle unique constraints

    error(e, `Failed to create user; ${JSON.stringify(data)}`)
    return response.predefined.service.internalError
  }
}

/**
 * Assign an active pet to a user. This will update the user's activePetId. (The user MUST own the pet)
 * @param o The options
 * @param o.userId The user's id
 * @param o.petId The pet's id
 * @returns a {@link ServiceResponse}<[string, string]>
 */
export async function selectPet(o: { userId: string; petId: string }): Promise<ServiceResponse<[string, string]>> {
  const { petId, userId } = o
  const petRes = await getPet({ uuid: petId, ownerId: userId })
  if (petRes.status === 'error') return petRes
  if (!petRes.data) return response.service.error('Invalid petId; petId is either invalid or user doesn\'t own it.')

  try {
    const { rowCount: updatedCount } = await db
      .update(users)
      .set({
        activePetId: petId,
      })
      .where(eq(users.id, userId))

    if (updatedCount === 0)
      return response.service.error('Failed to update user', 500)

    const deletedIsSuccess = await deleteAllItems({
      key: 'dbUser',
      value: userId,
    })

    if (!deletedIsSuccess)
      error(new Error(`[selectPet] Failed to delete user cache; ${userId}`))
  }
  catch (e: any) {
    error(e, `Failed to select pet ${petId} for user ${userId}`)
    return response.predefined.service.internalError
  }

  return {
    status: 'success',
    data: [userId, petId],
  }
}
