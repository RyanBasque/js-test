import { Router } from "express";
import { container } from "../config/container";
import TransactionController from "../controllers/TransactionController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadCsv } from "../middlewares/upload.middleware";

const router = Router();
const controller = container.resolve(TransactionController);

router.post("/upload", authMiddleware, uploadCsv.single("file"), controller.upload);
router.get("/report", authMiddleware, controller.getReport);
router.get("/statement", authMiddleware, controller.getStatement);
router.get("/wallet", authMiddleware, controller.getWallet);
router.get("/cpfs", authMiddleware, controller.getCpfs);

export default router;
