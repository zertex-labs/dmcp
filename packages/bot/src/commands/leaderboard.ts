import type { Command } from '../types'

export default {
  name: 'leaderboard',
  description: 'leaderboard',

  run: async ({ interaction }) => {
    if (!interaction.isCommand()) return
  },
} satisfies Command
