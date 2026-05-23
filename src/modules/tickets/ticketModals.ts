import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { MODAL_IDS } from '../../types';

export function buildSalaryModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(MODAL_IDS.SALARY)
    .setTitle('Salary Query')
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('period')
          .setLabel('Month / Period (e.g., March 2026)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(50)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('issue_type')
          .setLabel('Issue Type (e.g., not credited, wrong amount)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Describe the issue in detail')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(1000)
      )
    );
}

export function buildReimbursementModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(MODAL_IDS.REIMBURSEMENT)
    .setTitle('Reimbursement Request')
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('expense_date')
          .setLabel('Date of Expense (DD/MM/YYYY)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(20)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('amount')
          .setLabel('Amount (e.g., 1500)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(20)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('receipt_ref')
          .setLabel('Receipt / Reference Number')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setMaxLength(100)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Description of Expense')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(1000)
      )
    );
}

export function buildAttendanceModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(MODAL_IDS.ATTENDANCE)
    .setTitle('Attendance Issue')
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('date')
          .setLabel('Date (DD/MM/YYYY)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(20)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('issue_type')
          .setLabel('Issue Type (missed punch / leave correction / other)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Describe the issue')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(1000)
      )
    );
}

export function buildGeneralModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(MODAL_IDS.GENERAL)
    .setTitle('General / Other Request')
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('subject')
          .setLabel('Subject')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(150)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('priority')
          .setLabel('Priority (low / medium / high)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(10)
          .setValue('medium')
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Describe your request')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(1000)
      )
    );
}
