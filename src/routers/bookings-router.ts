import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getBookings, bookRoom, changeBooking } from "@/controllers";

const bookingsRouter= Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookings)
  .post("/", bookRoom)
  .put("/:bookingId", changeBooking);

export { bookingsRouter };
