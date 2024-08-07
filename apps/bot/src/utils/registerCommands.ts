import fs from 'node:fs'
import path from 'node:path'
import { Routes } from 'discord.js'

import { config } from '../config'
import type { UsableClient } from '../client'
import type { Command } from '../types'

const { DISCORD_CLIENT_ID, GUILD_ID } = config.env

export async function registerCommands(client: UsableClient) {
  const commandsPath = path.join(__dirname, '..', 'commands')
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.ts'))

  const slashCommands = commandFiles.map((x) => {
    // eslint-disable-next-line ts/no-var-requires, ts/no-require-imports
    console.log('aa',path.join(commandsPath, x))
    const cmd = require(path.join(commandsPath, x)).default as Command
    // cmd.state = cmd.state ?? {}

    const builder = cmd?.withBuilder ?? {}

    delete cmd.withBuilder


    const data = { ...builder, ...cmd }
    console.log(data)
    client.commands.set(data.name, data)
    return data
  })

  client.log(`Started refreshing ${slashCommands.length} commands.`)

  client.log(`Commands: ${slashCommands.map(x => x.name).join(', ')}`)

  await client.rest.put(
    Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GUILD_ID),
    {
      body: slashCommands,
      reason: 'Routes.applicationGuildCommands',
    },
  )

  if (process.env.NODE_ENV === 'production') {
    await client.rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
      body: slashCommands,
    })
  }
  client.log(`Refreshed ${slashCommands.length} commands.`)
}

export default registerCommands
