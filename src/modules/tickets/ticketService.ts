import { prisma } from '../../db/prisma';
import type { TicketType, TicketStatus } from '@prisma/client';

export async function getNextTicketRef(guildId: string): Promise<string> {
  const counter = await prisma.ticketCounter.upsert({
    where: { guildId },
    update: { count: { increment: 1 } },
    create: { guildId, count: 1 },
  });
  return `T-${String(counter.count).padStart(4, '0')}`;
}

export interface CreateTicketInput {
  guildId: string;
  channelId: string;
  raisedById: string;
  raisedByTag: string;
  type: TicketType;
  subject: string;
  description: string;
  extraData?: Record<string, string>;
}

export async function createTicket(input: CreateTicketInput) {
  const ticketRef = await getNextTicketRef(input.guildId);
  return prisma.ticket.create({
    data: {
      ticketRef,
      type: input.type,
      subject: input.subject,
      description: input.description,
      raisedById: input.raisedById,
      raisedByTag: input.raisedByTag,
      guildId: input.guildId,
      channelId: input.channelId,
      extraData: input.extraData ?? {},
    },
  });
}

export async function updateTicketThread(id: number, threadId: string) {
  return prisma.ticket.update({
    where: { id },
    data: { threadId },
  });
}

export async function assignTicket(id: number, assignedTo: string, assignedToTag: string) {
  return prisma.ticket.update({
    where: { id },
    data: { assignedTo, assignedToTag, status: 'IN_PROGRESS' },
  });
}

export async function resolveTicket(id: number) {
  return prisma.ticket.update({
    where: { id },
    data: { status: 'RESOLVED', resolvedAt: new Date() },
  });
}

export async function escalateTicket(id: number) {
  return prisma.ticket.update({
    where: { id },
    data: { status: 'ESCALATED' },
  });
}

export async function getTicketById(id: number) {
  return prisma.ticket.findUnique({ where: { id } });
}

export async function getTicketByRef(ticketRef: string) {
  return prisma.ticket.findUnique({ where: { ticketRef } });
}

export async function saveTicketSetup(guildId: string, channelId: string, messageId: string) {
  return prisma.ticketSetup.upsert({
    where: { guildId },
    update: { channelId, messageId },
    create: { guildId, channelId, messageId },
  });
}
