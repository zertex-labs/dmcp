import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command, PetWithOwner, Pet } from '../types';
import getOptions from '../utils/getOptions';
import { apiClient } from '../client';

const choices = ['pets', 'balance'] as const;
type Choice = (typeof choices)[number];

type StringCommand = {
  stat: Choice;
};

export default {
  name: 'show',
  description: 'Show data about queried stat',
  withBuilder: new SlashCommandBuilder().addStringOption((opt) =>
    opt
      .setName('stat')
      .setRequired(true)
      .setDescription('Type of the stat')
      .addChoices(...choices.map((choice) => ({ name: choice, value: choice })))
  ),
  run: async ({ client, interaction }) => {
    if (!interaction.isCommand()) return;

    const { stat } = getOptions<StringCommand>(interaction.options, ['stat']);

    switch (stat) {
      case 'balance': {
        interaction.reply('die');
        break;
      }
      case 'pets': {
        const petsResponse = await apiClient.get<PetWithOwner[]>(
          `pets/owned?userId=${interaction.user.id}`,
          {
            headers: {
              Authorization: process.env.API_SECRET
            }
          }
        );
        const pets = petsResponse.data;
        if(pets.length == 0) {
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle('Pets')
                .setDescription('You have no pets')
            ]
          });
          return;
        }
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Pets')
              .setDescription(
                pets.map((pet) => `${pet.displayName} (${pet.type})`).join('\n')
              )
              .addFields(
                pets.map((pet) => ({
                  name: pet.displayName,
                  value: `${pet.type} - ${pet.owner.id}`
                }))
              )
          ]
        });
        break;
      }
    }
  }
} satisfies Command;
