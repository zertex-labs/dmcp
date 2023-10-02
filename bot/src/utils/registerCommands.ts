import { Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { UsableClient } from '../client';
import { ClientCommand, Command } from '../types';

// @ts-ignore satisfies is braindead
const commandOptions = ['stringOptions'] as const satisfies (keyof Command)[]

const {DISCORD_CLIENT_ID, GUILD_ID } = process.env;

export async function registerCommands(client: UsableClient) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.ts'));

  let slashCommands = commandFiles.map((x) => {
    const cmd = require(path.join(commandsPath, x)).default as Command;
    const clientCmd = { ...cmd, options: [...commandOptions.flatMap(co => cmd?.[co] || [])] } satisfies ClientCommand
    client.commands.set(clientCmd.name, clientCmd)

    return clientCmd
  });

  try {
    console.log(
      `Started refreshing ${slashCommands.length} slash (/) commands.`
    );

    await client.rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID!, GUILD_ID!),
      {
        body: slashCommands
      }
    );

    if (process.env.NODE_ENV == 'production') {
      await client.rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID!), {
        body: slashCommands
      });
    }
    console.log(`Refreshed ${slashCommands.length} slash (/) commands.`);
  } catch (error) {
    console.error(error);
  }
}

export default registerCommands;
