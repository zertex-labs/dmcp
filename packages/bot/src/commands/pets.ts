import { SlashCommandBuilder } from 'discord.js';
import { AvailablePet, Pet, availablePets } from 'shared';

import { apiClient } from '../client';
import { getOptions } from '../utils/getOptions';
import { Command } from '../types';
import getSubcommand from '../utils/getSubcommand';
import { adminIds } from 'shared/data';
import axios from 'axios';
import usePetsCache from '../utils/usePetsCache';

type StringOptions = {
  name: string;
  type: AvailablePet;
};

const petsCache = usePetsCache();

export default {
  name: 'pets',
  description: 'Give user a pet',
  withBuilder: new SlashCommandBuilder()
    .addSubcommand((sub) =>
      sub
        .setName('select')
        .setDescription('Select a pet')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('The name of the pet to select')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('active').setDescription('Get your active pet')
    )
    .addSubcommand((sub) =>
      sub
        .setName('give')
        .setDescription('Give user a pet')
        .addUserOption((opt) =>
          opt
            .setName('user')
            .setDescription('User to give pet to')
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Name of pet to give')
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName('type')
            .setDescription('Type of pet to give')
            .setRequired(true)
            .addChoices(
              ...availablePets.map((pet) => ({ name: pet, value: pet }))
            )
        )
    ),
  autocomplete: async ({ interaction }) => {
    if (!interaction.isAutocomplete()) return; // ts is dumb
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name !== 'name') return;

    let pets: Pet[] = [];
    const cached = petsCache.get(interaction.user.id);

    console.log('isCached', cached);
    if (cached) pets = cached;
    else {
      const ownedRes = await axios.get<Pet[]>(
        `http://localhost:3000/api/pets/owned/${interaction.user.id}`,
        {
          headers: {
            'x-api-secret': process.env.API_SECRET
          }
        }
      );

      if (ownedRes.status !== 200) {
        return void interaction.respond([
          { name: 'Error', value: 'Error getting pets' }
        ]);
      }
      const { data } = ownedRes;

      console.log('not cached', data)

      petsCache.set(interaction.user.id, data);
      pets = data;
    }

    await interaction.respond(
      pets.map((pet) => ({
        name: pet.displayName,
        value: `${pet.displayName}@${pet.uuid}`
      }))
    );
  },
  run: async ({ client, interaction }) => {
    if (!interaction.isCommand()) return;

    const subcommand = getSubcommand<['give', 'select', 'active']>(
      interaction.options
    );
    switch (subcommand) {
      case 'give':
        if (!adminIds.includes(interaction.user.id))
          return void interaction.reply(
            'You do not have permission to use this command'
          );

        const user = interaction.options.getUser('user', true);
        if (!user) return void interaction.reply('User not found');

        const { id: ownerId } = user;
        const { name: displayName, type: petType } = getOptions<StringOptions>(
          interaction.options,
          ['name', 'type']
        );

        if (!displayName || !petType)
          return void interaction.reply('Invalid options');

        const giveRes = await axios.put(
          'http://localhost:3000/api/pets/giveToUser',
          { ownerId, petType, displayName },
          {
            validateStatus: () => true,
            headers: {
              'x-api-secret': process.env.API_SECRET
            }
          }
        );

        console.log(giveRes.status);

        if (giveRes.status !== 200) {
          const { data } = giveRes;
          if (
            typeof data == 'string' &&
            data.includes('pets_display_name_unique')
          ) {
            return void interaction.reply(
              'This pet name is already taken, please choose another.'
            );
          }

          console.error('Error giving pet to user', giveRes.data);
          return void interaction.reply('Error giving pet to user');
        }

        interaction.reply('Pet created, use /pet select to select it');
        break;
      case 'select':
        const { name: uuidAndName } = getOptions<{ name: string }>(
          interaction.options,
          ['name']
        );

        if (!uuidAndName) return void interaction.reply('Invalid options');

        const [name, uuid] = uuidAndName.split('@');

        let reply = await interaction.reply(`Selecting pet...`);

        const selectRes = await axios.put(
          `http://localhost:3000/api/users/${interaction.user.id}/selectPet`,
          { petId: uuid },
          {
            validateStatus: () => true,
            headers: {
              'x-api-secret': process.env.API_SECRET
            }
          }
        );

        if (selectRes.status !== 200) {
          console.error('Error selecting pet', selectRes.data);
          return void reply.edit('Error selecting pet, please try again later');
        }

        reply.edit(`Selected pet ${name} and ${uuid}`);

        break;
      case 'active':
        const activeReply = await interaction.reply('Getting active pet...');

        const activeRes = await axios.get<Pet>(
          `http://localhost:3000/api/users/${interaction.user.id}/activePet`,
          {
            validateStatus: () => true,
            headers: {
              'x-api-secret': process.env.API_SECRET
            }
          }
        );

        if (activeRes.status !== 200) {
          console.error('Error getting active pet', activeRes.data);
          return void activeReply.edit(
            'Error getting active pet, please try again later'
          );
        }

        const { data: pet } = activeRes;

        activeReply.edit(`Your active pet is ${pet.displayName}(Lvl. ${pet.level})`);

        break;
    }
  }
} satisfies Command;
