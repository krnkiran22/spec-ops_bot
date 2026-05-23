import { Client, Interaction } from 'discord.js';
import { commands } from '../bot';
import { handleButton } from '../handlers/buttonHandler';
import { handleModal } from '../handlers/modalHandler';

export function registerInteractionEvent(client: Client) {
  client.on('interactionCreate', async (interaction: Interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
      } else if (interaction.isButton()) {
        await handleButton(interaction);
      } else if (interaction.isModalSubmit()) {
        await handleModal(interaction);
      }
    } catch (error) {
      console.error('[InteractionCreate] Error:', error);
      const msg = { content: 'Something went wrong. Please try again.', ephemeral: true };
      if (interaction.isRepliable()) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg).catch(() => null);
        } else {
          await interaction.reply(msg).catch(() => null);
        }
      }
    }
  });
}
