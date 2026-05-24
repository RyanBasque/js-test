import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { usePageTitle } from "../../hooks/usePageTitle";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import PtBrDateRangeField from "../../components/common/PtBrDateRangeField";
import {
  formatDate,
  formatCurrency,
  formatPoints,
  truncateText,
  parsePtBrDate,
  toApiDateString,
} from "../../utils/formatters";
import type { Column } from "../../components/common/Table";
import type { Transaction, UserTransactionFilters, PaginatedResult } from "../../types/transaction";

interface StatementData extends PaginatedResult<Transaction> {
  approvedPointsSum: number;
  approvedMonetarySum: number;
}

const columns: Column<Transaction>[] = [
  {
    key: "description",
    header: "Produto",
    render: (t) => (
      <span title={t.description}>{truncateText(t.description)}</span>
    ),
  },
  { key: "date", header: "Data", render: (t) => formatDate(t.transactionDate) },
  { key: "points", header: "Pontos", render: (t) => formatPoints(t.pointsValue) },
  { key: "value", header: "Valor", render: (t) => formatCurrency(t.monetaryValue) },
  { key: "status", header: "Status", render: (t) => <Badge status={t.status} /> },
];

const initialFilters: UserTransactionFilters = {
  status: "",
  dateFrom: "",
  dateTo: "",
};

const fieldClass =
  "w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow";

const dateValidator = (label: string) =>
  Yup.string().test("date", `${label} inválida`, (v) => {
    if (!v?.trim()) return true;
    return parsePtBrDate(v) !== undefined;
  });

const filterSchema = Yup.object({
  status: Yup.string(),
  dateFrom: dateValidator("Data inicial"),
  dateTo: dateValidator("Data final"),
});

export default function StatementPage() {
  usePageTitle("Extrato");
  const [filters, setFilters] = useState<UserTransactionFilters>(initialFilters);

  const { data, loading, error, page, limit, resetToFirstPage, goToPage } =
    usePagedQuery<Transaction>(
      "/transactions/statement",
      filters as Record<string, string | undefined>
    );

  const statementData = data as StatementData | null;

  const handleSubmit = (values: UserTransactionFilters) => {
    setFilters({
      ...values,
      dateFrom: toApiDateString(values.dateFrom ?? ""),
      dateTo: toApiDateString(values.dateTo ?? ""),
    });
    resetToFirstPage();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Meu Extrato</h1>

      {statementData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
          <div className="card p-5 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Total Pontos
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatPoints(statementData.approvedPointsSum)}
            </p>
          </div>
          <div className="card p-5 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Total Valor
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(statementData.approvedMonetarySum)}
            </p>
          </div>
        </div>
      )}

      <div className="card p-5">
        <Formik
          initialValues={initialFilters}
          validationSchema={filterSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <Field as="select" name="status" className={fieldClass}>
                  <option value="">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </Field>
              </div>
              <div className="sm:col-span-2">
                <PtBrDateRangeField className={fieldClass} />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full text-sm py-1.5">
                  Filtrar
                </Button>
              </div>
            </div>
          </Form>
        </Formik>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Table
        columns={columns}
        data={data?.rows ?? []}
        loading={loading}
        emptyMessage="Nenhuma transacao encontrada."
      />

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          total={data.total}
          limit={limit}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}
