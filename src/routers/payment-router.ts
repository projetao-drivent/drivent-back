import { Router } from "express";
import { authenticateToken, validateQuery, validateBody } from "@/middlewares";
import { getPayment, postPayment } from "@/controllers";
import { querySchema, paymentSchema } from "@/schemas";

const paymentRouter = Router();

paymentRouter
  .all("/*", authenticateToken)
  .get("/", validateQuery(querySchema), getPayment)
  .post("/process", validateBody(paymentSchema), postPayment);

export { paymentRouter };
