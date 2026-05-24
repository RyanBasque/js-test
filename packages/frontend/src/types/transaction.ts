export type TransactionStatus = "pending" | "approved" | "rejected";

export interface Transaction {
  id: number;
  cpf: string;
  description: string;
  transactionDate: string;
  pointsValue: number;
  monetaryValue: number;
  status: TransactionStatus;
  userId?: number | null;
  user?: { id: number; name: string; email: string };
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminTransactionFilters {
  cpf?: string;
  description?: string;
  dateFrom?: string;
  dateTo?: string;
  monetaryValue?: string;
  status?: string;
}

export interface UserTransactionFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}
