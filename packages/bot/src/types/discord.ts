import type { MaybePromise, Prettify } from 'shared'
import type { UsableClient } from 'src/client'
import type { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, Interaction as CringeInteraction, StringSelectMenuInteraction } from 'discord.js'

export type Interaction = CringeInteraction & {
  client: UsableClient
}

export type InteractionLike = CringeInteraction | ButtonInteraction | StringSelectMenuInteraction | ChatInputCommandInteraction

export type Helper<State, HelperKeys extends string[], Self extends string> = (o: Omit<RunOptions<State, Exclude<HelperKeys, Self>>, 'invokeHelper'>) => MaybePromise<void>

export interface RunOptions<State, HelperKeys extends string[], InteractionType = InteractionLike> {
  state: State

  client: UsableClient
  interaction: InteractionType

  helpers: Helpers<State, HelperKeys>

  invokeHelper: HelperKeys extends string[] ? <K extends HelperKeys[number]>(k: K, overwrite?: Partial<RunOptions<State, HelperKeys>>) => MaybePromise<void> : undefined
}

export interface CommonCommand<State, HelperKeys extends string[]> {
  name: string
  description: string
  run: (o: RunOptions<State, HelperKeys, ChatInputCommandInteraction>) => MaybePromise<any>
  autocomplete?: (o: RunOptions<State, HelperKeys, AutocompleteInteraction>) => MaybePromise<void>
}

export type Helpers<State, HelperKeys extends string[]> = Prettify<{
  [K in HelperKeys[number]]: Helper<State, HelperKeys, K>
}>

export type Command<State = never, HelperKeys extends string[] = never> = CommonCommand<State, HelperKeys> & {
  withBuilder?: any

  helpers?: Helpers<State, HelperKeys>
}

export type ClientCommand<State, HelperKeys extends string[]> = CommonCommand<State, HelperKeys> & {
  helpers?: Helpers<State, HelperKeys>
}
