import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotel-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const result = await hotelService.getHotels();
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.send(httpStatus.NO_CONTENT);
    }
  }
}
