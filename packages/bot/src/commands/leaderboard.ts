import useLeaderboard from 'shared/composables/useLeaderboard'
import type { Command } from '../types'

const leaderboard = useLeaderboard()

export default {
  name: 'leaderboard',
  description: 'leaderboard',

  run: async ({ interaction }) => {
    if (!interaction.isCommand()) return
  },
} satisfies Command
