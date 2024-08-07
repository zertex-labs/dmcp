import type { Event } from '../types'

const commandStateStorage: Record<string, any> = {}

export const run: Event<'interactionCreate'> = (client, interaction) => {
  const discordJsSucksAss = interaction as any

  // hopefully would get the command name from all the discord'js hacks
  const commandName
    = discordJsSucksAss?.commandName // chat input
    ?? discordJsSucksAss?.message?.interaction?.commandName // string select menu
    ?? discordJsSucksAss?.customId?.split(':')[0] // button

  if (!commandName) {
    client.error('Discord.js commandName died again. Have fun debugging.')
    return
  }

  const command = client.commands.find(
    cmd => cmd.name === commandName,
  )

  if (!command) return

  const state = commandStateStorage[command.name] ?? new Proxy({}, {
    set: (target, key, value) => {
      if (!commandStateStorage[command.name]) commandStateStorage[command.name] = {}
      commandStateStorage[command.name][key as string] = value;
      (target as any)[key] = value
      return true
    },
  })
  const helpers = command.helpers ?? {}
  if (interaction.isChatInputCommand()) {
    commandStateStorage[command.name] = {}
    return void command.run({
      interaction,
      client,
      state,
      invokeHelper: (helper, o) => {
        const overwrites = o ?? {}
        helpers[helper]({
          client: overwrites.client ?? client,
          helpers: overwrites.helpers ?? helpers,
          interaction: overwrites.interaction ?? interaction,
          state: overwrites.state ?? commandStateStorage[command.name] ?? {},
        })
      },
      helpers,
    })?.catch(client.error.bind(client))
  }

  else if (interaction.isAutocomplete()) {
    // eslint-disable-next-line style/object-property-newline
    return void command.autocomplete?.({ interaction, client, state, helpers, invokeHelper: (helper, o) => {
      const overwrites = o ?? {}
      helpers[helper]({
        client: overwrites.client ?? client,
        helpers: overwrites.helpers ?? helpers,
        interaction: overwrites.interaction ?? interaction,
        state: overwrites.state ?? commandStateStorage[command.name] ?? {},
      })
    } })?.catch(client.error.bind(client))
  }
}
