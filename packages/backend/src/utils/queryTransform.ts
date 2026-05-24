/** Normaliza query param numérico (string, number ou array do Express). */
export function parseQueryNumber(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined || value === null || value === "") return undefined;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : undefined;
}
