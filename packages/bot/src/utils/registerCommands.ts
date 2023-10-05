import { Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { UsableClient } from '../client';
import { ClientCommand, Command } from '../types';

const { DISCORD_CLIENT_ID, GUILD_ID } = process.env;

export async function registerCommands(client: UsableClient) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.ts'));

  let slashCommands = commandFiles.map((x) => {
    const cmd = require(path.join(commandsPath, x)).default as Command;
    let builder = cmd?.withBuilder ?? {};

    delete cmd.withBuilder;

    let data = { ...builder, ...cmd };
    client.commands.set(data.name, data);
    return data;
  });

  try {
    client.log(
      `Started refreshing ${slashCommands.length} commands.`
    );

    client.log(`Commands: ${slashCommands.map((x) => x.name).join(', ')}`)

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
    client.log(`Refreshed ${slashCommands.length} commands.`);
  } catch (error: any) {
    client.log(error?.message ?? error);
  }
}

export default registerCommands;
