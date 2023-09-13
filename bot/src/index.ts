import 'dotenv/config';

import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';

const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = process.env;

// const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN!);
const client = new Client({
  intents: []
});

client.on('ready', () => {
  console.log('Logged in as ' + client.user?.tag);
});

client.on('error', (err) => {
  console.error('Something Broke!', err);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

async function start(token: string | undefined) {
  // try {
  //   console.log('Started refreshing application (/) commands.');

  //   await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID!), {
  //     body: [
  //       {
  //         name: 'ping',
  //         description: 'Replies with Pong!'
  //       }
  //     ]
  //   });
  // } catch (error) {
  //   console.error(error);
  // }

  client.login(token);
}

start(DISCORD_BOT_TOKEN);
