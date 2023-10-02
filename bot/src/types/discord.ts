import {
  ApplicationCommandOptionType,
  Interaction as CringeInteraction,
  SlashCommandBuilder
} from 'discord.js';

import { UsableClient } from '../client';
import { MaybePromise } from '.';

export type RunOptions = {
  client: UsableClient;
  interaction: Interaction;
};

export type Interaction = CringeInteraction & {
  client: UsableClient;
};

type CommandStringOption = {
  name: string;
  description: string;
  required?: boolean;
  type: ApplicationCommandOptionType;
  choices?: {
    name: string;
    value: string;
  }[];
};

type CommonCommand = {
  name: string;
  description: string;
  run: (o: RunOptions) => MaybePromise<void>;
};

export type Command = CommonCommand & {
  withBuilder?: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
};

export type ClientCommand = CommonCommand & {
  options?: CommandStringOption[];
};
