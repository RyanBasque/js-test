export function resolvePage(
  requestedPage: number,
  total: number,
  limit: number
): { page: number; offset: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  return {
    page,
    offset: (page - 1) * limit,
    totalPages,
  };
}
