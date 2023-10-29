import 'dotenv/config'

import { GatewayIntentBits } from 'discord.js'
import { UsableClient } from './client'
import { registerEvents } from './utils/registerEvents'
import { config } from './config'

const client = new UsableClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
})

async function start(token: string | undefined) {
  // await registerCommands(client)
  registerEvents(client)

  client.login(token)
}

start(config.env.DISCORD_BOT_TOKEN)
