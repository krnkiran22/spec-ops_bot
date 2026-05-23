import { REST, Routes } from 'discord.js';
import { config } from './config';
import { setupTicketsCommand } from './commands/setupTickets';
import { ticketAdminCommand } from './commands/ticketAdmin';

const commands = [setupTicketsCommand, ticketAdminCommand].map((c) => c.data.toJSON());

const rest = new REST().setToken(config.discord.token);

(async () => {
  try {
    console.log('[Deploy] Registering slash commands...');

    // Register globally (takes up to 1 hour to propagate)
    // For instant dev testing, use guild-specific registration below
    const route = config.discord.guildId
      ? Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId)
      : Routes.applicationCommands(config.discord.clientId);

    await rest.put(route, { body: commands });

    console.log(`[Deploy] Successfully registered ${commands.length} commands.`);
    if (config.discord.guildId) {
      console.log(`[Deploy] Registered to guild ${config.discord.guildId} (instant)`);
    } else {
      console.log('[Deploy] Registered globally (may take up to 1 hour)');
    }
  } catch (error) {
    console.error('[Deploy] Error:', error);
    process.exit(1);
  }
})();
