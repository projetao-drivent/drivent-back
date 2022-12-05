import { notFoundError, unauthorizedError } from "@/errors";
import bookingsRepository from "@/repositories/bookings-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketService from "@/services/tickets-service";

async function getBookings(userId: number) {
  const bookings = await bookingsRepository.findBookings(userId);
  if(!bookings) {
    throw notFoundError();
  }
  return bookings;
}

async function bookRoom(roomId: number, userId: number) {
  const ticket = await ticketService.getTicketByUserId(userId);
  if(!ticket || ticket.status === "RESERVED") {
    throw unauthorizedError();
  }
  if(ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw unauthorizedError();
  }
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw unauthorizedError();
  }
  const room = await bookingsRepository.findRoomById(roomId);
  if(!room) {
    throw notFoundError();
  }
  if(room.capacity === room.Booking.length) {
    throw unauthorizedError();
  }
  const booking = await bookingsRepository.insertBooking(roomId, userId);
  if(!booking) {
    throw notFoundError();
  }
  return booking.id;
}

async function changeBooking(roomId: number, userId: number, bookingId: string) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const bookings = await bookingsRepository.findBookings(userId);
  if(!bookings || !enrollment) {
    throw unauthorizedError();
  }
  const room = await bookingsRepository.findRoomById(roomId);
  if(!room) {
    throw notFoundError();
  }
  if(room.capacity === room.Booking.length) {
    throw unauthorizedError();
  }

  const changedBooking = await bookingsRepository.updateBooking(Number(bookingId), roomId);
  return changedBooking.id;
}

const bookingsService = {
  getBookings,  
  bookRoom,
  changeBooking
};

export default bookingsService;
