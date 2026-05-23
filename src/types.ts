import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export interface CommandModule {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export const TICKET_CATEGORY_BUTTON_IDS = {
  RAISE: 'ticket_raise',
  CAT_SALARY: 'ticket_cat_salary',
  CAT_REIMBURSEMENT: 'ticket_cat_reimbursement',
  CAT_ATTENDANCE: 'ticket_cat_attendance',
  CAT_GENERAL: 'ticket_cat_general',
  ASSIGN: 'ticket_assign',
  RESOLVE: 'ticket_resolve',
  ESCALATE: 'ticket_escalate',
  CLOSE: 'ticket_close',
} as const;

export const MODAL_IDS = {
  SALARY: 'modal_ticket_salary',
  REIMBURSEMENT: 'modal_ticket_reimbursement',
  ATTENDANCE: 'modal_ticket_attendance',
  GENERAL: 'modal_ticket_general',
} as const;
