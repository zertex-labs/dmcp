import { UsableClient } from '../client';
import path from 'path';
import fs from 'fs';
import { removeExtension } from './file';

export function registerEvents(client: UsableClient) {
  const eventsPath = path.join(__dirname, '..', 'events');
  fs.readdirSync(eventsPath)
    .filter((x) => x.endsWith('.ts'))
    .forEach((fileName) => {
      const event = require(`${eventsPath}/${fileName}`);
      let eventName = removeExtension(fileName);
      if (!event?.run) {
        client.log(
          `Event ${eventName} (${eventsPath}/${fileName}) does not have a run function`
        );
        process.exit(void 0);
      }
      let isOnce = eventName.startsWith('$');
      eventName = eventName.substring(isOnce ? 1 : 0);
      client[isOnce ? 'once' : 'on'](eventName, (...args) =>
        event.run(client, ...args)
      );
      client.log(
        `Registered ${
          isOnce ? 'once' : 'on'
        }.${eventName} (${eventsPath}/${fileName})`
      );
    });
}
