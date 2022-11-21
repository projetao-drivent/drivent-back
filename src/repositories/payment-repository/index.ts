import { prisma } from "@/config";

async function findPaymentByTicketId(ticketId: number) {
  const payment = prisma.payment.findFirst({
    where: { ticketId },
  });
  return payment;  
} 

async function insertPayment(ticketId: number, issuer: string, number: number, value: number) {
  return prisma.payment.create({
    data: {
      ticketId,
      value,
      cardIssuer: issuer,
      cardLastDigits: number.toString().slice(-4),
    },
  });
}

const paymentRepository = {
  findPaymentByTicketId, insertPayment
};

export default paymentRepository;
