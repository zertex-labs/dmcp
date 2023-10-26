import { registerCommands } from 'src/utils'
import type { Event } from '../types'

export const run: Event<'ready'> = async (client) => {
  await registerCommands(client)
  client.log(`Logged in as ${client.user?.tag}`)
}
