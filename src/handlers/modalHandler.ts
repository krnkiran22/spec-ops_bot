import {
  ModalSubmitInteraction,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { MODAL_IDS } from '../types';
import { createTicket, updateTicketThread } from '../modules/tickets/ticketService';
import { buildTicketEmbed, buildTicketActionRow } from '../modules/tickets/ticketEmbeds';
import { config } from '../config';
import type { TicketType } from '@prisma/client';

export async function handleModal(interaction: ModalSubmitInteraction): Promise<void> {
  const { customId } = interaction;

  if (
    customId === MODAL_IDS.SALARY ||
    customId === MODAL_IDS.REIMBURSEMENT ||
    customId === MODAL_IDS.ATTENDANCE ||
    customId === MODAL_IDS.GENERAL
  ) {
    await handleTicketModal(interaction, customId);
    return;
  }
}

async function handleTicketModal(
  interaction: ModalSubmitInteraction,
  modalId: string
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  if (!interaction.guild) {
    await interaction.editReply({ content: 'This command can only be used in a server.' });
    return;
  }

  const { type, subject, description, extraData } = extractModalFields(interaction, modalId);

  // Create ticket in DB
  const ticket = await createTicket({
    guildId: interaction.guild.id,
    channelId: interaction.channelId ?? '',
    raisedById: interaction.user.id,
    raisedByTag: interaction.user.tag,
    type,
    subject,
    description,
    extraData,
  });

  // Create a private thread in the current channel
  const channel = interaction.channel;
  if (!channel || channel.type !== ChannelType.GuildText || !('threads' in channel)) {
    await interaction.editReply({ content: 'Could not create a ticket thread. Please contact an admin.' });
    return;
  }

  const threadChannel = channel as import('discord.js').TextChannel;
  const thread = await threadChannel.threads.create({
    name: `${ticket.ticketRef} — ${interaction.user.username}`,
    type: ChannelType.PrivateThread,
    reason: `Ticket ${ticket.ticketRef} raised by ${interaction.user.tag}`,
  });

  // Save thread ID to DB
  await updateTicketThread(ticket.id, thread.id);

  // Add the ticket raiser to the thread
  await thread.members.add(interaction.user.id);

  // Add ops role members if configured
  const opsRoleId = config.discord.opsRoleId;
  if (opsRoleId) {
    const opsRole = interaction.guild.roles.cache.get(opsRoleId);
    if (opsRole) {
      for (const [, member] of opsRole.members) {
        await thread.members.add(member.id).catch(() => null);
      }
    }
  }

  // Post the ticket embed in the thread
  const embed = buildTicketEmbed({ ...ticket, threadId: thread.id });
  const actionRow = buildTicketActionRow({ ...ticket, threadId: thread.id });

  await thread.send({
    content: `<@${interaction.user.id}> Your ticket has been created. Our team has been notified and will respond here shortly.`,
    embeds: [embed],
    components: [actionRow],
  });

  // Also notify ops channel if separate ops role exists
  if (opsRoleId) {
    await thread.send({
      content: `<@&${opsRoleId}> New ticket raised — please review above.`,
    });
  }

  await interaction.editReply({
    content: `Your ticket **${ticket.ticketRef}** has been created. [Open your ticket thread](https://discord.com/channels/${interaction.guild.id}/${thread.id})`,
  });
}

function extractModalFields(
  interaction: ModalSubmitInteraction,
  modalId: string
): { type: TicketType; subject: string; description: string; extraData: Record<string, string> } {
  const getField = (id: string) => interaction.fields.getTextInputValue(id)?.trim() ?? '';

  switch (modalId) {
    case MODAL_IDS.SALARY: {
      const period = getField('period');
      const issueType = getField('issue_type');
      const description = getField('description');
      return {
        type: 'SALARY',
        subject: `Salary Query — ${period}`,
        description,
        extraData: { period, issue_type: issueType },
      };
    }
    case MODAL_IDS.REIMBURSEMENT: {
      const date = getField('expense_date');
      const amount = getField('amount');
      const receipt = getField('receipt_ref');
      const description = getField('description');
      return {
        type: 'REIMBURSEMENT',
        subject: `Reimbursement — ${date} — ₹${amount}`,
        description,
        extraData: { expense_date: date, amount, receipt_ref: receipt },
      };
    }
    case MODAL_IDS.ATTENDANCE: {
      const date = getField('date');
      const issueType = getField('issue_type');
      const description = getField('description');
      return {
        type: 'ATTENDANCE',
        subject: `Attendance Issue — ${date}`,
        description,
        extraData: { date, issue_type: issueType },
      };
    }
    case MODAL_IDS.GENERAL:
    default: {
      const subject = getField('subject');
      const priority = getField('priority');
      const description = getField('description');
      return {
        type: 'GENERAL',
        subject,
        description,
        extraData: { priority },
      };
    }
  }
}
