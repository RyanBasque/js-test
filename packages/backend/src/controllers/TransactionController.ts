import { injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import TransactionService from "../services/TransactionService";
import {
  AdminTransactionFilterDto,
  UserTransactionFilterDto,
} from "../dtos/transaction.dto";
import { validateDto } from "../utils/validate";
import { sendSuccess } from "../utils/response";
import { AppError } from "../errors/AppError";

@injectable()
export default class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  upload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError(
          "No file uploaded or file type not supported (CSV required)",
          400
        );
      }
      const result = await this.transactionService.uploadCsv(req.file.buffer);
      sendSuccess(res, result, "CSV processed successfully", 201);
    } catch (err) {
      next(err);
    }
  };

  getReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = { ...req.query } as Record<string, unknown>;
      if (query.monetaryValue && query.value) {
        query.monetaryValue = query.value;
      }
      const filters = await validateDto(AdminTransactionFilterDto, query);
      const transactions = await this.transactionService.getAdminReport(filters);
      sendSuccess(res, transactions, "Report retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  getStatement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters = await validateDto(UserTransactionFilterDto, req.query);
      const transactions = await this.transactionService.getUserStatement(
        req.user!.id,
        filters
      );
      sendSuccess(res, transactions, "Statement retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  getWallet = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cpfsParam = req.query.cpfs as string | undefined;
      const cpfs = cpfsParam
        ? cpfsParam.split(",").map((c) => c.trim()).filter(Boolean)
        : undefined;
      const balance = await this.transactionService.getWalletBalance(
        req.user!.id,
        cpfs
      );
      sendSuccess(res, balance, "Wallet balance retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  getCpfs = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cpfs = await this.transactionService.getAllCpfs();
      sendSuccess(res, cpfs, "CPFs retrieved successfully");
    } catch (err) {
      next(err);
    }
  };
}
