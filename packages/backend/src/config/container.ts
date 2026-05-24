import "reflect-metadata";
import { container } from "tsyringe";
import UserRepository from "../repositories/UserRepository";
import TransactionRepository from "../repositories/TransactionRepository";
import AuthService from "../services/AuthService";
import TransactionService from "../services/TransactionService";
import AuthController from "../controllers/AuthController";
import TransactionController from "../controllers/TransactionController";

container.registerSingleton(UserRepository);
container.registerSingleton(TransactionRepository);
container.registerSingleton(AuthService);
container.registerSingleton(TransactionService);
container.registerSingleton(AuthController);
container.registerSingleton(TransactionController);

export { container };
