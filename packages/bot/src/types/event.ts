import type { ClientEvents as DiscordClientEvents } from 'discord.js'
import type { UsableClient } from '../client'
import type { Interaction } from './discord'

export type UsableClientEvents = DiscordClientEvents & {
  interactionCreate: [Interaction]
}

export type ClientEvent = keyof UsableClientEvents
export type Event<Event extends ClientEvent> = (
  client: UsableClient,
  ...args: UsableClientEvents[Event]
) => void
