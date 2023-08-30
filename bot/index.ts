import "dotenv/config"

import { Client } from 'oceanic.js';
const client = new Client({
  auth: process.env.DISCORD_BOT_TOKEN,
});

client.on('ready', () => {
  console.log('Logged in as ' + client.user.tag);
});

client.on("error", (err) => {
  console.error("Something Broke!", err);
});

client.connect();
