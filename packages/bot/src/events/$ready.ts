import { registerCommands } from 'src/utils'
import { ActivityType } from 'discord.js'
import type { Event } from '../types'

export const run: Event<'ready'> = async (client) => {
  await registerCommands(client)

  client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: '/leaderboard',
        type: ActivityType.Competing,
      },
    ],
  })

  client.log(`Logged in as ${client.user?.tag}`)
}
