import type { User } from 'shared'
import axios from 'axios'
import { EmbedBuilder } from 'discord.js'

import useFarmingHandler from 'shared/utils/useFarmingHandler'
import type { Command } from '../types'

export default {
  name: 'farm',
  description: 'Run this command to start farming',

  run: async ({ interaction }) => {
    if (!interaction.isCommand()) return

    const reply = await interaction.reply('Checking the soil')

    const userRes = await axios.get<User>(
      `http://localhost:3000/api/users/${interaction.user.id}`,
      {
        validateStatus: () => true,
        headers: {
          'x-api-secret': process.env.API_SECRET,
        },
      },
    )

    if (userRes.status !== 200)
      return void reply.edit('You need to create an account first')

    const { farmingResponse, farmingUser } = await useFarmingHandler().farm(
      userRes.data,
    )

    reply.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle('Farming')
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
