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
      const eventName = removeExtension(fileName);
      if (!event?.run) {
        client.log(
          `Event ${eventName} (${eventsPath}/${fileName}) does not have a run function`
        );
        process.exit(void 0);
      }
      client[eventName.startsWith('$') ? 'once' : 'on'](eventName, (...args) =>
        event.run(client, ...args)
      );
      client.log(`Registered event ${eventName} (${eventsPath}/${fileName})`);
    });
}
