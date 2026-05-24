import { Router } from "express";
import authRoutes from "./auth.routes";
import transactionRoutes from "./transaction.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);

export default router;
