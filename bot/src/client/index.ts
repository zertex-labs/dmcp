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

    this.on('ready', () => {
      console.log('Logged in as ' + this.user?.tag);
    });

    this.on('error', (err) => {
      this.log(err?.message ?? err);
      console.error('Everything Broke!', err);
      process.exit();
    });
  }

  log(text: string) {
    this.logger.log(text);
  }
}

export * from './axios'
