import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';
import type { CommandModule } from '../types';
import { prisma } from '../db/prisma';

export const ticketAdminCommand: CommandModule = {
  data: new SlashCommandBuilder()
    .setName('tickets')
    .setDescription('Manage and view tickets (Ops team only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setDescription('List open tickets')
        .addStringOption((opt) =>
          opt
            .setName('status')
            .setDescription('Filter by status')
            .setRequired(false)
            .addChoices(
              { name: 'Open', value: 'OPEN' },
              { name: 'In Progress', value: 'IN_PROGRESS' },
              { name: 'Pending User', value: 'PENDING_USER' },
              { name: 'Escalated', value: 'ESCALATED' },
              { name: 'Resolved', value: 'RESOLVED' }
            )
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('view')
        .setDescription('View a specific ticket')
        .addStringOption((opt) =>
          opt.setName('ref').setDescription('Ticket reference (e.g., T-0042)').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('stats').setDescription('View ticket statistics for this server')
    ) as unknown as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') await handleList(interaction);
    else if (sub === 'view') await handleView(interaction);
    else if (sub === 'stats') await handleStats(interaction);
  },
};

async function handleList(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const statusFilter = interaction.options.getString('status') ?? undefined;
  if (!interaction.guildId) return;

  const tickets = await prisma.ticket.findMany({
    where: {
      guildId: interaction.guildId,
      ...(statusFilter ? { status: statusFilter as never } : { status: { not: 'RESOLVED' } }),
    },
    orderBy: { createdAt: 'desc' },
    take: 15,
  });

  if (tickets.length === 0) {
    await interaction.editReply({ content: 'No tickets found.' });
    return;
  }

  const lines = tickets.map((t) => {
    const thread = t.threadId ? ` · [Thread](https://discord.com/channels/${t.guildId}/${t.threadId})` : '';
    return `**${t.ticketRef}** [${t.status}] ${t.type} — ${t.subject.slice(0, 50)} · <@${t.raisedById}>${thread}`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle(`Tickets — ${statusFilter ?? 'Active'}`)
    .setDescription(lines.join('\n'))
    .setFooter({ text: `Showing ${tickets.length} tickets` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleView(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const ref = interaction.options.getString('ref', true).toUpperCase();
  const ticket = await prisma.ticket.findUnique({ where: { ticketRef: ref } });

  if (!ticket) {
    await interaction.editReply({ content: `Ticket **${ref}** not found.` });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle(`Ticket ${ticket.ticketRef}`)
    .addFields(
      { name: 'Type', value: ticket.type, inline: true },
      { name: 'Status', value: ticket.status, inline: true },
      { name: 'Raised by', value: `<@${ticket.raisedById}>`, inline: true },
      { name: 'Subject', value: ticket.subject },
      { name: 'Description', value: ticket.description }
    )
    .setTimestamp(ticket.createdAt);

  if (ticket.threadId) {
    embed.addFields({
      name: 'Thread',
      value: `[Open Thread](https://discord.com/channels/${ticket.guildId}/${ticket.threadId})`,
    });
  }

  await interaction.editReply({ embeds: [embed] });
}

async function handleStats(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  if (!interaction.guildId) return;

  const [total, open, inProgress, escalated, resolved] = await Promise.all([
    prisma.ticket.count({ where: { guildId: interaction.guildId } }),
    prisma.ticket.count({ where: { guildId: interaction.guildId, status: 'OPEN' } }),
    prisma.ticket.count({ where: { guildId: interaction.guildId, status: 'IN_PROGRESS' } }),
    prisma.ticket.count({ where: { guildId: interaction.guildId, status: 'ESCALATED' } }),
    prisma.ticket.count({ where: { guildId: interaction.guildId, status: 'RESOLVED' } }),
  ]);

  const embed = new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle('Ticket Statistics')
    .addFields(
      { name: 'Total', value: String(total), inline: true },
      { name: 'Open', value: String(open), inline: true },
      { name: 'In Progress', value: String(inProgress), inline: true },
      { name: 'Escalated', value: String(escalated), inline: true },
      { name: 'Resolved', value: String(resolved), inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
