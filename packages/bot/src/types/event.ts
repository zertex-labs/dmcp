import { ClientEvents as DiscordClientEvents, ClientEvents } from 'discord.js';
import { Interaction } from './discord';
import { UsableClient } from '../client';

export type UsableClientEvents = DiscordClientEvents & {
  interactionCreate: [Interaction];
};

export type ClientEvent = keyof UsableClientEvents;
export type Event<Event extends ClientEvent> = (
  client: UsableClient,
  ...args: UsableClientEvents[Event]
) => void;

