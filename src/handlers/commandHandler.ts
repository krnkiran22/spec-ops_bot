import { commands } from '../bot';
import { setupTicketsCommand } from '../commands/setupTickets';
import { ticketAdminCommand } from '../commands/ticketAdmin';

export function loadCommands() {
  const allCommands = [setupTicketsCommand, ticketAdminCommand];

  for (const command of allCommands) {
    commands.set(command.data.name, command);
  }

  console.log(`[Commands] Loaded ${commands.size} commands`);
}
