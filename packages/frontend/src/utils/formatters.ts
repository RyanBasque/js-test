const ptBrDateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

export function formatDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", ptBrDateOptions);
  }
  return new Date(dateStr).toLocaleDateString("pt-BR", ptBrDateOptions);
}

/** Formata data ISO (yyyy-mm-dd) para input pt-BR (dd/mm/aaaa). */
export function formatPtBrDateInput(value: string | undefined): string {
  if (!value?.trim()) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatDate(value);
  return value;
}

/** Converte dd/mm/aaaa em yyyy-mm-dd. Vazio => undefined. */
export function parsePtBrDate(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;

  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const [y, m, d] = iso.split("-").map(Number);
  const parsed = new Date(y, m - 1, d);
  if (
    parsed.getFullYear() !== y ||
    parsed.getMonth() !== m - 1 ||
    parsed.getDate() !== d
  ) {
    return undefined;
  }
  return iso;
}

/** Máscara de data pt-BR enquanto o usuário digita. */
export function maskPtBrDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Data em formato ISO para query string da API (yyyy-mm-dd). */
export function toApiDateString(value: string): string {
  return parsePtBrDate(value) ?? "";
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export function formatPoints(value: number): string {
  return `${new Intl.NumberFormat("pt-BR").format(Number(value))} pts`;
}

/** Converte texto decimal pt-BR (ex.: "1.234,56") em número. Vazio => undefined. */
export function parsePtBrDecimal(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

/** Formata número para exibição em input pt-BR (ex.: 1234.5 => "1.234,50"). */
export function formatPtBrDecimalInput(
  value: number | string | undefined
): string {
  if (value === undefined || value === null || value === "") return "";
  const num =
    typeof value === "number" ? value : parsePtBrDecimal(String(value));
  if (num === undefined || !Number.isFinite(num)) return String(value);
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Máscara de moeda pt-BR enquanto o usuário digita (apenas dígitos). */
export function maskPtBrDecimalInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return formatPtBrDecimalInput(parseInt(digits, 10) / 100);
}

/** Valor numérico para query string da API (ex.: "1234.56"). */
export function toApiDecimalString(value: string): string {
  const n = parsePtBrDecimal(value);
  return n !== undefined ? String(n) : "";
}

export function truncateText(text: string, max = 50): string {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export function buildQueryString(
  params: Record<string, string | undefined>
): string {
  const pairs = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== ""
  );
  if (pairs.length === 0) return "";
  return (
    "?" +
    pairs
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`)
      .join("&")
  );
}
