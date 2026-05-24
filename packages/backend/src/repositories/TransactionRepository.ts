import { injectable } from "tsyringe";
import { Op, Sequelize, WhereOptions } from "sequelize";
import { Transaction, TransactionStatus } from "../models/Transaction";
import { User } from "../models/User";
import { AdminTransactionFilterDto } from "../dtos/transaction.dto";
import { UserTransactionFilterDto } from "../dtos/transaction.dto";
import { cpfMatches, normalizeCpf } from "../utils/cpf";
import { resolvePage } from "../utils/pagination";

type TransactionCreate = {
  userId: number | null;
  cpf: string;
  description: string;
  transactionDate: Date;
  pointsValue: number;
  monetaryValue: number;
  status: TransactionStatus;
};

export type PaginatedRows<T> = { rows: T[]; count: number };

@injectable()
export default class TransactionRepository {
  async createMany(records: TransactionCreate[]): Promise<void> {
    await Transaction.bulkCreate(records);
  }

  async findAll(filters: AdminTransactionFilterDto): Promise<PaginatedRows<Transaction>> {
    const where = this.buildAdminWhere(filters);
    const limit = filters.limit ?? 20;
    const requestedPage = filters.page ?? 1;
    const count = await Transaction.count({ where });
    const { offset } = resolvePage(requestedPage, count, limit);
    const rows = await Transaction.findAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["transactionDate", "DESC"]],
      limit,
      offset,
    });
    return { rows, count };
  }

  async linkOrphanTransactionsByCpfs(
    users: Array<{ id: number; cpf: string }>
  ): Promise<void> {
    for (const user of users) {
      if (!normalizeCpf(user.cpf)) continue;
      await Transaction.update(
        { userId: user.id },
        {
          where: {
            userId: null,
            [Op.and]: [cpfMatches(user.cpf)],
          },
        }
      );
    }
  }

  async findByUserId(
    userId: number,
    cpf: string,
    filters: UserTransactionFilterDto
  ): Promise<PaginatedRows<Transaction>> {
    const where = this.buildUserWhere(userId, cpf, filters);
    const limit = filters.limit ?? 20;
    const requestedPage = filters.page ?? 1;
    const count = await Transaction.count({ where });
    const { offset } = resolvePage(requestedPage, count, limit);
    const rows = await Transaction.findAll({
      where,
      order: [["transactionDate", "DESC"]],
      limit,
      offset,
    });
    return { rows, count };
  }

  async getApprovedPointsBalance(
    userId: number,
    cpf: string
  ): Promise<number> {
    const result = (await Transaction.sum("pointsValue", {
      where: {
        status: TransactionStatus.APPROVED,
        [Op.or]: [{ userId }, cpfMatches(cpf)],
      },
    })) as number | null;
    return Number(result ?? 0);
  }

  async getApprovedMonetaryBalance(
    userId: number,
    cpf: string
  ): Promise<number> {
    const result = (await Transaction.sum("monetaryValue", {
      where: {
        status: TransactionStatus.APPROVED,
        [Op.or]: [{ userId }, cpfMatches(cpf)],
      },
    })) as number | null;
    return Number(result ?? 0);
  }

  async getDistinctCpfs(): Promise<string[]> {
    const results = await Transaction.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("cpf")), "cpf"]],
      order: [["cpf", "ASC"]],
      raw: true,
    });
    return results.map((r) => r.cpf);
  }

  async getApprovedPointsBalanceByCpfs(cpfs: string[]): Promise<number> {
    if (cpfs.length === 0) return 0;
    const result = (await Transaction.sum("pointsValue", {
      where: {
        status: TransactionStatus.APPROVED,
        cpf: { [Op.in]: cpfs },
      },
    })) as number | null;
    return Number(result ?? 0);
  }

  async getApprovedMonetaryBalanceByCpfs(cpfs: string[]): Promise<number> {
    if (cpfs.length === 0) return 0;
    const result = (await Transaction.sum("monetaryValue", {
      where: {
        status: TransactionStatus.APPROVED,
        cpf: { [Op.in]: cpfs },
      },
    })) as number | null;
    return Number(result ?? 0);
  }

  async getApprovedPointsSumAll(): Promise<number> {
    const result = (await Transaction.sum("pointsValue", {
      where: { status: TransactionStatus.APPROVED },
    })) as number | null;
    return Number(result ?? 0);
  }

  async getApprovedMonetarySumAll(): Promise<number> {
    const result = (await Transaction.sum("monetaryValue", {
      where: { status: TransactionStatus.APPROVED },
    })) as number | null;
    return Number(result ?? 0);
  }

  /** Soma genérica que aplica os mesmos filtros da tabela (cpfs + status + dateFrom/dateTo) */
  async sumFiltered(
    field: "pointsValue" | "monetaryValue",
    cpfs?: string[],
    filters?: { status?: string; dateFrom?: string; dateTo?: string }
  ): Promise<number> {
    const where: Record<string, unknown> = {};
    if (cpfs && cpfs.length > 0) where["cpf"] = { [Op.in]: cpfs };
    if (filters?.status) where["status"] = filters.status;
    this.applyDateRange(where, filters?.dateFrom, filters?.dateTo);
    const result = (await Transaction.sum(field, {
      where: where as WhereOptions<Transaction>,
    })) as number | null;
    return Number(result ?? 0);
  }

  async findAllWithUserFilters(
    filters: UserTransactionFilterDto
  ): Promise<PaginatedRows<Transaction>> {
    const where = this.buildSimpleWhere(filters);
    const limit = filters.limit ?? 20;
    const requestedPage = filters.page ?? 1;
    const count = await Transaction.count({ where });
    const { offset } = resolvePage(requestedPage, count, limit);
    const rows = await Transaction.findAll({
      where,
      order: [["transactionDate", "DESC"]],
      limit,
      offset,
    });
    return { rows, count };
  }

  async findByCpfsWithUserFilters(
    cpfs: string[],
    filters: UserTransactionFilterDto
  ): Promise<PaginatedRows<Transaction>> {
    const where: Record<string, unknown> = {
      cpf: { [Op.in]: cpfs },
      ...this.buildSimpleWhere(filters),
    };
    const limit = filters.limit ?? 20;
    const requestedPage = filters.page ?? 1;
    const count = await Transaction.count({ where: where as WhereOptions<Transaction> });
    const { offset } = resolvePage(requestedPage, count, limit);
    const rows = await Transaction.findAll({
      where: where as WhereOptions<Transaction>,
      order: [["transactionDate", "DESC"]],
      limit,
      offset,
    });
    return { rows, count };
  }

  private buildSimpleWhere(
    filters: UserTransactionFilterDto
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {};
    if (filters.status) where["status"] = filters.status;
    this.applyDateRange(where, filters.dateFrom, filters.dateTo);
    return where;
  }

  private buildAdminWhere(
    filters: AdminTransactionFilterDto
  ): WhereOptions<Transaction> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (filters.cpf) {
      const cpfList = filters.cpf.split(",").map((c) => c.trim()).filter(Boolean);
      if (cpfList.length === 1) {
        where["cpf"] = cpfList[0];
      } else if (cpfList.length > 1) {
        where["cpf"] = { [Op.in]: cpfList };
      }
    }
    if (filters.description)
      where["description"] = { [Op.like]: `%${filters.description}%` };
    if (filters.status) where["status"] = filters.status;
    this.applyDateRange(where, filters.dateFrom, filters.dateTo);

    if (filters.monetaryValue != null) {
      where["monetaryValue"] = Number(filters.monetaryValue.toFixed(2));
    }

    return where as WhereOptions<Transaction>;
  }

  private buildUserWhere(
    userId: number,
    cpf: string,
    filters: UserTransactionFilterDto
  ): WhereOptions<Transaction> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      [Op.or]: [{ userId }, cpfMatches(cpf)],
    };

    if (filters.status) where["status"] = filters.status;
    this.applyDateRange(where, filters.dateFrom, filters.dateTo);

    return where as WhereOptions<Transaction>;
  }

  private applyDateRange(
    where: Record<string, unknown>,
    dateFrom?: string,
    dateTo?: string
  ): void {
    if (dateFrom && dateTo) {
      where["transactionDate"] = { [Op.between]: [dateFrom, dateTo] };
    } else if (dateFrom) {
      where["transactionDate"] = { [Op.gte]: dateFrom };
    } else if (dateTo) {
      where["transactionDate"] = { [Op.lte]: dateTo };
    }
  }
}
