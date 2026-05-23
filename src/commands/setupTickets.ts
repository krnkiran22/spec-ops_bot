import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from 'discord.js';
import type { CommandModule } from '../types';
import { TICKET_CATEGORY_BUTTON_IDS } from '../types';
import { buildRaiseTicketEmbed } from '../modules/tickets/ticketEmbeds';
import { saveTicketSetup } from '../modules/tickets/ticketService';

export const setupTicketsCommand: CommandModule = {
  data: new SlashCommandBuilder()
    .setName('setup-tickets')
    .setDescription('Post the ticket raise panel in this channel (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild) {
      await interaction.editReply({ content: 'This command can only be used in a server.' });
      return;
    }

    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.editReply({ content: 'This command must be used in a text channel.' });
      return;
    }

    const embed = buildRaiseTicketEmbed();
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(TICKET_CATEGORY_BUTTON_IDS.RAISE)
        .setLabel('Raise a Ticket')
        .setStyle(ButtonStyle.Primary)
    );

    const message = await channel.send({ embeds: [embed], components: [row] });

    await saveTicketSetup(interaction.guild.id, channel.id, message.id);

    await interaction.editReply({
      content: `Ticket panel posted in <#${channel.id}>. Users can now raise tickets by clicking the button.`,
    });
  },
};
