import path from 'node:path'
import type { ClientOptions } from 'discord.js'
import { Client, Collection } from 'discord.js'

import Logger from '../utils/logger'
import type { ClientCommand } from '../types'

export class UsableClient extends Client {
  public commands: Collection<string, ClientCommand>
  public logger: Logger

  constructor(o: ClientOptions) {
    super(o)
    this.commands = new Collection()
    this.logger = new Logger(path.join(__dirname, '..', 'Logs.log'))

    this.rest.setToken(process.env.DISCORD_BOT_TOKEN!)
  }

  log(text: string) {
    this.logger.log(text)
  }
}

export * from './axios'
