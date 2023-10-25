import type { ServiceResponse } from 'shared'
import { config } from 'src/config'
import type { Command } from 'src/types'
import { apiSecretHeaders } from 'src/utils/headers'

export default {
  name: 'shop',
  description: 'Run this command to open shop',

  run: async ({ interaction }) => {
    if (!interaction.isCommand()) return

    // dd-mm-yyyy
    const date = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replaceAll('/', '-')

    const res: ServiceResponse<unknown> = await fetch(`${config.env.API_URL}/api/farming/shop/${date}`, {
      headers: apiSecretHeaders,
    }).then((res) => {
      console.log(res)
      return res.json()
    }).catch(console.log)

    if (res.status === 'error') {
      const msg = `Something went wrong while fetching the shop for date ${date}.`
      interaction.reply(`${msg}${res.statusCode < 500 ? ` Error: ${res.error}` : ''}`)
      return
    }

    console.log(res)

    interaction.reply(JSON.stringify(res.data, null, 2))
  },
} satisfies Command
