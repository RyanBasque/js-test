import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, useFormikContext } from "formik";
import * as Yup from "yup";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { usePageTitle } from "../../hooks/usePageTitle";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import PtBrDateRangeField from "../../components/common/PtBrDateRangeField";
import CpfDropdown from "../../components/common/CpfDropdown";
import {
  formatDate,
  formatCurrency,
  formatPoints,
  truncateText,
  parsePtBrDecimal,
  parsePtBrDate,
  formatPtBrDecimalInput,
  maskPtBrDecimalInput,
  toApiDecimalString,
  toApiDateString,
} from "../../utils/formatters";
import type { Column } from "../../components/common/Table";
import type { Transaction, AdminTransactionFilters } from "../../types/transaction";

const columns: Column<Transaction>[] = [
  { key: "cpf", header: "CPF", render: (t) => t.cpf },
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

type FormFilters = Omit<AdminTransactionFilters, "cpf"> & { cpf: string };

const initialFormFilters: FormFilters = {
  cpf: "",
  description: "",
  dateFrom: "",
  dateTo: "",
  monetaryValue: "",
  status: "",
};

const fieldClass =
  "w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow";

const decimalField = () =>
  Yup.string().test("decimal", "Valor invalido", (v) => {
    if (!v?.trim()) return true;
    return parsePtBrDecimal(v) !== undefined;
  });

const dateValidator = (label: string) =>
  Yup.string().test("date", `${label} invalida`, (v) => {
    if (!v?.trim()) return true;
    return parsePtBrDate(v) !== undefined;
  });

const filterSchema = Yup.object({
  cpf: Yup.string(),
  description: Yup.string(),
  dateFrom: dateValidator("Data inicial"),
  dateTo: dateValidator("Data final"),
  monetaryValue: decimalField(),
  status: Yup.string(),
});

function PtBrCurrencyField({ label }: { label: string }) {
  const { values, setFieldValue, touched, errors } =
    useFormikContext<FormFilters>();

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        name="monetaryValue"
        type="text"
        inputMode="decimal"
        lang="pt-BR"
        placeholder="0,00"
        className={fieldClass}
        value={values.monetaryValue}
        onChange={(e) =>
          setFieldValue("monetaryValue", maskPtBrDecimalInput(e.target.value))
        }
        onBlur={() => {
          const parsed = parsePtBrDecimal(values.monetaryValue ?? "");
          if (parsed !== undefined) {
            setFieldValue("monetaryValue", formatPtBrDecimalInput(parsed));
          }
        }}
      />
      {touched.monetaryValue && errors.monetaryValue && (
        <span className="text-xs text-red-500 mt-0.5 block">
          {errors.monetaryValue}
        </span>
      )}
    </div>
  );
}

export default function ReportPage() {
  usePageTitle("Relatorio");
  const navigate = useNavigate();
  const [selectedCpfs, setSelectedCpfs] = useState<Set<string>>(new Set());
  const [formFilters, setFormFilters] = useState<FormFilters>(initialFormFilters);

  const cpfsString = useMemo(
    () => Array.from(selectedCpfs).sort().join(","),
    [selectedCpfs]
  );

  const filters = useMemo<Record<string, string | undefined>>(
    () => ({
      ...formFilters,
      cpf: cpfsString || formFilters.cpf || undefined,
    }),
    [formFilters, cpfsString]
  );

  const { data, loading, error, page, limit, resetToFirstPage, goToPage } =
    usePagedQuery<Transaction>("/transactions/report", filters);

  const handleSubmit = (values: FormFilters) => {
    setFormFilters({
      ...values,
      dateFrom: toApiDateString(values.dateFrom ?? ""),
      dateTo: toApiDateString(values.dateTo ?? ""),
      monetaryValue: toApiDecimalString(values.monetaryValue ?? ""),
    });
    resetToFirstPage();
  };

  const handleCpfChange = useCallback(
    (next: Set<string>) => {
      setSelectedCpfs(next);
      resetToFirstPage();
    },
    [resetToFirstPage]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Relatório de Transações</h1>
        <Button
          type="button"
          variant="secondary"
          className="text-sm"
          onClick={() => navigate("/upload")}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          Importar CSV
        </Button>
      </div>

      <div className="card p-5">
        <Formik
          initialValues={initialFormFilters}
          validationSchema={filterSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <CpfDropdown selected={selectedCpfs} onChange={handleCpfChange} />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Produto</label>
                <Field name="description" className={fieldClass} />
              </div>
              <div className="sm:col-span-2">
                <PtBrDateRangeField className={fieldClass} />
              </div>
              <PtBrCurrencyField label="Valor" />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <Field as="select" name="status" className={fieldClass}>
                  <option value="">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </Field>
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
        emptyMessage="Nenhuma transacao encontrada para os filtros selecionados."
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
