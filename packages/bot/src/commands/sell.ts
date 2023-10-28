import { SlashCommandBuilder } from 'discord.js'
import type { Crop, FarmingUser, ServiceResponse } from 'shared'
import { capitalize, isValidSellCropInput, validSellCropInputs } from 'shared'

import { config } from 'src/config'
import type { Command } from 'src/types'
import getOptions from 'src/utils/getOptions'

const normalizeStr = (name: string) => name.toLowerCase().split('_').map(capitalize).join(' ')

export default {
  name: 'sell',
  description: 'Sell all or a specific crop. Run /farm to start farming!',

  withBuilder: new SlashCommandBuilder()
    .addStringOption(opt => opt
      .setName('crop')
      .setDescription('The crop you want to sell')
      .setRequired(true)
      .setAutocomplete(true),
    )
    .addNumberOption(opt => opt
      .setName('amount')
      .setDescription('The amount of crop you want to sell. If not specified, will sell all crops')
      .setMinValue(1)
      ,
    ),
  autocomplete: async ({ interaction, client, state }) => {
    const focusedOption = interaction.options.getFocused(true)
    if (focusedOption.name !== 'crop') return

    const isAllowed = validSellCropInputs.some(c => c.toLowerCase().includes(focusedOption.value.toLowerCase()))
    if (!isAllowed) {
      interaction.respond([{ name: `Invalid crop name. Allowed are: ${validSellCropInputs.join(', ')}`, value: 'invalidCrop' }])
      return
    }

    console.log('fetch')
    const res: ServiceResponse<FarmingUser> = await fetch(`${process.env.API_URL}/api/farming/user/${interaction.user.id}`, {
      headers: { 'x-api-secret': config.env.API_SECRET },
    })
      .then(res => res.json())
      .catch(client.error.bind(client))

    if (res.status === 'error') {
      console.log(res)
      if (res.statusCode === 404)
        await interaction.respond([{ name: 'Profile not found. Run /farm to start farming.', value: 'noProfile' }])

      return void client.interactionError(interaction, res.error, `Error getting farming user ${interaction.user.id}`)
    }

    const farmingUser = res.data
    state.farmingUser = farmingUser

    const individual = Object.entries(farmingUser.individual).filter(([,value]) => value > 0) as [Crop, number][]

    const responses = [
      { name: `All ${farmingUser.total} crops (ignores amount)`, value: 'ALL' },
      ...individual.map(([cropName, amount]) => ({ name: `${normalizeStr(cropName)} (${amount} crops)`, value: cropName })),
    ]

    interaction.respond(responses.filter(({ name }) => name.toLowerCase().includes(focusedOption.value.toLowerCase())))
  },

  run: async ({ interaction, client, state }) => {
    const { crop: type, amount } = getOptions<{ crop: string; amount?: number }>(interaction.options, ['crop', 'amount'])
    if (!state.farmingUser || type === 'noProfile')
      return void interaction.reply({ content: 'You\'ve not played the game yet. Please create an account by running /farm', ephemeral: true })

    await interaction.deferReply()
    if (type === 'invalidCrop' || !isValidSellCropInput(type)) {
      return void interaction.followUp({
        content: `Invalid crop name allowed are: **${validSellCropInputs.join(', ')}**`,
        ephemeral: true,
      })
    }

    const updateRes: ServiceResponse<{ totalValue: string; amount: string }> = await fetch(`${process.env.API_URL}/api/farming/sell/${type}`, {
      headers: { 'x-api-secret': config.env.API_SECRET, 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ amount, userId: interaction.user.id }),

    }).then(res => res.json())
      .catch(client.error.bind(client))

    if (!updateRes || updateRes.status === 'error') {
      interaction.followUp(`An error occured; ${updateRes?.statusCode < 500 ? updateRes.error : 'please try again later'}`)

      client.interactionError(interaction, updateRes?.error ? updateRes.error : 'no update res', `Error updating user balance ${interaction.user.id}`)
      return
    }

    const { totalValue, amount: finalAmount } = updateRes.data

    return interaction.followUp(`You sold ${normalizeStr(type)} (${finalAmount} crops) for $${totalValue} `)
  },
} satisfies Command<{ farmingUser: FarmingUser | undefined }>
