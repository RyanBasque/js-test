import { injectable } from "tsyringe";
import { Readable } from "stream";
import csvParser from "csv-parser";
import TransactionRepository from "../repositories/TransactionRepository";
import UserRepository from "../repositories/UserRepository";
import { TransactionStatus } from "../models/Transaction";
import {
  AdminTransactionFilterDto,
  UserTransactionFilterDto,
} from "../dtos/transaction.dto";
import { Transaction } from "../models/Transaction";
import { AppError } from "../errors/AppError";
import { formatCpf, normalizeCpf } from "../utils/cpf";

export type PaginatedResult<T> = {
  rows: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

interface CsvRow {
  cpf: string;
  transaction_description: string;
  transaction_date: string;
  points_value: string;
  monetary_value: string;
  status: string;
}

@injectable()
export default class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async uploadCsv(
    fileBuffer: Buffer
  ): Promise<{ created: number; skipped: number }> {
    const rows = await this.parseCsv(fileBuffer);

    if (rows.length === 0) {
      throw new AppError("CSV file is empty or has no valid rows", 422);
    }

    // Single query to fetch all matching users at once
    const uniqueCpfs = [...new Set(rows.map((r) => r.cpf?.trim()).filter(Boolean))];
    const users = await this.userRepository.findByCpfs(uniqueCpfs);
    const cpfToUserId = new Map(
      users.map((u) => [normalizeCpf(u.cpf), u.id])
    );

    const valid: Array<{
      userId: number | null;
      cpf: string;
      description: string;
      transactionDate: Date;
      pointsValue: number;
      monetaryValue: number;
      status: TransactionStatus;
    }> = [];
    let skipped = 0;

    for (const row of rows) {
      const cpf = row.cpf?.trim();
      const date = new Date(row.transaction_date?.trim());
      const pointsValue = parseFloat(row.points_value);
      const monetaryValue = parseFloat(row.monetary_value);

      if (!cpf || isNaN(date.getTime()) || isNaN(pointsValue) || isNaN(monetaryValue)) {
        skipped++;
        continue;
      }

      valid.push({
        userId: cpfToUserId.get(normalizeCpf(cpf)) ?? null,
        cpf: formatCpf(cpf),
        description: row.transaction_description?.trim() ?? "",
        transactionDate: date,
        pointsValue,
        monetaryValue,
        status: this.normalizeStatus(row.status),
      });
    }

    await this.transactionRepository.createMany(valid);
    await this.transactionRepository.linkOrphanTransactionsByCpfs(
      users.map((u) => ({ id: u.id, cpf: u.cpf }))
    );
    return { created: valid.length, skipped };
  }

  async getAdminReport(
    filters: AdminTransactionFilterDto
  ): Promise<PaginatedResult<Transaction>> {
    const limit = filters.limit ?? 20;
    const { rows, count } = await this.transactionRepository.findAll(filters);
    const totalPages = count === 0 ? 0 : Math.ceil(count / limit);
    const page =
      count === 0
        ? 1
        : Math.min(Math.max(filters.page ?? 1, 1), totalPages);
    return {
      rows,
      total: count,
      page,
      limit,
      totalPages,
    };
  }

  async getUserStatement(
    userId: number,
    filters: UserTransactionFilterDto
  ): Promise<
    PaginatedResult<Transaction> & {
      approvedPointsSum: number;
      approvedMonetarySum: number;
    }
  > {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    await this.transactionRepository.linkOrphanTransactionsByCpfs([
      { id: user.id, cpf: user.cpf },
    ]);

    const limit = filters.limit ?? 20;
    const userCpfs = [user.cpf];
    const sumFilters = { status: filters.status, dateFrom: filters.dateFrom, dateTo: filters.dateTo };

    const [rowsResult, pointsSum, monetarySum] = await Promise.all([
      this.transactionRepository.findByUserId(userId, user.cpf, filters),
      this.transactionRepository.sumFiltered("pointsValue", userCpfs, sumFilters),
      this.transactionRepository.sumFiltered("monetaryValue", userCpfs, sumFilters),
    ]);

    const { rows, count } = rowsResult;
    const totalPages = count === 0 ? 0 : Math.ceil(count / limit);
    const page =
      count === 0
        ? 1
        : Math.min(Math.max(filters.page ?? 1, 1), totalPages);
    return {
      rows,
      total: count,
      page,
      limit,
      totalPages,
      approvedPointsSum: pointsSum,
      approvedMonetarySum: monetarySum,
    };
  }

  async getWalletBalance(
    userId: number,
    cpfs?: string[]
  ): Promise<{ pointsBalance: number }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    await this.transactionRepository.linkOrphanTransactionsByCpfs([
      { id: user.id, cpf: user.cpf },
    ]);

    if (cpfs && cpfs.length > 0) {
      const pointsBalance =
        await this.transactionRepository.getApprovedPointsBalanceByCpfs(cpfs);
      return { pointsBalance: Number(pointsBalance) };
    }

    const pointsBalance =
      await this.transactionRepository.getApprovedPointsBalance(
        userId,
        user.cpf
      );
    return { pointsBalance: Number(pointsBalance) };
  }

  async getAllCpfs(): Promise<string[]> {
    return this.transactionRepository.getDistinctCpfs();
  }

  private parseCsv(buffer: Buffer): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const rows: CsvRow[] = [];
      Readable.from(buffer)
        .pipe(
          csvParser({
            mapHeaders: ({ header }) =>
              header.trim().toLowerCase().replace(/\s+/g, "_"),
          })
        )
        .on("data", (row: CsvRow) => rows.push(row))
        .on("end", () => resolve(rows))
        .on("error", reject);
    });
  }

  private normalizeStatus(raw: string | undefined): TransactionStatus {
    const val = raw?.trim().toLowerCase() ?? "";
    if (val === "approved" || val === "aprovado")
      return TransactionStatus.APPROVED;
    if (val === "rejected" || val === "rejeitado")
      return TransactionStatus.REJECTED;
    return TransactionStatus.PENDING;
  }
}
