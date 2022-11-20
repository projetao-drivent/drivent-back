import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getTicketTypes, getTickets, postTicket } from "@/controllers";
import { createTicketSchema } from "@/schemas";

const ticketRouter = Router();

ticketRouter
  .all("/*", authenticateToken)
  .get("/types", getTicketTypes)
  .get("/", getTickets)
  .post("/", validateBody(createTicketSchema), postTicket);

export { ticketRouter };
