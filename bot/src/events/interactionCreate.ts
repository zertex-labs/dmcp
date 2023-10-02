import { Event, Prettify } from '../types';

const run: Event<'interactionCreate'> = (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { client } = interaction;
    const command = client.commands.find(
      (cmd) => cmd.name == interaction.commandName
    );
    command?.run({ interaction, client });
  }
};

export default run;
