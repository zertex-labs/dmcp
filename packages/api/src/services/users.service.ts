import { eq } from 'drizzle-orm'

import type { Pet, Prettify, User } from 'shared'

import db from '../db'
import { users } from '../db/schema'
import { predefinedServiceResponse } from '../utils/response'
import { getPet } from './pets.service'
import type { ServiceResponse } from './types'

/**
 * Get a user by their id
 * @param userId The user's id
 * @returns a {@link ServiceResponse}<{@link User} | undefined>
 */
export async function getUser(userId: string): Promise<ServiceResponse<User & Required<Pick<User, 'activePet'>> | undefined>> {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      with: {
        activePet: true,
      },
    })
    return { status: 'success', data: user }
  }
  catch (e) {
    console.error(e)
    return predefinedServiceResponse.internalError
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
    await db
      .update(users)
      .set({
        activePetId: petId,
      })
      .where(eq(users.id, userId))
      .returning({ userId: users.id, petId: users.activePetId })
  }
  catch (e) {
    console.error(e)
    return predefinedServiceResponse.internalError
  }

  return {
    status: 'success',
    data: [userId, petId],
  }
}
