import { useRef } from "react";
import { useFormikContext } from "formik";
import {
  formatPtBrDateInput,
  maskPtBrDateInput,
  parsePtBrDate,
} from "../../utils/formatters";

type DateFilterValues = { date?: string };

interface PtBrDateFieldProps {
  label?: string;
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

function ClearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function PtBrDateField({
  label = "Data",
  className = "",
}: PtBrDateFieldProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const { values, setFieldValue, touched, errors } =
    useFormikContext<DateFilterValues>();

  const displayValue = values.date ?? "";
  const isoValue = parsePtBrDate(displayValue) ?? "";
  const hasDate = displayValue.trim().length > 0;

  const syncFromPicker = (iso: string) => {
    if (pickerRef.current) pickerRef.current.value = iso;
    setFieldValue("date", iso ? formatPtBrDateInput(iso) : "");
  };

  const clearDate = () => {
    syncFromPicker("");
  };

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    picker.value = isoValue;
    if (typeof picker.showPicker === "function") {
      picker.showPicker();
    } else {
      picker.click();
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          name="date"
          type="text"
          inputMode="numeric"
          lang="pt-BR"
          placeholder="dd/mm/aaaa"
          autoComplete="off"
          className={`${className} ${hasDate ? "pr-14" : "pr-9"}`}
          value={displayValue}
          onChange={(e) =>
            setFieldValue("date", maskPtBrDateInput(e.target.value))
          }
          onBlur={() => {
            const parsed = parsePtBrDate(displayValue);
            if (parsed) {
              setFieldValue("date", formatPtBrDateInput(parsed));
            }
          }}
        />
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          value={isoValue}
          onChange={(e) => syncFromPicker(e.target.value)}
          onInput={(e) => syncFromPicker(e.currentTarget.value)}
        />
        {hasDate && (
          <button
            type="button"
            onClick={clearDate}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Limpar data"
          >
            <ClearIcon />
          </button>
        )}
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600"
          aria-label="Abrir calendário"
        >
          <CalendarIcon />
        </button>
      </div>
      {touched.date && errors.date && (
        <span className="text-xs text-red-500 mt-0.5 block">{errors.date}</span>
      )}
    </div>
  );
}
