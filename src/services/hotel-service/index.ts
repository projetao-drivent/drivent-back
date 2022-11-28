import { notFoundError, unauthorizedError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import ticketService from "@/services/tickets-service";

async function getHotels(userId: number) {
  const ticket = await ticketService.getTicketByUserId(userId);
  if(ticket.status != "PAID") {
    throw unauthorizedError();
  }
  if(!ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
    throw notFoundError();
  }  
  const hotels = await hotelRepository.findHotels();
  if(!hotels) {
    throw notFoundError();
  }
  return hotels;
}

async function getAvaliableRooms(hotelId: number) {
  const hotel = await hotelRepository.findHotelById(hotelId);
  if(!hotel) {
    throw notFoundError();
  }
  const rooms = await hotelRepository.findRoomsByHotelId(hotelId);
  if(!rooms) {
    throw notFoundError();
  }
  return rooms;
}

const hotelService = {
  getHotels,
  getAvaliableRooms
};

export default hotelService;
