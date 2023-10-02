import { UsableClient } from '../client';
import path from 'path';
import fs from 'fs';
import { removeExtension } from './file';

export function registerEvents(client: UsableClient) {
  const eventsPath = path.join(__dirname, '..', 'events');
  fs.readdirSync(eventsPath)
    .filter((x) => x.endsWith('.ts'))
    .forEach((fileName) => {
      const event = require(`${eventsPath}/${fileName}`).default;
      const eventName = removeExtension(fileName);
      client[eventName.startsWith('$') ? 'once' : 'on'](eventName, (...args) =>
        event.execute(client, ...args)
      );
      client.log(`Registered event ${eventName} (${eventsPath}/${fileName})`);
    });
}
