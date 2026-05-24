import { useEffect, useRef, useState } from "react";
import { useFormikContext } from "formik";
import {
  formatPtBrDateInput,
  maskPtBrDateInput,
  parsePtBrDate,
} from "../../utils/formatters";

type DateRangeValues = { dateFrom?: string; dateTo?: string };

interface Props {
  className?: string;
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export default function PtBrDateRangeField({ className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fromPickerRef = useRef<HTMLInputElement>(null);
  const toPickerRef = useRef<HTMLInputElement>(null);
  const { values, setFieldValue, touched, errors } =
    useFormikContext<DateRangeValues>();

  const fromDisplay = values.dateFrom ?? "";
  const toDisplay = values.dateTo ?? "";
  const fromIso = parsePtBrDate(fromDisplay) ?? "";
  const toIso = parsePtBrDate(toDisplay) ?? "";
  const hasRange = fromDisplay.trim().length > 0 || toDisplay.trim().length > 0;

  const fieldErrors =
    ((touched as Record<string, boolean>).dateFrom &&
      (errors as Record<string, string>).dateFrom) ||
    ((touched as Record<string, boolean>).dateTo &&
      (errors as Record<string, string>).dateTo);

  // Build display label for the trigger
  let triggerLabel = "Selecionar período";
  if (fromDisplay && toDisplay) {
    triggerLabel = `${fromDisplay} — ${toDisplay}`;
  } else if (fromDisplay) {
    triggerLabel = `A partir de ${fromDisplay}`;
  } else if (toDisplay) {
    triggerLabel = `Até ${toDisplay}`;
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const syncPicker = (
    field: "dateFrom" | "dateTo",
    pickerRef: React.RefObject<HTMLInputElement | null>,
    iso: string
  ) => {
    if (pickerRef.current) pickerRef.current.value = iso;
    setFieldValue(field, iso ? formatPtBrDateInput(iso) : "");
  };

  const openNativePicker = (pickerRef: React.RefObject<HTMLInputElement | null>, isoVal: string) => {
    const picker = pickerRef.current;
    if (!picker) return;
    picker.value = isoVal;
    if (typeof picker.showPicker === "function") {
      picker.showPicker();
    } else {
      picker.click();
    }
  };

  const clear = () => {
    setFieldValue("dateFrom", "");
    setFieldValue("dateTo", "");
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1">Período</label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between gap-2
          border rounded-lg px-3 py-1.5 text-sm text-left
          transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${hasRange
            ? "border-blue-400 bg-blue-50 text-blue-700"
            : "border-gray-300 bg-white text-gray-500"
          }
        `}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon />
          <span className="truncate">{triggerLabel}</span>
        </div>
        {hasRange && (
          <span
            onClick={(e) => { e.stopPropagation(); clear(); }}
            className="shrink-0 text-blue-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </span>
        )}
      </button>

      {fieldErrors && (
        <span className="text-xs text-red-500 mt-0.5 block">{fieldErrors}</span>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-3 animate-fade-in">
          {/* De */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">De</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                autoComplete="off"
                className={`${className} pr-9`}
                value={fromDisplay}
                onChange={(e) => setFieldValue("dateFrom", maskPtBrDateInput(e.target.value))}
                onBlur={() => {
                  const parsed = parsePtBrDate(fromDisplay);
                  if (parsed) setFieldValue("dateFrom", formatPtBrDateInput(parsed));
                }}
                autoFocus
              />
              <input
                ref={fromPickerRef}
                type="date"
                tabIndex={-1}
                aria-hidden
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                value={fromIso}
                onChange={(e) => syncPicker("dateFrom", fromPickerRef, e.target.value)}
              />
              <button
                type="button"
                onClick={() => openNativePicker(fromPickerRef, fromIso)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-blue-600"
              >
                <CalendarIcon />
              </button>
            </div>
          </div>

          {/* Até */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Até</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                autoComplete="off"
                className={`${className} pr-9`}
                value={toDisplay}
                onChange={(e) => setFieldValue("dateTo", maskPtBrDateInput(e.target.value))}
                onBlur={() => {
                  const parsed = parsePtBrDate(toDisplay);
                  if (parsed) setFieldValue("dateTo", formatPtBrDateInput(parsed));
                }}
              />
              <input
                ref={toPickerRef}
                type="date"
                tabIndex={-1}
                aria-hidden
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                value={toIso}
                onChange={(e) => syncPicker("dateTo", toPickerRef, e.target.value)}
              />
              <button
                type="button"
                onClick={() => openNativePicker(toPickerRef, toIso)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-blue-600"
              >
                <CalendarIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
