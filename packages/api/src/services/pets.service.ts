import type { Pet } from 'shared'
import db from '../db'
import type { ServiceResponse } from './types'

export async function getPet(o: { uuid: string; ownerId?: string }): Promise<ServiceResponse<Pet | undefined>> {
  const { uuid, ownerId } = o

  try {
    const pet = await db.query.pets.findFirst({
      where: (pets, { eq, and }) => ownerId ? and(eq(pets.ownerId, ownerId), eq(pets.uuid, uuid)) : eq(pets.uuid, uuid),
    })

    return { status: 'success', data: pet }
  }
  catch (e) {
    console.error(e)
    return { status: 'error', error: 'Internal error' }
  }
}
