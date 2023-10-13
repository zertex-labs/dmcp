import type {
  ApplicationCommandOptionType,
  Interaction as CringeInteraction,
} from 'discord.js'

import type { MaybePromise } from 'shared'
import type { UsableClient } from '../client'

export interface RunOptions {
  client: UsableClient
  interaction: Interaction
}

export type Interaction = CringeInteraction & {
  client: UsableClient
}

interface CommandStringOption {
  name: string
  description: string
  required?: boolean
  type: ApplicationCommandOptionType
  choices?: {
    name: string
    value: string
  }[]
}

interface CommonCommand {
  name: string
  description: string
  run: (o: RunOptions) => MaybePromise<any>
  autocomplete?: (o: RunOptions) => MaybePromise<void>
}

export type Command = CommonCommand & {
  // use new SlashCommandBuilder() to create a builder. Their typings are broken (well mine are but..)
  withBuilder?: any
}

export type ClientCommand = CommonCommand & {
  options?: CommandStringOption[]
}
