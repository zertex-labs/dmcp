import type { FarmingUser } from 'shared'
import axios from 'axios'
import { apiSecretHeaders } from 'src/utils/headers'
import type { Command } from '../types'

export default {
  name: 'leaderboard',
  description: 'leaderboard',

  run: async ({ client, interaction }) => {
    if (!interaction.isCommand()) return

    const leaderboardReq = await axios.get<FarmingUser[]>(`http://localhost:3000/api/farming/leaderboard`, {
      headers: apiSecretHeaders,
      validateStatus: s => s < 500,
    })

    if (leaderboardReq.status !== 200) {
      console.log(leaderboardReq.status, leaderboardReq.data)
      await interaction.reply({
        content: `Something went wrong. Please try again later.`,
        ephemeral: true,
      })
      return
    }

    const leaderboard = leaderboardReq.data
    const username = (id: string) => client.users.cache.get(id)?.username ?? 'Unknown'
    const leaderboardText = leaderboard.map((user, i) => `${i + 1}. **${username(user.id)}** - ${user.totalWeight}p. (${user.total} items)`).join('\n')

    await interaction.reply({
      content: `**Farming Leaderboard**\n${leaderboardText}`,
    })
  },
} satisfies Command
