import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels } from "@/controllers";

const hotelRouter = Router();

hotelRouter
  .all("/*", authenticateToken)
  .get("/", getHotels);
//.get("/:hotelId", getHotelRooms)

export { hotelRouter };
