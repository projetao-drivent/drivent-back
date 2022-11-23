import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getAvaliableRooms } from "@/controllers";

const hotelRouter = Router();

hotelRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/:hotelId", getAvaliableRooms);

export { hotelRouter };
