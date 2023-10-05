import { randomNumber } from 'shared';
import { Command } from '../types';

export default {
  name: 'farm',
  description: 'Run this command to start farming',

  run: async ({ client, interaction }) => {
    if (!interaction.isCommand()) return;

    const reply = await interaction.reply('Checking the soil');

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + randomNumber(0, 100))
    );
    reply.edit('Planting the seeds');

    await new Promise((resolve) => setTimeout(resolve, 1000));
    reply.edit('done');
  }
} satisfies Command;
