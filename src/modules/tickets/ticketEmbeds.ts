import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Ticket } from '@prisma/client';
import { TICKET_CATEGORY_BUTTON_IDS } from '../../types';

const STATUS_COLORS: Record<string, number> = {
  OPEN: 0x3b82f6,        // blue
  IN_PROGRESS: 0xf59e0b, // amber
  PENDING_USER: 0xa855f7,// purple
  RESOLVED: 0x22c55e,    // green
  ESCALATED: 0xef4444,   // red
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  PENDING_USER: 'Pending — Needs Your Response',
  RESOLVED: 'Resolved',
  ESCALATED: 'Escalated',
};

const TYPE_LABELS: Record<string, string> = {
  SALARY: 'Salary Query',
  REIMBURSEMENT: 'Reimbursement Request',
  ATTENDANCE: 'Attendance Issue',
  GENERAL: 'General Request',
};

export function buildTicketEmbed(ticket: Ticket): EmbedBuilder {
  const extra = ticket.extraData as Record<string, string> | null;
  const embed = new EmbedBuilder()
    .setColor(STATUS_COLORS[ticket.status] ?? 0x6b7280)
    .setTitle(`Ticket ${ticket.ticketRef}`)
    .setDescription(`**${TYPE_LABELS[ticket.type] ?? ticket.type}**`)
    .addFields(
      { name: 'Status', value: STATUS_LABELS[ticket.status] ?? ticket.status, inline: true },
      { name: 'Raised by', value: `<@${ticket.raisedById}> (${ticket.raisedByTag})`, inline: true },
      { name: 'Subject', value: ticket.subject },
      { name: 'Description', value: ticket.description }
    )
    .setTimestamp(ticket.createdAt)
    .setFooter({ text: `ID: ${ticket.ticketRef} · Raised at` });

  if (ticket.assignedTo) {
    embed.addFields({ name: 'Assigned To', value: `<@${ticket.assignedTo}> (${ticket.assignedToTag})`, inline: true });
  }

  if (extra && Object.keys(extra).length > 0) {
    const extraFields = Object.entries(extra)
      .filter(([, v]) => v)
      .map(([k, v]) => ({ name: formatKey(k), value: String(v), inline: true }));
    if (extraFields.length > 0) embed.addFields(...extraFields);
  }

  if (ticket.resolvedAt) {
    embed.addFields({ name: 'Resolved At', value: `<t:${Math.floor(ticket.resolvedAt.getTime() / 1000)}:f>`, inline: true });
  }

  return embed;
}

export function buildTicketActionRow(ticket: Ticket): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>();

  if (ticket.status === 'OPEN') {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${TICKET_CATEGORY_BUTTON_IDS.ASSIGN}_${ticket.id}`)
        .setLabel('Assign to Me')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${TICKET_CATEGORY_BUTTON_IDS.RESOLVE}_${ticket.id}`)
        .setLabel('Resolve')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`${TICKET_CATEGORY_BUTTON_IDS.ESCALATE}_${ticket.id}`)
        .setLabel('Escalate')
        .setStyle(ButtonStyle.Danger)
    );
  } else if (ticket.status === 'IN_PROGRESS') {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${TICKET_CATEGORY_BUTTON_IDS.RESOLVE}_${ticket.id}`)
        .setLabel('Resolve')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`${TICKET_CATEGORY_BUTTON_IDS.ESCALATE}_${ticket.id}`)
        .setLabel('Escalate')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`${TICKET_CATEGORY_BUTTON_IDS.CLOSE}_${ticket.id}`)
        .setLabel('Close Thread')
        .setStyle(ButtonStyle.Secondary)
    );
  } else if (ticket.status === 'ESCALATED') {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${TICKET_CATEGORY_BUTTON_IDS.RESOLVE}_${ticket.id}`)
        .setLabel('Mark Resolved')
        .setStyle(ButtonStyle.Success)
    );
  }

  return row;
}

export function buildRaiseTicketEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle('SpecOps Support')
    .setDescription(
      'Need help? Raise a ticket below and our team will assist you.\n\n' +
      '**Available categories:**\n' +
      '• **Salary Query** — Payment issues, payslip queries\n' +
      '• **Reimbursement** — Expense claims and refunds\n' +
      '• **Attendance Issue** — Missed punch, leave corrections\n' +
      '• **General** — Any other request\n\n' +
      '*Your conversation will be private — only you and the ops team can see your ticket.*'
    )
    .setFooter({ text: 'SpecOps Bot · Click the button below to get started' })
    .setTimestamp();
}

export function buildCategorySelectEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle('Select Ticket Category')
    .setDescription('Choose the category that best describes your issue:');
}

function formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
