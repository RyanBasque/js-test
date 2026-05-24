import type { TransactionStatus } from "../types/transaction";

export const transactionStatusLabel: Record<TransactionStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export const transactionStatusStyle: Record<TransactionStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};
