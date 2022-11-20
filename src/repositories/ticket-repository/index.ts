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

const ticketRepository = {
  findTicketTypes, findTickets, insertTicket 
};

export default ticketRepository;
