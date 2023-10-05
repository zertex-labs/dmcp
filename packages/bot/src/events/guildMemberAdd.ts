import { Event } from '../types';
import axios from 'axios';

export const run: Event<'guildMemberAdd'> = async (client, member) => {
  if (member.user.bot) return;

  const res = await axios.put<{ id: string }>(
    'http://localhost:3000/api/on/guildMemberAdd',
    {
      id: member.id
    }
  );

  if (res.status !== 200) {
    console.error('Failed to add user to db', (res.data as any).message);
    return;
  }
  const { id } = res.data;

  console.log('id', id);
};
