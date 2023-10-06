import { User, randomNumber, useFarmingCache } from 'shared';
import { Command } from '../types';
import axios from 'axios';

export default {
  name: 'farm',
  description: 'Run this command to start farming',

  run: async ({ client, interaction }) => {
    if (!interaction.isCommand()) return;

    const reply = await interaction.reply('Checking the soil');

    const userRes = await axios.get<User>(
      `http://localhost:3000/api/users/${interaction.user.id}`,
      {
        validateStatus: () => true,
        headers: {
          'x-api-secret': process.env.API_SECRET
        }
      }
    );

    if (userRes.status !== 200) {
      return void reply.edit('You need to create an account first');
    }

    reply.edit(JSON.stringify(useFarmingCache().farm(userRes.data)));
  }
} satisfies Command;
