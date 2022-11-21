import { notFoundError, unauthorizedError } from "@/errors";
import paymentRepository from "@/repositories/payment-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketService from "@/services/ticket-service";
import ticketRepository from "@/repositories/ticket-repository";

async function getPayment(ticketId: number, userId: number) {
  const ticket = await ticketRepository.findTicketById(ticketId);
  if(!ticket) {
    throw notFoundError();
  }
  if (ticket.Enrollment.userId !== userId) {
    throw unauthorizedError(); 
  }
  const result = await paymentRepository.findPaymentByTicketId(ticketId);
  if (!result) {
    throw notFoundError(); 
  }
  return result;
}

async function postPayment(userId: number, ticketId: number, issuer: string, number: number) {
  const ticket = await ticketRepository.findTicketById(ticketId);
  if(!ticket) {
    throw notFoundError();
  }
  if (ticket.Enrollment.userId !== userId) {
    throw unauthorizedError(); 
  }
  const value = ticket.TicketType.price;
  const result = await paymentRepository.insertPayment(ticketId, issuer, number, value);
  await ticketRepository.updateTicketStatus(ticketId);
  if (!result) {
    throw notFoundError(); 
  }
  return result;
}

const paymentService = {
  getPayment, postPayment
};

export default paymentService;
