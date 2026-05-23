import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import type { CommandModule } from './types';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

// Attach command collection to client
export const commands = new Collection<string, CommandModule>();
