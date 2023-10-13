import type { Event } from '../types'

export const run: Event<'ready'> = async (client) => {
  client.log(`Logged in as ${client.user?.tag}`)
}
