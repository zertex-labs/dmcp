import { SlashCommandBuilder } from 'discord.js';
import { AvailablePet, availablePets } from 'shared';

import { apiClient } from '../client';
import { getOptions } from '../utils/getOptions';
import { Command } from '../types';

type StringOptions = {
  name: string;
  type: AvailablePet;
};

export default {
  name: 'give',
  description: 'Give user a pet',
  withBuilder: new SlashCommandBuilder()
    .addStringOption((opt) =>
      opt
        .setName('name')
        .setDescription('Name of the pet')
        .setMinLength(5)
        .setMaxLength(32)
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('type')
        .setDescription('Type of the pet')
        .addChoices(...availablePets.map((pet) => ({ name: pet, value: pet })))
        .setRequired(true)
    ),
  run: async ({ client, interaction }) => {
    if (!interaction.isCommand()) return;
    const a = interaction.options;

    const { type, name } = getOptions<StringOptions>(interaction.options, [
      'name',
      'type'
    ]);

    const res = await apiClient.post(
      '/pets/giveToUser',
      {
        userId: interaction.user.id,
        petType: type,
        petName: name
      },
      {
        validateStatus: () => true
      }
    );

    if (res.status !== 200) {
      console.error('Error giving pet to user', res.data);
      return void interaction.reply('Error giving pet to user');
    }

    interaction.reply('Pet given to user');
  }
} satisfies Command;
