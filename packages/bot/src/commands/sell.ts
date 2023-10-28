import { SlashCommandBuilder } from 'discord.js'
import type { AvailableFood, FarmingUser, ServiceResponse } from 'shared'
import { capitalize, data } from 'shared'

import { config } from 'src/config'
import type { Command } from 'src/types'
import getOptions from 'src/utils/getOptions'

const normalizeStr = (name: string) => name.toLowerCase().split('_').map(capitalize).join(' ')

function calculateCropPrice(cropName: AvailableFood, amount: number) {
  const cropData = data.food[cropName]
  return cropData.price * amount
}

export default {
  name: 'sell',
  description: `Sell all or a specific crop. Run /farm to start farming!`,

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

    console.log(state)

    const res: ServiceResponse<FarmingUser> = await fetch(`${process.env.API_URL}/api/farming/user/${interaction.user.id}`, {
      headers: { 'x-api-secret': config.env.API_SECRET },
    })
      .then(res => res.json())

    if (res.status === 'error') {
      if (res.statusCode === 404)
        interaction.respond([{ name: 'Profile not found. Run /farm to start farming.', value: 'skip' }])

      return void client.interactionError(interaction, res.error, `Error getting farming user ${interaction.user.id}`)
    }

    const farmingUser = res.data
    state.farmingUser = farmingUser

    const individual = Object.entries(farmingUser.individual).filter(([,value]) => value > 0) as [AvailableFood, number][]

    console.log(individual)

    interaction.respond([
      { name: `All ${farmingUser.total} crops (ignores amount)`, value: `all` },
      ...individual.map(([cropName, amount]) => ({ name: `${normalizeStr(cropName)} (${amount} crops)`, value: cropName })),
    ])
  },

  run: async ({ interaction, state }) => {
    await interaction.deferReply()

    const { crop: type, amount } = getOptions<{ crop: AvailableFood | 'all'; amount?: number }>(interaction.options, ['crop', 'amount'])
    const { farmingUser } = state

    if (!farmingUser)
      return void interaction.followUp('Make sure to run /farm before selling crops')

    let totalValue = 0
    let cropAmout = 0
    if (type === 'all') {
      const individual = Object.entries(farmingUser.individual) as [AvailableFood, number][]
      cropAmout = farmingUser.total
      totalValue = individual.reduce((acc, [cropName, userAmount]) => {
        const cropPrice = calculateCropPrice(cropName, userAmount)
        return acc + cropPrice
      }, 0)
    }
    else {
      const userAmount = farmingUser.individual[type]
      cropAmout = amount ? Math.min(amount, userAmount) : userAmount
      const cropPrice = calculateCropPrice(type, cropAmout)
      totalValue = cropPrice
    }

    return interaction.followUp(`You sold ${normalizeStr(type)} (${cropAmout} crops) for $${totalValue} `)
  },
} satisfies Command<{ farmingUser: FarmingUser | undefined }>
