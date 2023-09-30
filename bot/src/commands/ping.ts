import { Command } from '../types';

export default {
  name: 'ping',
  description: 'This command returns a pong',

  run: async ({ client, interaction }) => {
    if (!interaction.isCommand()) {
      console.log('This is not a command');
      return;
    }
    interaction.reply('Pong!');
  }
} satisfies Command;
