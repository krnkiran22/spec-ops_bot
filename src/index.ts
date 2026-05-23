import { config } from './config';
import { client } from './bot';
import { loadCommands } from './handlers/commandHandler';
import { registerReadyEvent } from './events/ready';
import { registerInteractionEvent } from './events/interactionCreate';
import { prisma } from './db/prisma';

async function main() {
  console.log('[Startup] SpecOps Bot starting...');

  // Load commands into memory
  loadCommands();

  // Register Discord event handlers
  registerReadyEvent(client);
  registerInteractionEvent(client);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Shutdown] SIGTERM received, shutting down gracefully...');
    await prisma.$disconnect();
    client.destroy();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[Shutdown] SIGINT received, shutting down gracefully...');
    await prisma.$disconnect();
    client.destroy();
    process.exit(0);
  });

  // Log in to Discord
  await client.login(config.discord.token);
}

main().catch((error) => {
  console.error('[Startup] Fatal error:', error);
  process.exit(1);
});
