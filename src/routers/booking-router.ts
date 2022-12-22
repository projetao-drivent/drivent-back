import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { bookingRoom, listBooking, changeBooking, listBookingsByRoom } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("", listBooking)
  .get("/:roomId", listBookingsByRoom)
  .post("", bookingRoom)
  .put("/:bookingId", changeBooking);

export { bookingRouter };
