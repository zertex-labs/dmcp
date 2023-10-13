import path from 'node:path'
import fs from 'node:fs'
import type { UsableClient } from '../client'
import { removeExtension } from './file'

export function registerEvents(client: UsableClient) {
  const eventsPath = path.join(__dirname, '..', 'events')
  fs.readdirSync(eventsPath)
    .filter(x => x.endsWith('.ts'))
    .forEach((fileName) => {
      // eslint-disable-next-line ts/no-var-requires, ts/no-require-imports
      const event = require(`${eventsPath}/${fileName}`)
      let eventName = removeExtension(fileName)
      if (!event?.run) {
        client.log(
          `Event ${eventName} (${eventsPath}/${fileName}) does not have a run function`,
        )
        process.exit(0)
      }
      const isOnce = eventName.startsWith('$')
      eventName = eventName.substring(isOnce ? 1 : 0)
      client[isOnce ? 'once' : 'on'](eventName, (...args) =>
        event.run(client, ...args))
      client.log(
        `Registered ${
          isOnce ? 'once' : 'on'
        }.${eventName} (${eventsPath}/${fileName})`,
      )
    })
}
