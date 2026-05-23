import {
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
} from 'discord.js';
import { TICKET_CATEGORY_BUTTON_IDS } from '../types';
import {
  buildCategorySelectEmbed,
  buildTicketEmbed,
  buildTicketActionRow,
} from '../modules/tickets/ticketEmbeds';
import {
  buildSalaryModal,
  buildReimbursementModal,
  buildAttendanceModal,
  buildGeneralModal,
} from '../modules/tickets/ticketModals';
import {
  assignTicket,
  resolveTicket,
  escalateTicket,
  getTicketById,
} from '../modules/tickets/ticketService';
import { config } from '../config';

export async function handleButton(interaction: ButtonInteraction): Promise<void> {
  const { customId } = interaction;

  // ── Raise ticket: show category picker ──────────────────────────────────
  if (customId === TICKET_CATEGORY_BUTTON_IDS.RAISE) {
    const embed = buildCategorySelectEmbed();
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(TICKET_CATEGORY_BUTTON_IDS.CAT_SALARY)
        .setLabel('Salary Query')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(TICKET_CATEGORY_BUTTON_IDS.CAT_REIMBURSEMENT)
        .setLabel('Reimbursement')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(TICKET_CATEGORY_BUTTON_IDS.CAT_ATTENDANCE)
        .setLabel('Attendance Issue')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(TICKET_CATEGORY_BUTTON_IDS.CAT_GENERAL)
        .setLabel('General / Other')
        .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    return;
  }

  // ── Category selection: open the appropriate modal ───────────────────────
  if (customId === TICKET_CATEGORY_BUTTON_IDS.CAT_SALARY) {
    await interaction.showModal(buildSalaryModal());
    return;
  }
  if (customId === TICKET_CATEGORY_BUTTON_IDS.CAT_REIMBURSEMENT) {
    await interaction.showModal(buildReimbursementModal());
    return;
  }
  if (customId === TICKET_CATEGORY_BUTTON_IDS.CAT_ATTENDANCE) {
    await interaction.showModal(buildAttendanceModal());
    return;
  }
  if (customId === TICKET_CATEGORY_BUTTON_IDS.CAT_GENERAL) {
    await interaction.showModal(buildGeneralModal());
    return;
  }

  // ── Ticket action buttons (assign, resolve, escalate, close) ─────────────
  const assignMatch = customId.match(/^ticket_assign_(\d+)$/);
  const resolveMatch = customId.match(/^ticket_resolve_(\d+)$/);
  const escalateMatch = customId.match(/^ticket_escalate_(\d+)$/);
  const closeMatch = customId.match(/^ticket_close_(\d+)$/);

  if (assignMatch) {
    await handleAssign(interaction, parseInt(assignMatch[1], 10));
    return;
  }
  if (resolveMatch) {
    await handleResolve(interaction, parseInt(resolveMatch[1], 10));
    return;
  }
  if (escalateMatch) {
    await handleEscalate(interaction, parseInt(escalateMatch[1], 10));
    return;
  }
  if (closeMatch) {
    await handleClose(interaction, parseInt(closeMatch[1], 10));
    return;
  }
}

async function handleAssign(interaction: ButtonInteraction, ticketId: number) {
  const member = interaction.member;
  if (!member) return;

  const ticket = await assignTicket(
    ticketId,
    interaction.user.id,
    interaction.user.tag
  );

  const embed = buildTicketEmbed(ticket);
  const row = buildTicketActionRow(ticket);
  await interaction.update({ embeds: [embed], components: [row] });

  await interaction.followUp({
    content: `Ticket **${ticket.ticketRef}** has been assigned to <@${interaction.user.id}>.`,
    ephemeral: false,
  });
}

async function handleResolve(interaction: ButtonInteraction, ticketId: number) {
  const ticket = await resolveTicket(ticketId);
  const embed = buildTicketEmbed(ticket);

  await interaction.update({ embeds: [embed], components: [] });

  await interaction.followUp({
    content: `Ticket **${ticket.ticketRef}** has been marked as **Resolved** by <@${interaction.user.id}>. This thread will be archived.`,
    ephemeral: false,
  });

  // DM the user who raised the ticket
  try {
    const raiser = await interaction.client.users.fetch(ticket.raisedById);
    await raiser.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x22c55e)
          .setTitle(`Ticket ${ticket.ticketRef} — Resolved`)
          .setDescription(`Your ticket has been resolved by <@${interaction.user.id}>.\n\nIf you have further issues, feel free to raise a new ticket.`)
          .setTimestamp(),
      ],
    });
  } catch {
    // User may have DMs disabled — silently ignore
  }

  // Archive the thread after a short delay
  setTimeout(async () => {
    if (interaction.channel?.type === ChannelType.PrivateThread || interaction.channel?.type === ChannelType.PublicThread) {
      await interaction.channel.setArchived(true, `Ticket ${ticket.ticketRef} resolved`).catch(() => null);
    }
  }, 5000);
}

async function handleEscalate(interaction: ButtonInteraction, ticketId: number) {
  const ticket = await escalateTicket(ticketId);
  const embed = buildTicketEmbed(ticket);
  const row = buildTicketActionRow(ticket);

  await interaction.update({ embeds: [embed], components: [row] });

  const financeRoleId = config.discord.financeRoleId;
  const mention = financeRoleId ? `<@&${financeRoleId}>` : '@Finance Team';

  await interaction.followUp({
    content: `Ticket **${ticket.ticketRef}** has been **escalated** by <@${interaction.user.id}>. ${mention} please review.`,
    ephemeral: false,
  });
}

async function handleClose(interaction: ButtonInteraction, _ticketId: number) {
  await interaction.reply({ content: 'Thread will be closed.', ephemeral: true });

  setTimeout(async () => {
    if (interaction.channel?.type === ChannelType.PrivateThread || interaction.channel?.type === ChannelType.PublicThread) {
      await interaction.channel.setArchived(true, 'Closed by ops').catch(() => null);
    }
  }, 2000);
}
