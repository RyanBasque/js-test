import { useEffect, useRef, useState, useCallback } from "react";
import { useFetch } from "../../hooks/useFetch";

interface CpfDropdownProps {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

export default function CpfDropdown({ selected, onChange }: CpfDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const { data: cpfs, execute } = useFetch<string[]>();

  // Fetch CPF list once
  useEffect(() => {
    void execute("/transactions/cpfs");
  }, [execute]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = useCallback(
    (cpf: string) => {
      const next = new Set(selected);
      if (next.has(cpf)) next.delete(cpf);
      else next.add(cpf);
      onChange(next);
    },
    [selected, onChange]
  );

  const clear = useCallback(() => {
    onChange(new Set());
    setSearch("");
  }, [onChange]);

  const filtered = (cpfs ?? []).filter((c) =>
    c.replace(/\D/g, "").includes(search.replace(/\D/g, ""))
  );

  const label =
    selected.size === 0
      ? "Selecionar CPFs"
      : selected.size === 1
        ? Array.from(selected)[0]
        : `${selected.size} CPFs selecionados`;

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between gap-2
          border rounded-lg px-3 py-1.5 text-sm text-left
          transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${selected.size > 0
            ? "border-blue-400 bg-blue-50 text-blue-700"
            : "border-gray-300 bg-white text-gray-500"
          }
        `}
      >
        <span className="truncate">{label}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg animate-fade-in">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar CPF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Header with clear */}
          {selected.size > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
              <span className="text-xs text-gray-500">
                {selected.size} selecionado{selected.size > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={clear}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Limpar
              </button>
            </div>
          )}

          {/* List */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {!cpfs && (
              <li className="px-3 py-2 text-sm text-gray-400">Carregando...</li>
            )}
            {cpfs && filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">Nenhum CPF encontrado.</li>
            )}
            {filtered.map((cpf) => {
              const checked = selected.has(cpf);
              return (
                <li key={cpf}>
                  <button
                    type="button"
                    onClick={() => toggle(cpf)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left
                      transition-colors hover:bg-gray-50
                      ${checked ? "text-blue-700 font-medium" : "text-gray-700"}
                    `}
                  >
                    <span
                      className={`
                        flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors
                        ${checked
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300 bg-white"
                        }
                      `}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </span>
                    {cpf}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
