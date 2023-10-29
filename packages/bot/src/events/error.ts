import type { Event } from '../types'

export const run: Event<'error'> = async (client, error) => {
  client.error(error)
}
