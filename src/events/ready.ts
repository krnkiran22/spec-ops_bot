import { Client, ActivityType } from 'discord.js';

export function registerReadyEvent(client: Client) {
  client.once('ready', (c) => {
    console.log(`[Bot] Logged in as ${c.user.tag}`);
    c.user.setPresence({
      activities: [{ name: 'Raise a ticket | /setup-tickets', type: ActivityType.Watching }],
      status: 'online',
    });
  });
}
