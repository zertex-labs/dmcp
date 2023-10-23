import fs from 'node:fs'
import path from 'node:path'
import { Routes } from 'discord.js'

import { promiseWithTimeout } from 'shared'
import type { UsableClient } from '../client'
import type { Command } from '../types'

const { DISCORD_CLIENT_ID, GUILD_ID } = process.env

export async function registerCommands(client: UsableClient) {
  const commandsPath = path.join(__dirname, '..', 'commands')
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.ts'))

  const slashCommands = commandFiles.map((x) => {
    // eslint-disable-next-line ts/no-var-requires, ts/no-require-imports
    const cmd = require(path.join(commandsPath, x)).default as Command
    const builder = cmd?.withBuilder ?? {}

    delete cmd.withBuilder

    const data = { ...builder, ...cmd }
    client.commands.set(data.name, data)
    return data
  })

  try {
    client.log(`Started refreshing ${slashCommands.length} commands.`)

    client.log(`Commands: ${slashCommands.map(x => x.name).join(', ')}`)

    await promiseWithTimeout(
      client.rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID!, GUILD_ID!),
        {
          body: slashCommands,
          reason: 'Routes.applicationGuildCommands',
        },
      ),
      5000,
      () => {
        client.error('Routes.applicationGuildCommands timedout after 5000ms')
        registerCommands(client)
      },
    )

    if (process.env.NODE_ENV === 'production') {
      await client.rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID!), {
        body: slashCommands,
      })
    }
    client.log(`Refreshed ${slashCommands.length} commands.`)
  }
  catch (error: any) {
    client.log(error?.message ?? error)
  }
}

export default registerCommands
