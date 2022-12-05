import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import bookingsService from "@/services/bookings-service";
import ticketService from "@/services/tickets-service";
import httpStatus from "http-status";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const bookings = await bookingsService.getBookings(Number(userId));
    return res.status(httpStatus.OK).send(bookings);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

export async function bookRoom(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId: number = req.body.roomId;
  if(!roomId) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
  try {   
    const bookingId = await bookingsService.bookRoom(roomId, userId);
    return res.status(httpStatus.OK).send({ bookingId });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId: number = req.body.roomId;
  const { bookingId } = req.params as Record<string, string>;
  try {
    const updatedBookingId = await bookingsService.changeBooking(roomId, userId, bookingId);
    return res.status(httpStatus.OK).send({ updatedBookingId });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

