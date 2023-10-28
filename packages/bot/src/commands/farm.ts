import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { EmbedBuilder } from 'discord.js'
import { type AvailableFood, type FarmingUser, type RarityOverwrite, type ServiceResponse, randomNumber } from 'shared'

import { apiSecretHeaders } from 'src/utils/headers'
import type { Command } from '../types'

const baseInterval = 2000
const baseIntervalIncrease = 1000

const intervalMessages = [
  'Checking the soil',
  'Watering the crops',
  'Pulling out the weeds',
  'Harvesting the crops',
  'Uhh.. this is taking a while',
  'Planting new crops',
  'Checking the animals',
  'Is this still going?',
  'Selling the crops',
  'Surely, it\'s done now?',
  'It\'s not??',
  'I\'m running out of messages',
  'I\'m really running out of messages',
  'Please stop',
  'I\'m not even halfway done',
  'Can you tell me a joke?',
  'I\'m bored',
  'Nah, if this is still going please @ some dev..',
] as const

const calculateInterval = () => baseInterval + randomNumber(1, baseIntervalIncrease)

export default {
  name: 'farm',
  description: 'Run this command to start farming',

  run: async ({ client, interaction }) => {
    let intervalCounter = 1 // skip first message
    let intervalId: NodeJS.Timeout | null = setTimeout(async () => {
      if (intervalId && intervalCounter >= intervalMessages.length) {
        clearTimeout(intervalId)
        intervalId = null
      }

      await interaction.editReply({
        content: intervalMessages[intervalCounter++],
      })
    }, calculateInterval())

    await interaction.reply(intervalMessages[0])

    const reply = (msg: string) => {
      interaction.editReply(msg)
      if (intervalId) {
        clearTimeout(intervalId)
        intervalId = null
      }
    }

    let axiosRes: AxiosResponse<ServiceResponse<{
      farmingUser: FarmingUser
      farmingResponse: {
        total: number
        items: {
          amount: number
          probability: number
          price: number
          maxItems: number
          rarityOverwrites: RarityOverwrite[]
          name: AvailableFood
          chance: number
        }[]
      }
    }>>

    // TODO move these axios request to actual functions cause it looks so cancer
    try {
      axiosRes = await axios.post(
      `http://localhost:3000/api/farming/action/farm`,
      { userId: interaction.user.id },
      {
        validateStatus: a => a < 500,
        headers: apiSecretHeaders,
      },
      )
    }
    catch (e: any) {
      client.interactionError(interaction, e)
      return reply('Something went wrong, please try again later.')
    }

    if (axiosRes.data.status === 'error') {
      const error = axiosRes.data.error
      if (error === 'User not found') {
        try {
          await axios.put(
            `http://localhost:3000/api/users/create`,
            { id: interaction.user.id },
            {
              validateStatus: a => a < 500,
              headers: apiSecretHeaders,
            },
          )

          // retry
          axiosRes = await axios.post(
            `http://localhost:3000/api/farming/action/farm`,
            { userId: interaction.user.id },
            {
              validateStatus: a => a < 500,
              headers: apiSecretHeaders,
            },
          )
        }
        catch (e: any) {
          client.interactionError(interaction, e)
          return reply('Something went wrong creating the user, please try again later.')
        }
      }
      else {
        const status = axiosRes.data.statusCode ?? axiosRes.status
        return reply(status < 500 ? error : 'Something went wrong, please try again later.')
      }
    }

    if (axiosRes.data.status === 'error')
      return void reply('Something went wrong, please try again later.')

    const { farmingResponse, farmingUser } = axiosRes.data.data
    console.log(axiosRes.data.data)
    intervalId && clearTimeout(intervalId)

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Farming')
          .addFields({
            name: 'User',
            value: `User Total: ${farmingUser.total}`,
          })
          .addFields(
            ...Object.entries(farmingUser.individual).map(([item, amount]) => ({
              name: item,
              value: `${amount}`,
            })),
          )
          .addFields(
            ...farmingResponse.items.map(item => ({
              name: item.name,
              value: `${item.amount} (1-${item.maxItems})`,
            })),
          )
          .addFields({
            name: 'Total',
            value: `${farmingResponse.items.reduce(
              (acc, curr) => acc + curr.amount * curr.price,
              0,
            )}$ (${farmingResponse.total} crops)`,
          }),
      ],
    })
  },
} satisfies Command
