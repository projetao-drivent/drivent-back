import { prisma } from "@/config";
import { Ticket } from "@/protocols";

async function findTicketTypes() {
  return prisma.ticketType.findMany();
}

async function findTickets(enrollmentId: number) {
  const ticket = prisma.ticket.findFirst({
    where: { enrollmentId },
    include: {
      TicketType: true,
    },
  });
  return ticket;  
}

async function findTicketById(ticketId: number) {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    include: {
      Enrollment: true,
      TicketType: true,
    },
  });
}

async function insertTicket(enrollmentId: number, ticketTypeId: Ticket) {
  return prisma.ticket.create({
    data: {
      "ticketTypeId": ticketTypeId.ticketTypeId,
      "enrollmentId": enrollmentId,
      "status": "RESERVED",
    },
    include: {
      TicketType: true
    } 
   
  });
}

async function updateTicketStatus(id: number) {
  const ticket = prisma.ticket.update({
    where: {
      id
    },
    data: {
      status: "PAID",
    },
  });
  return ticket;  
} 

const ticketRepository = {
  findTicketTypes, findTickets, insertTicket, updateTicketStatus, findTicketById 
};

export default ticketRepository;
