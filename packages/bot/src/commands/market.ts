import type { Command } from 'src/types'

export default {
  name: 'market',
  description: `Sell your farmed crops for $\{todoCurrency}}`,

  run: ({ interaction }) => {
    interaction.reply('todo')
  },
} satisfies Command
