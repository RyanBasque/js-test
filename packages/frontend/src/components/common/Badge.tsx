import type { TransactionStatus } from "../../types/transaction";
import { transactionStatusLabel, transactionStatusStyle } from "../../utils/mappers";

export default function Badge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${transactionStatusStyle[status]}`}
    >
      {transactionStatusLabel[status]}
    </span>
  );
}
