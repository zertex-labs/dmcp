import type { ServiceResponse } from 'shared'
import db from '../db'
import { createRedisKey, redis } from '../redis'
import type { PetSelect as Pet } from '../db/schema/pets'

export async function getPet(o: { uuid: string; ownerId?: string }): Promise<ServiceResponse<Pet | undefined>> {
  const { uuid, ownerId } = o

  try {
    const key = createRedisKey('pet', uuid)
    let pet = await redis.json.get(key) as Pet | undefined

    if (pet) return { status: 'success', data: pet }

    pet = await db.query.pets.findFirst({
      where: (pets, { eq, and }) => ownerId ? and(eq(pets.ownerId, ownerId), eq(pets.uuid, uuid)) : eq(pets.uuid, uuid),
    })

    if (!pet) return { status: 'error', error: 'Pet not found' }

    redis.json.set(key, '$', pet)

    return { status: 'success', data: pet }
  }
  catch (e) {
    console.error(e)
    return { status: 'error', error: 'Internal error' }
  }
}
