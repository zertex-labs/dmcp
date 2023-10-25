import { Embed, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import type { AvailablePet, Pet, ServiceResponse } from 'shared'
import { availablePets } from 'shared'

import { adminIds } from 'shared/data'
import axios from 'axios'
import { apiSecretHeaders } from 'src/utils/headers'
import { config } from 'src/config'
import { getOptions } from '../utils/getOptions'
import type { Command } from '../types'
import getSubcommand from '../utils/getSubcommand'

interface StringOptions {
  name: string
  type: AvailablePet
}

export default {
  name: 'pets',
  description: 'Give user a pet',
  withBuilder: new SlashCommandBuilder()
    .addSubcommand(sub =>
      sub
        .setName('select')
        .setDescription('Select a pet')
        .addStringOption(opt =>
          opt
            .setName('name')
            .setDescription('The name of the pet to select')
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand(sub => sub
      .setName('list')
      .setDescription('List your or someone else\'s pets')
      .addUserOption(opt => opt.setName('user')
        .setDescription('User to list pets of')))
    .addSubcommand(sub =>
      sub
        .setName('active')
        .setDescription('Get your active pet')
        .addUserOption(opt => opt.setName('user')
          .setDescription('User to get active pet of')),
    )
    .addSubcommand(sub =>
      sub
        .setName('give')
        .setDescription('Give user a pet')
        .addUserOption(opt =>
          opt
            .setName('user')
            .setDescription('User to give pet to')
            .setRequired(true),
        )
        .addStringOption(opt =>
          opt
            .setName('name')
            .setDescription('Name of pet to give')
            .setRequired(true),
        )
        .addStringOption(opt =>
          opt
            .setName('type')
            .setDescription('Type of pet to give')
            .setRequired(true)
            .addChoices(
              ...availablePets.map(pet => ({ name: pet, value: pet })),
            ),
        ),
    ),
  autocomplete: async ({ interaction }) => {
    if (!interaction.isAutocomplete()) return // ts is dumb

    const focusedOption = interaction.options.getFocused(true)
    if (focusedOption.name !== 'name') return

    const ownedRes = await axios.get<Pet[]>(
        `http://localhost:3000/api/pets/owned/${interaction.user.id}`,
        {
          headers: apiSecretHeaders,
        },
    )

    if (ownedRes.status !== 200) {
      return void interaction.respond([
        { name: 'Error', value: 'Error getting pets' },
      ])
    }
    const { data: pets } = ownedRes

    await interaction.respond(
      pets.map(pet => ({
        name: pet.displayName,
        value: `${pet.displayName}@${pet.uuid}`,
      })),
    )
  },
  run: async ({ client, interaction }) => {
    if (!interaction.isCommand()) return

    const subcommand = getSubcommand<['give', 'select', 'active', 'list']>(
      interaction.options,
    )

    // TODO please cleanup this
    switch (subcommand) {
      case 'give':
        if (!adminIds.includes(interaction.user.id)) {
          return void interaction.reply(
            'You do not have permission to use this command',
          )
        }

        const user = interaction.options.getUser('user', true)
        if (!user) return void interaction.reply('User not found')

        const { id: ownerId } = user
        const { name: displayName, type: petType } = getOptions<StringOptions>(
          interaction.options,
          ['name', 'type'],
        )

        if (!displayName || !petType)
          return void interaction.reply('Invalid options')

        const giveRes = await axios.put(
          'http://localhost:3000/api/pets/giveToUser',
          { ownerId, type: petType, displayName },
          {
            validateStatus: () => true,
            headers: apiSecretHeaders,
          },
        )

        console.log(giveRes.status)

        if (giveRes.status !== 200) {
          const { data } = giveRes
          if (
            typeof data == 'string'
            && data.includes('pets_display_name_unique')
          ) {
            return void interaction.reply(
              'This pet name is already taken, please choose another.',
            )
          }

          client.interactionError(interaction, `${JSON.stringify(giveRes.data)}; Giving pet to user`)
          return void interaction.reply('Error giving pet to user')
        }

        interaction.reply('Pet created, use /pet select to select it')
        break
      case 'select':
        const { name: uuidAndName } = getOptions<{ name: string }>(
          interaction.options,
          ['name'],
        )

        if (!uuidAndName) return void interaction.reply('Invalid options')

        const [name, uuid] = uuidAndName.split('@')
        if (!uuid || !name) return void interaction.reply('Invalid options')

        const reply = await interaction.reply(`Selecting pet...`)

        const selectRes = await axios.post(
          `http://localhost:3000/api/users/${interaction.user.id}/selectPet`,
          { petId: uuid },
          {
            validateStatus: () => true,
            headers: apiSecretHeaders,
          },
        )

        if (selectRes.status !== 200) {
          client.interactionError(interaction, `${JSON.stringify(selectRes.data)}; ${uuidAndName}; Selecting pet`)
          return void reply.edit('Error selecting pet, please try again later')
        }

        reply.edit(`Selected pet ${name} and ${uuid}`)

        break
      case 'active':
        const activeUser = interaction.options.getUser('user') ?? interaction.user
        if (activeUser.bot) return void interaction.reply('Bots cannot have pets')

        const activeReply = await interaction.reply('Getting active pet...')

        const activeRes: ServiceResponse<Pet> = await fetch(`${config.env.API_URL}/api/users/${activeUser.id}/activePet`, {
          headers: apiSecretHeaders,
        }).then((res) => { console.log(res); return res.json() })

        if (activeRes.status === 'error') {
          return activeReply.edit({
            content: `We encountered an error while getting your active pet, please try again later. ${activeRes.statusCode < 500 ? `Error: ${activeRes.error}` : ''}`,
          })
        }

        const pet = activeRes.data
        const slotFields = pet.upgradeSlots.map((slot, i) => ({
          name: `Slot ${i + 1}`,
          value: slot,
        }))

        console.log(pet)

        activeReply.edit(
          {
            embeds: [
              new EmbedBuilder()
                .setTitle(`${pet.displayName} (Lvl. ${pet.level})`)
                .addFields(
                  {
                    name: 'Bought slot',
                    value: pet.boughtSlot ? 'Yes' : 'No',
                  },
                  ...slotFields,
                )
                .setThumbnail(`${config.env.API_URL}/images/${pet.type}.png`), // needs to be https, so use ngrok and set API_URL to ngrok url
              // .setImage('https://avatars.githubusercontent.com/u/106680301?s=48&v=4'),
            ],
          },
        )

        break
      case 'list':
        const listUser = interaction.options.getUser('user') ?? interaction.user
        if (listUser.bot) return void interaction.reply('Bots cannot have pets')

        try {
          const listReq = await axios.get<Pet[]>(`http://localhost:3000/api/pets/owned/${listUser.id}`, {
            headers: apiSecretHeaders,
          })
          const pets = listReq.data

          if (pets.length === 0) {
            interaction.reply({
              content: `**${listUser.username}** has no pets.`,
              ephemeral: true,
            })
          }

          interaction.reply({
            embeds: [
              new EmbedBuilder().setTitle(`${listUser.username}'s pets`)
                .addFields(
                  ...pets.map(pet => ({
                    name: `${pet.displayName} - ${pet.type.toUpperCase()}`,
                    value: `Level: ${pet.level}; Bought slots: ${pet.boughtSlot ? 'yes' : 'no'}`,
                  })),
                ),
            ],
          })
        }
        catch (e: any) {
          client.interactionError(interaction, e)
          await interaction.reply('Something went wrong, please try again later.')
        }
        break
      default:
        interaction.reply('Unknown subcommand')
    }
  },
} satisfies Command
