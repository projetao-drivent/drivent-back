import { notFoundError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { Ticket } from "@/protocols";

async function getTicketTypes() {
  const result = await ticketRepository.findTicketTypes();

  if (!result) {
    throw notFoundError(); 
  }

  return result;
}

async function getTickets(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError(); 
  }
  const result = await ticketRepository.findTickets(enrollment.id);
  
  if (!result) {
    throw notFoundError(); 
  }
  
  return result;
}

async function postTicket(userId: number, ticketTypeId: Ticket) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError(); 
  }
  const result = await ticketRepository.insertTicket(enrollment.id, ticketTypeId);
  if (!result) {
    throw notFoundError(); 
  }
  return result;
}

const ticketService = {
  getTicketTypes, getTickets, postTicket
};

export default ticketService;
