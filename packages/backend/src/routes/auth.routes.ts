import { Router } from "express";
import { container } from "../config/container";
import AuthController from "../controllers/AuthController";

const router = Router();
const controller = container.resolve(AuthController);

router.post("/register", controller.register);
router.post("/login", controller.login);

export default router;
