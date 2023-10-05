import { Event } from '../types';
import axios from 'axios';

export const run: Event<'ready'> = async (client) => {
  client.log('Logged in as ' + client.user?.tag);
}