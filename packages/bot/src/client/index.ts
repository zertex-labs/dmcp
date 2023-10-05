import { Client, ClientOptions, Collection } from 'discord.js';

import Logger from '../utils/logger';
import path from 'path';
import { ClientCommand } from '../types';

export class UsableClient extends Client {
  public commands: Collection<String, ClientCommand>;
  public logger: Logger;

  constructor(o: ClientOptions) {
    super(o);
    this.commands = new Collection();
    this.logger = new Logger(path.join(__dirname, '..', 'Logs.log'));

    this.rest.setToken(process.env.DISCORD_BOT_TOKEN!);
  }

  log(text: string) {
    this.logger.log(text);
  }
}

export * from './axios';
