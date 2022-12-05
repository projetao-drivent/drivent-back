import { notFoundError, unauthorizedError } from "@/errors";
import bookingsRepository from "@/repositories/bookings-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import ticketService from "@/services/tickets-service";
import { not } from "joi";

async function getBookings(userId: number) {
  const bookings = await bookingsRepository.findBookings(userId);
  if(!bookings) {
    throw notFoundError();
  }
  return bookings;
}

async function bookRoom(roomId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw unauthorizedError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket || ticket.status === "RESERVED") {
    throw unauthorizedError();
  }
  if(ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw unauthorizedError();
  }  
  const room = await bookingsRepository.findRoomById(roomId);
  if(!room || !roomId) {
    throw notFoundError();
  }
  if(room.capacity <= room.Booking.length) {
    throw unauthorizedError();
  }
  const booking = await bookingsRepository.insertBooking(roomId, userId);
  if(!booking) {
    throw notFoundError();
  }
  return booking.id;
}

async function changeBooking(roomId: number, userId: number, bookingId: string) {
  const room = await bookingsRepository.findRoomById(roomId);
  if(!roomId || !room) {
    throw notFoundError();
  }
  if(room.Booking.length >= room.capacity) {
    throw unauthorizedError();
  }
  const booking = await bookingsRepository.findBookings(userId);
  if(!booking) {
    throw unauthorizedError();
  }
  if(booking.id !== Number(bookingId)) {
    throw notFoundError();
  }
  const updatedBooking = await bookingsRepository.updateBooking(Number(bookingId), roomId);
  return updatedBooking.id;
}

const bookingsService = {
  getBookings,  
  bookRoom,
  changeBooking
};

export default bookingsService;
