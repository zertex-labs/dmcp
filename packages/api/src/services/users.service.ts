import { eq } from 'drizzle-orm'

import type { Pet, Prettify, User } from 'shared'

import db from '../db'
import { users } from '../db/schema'
import { response } from '../utils/response'
import { createRedisKey, redis } from '../redis'
import { getPet } from './pets.service'
import type { ServiceResponse } from './types'

/**
 * Get a user by their id
 * @param userId The user's id
 * @returns a {@link ServiceResponse}<{@link User} | undefined>
 */
export async function getUser(userId: string, withParams?: Partial<{
  activePet: boolean
  pets: boolean
}>): Promise<ServiceResponse<User | undefined>> {
  try {
    const key = createRedisKey('dbUser', userId)

    const cachedUser = await redis.json.get(key, '$') as [User] | undefined
    if (cachedUser && cachedUser.length > 0) return { status: 'success', data: cachedUser[0] }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      with: {
        activePet: withParams?.activePet ? true : undefined,
        pets: withParams?.pets ? true : undefined,
      },
    })

    if (user) redis.json.set(key, '$', user)

    return { status: 'success', data: user }
  }
  catch (e) {
    console.error(e)
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

    if (res.length === 0 || !res[0].id)
      return response.service.error('Failed to create user', 500)

    const user = res[0]
    redis.json.set(createRedisKey('dbUser', user.id), '$', user)

    return { status: 'success', data: user }
  }
  catch (e) {
    //  TODO handle unique constraints

    console.error(e)
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
  if (!petRes.data) return { status: 'error', error: 'Invalid petId; petId is either invalid or user doesn\'t own it.' }

  try {
    const userRes = await db
      .update(users)
      .set({
        activePetId: petId,
      })
      .where(eq(users.id, userId))
      .returning()

    console.log(userRes)

    if (userRes.length === 0 || !userRes[0].activePetId)
      return response.service.error('Failed to update user', 500)

    const user = userRes[0]
    const key = createRedisKey('dbUser', userId)

    console.log(key, user)

    // will overwrite the user if it exists, or create a new one
    await redis.json.set(key, '$', user)
  }
  catch (e) {
    console.error(e)
    return response.predefined.service.internalError
  }

  return {
    status: 'success',
    data: [userId, petId],
  }
}
