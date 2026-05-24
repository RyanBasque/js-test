import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CardSkeleton } from "../../components/common/Skeleton";
import CpfDropdown from "../../components/common/CpfDropdown";
import { formatPoints } from "../../utils/formatters";

interface WalletData {
  pointsBalance: number;
}

const quickLinks = [
  {
    to: "/statement",
    label: "Ver Extrato",
    description: "Acompanhe suas transacoes",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  },
  {
    to: "/upload",
    label: "Importar CSV",
    description: "Importe novas transacoes",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
      </svg>
    ),
    color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    to: "/report",
    label: "Relatorio",
    description: "Veja o relatorio completo",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    color: "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
];

export default function WalletPage() {
  usePageTitle("Carteira");
  const location = useLocation();
  const { data, loading, error, execute } = useFetch<WalletData>();
  const [selectedCpfs, setSelectedCpfs] = useState<Set<string>>(new Set());

  const cpfsString = useMemo(
    () => Array.from(selectedCpfs).sort().join(","),
    [selectedCpfs]
  );

  const fetchWallet = useCallback(() => {
    const query = cpfsString ? `?cpfs=${cpfsString}` : "";
    return execute(`/transactions/wallet${query}`);
  }, [execute, cpfsString]);

  useEffect(() => {
    void fetchWallet();
  }, [fetchWallet, location.key]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Minha Carteira</h1>

      {error && <p className="text-red-500 text-sm">{error}</p>}


      {/* Balance card */}
      {loading && !data && <CardSkeleton />}

      {data && (
        <div className="card p-8 max-w-md animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">
              {selectedCpfs.size > 0
                ? `Pontos Aprovados (${selectedCpfs.size} CPF${selectedCpfs.size > 1 ? "s" : ""})`
                : "Total de Pontos Aprovados"}
            </p>
          </div>
          <p className="text-5xl font-bold text-blue-600 tracking-tight mb-1">
            {formatPoints(data.pointsBalance)}
          </p>
          <p className="text-xs text-gray-400 mt-3">
            {selectedCpfs.size > 0
              ? "Saldo filtrado pelos CPFs selecionados."
              : "Apenas transações aprovadas são contabilizadas."}
          </p>
        </div>
      )}

      {/* Quick-action buttons */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Acesso rapido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickLinks.map(({ to, label, description, icon, color }) => (
            <Link
              key={to}
              to={to}
              className={`card p-5 border transition-all duration-150 hover:shadow-md group ${color}`}
            >
              <div className="mb-3">{icon}</div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs opacity-70 mt-1">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
