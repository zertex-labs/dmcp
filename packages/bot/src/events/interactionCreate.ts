import { Event, Prettify } from '../types';

export const run: Event<'interactionCreate'> = (client, interaction) => {
  if (interaction.isChatInputCommand()) {
    const { client } = interaction;
    const command = client.commands.find(
      (cmd) => cmd.name == interaction.commandName
    );
    command?.run({ interaction, client });
  }
};
