interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, onPageChange }: Props) {
  const safePage = Number.isFinite(page) && page >= 1 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit >= 1 ? limit : 20;
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : 0;
  const safeTotalPages = Number.isFinite(totalPages) && totalPages >= 0 ? totalPages : 0;

  if (safeTotalPages <= 1) return null;

  const from = safeTotal === 0 ? 0 : (safePage - 1) * safeLimit + 1;
  const to = Math.min(safePage * safeLimit, safeTotal);

  const pages: (number | "…")[] = [];
  if (safeTotalPages <= 7) {
    for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (safePage > 3) pages.push("…");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(safeTotalPages - 1, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < safeTotalPages - 2) pages.push("…");
    pages.push(safeTotalPages);
  }

  const btnBase =
    "px-3 py-1.5 text-sm rounded-lg border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const activeBtn = `${btnBase} bg-blue-600 text-white border-blue-600 shadow-sm`;
  const inactiveBtn = `${btnBase} bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:scale-95`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <p className="text-sm text-gray-500">
        Exibindo <span className="font-medium">{from}–{to}</span> de{" "}
        <span className="font-medium">{safeTotal}</span> registros
      </p>

      <div className="flex items-center gap-1">
        <button
          className={inactiveBtn}
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
        >
          ← Anterior
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              className={p === safePage ? activeBtn : inactiveBtn}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </button>
          )
        )}

        <button
          className={inactiveBtn}
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === safeTotalPages}
        >
          Próxima →
        </button>
      </div>
    </div>
  );
}
