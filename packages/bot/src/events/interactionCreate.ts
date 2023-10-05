import { Event, Prettify } from '../types';

export const run: Event<'interactionCreate'> = (client, interaction) => {
  if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
    const command = client.commands.find(
      (cmd) => cmd.name == interaction.commandName
    );

    if (interaction.isChatInputCommand()) {
      command?.run({ interaction, client })?.catch(console.log);
    } else if (interaction.isAutocomplete()) {
      command?.autocomplete?.({ interaction, client })?.catch(console.log);
    }
  }
};
