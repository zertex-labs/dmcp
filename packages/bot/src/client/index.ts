import path from 'node:path'
import type { ClientOptions } from 'discord.js'
import { Client, Collection } from 'discord.js'

import type { KeysMatching } from 'shared'
import Logger from '../utils/logger'
import type { ClientCommand, Interaction } from '../types'

export class UsableClient extends Client {
  public commands: Collection<string, ClientCommand>
  public logger: Logger

  constructor(o: ClientOptions) {
    super(o)
    this.commands = new Collection()
    this.logger = new Logger(path.join(__dirname, '..', 'Logs.log'))

    this.rest.setToken(process.env.DISCORD_BOT_TOKEN!)
  }

  log(text: string, level: Parameters<typeof this.logger.log>['1'] = 'info') {
    this.logger.log(text, level)
  }

  error(textOrError: string | Error) {
    this.log(this.processTextOrError(textOrError), 'error')
  }

  interactionError(interaction: Interaction, textOrError: string | Error) {
    const baseMsg = this.processTextOrError(textOrError)
    this.error(`${this.constructStringFromInteraction(interaction)}\n${baseMsg}`)
  }

  private processTextOrError(textOrError: string | Error) {
    return textOrError instanceof Error
      ? `${(textOrError?.stack ?? textOrError.message).replace('Error: ', '')}`
      : textOrError
  }

  private constructStringFromInteraction(interaction: Interaction) {
    const args: Record<string, string> = {}
    const add = (k: KeysMatching<Interaction, string> | {
      key: string
      value: string
    }) => {
      if (typeof k === 'object') return void (args[k.key] = k.value)

      const val = interaction[k]
      if (val) args[k] = val
    }

    console.log(interaction.isCommand())

    if (interaction.isCommand()) {
      console.log(interaction.options.data)

      interaction.options.data.forEach((option) => {
        args[`option+${option.name}`] = `${(option?.value?.toString() ?? 'no value')}(type ${option.type})`
      })

      add({
        key: 'command',
        value: interaction.commandName,
      })
    }

    add('applicationId')
    add('channelId')
    add({
      key: 'user',
      value: `${interaction.user.username}(${interaction.user.id})`,
    })
    add({
      key: 'guild',
      value: `${interaction.guild?.name}(${interaction.guild?.id})`,
    })

    return Object.entries(args).map(([k, v]) => `${k}: ${v}`).join('; ')
  }
}

export * from './axios'
