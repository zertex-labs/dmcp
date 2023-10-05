import { Event } from '../types';

export const run: Event<'error'> = async (client, error) => {
  client.log(`${error.name}: ${error.message}\n${error.stack}`);
};
