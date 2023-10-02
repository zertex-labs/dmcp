import 'dotenv/config';

import { GatewayIntentBits } from 'discord.js';
import { UsableClient } from './client';
import { registerCommands } from './utils';
import { registerEvents } from './utils/registerEvents';

const { DISCORD_BOT_TOKEN } = process.env;

const client = new UsableClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers]
});

async function start(token: string | undefined) {
  await registerCommands(client);
  registerEvents(client);
  
  client.login(token);
}

start(DISCORD_BOT_TOKEN);
