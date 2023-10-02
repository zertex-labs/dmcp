import { ClientEvents as DiscordClientEvents, ClientEvents } from 'discord.js';
import { Interaction } from './discord';

export type UsableClientEvents = DiscordClientEvents & {
  interactionCreate: [Interaction];
};

export type ClientEvent = keyof UsableClientEvents;
export type Event<Event extends ClientEvent> = (
  ...args: UsableClientEvents[Event]
) => void;

