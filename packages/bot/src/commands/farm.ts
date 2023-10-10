import { User, randomNumber, useFarmingHandler } from 'shared';
import { Command } from '../types';
import axios from 'axios';
import { EmbedBuilder } from 'discord.js';

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

    const farmRes = useFarmingHandler().farm(userRes.data);

    reply.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle('Farming')
          .addFields(
            ...farmRes.map((item) => ({
              name: item.name,
              value: `${item.amount} (1-${item.maxItems})`
            }))
          )
          .addFields({
            name: 'Total',
            value: `${farmRes.reduce((acc, curr) => acc + curr.amount * curr.price, 0)}$ (${farmRes.reduce((acc, curr) => acc + curr.amount, 0)} crops)`
          })
      ]
    });
  }
} satisfies Command;
